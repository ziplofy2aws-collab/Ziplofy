'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  FormInput,
  Home,
  Newspaper,
  PenSquare,
  Search,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminListSearchInputClass } from '@/components/admin-list-ui';
import { formApi } from '@/lib/api';
import { buildLeadGenFormPublicUrl } from '@/lib/lead-gen-form-url';
import { storeBlogApi } from '@/lib/store-blog';
import type { MenuItemLinkType } from '@/lib/store-menu';
import type { MenuItemDraft } from '@/lib/store-menu-draft';
import { storePageApi } from '@/lib/store-page';

type LinkPickerSelection = {
  link: string;
  label?: string;
  linkType?: MenuItemLinkType;
  pageId?: string;
  blogId?: string;
  blogPostId?: string;
  formId?: string;
};

type PickerView = 'root' | 'pages' | 'blogs' | 'blog-posts' | 'forms';

const ROOT_OPTIONS = [
  { id: 'home', label: 'Home page', linkType: 'homepage' as const, link: '/', icon: Home },
  { id: 'search', label: 'Search', linkType: 'search' as const, link: '/search', icon: Search },
  { id: 'pages', label: 'Pages', view: 'pages' as const, icon: FileText, hasChildren: true },
  { id: 'forms', label: 'Forms', view: 'forms' as const, icon: FormInput, hasChildren: true },
  { id: 'blogs-all', label: 'All blogs', linkType: 'all-blogs' as const, link: '/blogs', icon: PenSquare },
  { id: 'blogs', label: 'Blogs', view: 'blogs' as const, icon: PenSquare, hasChildren: true },
  { id: 'blog-posts', label: 'Blog posts', view: 'blog-posts' as const, icon: Newspaper, hasChildren: true },
];

const LINK_PICKER_Z_INDEX = 2200;

function computeLinkPickerStyle(anchor: DOMRect): CSSProperties {
  const margin = 8;
  const maxPanelHeight = 320;
  const width = Math.max(anchor.width, 280);
  const left = Math.max(margin, Math.min(anchor.left, window.innerWidth - width - margin));
  const spaceBelow = window.innerHeight - anchor.bottom - margin;
  const spaceAbove = anchor.top - margin;

  if (spaceBelow >= 160 || spaceBelow >= spaceAbove) {
    return {
      position: 'fixed',
      left,
      top: anchor.bottom + 4,
      width,
      maxHeight: Math.min(maxPanelHeight, Math.max(spaceBelow - 4, 120)),
      zIndex: LINK_PICKER_Z_INDEX,
    };
  }

  const maxHeight = Math.min(maxPanelHeight, Math.max(spaceAbove - 4, 120));
  return {
    position: 'fixed',
    left,
    top: Math.max(margin, anchor.top - maxHeight - 4),
    width,
    maxHeight,
    zIndex: LINK_PICKER_Z_INDEX,
  };
}

