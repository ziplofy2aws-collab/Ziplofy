import transporter from "../config/nodemailer.config";
import {
  buildCustomerInfoHtml,
  buildOrderConfirmationEmailHtml,
  buildSimpleOrderTotalsHtml,
  formatOrderCurrency,
  ORDER_CONFIRMATION_EMAIL_SUBJECT,
} from '../templates/order-confirmation-email.template';
import {
  buildDraftOrderInvoiceEmailHtml,
  buildDraftOrderTotalsHtml,
  DRAFT_ORDER_INVOICE_EMAIL_SUBJECT,
  formatDraftOrderCurrency,
} from '../templates/draft-order-invoice-email.template';
import {
  ORDER_LEVEL_RETURN_LABEL_EMAIL_SUBJECT,
} from '../templates/order-level-return-label-email.template';
import {
  RETURN_CREATED_EMAIL_SUBJECT,
} from '../templates/return-created-email.template';
import {
  RETURN_REQUEST_APPROVED_EMAIL_SUBJECT,
} from '../templates/return-request-approved-email.template';
import {
  RETURN_REQUEST_DECLINED_EMAIL_SUBJECT,
} from '../templates/return-request-declined-email.template';
import {
  RETURN_REQUEST_RECEIVED_EMAIL_SUBJECT,
} from '../templates/return-request-received-email.template';
import {
  PAYMENT_ERROR_EMAIL_SUBJECT,
} from '../templates/payment-error-email.template';
import {
  PAYMENT_REMINDER_EMAIL_SUBJECT,
} from '../templates/payment-reminder-email.template';
import {
  PENDING_PAYMENT_ERROR_EMAIL_SUBJECT,
} from '../templates/pending-payment-error-email.template';
import {
  PENDING_PAYMENT_SUCCESS_EMAIL_SUBJECT,
} from '../templates/pending-payment-success-email.template';
import {
  ORDER_CANCELED_EMAIL_SUBJECT,
} from '../templates/order-canceled-email.template';
import {
  ORDER_EDITED_EMAIL_SUBJECT,
} from '../templates/order-edited-email.template';
import {
  ORDER_INVOICE_EMAIL_SUBJECT,
} from '../templates/order-invoice-email.template';
import {
  ORDER_LINK_EMAIL_SUBJECT,
} from '../templates/order-link-email.template';
import {
  ORDER_PAYMENT_RECEIPT_EMAIL_SUBJECT,
} from '../templates/order-payment-receipt-email.template';
import {
  ORDER_REFUND_EMAIL_SUBJECT,
} from '../templates/order-refund-email.template';
import {
  GIFT_CARD_RECEIPT_EMAIL_SUBJECT,
} from '../templates/gift-card-receipt-email.template';
import {
  NEW_GIFT_CARD_EMAIL_SUBJECT,
} from '../templates/new-gift-card-email.template';
import {
  ORDER_LOCALLY_DELIVERED_EMAIL_SUBJECT,
} from '../templates/order-locally-delivered-email.template';
import {
  ORDER_MISSED_LOCAL_DELIVERY_EMAIL_SUBJECT,
} from '../templates/order-missed-local-delivery-email.template';
import {
  ORDER_OUT_FOR_LOCAL_DELIVERY_EMAIL_SUBJECT,
} from '../templates/order-out-for-local-delivery-email.template';
import {
  PICKED_UP_BY_CUSTOMER_EMAIL_SUBJECT,
} from '../templates/picked-up-by-customer-email.template';
import {
  buildReadyForLocalPickupEmailHtml,
  buildPickupOrderTotalsHtml,
  READY_FOR_LOCAL_PICKUP_EMAIL_SUBJECT,
} from '../templates/ready-for-local-pickup-email.template';
import {
  buildShippingConfirmationEmailHtml,
  SHIPPING_CONFIRMATION_EMAIL_SUBJECT,
} from '../templates/shipping-confirmation-email.template';

