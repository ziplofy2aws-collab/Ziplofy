import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStorefrontAuth, useStorefrontCart } from '@render-store/sdk';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgMenuItems, cfgNumber, cfgString } from '../../runtime/shared/config';
import {
  headerBorderPx,
  headerColorScheme,
  headerHeightPadding,
  headerSearchEnabled,
  headerSectionWidth,
  headerStickyMode,
  menuBlockColorScheme,
  scopedHeaderCss,
} from './headerStyles';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors } from '../../runtime/shared/tokens';

type Props = { sectionId?: string };

const iconStroke = 1.75;

function HeaderIconSearch({ color }: { color: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6" stroke={color} strokeWidth={iconStroke} />
      <path d="M16 16l4 4" stroke={color} strokeWidth={iconStroke} strokeLinecap="round" />
    </svg>
  );
}

function HeaderIconAccount({ color }: { color: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth={iconStroke} />
      <path
        d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke={color}
        strokeWidth={iconStroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeaderIconCart({ color }: { color: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 8V6a4 4 0 118 0v2"
        stroke={color}
        strokeWidth={iconStroke}
        strokeLinecap="round"
      />
      <path
        d="M6 8h12l-1 12H7L6 8z"
        stroke={color}
        strokeWidth={iconStroke}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Header({ sectionId = 'header' }: Props) {
  const config = useThemeConfig();
  const { pathname } = useLocation();
  const themeColors = useThemeColors();
  const { fontHeading, fontBody, primary, background: themeBg } = themeColors;
  const { user, logout } = useStorefrontAuth();
  const { getAllItems } = useStorefrontCart();
  const cartCount = getAllItems().reduce((s, i) => s + i.quantity, 0);

  const base = `sections.${sectionId}`;
  const settingsBase = `${base}.settings`;
  const logoBase = `${base}.blocks.logo.settings`;
  const menuBase = `${base}.blocks.menu.settings`;

  const headerState = useMemo(() => {
    const scheme = headerColorScheme(config, settingsBase, {
      background: themeBg,
      color: themeColors.text,
      border: layout.line,
    });
    return {
      scheme,
      widthMode: headerSectionWidth(config, settingsBase),
      height: headerHeightPadding(config, settingsBase),
      borderPx: headerBorderPx(config, settingsBase),
      stickyMode: headerStickyMode(config, settingsBase),
      customCss: cfgString(config, `${settingsBase}.customCss`, ''),
      logoText: cfgString(config, `${logoBase}.text`, 'My Store'),
      tagline: cfgString(config, `${logoBase}.tagline`, ''),
      logoUrl: cfgString(config, `${settingsBase}.defaultLogoUrl`, '').trim(),
      hideLogoOnHomePage: cfgBool(config, `${logoBase}.hideLogoOnHomePage`, false),
      logoPaddingTop: Math.max(0, cfgNumber(config, `${logoBase}.paddingTop`, 0)),
      logoPaddingBottom: Math.max(0, cfgNumber(config, `${logoBase}.paddingBottom`, 0)),
      menuRow: cfgString(config, `${menuBase}.row`, ''),
      menuItems: cfgMenuItems(config, `${menuBase}.items`),
      menuScheme: menuBlockColorScheme(config, menuBase, {
        background: themeBg,
        color: themeColors.text,
        border: layout.line,
      }),
      topLevelSize: cfgString(config, `${menuBase}.topLevelSize`, '14px'),
      menuFont: cfgString(config, `${menuBase}.font`, 'body'),
      menuTextCase: cfgString(config, `${menuBase}.textCase`, 'default'),
      menuStyle: cfgString(config, `${settingsBase}.menuStyle`, 'icons'),
      searchOn: headerSearchEnabled(config, settingsBase),
      searchPlaceholder: cfgString(config, `${settingsBase}.searchPlaceholder`),
      cartLabel: cfgString(config, `${settingsBase}.cartLabel`, 'Cart'),
      showAccount: cfgString(config, `${settingsBase}.customerAccountMenu`, 'customer-account') !== 'none',
      showCountry: cfgBool(config, `${settingsBase}.countryRegionEnabled`, false),
      showFlag: cfgBool(config, `${settingsBase}.showFlag`, false),
      showLanguage: cfgBool(config, `${settingsBase}.languageSelectorEnabled`, false),
      locFont: cfgString(config, `${settingsBase}.localizationFont`, 'heading'),
      locSize: cfgString(config, `${settingsBase}.localizationSize`, '14px'),
      countryRegionLabel: cfgString(config, `${settingsBase}.countryRegionLabel`),
      languageLabel: cfgString(config, `${settingsBase}.languageLabel`),
    };
  }, [config, sectionId, settingsBase, logoBase, menuBase, themeBg, themeColors.text, themeColors]);

  const {
    scheme,
    widthMode,
    height: { paddingY, minHeight },
    borderPx,
    stickyMode,
    customCss,
    logoText,
    tagline,
    logoUrl,
    hideLogoOnHomePage,
    logoPaddingTop,
    logoPaddingBottom,
    menuRow,
    menuItems,
    menuScheme,
    topLevelSize,
    menuFont,
    menuTextCase,
    menuStyle,
    searchOn,
    searchPlaceholder,
    cartLabel,
    showAccount,
    showCountry,
    showFlag,
    showLanguage,
    locFont,
    locSize,
    countryRegionLabel,
    languageLabel,
  } = headerState;

  const { color: text, background, border } = scheme;
  const menuText = menuScheme.color;
  const iconColor = text;
  const scopedCss = scopedHeaderCss(sectionId, customCss);

  const menuLinkFontFamily =
    menuFont === 'heading' ? fontHeading : menuFont === 'subheading' ? fontBody : fontBody;
  const navLinkColor = menuText || '#4b5563';
  const menuLinkStyle: CSSProperties = {
    color: navLinkColor,
    textDecoration: 'none',
    fontSize: topLevelSize,
    fontFamily: menuLinkFontFamily,
    fontWeight: 400,
    textTransform: menuTextCase === 'uppercase' ? 'uppercase' : undefined,
    letterSpacing: menuTextCase === 'uppercase' ? '0.06em' : undefined,
    whiteSpace: 'nowrap',
  };

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (stickyMode !== 'on-scroll-up') return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [stickyMode]);

  const stickyActive =
    stickyMode === 'always' || (stickyMode === 'on-scroll-up' && scrolled);

  const isHomePage = pathname === '/' || pathname === '';
  const hideLogoOnHome = hideLogoOnHomePage && isHomePage && !stickyActive;

  const utilityStyle: CSSProperties = {
    fontSize: locSize,
    fontFamily: locFont === 'heading' ? fontHeading : fontBody,
    color: text,
    opacity: 0.85,
  };

  const logoNode: ReactNode = hideLogoOnHome ? null : (
    <EditorBlock nodeId={`layout:${sectionId}:block:logo`} label="Logo">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingTop: logoPaddingTop,
          paddingBottom: logoPaddingBottom,
        }}
      >
        {logoUrl ? (
          <Link to="/" style={{ textDecoration: 'none', display: 'flex' }}>
            <img src={logoUrl} alt={logoText} style={{ maxHeight: 36, display: 'block' }} />
          </Link>
        ) : (
          <Link to="/" style={{ textDecoration: 'none', color: text }}>
            <EditorField
              fieldPath={`${logoBase}.text`}
              label="Store name"
              as="span"
              style={{
                fontFamily: fontHeading,
                fontSize: 18,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: text || '#111827',
                display: 'inline-block',
              }}
            >
              {logoText}
            </EditorField>
          </Link>
        )}
        {tagline && !logoUrl ? (
          <EditorField
            fieldPath={`${logoBase}.tagline`}
            label="Tagline"
            as="span"
            style={{ marginLeft: 8, fontSize: 12, opacity: 0.65 }}
          >
            {tagline}
          </EditorField>
        ) : null}
      </div>
    </EditorBlock>
  );

  const menuNode: ReactNode = (
    <EditorBlock nodeId={`layout:${sectionId}:block:menu`} label="Menu">
      <nav
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 24,
          margin: 0,
          padding: 0,
        }}
        aria-label="Main"
      >
        {menuItems.map((item, index) => {
          const nestedIds = ['link_shop', 'link_collections', 'link_about', 'link_account'] as const;
          const nestedId = nestedIds[index] ?? `link_${index}`;
          const labelPath = `${menuBase}.items.${index}.label`;
          const hrefPath = `${menuBase}.items.${index}.href`;
          return (
            <EditorBlock
              key={hrefPath}
              nodeId={`layout:${sectionId}:block:menu:nested:${nestedId}`}
              label={item.label}
            >
              <EditorField fieldPath={labelPath} label="Label">
                <Link to={item.href} style={menuLinkStyle}>
                  {item.label}
                </Link>
              </EditorField>
            </EditorBlock>
          );
        })}
      </nav>
    </EditorBlock>
  );

  const useIcons = menuStyle !== 'text';

  const utilities = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: useIcons ? 20 : 12,
        flexShrink: 0,
      }}
    >
      {showCountry && countryRegionLabel ? (
        <span style={utilityStyle}>{showFlag ? '🇮🇳 ' : ''}{countryRegionLabel}</span>
      ) : null}
      {showLanguage && languageLabel ? <span style={utilityStyle}>{languageLabel}</span> : null}
      {searchOn ? (
        <Link
          to="/products"
          title={searchPlaceholder}
          style={{
            display: 'flex',
            alignItems: 'center',
            color: iconColor,
            textDecoration: 'none',
            opacity: 0.9,
          }}
          aria-label={searchPlaceholder || 'Search'}
        >
          {useIcons ? (
            <HeaderIconSearch color={iconColor} />
          ) : (
            <span style={{ fontSize: 14 }}>Search</span>
          )}
        </Link>
      ) : null}
      {showAccount ? (
        user ? (
          <button
            type="button"
            onClick={() => void logout()}
            title="Sign out"
            style={{
              display: 'flex',
              alignItems: 'center',
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: 'pointer',
              color: iconColor,
            }}
          >
            {useIcons ? (
              <HeaderIconAccount color={iconColor} />
            ) : (
              <span style={{ fontSize: 14, color: primary }}>Sign out</span>
            )}
          </button>
        ) : (
          <Link
            to="/auth/login"
            title="Account"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: iconColor,
              textDecoration: 'none',
            }}
            aria-label="Account"
          >
            {useIcons ? (
              <HeaderIconAccount color={iconColor} />
            ) : (
              <span style={{ fontSize: 14, fontWeight: 600, color: primary }}>Sign in</span>
            )}
          </Link>
        )
      ) : null}
      <Link
        to="/cart"
        title={cartLabel}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: iconColor,
          textDecoration: 'none',
          position: 'relative',
        }}
        aria-label={cartLabel}
      >
        {useIcons ? (
          <HeaderIconCart color={iconColor} />
        ) : (
          <span style={{ fontSize: 13 }}>
            {cartLabel} ({cartCount})
          </span>
        )}
        {useIcons && cartCount > 0 ? (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -6,
              minWidth: 14,
              height: 14,
              borderRadius: 7,
              background: primary,
              color: themeBg,
              fontSize: 9,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        ) : null}
      </Link>
    </div>
  );

  const brandCluster = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 40,
        flex: '0 1 auto',
        minWidth: 0,
        flexWrap: 'wrap',
      }}
    >
      {logoNode}
      {menuNode}
    </div>
  );

  const mainRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
    width: '100%',
  };

  const innerMaxWidth = widthMode === 'full' ? '100%' : layout.maxWidth;
  /** Classic storefront header: logo + nav stay on one row (legacy `row: top` treated as inline). */
  const menuOnOwnRowTop = false;
  const menuOnOwnRowBottom = menuRow === 'bottom';
  const headerDivider =
    borderPx > 0 ? `${borderPx}px solid ${border}` : `1px solid ${layout.line}`;

  return (
    <>
      {scopedCss ? <style>{scopedCss}</style> : null}
      <EditorSection
        sectionId={sectionId}
        label="Header"
        style={{
          position: stickyActive ? 'sticky' : 'relative',
          top: stickyActive ? 0 : undefined,
          zIndex: 50,
          background: background || '#ffffff',
          borderBottom: headerDivider,
          fontFamily: fontBody,
          color: text,
          minHeight,
        }}
      >
        <div
          style={{
            maxWidth: innerMaxWidth,
            margin: '0 auto',
            padding: `${paddingY}px ${Math.max(20, layout.padX)}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: menuOnOwnRowTop || menuOnOwnRowBottom ? 12 : 0,
          }}
        >
          {menuOnOwnRowTop ? (
            <div style={{ ...mainRow, justifyContent: 'flex-start' }}>{menuNode}</div>
          ) : null}
          <div style={mainRow}>
            {menuOnOwnRowTop || menuOnOwnRowBottom ? (
              <>
                <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>{logoNode}</div>
                {utilities}
              </>
            ) : (
              <>
                {brandCluster}
                {utilities}
              </>
            )}
          </div>
          {menuOnOwnRowBottom ? (
            <div style={{ ...mainRow, justifyContent: 'flex-start' }}>{menuNode}</div>
          ) : null}
        </div>
      </EditorSection>
    </>
  );
}
