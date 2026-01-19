import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return function WithErrorBoundary(props: P) {
    return React.createElement(
      ErrorBoundary,
      {
        fallback,
        children: React.createElement(WrappedComponent, { ...props }),
      }
    );
  };
};
