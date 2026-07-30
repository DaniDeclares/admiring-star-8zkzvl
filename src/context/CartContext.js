// filename: src/context/CartContext.js
import React, { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.find((i) => i.id === action.item.id);
      if (existing) {
        return state.map((i) =>
          i.id === action.item.id ? { ...i, qty: (i.qty || 0) + 1 } : i
        );
      }
      return [...state, { ...action.item, qty: 1 }];
    }
    case "REMOVE_ITEM":
      return state.filter((i) => i.id !== action.id);
    case "CLEAR_CART":
      return [];
    case "SET_CART":
      return action.cart;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Backwards-compatible public API (legacy names)
  const addToCart = (item) => dispatch({ type: "ADD_ITEM", item });
  const removeFromCart = (id) => dispatch({ type: "REMOVE_ITEM", id });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  // Keep the newer names as aliases to avoid breaking callers that were updated
  const addItem = addToCart;
  const removeItem = removeFromCart;

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, addItem, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
