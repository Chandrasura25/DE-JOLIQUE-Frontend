import { Component } from 'react';
import { ErrorState } from './ui/Feedback';

/** Keeps one broken component from blanking the whole store. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UI error:', error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    // Navigating away clears the error.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container-page py-16">
          <ErrorState
            title="Something went wrong on this page"
            message="Please try again. If the problem continues, refresh the page."
            onRetry={() => this.setState({ error: null })}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