export {
  ORDER_CONFIRMATION_EMAIL_SUBJECT,
  DRAFT_ORDER_INVOICE_EMAIL_SUBJECT,
  SHIPPING_CONFIRMATION_EMAIL_SUBJECT,
  READY_FOR_LOCAL_PICKUP_EMAIL_SUBJECT,
  PICKED_UP_BY_CUSTOMER_EMAIL_SUBJECT,
  ORDER_OUT_FOR_LOCAL_DELIVERY_EMAIL_SUBJECT,
  ORDER_LOCALLY_DELIVERED_EMAIL_SUBJECT,
  ORDER_MISSED_LOCAL_DELIVERY_EMAIL_SUBJECT,
  NEW_GIFT_CARD_EMAIL_SUBJECT,
  GIFT_CARD_RECEIPT_EMAIL_SUBJECT,
  ORDER_INVOICE_EMAIL_SUBJECT,
  ORDER_EDITED_EMAIL_SUBJECT,
  ORDER_CANCELED_EMAIL_SUBJECT,
  ORDER_PAYMENT_RECEIPT_EMAIL_SUBJECT,
  ORDER_REFUND_EMAIL_SUBJECT,
  ORDER_LINK_EMAIL_SUBJECT,
  PAYMENT_ERROR_EMAIL_SUBJECT,
  PENDING_PAYMENT_ERROR_EMAIL_SUBJECT,
  PENDING_PAYMENT_SUCCESS_EMAIL_SUBJECT,
  PAYMENT_REMINDER_EMAIL_SUBJECT,
  RETURN_CREATED_EMAIL_SUBJECT,
  ORDER_LEVEL_RETURN_LABEL_EMAIL_SUBJECT,
  RETURN_REQUEST_RECEIVED_EMAIL_SUBJECT,
  RETURN_REQUEST_APPROVED_EMAIL_SUBJECT,
  RETURN_REQUEST_DECLINED_EMAIL_SUBJECT,
};

export enum UrlType {
  VIEW_REQUIREMENTS_FORM = "viewRequirementsForm",
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  url?: string;
  urlType?: UrlType;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const from = process.env.EMAIL_ADDRESS?.trim();
  if (!from) {
    throw new Error('EMAIL_ADDRESS is not configured. Check your .env file.');
  }

  let emailBody = options.body;

  if (options.url) {
    // Add the URL to the body, with a clickable link
    emailBody += `<br/><br/>Link: <a href="${options.url}" target="_blank">${options.url}</a>`;
  }

  const mailOptions = {
    from: `codiic <${from}>`,
    to: options.to,
    subject: options.subject,
    html: emailBody,
  };

  await transporter.sendMail(mailOptions);
};

export interface OrderConfirmationEmailParams {
  storeName?: string;
  customerName: string;
  orderNumber: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  viewOrderUrl?: string;
  storeUrl?: string;
  lineItems?: Array<{ name: string; quantity: number; total: number }>;
  shippingAddressLines?: string[];
  billingAddressLines?: string[];
  currency?: string;
}

function buildDynamicLineItemsHtml(
  lineItems: Array<{ name: string; quantity: number; total: number }>,
  currency: string
): string {
  const PLACEHOLDER_IMAGE =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60" rx="4"/%3E%3Cpath fill="%23d1d5db" d="M18 38l8-10 6 7 10-14 10 17H18z"/%3E%3Ccircle fill="%23d1d5db" cx="22" cy="22" r="4"/%3E%3C/svg%3E';

  return lineItems
    .map(
      (item) => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #e5e5e5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="60" valign="top" style="padding-right:16px;">
              <img src="${PLACEHOLDER_IMAGE}" alt="" width="60" height="60" style="display:block;border-radius:4px;border:1px solid #e5e5e5;" />
            </td>
            <td valign="top" style="font-size:14px;color:#333333;line-height:1.5;">
              ${item.name} &times; ${item.quantity}
            </td>
            <td valign="top" align="right" style="font-size:14px;color:#333333;white-space:nowrap;padding-left:16px;">
              ${formatOrderCurrency(item.total, currency)}
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    )
    .join('');
}

