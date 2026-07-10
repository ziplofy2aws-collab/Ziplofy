import { faqAccordionRowIconAssetUrl } from './faqAccordionRowIcons';

export function FaqAccordionRowIcon({
  icon,
  size,
}: {
  icon: string;
  size: number;
}) {
  const src = faqAccordionRowIconAssetUrl(icon);
  if (!src) return null;

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ objectFit: 'contain', flexShrink: 0, display: 'block' }}
    />
  );
}
