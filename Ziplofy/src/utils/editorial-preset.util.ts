/** Shopify-style defaults for Editorial sections. */

import {
  editorialButtonDefaultSettings,
  editorialCaptionDefaultSettings,
  editorialHeadingDefaultSettings,
  editorialMediaDefaultSettings,
  editorialTextDefaultSettings,
} from '../create-theme/sidebar/theme-editor-editorial-block-panel.utils';
import { seedEditorialContentGroupInSettings } from '../create-theme/sidebar/theme-editor-editorial-content-group-panel.utils';
import { seedEditorialTextGroupInSettings } from '../create-theme/sidebar/theme-editor-editorial-group-panel.utils';

export function applyEditorialPreset(section: Record<string, unknown>): void {
  if (section.type !== 'editorial') return;

  let settings = seedEditorialContentGroupInSettings(
    (section.settings ?? {}) as Record<string, unknown>
  );
  settings = seedEditorialTextGroupInSettings(settings);
  settings.catalogVariant = 'editorial';
  Object.assign(settings, editorialMediaDefaultSettings());
  Object.assign(settings, editorialCaptionDefaultSettings());
  Object.assign(settings, editorialHeadingDefaultSettings());
  Object.assign(settings, editorialTextDefaultSettings());
  Object.assign(settings, editorialButtonDefaultSettings());
  settings.mediaPosition = 'left';
  settings.mediaWidth = 'medium';
  settings.mediaHeight = 'medium';
  settings.sectionWidth = 'full';
  settings.colorScheme = 'scheme-4';
  settings.backgroundColor = 'default';
  settings.paddingTop = 0;
  settings.paddingBottom = 0;
  settings.customCss = '';
  section.settings = settings;
  section.blocks = {};
  section.block_order = [];
}
