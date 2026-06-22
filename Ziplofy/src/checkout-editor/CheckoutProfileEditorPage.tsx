import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../create-theme/chrome/create-theme-chrome.css';
import { buildThemeSettingsSidebarTree } from '../create-theme/sidebar/create-theme-sidebar.tree';
import type {
  EditorSchemaDoc,
  ThemeEditorSidebarTab,
} from '../create-theme/sidebar/create-theme-sidebar.types';
import CreateThemeEditorSidebar from '../create-theme/sidebar/CreateThemeEditorSidebar';
import { useStore } from '../contexts/store.context';
import { useStoreSubdomain } from '../contexts/storeSubdomain.context';
import { loadCreatorThemeEditorPack } from '../utils/theme-editor-static-pack';
import { CheckoutEditorHeader } from './CheckoutEditorHeader';
import { CheckoutProfilePreview } from './CheckoutProfilePreview';
import {
  buildCheckoutProfileSidebarTree,
  defaultCheckoutProfileSidebarExpanded,
} from './build-checkout-profile-sidebar.tree';

const CheckoutProfileEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId, stores } = useStore();
  const { storeSubdomain, getByStoreId: fetchStoreSubdomain } = useStoreSubdomain();

  const [packLoading, setPackLoading] = useState(true);
  const [packError, setPackError] = useState<string | null>(null);
  const [editorSchema, setEditorSchema] = useState<EditorSchemaDoc | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [sidebarTab, setSidebarTab] = useState<ThemeEditorSidebarTab>('sections');
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    defaultCheckoutProfileSidebarExpanded
  );

  const activeStoreName =
    stores.find((s) => s._id === activeStoreId)?.storeName ?? 'My Store';
  const configurationName = `${activeStoreName} configuration`;
  const pageLabel = 'Information';

  const sectionsTree = useMemo(() => buildCheckoutProfileSidebarTree(), []);
  const themeSettingsTree = useMemo(
    () => (editorSchema ? buildThemeSettingsSidebarTree(editorSchema) : []),
    [editorSchema]
  );
  const activeTree = sidebarTab === 'sections' ? sectionsTree : themeSettingsTree;
  const sidebarLoading = sidebarTab === 'theme-settings' && packLoading;
  const sidebarError = sidebarTab === 'theme-settings' ? packError : null;

  useEffect(() => {
    if (activeStoreId) {
      void fetchStoreSubdomain(activeStoreId);
    }
  }, [activeStoreId, fetchStoreSubdomain]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPackLoading(true);
      setPackError(null);
      try {
        const data = await loadCreatorThemeEditorPack('horizon');
        if (cancelled) return;
        setEditorSchema(data.editorSchema as EditorSchemaDoc);
      } catch (err: unknown) {
        if (!cancelled) {
          setPackError((err as Error)?.message ?? 'Failed to load checkout editor');
        }
      } finally {
        if (!cancelled) setPackLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const noopReorder = useCallback((_listKey: string, _orderedIds: string[]) => {}, []);

  const handleExit = useCallback(() => {
    navigate('/settings/checkout');
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-[1310] flex flex-col bg-[#1e1e1e]">
      <CheckoutEditorHeader
        configurationName={configurationName}
        pageLabel={pageLabel}
        device={device}
        onDeviceChange={setDevice}
        saveDisabled
        storeUrl={storeSubdomain?.url ?? null}
      />

      <div className="flex min-h-0 flex-1">
        <CreateThemeEditorSidebar
          pageLabel={pageLabel}
          sidebarTitleMode="plain"
          sidebarTab={sidebarTab}
          onSidebarTabChange={(tab) => {
            setSidebarTab(tab);
            if (tab === 'theme-settings') setSelectedNodeId('');
          }}
          onExit={handleExit}
          tree={activeTree}
          expanded={expanded}
          onToggleExpand={toggleExpand}
          selectedNodeId={selectedNodeId}
          onSelectNode={(node) => {
            if (selectedNodeId === node.id) {
              setSelectedNodeId('');
              return;
            }
            setSelectedNodeId(node.id);
            if (node.children?.length) {
              setExpanded((prev) => ({ ...prev, [node.id]: true }));
            }
          }}
          hiddenNodes={{}}
          onToggleHidden={() => {}}
          onReorder={noopReorder}
          loading={sidebarLoading}
          error={sidebarError}
        />

        <CheckoutProfilePreview device={device} storeUrl={storeSubdomain?.url ?? null} />
      </div>
    </div>
  );
};

export default CheckoutProfileEditorPage;
