'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { paymentApi } from '@/lib/api';
import ManualPaymentModal, { ManualInfo } from '@/components/billing/ManualPaymentModal';
import { useAuthStore } from '@/stores/authStore';
import useBranding from '@/lib/useBranding';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell, dashboardStatValueClass } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7]';
const chipSelected = 'border-admin-text bg-admin-text text-white';
const chipUnselected = 'border-admin-border bg-white text-admin-text hover:bg-[#f6f6f7]';
const modalOverlayClass = 'fixed inset-0 z-[1300] flex items-center justify-center p-4 sm:p-6';
const modalPanelClass =
  'relative z-10 w-full max-w-sm overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)]';

interface WalletTransaction {
  _id: string; type: string; amount: number; balance: number; description: string; createdAt: string; status: string;
  reference?: string;
}

export default function BillingPage() {
  const { currentWorkspace, user } = useAuthStore();
  const brand = useBranding();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState('500');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gateways, setGateways] = useState<{ id: string; configured: boolean; autoRenewEnabled?: boolean; upiId?: string; qrImageUrl?: string; accountDetails?: string; instructions?: string }[]>([]);
  const [showManual, setShowManual] = useState(false);
  const [showGatewayPick, setShowGatewayPick] = useState(false);
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [autoTopup, setAutoTopup] = useState(false);
  const [autoTopupStatus, setAutoTopupStatus] = useState<{ active: boolean; amount?: number } | null>(null);
  const [cancellingAutoTopup, setCancellingAutoTopup] = useState(false);
  const [mounted, setMounted] = useState(false);
  const walletBalance = user?.walletBalance ?? currentWorkspace?.walletBalance ?? 0;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    paymentApi.getWalletHistory().then(r => setTransactions(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
    paymentApi.getGateways().then(r => setGateways(r.data.data || [])).catch(() => {});
    loadAutoTopup();
    const params = new URLSearchParams(window.location.search);
    const hostedId = params.get('hostedPayment');
    if (hostedId) {
      window.history.replaceState({}, '', window.location.pathname);
      paymentApi.verifyHostedPayment(hostedId).then(r => {
        if (r.data.data?.status === 'completed') {
          toast.success(r.data.message || 'Payment confirmed — wallet credited!');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast(r.data.message || 'Payment not completed yet. If you already paid, refresh in a minute.', { icon: '⏳', duration: 8000 });
        }
      }).catch(() => toast.error('Could not verify the payment. If you were charged, contact support.'));
    }
  }, []);

  const loadAutoTopup = () => {
    paymentApi.getAutoRenewStatus().then(r => setAutoTopupStatus(r.data.data?.wallet || null)).catch(() => {});
  };

  const cancelAutoTopup = async () => {
    if (!confirm('Cancel monthly auto top-up?')) return;
    setCancellingAutoTopup(true);
    try {
      const r = await paymentApi.cancelAutoRenew('wallet');
      toast.success(r.data.message || 'Auto top-up cancelled');
      loadAutoTopup();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to cancel');
    }
    setCancellingAutoTopup(false);
  };

  const usableGateways = gateways.filter(g => g.configured && ['razorpay', 'manual', 'phonepe', 'cashfree', 'payu', 'paypal', 'paystack', 'instamojo', 'flutterwave', 'mollie', 'mercadopago'].includes(g.id));

  const handleTopUp = async () => {
    if (submitting) return;
    if (usableGateways.length === 0) {
      toast.error('No payment method is enabled. Ask admin to enable a gateway (Razorpay, PhonePe, Cashfree, PayU, PayPal or Manual) in Payment Gateways.');
      return;
    }
    if (usableGateways.length > 1) {
      setShowTopUp(false);
      setShowGatewayPick(true);
      return;
    }
    await proceedTopUp(usableGateways[0].id);
  };

  const proceedTopUp = async (gateway: string) => {
    if (submitting) return;
    setSubmitting(true);

    if (['phonepe', 'cashfree', 'payu', 'paypal', 'paystack', 'instamojo', 'flutterwave', 'mollie', 'mercadopago'].includes(gateway)) {
      setTopUpLoading(true);
      try {
        const res = await paymentApi.topUpWallet({ amount: parseFloat(amount), gateway });
        const order = res.data.data;
        if (order?.sessionUrl) { window.location.href = order.sessionUrl; return; }
        toast.error('Could not start the payment. Try again.');
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || 'Failed');
      } finally {
        setSubmitting(false);
        setShowTopUp(false);
        setTopUpLoading(false);
      }
      return;
    }

    if (gateway === 'manual') {
      setShowTopUp(false);
      setSubmitting(false);
      setShowManual(true);
      return;
    }

    setTopUpLoading(true);
    try {
      const res = await paymentApi.topUpWallet({ amount: parseFloat(amount), gateway, ...(autoTopup ? { autoRenew: true } : {}) });
      const order = res.data.data;
      if (typeof window === 'undefined' || !(window as unknown as Record<string, unknown>).Razorpay) {
        toast.error('Payment system not loaded. Refresh the page and try again.');
        return;
      }
      const options = {
        key: order.keyId,
        ...(order.subscriptionId
          ? { subscription_id: order.subscriptionId }
          : { amount: order.amount, currency: 'INR', order_id: order.orderId }),
        name: brand.name, description: order.subscriptionId ? 'Monthly Auto Wallet Top-up' : 'Wallet Top-up',
        handler: async (response: Record<string, string>) => {
          try {
            await paymentApi.verifyWalletTopup({
              paymentId: order.paymentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Wallet topped up!'); window.location.reload();
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { email: user?.email, name: user?.name },
        theme: { color: '#1a1a1a' },
      };
      const rzp = new ((window as unknown as Record<string, new (o: unknown) => { open: () => void }>).Razorpay)(options);
      (rzp as { open: () => void }).open();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
      setShowTopUp(false);
      setTopUpLoading(false);
    }
  };

  const manualInfo: ManualInfo = (() => {
    const m = gateways.find(g => g.id === 'manual');
    return { upiId: m?.upiId, qrImageUrl: m?.qrImageUrl, accountDetails: m?.accountDetails, instructions: m?.instructions };
  })();

  const submitManual = async (reference: string, proofUrl: string) => {
    setManualSubmitting(true);
    try {
      const res = await paymentApi.topUpWallet({ amount: parseFloat(amount), gateway: 'manual', reference, proofUrl });
      toast.success(res.data.message || 'Top-up request submitted. Admin will confirm.');
      setShowManual(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    }
    setManualSubmitting(false);
  };

  const monthSpent = transactions.filter(t => t.type === 'debit' && new Date(t.createdAt).getMonth() === new Date().getMonth()).reduce((a, t) => a + t.amount, 0);
  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((a, t) => a + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((a, t) => a + t.amount, 0);
  const planName = ((user as unknown as { plan?: { name?: string } })?.plan)?.name || (currentWorkspace?.plan as { name?: string })?.name || 'Free';

  const columns = [
    { key: 'type', title: 'Type', render: (t: WalletTransaction) => (
      <div className="flex items-center gap-2">
        {t.type === 'credit' ? <ArrowDownLeft className="h-4 w-4 text-admin-text" /> : <ArrowUpRight className="h-4 w-4 text-red-500" />}
        <span className="capitalize text-admin-text">{t.type}</span>
      </div>
    )},
    { key: 'desc', title: 'Description', render: (t: WalletTransaction) => <span className="text-admin-text">{t.description}</span> },
    { key: 'amount', title: 'Amount', render: (t: WalletTransaction) => (
      <span className={`font-medium ${t.type === 'credit' ? 'text-admin-text' : 'text-red-600'}`}>
        {t.type === 'credit' ? '+' : '-'}₹{t.amount.toFixed(2)}
      </span>
    )},
    { key: 'balance', title: 'Balance', render: (t: WalletTransaction) => `₹${t.balance.toFixed(2)}` },
    { key: 'date', title: 'Date', render: (t: WalletTransaction) => new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
    { key: 'status', title: 'Status', render: (t: WalletTransaction) => <Badge variant={t.status === 'completed' ? 'success' : t.status === 'pending' ? 'warning' : 'default'}>{t.status}</Badge> },
  ];

  const statCards = [
    { label: 'Wallet Balance', value: `₹${walletBalance.toFixed(2)}`, icon: <Wallet className="h-5 w-5" /> },
    { label: 'Current Plan', value: planName, icon: <CreditCard className="h-5 w-5" /> },
    { label: 'This Month Spent', value: `₹${monthSpent.toFixed(2)}`, icon: <ArrowUpRight className="h-5 w-5" /> },
    { label: 'Total Credits', value: `₹${totalCredits.toFixed(2)}`, icon: <ArrowDownLeft className="h-5 w-5" /> },
    { label: 'Total Debits', value: `₹${totalDebits.toFixed(2)}`, icon: <ArrowUpRight className="h-5 w-5" /> },
  ];

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Billing & Wallet</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Manage credits and transactions</p>
        </div>
        <button type="button" className={primaryBtn} onClick={() => setShowTopUp(true)}>
          <Plus className="h-4 w-4" /> Top Up
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <div key={s.label} className={dashboardCardShell}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-admin-border bg-[#f6f6f7] text-admin-text">
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-admin-text-secondary">{s.label}</p>
                <p className={`${dashboardStatValueClass} truncate`}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {autoTopupStatus?.active && (
        <div className={`${dashboardCardShell} flex flex-wrap items-center justify-between gap-3`}>
          <div>
            <p className="text-[12px] font-medium text-admin-text-secondary">Auto Top-up is ON</p>
            <p className="mt-1 text-[13px] text-admin-text">₹{autoTopupStatus.amount} is added to your wallet automatically every month.</p>
          </div>
          <Button variant="outline" onClick={cancelAutoTopup} loading={cancellingAutoTopup}>Cancel Auto Top-up</Button>
        </div>
      )}

      <div className={dashboardCardShell}>
        <h3 className="mb-4 text-[14px] font-semibold text-admin-text">Transaction History</h3>
        <Table columns={columns} data={transactions} loading={loading} emptyText="No transactions yet" />
      </div>

      <Modal isOpen={showTopUp} onClose={() => setShowTopUp(false)} title="Top Up Wallet">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {['500', '1000', '2000', '5000', '10000', '25000'].map(val => (
              <button
                type="button"
                key={val}
                onClick={() => setAmount(val)}
                className={`rounded-lg border p-3 text-center text-[13px] font-medium ${amount === val ? chipSelected : chipUnselected}`}
              >
                ₹{val}
              </button>
            ))}
          </div>
          <Input label="Custom Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="100" />
          {gateways.some(g => g.id === 'razorpay' && g.configured && g.autoRenewEnabled !== false) && !autoTopupStatus?.active && (
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-admin-text">
              <input type="checkbox" checked={autoTopup} onChange={e => setAutoTopup(e.target.checked)} className="h-4 w-4 rounded border-admin-border text-admin-text focus:ring-admin-border" />
              Auto top-up ₹{amount} every month (Razorpay auto-debit) — cancel anytime
            </label>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={secondaryBtn} onClick={() => setShowTopUp(false)}>Cancel</button>
            <button type="button" className={primaryBtn} onClick={handleTopUp} disabled={topUpLoading}>
              {topUpLoading ? 'Processing…' : `Pay ₹${amount}`}
            </button>
          </div>
        </div>
      </Modal>

      <ManualPaymentModal
        isOpen={showManual}
        onClose={() => setShowManual(false)}
        amount={parseFloat(amount) || 0}
        info={manualInfo}
        submitting={manualSubmitting}
        onConfirm={submitManual}
      />

      {showGatewayPick && mounted && createPortal(
        <div className={modalOverlayClass}>
          <div className="absolute inset-0 bg-black/45" onClick={() => setShowGatewayPick(false)} />
          <div className={`${modalPanelClass} p-5`} role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-semibold text-admin-text">Choose payment method</h3>
                <p className="mt-0.5 text-[13px] text-admin-text-secondary">Wallet top-up — ₹{amount}</p>
              </div>
              <button type="button" onClick={() => setShowGatewayPick(false)} className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7]" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {usableGateways.map(g => (
                <button
                  type="button"
                  key={g.id}
                  className="w-full rounded-lg border border-admin-border px-4 py-3 text-left transition-colors hover:bg-[#f6f6f7]"
                  onClick={() => { setShowGatewayPick(false); proceedTopUp(g.id); }}
                >
                  <span className="text-[13px] font-semibold text-admin-text">
                    {{ razorpay: 'Razorpay', stripe: 'Stripe', paypal: 'PayPal', phonepe: 'PhonePe', cashfree: 'Cashfree', payu: 'PayU', paystack: 'Paystack', instamojo: 'Instamojo', flutterwave: 'Flutterwave', mollie: 'Mollie', mercadopago: 'Mercado Pago' }[g.id] || 'Manual / UPI / Bank Transfer'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
