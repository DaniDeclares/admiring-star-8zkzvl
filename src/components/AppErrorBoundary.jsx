import React from "react";

const SUPPORT_EMAIL = "operations@danideclares.com";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled application error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ padding: "2rem 1rem", maxWidth: "42rem", margin: "0 auto" }}>
          <h1>Something went wrong</h1>
          <p>
            We couldn't load this page. Please refresh and try again.
          </p>
          <p>
            If the issue continues, contact us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> so we can help.
          </p>
        </main>
      );
    }

    return this.props.children;
  }
}
