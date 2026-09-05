'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import type { EditorFieldDef, InformaticThemeSchema } from '@/lib/informatic-theme/load-static-pack';

const SIDEBAR_BASE_PADDING = 12;
const SIDEBAR_DEPTH_STEP = 12;

type Panel =
  | { kind: 'layout'; sectionId: string }
  | { kind: 'layout-block'; sectionId: string; blockId: string }
  | { kind: 'section'; templateId: string; sectionId: string }
  | { kind: 'section-block'; templateId: string; sectionId: string; blockId: string };

type TreeRow = {
  id: string;
  label: string;
  panel: Panel;
  removable?: boolean;
  children?: TreeRow[];
};

function sidebarIndent(depth: number): number {
  return SIDEBAR_BASE_PADDING + depth * SIDEBAR_DEPTH_STEP;
}

function SectionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="2"
        y="3"
        width="12"
        height="10"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

export function panelToTreeNodeId(panel: Panel, pageId: string): string | null {
  if (panel.kind === 'layout') return `layout:${panel.sectionId}`;
  if (panel.kind === 'layout-block') return `sections.${panel.sectionId}.blocks.${panel.blockId}`;
  if (panel.kind === 'section') return `template:${pageId}:${panel.sectionId}`;
  if (panel.kind === 'section-block') {
    return `templates.${panel.templateId}.sections.${panel.sectionId}.blocks.${panel.blockId}`;
  }
  return null;
}

function buildLayoutRows(
  layoutEntries: [string, NonNullable<InformaticThemeSchema['layout']>[string]][]
): TreeRow[] {
  return layoutEntries.map(([id, def]) => {
    const blocks = (def.blocks || []).map((b) => ({
      id: `sections.${id}.blocks.${b.id}`,
      label: b.label || b.id,
      panel: { kind: 'layout-block' as const, sectionId: id, blockId: b.id },
    }));
    return {
      id: `layout:${id}`,
      label: def.label || id,
      panel: { kind: 'layout' as const, sectionId: id },
      children: blocks.length ? blocks : undefined,
    };
  });
}

function buildTemplateRows(
  pageId: string,
  sections: Array<{
    id: string;
    label?: string;
    insertable?: boolean;
    blocks?: Array<{ id: string; label?: string }>;
  }>
): TreeRow[] {
  return sections.map((sec) => {
    const blocks = (sec.blocks || []).map((b) => ({
      id: `templates.${pageId}.sections.${sec.id}.blocks.${b.id}`,
      label: b.label || b.id,
      panel: {
        kind: 'section-block' as const,
        templateId: pageId,
        sectionId: sec.id,
        blockId: b.id,
      },
    }));
    return {
      id: `template:${pageId}:${sec.id}`,
      label: sec.label || sec.id,
      removable: Boolean(sec.insertable),
      panel: { kind: 'section' as const, templateId: pageId, sectionId: sec.id },
      children: blocks.length ? blocks : undefined,
    };
  });
}

function SidebarGroupLabel({ label, depth }: { label: string; depth: number }) {
  return (
    <p
      className="px-3 pb-1.5 pt-4 text-[15px] font-semibold text-gray-900"
      style={{ paddingLeft: sidebarIndent(depth) }}
    >
      {label}
    </p>
  );
}

