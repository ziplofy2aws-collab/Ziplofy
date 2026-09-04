'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Package, Image, RefreshCw, Link2, Share2, Search, X, Upload } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/authStore';
import api, { catalogApi, contactApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-50';
const cardClass = `${dashboardCardShell} overflow-hidden !p-0`;
const inputClass =
  'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30';
const labelClass = 'mb-1 block text-[12px] font-medium text-admin-text-secondary';
const modalOverlayClass =
  'fixed inset-0 z-[1300] flex items-center justify-center p-4 sm:p-6';
const modalPanelClass =
  'relative z-10 flex max-h-[min(90vh,880px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)]';
const emptyForm = { name: '', description: '', price: '', currency: 'INR', category: '', imageUrl: '', sku: '', stock: '' };

interface Product {
  _id: string; name: string; description: string; price: number; currency: string;
  category: string; imageUrl: string; images?: string[]; status: string; sku: string; stock: number;
}

interface ShareContact { _id: string; name: string; phone: string }

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function CatalogsPage() {
  const { currentWorkspace } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [shareProduct, setShareProduct] = useState<Product | 'catalog' | null>(null);
  const [shareContacts, setShareContacts] = useState<ShareContact[]>([]);
  const [shareSearch, setShareSearch] = useState('');
  const [sharing, setSharing] = useState('');
  const [mounted, setMounted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const closeProductModal = () => setShowModal(false);

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const publicLink = currentWorkspace ? `${typeof window !== 'undefined' ? window.location.origin : ''}/catalog/${currentWorkspace._id}` : '';

  const fetch = () => {
    if (!currentWorkspace) return;
    catalogApi.getProducts().then(r => setProducts(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, [currentWorkspace]);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(publicLink); toast.success('Catalogue link copied'); }
    catch { toast.error('Copy failed'); }
  };

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const r = await catalogApi.sync();
      toast.success(r.data.data?.message || `Synced ${r.data.data?.synced ?? ''} product(s) to WhatsApp`);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Sync failed');
    }
    setSyncing(false);
  };

  const openShare = (target: Product | 'catalog') => {
    setShareProduct(target);
    setShareSearch('');
    contactApi.list({ limit: 30 }).then(r => setShareContacts(r.data.data || [])).catch(() => setShareContacts([]));
  };

  const searchShareContacts = (q: string) => {
    setShareSearch(q);
    contactApi.list({ limit: 30, search: q }).then(r => setShareContacts(r.data.data || [])).catch(() => {});
  };

  const doShare = async (contactId: string) => {
    if (sharing || !shareProduct) return;
    setSharing(contactId);
    try {
      await catalogApi.share({ contactId, productId: shareProduct === 'catalog' ? undefined : shareProduct._id });
      toast.success('Sent on WhatsApp');
      setShareProduct(null);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to send');
    }
    setSharing('');
  };

  const handleSave = async () => {
    if (submitting) return;
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.price.trim()) { toast.error('Price is required'); return; }
    setSubmitting(true);

    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), images: form.imageUrl ? [form.imageUrl] : [] };
      if (editItem) await catalogApi.updateProduct(editItem._id, payload);
      else await catalogApi.createProduct(payload);
      toast.success(editItem ? 'Updated' : 'Created');
      closeProductModal();
      fetch();
    } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'products');
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        setForm(prev => ({ ...prev, imageUrl: res.data.data.url }));
        toast.success('Image uploaded');
      } else {
        toast.error(res.data.message || 'Upload failed');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Product Catalogue</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            {products.length} products
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={secondaryBtn} onClick={copyLink}>
            <Link2 className="h-4 w-4" />
            Copy Link
          </button>
          <button type="button" className={secondaryBtn} onClick={() => openShare('catalog')}>
            <Share2 className="h-4 w-4" />
            Share Catalogue
          </button>
          <button type="button" className={secondaryBtn} disabled={syncing} onClick={handleSync}>
            {syncing ? <Spinner /> : <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />}
            Sync to WhatsApp
          </button>
          <button
            type="button"
            className={primaryBtn}
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[13px] text-admin-text-subdued">Loading...</div>
      ) : products.length === 0 ? (
        <div className={`${dashboardCardShell} !p-5`}>
          <div className="py-12 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-admin-text-subdued/40" />
            <h3 className="mb-2 text-[15px] font-semibold text-admin-text">No products yet</h3>
            <p className="mb-4 text-[13px] text-admin-text-secondary">Add products to your catalogue to share via WhatsApp</p>
            <button type="button" className={primaryBtn} onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map(p => (
            <div key={p._id} className={cardClass}>
              <div className="flex aspect-square items-center justify-center bg-[#f6f6f7]">
                {(p.imageUrl || p.images?.[0]) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl || p.images?.[0]} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <Image className="h-12 w-12 text-admin-text-subdued/50" />
                )}
              </div>
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 text-[13px] font-medium text-admin-text">{p.name}</h3>
                  <Badge variant={p.status === 'active' ? 'success' : 'warning'} className="text-xs">{p.status}</Badge>
                </div>
                <p className="mb-2 line-clamp-2 text-[12px] text-admin-text-secondary">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold tabular-nums text-admin-text">₹{p.price}</span>
                  <span className="text-[12px] text-admin-text-subdued">Stock: {p.stock}</span>
                </div>
                <div className="mt-3 flex gap-1">
                  <button
                    type="button"
                    onClick={() => { setEditItem(p); setForm({ name: p.name, description: p.description, price: String(p.price), currency: p.currency, category: p.category, imageUrl: p.imageUrl || p.images?.[0] || '', sku: p.sku, stock: String(p.stock) }); setShowModal(true); }}
                    className="flex-1 rounded-lg border border-admin-border bg-white py-1.5 text-center text-[12px] font-medium text-admin-text hover:bg-[#f6f6f7]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openShare(p)}
                    className="inline-flex items-center gap-1 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[12px] font-medium text-admin-text hover:bg-[#f6f6f7]"
                  >
                    <Share2 className="h-3.5 w-3.5" />Share
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (confirm('Delete?')) catalogApi.deleteProduct(p._id).then(() => { fetch(); toast.success('Product deleted'); }).catch(() => toast.error('Delete failed')); }}
                    className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && mounted && createPortal(
        <div className={modalOverlayClass}>
          <div className="absolute inset-0 bg-black/45" onClick={closeProductModal} />
          <div
            className={modalPanelClass}
            role="dialog"
            aria-modal="true"
            aria-label={editItem ? 'Edit product' : 'Add product'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-admin-border px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h3 className="text-[16px] font-semibold tracking-tight text-admin-text">
                  {editItem ? 'Edit product' : 'Add product'}
                </h3>
                <p className="mt-0.5 text-[12px] text-admin-text-secondary">
                  Fill in product details to share via WhatsApp catalogue.
                </p>
              </div>
              <button
                type="button"
                onClick={closeProductModal}
                className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Product name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Cotton T-Shirt"
                  />
                </div>
                <div>
                  <label className={labelClass}>SKU</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className={inputClass}
                    placeholder="SKU-001"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder="Short product description"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Price *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputClass}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClass}>Currency</label>
                  <input
                    type="text"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className={inputClass}
                    placeholder="INR"
                  />
                </div>
                <div>
                  <label className={labelClass}>Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className={inputClass}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Apparel"
                />
              </div>

              <div className="space-y-2 rounded-lg border border-admin-border bg-[#fafafa] p-4">
                <label className={labelClass}>Product image</label>
                <p className="text-[11px] text-admin-text-subdued">Recommended: 600×600px square JPG/PNG</p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    className={`${inputClass} min-w-[200px] flex-1`}
                    placeholder="https://… or upload a file"
                  />
                  <button type="button" className={secondaryBtn} disabled={uploading} onClick={() => fileRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  {form.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600"
                      title="Clear image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {form.imageUrl ? (
                  <div className="mt-2 overflow-hidden rounded-lg border border-admin-border bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.imageUrl} alt="Product preview" className="h-40 w-full object-contain" />
                  </div>
                ) : (
                  <div className="mt-2 flex h-28 items-center justify-center rounded-lg border border-dashed border-admin-border bg-white text-admin-text-subdued">
                    <Image className="h-8 w-8 opacity-40" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-admin-border bg-[#fafafa] px-5 py-3.5 sm:px-6">
              <button type="button" className={secondaryBtn} onClick={closeProductModal}>Cancel</button>
              <button type="button" className={primaryBtn} disabled={submitting || uploading} onClick={handleSave}>
                {submitting ? <Spinner /> : null}
                {submitting ? 'Saving...' : editItem ? 'Update product' : 'Create product'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <Modal isOpen={!!shareProduct} onClose={() => setShareProduct(null)} title={shareProduct && shareProduct !== 'catalog' ? `Share "${shareProduct.name}"` : 'Share Catalogue'} size="md">
        <div className="space-y-3">
          <p className="text-[13px] text-admin-text-secondary">
            Pick a contact — the {shareProduct === 'catalog' ? 'catalogue link' : 'product'} will be sent to them on WhatsApp.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-admin-border bg-[#f6f6f7] px-2 py-1.5 text-[12px] text-admin-text-secondary">
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{publicLink}</span>
            <button type="button" onClick={copyLink} className="ml-auto shrink-0 text-[12px] font-semibold text-[#005bd3] hover:underline">Copy</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-subdued" />
            <input
              value={shareSearch}
              onChange={e => searchShareContacts(e.target.value)}
              placeholder="Search contacts..."
              className="w-full rounded-lg border border-admin-border bg-white py-2 pl-10 pr-4 text-[13px] text-admin-text focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30"
            />
          </div>
          <div className="max-h-72 divide-y divide-admin-border overflow-y-auto rounded-lg border border-admin-border">
            {shareContacts.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-admin-text-subdued">No contacts found</p>
            ) : shareContacts.map(c => (
              <div key={c._id} className="flex items-center justify-between px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-admin-text">{c.name || c.phone}</p>
                  <p className="text-[12px] text-admin-text-secondary">{c.phone}</p>
                </div>
                <button
                  type="button"
                  className={`${secondaryBtn} !px-3 !py-1 text-xs`}
                  disabled={sharing === c._id}
                  onClick={() => doShare(c._id)}
                >
                  {sharing === c._id ? <Spinner /> : null}
                  Send
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
