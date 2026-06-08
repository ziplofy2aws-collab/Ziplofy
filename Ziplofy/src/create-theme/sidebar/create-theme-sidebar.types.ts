export type ThemeEditorSidebarTab = 'sections' | 'theme-settings';

export type SidebarNodeKind =
  | 'group-label'
  | 'section'
  | 'block'
  | 'field'
  | 'add-section'
  | 'add-block';

export type SidebarIcon =
  | 'section'
  | 'text'
  | 'title'
  | 'button'
  | 'image'
  | 'price'
  | 'product-card'
  | 'group'
  | 'link'
  | 'default';

export type EditorFieldOption = { value: string; label: string };

export type EditorFieldWidget =
  | 'slider'
  | 'segmented'
  | 'color-scheme'
  | 'accordion'
  | 'richtext'
  | 'link'
  | 'info-link'
  | 'select'
  | 'select-inline'
  | 'image'
  | 'toggle'
  | 'color';

export type EditorFieldDef = {
  path: string;
  type: string;
  label: string;
  group?: string;
  widget?: EditorFieldWidget;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: EditorFieldOption[];
  placeholder?: string;
  /** Helper copy shown under the control (Shopify-style). */
  description?: string;
  /** When false, field appears only in the bottom settings sheet (not sidebar tree). */
  sidebar?: boolean;
};

export type SidebarNode = {
  id: string;
  label: string;
  kind: SidebarNodeKind;
  disabled?: boolean;
  icon?: SidebarIcon;
  /** Truncated value preview (e.g. heading text). */
  preview?: string;
  fields?: EditorFieldDef[];
  children?: SidebarNode[];
  /** Key for drag-reorder list of direct children. */
  childrenListKey?: string;
  showVisibilityToggle?: boolean;
  /** Trash control to remove this section from the page (header/footer/template). */
  showDeleteButton?: boolean;
};

export type EditorSchemaDoc = {
  globalSettings?: {
    label?: string;
    groups?: Array<{ id?: string; label?: string; fields?: EditorFieldDef[] }>;
  };
  layout?: Record<
    string,
    {
      label?: string;
      settingsFields?: EditorFieldDef[];
      blocks?: Array<{
        id?: string;
        label?: string;
        settingsFields?: EditorFieldDef[];
        blocks?: Array<{ id?: string; label?: string; settingsFields?: EditorFieldDef[] }>;
      }>;
    }
  >;
  templates?: Array<{
    id: string;
    label?: string;
    sections?: Array<{
      id?: string;
      type?: string;
      label?: string;
      hasBlocks?: boolean;
      settingsFields?: EditorFieldDef[];
      blocks?: Array<{
        id?: string;
        label?: string;
        settingsFields?: EditorFieldDef[];
        blocks?: Array<{ id?: string; label?: string; settingsFields?: EditorFieldDef[] }>;
      }>;
    }>;
  }>;
};
