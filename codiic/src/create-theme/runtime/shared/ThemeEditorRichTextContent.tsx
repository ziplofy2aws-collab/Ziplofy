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
.theme-editor-rich-text-content h1 {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.15;
  margin: 0.25em 0;
}
.theme-editor-rich-text-content h2 {
  font-size: 1.375rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0.25em 0;
}
.theme-editor-rich-text-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.25;
  margin: 0.25em 0;
}
.theme-editor-rich-text-content h4 {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0.25em 0;
}
.theme-editor-rich-text-content h5 {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.35;
  margin: 0.25em 0;
  color: #6b7280;
}
.theme-editor-rich-text-content h6 {
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0.25em 0;
  color: #6b7280;
}
/* Descendants only — root keeps inline typography from block settings. */
.theme-editor-rich-text-content--inherit-typography :where(p, h1, h2, h3, h4, h5, h6, span, li, a, strong, b, em, i) {
  font-size: inherit !important;
  font-family: inherit !important;
  font-weight: inherit !important;
  font-style: inherit !important;
  line-height: inherit !important;
  letter-spacing: inherit !important;
  text-transform: inherit !important;
  color: inherit !important;
}
`;

function ensureRichTextStylesInDocument(doc: Document): void {
  let el = doc.getElementById(RICH_TEXT_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = doc.createElement('style');
    el.id = RICH_TEXT_STYLE_ID;
    doc.head.appendChild(el);
  }
  if (el.textContent !== RICH_TEXT_INLINE_CSS) {
    el.textContent = RICH_TEXT_INLINE_CSS;
  }
}

type Props = {
  html: string;
  className?: string;
  style?: CSSProperties;
  /** When true, nested rich-text tags inherit typography from the parent block styles. */
  inheritTypography?: boolean;
};

/** Renders theme rich text (HTML or plain) in preview. */
export function ThemeEditorRichTextContent({
  html,
  className = '',
  style,
  inheritTypography = false,
}: Props) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      ensureRichTextStylesInDocument(document);
    }
  }, []);

  const trimmed = html.trim();
  if (!trimmed) return null;

  const classes = [
    'theme-editor-rich-text-content',
    inheritTypography ? 'theme-editor-rich-text-content--inherit-typography' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!richTextHasBlockMarkup(trimmed) && !/<[a-z]/i.test(trimmed)) {
    return (
      <span className={classes} style={style}>
        {trimmed}
      </span>
    );
  }

  const safeHtml = prepareRichTextHtmlForPreview(trimmed);
  const Tag = richTextHasBlockMarkup(trimmed) ? 'div' : 'span';

  return (
    <Tag
      className={classes}
      style={style}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
