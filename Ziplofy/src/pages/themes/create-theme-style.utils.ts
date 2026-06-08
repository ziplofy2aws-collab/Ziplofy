/** CSS helpers for theme creator live preview. */
import type { CSSProperties } from 'react';

export type TextStyleSettings = {
  color: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
};

export type SectionAppearance = {
  backgroundColor: string;
  text: TextStyleSettings;
};

export const DEFAULT_TEXT_STYLE: TextStyleSettings = {
  color: '#111827',
  fontSize: 16,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  textTransform: 'none',
};

export function defaultSectionAppearance(overrides?: Partial<SectionAppearance>): SectionAppearance {
  return {
    backgroundColor: '#ffffff',
    text: { ...DEFAULT_TEXT_STYLE, ...(overrides?.text ?? {}) },
    ...overrides,
  };
}

export function textStyleToCss(style: TextStyleSettings): CSSProperties {
  return {
    color: style.color,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight === 'bold' ? 700 : 400,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    textTransform: style.textTransform,
  };
}

export function sectionContainerStyle(appearance: SectionAppearance): CSSProperties {
  return {
    backgroundColor: appearance.backgroundColor,
    ...textStyleToCss(appearance.text),
  };
}
