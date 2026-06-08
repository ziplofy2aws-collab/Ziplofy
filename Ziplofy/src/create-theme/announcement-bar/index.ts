import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { applyAnnouncementBarPreset } from './preset';
import { AnnouncementBarPreview } from './preview';

export const announcementBarElement: CreateThemeElement = {
  id: 'announcement-bar',
  label: 'Announcement bar',
  keywords: ['banner', 'promo'],
  previewVariant: 'announcement-bar',
  catalogIcon: 'marquee',
  previewCaption: 'Promotions at the top of every page',
  Preview: AnnouncementBarPreview,
  editing,
  insert: {
    placement: 'layout',
    group: 'header',
    blueprintId: 'announcement_bar',
    sectionType: 'announcement-bar',
  },
  applyPreset: applyAnnouncementBarPreset,
};
