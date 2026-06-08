export const SIGNUP_PASSWORD_MIN_LENGTH = 8;
export const SIGNUP_PASSWORD_MAX_LENGTH = 128;

/** Inline hint while typing (non-empty password only). */
export function getSignupPasswordInlineIssue(password: string): string | null {
  if (!password) return null;
  if (password.length < SIGNUP_PASSWORD_MIN_LENGTH) {
    return `Must be at least ${SIGNUP_PASSWORD_MIN_LENGTH} characters`;
  }
  if (password.length > SIGNUP_PASSWORD_MAX_LENGTH) {
    return `Must be at most ${SIGNUP_PASSWORD_MAX_LENGTH} characters`;
  }
  return null;
}

/** Block submit when password is invalid (call after checking non-empty). */
export function validateSignupPasswordForSubmit(password: string): string | null {
  if (password.length < SIGNUP_PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${SIGNUP_PASSWORD_MIN_LENGTH} characters`;
  }
  if (password.length > SIGNUP_PASSWORD_MAX_LENGTH) {
    return `Password must be at most ${SIGNUP_PASSWORD_MAX_LENGTH} characters`;
  }
  return null;
}
