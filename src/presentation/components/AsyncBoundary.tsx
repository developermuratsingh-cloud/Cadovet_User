import type { ReactNode } from 'react';

import { EmptyState, ErrorState, LoadingView } from './StateViews';

interface Props<T> {
  data?: T;
  isLoading: boolean;
  error?: unknown;
  refetch: () => unknown;
  emptyMessage?: string;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => ReactNode;
}

// Standard loading / error / empty handling for RTK Query results so screens stay declarative.
export function AsyncBoundary<T>({ data, isLoading, error, refetch, emptyMessage, isEmpty, children }: Props<T>) {
  if (data !== undefined) {
    if (emptyMessage && isEmpty?.(data)) return <EmptyState message={emptyMessage} />;
    return <>{children(data)}</>;
  }
  if (isLoading) return <LoadingView />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  return null;
}
