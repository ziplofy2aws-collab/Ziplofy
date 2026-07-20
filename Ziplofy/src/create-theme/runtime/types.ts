import type { ComponentType } from 'react';

export type SectionRuntimeProps = {
  sectionId: string;
  placement: 'layout' | 'template';
  templateId?: string;
};

export type SectionRuntimeComponent = ComponentType<SectionRuntimeProps>;
