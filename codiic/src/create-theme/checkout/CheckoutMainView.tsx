import { ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStorefrontAuth, useStorefrontCart } from '@render-store/sdk';
import type {
  CheckoutAddressFields,
  CheckoutCustomerInformation,
  CheckoutFormValues,
  CheckoutMainViewHandle,
  CheckoutPaymentMethodOption,
} from './checkout-form.types';
import {
  createEmptyCheckoutFormValues,
  DEFAULT_CHECKOUT_CUSTOMER_INFORMATION as DEFAULT_CUSTOMER_INFO,
} from './checkout-form.types';
import { isColorDark } from './settings/checkout-color.utils';
import { buildCheckoutFieldChrome, type CheckoutMainViewTypography } from './checkout-form-styles';
import { UpiPaymentQr } from './UpiPaymentQr';
import {
  CHECKOUT_DEFAULT_SHIPPING_AMOUNT,
  CHECKOUT_DEFAULT_TAX_RATE_PERCENT,
  computeCheckoutTotals,
  validateCheckoutForm,
} from './utils/checkout-order.utils';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Delhi',
  'Gujarat',
  'Karnataka',
  'Maharashtra',
  'Rajasthan',
  'Tamil Nadu',
  'Uttar Pradesh',
  'West Bengal',
];

type Props = {
  accentColor?: string;
  buttonColor?: string;
  addressAutocompletion?: boolean;
  inputFieldsTransparent?: boolean;
  typography?: CheckoutMainViewTypography;
  device?: 'desktop' | 'mobile';
  onCompleteOrder?: () => void;
  submitting?: boolean;
  availablePaymentMethods?: CheckoutPaymentMethodOption[];
  customerInformation?: CheckoutCustomerInformation;
  /** Shown as UPI payee name in the QR when paying via UPI. */
  storeName?: string;
};

function fieldLabelWithRequirement(label: string, option: 'dont_include' | 'optional' | 'required') {
  if (option === 'optional') return `${label} (optional)`;
  return label;
}

