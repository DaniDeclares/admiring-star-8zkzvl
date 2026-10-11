import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from delivered_margin import margin, min_price
def test_min_price_meets_floor_exactly_and_not_below():
    p = min_price(10.0, 5.0, 3.0, 0.30)            # illustrative inputs only
    assert margin(p, 10.0, 5.0, 3.0, 0.30)[0] >= 0.50
    assert margin(p - 0.01, 10.0, 5.0, 3.0, 0.30)[0] < 0.50
def test_fee_scales_with_price():
    assert margin(40, 10, 5, 3.0, 0.30)[1] == 40 - 10 - 5 - 1.20 - 0.30
def test_impossible_terms_raise():
    try: min_price(10, 5, 60.0, 0.3); assert False
    except ValueError: pass
