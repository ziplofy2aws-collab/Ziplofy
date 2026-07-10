import type { CSSProperties } from 'react';
import { badgeKindStyles, useThemeBadges } from './themeBadgeRuntime';

type Props = {
  kind: 'sale' | 'sold-out';
  label?: string;
  className?: string;
  style?: CSSProperties;
};

export function ThemeProductCardBadge({ kind, label, className, style }: Props) {
  const badges = useThemeBadges();
  const text = label ?? (kind === 'sale' ? 'Sale' : 'Sold out');

  return (
    <span
      className={`codiic-product-card-badge codiic-product-card-badge--${kind}${className ? ` ${className}` : ''}`}
      data-codiic-badge-kind={kind}
      style={{ ...badgeKindStyles(badges, kind), ...style }}
    >
      {text}
    </span>
  );
}
