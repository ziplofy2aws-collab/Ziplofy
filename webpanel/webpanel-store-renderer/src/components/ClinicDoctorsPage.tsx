import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { axiosi } from '@/config/axios.config';
import { useStorefront } from '@/contexts/store.context';

type Doctor = {
  _id: string;
  name: string;
  specialty?: string;
  qualifications?: string;
  consultationMins?: number;
  room?: string;
  photo?: string;
  bio?: string;
};

type ClinicPayload = {
  enabled: boolean;
  clinicName?: string;
  bookingSlug?: string;
  doctors: Doctor[];
};

export function ClinicDoctorsPage() {
  const { storeFrontMeta } = useStorefront();
  const [data, setData] = useState<ClinicPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!storeFrontMeta?.storeId) return;
    axiosi.get(`/storefront/${storeFrontMeta.storeId}/clinic`)
      .then((r) => setData(r.data.data))
      .catch(() => setError('Could not load doctors.'));
  }, [storeFrontMeta?.storeId]);

  if (error) return <Wrap store={storeFrontMeta?.name}><p>{error}</p></Wrap>;
  if (!data) return <Wrap store={storeFrontMeta?.name}><p>Loading…</p></Wrap>;
  if (!data.enabled) return <Wrap store={storeFrontMeta?.name}><p>Online booking is not enabled for this clinic.</p></Wrap>;

  return (
    <Wrap store={data.clinicName || storeFrontMeta?.name}>
      <h1 style={{ fontSize: 28, margin: '0 0 8px' }}>Our doctors</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Choose a doctor and book a slot.</p>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {(data.doctors || []).map((d) => (
          <div key={d._id} style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, background: '#fff' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0f766e' }}>
              {d.name.charAt(0)}
            </div>
            <h2 style={{ fontSize: 18, margin: '12px 0 4px' }}>Dr. {d.name}</h2>
            <p style={{ margin: 0, color: '#0f766e', fontSize: 13 }}>{d.specialty || 'Consultant'}</p>
            {d.qualifications && <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13 }}>{d.qualifications}</p>}
            {d.bio && <p style={{ margin: '10px 0 0', color: '#475569', fontSize: 14, lineHeight: 1.45 }}>{d.bio}</p>}
            <p style={{ margin: '10px 0 0', fontSize: 12, color: '#94a3b8' }}>{d.consultationMins || 15} min consult{d.room ? ` · Room ${d.room}` : ''}</p>
            {data.bookingSlug && (
              <Link to={`/book?doctor=${d._id}`} style={{ display: 'inline-block', marginTop: 14, background: '#0f766e', color: '#fff', padding: '8px 14px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Book appointment
              </Link>
            )}
          </div>
        ))}
      </div>
      {!data.doctors?.length && <p>Doctors will appear here once the clinic adds them.</p>}
    </Wrap>
  );
}

