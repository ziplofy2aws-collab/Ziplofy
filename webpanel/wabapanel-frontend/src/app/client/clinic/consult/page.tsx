'use client';
import React, { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, FileText, Pill, Printer, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { clinicApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7] disabled:opacity-50';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px] focus:border-[#005bd3] focus:outline-none disabled:bg-[#f6f6f7] disabled:text-admin-text-subdued';
const labelClass = 'block text-[12px] font-medium text-admin-text-secondary mb-1';

interface Drug {
  name: string; generic: string; dose: string; freq: string; days: string;
  route: string; qty: string; instructions: string; food: string; remarks: string;
}
const emptyDrug = (): Drug => ({ name: '', generic: '', dose: '', freq: '', days: '', route: '', qty: '', instructions: '', food: '', remarks: '' });

const emptyNotes = {
  chiefComplaint: '', hpi: '', history: '', examination: '',
  diagnosis: '', diagnosisCode: '', plan: '', investigations: '', referrals: '', followUp: '',
  subjective: '', objective: '', assessment: '', notes: '',
};
const emptyVitals = { bp: '', pulse: '', rr: '', temp: '', tempUnit: 'F', spo2: '', height: '', weight: '' };

interface VisitData {
  _id: string; patientName: string; patientPhone?: string; date: string; status: string;
  startedAt?: string | null; finalizedAt?: string | null;
  vitals?: Record<string, string>;
  contact?: { _id?: string; name?: string; phone?: string; email?: string } | null;
  doctor?: { _id?: string; name?: string; specialty?: string; qualifications?: string; room?: string } | null;
  appointment?: { startTime?: string; endTime?: string; date?: string } | null;
  [k: string]: unknown;
}
interface PastVisit { _id: string; date: string; status: string; doctor?: { name?: string } | null; diagnosis?: string; assessment?: string; }

const VITAL_LABELS: [keyof typeof emptyVitals, string][] = [
  ['bp', 'BP (mmHg)'], ['pulse', 'Pulse (/min)'], ['rr', 'Resp. rate'],
  ['temp', 'Temp'], ['spo2', 'SpO₂ %'], ['height', 'Height (cm)'], ['weight', 'Weight (kg)'],
];
const ROUTES = ['', 'Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhalation', 'Sublingual', 'Rectal', 'Drops', 'Other'];
const FOOD = ['', 'Before food', 'After food', 'With food', 'Empty stomach', 'At bedtime', 'SOS'];

function ConsultInner() {
  const params = useSearchParams();
  const visitParam = params.get('visit') || '';
  const [visits, setVisits] = useState<VisitData[]>([]);
  const [visitId, setVisitId] = useState(visitParam);
  const [visit, setVisit] = useState<VisitData | null>(null);
  const [uhid, setUhid] = useState('');
  const [medical, setMedical] = useState<{ dob?: string; gender?: string; allergies?: string; chronicNotes?: string; bloodGroup?: string } | null>(null);
  const [history, setHistory] = useState<PastVisit[]>([]);
  const [notes, setNotes] = useState(emptyNotes);
  const [vitals, setVitals] = useState(emptyVitals);
  const [drugs, setDrugs] = useState<Drug[]>([emptyDrug()]);
  const [advice, setAdvice] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [rxSent, setRxSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState('');
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;

  const finalized = !!visit?.finalizedAt;

  useEffect(() => {
    const today = new Date();
    const dstr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    clinicApi.visits.list({ date: dstr }).then((r) => {
      const list: VisitData[] = r.data.data || [];
      const open = list.filter((v) => v.status !== 'done' || v.finalizedAt);
      setVisits(open.length ? open : list);
      if (!visitParam && list[0]) setVisitId(list[0]._id);
    }).catch(() => {});
  }, [visitParam]);

  useEffect(() => {
    if (!visitId) { setVisit(null); return; }
    clinicApi.visits.get(visitId).then((r) => {
      const { visit: v, prescription, medical: m } = r.data.data || {};
      setVisit(v);
      setMedical(m || null);
      setUhid(m?.uhid || '');
      setNotes({
        chiefComplaint: v?.chiefComplaint || '', hpi: v?.hpi || '', history: v?.history || '',
        examination: v?.examination || '', diagnosis: v?.diagnosis || '', diagnosisCode: v?.diagnosisCode || '',
        plan: v?.plan || '', investigations: v?.investigations || '', referrals: v?.referrals || '',
        followUp: v?.followUp || '', subjective: v?.subjective || '', objective: v?.objective || '',
        assessment: v?.assessment || '', notes: v?.notes || '',
      });
      setVitals({
        bp: v?.vitals?.bp || '', pulse: v?.vitals?.pulse || '', rr: v?.vitals?.rr || '',
        temp: v?.vitals?.temp || '', tempUnit: v?.vitals?.tempUnit || 'F', spo2: v?.vitals?.spo2 || '',
        height: v?.vitals?.height || '', weight: v?.vitals?.weight || '',
      });
      setDrugs(prescription?.drugs?.length ? prescription.drugs : [emptyDrug()]);
      setAdvice(prescription?.advice || '');
      setPdfUrl(prescription?.pdfUrl || '');
      setRxSent(!!prescription?.sentOnWhatsAppAt);
      setDirty(false);
      setLastSaved('');
      if (v?.contact?._id) {
        clinicApi.visits.list({ contact: v.contact._id }).then((h) => {
          setHistory((h.data.data || []).filter((x: PastVisit) => x._id !== visitId && x.status === 'done'));
        }).catch(() => {});
      } else setHistory([]);
    }).catch(() => toast.error('Could not load visit'));
  }, [visitId]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (dirtyRef.current) e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const bmi = useMemo(() => {
    const h = Number(vitals.height), w = Number(vitals.weight);
    if (!h || !w) return '';
    return (w / Math.pow(h / 100, 2)).toFixed(1);
  }, [vitals.height, vitals.weight]);

  const markDirty = () => setDirty(true);
  const setN = (k: keyof typeof emptyNotes, v: string) => { setNotes((n) => ({ ...n, [k]: v })); markDirty(); };
  const setV = (k: keyof typeof emptyVitals, v: string) => { setVitals((x) => ({ ...x, [k]: v })); markDirty(); };
  const setD = (i: number, k: keyof Drug, v: string) => {
    setDrugs((arr) => arr.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
    markDirty();
  };

  const saveDraft = async () => {
    if (!visitId) return;
    setSaving(true);
    try {
      await clinicApi.visits.update(visitId, { ...notes, vitals: { ...vitals, bmi }, status: 'in_consult' });
      setDirty(false);
      setLastSaved(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      toast.success('Draft saved');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const saveRx = async () => {
    if (!visitId) return;
    const clean = drugs.filter((d) => d.name.trim());
    if (!clean.length) { toast.error('Add at least one medicine'); return; }
    setSaving(true);
    try {
      const r = await clinicApi.visits.saveRx(visitId, { drugs: clean, advice });
      setPdfUrl(r.data.data?.pdfUrl || '');
      setDirty(false);
      toast.success('Prescription PDF generated');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Could not generate Rx');
    } finally { setSaving(false); }
  };

  const sendRx = async () => {
    if (!visitId) return;
    try {
      await clinicApi.visits.sendRx(visitId);
      setRxSent(true);
      toast.success('Sent on WhatsApp');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'WhatsApp send failed');
    }
  };

  const finalize = async () => {
    if (!visitId) return;
    if (dirty && !window.confirm('You have unsaved changes. Save and finalize anyway?')) return;
    if (!window.confirm('Finalize this consultation? The record becomes read-only.')) return;
    try {
      if (dirty) await clinicApi.visits.update(visitId, { ...notes, vitals: { ...vitals, bmi } });
      if (drugs.some((d) => d.name.trim())) {
        const r = await clinicApi.visits.saveRx(visitId, { drugs: drugs.filter((d) => d.name.trim()), advice });
        setPdfUrl(r.data.data?.pdfUrl || '');
      }
      const r = await clinicApi.visits.finalize(visitId);
      setVisit(r.data.data);
      setDirty(false);
      toast.success('Consultation finalized');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Finalize failed');
    }
  };

  const age = medical?.dob ? (() => {
    const d = new Date(medical.dob!); const n = new Date();
    let a = n.getFullYear() - d.getFullYear();
    if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--;
    return `${a}y`;
  })() : '';

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-admin-text-secondary" />
            <h1 className="text-[20px] font-semibold text-admin-text">Consult</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            {visit ? `${visit.patientName || visit.contact?.name || 'Patient'} · ${visit.date}` : 'Select a patient in consult'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && <span className="text-[11px] text-admin-text-subdued">Saved {lastSaved}</span>}
          {dirty && <span className="text-[11px] text-amber-600">Unsaved changes</span>}
          <select className={inputClass} style={{ width: 'auto' }} value={visitId} onChange={(e) => setVisitId(e.target.value)}>
            <option value="">Choose visit</option>
            {visits.map((v) => <option key={v._id} value={v._id}>{v.patientName} · {v.date} · {v.finalizedAt ? 'finalized' : v.status}</option>)}
          </select>
        </div>
      </div>

      {!visitId && (
        <div className={dashboardCardShell}>
          <p className="text-[13px] text-admin-text-secondary">Call a patient from the OPD queue to start notes and prescription, or pick a visit above.</p>
        </div>
      )}

      {visit && (
        <>
          {/* Patient header */}
          <div className={dashboardCardShell}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0f7ff] text-[14px] font-semibold text-[#005bd3]">
                  {(visit.patientName || 'P').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-admin-text">
                    {visit.patientName || visit.contact?.name}
                    {age && <span className="ml-2 text-[12px] font-normal text-admin-text-secondary">{age}{medical?.gender ? ` · ${medical.gender}` : ''}</span>}
                  </p>
                  <p className="text-[12px] text-admin-text-secondary">
                    {uhid && <span className="font-mono">{uhid} · </span>}
                    {visit.patientPhone || visit.contact?.phone || ''}
                    {medical?.bloodGroup ? ` · ${medical.bloodGroup}` : ''}
                  </p>
                </div>
              </div>
              <div className="text-right text-[12px] text-admin-text-secondary">
                <p>{visit.doctor?.name ? `Dr. ${visit.doctor.name}` : ''}{visit.doctor?.specialty ? ` · ${visit.doctor.specialty}` : ''}</p>
                <p>{visit.appointment?.startTime ? `Appt ${visit.appointment.startTime}` : 'Walk-in'} · {visit.date}</p>
                <p className="mt-0.5">
                  {finalized
                    ? <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">Finalized</span>
                    : <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">{visit.status === 'in_consult' ? 'In progress' : 'Draft'}</span>}
                </p>
              </div>
            </div>
            {medical?.allergies && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-[12px] text-red-700"><span className="font-semibold">Allergies:</span> {medical.allergies}</p>
              </div>
            )}
            {medical?.chronicNotes && (
              <p className="mt-2 text-[12px] text-admin-text-secondary"><span className="font-medium">Chronic:</span> {medical.chronicNotes}</p>
            )}
          </div>

          {/* Vitals */}
          <div className={dashboardCardShell}>
            <p className="mb-2 text-[13px] font-semibold">Vitals</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {VITAL_LABELS.map(([k, label]) => (
                <label key={k} className="block">
                  <span className={labelClass}>{label}</span>
                  <input className={inputClass} disabled={finalized} value={vitals[k]} onChange={(e) => setV(k, e.target.value)} />
                </label>
              ))}
              <label className="block">
                <span className={labelClass}>Unit</span>
                <select className={inputClass} disabled={finalized} value={vitals.tempUnit} onChange={(e) => setV('tempUnit', e.target.value)}>
                  <option value="F">°F</option><option value="C">°C</option>
                </select>
              </label>
              <div className="block">
                <span className={labelClass}>BMI</span>
                <p className="rounded-lg border border-admin-border bg-[#f6f6f7] px-3 py-2 text-[13px] text-admin-text-secondary">{bmi || '—'}</p>
              </div>
            </div>
          </div>

          {/* Clinical documentation */}
          <div className={dashboardCardShell + ' space-y-3'}>
            <p className="text-[13px] font-semibold">Clinical notes</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label><span className={labelClass}>Chief complaint</span>
                <textarea className={inputClass} rows={2} disabled={finalized} placeholder="Reason for visit, duration" value={notes.chiefComplaint} onChange={(e) => setN('chiefComplaint', e.target.value)} /></label>
              <label><span className={labelClass}>History of present illness</span>
                <textarea className={inputClass} rows={2} disabled={finalized} placeholder="Onset, progression, associated symptoms" value={notes.hpi} onChange={(e) => setN('hpi', e.target.value)} /></label>
              <label><span className={labelClass}>Past / family / medication history</span>
                <textarea className={inputClass} rows={2} disabled={finalized} placeholder="Existing conditions, current meds, family history" value={notes.history} onChange={(e) => setN('history', e.target.value)} /></label>
              <label><span className={labelClass}>Examination findings</span>
                <textarea className={inputClass} rows={2} disabled={finalized} value={notes.examination} onChange={(e) => setN('examination', e.target.value)} /></label>
              <label><span className={labelClass}>Diagnosis / assessment</span>
                <textarea className={inputClass} rows={2} disabled={finalized} value={notes.diagnosis} onChange={(e) => setN('diagnosis', e.target.value)} /></label>
              <label><span className={labelClass}>Diagnosis code (ICD)</span>
                <input className={inputClass} disabled={finalized} placeholder="Optional" value={notes.diagnosisCode} onChange={(e) => setN('diagnosisCode', e.target.value)} /></label>
              <label><span className={labelClass}>Treatment plan</span>
                <textarea className={inputClass} rows={2} disabled={finalized} value={notes.plan} onChange={(e) => setN('plan', e.target.value)} /></label>
              <label><span className={labelClass}>Investigations advised</span>
                <textarea className={inputClass} rows={2} disabled={finalized} placeholder="Labs / imaging" value={notes.investigations} onChange={(e) => setN('investigations', e.target.value)} /></label>
              <label><span className={labelClass}>Referrals</span>
                <input className={inputClass} disabled={finalized} placeholder="Specialist referrals, if any" value={notes.referrals} onChange={(e) => setN('referrals', e.target.value)} /></label>
              <label><span className={labelClass}>Follow-up instructions</span>
                <input className={inputClass} disabled={finalized} placeholder="e.g. Review after 5 days" value={notes.followUp} onChange={(e) => setN('followUp', e.target.value)} /></label>
              <label className="md:col-span-2"><span className={labelClass}>Additional notes</span>
                <textarea className={inputClass} rows={2} disabled={finalized} value={notes.notes} onChange={(e) => setN('notes', e.target.value)} /></label>
            </div>
            {!finalized && (
              <button type="button" className={secondaryBtn} disabled={saving} onClick={saveDraft}>
                {saving ? 'Saving…' : 'Save draft'}
              </button>
            )}
          </div>

          {/* Prescription */}
          <div className={dashboardCardShell}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13px] font-semibold">Prescription</p>
              {medical?.allergies && <p className="text-[11px] text-red-600">Verify against allergies before prescribing</p>}
            </div>
            <div className="space-y-3">
              {drugs.map((d, i) => (
                <div key={i} className="rounded-lg border border-admin-border p-3">
                  <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <input className={inputClass} disabled={finalized} placeholder="Medicine *" value={d.name} onChange={(e) => setD(i, 'name', e.target.value)} />
                    <input className={inputClass} disabled={finalized} placeholder="Generic name" value={d.generic} onChange={(e) => setD(i, 'generic', e.target.value)} />
                    <input className={inputClass} disabled={finalized} placeholder="Strength / dose (e.g. 500mg)" value={d.dose} onChange={(e) => setD(i, 'dose', e.target.value)} />
                    <select className={inputClass} disabled={finalized} value={d.route} onChange={(e) => setD(i, 'route', e.target.value)}>
                      {ROUTES.map((r) => <option key={r} value={r}>{r || 'Route'}</option>)}
                    </select>
                    <input className={inputClass} disabled={finalized} placeholder="Frequency (1-0-1 / BD)" value={d.freq} onChange={(e) => setD(i, 'freq', e.target.value)} />
                    <input className={inputClass} disabled={finalized} placeholder="Duration (5 days)" value={d.days} onChange={(e) => setD(i, 'days', e.target.value)} />
                    <input className={inputClass} disabled={finalized} placeholder="Qty" value={d.qty} onChange={(e) => setD(i, 'qty', e.target.value)} />
                    <select className={inputClass} disabled={finalized} value={d.food} onChange={(e) => setD(i, 'food', e.target.value)}>
                      {FOOD.map((f) => <option key={f} value={f}>{f || 'Food instruction'}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input className={inputClass} disabled={finalized} placeholder="Instructions / remarks" value={d.instructions} onChange={(e) => setD(i, 'instructions', e.target.value)} />
                    {!finalized && drugs.length > 1 && (
                      <button type="button" className={secondaryBtn} onClick={() => { setDrugs((arr) => arr.filter((_, idx) => idx !== i)); markDirty(); }}>Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!finalized && (
              <button type="button" className="mt-2 text-[12px] font-medium text-[#005bd3]" onClick={() => setDrugs((d) => [...d, emptyDrug()])}>+ Add medicine</button>
            )}
            <textarea className={`${inputClass} mt-3`} rows={2} disabled={finalized} placeholder="Advice to patient" value={advice} onChange={(e) => { setAdvice(e.target.value); markDirty(); }} />
            <div className="mt-3 flex flex-wrap gap-2">
              {!finalized && (
                <button type="button" className={primaryBtn} disabled={saving} onClick={saveRx}>
                  <FileText className="h-4 w-4" /> {pdfUrl ? 'Update Rx PDF' : 'Generate Rx PDF'}
                </button>
              )}
              {pdfUrl && <a className={secondaryBtn} href={pdfUrl} target="_blank" rel="noreferrer"><Printer className="h-4 w-4" /> View / print PDF</a>}
              {pdfUrl && !finalized && (
                <button type="button" className={secondaryBtn} onClick={sendRx}>
                  <Send className="h-4 w-4" /> {rxSent ? 'Resend on WhatsApp' : 'Send on WhatsApp'}
                </button>
              )}
              {!finalized && (
                <button type="button" className={`${primaryBtn} ml-auto !bg-[#1a7f37] hover:!bg-[#156e2e]`} onClick={finalize}>
                  <CheckCircle2 className="h-4 w-4" /> Finalize consultation
                </button>
              )}
            </div>
          </div>

          {/* Consultation history */}
          {history.length > 0 && (
            <div className={dashboardCardShell + ' p-0'}>
              <p className="border-b border-admin-border px-4 py-2.5 text-[13px] font-semibold">Past consultations</p>
              {history.map((h) => (
                <button key={h._id} type="button" onClick={() => setVisitId(h._id)} className="block w-full border-b border-admin-border px-4 py-2.5 text-left last:border-0 hover:bg-[#fafafa]">
                  <p className="text-[13px] font-medium text-admin-text">{h.date} · Dr. {h.doctor?.name || '—'}</p>
                  <p className="text-[12px] text-admin-text-secondary">{h.diagnosis || h.assessment || 'View record'}</p>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ClinicConsultPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[13px] text-admin-text-secondary">Loading…</div>}>
      <ConsultInner />
    </Suspense>
  );
}
