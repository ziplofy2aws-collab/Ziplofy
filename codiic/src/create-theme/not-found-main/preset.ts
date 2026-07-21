import { textBlockDefaultSettings } from '../sidebar/theme-editor-text-block-panel.utils';
import { NOT_FOUND_MAIN_CONTAINER_DEFAULTS } from '../sidebar/theme-editor-not-found-main-panel.utils';

export const NOT_FOUND_MAIN_BLOCK_ORDER = ['heading', 'message', 'primary_button'] as const;

export function defaultNotFoundMainSection(): Record<string, unknown> {
  return {
    type: 'not-found-main',
    enabled: true,
    settings: {
      ...NOT_FOUND_MAIN_CONTAINER_DEFAULTS,
      title: 'Page not found',
      headingWidth: 'fill',
      headingMaxWidth: 'normal',
      headingAlignment: 'center',
      headingTypographyPreset: 'heading-1',
      headingFont: 'body',
      headingFontSize: 'default',
      headingLineHeight: 'normal',
      headingLetterSpacing: 'normal',
      headingTextCase: 'default',
      headingWrap: 'pretty',
      headingColor: 'heading',
      headingBackgroundEnabled: false,
      headingBackgroundColor: '#00000026',
      headingCornerRadius: 0,
      headingPaddingTop: 0,
      headingPaddingBottom: 0,
      headingPaddingLeft: 0,
      headingPaddingRight: 0,
    },
    blocks: {
      heading: {
        type: 'heading',
        settings: {
          heading: 'Page not found',
          text: 'Page not found',
        },
      },
      message: {
        type: 'text',
        settings: {
          ...textBlockDefaultSettings(
            'The link may be incorrect, or the page has been removed.'
          ),
          width: 'fill',
          maxWidth: 'normal',
          alignment: 'center',
          typographyPreset: 'paragraph',
        },
      },
      primary_button: {
        type: 'primary-button',
        settings: {
          label: 'Continue shopping',
          href: '/',
          openInNewTab: false,
          buttonStyle: 'primary',
          desktopWidth: 'fit',
          desktopCustomWidth: 100,
          mobileWidth: 'fit',
          mobileCustomWidth: 100,
        },
      },
    },
    block_order: [...NOT_FOUND_MAIN_BLOCK_ORDER],
  };
}
