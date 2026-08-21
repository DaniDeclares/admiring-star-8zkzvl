#!/usr/bin/env python3
"""Reconcile exported Stripe Payment Links against the master commercial registry.

Usage:
  python scripts/reconcile-stripe-links.py payment_links.csv

If STRIPE_SECRET_KEY is present, the script also retrieves each mapped Payment
Link's current line-item price from Stripe. Without the key, it still performs
identity reconciliation and reports AMOUNT_UNVERIFIED rather than guessing.
"""

import csv
import os
import re
import sys
import urllib.parse
import urllib.request
import base64

REGISTRY_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'config', 'commercialRegistry.js')

# Only exact semantic mappings belong here. Ambiguous legacy links stay UNMAPPED.
STRIPE_NAME_TO_SERVICE = {
    'Power of Attorney (POA) Notarization': 'B2C-NOTARY-POA',
    'Apostille Facilitation': 'B2C-NOTARY-APOSTILLE',
    'Loan Signing Appointment': 'B2C-NOTARY-LOAN',
    'Property Reset Deposit': 'B2B-TURN-RESET',
    'I-9 Employment Verification': 'B2B-ADM-I9',
}


def load_registry():
    text = open(REGISTRY_PATH, encoding='utf-8').read()
    pattern = re.compile(
        r"active\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*([0-9]+(?:\.[0-9]+)?)"
    )
    return {
        match.group(1): {
            'name': match.group(2),
            'channel': match.group(3),
            'model': match.group(4),
            'price': float(match.group(5)),
        }
        for match in pattern.finditer(text)
    }


def stripe_link_amount(payment_link_id):
    secret = os.getenv('STRIPE_SECRET_KEY')
    if not secret:
        return None

    query = urllib.parse.urlencode({
        'expand[]': 'line_items.data.price',
    })
    url = f'https://api.stripe.com/v1/payment_links/{payment_link_id}?{query}'
    request = urllib.request.Request(url)
    token = base64.b64encode(f'{secret}:'.encode()).decode()
    request.add_header('Authorization', f'Basic {token}')

    with urllib.request.urlopen(request, timeout=20) as response:
        data = response.read().decode('utf-8')

    import json
    payload = json.loads(data)
    items = payload.get('line_items', {}).get('data', [])
    if len(items) != 1:
        return None
    unit_amount = items[0].get('price', {}).get('unit_amount')
    quantity = items[0].get('quantity', 1)
    if unit_amount is None or quantity != 1:
        return None
    return unit_amount / 100


def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else 'payment_links.csv'
    registry = load_registry()

    with open(csv_path, newline='', encoding='utf-8-sig') as handle:
        rows = list(csv.DictReader(handle))

    print('status,payment_link_id,name,service_id,registry_price,stripe_price')

    for row in rows:
        link_id = row.get('id', '')
        name = row.get('Name', '').strip()
        service_id = STRIPE_NAME_TO_SERVICE.get(name)

        if not service_id:
            print(f'UNMAPPED,{link_id},{name},,,')
            continue

        record = registry.get(service_id)
        if not record:
            print(f'REGISTRY_MISSING,{link_id},{name},{service_id},,')
            continue

        stripe_price = stripe_link_amount(link_id)
        if stripe_price is None:
            print(f'AMOUNT_UNVERIFIED,{link_id},{name},{service_id},{record["price"]},')
            continue

        status = 'MATCH' if round(stripe_price, 2) == round(record['price'], 2) else 'AMOUNT_MISMATCH'
        print(f'{status},{link_id},{name},{service_id},{record["price"]},{stripe_price}')


if __name__ == '__main__':
    main()
