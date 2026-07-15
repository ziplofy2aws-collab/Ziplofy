import toast from 'react-hot-toast';

const EMAIL_SIGNUP_PREVIEW_MESSAGE =
  'Newsletter signup works on your live storefront. Preview does not save emails.';

/** Shown when email signup is submitted inside the theme editor iframe. */
export function notifyEmailSignupEditorPreview(): void {
  toast(EMAIL_SIGNUP_PREVIEW_MESSAGE, { duration: 4500 });
}
