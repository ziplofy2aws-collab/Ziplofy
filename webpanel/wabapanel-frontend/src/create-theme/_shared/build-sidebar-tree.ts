import { SECTION_TYPE_TO_ELEMENT_ID } from '../registry';
import { getLayoutOrder } from './layout-order';
import type { CreateThemeCatalogGroup, CreateThemeSidebarNode } from '../types';

const GROUP_LABELS: Record<CreateThemeCatalogGroup, string> = {
  header: 'Header',
  template: 'Template',
  footer: 'Footer',
};

function blockNodes(
  sectionInstanceId: string,
  elementId: string | undefined,
  section: Record<string, unknown>
): CreateThemeSidebarNode[] {
  const blocks = (section.blocks ?? {}) as Record<string, { type?: string }>;
  const order = (section.block_order as string[] | undefined) ?? Object.keys(blocks);
  return order
    .filter((id) => blocks[id])
    .map((blockId) => ({
      id: `layout:${sectionInstanceId}:block:${blockId}`,
      label: blockId.replace(/_/g, ' '),
      kind: 'block' as const,
      sectionInstanceId,
      elementId,
    }));
}

function sectionNodes(
  order: string[],
  sections: Record<string, Record<string, unknown>>,
  layoutGroup: 'header' | 'footer'
): CreateThemeSidebarNode[] {
  return order.map((instanceId) => {
    const sec = sections[instanceId];
    const type = (sec?.type as string) ?? instanceId;
    const elementId = SECTION_TYPE_TO_ELEMENT_ID[type];
    const label =
      type === 'footer'
        ? 'Footer'
        : type === 'footer-utilities'
          ? 'Policies and links'
          : type === 'announcement-bar'
            ? 'Announcement bar'
            : type === 'divider'
              ? 'Divider'
              : instanceId;
    const children = sec ? blockNodes(instanceId, elementId, sec) : [];
    return {
      id: `layout:${instanceId}`,
      label,
      kind: 'section' as const,
      deletable: true,
      sectionInstanceId: instanceId,
      layoutGroup,
      elementId,
      children: children.length ? children : undefined,
    };
  });
}

export function buildCreateThemeSidebarTree(config: Record<string, unknown>): CreateThemeSidebarNode[] {
  const order = getLayoutOrder(config);
  const sections = (config.sections ?? {}) as Record<string, Record<string, unknown>>;

  const makeGroup = (
    group: CreateThemeCatalogGroup,
    layoutGroup: 'header' | 'footer',
    sectionOrder: string[]
  ): CreateThemeSidebarNode => ({
    id: `group:${group}`,
    label: GROUP_LABELS[group],
    kind: 'group',
    children: [
      ...sectionNodes(sectionOrder, sections, layoutGroup),
      { id: `add-section:${group}`, label: 'Add section', kind: 'add' },
    ],
  });

  return [
    makeGroup('header', 'header', order.header ?? []),
    {
      id: 'group:template',
      label: 'Template',
      kind: 'group',
      children: [{ id: 'add-section:template', label: 'Add section', kind: 'add' }],
    },
    makeGroup('footer', 'footer', order.footer ?? []),
  ];
}
