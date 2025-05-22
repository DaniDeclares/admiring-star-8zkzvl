import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { HelmetProvider } from "react-helmet-async";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CartProvider>
      <HelmetProvider> {/* Wrap App */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </CartProvider>
  </React.StrictMode>
);
