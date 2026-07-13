import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "./context/CartContext.jsx";
import "./index.css";
import "./styles/responsive.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CartProvider>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </CartProvider>
  </React.StrictMode>
);
