import type { CSSProperties } from 'react';

export function richTextHasBlockMarkup(html: string): boolean {
  return /<(?:p|ol|ul|h[1-6]|div)\b/i.test(html);
}

type Props = {
  html: string;
  className?: string;
  style?: CSSProperties;
};

/** Renders stored rich text HTML in theme preview. */
export function ThemeRichTextContent({ html, className = '', style }: Props) {
  const trimmed = html.trim();
  if (!trimmed) return null;

  if (!richTextHasBlockMarkup(trimmed) && !/<[a-z]/i.test(trimmed)) {
    return (
      <span className={className} style={style}>
        {trimmed}
      </span>
    );
  }

  const Tag = richTextHasBlockMarkup(trimmed) ? 'div' : 'span';
  return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: trimmed }} />;
}
