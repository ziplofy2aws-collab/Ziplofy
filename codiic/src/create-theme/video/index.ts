import type { CreateThemeElement } from '../types';
import { editing } from './editing';
import { videoPreview } from './preview';
import { applyPreset } from './preset';

export const videoElement: CreateThemeElement = {
  id: "video",
  label: "Video",
  keywords: ["media","youtube","vimeo"],
  previewVariant: "storytelling-video",
  catalogIcon: "blocks",
  previewCaption: "Video",
  Preview: videoPreview,
  editing,
  insert: {
    placement: "template",
    group: "template",
    blueprintId: "storytelling_video",
    sectionType: "storytelling-video",
  },
  applyPreset,
};
