import type { CreateThemeEditing } from '../types';

export const editing: CreateThemeEditing = {
  sectionLabel: '404',
  sectionSettingsOrder: [
    { key: 'direction', label: 'Direction', type: 'select' },
    { key: 'layoutAlignment', label: 'Alignment', type: 'select' },
    { key: 'position', label: 'Position', type: 'select' },
    { key: 'layoutGap', label: 'Gap', type: 'number' },
    { key: 'sectionWidth', label: 'Width', type: 'select' },
    { key: 'height', label: 'Height', type: 'select' },
    { key: 'colorScheme', label: 'Color scheme', type: 'select' },
    { key: 'backgroundMedia', label: 'Background media', type: 'select' },
    { key: 'backgroundImageUrl', label: 'Background image', type: 'text' },
    { key: 'backgroundImagePosition', label: 'Image fit', type: 'select' },
    { key: 'backgroundColor', label: 'Background color', type: 'text' },
    { key: 'textColor', label: 'Text color', type: 'text' },
    { key: 'backgroundOverlay', label: 'Background overlay', type: 'boolean' },
    { key: 'overlayColor', label: 'Overlay color', type: 'text' },
    { key: 'overlayOpacity', label: 'Overlay opacity', type: 'number' },
    { key: 'borderStyle', label: 'Borders', type: 'select' },
    { key: 'cornerRadius', label: 'Corner radius', type: 'number' },
    { key: 'paddingTop', label: 'Top', type: 'number' },
    { key: 'paddingBottom', label: 'Bottom', type: 'number' },
  ],
  blocks: [
    {
      blockId: 'heading',
      label: 'Text',
      settingsOrder: [
        { key: 'text', label: 'Heading', type: 'textarea' },
        { key: 'headingWidth', label: 'Width', type: 'select' },
        { key: 'headingAlignment', label: 'Alignment', type: 'select' },
        { key: 'headingTypographyPreset', label: 'Preset', type: 'select' },
        { key: 'headingColor', label: 'Text color', type: 'select' },
      ],
    },
    {
      blockId: 'message',
      label: 'Text',
      settingsOrder: [
        { key: 'text', label: 'Text', type: 'textarea' },
        { key: 'width', label: 'Width', type: 'select' },
        { key: 'alignment', label: 'Alignment', type: 'select' },
        { key: 'typographyPreset', label: 'Preset', type: 'select' },
        { key: 'textColor', label: 'Text color', type: 'text' },
      ],
    },
    {
      blockId: 'primary_button',
      label: 'Button',
      settingsOrder: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'href', label: 'Link', type: 'text' },
        { key: 'openInNewTab', label: 'Open in new tab', type: 'boolean' },
        { key: 'buttonStyle', label: 'Style', type: 'select' },
        { key: 'desktopWidth', label: 'Desktop width', type: 'select' },
        { key: 'mobileWidth', label: 'Mobile width', type: 'select' },
      ],
    },
  ],
};
