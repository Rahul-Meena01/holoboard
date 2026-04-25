import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Whiteboard crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif",
            width: "100%",
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#15161b",
            color: "#f3f5fa",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ maxWidth: 540 }}>
            <h2 style={{ marginTop: 0 }}>Something went wrong</h2>
            <p>
              The whiteboard failed to render. Reload the page to recover. Data
              stored in local browser storage should remain available.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
