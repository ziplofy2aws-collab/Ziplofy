import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStorefrontSearch, useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import {
  resolveThemeTypographyStyle,
  themeFontsFromConfig,
} from '../../runtime/shared/themeTypographyRuntime';
import { useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import {
  combineResponsiveCss,
  mobileMedia,
  sectionScopeClass,
} from '../../runtime/shared/responsive';
import type { SectionRuntimeProps } from '../../runtime/types';
import { richTextHasBlockMarkup } from '../../../utils/theme-editor-rich-text.util';

const SEARCH_DEBOUNCE_MS = 300;

function secBase(templateId: string, sectionId: string): string {
  return `templates.${templateId}.sections.${sectionId}`;
}

function SearchIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="8.5" cy="8.5" r="5.5" stroke={color} strokeWidth="1.6" />
      <path d="M12.5 12.5L16.5 16.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function writeSearchQueryParam(
  searchParams: URLSearchParams,
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  next: string
) {
  const trimmed = next.trim();
  const current = (searchParams.get('q') ?? '').trim();
  if (trimmed === current) return;
  const params = new URLSearchParams(searchParams);
  if (trimmed) params.set('q', trimmed);
  else params.delete('q');
  setSearchParams(params, { replace: true });
}

export function Search({
  sectionId = 'search',
  templateId = 'search',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { setSearchValue } = useStorefrontSearch();
  const { maxWidth, padX, padXMobile } = useThemeLayout();
  const { text, background, muted, border, fontBody, fontHeading } = useThemeColors();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') ?? '';
  const [draft, setDraft] = useState(queryFromUrl);
  const typingRef = useRef(false);
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  useEffect(() => {
    if (typingRef.current) return;
    setDraft(queryFromUrl);
  }, [queryFromUrl]);

  // Debounced live search: sync URL `q` while typing so SearchResults hits the API.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      typingRef.current = false;
      writeSearchQueryParam(searchParamsRef.current, setSearchParams, draft);
      setSearchValue(draft.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draft, setSearchParams, setSearchValue]);

  const base = secBase(templateId, sectionId);
  const scopeClass = sectionScopeClass('codiic-search', sectionId);
  const editorNodeId = `template:${templateId}:${sectionId}`;

  const headingEnabled = cfgBool(config, `${base}.blocks.heading.enabled`, true);
  const inputEnabled = cfgBool(config, `${base}.blocks.search_input.enabled`, true);
  const headingText = cfgString(config, `${base}.blocks.heading.settings.text`, 'Search');
  const headingPreset = cfgString(
    config,
    `${base}.blocks.heading.settings.typographyPreset`,
    'heading-1'
  );
  const placeholder = cfgString(
    config,
    `${base}.blocks.search_input.settings.placeholder`,
    'Search'
  );
  const paddingTop = cfgNumber(config, `${base}.settings.paddingTop`, 48);
  const paddingBottom = cfgNumber(config, `${base}.settings.paddingBottom`, 24);
  const sectionWidth = cfgString(config, `${base}.settings.sectionWidth`, 'page');

  const fonts = themeFontsFromConfig(config);
  const headingTypo = resolveThemeTypographyStyle(config, headingPreset, fonts);

  const shellStyle = useMemo<CSSProperties>(
    () => ({
      background,
      color: text,
      fontFamily: fontBody,
      paddingTop,
      paddingBottom,
      paddingLeft: padX,
      paddingRight: padX,
      boxSizing: 'border-box',
      width: '100%',
    }),
    [background, text, fontBody, paddingTop, paddingBottom, padX]
  );

  const innerStyle = useMemo<CSSProperties>(
    () => ({
      maxWidth: sectionWidth === 'full' ? '100%' : maxWidth,
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }),
    [maxWidth, sectionWidth]
  );

  const responsiveCss = combineResponsiveCss(
    mobileMedia(`
      .${scopeClass} {
        padding-left: ${padXMobile}px !important;
        padding-right: ${padXMobile}px !important;
      }
    `)
  );

  const submitSearch = (event?: FormEvent) => {
    event?.preventDefault();
    typingRef.current = false;
    const next = draft.trim();
    setSearchValue(next);
    writeSearchQueryParam(searchParamsRef.current, setSearchParams, next);
  };

  return (
    <EditorSection
      sectionId={sectionId}
      label="Search"
      editorNodeId={editorNodeId}
      className={scopeClass}
      style={shellStyle}
    >
      {responsiveCss ? <style>{responsiveCss}</style> : null}
      <div style={innerStyle}>
        {headingEnabled ? (
          <EditorField
            fieldPath={`${base}.blocks.heading.settings.text`}
            label="Heading"
            as={richTextHasBlockMarkup(headingText) ? 'div' : 'h1'}
            style={{
              margin: 0,
              fontFamily: headingTypo.fontFamily || fontHeading,
              fontSize: headingTypo.fontSize ? `${headingTypo.fontSize}px` : 42,
              fontWeight: headingTypo.fontWeight ?? 700,
              lineHeight: headingTypo.lineHeight ?? 1.15,
              letterSpacing: headingTypo.letterSpacing,
              color: text,
            }}
          >
            <ThemeEditorRichTextContent html={headingText} />
          </EditorField>
        ) : null}

        {inputEnabled ? (
          <EditorBlock
            nodeId={`${editorNodeId}:block:search_input`}
            label="Search input"
          >
            <form onSubmit={submitSearch} style={{ width: '100%', maxWidth: 720 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  boxSizing: 'border-box',
                  border: `1px solid ${border || '#d1d5db'}`,
                  borderRadius: 4,
                  background: '#fff',
                  padding: '12px 14px',
                }}
              >
                <SearchIcon color={muted || '#9ca3af'} />
                <input
                  type="search"
                  value={draft}
                  onChange={(e) => {
                    typingRef.current = true;
                    setDraft(e.target.value);
                  }}
                  placeholder={placeholder}
                  aria-label={placeholder || 'Search'}
                  autoComplete="off"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: 0,
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 15,
                    color: text,
                    fontFamily: fontBody,
                  }}
                />
              </label>
            </form>
          </EditorBlock>
        ) : null}
      </div>
    </EditorSection>
  );
}
