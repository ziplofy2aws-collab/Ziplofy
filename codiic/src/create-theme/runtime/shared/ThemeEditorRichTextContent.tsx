import { useEffect, type CSSProperties } from 'react';
import {
  prepareRichTextHtmlForPreview,
  richTextHasBlockMarkup,
} from '../../../utils/theme-editor-rich-text.util';
import './theme-editor-rich-text.css';

const RICH_TEXT_STYLE_ID = 'theme-editor-rich-text-styles';

const RICH_TEXT_INLINE_CSS = `
.theme-editor-rich-text-content ol {
  list-style-type: decimal !important;
  list-style-position: outside !important;
  padding-left: 1.5em !important;
  margin: 0.35em 0 !important;
}
.theme-editor-rich-text-content ul {
  list-style-type: disc !important;
  list-style-position: outside !important;
  padding-left: 1.5em !important;
  margin: 0.35em 0 !important;
}
.theme-editor-rich-text-content li {
  display: list-item !important;
}
.theme-editor-rich-text-content li > p {
  margin: 0 !important;
  display: inline !important;
}
.theme-editor-rich-text-content p {
  margin: 0.25em 0;
}
.theme-editor-rich-text-content a {
  text-decoration: underline;
}
`;

function ensureRichTextStylesInDocument(doc: Document): void {
  if (doc.getElementById(RICH_TEXT_STYLE_ID)) return;
  const el = doc.createElement('style');
  el.id = RICH_TEXT_STYLE_ID;
  el.textContent = RICH_TEXT_INLINE_CSS;
  doc.head.appendChild(el);
}

type Props = {
  html: string;
  className?: string;
  style?: CSSProperties;
};

/** Renders theme rich text (HTML or plain) in preview. */
export function ThemeEditorRichTextContent({ html, className = '', style }: Props) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      ensureRichTextStylesInDocument(document);
    }
  }, []);

  const trimmed = html.trim();
  if (!trimmed) return null;

  if (!richTextHasBlockMarkup(trimmed) && !/<[a-z]/i.test(trimmed)) {
    return (
      <span className={`theme-editor-rich-text-content ${className}`.trim()} style={style}>
        {trimmed}
      </span>
    );
  }

  const safeHtml = prepareRichTextHtmlForPreview(trimmed);
  const Tag = richTextHasBlockMarkup(trimmed) ? 'div' : 'span';

  return (
    <Tag
      className={`theme-editor-rich-text-content ${className}`.trim()}
      style={style}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
