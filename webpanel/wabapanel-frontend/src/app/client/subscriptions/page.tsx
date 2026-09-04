'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, Star, Zap, Crown, Clock, Sparkles, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { paymentApi, platformApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import type { Plan } from '@/types';
import ManualPaymentModal, { ManualInfo } from '@/components/billing/ManualPaymentModal';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-50';
const fieldClass =
  'rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30';
const modalOverlayClass = 'fixed inset-0 z-[1300] flex items-center justify-center p-4 sm:p-6';
const modalPanelClass =
  'relative z-10 w-full max-w-sm overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)]';

export default function SubscriptionsPage() {
  const { user, currentWorkspace } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [gateways, setGateways] = useState<{ id: string; configured: boolean; autoRenewEnabled?: boolean; allowInternational?: boolean; upiId?: string; qrImageUrl?: string; accountDetails?: string; instructions?: string }[]>([]);
  const [currencies, setCurrencies] = useState<{ code: string; name: string; symbol: string; rate: number; isDefault: boolean }[]>([]);
  const [baseCurrency, setBaseCurrency] = useState('INR');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [brandName, setBrandName] = useState('Codiic Panel');
  const [showManual, setShowManual] = useState(false);
  const [manualPlan, setManualPlan] = useState<Plan | null>(null);
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [trialStarting, setTrialStarting] = useState<string | null>(null);
  const [pendingPayments, setPendingPayments] = useState<{ _id: string; plan?: { _id: string; name: string }; amount: number; createdAt: string }[]>([]);
  const [gatewayPlan, setGatewayPlan] = useState<Plan | null>(null);
  const [autoRenew, setAutoRenew] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const cyclePrice = (plan: Plan): number => {
    const m = plan.price || 0;
    if (billingCycle === 'quarterly') return (plan.quarterlyPrice ?? 0) > 0 ? (plan.quarterlyPrice as number) : Math.round(m * 3);
    if (billingCycle === 'yearly') return (plan.yearlyPrice ?? 0) > 0 ? (plan.yearlyPrice as number) : Math.round(m * 10);
    return m;
  };
  const cycleSuffix = billingCycle === 'quarterly' ? 'quarter' : billingCycle === 'yearly' ? 'year' : 'month';
  const isForeign = selectedCurrency.toUpperCase() !== baseCurrency.toUpperCase();
  const curInfo = (code: string) => currencies.find(c => c.code.toUpperCase() === code.toUpperCase());
  const baseSymbol = curInfo(baseCurrency)?.symbol || '₹';
  // Mirrors the backend resolvePlanPrice() so the shown price == the charged price.
  const resolvePrice = (plan: Plan): { amount: number; currency: string; symbol: string } => {
    const base = cyclePrice(plan);
    if (!isForeign) return { amount: base, currency: baseCurrency.toUpperCase(), symbol: baseSymbol };
    const cur = curInfo(selectedCurrency);
    if (!cur) return { amount: base, currency: baseCurrency.toUpperCase(), symbol: baseSymbol };
    const p = plan as unknown as { pricingMode?: string; prices?: { currency: string; monthly: number; quarterly: number; yearly: number }[] };
    if ((p.pricingMode || 'manual') === 'exchange') {
      const rate = Number(cur.rate) > 0 ? Number(cur.rate) : 0;
      return rate ? { amount: Math.round(base * rate), currency: cur.code.toUpperCase(), symbol: cur.symbol } : { amount: base, currency: baseCurrency.toUpperCase(), symbol: baseSymbol };
    }
    const row = (p.prices || []).find(r => (r.currency || '').toUpperCase() === selectedCurrency.toUpperCase());
    const amt = row ? Number(row[billingCycle] || 0) : 0;
    return amt > 0 ? { amount: amt, currency: cur.code.toUpperCase(), symbol: cur.symbol } : { amount: base, currency: baseCurrency.toUpperCase(), symbol: baseSymbol };
  };
  const priceLabel = (plan: Plan) => { const r = resolvePrice(plan); return `${r.symbol}${r.amount}`; };
  const loadGateways = (cur?: string) => {
    const foreign = cur ? cur.toUpperCase() !== baseCurrency.toUpperCase() : false;
    paymentApi.getGateways(foreign ? cur : undefined).then(r => {
      const gws = r.data.data || [];
      setGateways(gws);
      if (gws.some((g: { id: string; configured: boolean; autoRenewEnabled?: boolean }) => g.id === 'razorpay' && g.configured && g.autoRenewEnabled !== false)) setAutoRenew(true);
    }).catch(() => {});
  };
  const [autoRenewStatus, setAutoRenewStatus] = useState<{ active: boolean; planName?: string; interval?: string; endDate?: string } | null>(null);
  const [cancellingAutoRenew, setCancellingAutoRenew] = useState(false);
  const rawPlan = ((user as unknown as { plan?: Plan })?.plan) || (currentWorkspace?.plan as Plan | undefined);
  const currentPlan: Plan | undefined = rawPlan && plans.some(p => p._id === rawPlan._id) ? rawPlan : plans.find(p => p.price === 0);

  useEffect(() => {
    paymentApi.getPlans().then(r => setPlans(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
    platformApi.publicBranding().then(r => { const n = r.data?.data?.name; if (n) setBrandName(n); }).catch(() => {});
    paymentApi.getCurrencies().then(r => {
      const list = r.data.data?.currencies || [];
      const bc = (r.data.data?.baseCurrency || 'INR').toUpperCase();
      setCurrencies(list);
      setBaseCurrency(bc);
      try {
        const region = (navigator.language.split('-')[1] || '').toUpperCase();
        const map: Record<string, string> = { US: 'USD', GB: 'GBP', IN: 'INR', AE: 'AED', SA: 'SAR', AU: 'AUD', CA: 'CAD', SG: 'SGD', MY: 'MYR', JP: 'JPY', CN: 'CNY', HK: 'HKD', NZ: 'NZD', ZA: 'ZAR', QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR', BD: 'BDT', PK: 'PKR', LK: 'LKR', NP: 'NPR', ID: 'IDR', PH: 'PHP', TH: 'THB', VN: 'VND', KR: 'KRW', TR: 'TRY', RU: 'RUB', BR: 'BRL', MX: 'MXN', NG: 'NGN', KE: 'KES', EG: 'EGP', CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', IL: 'ILS' };
        const guess = map[region];
        setSelectedCurrency(guess && list.some((c: { code: string }) => c.code.toUpperCase() === guess) ? guess : bc);
      } catch { setSelectedCurrency(bc); }
    }).catch(() => {});
    loadPendingPayments();
    loadAutoRenew();
    // Returning from a hosted gateway page (PhonePe/Cashfree/PayPal): confirm the payment.
    const params = new URLSearchParams(window.location.search);
    const hostedId = params.get('hostedPayment');
    if (hostedId) {
      window.history.replaceState({}, '', window.location.pathname);
      paymentApi.verifyHostedPayment(hostedId).then(r => {
        if (r.data.data?.status === 'completed') {
          toast.success(r.data.message || 'Payment confirmed — plan activated!');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast(r.data.message || 'Payment not completed yet. If you already paid, refresh in a minute.', { icon: '⏳', duration: 8000 });
        }
      }).catch(() => toast.error('Could not verify the payment. If you were charged, contact support.'));
    }
  }, []);

  // Reload gateways whenever the selected currency changes (foreign = only intl-enabled gateways).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadGateways(selectedCurrency); }, [selectedCurrency, baseCurrency]);

  const loadAutoRenew = () => {
    paymentApi.getAutoRenewStatus().then(r => {
      const st = r.data.data?.plan || null;
      setAutoRenewStatus(st);
      if (st?.active) setAutoRenew(false);
    }).catch(() => {});
  };

  const cancelAutoRenewPlan = async () => {
    if (!confirm('Cancel auto-renew? Your plan will stay active till its expiry date, but will not renew automatically.')) return;
    setCancellingAutoRenew(true);
    try {
      const r = await paymentApi.cancelAutoRenew('plan');
      toast.success(r.data.message || 'Auto-renew cancelled');
      loadAutoRenew();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to cancel auto-renew');
    }
    setCancellingAutoRenew(false);
  };

  const loadPendingPayments = () => {
    paymentApi.getHistory().then(r => {
      const all = (r.data.data || []) as { _id: string; gateway: string; type: string; status: string; plan?: { _id: string; name: string }; amount: number; createdAt: string }[];
      setPendingPayments(all.filter(p => p.gateway === 'manual' && p.type === 'subscription' && p.status === 'pending'));
    }).catch(() => {});
  };

  const usableGateways = gateways.filter(g => g.configured && ['razorpay', 'stripe', 'manual', 'paypal', 'phonepe', 'cashfree', 'payu', 'paystack', 'instamojo', 'flutterwave', 'mollie', 'mercadopago'].includes(g.id));

  const handleSubscribe = async (planId: string) => {
    const plan = plans.find(p => p._id === planId);
    if (plan && plan.price > 0) {
      if (usableGateways.length === 0) {
        toast.error('No payment method is enabled. Ask admin to enable a gateway (Razorpay, PhonePe, Cashfree, PayU, Paystack, Instamojo, Flutterwave, Mollie, Mercado Pago, Stripe, PayPal or Manual) in Payment Gateways.');
        return;
      }
      if (usableGateways.length > 1) {
        setGatewayPlan(plan);
        return;
      }
    }
    const gateway = plan && plan.price > 0 ? usableGateways[0].id : 'manual';
    await proceedWithGateway(planId, gateway);
  };

  const proceedWithGateway = async (planId: string, gateway: string, forceAutoRenew = false) => {
    if (submitting) return;
    setSubmitting(true);

    setSubscribing(planId);
    try {
      const plan = plans.find(p => p._id === planId);
      if (gateway === 'manual' && plan && plan.price > 0) {
        setManualPlan(plan);
        setShowManual(true);
        setSubmitting(false);
        setSubscribing(null);
        return;
      }
      const resolved = plan ? resolvePrice(plan) : { currency: baseCurrency.toUpperCase() };
      const foreign = resolved.currency.toUpperCase() !== baseCurrency.toUpperCase();
      // A coupon can't be combined with a Razorpay recurring mandate (fixed amount),
      // so an applied coupon takes precedence: pay once at the discounted price.
      const useAutoRenew = !foreign && gateway === 'razorpay' && (autoRenew || forceAutoRenew) && !couponApplied;
      const res = await paymentApi.subscribe(planId, gateway, {
        cycle: billingCycle,
        currency: resolved.currency,
        ...(couponApplied && !useAutoRenew && !foreign ? { couponCode: couponApplied.code } : {}),
        ...(useAutoRenew ? { autoRenew: true } : {}),
      });
      const order = res.data.data;
      // Stripe: backend returns a hosted checkout URL.
      if (order?.sessionUrl) {
        window.location.href = order.sessionUrl; return;
      }
      // Free plan: backend activates directly, no Razorpay order returned.
      if (!order?.orderId && !order?.subscriptionId) {
        toast.success(res.data.message || 'Plan activated!'); window.location.reload(); return;
      }
      if (typeof window === 'undefined' || !(window as unknown as Record<string, unknown>).Razorpay) {
        toast.error('Payment system not loaded. Refresh the page and try again.');
        return;
      }
      const options = {
        key: order.keyId,
        ...(order.subscriptionId
          ? { subscription_id: order.subscriptionId }
          : { amount: order.amount, currency: order.currency || 'INR', order_id: order.orderId }),
        name: brandName, description: order.subscriptionId ? 'Plan Subscription (Auto-renew)' : 'Plan Subscription',
        handler: async (response: Record<string, string>) => {
          try {
            await paymentApi.verifyPayment({
              paymentId: order.paymentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Subscription activated!'); window.location.reload();
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { email: user?.email, name: user?.name },
        theme: { color: '#1a1a1a' },
      };
      const rzp = new ((window as unknown as Record<string, new (o: unknown) => { open: () => void }>).Razorpay)(options);
      (rzp as { open: () => void }).open();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to start payment');
    } finally {
      setSubmitting(false);
      setSubscribing(null);
    }
  };

  const manualInfo: ManualInfo = (() => {
    const m = gateways.find(g => g.id === 'manual');
    return { upiId: m?.upiId, qrImageUrl: m?.qrImageUrl, accountDetails: m?.accountDetails, instructions: m?.instructions };
  })();

  const submitManualSub = async (reference: string, proofUrl: string) => {
    if (!manualPlan) return;
    setManualSubmitting(true);
    try {
      const mResolved = resolvePrice(manualPlan);
      const mForeign = mResolved.currency.toUpperCase() !== baseCurrency.toUpperCase();
      const res = await paymentApi.subscribe(manualPlan._id, 'manual', { reference, proofUrl, cycle: billingCycle, currency: mResolved.currency, ...(couponApplied && !mForeign ? { couponCode: couponApplied.code } : {}) });
      toast.success(res.data.message || 'Request submitted. Admin will confirm & activate your plan.');
      setShowManual(false);
      loadPendingPayments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    }
    setManualSubmitting(false);
  };

  const applyCouponCode = async () => {
    if (!couponCode.trim()) return;
    setCouponChecking(true);
    try {
      const maxPrice = Math.max(...plans.map(p => p.price || 0), 0);
      const r = await platformApi.validateCoupon(couponCode.trim(), maxPrice);
      setCouponApplied({ code: r.data.data.code, discount: r.data.data.discountType === 'percent' ? r.data.data.discountValue : r.data.data.discount });
      toast.success(`Coupon ${r.data.data.code} applied — ${r.data.data.discountType === 'percent' ? r.data.data.discountValue + '% off' : 'Rs.' + r.data.data.discount + ' off'}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Invalid coupon');
      setCouponApplied(null);
    }
    setCouponChecking(false);
  };

  const startTrial = async (planId: string) => {
    const plan = plans.find(p => p._id === planId) as (Plan & { trialRequiresMandate?: boolean }) | undefined;
    if (plan?.trialRequiresMandate && gateways.some(g => g.id === 'razorpay' && g.configured && g.autoRenewEnabled !== false)) {
      await proceedWithGateway(planId, 'razorpay', true);
      return;
    }
    setTrialStarting(planId);
    try {
      const r = await paymentApi.startTrial(planId);
      toast.success(r.data.message || 'Free trial activated!');
      window.location.reload();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to start trial');
    }
    setTrialStarting(null);
  };

  const planIcons = [<Star key="s" className="h-5 w-5" />, <Zap key="z" className="h-5 w-5" />, <Crown key="c" className="h-5 w-5" />];
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Subscription Plans</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Choose the plan that fits your business</p>
        </div>
      </div>

      {pendingPayments.length > 0 && (
        <div className={`${dashboardCardShell} border-amber-200 bg-amber-50`}>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-[13px] font-semibold text-amber-800">Payment approval pending</p>
              {pendingPayments.map(p => (
                <p key={p._id} className="mt-1 text-[13px] text-amber-700">
                  {p.plan?.name || 'Plan'} — ₹{p.amount} (submitted {new Date(p.createdAt).toLocaleDateString('en-IN')}). Your payment is under review; the plan will be activated once the admin approves it.
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentPlan && (
        <div className={`${dashboardCardShell} flex items-center justify-between gap-3`}>
          <div>
            <p className="text-[12px] font-medium text-admin-text-secondary">Current Plan</p>
            <h3 className="text-[18px] font-semibold text-admin-text">{(currentPlan as Plan).name}</h3>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
      )}

      {autoRenewStatus?.active && (
        <div className={`${dashboardCardShell} flex flex-wrap items-center justify-between gap-3`}>
          <div>
            <p className="text-[12px] font-medium text-admin-text-secondary">Auto-renew is ON</p>
            <p className="mt-1 text-[13px] text-admin-text">
              {autoRenewStatus.planName} plan renews automatically every {autoRenewStatus.interval === 'yearly' ? 'year' : 'month'}
              {autoRenewStatus.endDate ? ` — next renewal by ${new Date(autoRenewStatus.endDate).toLocaleDateString('en-IN')}` : ''}.
            </p>
          </div>
          <Button variant="outline" onClick={cancelAutoRenewPlan} loading={cancellingAutoRenew}>Cancel Auto-renew</Button>
        </div>
      )}

      {currencies.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[13px] text-admin-text-secondary">Currency</label>
          <select value={selectedCurrency} onChange={e => setSelectedCurrency(e.target.value)} className={fieldClass}>
            {currencies.map(c => (
              <option key={c.code} value={c.code.toUpperCase()}>{c.code.toUpperCase()} — {c.name} ({c.symbol})</option>
            ))}
          </select>
          {isForeign && <span className="text-[12px] text-admin-text-subdued">International pricing — auto-renew & coupons apply to {baseCurrency} only.</span>}
        </div>
      )}

      {!isForeign && usableGateways.some(g => g.id === 'razorpay' && g.autoRenewEnabled !== false) && !autoRenewStatus?.active && (
        <label className={`flex cursor-pointer items-center gap-2 text-[13px] ${couponApplied ? 'text-admin-text-subdued' : 'text-admin-text'}`}>
          <input type="checkbox" checked={autoRenew && !couponApplied} disabled={!!couponApplied} onChange={e => setAutoRenew(e.target.checked)} className="h-4 w-4 rounded border-admin-border text-admin-text focus:ring-admin-border" />
          {couponApplied
            ? 'Auto-renew is off while a coupon is applied — you pay once at the discounted price.'
            : 'Enable auto-renew (Razorpay) — plan amount will be charged automatically every billing cycle. Cancel anytime.'}
        </label>
      )}

      {!isForeign && (
        <div className="flex flex-wrap items-center gap-2">
          <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Have a coupon code?"
            className={`${fieldClass} w-52`} />
          <Button variant="outline" onClick={applyCouponCode} loading={couponChecking} disabled={!couponCode.trim()}>Apply</Button>
          {couponApplied && (
            <span className="text-[13px] font-medium text-admin-text">
              {couponApplied.code} applied
              <button type="button" onClick={() => { setCouponApplied(null); setCouponCode(''); }} className="ml-2 text-[12px] text-admin-text-subdued underline hover:text-admin-text">remove</button>
            </span>
          )}
        </div>
      )}

      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-lg border border-admin-border bg-[#f6f6f7] p-1">
          {(['monthly', 'quarterly', 'yearly'] as const).map(c => (
            <button type="button" key={c} onClick={() => setBillingCycle(c)}
              className={`rounded-md px-4 py-1.5 text-[13px] font-semibold capitalize transition-colors ${billingCycle === c ? 'bg-admin-text text-white' : 'text-admin-text-secondary hover:text-admin-text'}`}>
              {c}{c === 'yearly' ? ' -20%' : ''}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="py-8 text-center text-[13px] text-admin-text-subdued">Loading plans...</div> : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, idx) => {
            const isCurrent = (currentPlan as Plan)?._id === plan._id;
            return (
              <div key={plan._id} className={`${dashboardCardShell} relative ${isCurrent ? 'ring-2 ring-admin-text' : ''}`}>
                <div className="mb-5 text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-admin-border bg-[#f6f6f7] text-admin-text">
                    {planIcons[idx % 3]}
                  </div>
                  <h3 className="text-[16px] font-semibold text-admin-text">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-admin-text">
                      {plan.price === 0 ? 'Free' : priceLabel(plan)}
                    </span>
                    {plan.price > 0 && <span className="text-[13px] text-admin-text-secondary">/{cycleSuffix}</span>}
                  </div>
                </div>
                <div className="mb-5 space-y-2.5">
                  {Object.entries(plan.limits || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 text-[13px]">
                      <Check className="h-4 w-4 shrink-0 text-admin-text" />
                      <span className="text-admin-text-secondary">{val === -1 ? 'Unlimited' : val} {key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                  {plan.features && Object.entries(plan.features as unknown as Record<string, boolean>).filter(([, v]) => v).map(([key]) => (
                    <div key={key} className="flex items-center gap-2 text-[13px]">
                      <Check className="h-4 w-4 shrink-0 text-admin-text" />
                      <span className="text-admin-text-secondary">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
                {pendingPayments.some(p => p.plan?._id === plan._id) ? (
                  <button type="button" className={secondaryBtn} disabled>
                    <Clock className="h-4 w-4" /> Approval Pending
                  </button>
                ) : (
                  <button
                    type="button"
                    className={isCurrent ? secondaryBtn : primaryBtn}
                    onClick={() => handleSubscribe(plan._id)}
                    disabled={isCurrent || subscribing === plan._id}
                  >
                    {subscribing === plan._id ? 'Processing…' : isCurrent ? 'Current Plan' : plan.price === 0 ? 'Get Started' : 'Subscribe'}
                  </button>
                )}
                {(() => {
                  const trialDays = (plan as unknown as { trialDays?: number }).trialDays || 0;
                  const trialMandate = (plan as unknown as { trialRequiresMandate?: boolean }).trialRequiresMandate;
                  const trialUsed = (user as unknown as { trialUsed?: boolean })?.trialUsed;
                  if (trialDays > 0 && plan.price > 0 && !trialUsed && !isCurrent) {
                    return (
                      <>
                        <button
                          type="button"
                          className={`${secondaryBtn} mt-2`}
                          onClick={() => startTrial(plan._id)}
                          disabled={trialStarting === plan._id || subscribing === plan._id}
                        >
                          {trialStarting === plan._id ? 'Starting…' : `Start ${trialDays}-day Free Trial`}
                        </button>
                        {trialMandate && (
                          <p className="mt-1 text-center text-[11px] text-admin-text-subdued">UPI/card required — auto-charges after trial unless cancelled</p>
                        )}
                      </>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })}
        </div>
      )}

      {gatewayPlan && mounted && createPortal(
        <div className={modalOverlayClass}>
          <div className="absolute inset-0 bg-black/45" onClick={() => setGatewayPlan(null)} />
          <div className={`${modalPanelClass} p-5`} role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-semibold text-admin-text">Choose payment method</h3>
                <p className="mt-0.5 text-[13px] text-admin-text-secondary">{gatewayPlan.name} — {priceLabel(gatewayPlan)}/{cycleSuffix}</p>
              </div>
              <button type="button" onClick={() => setGatewayPlan(null)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7]" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {usableGateways.map(g => (
                <button
                  type="button"
                  key={g.id}
                  className="w-full rounded-lg border border-admin-border px-4 py-3 text-left transition-colors hover:bg-[#f6f6f7]"
                  onClick={() => { const id = gatewayPlan._id; setGatewayPlan(null); proceedWithGateway(id, g.id); }}
                >
                  <span className="text-[13px] font-semibold text-admin-text">
                    {{ razorpay: 'Razorpay', stripe: 'Stripe', paypal: 'PayPal', phonepe: 'PhonePe', cashfree: 'Cashfree', payu: 'PayU', paystack: 'Paystack', instamojo: 'Instamojo', flutterwave: 'Flutterwave', mollie: 'Mollie', mercadopago: 'Mercado Pago' }[g.id] || 'Manual / UPI / Bank Transfer'}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-admin-text-subdued">
                    {g.id === 'manual' ? 'Pay & submit reference — admin approves' : g.id === 'stripe' ? 'Cards — instant activation' : g.id === 'paypal' ? 'PayPal — instant activation' : 'UPI, cards, netbanking — instant activation'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      <ManualPaymentModal
        isOpen={showManual}
        onClose={() => setShowManual(false)}
        amount={manualPlan ? resolvePrice(manualPlan).amount : 0}
        info={manualInfo}
        submitting={manualSubmitting}
        onConfirm={submitManualSub}
      />
    </div>
  );
}
