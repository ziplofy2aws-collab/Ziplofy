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
export function EditorSection({
  sectionId,
  label,
  className,
  style,
  children,
  editorNodeId,
}: SectionProps) {
  const layoutNodeId = editorNodeId ?? `layout:${sectionId}`;
  return (
    <section
      data-codiic-section={sectionId}
      data-section-id={sectionId}
      data-codiic-node={layoutNodeId}
      data-codiic-label={label ?? sectionId}
      data-codiic-kind="section"
      className={className}
      style={style}
    >
      {children}
    </section>
  );
}

type BlockProps = {
  nodeId: string;
  label: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** Block region — matches editor block node ids (e.g. layout:header:block:logo). */
export function EditorBlock({ nodeId, label, className, style, children }: BlockProps) {
  return (
    <div
      data-codiic-node={nodeId}
      data-codiic-label={label}
      data-codiic-kind="block"
      className={className}
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
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** Wraps editable text so `matchText` hints resolve in the preview overlay. */
export function EditorField({
  fieldPath,
  label,
  as: Tag = 'span',
  className,
  style,
  children,
}: FieldProps) {
  const Component = Tag;
  return (
    <Component
      data-codiic-node={`field:${fieldPath}`}
      data-codiic-label={label}
      data-codiic-kind="field"
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
}
