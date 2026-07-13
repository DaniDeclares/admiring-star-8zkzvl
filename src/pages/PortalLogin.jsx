import React from "react";

const styles = {
  shell: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#4b1124", // Rich Burgundy
    color: "#f8f4e9", // Ivory
    padding: "2rem",
  },
  card: {
    width: "100%",
    maxWidth: "880px",
    border: "1px solid rgba(248, 244, 233, 0.35)",
    borderRadius: "12px",
    background: "rgba(248, 244, 233, 0.08)",
    padding: "2rem",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
  },
  heading: {
    margin: 0,
    fontSize: "1.35rem",
    lineHeight: 1.45,
    letterSpacing: "0.015em",
  },
  subtext: {
    marginTop: "0.85rem",
    opacity: 0.88,
    fontSize: "0.95rem",
  },
};

export default function PortalLogin() {
  return (
    <main style={styles.shell}>
      <section style={styles.card} aria-label="Portal login scaffold placeholder">
        <h1 style={styles.heading}>Williams Enterprise Command Center - Portal Infrastructure Framework</h1>
        <p style={styles.subtext}>Scaffold placeholder only. No active authentication or database wiring is enabled.</p>
      </section>
    </main>
  );
}
