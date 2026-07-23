/** Compat shim — Vite may still resolve the old `.ts` graph entry after the rename. */
export {
  clearCodiicLoggedInToastSession,
  hasShownCodiicLoggedInToast,
  showCodiicLoggedInToast,
  type CodiicLoggedInToastUser,
} from './showCodiicLoggedInToast';
