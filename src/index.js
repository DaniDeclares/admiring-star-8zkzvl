import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './context/CartContext.js';
import App from './App.js';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#090d16', color: '#fff', minHeight: '100vh' }}>
          <h2>System Rendering Update in Progress</h2>
          <p style={{ color: '#94a3b8' }}>Please refresh in a few moments.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1rem', marginTop: '1rem', backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
            Reload Page
          </button>
          <div style={{ marginTop: '2rem', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'left', background: '#111827', border: '1px solid #f59e0b', borderRadius: '0.5rem', padding: '1rem' }}>
            <p style={{ color: '#f59e0b', fontWeight: 'bold', marginBottom: '0.5rem' }}>Debug details (screenshot this and send it):</p>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#e2e8f0', fontSize: '0.8rem', margin: 0 }}>
              {this.state.error ? (this.state.error.stack || this.state.error.toString()) : 'No error captured'}
            </pre>
            {this.state.errorInfo && (
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <CartProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </BrowserRouter>
        </CartProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
}