export const getOrderConfirmationEmailBody = (params: OrderConfirmationEmailParams): string => {
  const currency = params.currency ?? 'Rs.';
  const lineItems = params.lineItems ?? [];
  const orderItemsHtml =
    lineItems.length > 0 ? buildDynamicLineItemsHtml(lineItems, currency) : undefined;

  const orderTotalsHtml = buildSimpleOrderTotalsHtml({
    subtotal: formatOrderCurrency(params.subtotal, currency),
    shipping: formatOrderCurrency(params.shippingCost, currency),
    taxes: formatOrderCurrency(params.tax, currency),
    total: `${formatOrderCurrency(params.total, currency)} INR`,
    paymentMethod: 'Payment received',
  });

  const customerInfoHtml =
    params.shippingAddressLines || params.billingAddressLines
      ? buildCustomerInfoHtml({
          shippingLines: params.shippingAddressLines,
          billingLines: params.billingAddressLines ?? params.shippingAddressLines,
        })
      : undefined;

  return buildOrderConfirmationEmailHtml({
    store_name: params.storeName ?? 'My Store',
    order_number: params.orderNumber,
    view_order_url: params.viewOrderUrl ?? '#',
    store_url: params.storeUrl ?? '#',
    ...(orderItemsHtml ? { order_items_html: orderItemsHtml } : {}),
    ...(orderTotalsHtml ? { order_totals_html: orderTotalsHtml } : {}),
    ...(customerInfoHtml ? { customer_info_html: customerInfoHtml } : {}),
  });
};

export const getOrderConfirmationEmailSubject = (orderNumber: string): string =>
  ORDER_CONFIRMATION_EMAIL_SUBJECT.replace(/\{\{order_number\}\}/g, orderNumber);

export interface DraftOrderInvoiceEmailParams {
  storeName?: string;
  orderNumber: string;
  reservationDeadline: string;
  confirmOrderUrl?: string;
  storeUrl?: string;
  lineItems?: Array<{ name: string; quantity: number; variant?: string; total: number }>;
  subtotal: number;
  discount?: number;
  discountCode?: string;
  shippingCost: number;
  duties?: number;
  tax: number;
  totalDueToday: number;
  totalDue: number;
  savings?: number;
  currency?: string;
}

function buildDraftOrderLineItemsHtml(
  lineItems: Array<{ name: string; quantity: number; variant?: string; total: number }>,
  currency: string
): string {
  const PLACEHOLDER_IMAGE =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60" rx="4"/%3E%3Cpath fill="%23d1d5db" d="M18 38l8-10 6 7 10-14 10 17H18z"/%3E%3Ccircle fill="%23d1d5db" cx="22" cy="22" r="4"/%3E%3C/svg%3E';

  return lineItems
    .map(
      (item) => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #e5e5e5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="60" valign="top" style="padding-right:16px;">
              <img src="${PLACEHOLDER_IMAGE}" alt="" width="60" height="60" style="display:block;border-radius:4px;border:1px solid #e5e5e5;" />
            </td>
            <td valign="top" style="font-size:14px;color:#333333;line-height:1.5;">
              ${item.name} &times; ${item.quantity}
              ${item.variant ? `<br/><span style="font-size:13px;color:#717171;">${item.variant}</span>` : ''}
            </td>
            <td valign="top" align="right" style="font-size:14px;color:#333333;white-space:nowrap;padding-left:16px;">
              ${formatDraftOrderCurrency(item.total, currency)}
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    )
    .join('');
}

