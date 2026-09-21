// Normalised error produced by baseApi for every failed request.
export interface ApiError {
  status: number | 'NETWORK' | 'TIMEOUT' | 'PARSING' | 'UNKNOWN';
  // Server-provided message (already human readable); empty for transport-level failures.
  message: string;
}

export const isApiError = (e: unknown): e is ApiError =>
  typeof e === 'object' && e !== null && 'status' in e && 'message' in e;

export const isUnauthorized = (e: unknown): boolean => isApiError(e) && e.status === 401;
