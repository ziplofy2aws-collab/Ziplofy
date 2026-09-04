'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Users } from 'lucide-react';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { adminContentColumnClass } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';

interface Team {
  _id: string;
  name: string;
  description: string;
  members: { _id: string; name: string; email: string }[];
  createdAt: string;
}

export default function TeamsPage() {
  const { currentWorkspace } = useAuthStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Team | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchTeams = () => {
    if (!currentWorkspace) return;
    api
      .get('/teams')
      .then((r) => setTeams(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeams();
  }, [currentWorkspace]);

  const handleSave = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      if (editItem) {
        await api.put(`/teams/${editItem._id}`, form);
      } else {
        await api.post('/teams', form);
      }
      toast.success(editItem ? 'Updated' : 'Created');
      setShowModal(false);
      setEditItem(null);
      fetchTeams();
    } catch {
      toast.error('Failed');
    } finally { setSubmitting(false); }
  };

  const columns = [
    {
      key: 'name',
      title: 'Team Name',
      render: (t: Team) => (
        <div>
          <span className="font-medium text-admin-text">{t.name}</span>
          {t.description && (
            <p className="mt-0.5 text-[12px] text-admin-text-subdued">{t.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'members',
      title: 'Members',
      render: (t: Team) => (
        <div className="flex items-center gap-1 text-admin-text">
          <Users className="h-4 w-4 text-admin-text-subdued" />
          <span className="text-[13px]">{t.members?.length || 0}</span>
        </div>
      ),
    },
    {
      key: 'created',
      title: 'Created',
      render: (t: Team) => (
        <span className="text-[13px] text-admin-text-secondary">
          {new Date(t.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (t: Team) => (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              setEditItem(t);
              setForm({ name: t.name, description: t.description || '' });
              setShowModal(true);
            }}
            className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('Delete this team?'))
                api.delete(`/teams/${t._id}`).then(() => { fetchTeams(); toast.success('Team deleted'); }).catch(() => toast.error('Delete failed'));
            }}
            className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Organization Teams</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Manage your teams and members
          </p>
        </div>
        <button
          type="button"
          className={primaryBtn}
          onClick={() => {
            setEditItem(null);
            setForm({ name: '', description: '' });
            setShowModal(true);
          }}
        >
          <Plus className="h-4 w-4" /> Create Team
        </button>
      </div>

      <Table columns={columns} data={teams} loading={loading} onBulkDelete={async (ids) => { await Promise.all(ids.map((id) => api.delete(`/teams/${id}`).catch(() => null))); fetchTeams(); }} />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditItem(null);
        }}
        title={editItem ? 'Edit Team' : 'Create Team'}
      >
        <div className="space-y-4">
          <Input
            label="Team Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description"
          />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={handleSave} disabled={submitting} className={primaryBtn}>
              {submitting ? 'Saving…' : editItem ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              className={secondaryBtn}
              onClick={() => {
                setShowModal(false);
                setEditItem(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
