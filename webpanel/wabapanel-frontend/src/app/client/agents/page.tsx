'use client';
import React, { useState, useEffect } from 'react';
import { Trash2, Users, UserPlus, ShieldCheck, LogIn } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { teamApi } from '@/lib/api';
import { PERMISSION_TREE } from '@/components/layout/ClientSidebar';
import { ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7] disabled:opacity-50';
const iconBtn =
  'rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text';
const iconBtnDanger =
  'rounded-lg p-1.5 text-admin-text-subdued hover:bg-red-50 hover:text-red-600';

interface Agent { _id: string; name: string; email: string; phone?: string; role: string; status: string; avatar?: string; lastActive?: string; conversationsHandled?: number; permissions?: string[]; allowedChannels?: string[]; inboxScope?: string; }

// Expandable permission tree: check a section to grant the whole menu, or expand
// it to grant only specific sub-pages.
function PermTree({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState<string[]>([]);
  const toggleModule = (key: string) => {
    if (value.includes(key)) onChange(value.filter(x => x !== key));
    else {
      const childHrefs = (PERMISSION_TREE.find(s => s.moduleKey === key)?.children || []).map(c => c.href);
      onChange([...value.filter(x => !childHrefs.includes(x) && x !== key), key]);
    }
  };
  const toggleChild = (href: string) =>
    onChange(value.includes(href) ? value.filter(x => x !== href) : [...value, href]);
  return (
    <div className="space-y-1">
      {PERMISSION_TREE.map(sec => {
        const secChecked = value.includes(sec.moduleKey);
        const childGranted = sec.children.some(c => value.includes(c.href));
        const expanded = open.includes(sec.label);
        return (
          <div key={sec.label} className="rounded-lg border border-admin-border bg-white">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <input type="checkbox" checked={secChecked}
                ref={el => { if (el) el.indeterminate = !secChecked && childGranted; }}
                className="h-3.5 w-3.5 accent-neutral-900" onChange={() => toggleModule(sec.moduleKey)} />
              <span className="flex-1 cursor-pointer text-[12px] text-admin-text" onClick={() => toggleModule(sec.moduleKey)}>{sec.label}</span>
              {sec.children.length > 0 && (
                <button type="button" onClick={() => setOpen(o => o.includes(sec.label) ? o.filter(x => x !== sec.label) : [...o, sec.label])}
                  className="rounded p-0.5 text-admin-text-subdued hover:text-admin-text">
                  {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
            {expanded && sec.children.length > 0 && (
              <div className="grid grid-cols-1 gap-1 pb-2 pl-7 pr-2">
                {sec.children.map(c => (
                  <label key={c.href} className="flex cursor-pointer items-center gap-2 text-[11px] text-admin-text-secondary">
                    <input type="checkbox" checked={secChecked || value.includes(c.href)} disabled={secChecked}
                      className="h-3 w-3 accent-neutral-900" onChange={() => toggleChild(c.href)} />
                    {c.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const CHANNEL_OPTIONS = [
  { key: 'whatsapp', label: 'WhatsApp (Cloud API)' },
  { key: 'whatsapp_qr', label: 'WhatsApp (QR)' },
  { key: 'facebook', label: 'Facebook Messenger' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'telegram', label: 'Telegram Bot' },
  { key: 'telegram_personal', label: 'Telegram Personal' },
  { key: 'email', label: 'Email' },
];

interface Perf { _id: string; name: string; email: string; role: string; assignedChats: number; resolvedChats: number; messagesSent: number; avgResponseMins: number | null; }
interface Team { _id: string; name: string; members: Agent[]; description?: string; }

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [perf, setPerf] = useState<Perf[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [agentForm, setAgentForm] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [agentPerms, setAgentPerms] = useState<string[]>([]);
  const [agentChans, setAgentChans] = useState<string[]>([]);
  const [agentScope, setAgentScope] = useState<string>('all');
  const [permAgent, setPermAgent] = useState<Agent | null>(null);
  const [permEdit, setPermEdit] = useState<string[]>([]);
  const [chanEdit, setChanEdit] = useState<string[]>([]);
  const [scopeEdit, setScopeEdit] = useState<string>('all');
  const [teamForm, setTeamForm] = useState({ name: '', description: '', members: [] as string[] });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([teamApi.listAgents(), teamApi.list()]).then(([agRes, tmRes]) => {
      setAgents(agRes.data.data || []);
      setTeams(tmRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
    teamApi.performance().then(r => setPerf(r.data.data || [])).catch(() => {});
  }, []);

  const handleAddAgent = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      await teamApi.addAgent({ ...agentForm, permissions: agentPerms, allowedChannels: agentChans, inboxScope: agentScope });
      toast.success('Agent added');
      setShowAgentModal(false);
      setAgentForm({ name: '', email: '', password: '', role: 'agent' });
      setAgentPerms([]); setAgentChans([]); setAgentScope('all');
      teamApi.listAgents().then(r => setAgents(r.data.data || []));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTeam = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await teamApi.create(teamForm);
      toast.success('Team created');
      setShowTeamModal(false);
      teamApi.list().then(r => setTeams(r.data.data || []));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', title: 'Agent', render: (a: Agent) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f6f6f7] text-[13px] font-semibold text-admin-text">{a.name?.charAt(0)}</div>
        <div>
          <p className="text-[13px] font-medium text-admin-text">{a.name}</p>
          <p className="text-[12px] text-admin-text-subdued">{a.email}</p>
        </div>
      </div>
    )},
    { key: 'role', title: 'Role', render: (a: Agent) => <Badge variant={a.role === 'admin' ? 'info' : 'default'}>{a.role}</Badge> },
    { key: 'status', title: 'Status', render: (a: Agent) => (
      <Badge variant={a.status === 'active' ? 'success' : 'default'}>{a.status || 'active'}</Badge>
    )},
    { key: 'conversations', title: 'Conversations', render: (a: Agent) => <span className="text-[13px] text-admin-text">{a.conversationsHandled || 0}</span> },
    { key: 'permissions', title: 'Access', render: (a: Agent) => (
      <span className="text-[12px] text-admin-text-secondary">{(a.permissions?.length || 0) > 0 ? `${a.permissions!.length} modules` : 'Full access'}</span>
    )},
    { key: 'actions', title: '', render: (a: Agent) => (
      <div className="flex gap-1">
        <button type="button" title="Permissions — control which modules this agent can access" onClick={() => { setPermAgent(a); setPermEdit(a.permissions || []); setChanEdit(a.allowedChannels || []); setScopeEdit(a.inboxScope || 'all'); }}
          className={iconBtn}><ShieldCheck className="h-4 w-4" /></button>
        <button type="button" title="Login as this agent" onClick={async () => {
          try {
            const res = await teamApi.loginAsAgent(a._id);
            const { token, user } = res.data.data;
            window.open(`/auth/login?token=${token}&name=${encodeURIComponent(user.name)}`, '_blank');
            toast.success(`Logged in as ${a.name}`);
          } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to login as agent');
          }
        }} className={iconBtn}><LogIn className="h-4 w-4" /></button>
        <button type="button" onClick={async () => {
          if (!confirm('Delete this agent account? They will no longer be able to log in.')) return;
          try {
            await teamApi.removeAgent(a._id);
            toast.success('Agent deleted');
            teamApi.listAgents().then(r => setAgents(r.data.data || []));
          } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to delete agent');
          }
        }}
          className={iconBtnDanger}><Trash2 className="h-4 w-4" /></button>
      </div>
    )},
  ];

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Agents & Teams</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Manage team members</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={secondaryBtn} onClick={() => setShowTeamModal(true)}>
            <Users className="h-4 w-4" />
            New Team
          </button>
          <button type="button" className={primaryBtn} onClick={() => { setAgentForm({ name: '', email: '', password: '', role: 'agent' }); setAgentPerms([]); setAgentChans([]); setAgentScope('all'); setShowAgentModal(true); }}>
            <UserPlus className="h-4 w-4" />
            Add Agent
          </button>
        </div>
      </div>

      {/* Teams */}
      {teams.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {teams.map(team => (
            <div key={team._id} className={dashboardCardShell}>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f6f7]">
                  <Users className="h-5 w-5 text-admin-text-secondary" />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-admin-text">{team.name}</h3>
                  <p className="text-[12px] text-admin-text-secondary">{team.members?.length || 0} members</p>
                </div>
              </div>
              <div className="flex -space-x-2">
                {(team.members || []).slice(0, 5).map((m, i) => (
                  <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#f6f6f7] text-[11px] font-medium text-admin-text">{m.name?.charAt(0)}</div>
                ))}
                {(team.members?.length || 0) > 5 && <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white text-[11px] text-admin-text-secondary">+{team.members.length - 5}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agents Table */}
      <div className={dashboardCardShell}>
        <h3 className="mb-4 text-[15px] font-semibold text-admin-text">All Agents</h3>
        <Table columns={columns} data={agents} loading={loading} emptyText="No agents added yet" />
      </div>

      {/* Agent Performance */}
      <div className={dashboardCardShell}>
        <h3 className="mb-1 text-[15px] font-semibold text-admin-text">Agent Performance</h3>
        <p className="mb-4 text-[12px] text-admin-text-subdued">Last 30 days — assigned chats, resolved chats, messages sent, and average reply time</p>
        <Table
          columns={[
            { key: 'name', title: 'Agent', render: (p: Perf) => (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f6f6f7] text-[11px] font-semibold text-admin-text">{p.name?.charAt(0)}</div>
                <span className="text-[13px] font-medium text-admin-text">{p.name}</span>
              </div>
            )},
            { key: 'assignedChats', title: 'Assigned Chats', render: (p: Perf) => <span className="text-[13px] text-admin-text">{p.assignedChats}</span> },
            { key: 'resolvedChats', title: 'Resolved (30d)', render: (p: Perf) => <span className="text-[13px] text-admin-text">{p.resolvedChats}</span> },
            { key: 'messagesSent', title: 'Messages Sent (30d)', render: (p: Perf) => <span className="text-[13px] text-admin-text">{p.messagesSent}</span> },
            { key: 'avgResponseMins', title: 'Avg Reply Time', render: (p: Perf) => <span className="text-[13px] text-admin-text">{p.avgResponseMins == null ? '—' : p.avgResponseMins < 60 ? `${p.avgResponseMins} min` : `${Math.round(p.avgResponseMins / 6) / 10} hr`}</span> },
          ]}
          data={perf}
          loading={loading}
          emptyText="No agent activity yet"
        />
      </div>

      {/* Add Agent Modal */}
      <Modal isOpen={showAgentModal} onClose={() => setShowAgentModal(false)} title="Add Agent">
        <div className="space-y-4">
          <Input label="Name" value={agentForm.name} onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })} required />
          <Input label="Email" type="email" value={agentForm.email} onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })} required />
          <Input label="Password" type="password" value={agentForm.password} onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })} required />
          {agentForm.role === 'agent' && (
            <div className="rounded-lg border border-admin-border bg-[#f6f6f7]/40 p-3">
              <p className="mb-1 text-[12px] font-medium text-admin-text">Module Access (optional)</p>
              <p className="mb-2 text-[11px] text-admin-text-subdued">Tick a menu for full access, or expand it (›) to allow only specific sub-pages. Leave all unchecked for full access.</p>
              <div className="max-h-72 overflow-y-auto pr-1">
                <PermTree value={agentPerms} onChange={setAgentPerms} />
              </div>
            </div>
          )}
          {agentForm.role === 'agent' && (
            <div>
              <p className="mb-1 text-[13px] font-medium text-admin-text">Channels this agent can see</p>
              <p className="mb-2 text-[12px] text-admin-text-subdued">Leave all unchecked to allow every channel.</p>
              <div className="grid grid-cols-2 gap-2">
                {CHANNEL_OPTIONS.map(c => (
                  <label key={c.key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-admin-border px-3 py-2 text-[13px] text-admin-text hover:bg-[#f6f6f7]">
                    <input type="checkbox" checked={agentChans.includes(c.key)} className="h-4 w-4 accent-neutral-900"
                      onChange={() => setAgentChans(p => p.includes(c.key) ? p.filter(x => x !== c.key) : [...p, c.key])} />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
          )}
          {agentForm.role === 'agent' && (
            <Select label="Chat visibility" value={agentScope} onChange={(e) => setAgentScope(e.target.value)}
              options={[{ value: 'all', label: 'All chats' }, { value: 'assigned', label: 'Only chats assigned to this agent' }]} />
          )}
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" className={secondaryBtn} onClick={() => setShowAgentModal(false)}>Cancel</button>
            <button type="button" className={primaryBtn} disabled={submitting} onClick={handleAddAgent}>Add Agent</button>
          </div>
        </div>
      </Modal>

      {/* Agent Permissions Modal */}
      <Modal isOpen={!!permAgent} onClose={() => setPermAgent(null)} title={`Permissions — ${permAgent?.name || ''}`}>
        <div className="space-y-4">
          <p className="text-[13px] text-admin-text-secondary">Tick a menu for full access, or expand it (›) to allow only specific sub-pages. If nothing is selected, the agent has full access to all modules.</p>
          <div className="max-h-72 overflow-y-auto pr-1">
            <PermTree value={permEdit} onChange={setPermEdit} />
          </div>
          <div>
            <p className="mb-1 text-[13px] font-medium text-admin-text">Channels this agent can see</p>
            <p className="mb-2 text-[12px] text-admin-text-subdued">Leave all unchecked to allow every channel.</p>
            <div className="grid grid-cols-2 gap-2">
              {CHANNEL_OPTIONS.map(c => (
                <label key={c.key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-admin-border px-3 py-2 text-[13px] text-admin-text hover:bg-[#f6f6f7]">
                  <input type="checkbox" checked={chanEdit.includes(c.key)} className="h-4 w-4 accent-neutral-900"
                    onChange={() => setChanEdit(p => p.includes(c.key) ? p.filter(x => x !== c.key) : [...p, c.key])} />
                  {c.label}
                </label>
              ))}
            </div>
          </div>
          <Select label="Chat visibility" value={scopeEdit} onChange={(e) => setScopeEdit(e.target.value)}
            options={[{ value: 'all', label: 'All chats' }, { value: 'assigned', label: 'Only chats assigned to this agent' }]} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={secondaryBtn} onClick={() => setPermAgent(null)}>Cancel</button>
            <button type="button" className={primaryBtn} onClick={async () => {
              if (!permAgent) return;
              try {
                await teamApi.updateAgent(permAgent._id, { permissions: permEdit, allowedChannels: chanEdit, inboxScope: scopeEdit });
                toast.success('Permissions updated — the agent will see the changes on next login or page refresh');
                setPermAgent(null);
                teamApi.listAgents().then(r => setAgents(r.data.data || []));
              } catch { toast.error('Failed to update permissions'); }
            }}>Save Permissions</button>
          </div>
        </div>
      </Modal>

      {/* Create Team Modal */}
      <Modal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)} title="Create Team">
        <div className="space-y-4">
          <Input label="Team Name" value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} required />
          <Input label="Description" value={teamForm.description} onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })} />
          {agents.length > 0 && (
            <div>
              <label className="mb-2 block text-[13px] font-medium text-admin-text">Select Members</label>
              <div className="flex flex-wrap gap-2">
                {agents.map(a => (
                  <button key={a._id} type="button" onClick={() => setTeamForm({ ...teamForm, members: teamForm.members.includes(a._id) ? teamForm.members.filter(x => x !== a._id) : [...teamForm.members, a._id] })}
                    className={`rounded-lg border px-3 py-1 text-[12px] font-medium ${teamForm.members.includes(a._id) ? 'border-admin-text bg-admin-text text-white' : 'border-admin-border bg-white text-admin-text hover:bg-[#f6f6f7]'}`}>
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" className={secondaryBtn} onClick={() => setShowTeamModal(false)}>Cancel</button>
            <button type="button" className={primaryBtn} disabled={submitting} onClick={handleCreateTeam}>Create Team</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
