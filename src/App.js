import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FestivalBanner from "./components/FestivalBanner.jsx";

export default function App() {
  return (
    <Router>
      <FestivalBanner />
      <Routes>
        <Route path="/" element={<div>Hello from App</div>} />
      </Routes>
    </Router>
  );
}
