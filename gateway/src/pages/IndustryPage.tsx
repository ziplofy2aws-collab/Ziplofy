import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Shell from '../components/Shell';
import type { IndustryKind } from '../types';

const ECOMMERCE = [
  { id: 'fashion', label: 'Fashion & Apparel' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'beauty', label: 'Beauty & Personal Care' },
  { id: 'home', label: 'Home & Decor' },
  { id: 'food', label: 'Food & Grocery' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'sports', label: 'Sports' },
  { id: 'other_ecommerce', label: 'Other ecommerce' },
];

const SERVICE = [
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'education', label: 'Education' },
  { id: 'real_estate', label: 'Real estate' },
  { id: 'agency', label: 'Agency / consulting' },
  { id: 'legal', label: 'Legal' },
  { id: 'hospitality', label: 'Hospitality' },
  { id: 'salon', label: 'Salon / spa' },
  { id: 'tour_travel', label: 'Tour & travel' },
  { id: 'other_service', label: 'Other service' },
];

export default function IndustryPage() {
  const navigate = useNavigate();
  const [kind, setKind] = useState<IndustryKind | null>(null);
  const [industry, setIndustry] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function continueNext() {
    if (!kind || !industry) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.saveIndustry(kind, industry);
      navigate(data.nextPath || '/business-name');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save industry');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      wide
      title="Select your industry"
      subtitle="This decides your dashboard. Next you name the business and launch with Dashboard and Store."
      step={1}
      totalSteps={2}
    >
      {error ? <div className="err">{error}</div> : null}
      <div className="choice-grid two">
        <div className="bucket">
          <h3>Ecommerce → Codiic</h3>
          <div className="pills">
            {ECOMMERCE.map((item) => (
              <button
                key={item.id}
                type="button"
                className={kind === 'ecommerce' && industry === item.id ? 'pill active' : 'pill'}
                onClick={() => {
                  setKind('ecommerce');
                  setIndustry(item.id);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="bucket">
          <h3>Service sector → Webpanel</h3>
          <div className="pills">
            {SERVICE.map((item) => (
              <button
                key={item.id}
                type="button"
                className={kind === 'service' && industry === item.id ? 'pill active' : 'pill'}
                onClick={() => {
                  setKind('service');
                  setIndustry(item.id);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ height: 16 }} />
      <button className="btn" type="button" disabled={!kind || !industry || loading} onClick={continueNext}>
        {loading ? 'Saving…' : 'Continue'}
      </button>
    </Shell>
  );
}
