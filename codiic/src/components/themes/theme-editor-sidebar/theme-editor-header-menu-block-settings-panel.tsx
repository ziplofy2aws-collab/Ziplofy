import React from 'react';
import type { StoreMenu, StoreMenuItem } from '../../../contexts/store-menu.context';
import { StoreMenuSelectFieldRow } from '../../../create-theme/sidebar/StoreMenuSelectFieldRow';
import type { EditorFieldDef } from './theme-editor-sidebar.types';
import type { ThemeEditorFieldType } from './theme-editor-field.utils';
import { pickHeaderMenuBlockField } from './theme-editor-header-menu-block-panel.utils';

/** Catalog header menu: store menu picker only. */
export function HeaderMenuBlockSettingsPanel({
  fields,
  values,
  onFieldChange,
  onStoreMenuSelect,
}: {
  fields: EditorFieldDef[];
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
  onStoreMenuSelect?: (menuFieldPath: string, menu: StoreMenu, items: StoreMenuItem[]) => void;
}) {
  const menuField = pickHeaderMenuBlockField(fields, 'menu');

  if (!menuField) {
    return (
      <p className="px-1 py-3 text-[13px] text-gray-500">No menu setting on this header.</p>
    );
  }

  return (
    <div className="px-1 py-3">
      <StoreMenuSelectFieldRow
        field={menuField}
        values={values}
        onFieldChange={onFieldChange}
        onStoreMenuSelect={onStoreMenuSelect}
      />
    </div>
  );
}
