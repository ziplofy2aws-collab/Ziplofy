import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../contexts/store.context';
import { useReturnRules } from '../../contexts/return-rules.context';
import { SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';

const btnGhost =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50';
const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600';

const fieldInput =
  'w-full max-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

const radioClass =
  'h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0';

const CreateReturnRules: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { createRules, loading } = useReturnRules();

  const [enabled, setEnabled] = React.useState(false);
  const [windowType, setWindowType] = React.useState<'14' | '30' | '90' | 'unlimited' | 'custom'>('30');
  const [customDays, setCustomDays] = React.useState<string>('');

  const [shippingCost, setShippingCost] = React.useState<'customer' | 'free' | 'flat'>('free');
  const [flatRate, setFlatRate] = React.useState<string>('');

  const [chargeRestock, setChargeRestock] = React.useState<boolean>(false);
  const [restockFee, setRestockFee] = React.useState<string>('');

  const onCreate = async () => {
    if (!activeStoreId) return;
    await createRules({
      storeId: activeStoreId,
      enabled,
      returnWindow: windowType === 'custom' ? (customDays || '0') : windowType,
      returnShippingCost:
        shippingCost === 'customer'
          ? 'customer provides return shipping'
          : shippingCost === 'flat'
            ? 'flat rate return shipping'
            : 'free return shipping',
      flatRate: shippingCost === 'flat' ? Number(flatRate || 0) : undefined,
      chargeRestockingFree: chargeRestock,
      restockingFee: chargeRestock ? Number(restockFee || 0) : undefined,
    });
    navigate('/settings/policies');
  };

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
        <SettingsHero
          title="Create return rules"
          description="Set how long customers can return items, who pays for return shipping, and optional restocking fees."
          leading={
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          }
          actions={
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <span className="text-center text-sm font-medium text-slate-700 sm:text-left">
                {enabled ? 'Return rules on' : 'Return rules off'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled((v) => !v)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                  enabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          }
        />

        <SettingsPanel>
          <div className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-gray-900">Return window</h2>
            <p className="mt-1 text-sm text-gray-500">How many days after purchase a customer may start a return.</p>
            <div className="mt-4 space-y-2.5">
              {(['14', '30', '90', 'unlimited', 'custom'] as const).map((value) => (
                <label key={value} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="windowType"
                    value={value}
                    checked={windowType === value}
                    onChange={(e) => setWindowType(e.target.value as typeof windowType)}
                    className={radioClass}
                  />
                  <span className="text-sm text-gray-900">
                    {value === 'custom'
                      ? 'Custom days'
                      : value === 'unlimited'
                        ? 'Unlimited'
                        : `${value} days`}
                  </span>
                </label>
              ))}
            </div>
            {windowType === 'custom' && (
              <div className="mt-4">
                <label htmlFor="custom-days" className="mb-1.5 block text-xs font-medium text-slate-600">
                  Number of days
                </label>
                <input
                  id="custom-days"
                  type="text"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="e.g. 45"
                  className={fieldInput}
                />
              </div>
            )}

            <hr className="my-8 border-gray-200/90" />

            <h2 className="text-base font-semibold text-gray-900">Return shipping cost</h2>
            <p className="mt-1 text-sm text-gray-500">Does not apply to returns using Point of Sale.</p>
            <div className="mt-4 space-y-2.5">
              {(['customer', 'free', 'flat'] as const).map((value) => (
                <label key={value} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="shippingCost"
                    value={value}
                    checked={shippingCost === value}
                    onChange={(e) => setShippingCost(e.target.value as typeof shippingCost)}
                    className={radioClass}
                  />
                  <span className="text-sm text-gray-900">
                    {value === 'customer'
                      ? 'Customer provides return shipping'
                      : value === 'free'
                        ? 'Free return shipping'
                        : 'Flat rate return shipping'}
                  </span>
                </label>
              ))}
            </div>
            {shippingCost === 'flat' && (
              <div className="mt-4">
                <label htmlFor="flat-rate" className="mb-1.5 block text-xs font-medium text-slate-600">
                  Flat rate
                </label>
                <div className="flex max-w-[220px] items-center gap-2">
                  <span className="text-sm text-slate-600">₹</span>
                  <input
                    id="flat-rate"
                    type="number"
                    value={flatRate}
                    onChange={(e) => setFlatRate(e.target.value)}
                    placeholder="0.00"
                    className={`${fieldInput} max-w-none flex-1`}
                  />
                </div>
              </div>
            )}

            <hr className="my-8 border-gray-200/90" />

            <h2 className="text-base font-semibold text-gray-900">Restocking fee</h2>
            <p className="mt-1 text-sm text-gray-500">Optional percentage deducted from the refund when you restock.</p>
            <label className="mt-4 flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={chargeRestock}
                onChange={(e) => setChargeRestock(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-900">Charge restocking fee</span>
            </label>
            {chargeRestock && (
              <div className="mt-4">
                <label htmlFor="restock-pct" className="mb-1.5 block text-xs font-medium text-slate-600">
                  Restocking fee (%)
                </label>
                <input
                  id="restock-pct"
                  type="number"
                  value={restockFee}
                  onChange={(e) => setRestockFee(e.target.value)}
                  placeholder="0"
                  className={fieldInput}
                />
              </div>
            )}

            <div className="mt-8 rounded-xl border border-slate-200/90 bg-slate-50/80 px-4 py-3">
              <p className="text-xs leading-relaxed text-slate-600">
                Return rules only apply to items purchased after return rules are turned on or updated.
              </p>
            </div>
          </div>
        </SettingsPanel>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className={btnGhost} onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="button" className={btnPrimary} onClick={onCreate} disabled={loading || !activeStoreId}>
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateReturnRules;
