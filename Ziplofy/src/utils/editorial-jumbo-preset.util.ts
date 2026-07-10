/** Shopify-style defaults for Editorial: Jumbo text sections. */

import {
  editorialJumboJumboTextDefaultSettings,
  editorialJumboMediaDefaultSettings,
} from '../create-theme/sidebar/theme-editor-editorial-jumbo-block-panel.utils';
import { seedEditorialJumboContentGroupInSettings } from '../create-theme/sidebar/theme-editor-editorial-jumbo-content-group-panel.utils';

export function applyEditorialJumboPreset(section: Record<string, unknown>): void {
  if (section.type !== 'editorial-jumbo') return;

  const settings = seedEditorialJumboContentGroupInSettings(
    (section.settings ?? {}) as Record<string, unknown>
  );
  settings.catalogVariant = 'editorial-jumbo';
  Object.assign(settings, editorialJumboMediaDefaultSettings());
  Object.assign(settings, editorialJumboJumboTextDefaultSettings());
  settings.mediaPosition = 'right';
  settings.mediaWidth = 'medium';
  settings.mediaHeight = 'medium';
  settings.sectionWidth = 'page';
  settings.colorScheme = 'scheme-4';
  settings.backgroundColor = 'default';
  settings.paddingTop = 0;
  settings.paddingBottom = 0;
  settings.customCss = '';
  section.settings = settings;
  section.blocks = {};
  section.block_order = [];
}
