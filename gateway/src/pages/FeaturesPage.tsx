import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Shell from '../components/Shell';
import type { PanelModule } from '../types';

const DEFAULT_CORE = ['whatsapp', 'websiteBuilder'];

export default function FeaturesPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<PanelModule[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.me(), api.modules()])
      .then(([session, catalog]) => {
        if (cancelled) return;
        if (!session.user.industryKind) {
          navigate(session.nextPath || '/choose-industry', { replace: true });
          return;
        }
        const locked = catalog.modules.filter((item) => item.locked).map((item) => item.id);
        const previous = session.user.selectedModules || [];
        const initial = previous.length
          ? Array.from(new Set([...locked, ...previous]))
          : Array.from(new Set([...DEFAULT_CORE, ...locked]));
        setModules(catalog.modules);
        setSelected(initial);
        setReady(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load services');
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function toggle(id: string, locked: boolean) {
    if (locked) return;
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  const coreSelected = selected.includes('whatsapp') || selected.includes('websiteBuilder');

  async function continueNext() {
    if (!coreSelected) {
      setError('Select WhatsApp API, Website Builder, or both');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.saveModules(selected);
      navigate(data.nextPath || '/business-name');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save services');
    } finally {
      setLoading(false);
    }
  }

  const coreModules = modules.filter((item) => item.kind === 'core');
  const panelModules = modules.filter((item) => item.kind !== 'core');

  return (
    <Shell
      wide
      title="Choose your services"
      subtitle="WhatsApp API and Website Builder can both stay on. Extra panels appear in the dashboard only if you check them."
      step={2}
      totalSteps={3}
    >
      {error ? <div className="err">{error}</div> : null}
      {!ready ? <p className="sub">Loading services…</p> : null}

      <h3 className="group-title">Services</h3>
      <div className="checks">
        {coreModules.map((item) => (
          <label key={item.id} className="check">
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              disabled={item.locked}
              onChange={() => toggle(item.id, item.locked)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      <h3 className="group-title">More panels</h3>
      <div className="checks">
        {panelModules.map((item) => (
          <label key={item.id} className={item.locked ? 'check locked' : 'check'}>
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              disabled={item.locked}
              onChange={() => toggle(item.id, item.locked)}
            />
            <span>
              {item.label}
              {item.locked ? ' · included' : ''}
            </span>
          </label>
        ))}
      </div>
      <button className="btn" type="button" disabled={!ready || loading || !coreSelected} onClick={continueNext}>
        {loading ? 'Saving…' : 'Continue'}
      </button>
    </Shell>
  );
}
