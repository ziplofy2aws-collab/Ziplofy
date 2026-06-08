import type { CSSProperties, ElementType, ReactNode } from 'react';

type SectionProps = {
  sectionId: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Sidebar / preview node id (e.g. `template:index:divider_2`). Defaults to `layout:{sectionId}`. */
  editorNodeId?: string;
};

/** Section root — matches editor `layout:*` / `template:*` section hints. */
export function EditorSection({ sectionId, label, style, children, editorNodeId }: SectionProps) {
  const layoutNodeId = editorNodeId ?? `layout:${sectionId}`;
  return (
    <section
      data-ziplofy-section={sectionId}
      data-section-id={sectionId}
      data-ziplofy-node={layoutNodeId}
      data-ziplofy-label={label ?? sectionId}
      data-ziplofy-kind="section"
      style={style}
    >
      {children}
    </section>
  );
}

type BlockProps = {
  nodeId: string;
  label: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** Block region — matches editor block node ids (e.g. layout:header:block:logo). */
export function EditorBlock({ nodeId, label, style, children }: BlockProps) {
  return (
    <div
      data-ziplofy-node={nodeId}
      data-ziplofy-label={label}
      data-ziplofy-kind="block"
      style={style}
    >
      {children}
    </div>
  );
}

type FieldProps = {
  fieldPath: string;
  label: string;
  as?: ElementType;
  style?: CSSProperties;
  children: ReactNode;
};

/** Wraps editable text so `matchText` hints resolve in the preview overlay. */
export function EditorField({ fieldPath, label, as: Tag = 'span', style, children }: FieldProps) {
  const Component = Tag;
  return (
    <Component
      data-ziplofy-node={`field:${fieldPath}`}
      data-ziplofy-label={label}
      data-ziplofy-kind="field"
      style={style}
    >
      {children}
    </Component>
  );
}
