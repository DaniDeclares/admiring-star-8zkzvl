"""Delivered-margin check for merchandise. Every input must come from a verified Printify quote and the real payment-processor terms;
nothing here is a default. Margin = (price - production - shipping - processing - other) / price, compared with the 50% release floor
(src/lib/operations/governedCommercialGate2026.mjs ECONOMIC_MARGIN_FLOOR_PERCENT). Usage: delivered_margin.py <production> <shipping> [--fee-pct 2.9] [--fee-fixed 0.30] [--other 0] [--price P]"""
import argparse, math
FLOOR = 0.50

def margin(price, production, shipping, fee_pct, fee_fixed, other=0.0):
    if price <= 0: raise ValueError('price must be positive')
    cost = production + shipping + other + price * fee_pct / 100.0 + fee_fixed
    return (price - cost) / price, price - cost

def min_price(production, shipping, fee_pct, fee_fixed, other=0.0, floor=FLOOR):
    """Smallest price (to the cent) that meets the floor; processing fees scale with price so solve algebraically."""
    denom = 1.0 - fee_pct / 100.0 - floor
    if denom <= 0: raise ValueError('fee percentage and floor leave no room for a price')
    return math.ceil((production + shipping + other + fee_fixed) / denom * 100) / 100.0

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('production', type=float); ap.add_argument('shipping', type=float)
    ap.add_argument('--fee-pct', type=float, required=True); ap.add_argument('--fee-fixed', type=float, required=True)
    ap.add_argument('--other', type=float, default=0.0); ap.add_argument('--price', type=float)
    a = ap.parse_args(); mp = min_price(a.production, a.shipping, a.fee_pct, a.fee_fixed, a.other)
    print(f'minimum price for the {FLOOR:.0%} floor: ${mp:.2f}')
    if a.price is not None:
        m, c = margin(a.price, a.production, a.shipping, a.fee_pct, a.fee_fixed, a.other)
        print(f'at ${a.price:.2f}: contribution ${c:.2f}, margin {m:.1%}, {"PASSES" if m >= FLOOR else "FAILS"} the floor')
