'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Calendar, CalendarCheck, Clock, User, Phone, MapPin, CheckCircle, XCircle, AlertTriangle, MessageCircle, RefreshCw, Ban, List, ChevronLeft, ChevronRight, Settings, Copy, Check } from 'lucide-react';
import { appointmentApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';
import toast from 'react-hot-toast';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';

interface Appointment {
  _id: string;
  title: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  notes: string;
  type: string;
  location: string;
  createdAt: string;
}

interface Win { start: string; end: string; }
interface Override { date: string; unavailable: boolean; windows: Win[]; }
interface Availability {
  enabled: boolean;
  slug: string;
  title: string;
  description: string;
  slotDuration: number;
  maxPerSlot: number;
  advanceDays: number;
  weekly: Win[][];
  overrides: Override[];
  notificationEmails?: string[];
}
interface Slot { start: string; end: string; capacity: number; remaining: number; available: boolean; }

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-[#f1f1f1] text-admin-text',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-yellow-100 text-yellow-700',
  rescheduled: 'bg-orange-100 text-orange-700',
};

const statusIcons: Record<string, React.ReactNode> = {
  scheduled: <Clock className="w-3.5 h-3.5" />,
  confirmed: <CheckCircle className="w-3.5 h-3.5" />,
  completed: <CheckCircle className="w-3.5 h-3.5" />,
  cancelled: <XCircle className="w-3.5 h-3.5" />,
  no_show: <AlertTriangle className="w-3.5 h-3.5" />,
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    title: '', contactName: '', contactPhone: '', contactEmail: '',
    date: '', startTime: '10:00', endTime: '10:30', duration: 30,
    status: 'scheduled', notes: '', type: 'general', location: '',
  });
  const [showReschedule, setShowReschedule] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', startTime: '10:00', endTime: '10:30' });
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [quickRange, setQuickRange] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calMonth, setCalMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });

  // Availability / booking settings
  const [showAvail, setShowAvail] = useState(false);
  const [avail, setAvail] = useState<Availability | null>(null);
  const [savingAvail, setSavingAvail] = useState(false);
  const [emailsText, setEmailsText] = useState('');
  const [copied, setCopied] = useState(false);
  // Date-override modal (Cal.com style)
  const [ovModal, setOvModal] = useState(false);
  const [ovDates, setOvDates] = useState<string[]>([]);
  const [ovUnavailable, setOvUnavailable] = useState(false);
  const [ovWindows, setOvWindows] = useState<Win[]>([{ start: '10:00', end: '18:00' }]);
  const [ovMonth, setOvMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  // Slot picker (New Appointment)
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const dstr = (d: Date) => d.toISOString().split('T')[0];
  const applyQuick = (key: string) => {
    setQuickRange(key);
    const now = new Date();
    if (key === '') { setDateFrom(''); setDateTo(''); return; }
    if (key === 'today') { setDateFrom(dstr(now)); setDateTo(dstr(now)); }
    if (key === 'yesterday') { const y = new Date(now.getTime() - 86400000); setDateFrom(dstr(y)); setDateTo(dstr(y)); }
    if (key === 'tomorrow') { const t = new Date(now.getTime() + 86400000); setDateFrom(dstr(t)); setDateTo(dstr(t)); }
    if (key === '7d') { setDateFrom(dstr(new Date(now.getTime() - 7 * 86400000))); setDateTo(dstr(now)); }
    if (key === '30d') { setDateFrom(dstr(new Date(now.getTime() - 30 * 86400000))); setDateTo(dstr(now)); }
  };

  const handleBulkArchive = async (archive: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => appointmentApi.update(id, { archived: archive })));
      toast.success(selectedIds.length + (archive ? ' archived' : ' unarchived'));
      setSelectedIds([]);
      fetchAppointments();
    } catch { toast.error('Failed'); }
  };

  const nowMs = Date.now();
  const displayed = appointments
    .filter(a => {
      if (!a.date) return !dateFrom && !dateTo;
      const d = new Date(a.date).toISOString().split('T')[0];
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      // Default view (no explicit date range): show only upcoming appointments
      if (!dateFrom && !dateTo) {
        const dt = new Date(a.date);
        if (a.startTime) { const [h, mn] = a.startTime.split(':').map(Number); dt.setHours(h || 0, mn || 0, 0, 0); }
        else { dt.setHours(23, 59, 59, 999); }
        if (dt.getTime() < nowMs) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const da = a.date ? new Date(a.date).toISOString().split('T')[0] : '9999';
      const db = b.date ? new Date(b.date).toISOString().split('T')[0] : '9999';
      if (da !== db) return da.localeCompare(db);
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

  const fetchAppointments = () => {
    setLoading(true);
    appointmentApi.list({
      limit: 200,
      ...(filter === 'archived' ? { archived: 'true' } : filter !== 'all' ? { status: filter } : {}),
    })
      .then(r => setAppointments(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, [filter]);

  const resetForm = () => {
    setForm({
      title: '', contactName: '', contactPhone: '', contactEmail: '',
      date: '', startTime: '10:00', endTime: '10:30', duration: 30,
      status: 'scheduled', notes: '', type: 'general', location: '',
    });
    setEditItem(null);
  };

  const handleSave = async () => {
    if (submitting) return;
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.date) { toast.error('Date is required'); return; }
    if (!form.contactName.trim() && !form.contactPhone.trim()) { toast.error('Contact name or phone required'); return; }
    setSubmitting(true);
    try {
      if (editItem) {
        await appointmentApi.update(editItem._id, form);
        toast.success('Appointment updated');
      } else {
        await appointmentApi.create(form);
        toast.success('Appointment created');
      }
      setShowModal(false);
      resetForm();
      fetchAppointments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (submitting) return;
    if (!confirm('Delete this appointment?')) return;
    setSubmitting(true);
    try {
      await appointmentApi.delete(id);
      toast.success('Appointment deleted');
      fetchAppointments();
    } catch { toast.error('Failed to delete'); } finally { setSubmitting(false); }
  };

  const handleStatusChange = async (apt: Appointment, newStatus: string) => {
    try {
      await appointmentApi.update(apt._id, { status: newStatus });
      toast.success(`Status changed to ${newStatus}`);
      fetchAppointments();
    } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const handleSendReminder = async (id: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await appointmentApi.sendReminder(id);
      toast.success("Reminder sent via WhatsApp!");
    } catch { toast.error("Failed to send reminder"); } finally { setSubmitting(false); }
  };




  const handleReschedule = async (id: string) => {
    if (submitting) return;
    if (!rescheduleForm.date) { toast.error('Select new date'); return; }
    if (!rescheduleForm.startTime) { toast.error('Select start time'); return; }
    setSubmitting(true);
    try {
      const res = await appointmentApi.reschedule(id, rescheduleForm);
      toast.success(res.data?.message || 'Appointment rescheduled! Customer notified via WhatsApp.');
      setShowReschedule(null);
      setRescheduleForm({ date: '', startTime: '10:00', endTime: '10:30' });
      fetchAppointments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to reschedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (submitting) return;
    if (!confirm('Cancel this appointment? Customer will be notified via WhatsApp.')) return;
    setSubmitting(true);
    try {
      await appointmentApi.cancel(id);
      toast.success('Appointment cancelled. Customer notified.');
      fetchAppointments();
    } catch { toast.error('Failed to cancel'); } finally { setSubmitting(false); }
  };

  const openEdit = (apt: Appointment) => {
    setEditItem(apt);
    setForm({
      title: apt.title,
      contactName: apt.contactName || '',
      contactPhone: apt.contactPhone || '',
      contactEmail: apt.contactEmail || '',
      date: apt.date ? new Date(apt.date).toISOString().split('T')[0] : '',
      startTime: apt.startTime || '10:00',
      endTime: apt.endTime || '10:30',
      duration: apt.duration || 30,
      status: apt.status || 'scheduled',
      notes: apt.notes || '',
      type: apt.type || 'general',
      location: apt.location || '',
    });
    setShowModal(true);
  };

  const today = new Date().toISOString().split('T')[0];
  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    todayCount: appointments.filter(a => a.date && new Date(a.date).toISOString().split('T')[0] === today).length,
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm('Delete ' + selectedIds.length + ' selected items?')) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      await Promise.all(selectedIds.map(id => appointmentApi.delete(id)));
      toast.success(selectedIds.length + ' items deleted');
      setSelectedIds([]);
      fetchAppointments();
    } catch { toast.error('Failed to delete some items'); } finally { setSubmitting(false); }
  };

  // ---- Availability settings ----
  const openAvailability = async () => {
    try {
      const r = await appointmentApi.getAvailability();
      const d = r.data.data as Availability;
      if (!d.weekly || d.weekly.length !== 7) d.weekly = [[], [], [], [], [], [], []];
      if (!Array.isArray(d.overrides)) d.overrides = [];
      setEmailsText((d.notificationEmails || []).join(', '));
      setAvail(d);
      setShowAvail(true);
    } catch { toast.error('Failed to load availability'); }
  };

  const saveAvailability = async () => {
    if (!avail || savingAvail) return;
    setSavingAvail(true);
    try {
      const r = await appointmentApi.updateAvailability({
        enabled: avail.enabled, title: avail.title, description: avail.description,
        slotDuration: avail.slotDuration, maxPerSlot: avail.maxPerSlot,
        advanceDays: avail.advanceDays, weekly: avail.weekly, overrides: avail.overrides,
        notificationEmails: emailsText.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setAvail(r.data.data);
      toast.success('Availability saved');
      setShowAvail(false);
    } catch { toast.error('Failed to save availability'); } finally { setSavingAvail(false); }
  };

  const setDayWindows = (day: number, wins: Win[]) => {
    if (!avail) return;
    const weekly = avail.weekly.map((w, i) => (i === day ? wins : w));
    setAvail({ ...avail, weekly });
  };
  const addWindow = (day: number) => setDayWindows(day, [...(avail?.weekly[day] || []), { start: '10:00', end: '18:00' }]);
  const removeWindow = (day: number, idx: number) => setDayWindows(day, (avail?.weekly[day] || []).filter((_, i) => i !== idx));
  const updateWindow = (day: number, idx: number, key: 'start' | 'end', val: string) =>
    setDayWindows(day, (avail?.weekly[day] || []).map((w, i) => (i === idx ? { ...w, [key]: val } : w)));
  const copyDayToAll = (day: number) => {
    if (!avail) return;
    const src = avail.weekly[day];
    setAvail({ ...avail, weekly: avail.weekly.map(() => src.map(w => ({ ...w }))) });
    toast.success('Copied to all days');
  };

  // ---- Date overrides (Cal.com-style multi-date modal) ----
  const setOverrides = (overrides: Override[]) => { if (avail) setAvail({ ...avail, overrides }); };
  const removeOverride = (date: string) => setOverrides((avail?.overrides || []).filter(o => o.date !== date));
  const fmtOvDate = (ds: string) => new Date(ds + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const openOverrideModal = () => {
    setOvDates([]);
    setOvUnavailable(false);
    setOvWindows([{ start: '10:00', end: '18:00' }]);
    const n = new Date();
    setOvMonth(new Date(n.getFullYear(), n.getMonth(), 1));
    setOvModal(true);
  };
  const toggleOvDate = (ds: string) => setOvDates(prev => (prev.includes(ds) ? prev.filter(d => d !== ds) : [...prev, ds].sort()));
  const addDraftWindow = () => setOvWindows(prev => [...prev, { start: '10:00', end: '18:00' }]);
  const removeDraftWindow = (wi: number) => setOvWindows(prev => prev.filter((_, i) => i !== wi));
  const updateDraftWindow = (wi: number, key: 'start' | 'end', val: string) => setOvWindows(prev => prev.map((w, i) => (i === wi ? { ...w, [key]: val } : w)));
  const applyOverrides = () => {
    if (!avail) return;
    if (ovDates.length === 0) { toast.error('Select at least one date'); return; }
    if (!ovUnavailable && ovWindows.length === 0) { toast.error('Add at least one time slot or mark unavailable'); return; }
    const others = (avail.overrides || []).filter(o => !ovDates.includes(o.date));
    const added = ovDates.map(date => ({ date, unavailable: ovUnavailable, windows: ovUnavailable ? [] : ovWindows.map(w => ({ ...w })) }));
    setOverrides([...others, ...added].sort((a, b) => a.date.localeCompare(b.date)));
    setOvModal(false);
    toast.success(`Override set for ${ovDates.length} date${ovDates.length > 1 ? 's' : ''}`);
  };

  const bookingLink = avail?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${avail.slug}`
    : '';
  const copyLink = () => {
    if (!bookingLink) return;
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Fetch available slots when date changes in New Appointment modal
  useEffect(() => {
    if (!showModal || editItem || !form.date) { setSlots([]); return; }
    let active = true;
    setSlotsLoading(true);
    appointmentApi.getSlots(form.date)
      .then(r => { if (active) setSlots(r.data.data?.slots || []); })
      .catch(() => { if (active) setSlots([]); })
      .finally(() => { if (active) setSlotsLoading(false); });
    return () => { active = false; };
  }, [form.date, showModal, editItem]);

  const pickSlot = (s: Slot) => setForm(f => ({ ...f, startTime: s.start, endTime: s.end }));

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Appointments</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Manage customer appointments and meetings{' '}
            <span className="text-[12px] font-medium text-admin-text">(IST - Indian Standard Time)</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-admin-border bg-white">
            <button type="button" onClick={() => setViewMode('list')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium ${viewMode === 'list' ? 'bg-admin-text text-white' : 'text-admin-text hover:bg-[#f6f6f7]'}`}><List className="h-4 w-4" /> List</button>
            <button type="button" onClick={() => setViewMode('calendar')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium ${viewMode === 'calendar' ? 'bg-admin-text text-white' : 'text-admin-text hover:bg-[#f6f6f7]'}`}><Calendar className="h-4 w-4" /> Calendar</button>
          </div>
          <button type="button" onClick={openAvailability} className={secondaryBtn}>
            <Settings className="h-4 w-4" /> Availability
          </button>
          <button type="button" onClick={() => { resetForm(); setShowModal(true); }} className={primaryBtn}>
            <Plus className="h-4 w-4" /> New Appointment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Today', value: stats.todayCount },
          { label: 'Scheduled', value: stats.scheduled },
          { label: 'Confirmed', value: stats.confirmed },
          { label: 'Completed', value: stats.completed },
        ].map((s) => (
          <button key={s.label} type="button" onClick={() => {
            if (s.label === 'Total') { setFilter('all'); applyQuick(''); }
            else if (s.label === 'Today') { setFilter('all'); applyQuick('today'); }
            else { setFilter(s.label.toLowerCase()); applyQuick(''); }
          }} className={`${dashboardCardShell} !p-4 text-left cursor-pointer`}>
            <p className="text-xs text-admin-text-secondary">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-admin-text">{s.value}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {['all', 'scheduled', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show', 'archived'].map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] ${filter === f ? 'bg-admin-text font-semibold text-white' : 'border border-admin-border bg-white text-admin-text hover:bg-[#f6f6f7]'}`}>
            {f === 'no_show' ? 'No Show' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-2 py-1">
          <Calendar className="h-4 w-4 text-admin-text-secondary" />
          <input type="date" onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border-0 text-xs text-admin-text focus:outline-none" title="From date" />
          <span className="text-xs text-admin-text-secondary">to</span>
          <input type="date" onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border-0 text-xs text-admin-text focus:outline-none" title="To date" />
          {(dateFrom || dateTo) && (
            <button type="button" onClick={() => { setDateFrom(''); setDateTo(''); setQuickRange(''); }} className="ml-1 text-xs text-admin-text-secondary hover:text-admin-text">✕</button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {[['today', 'Today'], ['yesterday', 'Yesterday'], ['tomorrow', 'Tomorrow'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => applyQuick(quickRange === k ? '' : k)}
            className={`rounded-full border px-2.5 py-1 text-xs ${quickRange === k ? 'border-admin-text bg-admin-text text-white' : 'border-admin-border bg-white text-admin-text hover:bg-[#f6f6f7]'}`}>{l}</button>
        ))}
        <span className="mx-1 h-4 w-px bg-admin-border" />
        <button type="button" onClick={() => setSelectedIds(selectedIds.length === displayed.length ? [] : displayed.map(a => a._id))}
          className="rounded-full border border-admin-border bg-white px-2.5 py-1 text-xs text-admin-text hover:bg-[#f6f6f7]">
          {selectedIds.length === displayed.length && displayed.length > 0 ? 'Unselect All' : 'Select All'}
        </button>
        {selectedIds.length > 0 && (
          <>
            <span className="text-xs text-gray-500">{selectedIds.length} selected</span>
            {filter !== 'archived' ? (
              <button onClick={() => handleBulkArchive(true)} className="px-2.5 py-1 rounded-full text-xs bg-amber-500 text-white hover:bg-amber-600">Archive</button>
            ) : (
              <button onClick={() => handleBulkArchive(false)} className="px-2.5 py-1 rounded-full text-xs bg-blue-500 text-white hover:bg-blue-600">Unarchive</button>
            )}
            <button onClick={handleBulkDelete} className="px-2.5 py-1 rounded-full text-xs bg-red-500 text-white hover:bg-red-600">Delete</button>
          </>
        )}
      </div>

      {/* Calendar view */}
      {viewMode === 'calendar' && (
        <div className={`${dashboardCardShell} !p-4`}>
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="rounded-lg p-1.5 hover:bg-[#f1f1f1]"><ChevronLeft className="h-4 w-4" /></button>
            <h3 className="font-semibold text-admin-text">{calMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h3>
            <button type="button" onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="rounded-lg p-1.5 hover:bg-[#f1f1f1]"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-admin-text-secondary">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const first = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
              const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
              const cells: React.ReactNode[] = [];
              for (let i = 0; i < first.getDay(); i++) cells.push(<div key={'e' + i} />);
              for (let day = 1; day <= daysInMonth; day++) {
                const ds = `${calMonth.getFullYear()}-${String(calMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayAppts = appointments.filter(a => a.date && new Date(a.date).toISOString().split('T')[0] === ds)
                  .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
                const isToday = ds === today;
                cells.push(
                  <div key={ds} className={`min-h-[86px] rounded-lg border p-1 ${isToday ? 'border-admin-text bg-[#f1f1f1]' : 'border-admin-border'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${isToday ? 'text-admin-text' : 'text-admin-text-secondary'}`}>{day}</span>
                      <button type="button" onClick={() => { resetForm(); setForm(f => ({ ...f, date: ds })); setShowModal(true); }} className="text-admin-text-secondary opacity-40 hover:text-admin-text hover:opacity-100" title="New appointment"><Plus className="h-3 w-3" /></button>
                    </div>
                    <div className="mt-0.5 space-y-0.5">
                      {dayAppts.slice(0, 3).map(a => (
                        <button key={a._id} type="button" onClick={() => openEdit(a)} className={`block w-full truncate rounded px-1 py-0.5 text-left text-[10px] leading-tight ${statusColors[a.status] || 'bg-gray-100 text-gray-700'}`} title={`${a.startTime} ${a.title} — ${a.contactName || a.contactPhone || ''} (${a.status})`}>
                          {a.startTime} {a.title}
                        </button>
                      ))}
                      {dayAppts.length > 3 && (
                        <button type="button" onClick={() => { setViewMode('list'); setDateFrom(ds); setDateTo(ds); setQuickRange(''); }} className="px-1 text-[10px] text-admin-text hover:underline">+{dayAppts.length - 3} more</button>
                      )}
                    </div>
                  </div>
                );
              }
              return cells;
            })()}
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className={`space-y-3 ${viewMode === 'calendar' ? 'hidden' : ''}`}>
        {loading ? (
          <div className="py-12 text-center text-admin-text-secondary">Loading...</div>
        ) : displayed.length === 0 ? (
          <div className={`${dashboardCardShell} p-12 text-center`}>
            <Calendar className="mx-auto mb-4 h-16 w-16 text-admin-border" />
            <h3 className="text-lg font-medium text-admin-text-secondary">{dateFrom || dateTo ? 'No appointments in selected dates' : 'No appointments'}</h3>
            <p className="mt-1 text-sm text-admin-text-secondary">Create your first appointment</p>
            <button type="button" onClick={() => { resetForm(); setShowModal(true); }} className={`mt-4 ${primaryBtn}`}>
              <Plus className="h-4 w-4" /> New Appointment
            </button>
          </div>
        ) : (
          displayed.map((apt) => (
            <div key={apt._id} className={`${dashboardCardShell} !p-4`}>
              <div className="flex items-start justify-between gap-3">
                <input type="checkbox" checked={selectedIds.includes(apt._id)} onChange={() => toggleSelect(apt._id)} className="mt-1 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-admin-border text-admin-text focus:ring-admin-text" />
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="font-semibold text-admin-text">{apt.title}</h3>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${statusColors[apt.status] || 'bg-gray-100'}`}>
                      {statusIcons[apt.status]} {apt.status === 'no_show' ? 'No Show' : apt.status}
                    </span>
                    {apt.type && apt.type !== 'general' && (
                      <span className="rounded-full bg-[#f1f1f1] px-2 py-0.5 text-xs text-admin-text">{apt.type}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {apt.date ? new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {apt.startTime} - {apt.endTime}
                    </div>
                    {apt.contactName && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-gray-400" />
                        {apt.contactName}
                      </div>
                    )}
                    {apt.contactPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {apt.contactPhone}
                      </div>
                    )}
                    {apt.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {apt.location}
                      </div>
                    )}
                  </div>

                  {apt.notes && <p className="text-xs text-gray-500 mt-2">{apt.notes}</p>}
                </div>

                <div className="flex max-w-[280px] flex-wrap items-center justify-end gap-1.5">
                  {apt.status === 'scheduled' && (
                    <button type="button" onClick={() => handleStatusChange(apt, 'confirmed')} className="rounded-lg bg-[#f1f1f1] px-2.5 py-1.5 text-xs text-admin-text hover:bg-[#e8e8e8]" title="Confirm">
                      Confirm
                    </button>
                  )}
                  {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                    <button type="button" onClick={() => handleStatusChange(apt, 'completed')} className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs text-blue-700 hover:bg-blue-100" title="Complete">
                      Complete
                    </button>
                  )}
                  {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                    <button type="button" onClick={() => handleCancel(apt._id)} className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-100" title="Cancel">
                      <Ban className="mr-1 inline h-3 w-3" />Cancel
                    </button>
                  )}
                  {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                    <button type="button" onClick={() => { setShowReschedule(apt._id); setRescheduleForm({ date: apt.date ? new Date(apt.date).toISOString().split('T')[0] : '', startTime: apt.startTime, endTime: apt.endTime }); }} className="rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs text-orange-700 hover:bg-orange-100" title="Reschedule">
                      <RefreshCw className="mr-1 inline h-3 w-3" />Reschedule
                    </button>
                  )}
                  <button type="button" onClick={() => handleSendReminder(apt._id)} className="rounded-lg p-2 text-admin-text-secondary hover:bg-[#f1f1f1] hover:text-admin-text" title="Send Reminder"><MessageCircle className="h-4 w-4" /></button>
                  <button type="button" onClick={() => openEdit(apt)} className="rounded-lg p-2 text-admin-text-secondary hover:bg-[#f1f1f1] hover:text-admin-text" title="Edit">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(apt._id)} className="rounded-lg p-2 text-admin-text-secondary hover:bg-red-50 hover:text-red-600" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowReschedule(null)}>
          <div className="w-full max-w-sm rounded-xl border border-admin-border bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-admin-border p-4"><h3 className="font-semibold text-admin-text">Reschedule Appointment</h3></div>
            <div className="space-y-3 p-4">
              <div><label className="mb-1 block text-sm font-medium text-admin-text">New Date *</label><input type="date" min={today} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} value={rescheduleForm.date} onChange={(e) => setRescheduleForm({...rescheduleForm, date: e.target.value})} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-sm font-medium text-admin-text">Start Time</label><input type="time" value={rescheduleForm.startTime} onChange={(e) => setRescheduleForm({...rescheduleForm, startTime: e.target.value})} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" /></div>
                <div><label className="mb-1 block text-sm font-medium text-admin-text">End Time</label><input type="time" value={rescheduleForm.endTime} onChange={(e) => setRescheduleForm({...rescheduleForm, endTime: e.target.value})} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" /></div>
              </div>
              <p className="text-xs text-admin-text-secondary">Customer will be notified via WhatsApp about the new schedule.</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-admin-border p-4">
              <button type="button" onClick={() => setShowReschedule(null)} className={secondaryBtn}>Cancel</button>
              <button type="button" onClick={() => handleReschedule(showReschedule)} className={primaryBtn}>Reschedule & Notify</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-admin-border bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-admin-border p-4">
              <h3 className="font-semibold text-admin-text">{editItem ? 'Edit Appointment' : 'New Appointment'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-admin-text-secondary hover:text-admin-text"><span className="text-xl">&times;</span></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-text/20" placeholder="Meeting title" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                  <input type="text" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-text/20" placeholder="Customer name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-text/20" placeholder="+91..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-text/20" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-text/20">
                    <option value="general">General</option>
                    <option value="consultation">Consultation</option>
                    <option value="demo">Demo</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="support">Support</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" min={today} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-text/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-text/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-text/20" />
                </div>
              </div>

              {!editItem && form.date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Slots <span className="text-xs text-gray-400">(from your availability)</span></label>
                  {slotsLoading ? (
                    <p className="text-xs text-gray-400 py-2">Loading slots…</p>
                  ) : slots.length === 0 ? (
                    <p className="py-2 text-xs text-admin-text-secondary">No slots configured for this day. Set weekly hours in <button type="button" onClick={() => { setShowModal(false); openAvailability(); }} className="underline text-admin-text">Availability</button>, or set the time manually below.</p>
                  ) : (
                    <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto py-1">
                      {slots.map((s) => {
                        const selected = form.startTime === s.start;
                        return (
                          <button key={s.start} type="button" disabled={!s.available} onClick={() => pickSlot(s)}
                            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${selected ? 'border-admin-text bg-admin-text text-white' : s.available ? 'border-admin-border bg-white text-admin-text hover:bg-[#f1f1f1]' : 'cursor-not-allowed border-gray-100 bg-gray-100 text-gray-300 line-through'}`}
                            title={s.capacity > 1 ? `${s.remaining}/${s.capacity} left` : ''}>
                            {s.start}{s.capacity > 1 && s.available ? <span className="ml-1 text-[10px] opacity-70">({s.remaining})</span> : ''}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-text/20" placeholder="Meeting location / online link" />
              </div>

              {editItem && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-text/20">
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-text/20 resize-none" placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-admin-border p-4">
              <button type="button" onClick={() => setShowModal(false)} className={secondaryBtn}>Cancel</button>
              <button type="button" onClick={handleSave} className={primaryBtn}>{editItem ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Availability Settings Modal */}
      {showAvail && avail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAvail(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-admin-border bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-admin-border bg-white p-4">
              <div>
                <h3 className="font-semibold text-admin-text">Availability & Booking</h3>
                <p className="mt-0.5 text-xs text-admin-text-secondary">Set weekly hours, slot length & capacity. Customers can self-book via your link.</p>
              </div>
              <button type="button" onClick={() => setShowAvail(false)} className="text-admin-text-secondary hover:text-admin-text"><span className="text-xl">&times;</span></button>
            </div>
            <div className="p-4 space-y-5">
              {/* Slot settings */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slot duration</label>
                  <select value={avail.slotDuration} onChange={(e) => setAvail({ ...avail, slotDuration: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm">
                    {[10, 15, 20, 30, 45, 60, 90, 120].map(v => <option key={v} value={v}>{v} min</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Members per slot</label>
                  <input type="number" min={1} value={avail.maxPerSlot} onChange={(e) => setAvail({ ...avail, maxPerSlot: Math.max(1, Number(e.target.value) || 1) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  <p className="text-[11px] text-gray-400 mt-0.5">Default 1 (one booking per slot)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bookable ahead</label>
                  <div className="flex items-center gap-1">
                    <input type="number" min={1} value={avail.advanceDays} onChange={(e) => setAvail({ ...avail, advanceDays: Math.max(1, Number(e.target.value) || 30) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                    <span className="text-xs text-gray-500">days</span>
                  </div>
                </div>
              </div>

              {/* Booking notification emails */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification emails</label>
                <input type="text" value={emailsText} onChange={(e) => setEmailsText(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="you@company.com, team@company.com" />
                <p className="text-[11px] text-gray-400 mt-0.5">Har nayi booking par in par email jayega. Multiple emails comma se alag karo. (Khali chhodo to koi email nahi jayega.)</p>
              </div>

              {/* Weekly hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weekly hours</label>
                <div className="space-y-2">
                  {DAY_NAMES.map((name, day) => {
                    const wins = avail.weekly[day] || [];
                    return (
                      <div key={day} className="flex items-start gap-3 border rounded-lg p-2.5">
                        <div className="w-24 pt-1.5 text-sm font-medium text-gray-700">{name}</div>
                        <div className="flex-1 space-y-2">
                          {wins.length === 0 && <p className="text-xs text-gray-400 pt-1.5">Unavailable</p>}
                          {wins.map((w, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input type="time" value={w.start} onChange={(e) => updateWindow(day, idx, 'start', e.target.value)} className="px-2 py-1 border rounded-lg text-sm" />
                              <span className="text-gray-400 text-sm">–</span>
                              <input type="time" value={w.end} onChange={(e) => updateWindow(day, idx, 'end', e.target.value)} className="px-2 py-1 border rounded-lg text-sm" />
                              <button onClick={() => removeWindow(day, idx)} className="p-1 text-gray-400 hover:text-red-600" title="Remove"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col gap-1">
                          <button type="button" onClick={() => addWindow(day)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-admin-text hover:bg-[#f1f1f1]"><Plus className="h-3.5 w-3.5" /> Add</button>
                          {wins.length > 0 && <button onClick={() => copyDayToAll(day)} className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 rounded-lg"><Copy className="w-3.5 h-3.5" /> All</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date overrides */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date overrides</label>
                    <p className="text-xs text-gray-400">Set different hours (or block) for specific dates — these override your weekly hours.</p>
                  </div>
                  <button type="button" onClick={openOverrideModal} className={`${secondaryBtn} !text-xs whitespace-nowrap`}><Plus className="h-3.5 w-3.5" /> Add an override</button>
                </div>
                {(avail.overrides || []).length === 0 ? (
                  <p className="text-xs text-gray-400 border border-dashed rounded-lg p-4 text-center">No date overrides yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {(avail.overrides || []).map((o) => (
                      <div key={o.date} className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${o.unavailable ? 'border-red-200 bg-red-50' : 'border-admin-border bg-[#f1f1f1]'}`}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-semibold text-admin-text"><Calendar className={`h-4 w-4 ${o.unavailable ? 'text-red-500' : 'text-admin-text'}`} />{fmtOvDate(o.date)}</div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {o.unavailable ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700"><Ban className="h-3 w-3" /> Unavailable all day</span>
                            ) : (o.windows || []).length === 0 ? (
                              <span className="text-[11px] text-admin-text-secondary">No hours</span>
                            ) : (o.windows || []).map((w, wi) => (
                              <span key={wi} className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-admin-text border border-admin-border"><Clock className="h-3 w-3" /> {w.start}–{w.end}</span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => removeOverride(o.date)} className="p-1.5 text-gray-400 hover:text-red-600 shrink-0" title="Delete override"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Public booking link */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={avail.enabled} onChange={(e) => setAvail({ ...avail, enabled: e.target.checked })} className="rounded text-admin-text focus:ring-admin-text" />
                  <span className="text-sm font-medium text-gray-800">Enable public self-booking page</span>
                </label>
                {avail.enabled && (
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Page title</label>
                      <input type="text" value={avail.title} onChange={(e) => setAvail({ ...avail, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Book an Appointment" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input readOnly value={bookingLink} className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white text-gray-600" />
                      <button onClick={copyLink} className="flex items-center gap-1 px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50">
                        {copied ? <Check className="h-4 w-4 text-admin-text" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400">Share this link with customers — they pick an available slot themselves.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-admin-border bg-white p-4">
              <button type="button" onClick={() => setShowAvail(false)} className={secondaryBtn}>Cancel</button>
              <button type="button" onClick={saveAvailability} disabled={savingAvail} className={primaryBtn}>{savingAvail ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Date-override modal (Cal.com style) */}
      {ovModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setOvModal(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-admin-border bg-white" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-admin-border p-4">
              <div>
                <h3 className="text-base font-semibold text-admin-text">Select the dates to override</h3>
                <p className="text-xs text-admin-text-secondary">Pick one or more dates, then set their hours or block them.</p>
              </div>
              <button type="button" onClick={() => setOvModal(false)} className="p-1 text-admin-text-secondary hover:text-admin-text"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-5">
              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setOvMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-sm font-semibold text-gray-800">{ovMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  <button onClick={() => setOvMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-gray-400 mb-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const y = ovMonth.getFullYear(), m = ovMonth.getMonth();
                    const first = new Date(y, m, 1).getDay();
                    const days = new Date(y, m + 1, 0).getDate();
                    const todayStr = dstr(new Date());
                    const cells: React.ReactNode[] = [];
                    for (let i = 0; i < first; i++) cells.push(<div key={'e' + i} />);
                    for (let d = 1; d <= days; d++) {
                      const ds = dstr(new Date(y, m, d));
                      const sel = ovDates.includes(ds);
                      const past = ds < todayStr;
                      cells.push(
                        <button key={ds} disabled={past} onClick={() => toggleOvDate(ds)}
                          className={`aspect-square rounded-lg text-sm flex items-center justify-center transition ${sel ? 'bg-admin-text text-white font-semibold shadow-sm' : past ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-[#f1f1f1] text-admin-text'}`}>{d}</button>
                      );
                    }
                    return cells;
                  })()}
                </div>
                {ovDates.length > 0 && <p className="mt-3 text-xs font-medium text-admin-text">{ovDates.length} date{ovDates.length > 1 ? 's' : ''} selected</p>}
              </div>
              {/* Hours / unavailable */}
              <div className="md:border-l md:border-admin-border md:pl-5">
                <label className="mb-3 flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={ovUnavailable} onChange={e => setOvUnavailable(e.target.checked)} className="rounded text-admin-text focus:ring-admin-text" />
                  <span className="text-sm font-medium text-admin-text">Mark unavailable (block all day)</span>
                </label>
                {!ovUnavailable && (
                  <div className="space-y-2">
                    <p className="text-xs text-admin-text-secondary">Available time slots for the selected date(s):</p>
                    {ovWindows.map((w, wi) => (
                      <div key={wi} className="flex items-center gap-2">
                        <input type="time" value={w.start} onChange={e => updateDraftWindow(wi, 'start', e.target.value)} className="rounded-lg border border-admin-border px-2 py-1 text-sm" />
                        <span className="text-sm text-admin-text-secondary">–</span>
                        <input type="time" value={w.end} onChange={e => updateDraftWindow(wi, 'end', e.target.value)} className="rounded-lg border border-admin-border px-2 py-1 text-sm" />
                        <button type="button" onClick={() => removeDraftWindow(wi)} className="p-1 text-admin-text-secondary hover:text-red-600" title="Remove"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={addDraftWindow} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-admin-text hover:bg-[#f1f1f1]"><Plus className="h-3.5 w-3.5" /> Add another slot</button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-admin-border p-4">
              <button type="button" onClick={() => setOvModal(false)} className={secondaryBtn}>Cancel</button>
              <button type="button" onClick={applyOverrides} className={primaryBtn}>Add Override</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