function MenuLinkPicker({
  open,
  anchorRect,
  anchorRef,
  storeId,
  searchQuery,
  onSelect,
  onClose,
}: {
  open: boolean;
  anchorRect: DOMRect | null;
  anchorRef: React.RefObject<HTMLElement | null>;
  storeId: string | null;
  searchQuery: string;
  onSelect: (selection: LinkPickerSelection) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<PickerView>('root');
  const [pages, setPages] = useState<Array<{ _id: string; title: string; urlHandle: string }>>([]);
  const [blogs, setBlogs] = useState<Array<{ _id: string; title: string; urlHandle: string }>>([]);
  const [posts, setPosts] = useState<Array<{ _id: string; title: string; urlHandle: string }>>([]);
  const [forms, setForms] = useState<Array<{ _id: string; name: string; status?: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) setView('root');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, onClose, anchorRef]);

  const loadPages = useCallback(async () => {
    if (!storeId) {
      toast.error('Select a store first');
      return;
    }
    setLoading(true);
    try {
      const res = await storePageApi.listPages(storeId);
      setPages(res.data?.success && Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const loadBlogs = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await storeBlogApi.listBlogs(storeId);
      setBlogs(res.data?.success && Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const loadPosts = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await storeBlogApi.listPosts(storeId);
      setPosts(res.data?.success && Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const loadForms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await formApi.list();
      const rows = res.data?.data || [];
      setForms(Array.isArray(rows) ? rows.filter((f) => f.status !== 'inactive') : []);
    } catch {
      toast.error('Failed to load forms');
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const filteredPages = useMemo(() => {
    if (!q) return pages;
    return pages.filter((p) => p.title.toLowerCase().includes(q) || p.urlHandle.toLowerCase().includes(q));
  }, [pages, q]);
  const filteredBlogs = useMemo(() => {
    if (!q) return blogs;
    return blogs.filter((b) => b.title.toLowerCase().includes(q) || b.urlHandle.toLowerCase().includes(q));
  }, [blogs, q]);
  const filteredPosts = useMemo(() => {
    if (!q) return posts;
    return posts.filter((p) => p.title.toLowerCase().includes(q) || p.urlHandle.toLowerCase().includes(q));
  }, [posts, q]);
  const filteredForms = useMemo(() => {
    if (!q) return forms;
    return forms.filter((f) => f.name.toLowerCase().includes(q));
  }, [forms, q]);

  const pickAndClose = (selection: LinkPickerSelection) => {
    onSelect(selection);
    onClose();
    setView('root');
  };

  if (!open || !anchorRect || typeof document === 'undefined') return null;

  const panel = (
    <div
      ref={panelRef}
      style={computeLinkPickerStyle(anchorRect)}
      className="overflow-y-auto rounded-xl border border-admin-border bg-white py-1 shadow-lg"
      role="listbox"
      aria-label="Choose a link"
    >
      {view !== 'root' ? (
        <>
          <div className="flex items-center gap-2 border-b border-admin-border px-2 py-2">
            <button type="button" onClick={() => setView('root')} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-medium hover:bg-[#f6f6f7]">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
          {loading ? (
            <p className="px-3 py-4 text-center text-[13px] text-admin-text-secondary">Loading…</p>
          ) : view === 'pages' ? (
            filteredPages.length === 0 ? (
              <p className="px-3 py-4 text-center text-[13px] text-admin-text-secondary">No pages found</p>
            ) : (
              filteredPages.map((page) => (
                <button
                  key={page._id}
                  type="button"
                  onClick={() =>
                    pickAndClose({ link: `/${page.urlHandle}`, label: page.title, linkType: 'specific-page', pageId: page._id })
                  }
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] hover:bg-[#f6f6f7]"
                >
                  <FileText className="h-4 w-4 shrink-0 text-admin-text-secondary" />
                  <span className="min-w-0 flex-1 truncate">{page.title}</span>
                </button>
              ))
            )
          ) : view === 'blogs' ? (
            filteredBlogs.length === 0 ? (
              <p className="px-3 py-4 text-center text-[13px] text-admin-text-secondary">No blogs found</p>
            ) : (
              filteredBlogs.map((blog) => (
                <button
                  key={blog._id}
                  type="button"
                  onClick={() =>
                    pickAndClose({ link: `/blogs/${blog.urlHandle}`, label: blog.title, linkType: 'specific-blog', blogId: blog._id })
                  }
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] hover:bg-[#f6f6f7]"
                >
                  <PenSquare className="h-4 w-4 shrink-0 text-admin-text-secondary" />
                  <span className="min-w-0 flex-1 truncate">{blog.title}</span>
                </button>
              ))
            )
          ) : view === 'forms' ? (
            filteredForms.length === 0 ? (
              <p className="px-3 py-4 text-center text-[13px] text-admin-text-secondary">
                {loading ? 'Loading…' : 'No lead gen forms found'}
              </p>
            ) : (
              filteredForms.map((form) => (
                <button
                  key={form._id}
                  type="button"
                  onClick={() =>
                    pickAndClose({
                      link: buildLeadGenFormPublicUrl(form._id),
                      label: form.name,
                      linkType: 'lead-gen-form',
                      formId: form._id,
                    })
                  }
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] hover:bg-[#f6f6f7]"
                >
                  <FormInput className="h-4 w-4 shrink-0 text-admin-text-secondary" />
                  <span className="min-w-0 flex-1 truncate">{form.name}</span>
                </button>
              ))
            )
          ) : filteredPosts.length === 0 ? (
            <p className="px-3 py-4 text-center text-[13px] text-admin-text-secondary">No blog posts found</p>
          ) : (
            filteredPosts.map((post) => (
              <button
                key={post._id}
                type="button"
                onClick={() =>
                  pickAndClose({ link: `/blog/${post.urlHandle}`, label: post.title, linkType: 'specific-blog-post', blogPostId: post._id })
                }
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] hover:bg-[#f6f6f7]"
              >
                <Newspaper className="h-4 w-4 shrink-0 text-admin-text-secondary" />
                <span className="min-w-0 flex-1 truncate">{post.title}</span>
              </button>
            ))
          )}
        </>
      ) : (
        <div className="py-1">
          <p className="px-3 py-1.5 text-[12px] font-semibold text-admin-text-secondary">Online store</p>
          {ROOT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  if (opt.hasChildren && opt.view === 'pages') {
                    setView('pages');
                    void loadPages();
                    return;
                  }
                  if (opt.hasChildren && opt.view === 'blogs') {
                    setView('blogs');
                    void loadBlogs();
                    return;
                  }
                  if (opt.hasChildren && opt.view === 'blog-posts') {
                    setView('blog-posts');
                    void loadPosts();
                    return;
                  }
                  if (opt.hasChildren && opt.view === 'forms') {
                    setView('forms');
                    void loadForms();
                    return;
                  }
                  if (opt.linkType) pickAndClose({ link: opt.link, label: opt.label, linkType: opt.linkType });
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] hover:bg-[#f6f6f7]"
              >
                <Icon className="h-4 w-4 shrink-0 text-admin-text-secondary" />
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                {opt.hasChildren ? <ChevronRight className="h-4 w-4 shrink-0 text-admin-text-subdued" /> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return createPortal(panel, document.body);
}

export function MenuItemRow({
  item,
  storeId,
  onChange,
  onRemove,
}: {
  item: MenuItemDraft;
  storeId: string | null;
  onChange: (patch: Partial<MenuItemDraft>) => void;
  onRemove: () => void;
}) {
  const linkAnchorRef = useRef<HTMLDivElement>(null);
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const fieldLabel = 'mb-1.5 block text-[12px] font-medium text-admin-text-secondary';

  const openLinkPicker = useCallback(() => {
    setAnchorRect(linkAnchorRef.current?.getBoundingClientRect() ?? null);
    setLinkPickerOpen(true);
  }, []);

  const closeLinkPicker = useCallback(() => {
    setLinkPickerOpen(false);
    setAnchorRect(null);
  }, []);

  useEffect(() => {
    if (!linkPickerOpen) return;
    const updateAnchor = () => {
      setAnchorRect(linkAnchorRef.current?.getBoundingClientRect() ?? null);
    };
    updateAnchor();
    window.addEventListener('scroll', updateAnchor, true);
    window.addEventListener('resize', updateAnchor);
    return () => {
      window.removeEventListener('scroll', updateAnchor, true);
      window.removeEventListener('resize', updateAnchor);
    };
  }, [linkPickerOpen]);

  return (
    <div className="rounded-xl border border-admin-border bg-white p-3">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={fieldLabel}>Label</label>
            <input
              type="text"
              value={item.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder="e.g., About us"
              className={adminListSearchInputClass}
            />
          </div>
          <div ref={linkAnchorRef}>
            <label className={fieldLabel}>Link</label>
            <input
              type="text"
              value={item.linkLabel ?? item.link}
              onChange={(e) =>
                onChange({
                  link: e.target.value,
                  linkLabel: undefined,
                  linkType: e.target.value.trim() ? 'custom' : undefined,
                  pageId: undefined,
                  blogId: undefined,
                  blogPostId: undefined,
                  formId: undefined,
                })
              }
              onFocus={openLinkPicker}
              placeholder="Search or paste link"
              className={adminListSearchInputClass}
            />
            <MenuLinkPicker
              open={linkPickerOpen}
              anchorRect={anchorRect}
              anchorRef={linkAnchorRef}
              storeId={storeId}
              searchQuery={item.linkLabel ?? item.link}
              onClose={closeLinkPicker}
              onSelect={({ link, label, linkType, pageId, blogId, blogPostId, formId }) => {
                onChange({
                  link,
                  linkLabel: label,
                  linkType,
                  pageId,
                  blogId,
                  blogPostId,
                  formId,
                  ...(!item.label.trim() && label ? { label } : {}),
                });
              }}
            />
          </div>
        </div>
        <div className="mt-6 shrink-0">
          <button type="button" onClick={onRemove} className="rounded-lg p-2 text-admin-text-secondary hover:bg-[#f6f6f7] hover:text-red-600" aria-label="Remove">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
