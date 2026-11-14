import { Component } from 'react';

// A failed chart download must not take transaction management or backups offline.
export default class ChartBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <p className="notice" role="alert">Charts could not load. Refresh the page to try again. Transactions, budgets, and backups remain available.</p>
      : this.props.children;
  }
}
