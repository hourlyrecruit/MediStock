import { Component, type ReactNode } from 'react';

interface FallbackBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: () => void;
}

interface FallbackBoundaryState {
  failed: boolean;
}

export class FallbackBoundary extends Component<FallbackBoundaryProps, FallbackBoundaryState> {
  state: FallbackBoundaryState = { failed: false };

  static getDerivedStateFromError(): FallbackBoundaryState {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