function FieldLabel({
  htmlFor,
  label,
  chrome,
}: {
  htmlFor: string;
  label: string;
  chrome: ReturnType<typeof buildCheckoutFieldChrome>;
}) {
  return (
    <label htmlFor={htmlFor} className={`mb-1.5 block text-[12px] leading-tight ${chrome.labelClass}`}>
      {label}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-[12px] text-[#d72c0d]">{message}</p>;
}

function LiveCheckbox({
  id,
  label,
  checked,
  onChange,
  chrome,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  chrome: ReturnType<typeof buildCheckoutFieldChrome>;
}) {
  return (
    <label htmlFor={id} className={`flex cursor-pointer items-start gap-2.5 text-[14px] ${chrome.valueClass}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`mt-0.5 h-[18px] w-[18px] shrink-0 rounded-[4px] border ${chrome.checkboxClass}`}
      />
      <span className="leading-snug">{label}</span>
    </label>
  );
}

function AddressFieldsSection({
  idPrefix,
  address,
  onChange,
  chrome,
  isMobile,
  addressAutocompletion,
  errors,
  customerInformation = DEFAULT_CUSTOMER_INFO,
  applyShippingPhoneSetting = false,
}: {
  idPrefix: string;
  address: CheckoutAddressFields;
  onChange: (next: CheckoutAddressFields) => void;
  chrome: ReturnType<typeof buildCheckoutFieldChrome>;
  isMobile: boolean;
  addressAutocompletion?: boolean;
  errors: Record<string, string>;
  customerInformation?: CheckoutCustomerInformation;
  applyShippingPhoneSetting?: boolean;
}) {
  const set = (patch: Partial<CheckoutAddressFields>) => onChange({ ...address, ...patch });
  const showFirstName = customerInformation.fullNameOption === 'first_last';
  const showCompany = customerInformation.companyNameOption !== 'dont_include';
  const showApartment = customerInformation.addressLine2Option !== 'dont_include';
  const phoneOption = applyShippingPhoneSetting
    ? customerInformation.shippingPhoneOption
    : 'optional';
  const showPhone = phoneOption !== 'dont_include';

  return (
    <div className="space-y-3">
      <div>
        <FieldLabel htmlFor={`${idPrefix}-country`} label="Country/Region" chrome={chrome} />
        <div className="relative">
          <select
            id={`${idPrefix}-country`}
            value={address.country}
            onChange={(e) => set({ country: e.target.value })}
            className={`${chrome.selectClass} appearance-none pr-10`}
          >
            <option value="IN">India</option>
          </select>
          <ChevronDownIcon
            className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${chrome.iconClass}`}
            aria-hidden
          />
        </div>
        <FieldError message={errors[`${idPrefix}.country`]} />
      </div>

      {showFirstName ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor={`${idPrefix}-first-name`} label="First name" chrome={chrome} />
            <input
              id={`${idPrefix}-first-name`}
              type="text"
              autoComplete="given-name"
              value={address.firstName}
              onChange={(e) => set({ firstName: e.target.value })}
              className={chrome.inputClass}
            />
            <FieldError message={errors[`${idPrefix}.firstName`]} />
          </div>
          <div>
            <FieldLabel htmlFor={`${idPrefix}-last-name`} label="Last name" chrome={chrome} />
            <input
              id={`${idPrefix}-last-name`}
              type="text"
              autoComplete="family-name"
              value={address.lastName}
              onChange={(e) => set({ lastName: e.target.value })}
              className={chrome.inputClass}
            />
            <FieldError message={errors[`${idPrefix}.lastName`]} />
          </div>
        </div>
      ) : (
        <div>
          <FieldLabel htmlFor={`${idPrefix}-last-name`} label="Last name" chrome={chrome} />
          <input
            id={`${idPrefix}-last-name`}
            type="text"
            autoComplete="family-name"
            value={address.lastName}
            onChange={(e) => set({ lastName: e.target.value })}
            className={chrome.inputClass}
          />
          <FieldError message={errors[`${idPrefix}.lastName`]} />
        </div>
      )}

      {showCompany ? (
        <div>
          <FieldLabel
            htmlFor={`${idPrefix}-company`}
            label={fieldLabelWithRequirement('Company', customerInformation.companyNameOption)}
            chrome={chrome}
          />
          <input
            id={`${idPrefix}-company`}
            type="text"
            autoComplete="organization"
            value={address.company}
            onChange={(e) => set({ company: e.target.value })}
            className={chrome.inputClass}
          />
          <FieldError message={errors[`${idPrefix}.company`]} />
        </div>
      ) : null}

      <div>
        <FieldLabel htmlFor={`${idPrefix}-address`} label="Address" chrome={chrome} />
        <input
          id={`${idPrefix}-address`}
          type="text"
          autoComplete="street-address"
          value={address.address}
          onChange={(e) => set({ address: e.target.value })}
          className={chrome.inputClass}
          placeholder={addressAutocompletion ? 'Start typing your address' : undefined}
        />
        <FieldError message={errors[`${idPrefix}.address`]} />
      </div>

      {showApartment ? (
        <div>
          <FieldLabel
            htmlFor={`${idPrefix}-apartment`}
            label={fieldLabelWithRequirement(
              'Apartment, suite, etc.',
              customerInformation.addressLine2Option
            )}
            chrome={chrome}
          />
          <input
            id={`${idPrefix}-apartment`}
            type="text"
            autoComplete="address-line2"
            value={address.apartment}
            onChange={(e) => set({ apartment: e.target.value })}
            className={chrome.inputClass}
          />
          <FieldError message={errors[`${idPrefix}.apartment`]} />
        </div>
      ) : null}

      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        <div>
          <FieldLabel htmlFor={`${idPrefix}-city`} label="City" chrome={chrome} />
          <input
            id={`${idPrefix}-city`}
            type="text"
            autoComplete="address-level2"
            value={address.city}
            onChange={(e) => set({ city: e.target.value })}
            className={chrome.inputClass}
          />
          <FieldError message={errors[`${idPrefix}.city`]} />
        </div>
        <div>
          <FieldLabel htmlFor={`${idPrefix}-state`} label="State" chrome={chrome} />
          <div className="relative">
            <select
              id={`${idPrefix}-state`}
              value={address.state}
              onChange={(e) => set({ state: e.target.value })}
              className={`${chrome.selectClass} appearance-none pr-10`}
            >
              {INDIAN_STATES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${chrome.iconClass}`}
              aria-hidden
            />
          </div>
          <FieldError message={errors[`${idPrefix}.state`]} />
        </div>
        <div>
          <FieldLabel htmlFor={`${idPrefix}-pin`} label="PIN code" chrome={chrome} />
          <input
            id={`${idPrefix}-pin`}
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            value={address.pinCode}
            onChange={(e) => set({ pinCode: e.target.value })}
            className={chrome.inputClass}
          />
          <FieldError message={errors[`${idPrefix}.pinCode`]} />
        </div>
      </div>

      {showPhone ? (
        <div>
          <FieldLabel
            htmlFor={`${idPrefix}-phone`}
            label={fieldLabelWithRequirement('Phone', phoneOption)}
            chrome={chrome}
          />
          <div className="relative">
            <input
              id={`${idPrefix}-phone`}
              type="tel"
              autoComplete="tel"
              value={address.phone}
              onChange={(e) => set({ phone: e.target.value })}
              className={chrome.inputClass}
            />
            <QuestionMarkCircleIcon
              className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                chrome.iconClass
              }`}
              aria-hidden
            />
          </div>
          <FieldError message={errors[`${idPrefix}.phone`]} />
        </div>
      ) : null}
    </div>
  );
}