export const getDraftOrderInvoiceEmailBody = (params: DraftOrderInvoiceEmailParams): string => {
  const currency = params.currency ?? 'Rs.';
  const lineItems = params.lineItems ?? [];
  const orderItemsHtml =
    lineItems.length > 0 ? buildDraftOrderLineItemsHtml(lineItems, currency) : undefined;

  const discountAmount = params.discount ?? 0;
  const orderTotalsHtml = buildDraftOrderTotalsHtml({
    subtotal: formatDraftOrderCurrency(params.subtotal, currency),
    discount: discountAmount > 0 ? `-${formatDraftOrderCurrency(discountAmount, currency)}` : formatDraftOrderCurrency(0, currency),
    discountCode: params.discountCode ?? '',
    shipping: formatDraftOrderCurrency(params.shippingCost, currency),
    duties: formatDraftOrderCurrency(params.duties ?? 0, currency),
    taxes: formatDraftOrderCurrency(params.tax, currency),
    totalDueToday: `${formatDraftOrderCurrency(params.totalDueToday, currency)} INR`,
    totalDue: `${formatDraftOrderCurrency(params.totalDue, currency)} INR`,
    savings: params.savings ? formatDraftOrderCurrency(params.savings, currency) : formatDraftOrderCurrency(0, currency),
  });

  return buildDraftOrderInvoiceEmailHtml({
    store_name: params.storeName ?? 'My Store',
    order_number: params.orderNumber,
    reservation_deadline: params.reservationDeadline,
    confirm_order_url: params.confirmOrderUrl ?? '#',
    store_url: params.storeUrl ?? '#',
    ...(orderItemsHtml ? { order_items_html: orderItemsHtml } : {}),
    ...(orderTotalsHtml ? { order_totals_html: orderTotalsHtml } : {}),
  });
};

export const getDraftOrderInvoiceEmailSubject = (orderNumber: string): string =>
  DRAFT_ORDER_INVOICE_EMAIL_SUBJECT.replace(/\{\{order_number\}\}/g, orderNumber);

export interface ShippingConfirmationEmailParams {
  storeName?: string;
  orderNumber: string;
  viewOrderUrl?: string;
  trackingUrl?: string;
  storeUrl?: string;
  carrierName?: string;
  trackingNumber?: string;
  supportEmail?: string;
  lineItems?: Array<{ name: string; quantity: number; subtitle?: string }>;
}

function buildDynamicShipmentItemsHtml(
  lineItems: Array<{ name: string; quantity: number; subtitle?: string }>
): string {
  const PLACEHOLDER_IMAGE =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60" rx="4"/%3E%3Cpath fill="%23d1d5db" d="M18 38l8-10 6 7 10-14 10 17H18z"/%3E%3Ccircle fill="%23d1d5db" cx="22" cy="22" r="4"/%3E%3C/svg%3E';

  return lineItems
    .map(
      (item) => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #e5e5e5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="60" valign="top" style="padding-right:16px;">
              <img src="${PLACEHOLDER_IMAGE}" alt="" width="60" height="60" style="display:block;border-radius:4px;border:1px solid #e5e5e5;" />
            </td>
            <td valign="top" style="font-size:14px;color:#333333;line-height:1.5;">
              ${item.name} &times; ${item.quantity}
              ${item.subtitle ? `<br/><span style="font-size:13px;color:#717171;">${item.subtitle}</span>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    )
    .join('');
}

export const getShippingConfirmationEmailBody = (params: ShippingConfirmationEmailParams): string => {
  const lineItems = params.lineItems ?? [];
  const shipmentItemsHtml =
    lineItems.length > 0 ? buildDynamicShipmentItemsHtml(lineItems) : undefined;

  return buildShippingConfirmationEmailHtml({
    store_name: params.storeName ?? 'My Store',
    order_number: params.orderNumber,
    view_order_url: params.viewOrderUrl ?? '#',
    tracking_url: params.trackingUrl ?? '#',
    store_url: params.storeUrl ?? '#',
    carrier_name: params.carrierName ?? 'UPS',
    tracking_number: params.trackingNumber ?? '',
    support_email: params.supportEmail ?? 'support@example.com',
    ...(shipmentItemsHtml ? { shipment_items_html: shipmentItemsHtml } : {}),
  });
};

export const getShippingConfirmationEmailSubject = (orderNumber: string): string =>
  SHIPPING_CONFIRMATION_EMAIL_SUBJECT.replace(/\{\{order_number\}\}/g, orderNumber);

export interface ReadyForLocalPickupEmailParams {
  storeName?: string;
  orderNumber: string;
  viewOrderUrl?: string;
  storeUrl?: string;
  pickupLocationName: string;
  pickupAddressLine1: string;
  pickupAddressLine2?: string;
  pickupCity: string;
  pickupState: string;
  pickupZip: string;
  pickupMapUrl?: string;
  lineItems?: Array<{
    name: string;
    quantity: number;
    price: number;
    subtitle?: string;
    discountNote?: string;
    compareAtPrice?: number;
  }>;
  subtotal?: number;
  discount?: number;
  discountCode?: string;
  shippingOriginal?: number;
  shippingDiscountCode?: string;
  tax?: number;
  total?: number;
  savings?: number;
  currency?: string;
}

function buildDynamicPickupLineItemsHtml(
  lineItems: ReadyForLocalPickupEmailParams['lineItems'],
  currency: string
): string {
  const PLACEHOLDER_IMAGE =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60" rx="4"/%3E%3Cpath fill="%23d1d5db" d="M18 38l8-10 6 7 10-14 10 17H18z"/%3E%3Ccircle fill="%23d1d5db" cx="22" cy="22" r="4"/%3E%3C/svg%3E';

  return (lineItems ?? [])
    .map((item) => {
      const price = formatOrderCurrency(item.price, currency);
      const compareAt =
        item.compareAtPrice !== undefined
          ? formatOrderCurrency(item.compareAtPrice, currency)
          : undefined;
      const priceCell = compareAt
        ? `<span style="text-decoration:line-through;color:#717171;margin-right:6px;">${compareAt}</span>${price}`
        : price;

      return `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #e5e5e5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="60" valign="top" style="padding-right:16px;">
              <img src="${PLACEHOLDER_IMAGE}" alt="" width="60" height="60" style="display:block;border-radius:4px;border:1px solid #e5e5e5;" />
            </td>
            <td valign="top" style="font-size:14px;color:#333333;line-height:1.5;">
              ${item.name} &times; ${item.quantity}
              ${item.subtitle ? `<br/><span style="font-size:13px;color:#717171;">${item.subtitle}</span>` : ''}
              ${item.discountNote ? `<br/><span style="font-size:13px;color:#717171;">${item.discountNote}</span>` : ''}
            </td>
            <td valign="top" align="right" style="font-size:14px;color:#333333;white-space:nowrap;padding-left:16px;">
              ${priceCell}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
    })
    .join('');
}

