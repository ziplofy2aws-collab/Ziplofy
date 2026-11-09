import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Shell from '../components/Shell';
import { FlowButton, FlowButtonLoading } from '../components/ui/flow-button';

export default function BusinessNamePage() {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.saveBusinessName(businessName.trim());
      navigate('/launching');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save business name');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      title="Name your business"
      subtitle="This becomes your store or workspace name when the product launches."
      step={1}
      totalSteps={1}
    >
      {error ? <div className="err">{error}</div> : null}
      <form onSubmit={onSubmit}>
        <label htmlFor="businessName">Business name</label>
        <input
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          minLength={2}
          maxLength={100}
          required
        />
        {loading ? (
          <FlowButtonLoading text="Saving…" />
        ) : (
          <FlowButton
            type="submit"
            text="Launch"
            className="w-full"
            disabled={businessName.trim().length < 2}
          />
        )}
      </form>
    </Shell>
  );
}
