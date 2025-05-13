// src/BookingPage.jsx
import React from "react";
import Footer from "./Footer";

export default function BookingPage() {
  return (
    <>
      <div className="page">
        <h1>Book a Session</h1>
        <iframe
          src="https://tidycal.com/danideclaresns"
          width="100%"
          height="600"
          frameBorder="0"
          title="TidyCal Booking"
        />
      </div>
      <Footer />
    </>
  );
}
