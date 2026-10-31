/** Resolve a user-facing message from product API / axios / thrown errors. */
export function getProductApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    response?: {
      data?: {
        message?: string;
        error?: string;
        details?: { message?: string };
        data?: { message?: string };
        errors?: unknown[];
      };
    };
    message?: string;
  };

  const apiMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.response?.data?.details?.message ||
    err?.response?.data?.data?.message;

  if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage.trim();

  const errors = err?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const firstError = errors[0];
    if (typeof firstError === 'string' && firstError.trim()) return firstError.trim();
    if (typeof (firstError as { message?: string })?.message === 'string') {
      const msg = (firstError as { message: string }).message.trim();
      if (msg) return msg;
    }
  }

  if (typeof err?.message === 'string' && err.message.trim()) {
    const msg = err.message.trim();
    if (!/^request failed with status code \d+$/i.test(msg)) return msg;
  }

  return fallback;
}
