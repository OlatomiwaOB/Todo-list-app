
import React, {Component, } from "react";
import type { ReactNode } from "react";

interface ErrorBoundaryProps  {
  children: ReactNode;
};

interface ErrorBoundaryState  {
  hasError: boolean;
}
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error): { hasError: boolean } {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong</h2>
        </div>
      );
    }
    return this.props.children;
  }
}

