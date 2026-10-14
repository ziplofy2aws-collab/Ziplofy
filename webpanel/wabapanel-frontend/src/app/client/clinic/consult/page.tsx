'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Pill } from 'lucide-react';
import toast from 'react-hot-toast';
import { clinicApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7]';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px] focus:border-[#005bd3] focus:outline-none';

interface Drug { name: string; dose: string; freq: string; days: string; }
const emptyDrug = (): Drug => ({ name: '', dose: '', freq: '', days: '' });

function ConsultInner() {
  const params = useSearchParams();
  const visitParam = params.get('visit') || '';
  const [visits, setVisits] = useState<Array<{ _id: string; patientName: string; status: string; date: string }>>([]);
  const [visitId, setVisitId] = useState(visitParam);
  const [notes, setNotes] = useState({ subjective: '', objective: '', assessment: '', plan: '', notes: '' });
  const [vitals, setVitals] = useState({ bp: '', pulse: '', temp: '', weight: '', spo2: '' });
  const [drugs, setDrugs] = useState<Drug[]>([emptyDrug()]);
  const [advice, setAdvice] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [patient, setPatient] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    clinicApi.visits.list({ status: 'in_consult' }).then((r) => {
      const list = r.data.data || [];
      setVisits(list);
      if (!visitParam && list[0]) setVisitId(list[0]._id);
    }).catch(() => {});
  }, [visitParam]);

  useEffect(() => {
    if (!visitId) return;
    clinicApi.visits.get(visitId).then((r) => {
      const { visit, prescription } = r.data.data || {};
      setPatient(visit?.patientName || visit?.contact?.name || '');
      setNotes({
        subjective: visit?.subjective || '',
        objective: visit?.objective || '',
        assessment: visit?.assessment || '',
        plan: visit?.plan || '',
        notes: visit?.notes || '',
      });
      setVitals({
        bp: visit?.vitals?.bp || '', pulse: visit?.vitals?.pulse || '', temp: visit?.vitals?.temp || '',
        weight: visit?.vitals?.weight || '', spo2: visit?.vitals?.spo2 || '',
      });
      setDrugs(prescription?.drugs?.length ? prescription.drugs : [emptyDrug()]);
      setAdvice(prescription?.advice || '');
      setPdfUrl(prescription?.pdfUrl || '');
    }).catch(() => toast.error('Could not load visit'));
  }, [visitId]);

  const saveNotes = async () => {
    if (!visitId) return;
    setSaving(true);
    try {
      await clinicApi.visits.update(visitId, { ...notes, vitals, status: 'in_consult' });
      toast.success('Notes saved');
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const saveRx = async () => {
    if (!visitId) return;
    setSaving(true);
    try {
      const r = await clinicApi.visits.saveRx(visitId, { drugs: drugs.filter((d) => d.name.trim()), advice });
      setPdfUrl(r.data.data?.pdfUrl || '');
      toast.success('Prescription PDF generated');
    } catch { toast.error('Could not generate Rx'); } finally { setSaving(false); }
  };

  const sendRx = async () => {
    if (!visitId) return;
    try {
      await clinicApi.visits.sendRx(visitId);
      toast.success('Sent on WhatsApp');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'WhatsApp send failed');
    }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-admin-text-secondary" />
            <h1 className="text-[20px] font-semibold text-admin-text">Consult</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">{patient || 'Select a patient in consult'}</p>
        </div>
        <select className={inputClass} style={{ width: 'auto' }} value={visitId} onChange={(e) => setVisitId(e.target.value)}>
          <option value="">Choose visit</option>
          {visits.map((v) => <option key={v._id} value={v._id}>{v.patientName} · {v.date}</option>)}
        </select>
      </div>

      {!visitId && <div className={dashboardCardShell}><p className="text-[13px] text-admin-text-secondary">Call a patient from the OPD queue to start notes and prescription.</p></div>}

      {visitId && (
        <>
          <div className={dashboardCardShell}>
            <p className="mb-2 text-[13px] font-semibold">Vitals</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(['bp', 'pulse', 'temp', 'weight', 'spo2'] as const).map((k) => (
                <input key={k} className={inputClass} placeholder={k.toUpperCase()} value={vitals[k]} onChange={(e) => setVitals({ ...vitals, [k]: e.target.value })} />
              ))}
            </div>
          </div>
          <div className={dashboardCardShell + ' space-y-2'}>
            <p className="text-[13px] font-semibold">SOAP notes</p>
            <textarea className={inputClass} rows={2} placeholder="Subjective" value={notes.subjective} onChange={(e) => setNotes({ ...notes, subjective: e.target.value })} />
            <textarea className={inputClass} rows={2} placeholder="Objective" value={notes.objective} onChange={(e) => setNotes({ ...notes, objective: e.target.value })} />
            <textarea className={inputClass} rows={2} placeholder="Assessment" value={notes.assessment} onChange={(e) => setNotes({ ...notes, assessment: e.target.value })} />
            <textarea className={inputClass} rows={2} placeholder="Plan" value={notes.plan} onChange={(e) => setNotes({ ...notes, plan: e.target.value })} />
            <button type="button" className={secondaryBtn} disabled={saving} onClick={saveNotes}>Save notes</button>
          </div>
          <div className={dashboardCardShell}>
            <p className="mb-2 text-[13px] font-semibold">Prescription</p>
            {drugs.map((d, i) => (
              <div key={i} className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <input className={inputClass} placeholder="Medicine" value={d.name} onChange={(e) => setDrugs((arr) => arr.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
                <input className={inputClass} placeholder="Dose" value={d.dose} onChange={(e) => setDrugs((arr) => arr.map((x, idx) => idx === i ? { ...x, dose: e.target.value } : x))} />
                <input className={inputClass} placeholder="Frequency" value={d.freq} onChange={(e) => setDrugs((arr) => arr.map((x, idx) => idx === i ? { ...x, freq: e.target.value } : x))} />
                <input className={inputClass} placeholder="Days" value={d.days} onChange={(e) => setDrugs((arr) => arr.map((x, idx) => idx === i ? { ...x, days: e.target.value } : x))} />
              </div>
            ))}
            <button type="button" className="mb-3 text-[12px] text-[#005bd3]" onClick={() => setDrugs((d) => [...d, emptyDrug()])}>+ Add medicine</button>
            <textarea className={inputClass} rows={2} placeholder="Advice" value={advice} onChange={(e) => setAdvice(e.target.value)} />
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={primaryBtn} disabled={saving} onClick={saveRx}>Generate Rx PDF</button>
              {pdfUrl && <a className={secondaryBtn} href={pdfUrl} target="_blank" rel="noreferrer">View PDF</a>}
              {pdfUrl && <button type="button" className={secondaryBtn} onClick={sendRx}>Send on WhatsApp</button>}
            </div>
          </div>
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
