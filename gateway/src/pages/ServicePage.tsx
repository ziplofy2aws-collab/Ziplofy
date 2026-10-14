import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Shell from '../components/Shell';
import type { SelectedService } from '../types';

export default function ServicePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<SelectedService | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function continueNext() {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.saveService(selected);
      navigate(data.nextPath || (selected === 'website_builder' ? '/choose-industry' : '/business-name'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save service');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      title="Choose one service"
      subtitle="Pick WhatsApp API or Website Builder. You can only launch one from this account."
      step={1}
    >
      {error ? <div className="err">{error}</div> : null}
      <div className="choice-grid">
        <button
          type="button"
          className={selected === 'whatsapp_api' ? 'choice active' : 'choice'}
          onClick={() => setSelected('whatsapp_api')}
        >
          <h2>WhatsApp API</h2>
          <p>Inbox, campaigns, and WhatsApp Business API in Webpanel. No website is created.</p>
        </button>
        <button
          type="button"
          className={selected === 'website_builder' ? 'choice active' : 'choice'}
          onClick={() => setSelected('website_builder')}
        >
          <h2>Website Builder</h2>
          <p>Next you pick an industry. Ecommerce opens Codiic. Service businesses open Webpanel.</p>
        </button>
      </div>
      <div style={{ height: 16 }} />
      <button className="btn" type="button" disabled={!selected || loading} onClick={continueNext}>
        {loading ? 'Saving…' : 'Continue'}
      </button>
    </Shell>
  );
}
