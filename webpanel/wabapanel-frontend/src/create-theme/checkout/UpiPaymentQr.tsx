import { useEffect, useState } from 'react';
import { buildUpiPayUri } from './utils/upi-payment.util';

type Props = {
  upiId: string;
  payeeName?: string;
  amount?: number;
  transactionNote?: string;
  /** Pixel size of the QR image. Defaults to 180. */
  size?: number;
  className?: string;
};

/**
 * Renders a scannable UPI QR from the merchant's UPI ID (static upi://pay link).
 * Used at checkout selection and on the post-order payment confirmation page.
 */
export function UpiPaymentQr({
  upiId,
  payeeName,
  amount,
  transactionNote,
  size = 180,
  className = '',
}: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uri = buildUpiPayUri({ upiId, payeeName, amount, transactionNote });

  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    setError(null);

    void (async () => {
      try {
        const QRCode = await import('qrcode');
        const url = await QRCode.toDataURL(uri, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: size,
          color: { dark: '#121212', light: '#ffffff' },
        });
        if (!cancelled) setDataUrl(url);
      } catch {
        if (!cancelled) setError('Could not generate QR code');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uri, size]);

  if (!upiId.trim()) return null;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`.trim()}>
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`UPI QR code for ${upiId}`}
          width={size}
          height={size}
          className="rounded-md border border-[#dedede] bg-white p-2"
        />
      ) : error ? (
        <p className="text-[12px] text-[#d72c0d]">{error}</p>
      ) : (
        <div
          className="animate-pulse rounded-md border border-[#dedede] bg-[#f3f3f3]"
          style={{ width: size, height: size }}
          aria-hidden
        />
      )}
      <p className="text-center text-[12px] text-[#707070]">Scan with any UPI app to pay</p>
      {typeof amount === 'number' && amount > 0 ? (
        <p className="text-center text-[13px] font-medium text-[#121212]">
          ₹{amount.toFixed(2)}
        </p>
      ) : null}
    </div>
  );
}
