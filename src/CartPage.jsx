import React from "react";
import { useCart } from "./context/CartContext";
import { Link } from "react-router-dom";
import "./CartPage.css";

export default function CartPage() {
  const { cart, removeItem } = useCart();
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (cart.length === 0) {
    return (
      <div className="page cart-page">
        <h1>Your Cart is Empty</h1>
        <Link to="/merch" className="btn btn--primary">
          Shop Merch
        </Link>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <h1>Your Cart</h1>
      <ul className="cart-list">
        {cart.map((item) => (
          <li key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} />
            <div>
              <h2>{item.name}</h2>
              <p>
                ${item.price.toFixed(2)} × {item.qty}
              </p>
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <h2>Total: ${total.toFixed(2)}</h2>
        {/* Replace this with your Stripe or PayPal checkout link */}
        <Link to="/checkout" className="btn btn--primary">
          Checkout
        </Link>
      </div>
    </div>
  );
}
