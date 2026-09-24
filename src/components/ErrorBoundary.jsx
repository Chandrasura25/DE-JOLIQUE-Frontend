import { Component } from 'react';
import { ErrorState } from './ui/Feedback';
import { isChunkLoadError } from '../lib/chunkReload';

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
    if (this.state.error && isChunkLoadError(this.state.error)) {
      // Reached only if the automatic reload didn't happen (e.g. it just ran).
      return (
        <div className="container-page py-16">
          <ErrorState
            title="A new version of the store is available"
            message="Reload the page to continue."
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }
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
