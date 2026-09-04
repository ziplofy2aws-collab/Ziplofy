"use client";
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, BookOpen, Save, X } from "lucide-react";
import { workspaceKbApi } from "@/lib/api";
import toast from "react-hot-toast";
import { adminContentColumnClass, dashboardCardShell } from "@/components/layout/dashboard-ui";

const primaryBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50";
const fieldClass =
  "w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30";

interface KBItem { _id: string; title: string; content: string; category: string; status: string; updatedAt: string; }

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<KBItem | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "general" });

  const load = async () => { try { const r = await workspaceKbApi.list(); setItems(r.data.data || []); } catch { /* */ } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { toast.error("Title and content required"); return; }
    try {
      if (editing) { await workspaceKbApi.update(editing._id, form); } else { await workspaceKbApi.create(form); }
      toast.success(editing ? "Updated" : "Created");
      setShowForm(false); setEditing(null); setForm({ title: "", content: "", category: "general" }); load();
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async (id: string) => { if (!confirm("Delete?")) return; await workspaceKbApi.delete(id); load(); };

  if (loading) {
    return (
      <div className={`${adminContentColumnClass} flex h-64 items-center justify-center`}>
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-admin-text" />
      </div>
    );
  }

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Knowledge Base</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Add business info that AI will use to answer customer queries</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm(true); setEditing(null); setForm({ title: "", content: "", category: "general" }); }}
          className={primaryBtn}
        >
          <Plus className="h-4 w-4" /> Add Article
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={`${dashboardCardShell} space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-admin-text">{editing ? "Edit" : "New"} Knowledge Article</h3>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title (e.g. Pricing, Business Hours, Return Policy)" className={fieldClass} />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={fieldClass}>
            <option value="general">General</option>
            <option value="products">Products</option>
            <option value="pricing">Pricing</option>
            <option value="policies">Policies</option>
            <option value="faq">FAQ</option>
            <option value="support">Support</option>
          </select>
          <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write the knowledge content here. AI will use this to answer customer queries." rows={8} className={fieldClass} />
          <button type="submit" className={primaryBtn}><Save className="h-4 w-4" /> Save</button>
        </form>
      )}

      {items.length === 0 ? (
        <div className={`${dashboardCardShell} py-16 text-center`}>
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-admin-text-subdued" />
          <p className="text-[13px] text-admin-text-secondary">No knowledge articles yet</p>
          <p className="mt-1 text-[12px] text-admin-text-subdued">Add articles about your business so AI can answer customer questions accurately</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map(item => (
            <div key={item._id} className={dashboardCardShell}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-admin-text">{item.title}</h3>
                  <span className="mt-1 inline-block rounded-full border border-admin-border bg-[#f6f6f7] px-2 py-0.5 text-[12px] text-admin-text-secondary">{item.category}</span>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[13px] text-admin-text-secondary">{item.content}</p>
                  <p className="mt-2 text-[12px] text-admin-text-subdued">Updated {new Date(item.updatedAt).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="ml-1 flex gap-1">
                  <button type="button" onClick={() => { setEditing(item); setForm({ title: item.title, content: item.content, category: item.category }); setShowForm(true); }} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"><Edit className="h-4 w-4" /></button>
                  <button type="button" onClick={() => handleDelete(item._id)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
