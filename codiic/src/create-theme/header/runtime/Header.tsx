import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStorefrontAuth, useStorefrontCart, useThemeConfig, useThemeEditorPreview } from '@render-store/sdk';
import { cfgBool, cfgMenuItems, cfgNumber, cfgString } from '../../runtime/shared/config';
import { useThemeIconStrokeWidth } from '../../runtime/shared/themeIconsRuntime';
import {
  resolveActiveThemeLogoUrl,
  resolveThemeLogoHeights,
  scopedHeaderLogoHeightCss,
  shouldUseInverseThemeLogo,
} from '../../runtime/shared/resolveThemeLogo';
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
import { HeaderAccountPanel } from './HeaderAccountPanel';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { PREVIEW_CART_LINES } from '../../runtime/shared/editorPreviewFixtures';
import { scopedHeaderResponsiveCss } from '../../runtime/shared/responsive';
import { layout, useThemeLayout, useThemeColors } from '../../runtime/shared/tokens';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';

type Props = { sectionId?: string };

function HeaderIconSearch({ color, strokeWidth }: { color: string; strokeWidth: number }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6" stroke={color} strokeWidth={strokeWidth} />
      <path d="M16 16l4 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

function HeaderIconAccount({ color, strokeWidth }: { color: string; strokeWidth: number }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth={strokeWidth} />
      <path
        d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeaderIconCart({ color, strokeWidth }: { color: string; strokeWidth: number }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 8V6a4 4 0 118 0v2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M6 8h12l-1 12H7L6 8z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Header({ sectionId = 'header' }: Props) {
  const { maxWidth } = useThemeLayout();
  const config = useThemeConfig();
  const iconStroke = useThemeIconStrokeWidth();
  const { pathname } = useLocation();
  const themeColors = useThemeColors();
  const { fontHeading, fontBody, fontSubheading, primary, background: themeBg } = themeColors;
  const { user, logout } = useStorefrontAuth();
  const { getAllItems } = useStorefrontCart();
  const isEditorPreview = useThemeEditorPreview();
  const liveCartCount = getAllItems().reduce((s, i) => s + i.quantity, 0);
  // Editor cart is usually empty — show sample qty so cart-bubble colors are visible while editing.
  const previewSampleCount = PREVIEW_CART_LINES.reduce((s, i) => s + i.quantity, 0);
  const cartCount =
    isEditorPreview && liveCartCount === 0 ? Math.max(1, previewSampleCount) : liveCartCount;

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
      bottomBorderColor: (() => {
        const raw = cfgString(config, `${settingsBase}.bottomBorderColor`, '');
        return raw ? resolveThemePaletteColorSetting(config, raw, 1, themeColors.text) : '';
      })(),
      cartBubbleStyle: cfgString(config, `${settingsBase}.cartBubbleStyle`, 'default'),
      cartBubbleBackground: cfgString(config, `${settingsBase}.cartBubbleBackground`, ''),
      cartBubbleText: cfgString(config, `${settingsBase}.cartBubbleText`, ''),
      bottomRowBackground: (() => {
        const raw = cfgString(config, `${settingsBase}.bottomRowBackground`, '');
        return raw ? resolveThemePaletteColorSetting(config, raw, 0, themeBg) : '';
      })(),
      bottomRowText: (() => {
        const raw = cfgString(config, `${settingsBase}.bottomRowText`, '');
        return raw ? resolveThemePaletteColorSetting(config, raw, 1, themeColors.text) : '';
      })(),
      dividerPx: Math.max(0, cfgNumber(config, `${settingsBase}.dividerThickness`, 0)),
      dividerWidthMode: cfgString(config, `${settingsBase}.dividerWidth`, 'page'),
      dividerColor: resolveThemePaletteColorSetting(
        config,
        cfgString(config, `${settingsBase}.dividerColor`, ''),
        1,
        themeColors.text
      ),
      stickyMode: headerStickyMode(config, settingsBase),
      customCss: cfgString(config, `${settingsBase}.customCss`, ''),
      logoText: cfgString(config, `${logoBase}.text`, 'My Store'),
      tagline: cfgString(config, `${logoBase}.tagline`, ''),
      logoUrl: resolveActiveThemeLogoUrl(config, sectionId, pathname),
      logoHeights: resolveThemeLogoHeights(config),
      hideLogoOnHomePage: cfgBool(config, `${logoBase}.hideLogoOnHomePage`, false),
      logoPaddingTop: Math.max(0, cfgNumber(config, `${logoBase}.paddingTop`, 0)),
      logoPaddingBottom: Math.max(0, cfgNumber(config, `${logoBase}.paddingBottom`, 0)),
      logoPosition: cfgString(config, `${logoBase}.position`, 'left'),
      menuPosition: cfgString(config, `${menuBase}.position`, 'left'),
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
      utilityTextSize: cfgString(config, `${settingsBase}.utilityTextSize`, '14px'),
      utilityTextFont: cfgString(config, `${settingsBase}.utilityTextFont`, 'body'),
      utilityTextCase: cfgString(config, `${settingsBase}.utilityTextCase`, 'default'),
      searchOn: headerSearchEnabled(config, settingsBase),
      searchPosition: cfgString(config, `${settingsBase}.searchPosition`, 'right'),
      searchRow: cfgString(config, `${settingsBase}.searchRow`, 'top'),
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
  }, [config, sectionId, settingsBase, logoBase, menuBase, themeBg, themeColors.text, themeColors, pathname]);

  const {
    scheme,
    widthMode,
    height: { paddingY, minHeight },
    borderPx,
    bottomBorderColor,
    cartBubbleStyle,
    cartBubbleBackground,
    cartBubbleText,
    bottomRowBackground,
    bottomRowText,
    dividerPx,
    dividerWidthMode,
    dividerColor,
    stickyMode,
    customCss,
    logoText,
    tagline,
    logoUrl,
    logoHeights,
    hideLogoOnHomePage,
    logoPaddingTop,
    logoPaddingBottom,
    logoPosition,
    menuPosition,
    menuRow,
    menuItems,
    menuScheme,
    topLevelSize,
    menuFont,
    menuTextCase,
    menuStyle,
    utilityTextSize,
    utilityTextFont,
    utilityTextCase,
    searchOn,
    searchPosition,
    searchRow,
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
  const menuBg = menuScheme.background.trim();
  const iconColor = text;
  const scopedCss = scopedHeaderCss(sectionId, customCss);
  const headerResponsiveCss = scopedHeaderResponsiveCss(sectionId);
  const logoHeightCss = scopedHeaderLogoHeightCss(
    sectionId,
    logoHeights.desktop,
    logoHeights.mobile
  );

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
  const menuSurfaceStyle: CSSProperties = menuBg
    ? {
        background: menuBg,
        padding: '8px 14px',
        borderRadius: 8,
      }
    : {};

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setAccountPanelOpen(false);
  }, [pathname]);

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

  /** Transparent-background page toggle: header overlays page content until scrolled/sticky. */
  const transparentActive =
    shouldUseInverseThemeLogo(config, sectionId, pathname) && !stickyActive;

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
            <img
              src={logoUrl}
              alt={logoText}
              className="codiic-header-logo-img"
              style={{ display: 'block' }}
            />
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

  const menuLinks = (
    <>
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
              <Link
                to={item.href}
                style={menuLinkStyle}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            </EditorField>
          </EditorBlock>
        );
      })}
    </>
  );

  const menuNode: ReactNode = (
    <EditorBlock nodeId={`layout:${sectionId}:block:menu`} label="Menu">
      <nav
        className="codiic-header-desktop-nav"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 24,
          margin: 0,
          padding: 0,
          ...menuSurfaceStyle,
        }}
        aria-label="Main"
      >
        {menuLinks}
      </nav>
    </EditorBlock>
  );

  const mobileMenuNode: ReactNode = mobileMenuOpen ? (
    <EditorBlock nodeId={`layout:${sectionId}:block:menu`} label="Menu">
      <nav
        className="codiic-header-mobile-nav"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 12,
          margin: 0,
          padding: menuBg ? '12px 14px' : '12px 0 4px',
          borderTop: `1px solid ${border}`,
          borderRadius: menuBg ? 8 : undefined,
          ...(menuBg ? { background: menuBg } : null),
        }}
        aria-label="Main mobile"
      >
        {menuItems.map((item, index) => {
          const nestedIds = ['link_shop', 'link_collections', 'link_about', 'link_account'] as const;
          const nestedId = nestedIds[index] ?? `link_${index}`;
          const labelPath = `${menuBase}.items.${index}.label`;
          return (
            <EditorBlock
              key={`mobile-${nestedId}`}
              nodeId={`layout:${sectionId}:block:menu:nested:${nestedId}`}
              label={item.label}
            >
              <EditorField fieldPath={labelPath} label="Label">
                <Link
                  to={item.href}
                  style={{ ...menuLinkStyle, whiteSpace: 'normal' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </EditorField>
            </EditorBlock>
          );
        })}
      </nav>
    </EditorBlock>
  ) : null;

  const menuToggleButton = (
    <button
      type="button"
      className="codiic-header-menu-toggle"
      aria-expanded={mobileMenuOpen}
      aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
      onClick={() => setMobileMenuOpen((open) => !open)}
      style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        border: `1px solid ${border}`,
        borderRadius: 8,
        background: background || '#ffffff',
        color: text,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        {mobileMenuOpen ? (
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );

  const useIcons = menuStyle !== 'text';
  const utilityTextStyle: CSSProperties = {
    fontSize: utilityTextSize,
    fontFamily:
      utilityTextFont === 'heading'
        ? fontHeading
        : utilityTextFont === 'subheading'
          ? fontSubheading
          : fontBody,
    color: iconColor,
    textTransform: utilityTextCase === 'uppercase' ? 'uppercase' : undefined,
    letterSpacing: utilityTextCase === 'uppercase' ? '0.06em' : undefined,
    whiteSpace: 'nowrap',
  };

  const searchNode: ReactNode = searchOn ? (
    <Link
      to="/search"
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
        <HeaderIconSearch color={iconColor} strokeWidth={iconStroke} />
      ) : (
        <span style={utilityTextStyle}>Search</span>
      )}
    </Link>
  ) : null;

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
      {searchOn && searchPosition !== 'left' && searchRow !== 'bottom' ? searchNode : null}
      {showAccount ? (
        <button
          ref={accountButtonRef}
          type="button"
          onClick={() => setAccountPanelOpen((open) => !open)}
          title={user ? 'Account' : 'Sign in'}
          aria-expanded={accountPanelOpen}
          aria-haspopup="dialog"
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
            <HeaderIconAccount color={iconColor} strokeWidth={iconStroke} />
          ) : (
            <span style={utilityTextStyle}>Account</span>
          )}
        </button>
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
          <HeaderIconCart color={iconColor} strokeWidth={iconStroke} />
        ) : (
          <span style={utilityTextStyle}>
            {cartLabel}
            {cartCount > 0 ? ` (${cartCount})` : ''}
          </span>
        )}
        {useIcons && cartCount > 0 ? (
          <span
            aria-hidden={isEditorPreview && liveCartCount === 0}
            style={{
              position: 'absolute',
              top: -4,
              right: -6,
              minWidth: 14,
              height: 14,
              borderRadius: 7,
              background:
                cartBubbleStyle === 'custom' && cartBubbleBackground.trim()
                  ? cartBubbleBackground.trim()
                  : primary,
              color:
                cartBubbleStyle === 'custom' && cartBubbleText.trim()
                  ? cartBubbleText.trim()
                  : themeBg,
              fontSize: 9,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              lineHeight: 1,
              boxSizing: 'border-box',
            }}
          >
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        ) : null}
      </Link>
    </div>
  );

  const mainRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
    width: '100%',
  };

  const innerMaxWidth = widthMode === 'full' ? '100%' : maxWidth;
  /** Classic storefront header: logo + nav stay on one row (legacy `row: top` treated as inline). */
  const menuOnOwnRowTop = false;
  const menuOnOwnRowBottom = menuRow === 'bottom';
  const bottomBorderLineColor = bottomBorderColor || border || layout.line;
  const headerDivider =
    borderPx > 0 ? `${borderPx}px solid ${bottomBorderLineColor}` : `1px solid ${layout.line}`;

  const utilitiesCluster = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {menuToggleButton}
      {utilities}
    </div>
  );

  /** Logo/menu placement driven by their `position` settings; utilities stay on the right. */
  const leftItems: ReactNode[] = [];
  const centerItems: ReactNode[] = [];
  const rightItems: ReactNode[] = [];
  const zoneFor = (pos: string) =>
    pos === 'center' ? centerItems : pos === 'right' ? rightItems : leftItems;

  const searchOnBottom = searchOn && searchRow === 'bottom';

  zoneFor(logoPosition).push(<div key="logo">{logoNode}</div>);
  if (searchOn && searchPosition === 'left' && !searchOnBottom) {
    leftItems.push(
      <div key="search-left" style={{ display: 'flex', alignItems: 'center' }}>
        {searchNode}
      </div>
    );
  }
  if (!menuOnOwnRowBottom && !menuOnOwnRowTop) {
    zoneFor(menuPosition).push(<div key="menu">{menuNode}</div>);
  }
  rightItems.push(<div key="utilities">{utilitiesCluster}</div>);

  /** Bottom row can hold the menu and/or search, each aligned by its own position. */
  const bottomLeft: ReactNode[] = [];
  const bottomCenter: ReactNode[] = [];
  const bottomRight: ReactNode[] = [];
  const bottomZoneFor = (pos: string) =>
    pos === 'center' ? bottomCenter : pos === 'right' ? bottomRight : bottomLeft;
  if (menuOnOwnRowBottom) {
    bottomZoneFor(menuPosition).push(<div key="menu-bottom">{menuNode}</div>);
  }
  if (searchOnBottom) {
    bottomZoneFor(searchPosition).push(
      <div key="search-bottom" style={{ display: 'flex', alignItems: 'center' }}>
        {searchNode}
      </div>
    );
  }
  const hasBottomRow = bottomLeft.length > 0 || bottomCenter.length > 0 || bottomRight.length > 0;

  const bottomRowNode: ReactNode = hasBottomRow ? (
    <div
      className="codiic-header-desktop-nav-row"
      style={{
        ...mainRow,
        alignItems: 'center',
        ...(bottomRowBackground ? { background: bottomRowBackground } : null),
        ...(bottomRowText ? { color: bottomRowText } : null),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1, minWidth: 0 }}>
        {bottomLeft}
      </div>
      {bottomCenter.length ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: '0 0 auto', minWidth: 0 }}>
          {bottomCenter}
        </div>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
        {bottomRight}
      </div>
    </div>
  ) : null;

  const positionedMainRow = (
    <div className="codiic-header-main-row" style={mainRow}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40, flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
        {leftItems}
      </div>
      {centerItems.length ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, flex: '0 0 auto', minWidth: 0 }}>
          {centerItems}
        </div>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
        {rightItems}
      </div>
    </div>
  );

  /** Decorative divider line below the header; width follows Page/Full setting. */
  const dividerNode: ReactNode =
    dividerPx > 0 ? (
      dividerWidthMode === 'full' ? (
        <div style={{ height: dividerPx, background: dividerColor, width: '100%' }} />
      ) : (
        <div
          style={{
            maxWidth: innerMaxWidth,
            margin: '0 auto',
            padding: `0 ${Math.max(20, layout.padX)}px`,
          }}
        >
          <div style={{ height: dividerPx, background: dividerColor }} />
        </div>
      )
    ) : null;

  return (
    <>
      {scopedCss ? <style>{scopedCss}</style> : null}
      <style>{headerResponsiveCss}</style>
      <style>{logoHeightCss}</style>
      <HeaderAccountPanel
        open={accountPanelOpen && showAccount}
        anchorRef={accountButtonRef}
        onClose={() => setAccountPanelOpen(false)}
        user={user}
        onSignOut={logout}
      />
      <EditorSection
        sectionId={sectionId}
        label="Header"
        style={{
          position: transparentActive ? 'absolute' : stickyActive ? 'sticky' : 'relative',
          top: transparentActive ? 0 : stickyActive ? 0 : undefined,
          left: transparentActive ? 0 : undefined,
          right: transparentActive ? 0 : undefined,
          zIndex: 50,
          background: transparentActive ? 'transparent' : background || '#ffffff',
          borderBottom: transparentActive ? 'none' : headerDivider,
          fontFamily: fontBody,
          color: text,
          minHeight,
        }}
      >
        <div
          className="codiic-header-inner"
          style={{
            maxWidth: innerMaxWidth,
            margin: '0 auto',
            padding: `${paddingY}px ${Math.max(20, layout.padX)}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: menuOnOwnRowTop || hasBottomRow ? 12 : 0,
          }}
        >
          {positionedMainRow}
          {mobileMenuNode}
          {bottomRowNode}
        </div>
        {dividerNode}
      </EditorSection>
    </>
  );
}