function SidebarTreeRow({
  row,
  depth,
  expanded,
  selectedNodeId,
  onToggleExpand,
  onSelect,
  onRemoveSection,
}: {
  row: TreeRow;
  depth: number;
  expanded: Record<string, boolean>;
  selectedNodeId: string | null;
  onToggleExpand: (id: string) => void;
  onSelect: (row: TreeRow) => void;
  onRemoveSection?: (sectionId: string) => void;
}) {
  const hasChildren = Boolean(row.children?.length);
  const isOpen = expanded[row.id] === true;
  const isSelected = selectedNodeId === row.id;
  const indent = sidebarIndent(depth);

  return (
    <>
      <div
        data-sidebar-node-id={row.id}
        className={`group flex items-center gap-0.5 pr-1 text-[13px] transition-colors duration-150 ${
          isSelected
            ? 'bg-[#005bd3] font-medium text-white'
            : 'text-gray-800 hover:bg-[#ededed]'
        }`}
        style={{ paddingLeft: indent - 4 }}
      >
        <span className="w-5 shrink-0" />
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(row.id)}
            className={`flex h-7 w-5 shrink-0 items-center justify-center ${
              isSelected ? 'text-white/90 hover:text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <button
          type="button"
          className="flex min-h-[32px] min-w-0 flex-1 items-center gap-2 py-1 pr-1 text-left"
          onClick={() => {
            onSelect(row);
            if (hasChildren) onToggleExpand(row.id);
          }}
        >
          <SectionIcon
            className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}
          />
          <span className="shrink-0 text-[13px] font-medium">{row.label}</span>
        </button>
        {row.removable && onRemoveSection && row.panel.kind === 'section' ? (
          <button
            type="button"
            title="Remove section"
            aria-label={`Remove ${row.label}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveSection(row.panel.sectionId);
            }}
            className={`mr-1 rounded px-1.5 py-0.5 text-[11px] ${
              isSelected ? 'text-white/80 hover:bg-white/15' : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            Remove
          </button>
        ) : null}
      </div>
      {hasChildren && isOpen
        ? row.children!.map((child) => (
            <SidebarTreeRow
              key={child.id}
              row={child}
              depth={depth + 1}
              expanded={expanded}
              selectedNodeId={selectedNodeId}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onRemoveSection={onRemoveSection}
            />
          ))
        : null}
    </>
  );
}

type InformaticEditorSidebarTreeProps = {
  pageId: string;
  pageLabel: string;
  layoutEntries: [string, NonNullable<InformaticThemeSchema['layout']>[string]][];
  templateSections: Array<{
    id: string;
    label?: string;
    insertable?: boolean;
    blocks?: Array<{ id: string; label?: string; settingsFields?: EditorFieldDef[] }>;
    settingsFields?: EditorFieldDef[];
  }>;
  highlightNodeId: string | null;
  expanded: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  onSelectPanel: (panel: Panel, nodeId: string) => void;
  onRemoveSection?: (sectionId: string) => void;
  sectionsHeaderSlot?: React.ReactNode;
  sectionsFooterSlot?: React.ReactNode;
};

export function InformaticEditorSidebarTree({
  pageId,
  pageLabel,
  layoutEntries,
  templateSections,
  highlightNodeId,
  expanded,
  onToggleExpand,
  onSelectPanel,
  onRemoveSection,
  sectionsHeaderSlot,
  sectionsFooterSlot,
}: InformaticEditorSidebarTreeProps) {
  const selectedNodeId = highlightNodeId;
  const layoutRows = buildLayoutRows(layoutEntries);
  const templateRows = buildTemplateRows(pageId, templateSections);

  useEffect(() => {
    if (!selectedNodeId) return;
    const el = document.querySelector(`[data-sidebar-node-id="${CSS.escape(selectedNodeId)}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedNodeId]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f8f9]">
      {sectionsHeaderSlot}
      <div className="pb-3 pt-1">
        <SidebarGroupLabel label="Layout" depth={0} />
        {layoutRows.map((row) => (
          <SidebarTreeRow
            key={row.id}
            row={row}
            depth={0}
            expanded={expanded}
            selectedNodeId={selectedNodeId}
            onToggleExpand={onToggleExpand}
            onSelect={(r) => onSelectPanel(r.panel, r.id)}
            onRemoveSection={onRemoveSection}
          />
        ))}

        <SidebarGroupLabel label={pageLabel} depth={0} />
        {templateRows.map((row) => (
          <SidebarTreeRow
            key={row.id}
            row={row}
            depth={0}
            expanded={expanded}
            selectedNodeId={selectedNodeId}
            onToggleExpand={onToggleExpand}
            onSelect={(r) => onSelectPanel(r.panel, r.id)}
            onRemoveSection={onRemoveSection}
          />
        ))}
        {sectionsFooterSlot}
      </div>
    </div>
  );
}

export function defaultExpandedTreeIds(
  layoutEntries: [string, { blocks?: unknown[] }][],
  templateSections: Array<{ id: string; blocks?: unknown[] }>,
  pageId: string
): Record<string, boolean> {
  const expanded: Record<string, boolean> = {};
  for (const [id, def] of layoutEntries) {
    if ((def.blocks || []).length) expanded[`layout:${id}`] = true;
  }
  for (const sec of templateSections) {
    if ((sec.blocks || []).length) expanded[`template:${pageId}:${sec.id}`] = true;
  }
  return expanded;
}

function panelToPreviewNodeId(panel: Panel): string {
  if (panel.kind === 'layout') return `layout:${panel.sectionId}`;
  if (panel.kind === 'layout-block') return `sections.${panel.sectionId}.blocks.${panel.blockId}`;
  if (panel.kind === 'section') return `layout:${panel.sectionId}`;
  if (panel.kind === 'section-block') {
    return `templates.${panel.templateId}.sections.${panel.sectionId}.blocks.${panel.blockId}`;
  }
  return '';
}

export { panelToPreviewNodeId };
