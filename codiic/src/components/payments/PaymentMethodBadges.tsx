import React from 'react';

const METHOD_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  bogus: { label: 'B', bg: 'bg-orange-500', text: 'text-white' },
  visa: { label: 'VISA', bg: 'bg-blue-700', text: 'text-white' },
  mastercard: { label: 'MC', bg: 'bg-red-600', text: 'text-white' },
  amex: { label: 'AMEX', bg: 'bg-sky-600', text: 'text-white' },
  discover: { label: 'DISC', bg: 'bg-orange-600', text: 'text-white' },
  diners: { label: 'DC', bg: 'bg-slate-700', text: 'text-white' },
  rupay: { label: 'RuPay', bg: 'bg-blue-500', text: 'text-white' },
  maestro: { label: 'M', bg: 'bg-red-500', text: 'text-white' },
  jcb: { label: 'JCB', bg: 'bg-green-700', text: 'text-white' },
  unionpay: { label: 'UP', bg: 'bg-red-700', text: 'text-white' },
  apple_pay: { label: 'Pay', bg: 'bg-black', text: 'text-white' },
  google_pay: { label: 'G Pay', bg: 'bg-white', text: 'text-gray-800' },
  paypal: { label: 'PayPal', bg: 'bg-blue-600', text: 'text-white' },
  upi: { label: 'UPI', bg: 'bg-green-600', text: 'text-white' },
  netbanking: { label: 'NB', bg: 'bg-indigo-600', text: 'text-white' },
  bank_transfer: { label: 'Bank', bg: 'bg-emerald-700', text: 'text-white' },
  cod: { label: 'COD', bg: 'bg-violet-700', text: 'text-white' },
};

interface PaymentMethodBadgesProps {
  methods: string[];
  max?: number;
}

const PaymentMethodBadges: React.FC<PaymentMethodBadgesProps> = ({ methods, max = 8 }) => {
  const visible = methods.slice(0, max);
  const remaining = methods.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((method) => {
        const style = METHOD_STYLES[method] ?? {
          label: method.replace(/_/g, ' ').slice(0, 6).toUpperCase(),
          bg: 'bg-slate-200',
          text: 'text-slate-700',
        };
        return (
          <span
            key={method}
            className={`inline-flex min-w-[2rem] items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border border-black/5 ${style.bg} ${style.text}`}
          >
            {style.label}
          </span>
        );
      })}
      {remaining > 0 && (
        <span className="text-xs text-gray-500">+{remaining}</span>
      )}
    </div>
  );
};

export default PaymentMethodBadges;