export const getReadyForLocalPickupEmailBody = (params: ReadyForLocalPickupEmailParams): string => {
  const currency = params.currency ?? 'Rs.';
  const lineItems = params.lineItems ?? [];
  const orderItemsHtml =
    lineItems.length > 0 ? buildDynamicPickupLineItemsHtml(lineItems, currency) : undefined;

  const orderTotalsHtml =
    params.subtotal !== undefined && params.total !== undefined
      ? buildPickupOrderTotalsHtml({
          subtotal: formatOrderCurrency(params.subtotal, currency),
          discount: params.discount
            ? `-${formatOrderCurrency(params.discount, currency)}`
            : formatOrderCurrency(0, currency),
          discountCode: params.discountCode ?? '',
          shipping: 'Free',
          shippingOriginal: formatOrderCurrency(params.shippingOriginal ?? 0, currency),
          shippingDiscountCode: params.shippingDiscountCode ?? '',
          taxes: formatOrderCurrency(params.tax ?? 0, currency),
          total: `${formatOrderCurrency(params.total, currency)} INR`,
          savings: params.savings
            ? formatOrderCurrency(params.savings, currency)
            : formatOrderCurrency(0, currency),
        })
      : undefined;

  return buildReadyForLocalPickupEmailHtml({
    store_name: params.storeName ?? 'My Store',
    order_number: params.orderNumber,
    view_order_url: params.viewOrderUrl ?? '#',
    store_url: params.storeUrl ?? '#',
    pickup_location_name: params.pickupLocationName,
    pickup_address_line1: params.pickupAddressLine1,
    pickup_address_line2: params.pickupAddressLine2 ?? '',
    pickup_city: params.pickupCity,
    pickup_state: params.pickupState,
    pickup_zip: params.pickupZip,
    pickup_map_url: params.pickupMapUrl ?? '#',
    ...(orderItemsHtml ? { order_items_html: orderItemsHtml } : {}),
    ...(orderTotalsHtml ? { order_totals_html: orderTotalsHtml } : {}),
  });
};

export const getReadyForLocalPickupEmailSubject = (): string => READY_FOR_LOCAL_PICKUP_EMAIL_SUBJECT;