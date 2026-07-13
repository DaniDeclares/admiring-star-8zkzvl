import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Unhandled application error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ padding: "2rem 1rem", maxWidth: "42rem", margin: "0 auto" }}>
          <h1>Something went wrong</h1>
          <p>
            We couldn&apos;t load this page. Please refresh and try again.
          </p>
        </main>
      );
    }

    return this.props.children;
  }
}
