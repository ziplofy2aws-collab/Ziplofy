import { useMemo, type CSSProperties, type ReactNode } from 'react';
import {
  StorefrontPolicyLinks,
  usePreviewDevice,
  useStorefront,
  useThemeConfig,
} from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layoutBlockOrder } from '../../runtime/shared/structureOrder';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import type { SectionRuntimeProps } from '../../runtime/types';
import {
  footerUtilitiesColorScheme,
  footerUtilitiesDividerPx,
  footerUtilitiesGap,
  footerUtilitiesPadding,
  footerUtilitiesSectionWidth,
  footerUtilitiesShowPaymentIcons,
  formatCopyrightLine,
  readCopyrightStyle,
  readFooterBlockTypography,
  scopedFooterUtilitiesCss,
  SOCIAL_PLATFORMS,
  socialUrl,
} from './footerUtilitiesStyles';

/** Policies and links / footer utilities — copyright, store policy links (modal), social. */
export function FooterUtilities({
  sectionId = 'footer_utilities',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { text, fontBody } = useThemeColors();
  const { storeFrontMeta } = useStorefront();
  const previewDevice = usePreviewDevice();

  const settingsBase = `sections.${sectionId}.settings`;
  const blocksBase = `sections.${sectionId}.blocks`;
  const catalogVariant = cfgString(config, `${settingsBase}.catalogVariant`, '');
  const isPoliciesLinks = catalogVariant === 'policies-links' || catalogVariant === '';

  const style = useMemo(() => {
    const scheme = footerUtilitiesColorScheme(config, settingsBase, {
      background: '#f3f4f6',
      color: text,
      muted: '#6b7280',
      border: layout.line,
    });
    return {
      scheme,
      widthMode: footerUtilitiesSectionWidth(config, settingsBase),
      gap: footerUtilitiesGap(config, settingsBase),
      dividerPx: footerUtilitiesDividerPx(config, settingsBase),
      ...footerUtilitiesPadding(config, settingsBase),
      showPaymentIcons: footerUtilitiesShowPaymentIcons(config, settingsBase),
      customCss: cfgString(config, `${settingsBase}.customCss`, ''),
    };
  }, [config, settingsBase, text]);

  const copyrightBase = `${blocksBase}.copyright.settings`;
  const policyLinksBase = `${blocksBase}.policy_links.settings`;
  const socialBase = `${blocksBase}.social.settings`;

  const copyrightStyle = useMemo(() => readCopyrightStyle(config, copyrightBase), [config, copyrightBase]);
  const copyrightLine = useMemo(() => formatCopyrightLine(copyrightStyle), [copyrightStyle]);
  const policyTypography = useMemo(
    () => readFooterBlockTypography(config, policyLinksBase),
    [config, policyLinksBase]
  );

  const policyLinkStyle: CSSProperties = {
    color: style.scheme.muted,
    textDecoration: 'underline',
    fontSize: policyTypography.fontSize,
    textTransform: policyTypography.textTransform,
    fontFamily: fontBody,
  };

  const defaultBlockOrder = isPoliciesLinks
    ? ['copyright', 'policy_links']
    : ['copyright', 'policy_links', 'social'];
  const blockOrder = layoutBlockOrder(config, sectionId, defaultBlockOrder);

  const blockNodes: Record<string, ReactNode> = {
    copyright: (
      <EditorBlock nodeId={`layout:${sectionId}:block:copyright`} label="Copyright">
        <EditorField fieldPath={`${copyrightBase}.showPoweredBy`} label='Show "Powered by" badge'>
          <span
            style={{
              color: style.scheme.muted,
              fontSize: copyrightStyle.fontSize,
              textTransform: copyrightStyle.textTransform,
            }}
          >
            {copyrightLine}
          </span>
        </EditorField>
      </EditorBlock>
    ),
    policy_links: (
      <EditorBlock
        nodeId={`layout:${sectionId}:block:policy_links`}
        label="Policy links"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}
      >
        <EditorField fieldPath={`${policyLinksBase}.fontSize`} label="Size">
          <StorefrontPolicyLinks
            storeId={storeFrontMeta?.storeId}
            device={previewDevice === 'mobile' ? 'mobile' : 'desktop'}
            linkStyle={policyLinkStyle}
            className="codiic-footer-policy-links"
          />
        </EditorField>
      </EditorBlock>
    ),
    social: (
      <EditorBlock
        nodeId={`layout:${sectionId}:block:social`}
        label="Social media links"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}
      >
        {SOCIAL_PLATFORMS.map((platform) => {
          const url = socialUrl(
            config,
            socialBase,
            platform.settingKey,
            platform.id === 'instagram' || platform.id === 'facebook' ? platform.id : undefined
          );
          return (
            <EditorField
              key={platform.id}
              fieldPath={`${socialBase}.${platform.settingKey}`}
              label={platform.label}
            >
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: style.scheme.muted, textDecoration: 'underline', fontSize: 13 }}
                >
                  {platform.label}
                </a>
              ) : (
                <span style={{ color: style.scheme.muted, opacity: 0.45, fontSize: 13 }}>
                  {platform.label}
                </span>
              )}
            </EditorField>
          );
        })}
      </EditorBlock>
    ),
  };

  const innerMaxWidth = style.widthMode === 'full' ? '100%' : layout.maxWidth;
  const horizontalPad = style.widthMode === 'full' ? 0 : layout.padX;

  return (
    <EditorSection
      sectionId={sectionId}
      label={isPoliciesLinks ? 'Policies and links' : 'Utilities'}
      style={{
        background: style.scheme.background,
        borderTop: isPoliciesLinks
          ? `1px solid ${style.scheme.border}`
          : `${style.dividerPx}px solid ${style.scheme.border}`,
        fontFamily: fontBody,
        fontSize: 13,
        color: style.scheme.color,
        paddingTop: style.paddingTop,
        paddingBottom: style.paddingBottom,
        paddingLeft: horizontalPad,
        paddingRight: horizontalPad,
        boxSizing: 'border-box',
      }}
    >
      {style.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: scopedFooterUtilitiesCss(sectionId, style.customCss) }} />
      ) : null}
      <div
        style={{
          maxWidth: innerMaxWidth,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: style.gap,
        }}
      >
        {blockOrder.map((blockId) => {
          const node = blockNodes[blockId];
          return node ? <span key={blockId}>{node}</span> : null;
        })}
        {!isPoliciesLinks && style.showPaymentIcons ? (
          <span
            style={{
              display: 'inline-flex',
              gap: 6,
              opacity: 0.7,
              fontSize: 11,
              letterSpacing: 0.04,
            }}
            aria-hidden
          >
            VISA MC AMEX
          </span>
        ) : null}
      </div>
    </EditorSection>
  );
}
