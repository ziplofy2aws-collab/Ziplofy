/** Shared text/typography setting keys — leaf module (no sidebar util imports). */

export const TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEYS = [
  'font',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'textCase',
  'wrap',
] as const;

export type TextBlockCustomTypographyKey =
  (typeof TEXT_BLOCK_CUSTOM_TYPOGRAPHY_KEYS)[number];

export const TEXT_BLOCK_TYPOGRAPHY_PRESET_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'body', label: 'Body' },
  { value: 'heading-1', label: 'Heading 1' },
  { value: 'heading-2', label: 'Heading 2' },
  { value: 'heading-3', label: 'Heading 3' },
  { value: 'heading-4', label: 'Heading 4' },
  { value: 'heading-5', label: 'Heading 5' },
  { value: 'heading-6', label: 'Heading 6' },
  { value: 'custom', label: 'Custom' },
] as const;
