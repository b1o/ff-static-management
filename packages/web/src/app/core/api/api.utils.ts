/**
 * Type-safe API utilities for Eden treaty client.
 * Provides standardized error handling that can be reused across all services.
 */

/** Discriminated union for API call results */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Eden treaty response shape */
type EdenResponse<T> = {
  data: T | null;
  error: { value: unknown; status: number } | null;
  status: number;
};

/**
 * Extracts a user-friendly error message from various error shapes.
 */
function extractErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  // Handle Eden error shape { value: { error: string } }
  if (typeof error === 'object' && 'value' in error) {
    const value = (error as { value: unknown }).value;
    if (typeof value === 'object' && value && 'error' in value) {
      return String((value as { error: unknown }).error);
    }
    if (typeof value === 'string') return value;
  }

  // Handle plain error object { error: string }
  if (typeof error === 'object' && 'error' in error) {
    return String((error as { error: unknown }).error);
  }

  // Handle Error instances
  if (error instanceof Error) return error.message;

  // Handle string errors
  if (typeof error === 'string') return error;

  return 'An unknown error occurred';
}

/**
 * Wraps an Eden API call with standardized error handling.
 * Use this in services to get consistent error handling across the app.
 *
 * @example
 * ```ts
 * const result = await apiCall(() => this.api.statics['my-statics'].get());
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export async function apiCall<T>(
  fn: () => Promise<EdenResponse<T>>
): Promise<ApiResult<T>> {
  try {
    const response = await fn();

    if (response.error) {
      return {
        success: false,
        error: extractErrorMessage(response.error),
      };
    }

    if (response.data === null || response.data === undefined) {
      return {
        success: false,
        error: 'No data returned from server',
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (err) {
    // Network errors, timeouts, etc.
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error occurred',
    };
  }
}

/**
 * Helper to check if a result is successful (for type narrowing).
 */
export function isSuccess<T>(result: ApiResult<T>): result is { success: true; data: T } {
  return result.success;
}

/**
 * Helper to check if a result is an error (for type narrowing).
 */
export function isError<T>(result: ApiResult<T>): result is { success: false; error: string } {
  return !result.success;
}