export const CheckoutMainView = forwardRef<CheckoutMainViewHandle, Props>(function CheckoutMainView(
  {
    accentColor = '#1773b0',
    buttonColor = '#1773b0',
    addressAutocompletion = false,
    inputFieldsTransparent = false,
    typography,
    device = 'desktop',
    onCompleteOrder,
    submitting = false,
    availablePaymentMethods,
    customerInformation = DEFAULT_CUSTOMER_INFO,
    storeName,
  },
  ref
) {
  const isMobile = device === 'mobile';
  const chrome = buildCheckoutFieldChrome(inputFieldsTransparent);
  const buttonTextColor = isColorDark(buttonColor) ? '#ffffff' : '#121212';
  const selectionStyle = {
    borderColor: accentColor,
    boxShadow: `inset 0 0 0 1px ${accentColor}`,
  };
  const { user } = useStorefrontAuth();
  const { getAllItems } = useStorefrontCart();
  const cartLines = getAllItems();
  const checkoutTotals = useMemo(
    () => computeCheckoutTotals(cartLines, { taxRatePercent: CHECKOUT_DEFAULT_TAX_RATE_PERCENT }),
    [cartLines]
  );

  const paymentMethods =
    availablePaymentMethods && availablePaymentMethods.length > 0
      ? availablePaymentMethods
      : [{ key: 'cod' as const, label: 'Cash on Delivery (COD)' }];

  const [form, setForm] = useState<CheckoutFormValues>(createEmptyCheckoutFormValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const selectedPaymentMethod =
    paymentMethods.find((method) => method.key === form.paymentMethod) ?? paymentMethods[0];

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      email: user.email || prev.email,
      shipping: {
        ...prev.shipping,
        firstName:
          customerInformation.fullNameOption === 'first_last'
            ? user.firstName || prev.shipping.firstName
            : prev.shipping.firstName,
        lastName: user.lastName || prev.shipping.lastName,
        phone:
          customerInformation.shippingPhoneOption !== 'dont_include'
            ? user.phoneNumber || prev.shipping.phone
            : prev.shipping.phone,
      },
    }));
  }, [user, customerInformation]);

  useEffect(() => {
    setForm((prev) => {
      const hasCurrent = paymentMethods.some((method) => method.key === prev.paymentMethod);
      if (hasCurrent) return prev;
      return { ...prev, paymentMethod: paymentMethods[0]?.key ?? 'cod' };
    });
  }, [paymentMethods]);

  useImperativeHandle(ref, () => ({
    getValues: () => form,
    validate: () => {
      const errors = validateCheckoutForm(form, customerInformation);
      setFieldErrors(errors);
      return Object.keys(errors).length === 0;
    },
  }));

  const handleCompleteOrder = () => {
    const errors = validateCheckoutForm(form, customerInformation);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    onCompleteOrder?.();
  };

  return (
    <main
      className={`mx-auto w-full ${isMobile ? 'max-w-none px-4 py-6' : 'max-w-[580px] px-6 py-8 sm:px-8'}`}
      style={typography?.bodyFontFamily ? { fontFamily: typography.bodyFontFamily } : undefined}
    >
      <div className={isMobile ? 'space-y-6' : 'space-y-8'}>
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2
              className={`font-semibold ${chrome.headingClass} ${isMobile ? 'text-[17px]' : 'text-[19px]'}`}
              style={typography?.headingsFontFamily ? { fontFamily: typography.headingsFontFamily } : undefined}
            >
              Contact
            </h2>
            {!user ? (
              <Link
                to="/auth/login"
                state={{ from: '/checkout' }}
                className={`shrink-0 font-medium hover:underline ${isMobile ? 'text-[13px]' : 'text-[14px]'}`}
                style={{ color: accentColor }}
              >
                Sign in
              </Link>
            ) : null}
          </div>

          <div className="space-y-3">
            <div>
              <FieldLabel htmlFor="checkout-email" label="Email" chrome={chrome} />
              <input
                id="checkout-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className={chrome.inputClass}
                placeholder="Email"
              />
              <FieldError message={fieldErrors.email} />
            </div>
            <LiveCheckbox
              id="checkout-marketing"
              label="Email me with news and offers"
              checked={form.marketingOptIn}
              onChange={(marketingOptIn) => setForm((prev) => ({ ...prev, marketingOptIn }))}
              chrome={chrome}
            />
          </div>
        </section>

        <section>
          <h2
            className={`mb-4 font-semibold ${chrome.headingClass} ${isMobile ? 'text-[17px]' : 'text-[19px]'}`}
            style={typography?.headingsFontFamily ? { fontFamily: typography.headingsFontFamily } : undefined}
          >
            Delivery
          </h2>

          <AddressFieldsSection
            idPrefix="shipping"
            address={form.shipping}
            onChange={(shipping) => setForm((prev) => ({ ...prev, shipping }))}
            chrome={chrome}
            isMobile={isMobile}
            addressAutocompletion={addressAutocompletion}
            errors={fieldErrors}
            customerInformation={customerInformation}
            applyShippingPhoneSetting
          />

          <div className="mt-3">
            <LiveCheckbox
              id="checkout-save-info"
              label="Save this information for next time"
              checked={form.saveInfo}
              onChange={(saveInfo) => setForm((prev) => ({ ...prev, saveInfo }))}
              chrome={chrome}
            />
          </div>
        </section>

        <section>
          <h2
            className={`mb-4 font-semibold ${chrome.headingClass} ${isMobile ? 'text-[17px]' : 'text-[19px]'}`}
            style={typography?.headingsFontFamily ? { fontFamily: typography.headingsFontFamily } : undefined}
          >
            Shipping method
          </h2>
          <div
            className={`flex items-center justify-between rounded-[5px] border px-4 py-3.5 ${
              inputFieldsTransparent ? 'bg-transparent' : ''
            }`}
            style={selectionStyle}
          >
            <span className={`text-[14px] ${chrome.valueClass}`}>Standard</span>
            <span className={`text-[14px] tabular-nums ${chrome.valueClass}`}>
              ₹{CHECKOUT_DEFAULT_SHIPPING_AMOUNT.toFixed(2)}
            </span>
          </div>
        </section>

        <section>
          <h2
            className={`font-semibold ${chrome.headingClass} ${isMobile ? 'text-[17px]' : 'text-[19px]'}`}
            style={typography?.headingsFontFamily ? { fontFamily: typography.headingsFontFamily } : undefined}
          >
            Payment
          </h2>
          <p className={`mt-1 text-[14px] ${chrome.bodyMutedClass}`}>
            All transactions are secure and encrypted.
          </p>

          <div className="mt-4 space-y-3">
            {paymentMethods.map((method) => (
              <label
                key={method.key}
                className={`flex cursor-pointer items-center justify-between rounded-[5px] border px-4 py-3.5 ${
                  inputFieldsTransparent ? 'bg-transparent' : ''
                }`}
                style={form.paymentMethod === method.key ? selectionStyle : undefined}
              >
                <span className={`text-[14px] ${chrome.valueClass}`}>{method.label}</span>
                <input
                  type="radio"
                  name="checkout-payment"
                  value={method.key}
                  checked={form.paymentMethod === method.key}
                  onChange={() => setForm((prev) => ({ ...prev, paymentMethod: method.key }))}
                  className="h-4 w-4 shrink-0"
                  style={{ accentColor }}
                />
              </label>
            ))}
          </div>

          {selectedPaymentMethod?.instructions ? (
            <div
              className={`mt-4 rounded-[5px] border px-4 py-3.5 text-[13px] leading-relaxed ${
                inputFieldsTransparent ? 'bg-transparent' : 'bg-[#fafafa]'
              }`}
            >
              {selectedPaymentMethod.key === 'bank_transfer' ? (
                <div className={`space-y-1 ${chrome.valueClass}`}>
                  <p className="font-medium">Transfer payment to:</p>
                  {selectedPaymentMethod.instructions.bankName ? (
                    <p>Bank: {selectedPaymentMethod.instructions.bankName}</p>
                  ) : null}
                  {selectedPaymentMethod.instructions.accountNumber ? (
                    <p>Account: {selectedPaymentMethod.instructions.accountNumber}</p>
                  ) : null}
                  {selectedPaymentMethod.instructions.ifscCode ? (
                    <p>IFSC: {selectedPaymentMethod.instructions.ifscCode}</p>
                  ) : null}
                </div>
              ) : null}
              {selectedPaymentMethod.key === 'upi_id' && selectedPaymentMethod.instructions.upiId ? (
                <div className={`space-y-4 ${chrome.valueClass}`}>
                  <div>
                    <p className="font-medium">Pay to UPI ID:</p>
                    <p>{selectedPaymentMethod.instructions.upiId}</p>
                  </div>
                  <UpiPaymentQr
                    upiId={selectedPaymentMethod.instructions.upiId}
                    payeeName={storeName}
                    amount={checkoutTotals.total > 0 ? checkoutTotals.total : undefined}
                    transactionNote="Order payment"
                    size={isMobile ? 160 : 180}
                  />
                  <p className="text-[12px] opacity-80">
                    After placing your order you will confirm payment with the UTR / transaction ID.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6">
            <h3
              className={`mb-3 text-[14px] font-medium ${chrome.headingClass}`}
              style={typography?.headingsFontFamily ? { fontFamily: typography.headingsFontFamily } : undefined}
            >
              Billing address
            </h3>
            <div
              className={`overflow-hidden rounded-[5px] border ${
                inputFieldsTransparent ? 'border-white/90' : 'border-[#dedede]'
              }`}
            >
              <label
                className={`flex cursor-pointer items-center gap-3 border-b px-4 py-3.5 ${
                  inputFieldsTransparent ? 'border-white/90 bg-transparent' : 'border-[#dedede] bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="checkout-billing"
                  checked={form.billingSameAsShipping}
                  onChange={() => setForm((prev) => ({ ...prev, billingSameAsShipping: true }))}
                  className="h-[18px] w-[18px] shrink-0"
                  style={{ accentColor }}
                />
                <span className={`text-[14px] ${chrome.valueClass}`}>Same as shipping address</span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 ${
                  inputFieldsTransparent ? 'bg-transparent' : 'bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="checkout-billing"
                  checked={!form.billingSameAsShipping}
                  onChange={() => setForm((prev) => ({ ...prev, billingSameAsShipping: false }))}
                  className="h-[18px] w-[18px] shrink-0"
                  style={{ accentColor }}
                />
                <span className={`text-[14px] ${chrome.valueClass}`}>Use a different billing address</span>
              </label>
            </div>

            {!form.billingSameAsShipping ? (
              <div className="mt-4">
                <AddressFieldsSection
                  idPrefix="billing"
                  address={form.billing}
                  onChange={(billing) => setForm((prev) => ({ ...prev, billing }))}
                  chrome={chrome}
                  isMobile={isMobile}
                  errors={fieldErrors}
                  customerInformation={customerInformation}
                />
              </div>
            ) : null}
          </div>
        </section>

        <section>
          <button
            type="button"
            disabled={submitting}
            onClick={handleCompleteOrder}
            className="w-full rounded-[5px] px-4 py-4 text-center text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: buttonColor, color: buttonTextColor }}
          >
            {submitting ? 'Processing…' : 'Complete order'}
          </button>
        </section>
      </div>
    </main>
  );
});