type Slot = { start: string; end: string; available: boolean };
const dstr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function ClinicBookPage() {
  const { storeFrontMeta } = useStorefront();
  const [params] = useSearchParams();
  const doctorId = params.get('doctor') || '';
  const [slug, setSlug] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState(doctorId);
  const [date, setDate] = useState(dstr(new Date()));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [done, setDone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!storeFrontMeta?.storeId) return;
    axiosi.get(`/storefront/${storeFrontMeta.storeId}/clinic`).then((r) => {
      const c = r.data.data;
      setSlug(c.bookingSlug || '');
      setDoctors(c.doctors || []);
      if (!selectedDoctor && c.doctors?.[0]) setSelectedDoctor(c.doctors[0]._id);
    }).catch(() => setError('Booking is not available.'));
  }, [storeFrontMeta?.storeId]);

  useEffect(() => {
    if (!slug || !date) return;
    axiosi.get(`/public/booking/${slug}/slots`, { params: { date, ...(selectedDoctor ? { doctor: selectedDoctor } : {}) } })
      .then((r) => setSlots(r.data.data?.slots || []))
      .catch(() => setSlots([]));
  }, [slug, date, selectedDoctor]);

  const submit = async () => {
    if (!form.name || !form.phone || !slot) { setError('Name, phone and a slot are required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await axiosi.post(`/public/booking/${slug}`, {
        ...form, date, start: slot, doctor: selectedDoctor || undefined,
      });
      setDone(`Booked for ${date} at ${slot}. We will confirm on WhatsApp if messaging is connected.`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Could not book this slot.');
    } finally { setSubmitting(false); }
  };

  if (done) {
    return <Wrap store={storeFrontMeta?.name}><h1>Appointment booked</h1><p>{done}</p><Link to="/doctors">Back to doctors</Link></Wrap>;
  }

  return (
    <Wrap store={storeFrontMeta?.name}>
      <h1 style={{ fontSize: 28, margin: '0 0 8px' }}>Book an appointment</h1>
      <p style={{ color: '#64748b', marginBottom: 20 }}>Pick a doctor, date, and time.</p>
      {doctors.length > 0 && (
        <label style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
          Doctor
          <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            {doctors.map((d) => <option key={d._id} value={d._id}>Dr. {d.name}{d.specialty ? ` · ${d.specialty}` : ''}</option>)}
          </select>
        </label>
      )}
      <label style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
        Date
        <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSlot(''); }} style={{ display: 'block', width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }} />
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {slots.filter((s) => s.available).map((s) => (
          <button key={s.start} type="button" onClick={() => setSlot(s.start)} style={{ padding: '8px 12px', borderRadius: 8, border: slot === s.start ? '2px solid #0f766e' : '1px solid #e2e8f0', background: slot === s.start ? '#ecfdf5' : '#fff', cursor: 'pointer' }}>
            {s.start}
          </button>
        ))}
        {!slots.filter((s) => s.available).length && <p style={{ color: '#94a3b8', fontSize: 13 }}>No slots this day.</p>}
      </div>
      <input placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={field} />
      <input placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={field} />
      <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={field} />
      <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ ...field, minHeight: 72 }} />
      {error && <p style={{ color: '#b91c1c', fontSize: 13 }}>{error}</p>}
      <button type="button" disabled={submitting || !slug} onClick={submit} style={{ background: '#0f766e', color: '#fff', border: 0, borderRadius: 10, padding: '10px 16px', fontWeight: 600, cursor: 'pointer' }}>
        {submitting ? 'Booking…' : 'Confirm booking'}
      </button>
    </Wrap>
  );
}

const field: CSSProperties = { display: 'block', width: '100%', marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', boxSizing: 'border-box' };

function Wrap({ store, children }: { store?: string | null; children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '32px 16px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <p style={{ margin: '0 0 8px' }}><Link to="/" style={{ color: '#0f766e', textDecoration: 'none', fontSize: 13 }}>{store || 'Home'}</Link></p>
        {children}
      </div>
    </div>
  );
}

export function ClinicBookCta() {
  const { storeFrontMeta } = useStorefront();
  const location = useLocation();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!storeFrontMeta?.storeId) return;
    axiosi.get(`/storefront/${storeFrontMeta.storeId}/clinic`)
      .then((r) => setShow(!!r.data.data?.enabled && (r.data.data?.doctors || []).length > 0))
      .catch(() => setShow(false));
  }, [storeFrontMeta?.storeId]);
  if (!show || location.pathname === '/doctors' || location.pathname === '/book') return null;
  return (
    <Link
      to="/doctors"
      style={{
        position: 'fixed',
        right: 18,
        bottom: 18,
        zIndex: 40,
        background: '#0f766e',
        color: '#fff',
        padding: '12px 16px',
        borderRadius: 999,
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: 14,
        boxShadow: '0 8px 24px rgba(15,118,110,0.35)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      Book appointment
    </Link>
  );
}
