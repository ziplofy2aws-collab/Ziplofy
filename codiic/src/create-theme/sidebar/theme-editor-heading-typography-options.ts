/** Shared heading typography select options — leaf module (no sidebar/insert-section imports). */

export const HEADING_FONT_OPTIONS = [
  { value: 'body', label: 'Body' },
  { value: 'subheading', label: 'Subheading' },
  { value: 'heading', label: 'Heading' },
  { value: 'accent', label: 'Accent' },
] as const;

export const HEADING_FONT_SIZE_OPTIONS = [
  '10px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '32px',
  '36px',
  '40px',
  '48px',
  '56px',
  '64px',
  '72px',
].map((value) => ({ value, label: value }));

const TIGHT_NORMAL_LOOSE = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'loose', label: 'Loose' },
] as const;

export const HEADING_LINE_HEIGHT_OPTIONS = [...TIGHT_NORMAL_LOOSE];
export const HEADING_LETTER_SPACING_OPTIONS = [...TIGHT_NORMAL_LOOSE];

export const HEADING_TEXT_CASE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'uppercase', label: 'Uppercase' },
] as const;

export const HEADING_WRAP_OPTIONS = [
  { value: 'pretty', label: 'Pretty' },
  { value: 'balance', label: 'Balance' },
  { value: 'nowrap', label: 'No wrap' },
] as const;
