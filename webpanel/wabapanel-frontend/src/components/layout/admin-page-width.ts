/**
 * Single source of truth for the centered admin content column (Shopify-style).
 * Pages must not set their own page-level max-width; they inherit this column
 * from AdminStandardLayout / SettingsLayout so every screen lines up.
 */
export const ADMIN_CONTENT_MAX_WIDTH_PX = 1000;

/** Centered content column: `mx-auto w-full max-w-[1000px]`. */
export const adminContentColumnClass = 'mx-auto w-full max-w-[1000px]';
