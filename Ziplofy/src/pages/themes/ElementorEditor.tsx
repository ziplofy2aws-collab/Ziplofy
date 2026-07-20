/**
 * ElementorEditor - Clean visual theme builder using GrapesJS + grapesjs-preset-webpage
 * Load/save via custom-themes API. Preview via iframe srcDoc/blob.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCustomThemes } from '../../contexts/custom-themes.context';
import { axiosi } from '../../config/axios.config';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import presetWebpage from 'grapesjs-preset-webpage';
import './ElementorEditor.css';

const DEFAULT_HTML = '<div data-gjs-droppable="*" data-gjs-type="wrapper" style="min-height: 400px; width: 100%; padding: 40px;"></div>';
const DEFAULT_CSS = '';

function extractBodyHtml(fullHtml: string): string {
  if (!fullHtml) return DEFAULT_HTML;
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1].trim() : fullHtml;
}

function extractCss(fullHtml: string, fallbackCss: string): string {
  const styleMatch = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  return (styleMatch ? styleMatch[1].trim() : '') || fallbackCss;
}

const DEVICES = [
  { id: 'Desktop', name: 'Desktop', icon: '🖥️' },
  { id: 'Tablet', name: 'Tablet', icon: '📱' },
  { id: 'Mobile', name: 'Mobile', icon: '📱' },
];

function addCustomBlocks(editor: grapesjs.Editor) {
  const bm = editor.BlockManager;
  if (!bm) return;

  // Basic
  bm.add('col-1', {
    label: '1 Column',
    category: 'Basic',
    content: '<section style="display:grid;grid-template-columns:1fr;padding:24px;min-height:80px;"><div data-gjs-droppable="*"></div></section>',
  });
  bm.add('col-2', {
    label: '2 Columns',
    category: 'Basic',
    content: '<section style="display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:24px;min-height:80px;"><div data-gjs-droppable="*"></div><div data-gjs-droppable="*"></div></section>',
  });
  bm.add('col-3', {
    label: '3 Columns',
    category: 'Basic',
    content: '<section style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:24px;min-height:80px;"><div data-gjs-droppable="*"></div><div data-gjs-droppable="*"></div><div data-gjs-droppable="*"></div></section>',
  });
  bm.add('text-block', {
    label: 'Text',
    category: 'Basic',
    content: '<p data-gjs-editable="true" data-gjs-type="text">Add your text here.</p>',
  });
  bm.add('image-block', {
    label: 'Image',
    category: 'Basic',
    content: '<img src="https://via.placeholder.com/400x300" alt="Placeholder" style="max-width:100%;height:auto;" />',
  });
  bm.add('button-block', {
    label: 'Button',
    category: 'Basic',
    content: '<a href="#" data-gjs-editable="true" data-gjs-type="link" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;">Button</a>',
  });

  // Sections
  bm.add('header-section', {
    label: 'Header',
    category: 'Sections',
    content: '<header style="padding:16px 24px;background:#fff;border-bottom:1px solid #e5e7eb;"><nav style="display:flex;gap:24px;align-items:center;"><a href="#" style="text-decoration:none;color:#1a1a1a;">Home</a><a href="#" style="text-decoration:none;color:#1a1a1a;">Products</a><a href="#" style="text-decoration:none;color:#1a1a1a;">About</a></nav></header>',
  });
  bm.add('hero-section', {
    label: 'Hero',
    category: 'Sections',
    content: '<section style="padding:80px 24px;text-align:center;background:#f5f5f5;"><h1 data-gjs-editable="true" style="font-size:2.5rem;margin-bottom:16px;">Hero Title</h1><p data-gjs-editable="true" style="margin-bottom:24px;color:#6b7280;">Add your hero description.</p><a href="#" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;">Get Started</a></section>',
  });
  bm.add('footer-section', {
    label: 'Footer',
    category: 'Sections',
    content: '<footer style="padding:40px 24px;background:#1a1a1a;color:#fff;text-align:center;"><p style="margin:0;">© 2025 Your Store. All rights reserved.</p></footer>',
  });

  // E-commerce
  bm.add('product-grid', {
    label: 'Product Grid',
    category: 'E-commerce',
    content: '<section style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:40px 24px;"><div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;"><div style="height:200px;background:#f3f4f6;"></div><div style="padding:16px;"><h3 data-gjs-editable="true">Product 1</h3><p data-gjs-editable="true" style="color:#6b7280;">₹2,499.00</p></div></div><div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;"><div style="height:200px;background:#f3f4f6;"></div><div style="padding:16px;"><h3 data-gjs-editable="true">Product 2</h3><p data-gjs-editable="true" style="color:#6b7280;">₹3,299.00</p></div></div><div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;"><div style="height:200px;background:#f3f4f6;"></div><div style="padding:16px;"><h3 data-gjs-editable="true">Product 3</h3><p data-gjs-editable="true" style="color:#6b7280;">₹4,199.00</p></div></div></div></section>',
  });
}

export const ElementorEditor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const themeId = searchParams.get('id') || searchParams.get('themeId');
  const isExistingTheme = useMemo(() => themeId && /^[0-9a-fA-F]{24}$/.test(themeId), [themeId]);

  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<grapesjs.Editor | null>(null);
  const stylePanelRef = useRef<HTMLDivElement>(null);

  const { createTheme, updateTheme } = useCustomThemes();

  const [themeName, setThemeName] = useState('My Theme');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [currentDevice, setCurrentDevice] = useState('Desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  // Load theme from backend
  const loadTheme = useCallback(async () => {
    if (!isExistingTheme || !themeId) {
      setThemeName('My Theme');
      setLoading(false);
      return { html: DEFAULT_HTML, css: DEFAULT_CSS };
    }
    try {
      const { data } = await axiosi.get<{ success: boolean; data: { html?: string; css?: string; name?: string } }>(`/custom-themes/${themeId}`);
      if (data.success && data.data) {
        setThemeName(data.data.name || 'My Theme');
        const rawHtml = data.data.html || '';
        const rawCss = data.data.css || '';
        const bodyHtml = rawHtml ? extractBodyHtml(rawHtml) : DEFAULT_HTML;
        const combinedCss = (rawHtml ? extractCss(rawHtml, rawCss) : '') || rawCss || DEFAULT_CSS;
        return { html: bodyHtml, css: combinedCss };
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load theme';
      setError(msg);
    }
    setLoading(false);
    return { html: DEFAULT_HTML, css: DEFAULT_CSS };
  }, [isExistingTheme, themeId]);

  // Init GrapesJS
  useEffect(() => {
    if (!editorRef.current) return;

    let mounted = true;
    let editor: grapesjs.Editor | null = null;

    const init = async () => {
      const { html, css } = await loadTheme();
      if (!mounted || !editorRef.current) return;

      editor = grapesjs.init({
        container: editorRef.current,
        height: '100%',
        width: 'auto',
        fromElement: false,
        storageManager: false,
        deviceManager: {
          devices: [
            { id: 'Desktop', name: 'Desktop', width: '1280px' },
            { id: 'Tablet', name: 'Tablet', width: '768px', widthMedia: '992px' },
            { id: 'Mobile', name: 'Mobile', width: '375px', widthMedia: '768px' },
          ],
        },
        plugins: [presetWebpage],
        pluginsOpts: {
          [presetWebpage as unknown as string]: {
            blocks: ['link-block', 'quote', 'text-basic'],
          },
        },
        colorPicker: {
          appendTo: 'body',
          showInput: true,
        },
        styleManager: {
          appendTo: '#style-panel',
          sectors: [
            {
              name: 'Layout',
              open: true,
              properties: [
                { type: 'select', property: 'display', label: 'Display', options: [{ id: 'block', label: 'Block' }, { id: 'flex', label: 'Flex' }, { id: 'grid', label: 'Grid' }] },
                { type: 'select', property: 'text-align', label: 'Align', options: [{ id: 'left', label: 'Left' }, { id: 'center', label: 'Center' }, { id: 'right', label: 'Right' }] },
              ],
            },
            {
              name: 'Typography',
              open: true,
              properties: [
                { type: 'select', property: 'font-size', label: 'Size', options: [{ id: '12px', label: '12px' }, { id: '14px', label: '14px' }, { id: '16px', label: '16px' }, { id: '18px', label: '18px' }, { id: '24px', label: '24px' }] },
                { type: 'select', property: 'font-weight', label: 'Weight', options: [{ id: '400', label: 'Normal' }, { id: '600', label: 'Semi' }, { id: '700', label: 'Bold' }] },
              ],
            },
            {
              name: 'Decorations',
              open: false,
              properties: [
                { type: 'color', property: 'background-color', label: 'Background' },
                { type: 'color', property: 'color', label: 'Color' },
                { type: 'select', property: 'padding', label: 'Padding', options: [{ id: '0', label: '0' }, { id: '8px', label: '8px' }, { id: '16px', label: '16px' }, { id: '24px', label: '24px' }] },
              ],
            },
          ],
        },
        canvas: { styles: [], scripts: [] },
      });

      if (!mounted) {
        editor.destroy();
        return;
      }

      addCustomBlocks(editor);
      editorInstance.current = editor;

      const blocksPanel = document.getElementById('blocks-panel');
      if (blocksPanel && editor.BlockManager) {
        editor.BlockManager.render();
        const bmEl = (editor.BlockManager as { getContainer?: () => HTMLElement }).getContainer?.();
        if (bmEl) blocksPanel.appendChild(bmEl);
      }

      editor.setComponents(html);
      editor.setStyle(css);

      const um = editor.UndoManager;
      const updateUndoRedo = () => {
        setCanUndo(um ? um.hasUndo() : false);
        setCanRedo(um ? um.hasRedo() : false);
      };
      editor.on('change', updateUndoRedo);
      updateUndoRedo();

      setLoading(false);
      setError(null);
    };

    init();
    return () => {
      mounted = false;
      if (editor) {
        editor.destroy();
        editorInstance.current = null;
      }
    };
  }, [loadTheme]);

  const handleUndo = () => editorInstance.current?.UndoManager?.undo();
  const handleRedo = () => editorInstance.current?.UndoManager?.redo();

  const handleDeviceChange = (deviceId: string) => {
    setCurrentDevice(deviceId);
    editorInstance.current?.setDevice(deviceId);
  };

  const buildFullHtml = useCallback(() => {
    const ed = editorInstance.current;
    if (!ed) return '';
    const html = ed.getHtml();
    const css = ed.getCss();
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body>${html}</body></html>`;
  }, []);

  const handlePreview = () => {
    const fullHtml = buildFullHtml();
    setPreviewHtml(fullHtml);
    setShowPreview(true);
  };

  const handleSave = useCallback(async () => {
    const ed = editorInstance.current;
    if (!ed) return;
    setSaving(true);
    try {
      const html = ed.getHtml();
      const css = ed.getCss();
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body>${html}</body></html>`;

      if (isExistingTheme && themeId) {
        const result = await updateTheme(themeId, themeName, fullHtml, css);
        if (result) setError(null);
      } else {
        const result = await createTheme(themeName, fullHtml, css);
        if (result && result._id) {
          navigate(`/themes/builder?id=${result._id}`, { replace: true });
        }
      }
    } catch (err) {
      setError((err as Error).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [themeName, isExistingTheme, themeId, createTheme, updateTheme]);

  const handlePublish = handleSave; // Publish = Save for now

  if (loading) {
    return (
      <div className="elementor-loading">
        <div className="elementor-loading-spinner" />
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="elementor-root">
      {/* Top bar */}
      <header className="elementor-topbar">
        <div className="elementor-topbar-left">
          <input
            type="text"
            className="elementor-theme-name"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            placeholder="Theme name"
          />
          <div className="elementor-devices">
            {DEVICES.map((d) => (
              <button
                key={d.id}
                className={`elementor-device-btn ${currentDevice === d.id ? 'active' : ''}`}
                onClick={() => handleDeviceChange(d.id)}
                title={d.name}
              >
                {d.icon}
              </button>
            ))}
          </div>
          <div className="elementor-undo-redo">
            <button onClick={handleUndo} disabled={!canUndo} title="Undo">↶</button>
            <button onClick={handleRedo} disabled={!canRedo} title="Redo">↷</button>
          </div>
        </div>
        <div className="elementor-topbar-right">
          {error && <span className="elementor-error">{error}</span>}
          <button className="elementor-btn elementor-btn-preview" onClick={handlePreview}>
            Preview
          </button>
          <button className="elementor-btn elementor-btn-publish" onClick={handlePublish} disabled={saving}>
            {saving ? 'Publishing...' : 'Publish'}
          </button>
          <button className="elementor-btn elementor-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="elementor-main">
        <aside className="elementor-left-panel">
          <div className="elementor-panel-header">Blocks</div>
          <div id="blocks-panel" className="elementor-blocks-panel" />
        </aside>
        <div className="elementor-canvas-wrap">
          <div ref={editorRef} className="elementor-editor" />
        </div>
        <aside className="elementor-right-panel">
          <div className="elementor-panel-header">Styles</div>
          <div ref={stylePanelRef} id="style-panel" className="elementor-style-panel" />
        </aside>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div className="elementor-preview-overlay" onClick={() => setShowPreview(false)}>
          <div className="elementor-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="elementor-preview-header">
              <span>Preview</span>
              <button onClick={() => setShowPreview(false)}>×</button>
            </div>
            <iframe
              srcDoc={previewHtml}
              title="Theme preview"
              sandbox="allow-scripts"
              className="elementor-preview-iframe"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ElementorEditor;
