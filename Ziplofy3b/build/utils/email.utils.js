"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReadyForLocalPickupEmailSubject = exports.getReadyForLocalPickupEmailBody = exports.getShippingConfirmationEmailSubject = exports.getShippingConfirmationEmailBody = exports.getDraftOrderInvoiceEmailSubject = exports.getDraftOrderInvoiceEmailBody = exports.getOrderConfirmationEmailSubject = exports.getOrderConfirmationEmailBody = exports.sendEmail = exports.UrlType = exports.RETURN_REQUEST_DECLINED_EMAIL_SUBJECT = exports.RETURN_REQUEST_APPROVED_EMAIL_SUBJECT = exports.RETURN_REQUEST_RECEIVED_EMAIL_SUBJECT = exports.ORDER_LEVEL_RETURN_LABEL_EMAIL_SUBJECT = exports.RETURN_CREATED_EMAIL_SUBJECT = exports.PAYMENT_REMINDER_EMAIL_SUBJECT = exports.PENDING_PAYMENT_SUCCESS_EMAIL_SUBJECT = exports.PENDING_PAYMENT_ERROR_EMAIL_SUBJECT = exports.PAYMENT_ERROR_EMAIL_SUBJECT = exports.ORDER_LINK_EMAIL_SUBJECT = exports.ORDER_REFUND_EMAIL_SUBJECT = exports.ORDER_PAYMENT_RECEIPT_EMAIL_SUBJECT = exports.ORDER_CANCELED_EMAIL_SUBJECT = exports.ORDER_EDITED_EMAIL_SUBJECT = exports.ORDER_INVOICE_EMAIL_SUBJECT = exports.GIFT_CARD_RECEIPT_EMAIL_SUBJECT = exports.NEW_GIFT_CARD_EMAIL_SUBJECT = exports.ORDER_MISSED_LOCAL_DELIVERY_EMAIL_SUBJECT = exports.ORDER_LOCALLY_DELIVERED_EMAIL_SUBJECT = exports.ORDER_OUT_FOR_LOCAL_DELIVERY_EMAIL_SUBJECT = exports.PICKED_UP_BY_CUSTOMER_EMAIL_SUBJECT = exports.READY_FOR_LOCAL_PICKUP_EMAIL_SUBJECT = exports.SHIPPING_CONFIRMATION_EMAIL_SUBJECT = exports.DRAFT_ORDER_INVOICE_EMAIL_SUBJECT = exports.ORDER_CONFIRMATION_EMAIL_SUBJECT = void 0;
const nodemailer_config_1 = __importDefault(require("../config/nodemailer.config"));
const order_confirmation_email_template_1 = require("../templates/order-confirmation-email.template");
Object.defineProperty(exports, "ORDER_CONFIRMATION_EMAIL_SUBJECT", { enumerable: true, get: function () { return order_confirmation_email_template_1.ORDER_CONFIRMATION_EMAIL_SUBJECT; } });
const draft_order_invoice_email_template_1 = require("../templates/draft-order-invoice-email.template");
Object.defineProperty(exports, "DRAFT_ORDER_INVOICE_EMAIL_SUBJECT", { enumerable: true, get: function () { return draft_order_invoice_email_template_1.DRAFT_ORDER_INVOICE_EMAIL_SUBJECT; } });
const order_level_return_label_email_template_1 = require("../templates/order-level-return-label-email.template");
Object.defineProperty(exports, "ORDER_LEVEL_RETURN_LABEL_EMAIL_SUBJECT", { enumerable: true, get: function () { return order_level_return_label_email_template_1.ORDER_LEVEL_RETURN_LABEL_EMAIL_SUBJECT; } });
const return_created_email_template_1 = require("../templates/return-created-email.template");
Object.defineProperty(exports, "RETURN_CREATED_EMAIL_SUBJECT", { enumerable: true, get: function () { return return_created_email_template_1.RETURN_CREATED_EMAIL_SUBJECT; } });
const return_request_approved_email_template_1 = require("../templates/return-request-approved-email.template");
Object.defineProperty(exports, "RETURN_REQUEST_APPROVED_EMAIL_SUBJECT", { enumerable: true, get: function () { return return_request_approved_email_template_1.RETURN_REQUEST_APPROVED_EMAIL_SUBJECT; } });
const return_request_declined_email_template_1 = require("../templates/return-request-declined-email.template");
Object.defineProperty(exports, "RETURN_REQUEST_DECLINED_EMAIL_SUBJECT", { enumerable: true, get: function () { return return_request_declined_email_template_1.RETURN_REQUEST_DECLINED_EMAIL_SUBJECT; } });
const return_request_received_email_template_1 = require("../templates/return-request-received-email.template");
Object.defineProperty(exports, "RETURN_REQUEST_RECEIVED_EMAIL_SUBJECT", { enumerable: true, get: function () { return return_request_received_email_template_1.RETURN_REQUEST_RECEIVED_EMAIL_SUBJECT; } });
const payment_error_email_template_1 = require("../templates/payment-error-email.template");
Object.defineProperty(exports, "PAYMENT_ERROR_EMAIL_SUBJECT", { enumerable: true, get: function () { return payment_error_email_template_1.PAYMENT_ERROR_EMAIL_SUBJECT; } });
const payment_reminder_email_template_1 = require("../templates/payment-reminder-email.template");
Object.defineProperty(exports, "PAYMENT_REMINDER_EMAIL_SUBJECT", { enumerable: true, get: function () { return payment_reminder_email_template_1.PAYMENT_REMINDER_EMAIL_SUBJECT; } });
const pending_payment_error_email_template_1 = require("../templates/pending-payment-error-email.template");
Object.defineProperty(exports, "PENDING_PAYMENT_ERROR_EMAIL_SUBJECT", { enumerable: true, get: function () { return pending_payment_error_email_template_1.PENDING_PAYMENT_ERROR_EMAIL_SUBJECT; } });
const pending_payment_success_email_template_1 = require("../templates/pending-payment-success-email.template");
Object.defineProperty(exports, "PENDING_PAYMENT_SUCCESS_EMAIL_SUBJECT", { enumerable: true, get: function () { return pending_payment_success_email_template_1.PENDING_PAYMENT_SUCCESS_EMAIL_SUBJECT; } });
const order_canceled_email_template_1 = require("../templates/order-canceled-email.template");
Object.defineProperty(exports, "ORDER_CANCELED_EMAIL_SUBJECT", { enumerable: true, get: function () { return order_canceled_email_template_1.ORDER_CANCELED_EMAIL_SUBJECT; } });
const order_edited_email_template_1 = require("../templates/order-edited-email.template");
Object.defineProperty(exports, "ORDER_EDITED_EMAIL_SUBJECT", { enumerable: true, get: function () { return order_edited_email_template_1.ORDER_EDITED_EMAIL_SUBJECT; } });
const order_invoice_email_template_1 = require("../templates/order-invoice-email.template");
Object.defineProperty(exports, "ORDER_INVOICE_EMAIL_SUBJECT", { enumerable: true, get: function () { return order_invoice_email_template_1.ORDER_INVOICE_EMAIL_SUBJECT; } });
const order_link_email_template_1 = require("../templates/order-link-email.template");
Object.defineProperty(exports, "ORDER_LINK_EMAIL_SUBJECT", { enumerable: true, get: function () { return order_link_email_template_1.ORDER_LINK_EMAIL_SUBJECT; } });
const order_payment_receipt_email_template_1 = require("../templates/order-payment-receipt-email.template");
Object.defineProperty(exports, "ORDER_PAYMENT_RECEIPT_EMAIL_SUBJECT", { enumerable: true, get: function () { return order_payment_receipt_email_template_1.ORDER_PAYMENT_RECEIPT_EMAIL_SUBJECT; } });
const order_refund_email_template_1 = require("../templates/order-refund-email.template");
Object.defineProperty(exports, "ORDER_REFUND_EMAIL_SUBJECT", { enumerable: true, get: function () { return order_refund_email_template_1.ORDER_REFUND_EMAIL_SUBJECT; } });
const gift_card_receipt_email_template_1 = require("../templates/gift-card-receipt-email.template");
Object.defineProperty(exports, "GIFT_CARD_RECEIPT_EMAIL_SUBJECT", { enumerable: true, get: function () { return gift_card_receipt_email_template_1.GIFT_CARD_RECEIPT_EMAIL_SUBJECT; } });
const new_gift_card_email_template_1 = require("../templates/new-gift-card-email.template");
Object.defineProperty(exports, "NEW_GIFT_CARD_EMAIL_SUBJECT", { enumerable: true, get: function () { return new_gift_card_email_template_1.NEW_GIFT_CARD_EMAIL_SUBJECT; } });
const order_locally_delivered_email_template_1 = require("../templates/order-locally-delivered-email.template");
Object.defineProperty(exports, "ORDER_LOCALLY_DELIVERED_EMAIL_SUBJECT", { enumerable: true, get: function () { return order_locally_delivered_email_template_1.ORDER_LOCALLY_DELIVERED_EMAIL_SUBJECT; } });
const order_missed_local_delivery_email_template_1 = require("../templates/order-missed-local-delivery-email.template");
Object.defineProperty(exports, "ORDER_MISSED_LOCAL_DELIVERY_EMAIL_SUBJECT", { enumerable: true, get: function () { return order_missed_local_delivery_email_template_1.ORDER_MISSED_LOCAL_DELIVERY_EMAIL_SUBJECT; } });
const order_out_for_local_delivery_email_template_1 = require("../templates/order-out-for-local-delivery-email.template");
Object.defineProperty(exports, "ORDER_OUT_FOR_LOCAL_DELIVERY_EMAIL_SUBJECT", { enumerable: true, get: function () { return order_out_for_local_delivery_email_template_1.ORDER_OUT_FOR_LOCAL_DELIVERY_EMAIL_SUBJECT; } });
const picked_up_by_customer_email_template_1 = require("../templates/picked-up-by-customer-email.template");
Object.defineProperty(exports, "PICKED_UP_BY_CUSTOMER_EMAIL_SUBJECT", { enumerable: true, get: function () { return picked_up_by_customer_email_template_1.PICKED_UP_BY_CUSTOMER_EMAIL_SUBJECT; } });
const ready_for_local_pickup_email_template_1 = require("../templates/ready-for-local-pickup-email.template");
Object.defineProperty(exports, "READY_FOR_LOCAL_PICKUP_EMAIL_SUBJECT", { enumerable: true, get: function () { return ready_for_local_pickup_email_template_1.READY_FOR_LOCAL_PICKUP_EMAIL_SUBJECT; } });
const shipping_confirmation_email_template_1 = require("../templates/shipping-confirmation-email.template");
Object.defineProperty(exports, "SHIPPING_CONFIRMATION_EMAIL_SUBJECT", { enumerable: true, get: function () { return shipping_confirmation_email_template_1.SHIPPING_CONFIRMATION_EMAIL_SUBJECT; } });
var UrlType;
(function (UrlType) {
    UrlType["VIEW_REQUIREMENTS_FORM"] = "viewRequirementsForm";
})(UrlType || (exports.UrlType = UrlType = {}));
const sendEmail = async (options) => {
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
        from: `Ziplofy <${from}>`,
        to: options.to,
        subject: options.subject,
        html: emailBody,
    };
    await nodemailer_config_1.default.sendMail(mailOptions);
};
exports.sendEmail = sendEmail;
function buildDynamicLineItemsHtml(lineItems, currency) {
    const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60" rx="4"/%3E%3Cpath fill="%23d1d5db" d="M18 38l8-10 6 7 10-14 10 17H18z"/%3E%3Ccircle fill="%23d1d5db" cx="22" cy="22" r="4"/%3E%3C/svg%3E';
    return lineItems
        .map((item) => `
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
              ${(0, order_confirmation_email_template_1.formatOrderCurrency)(item.total, currency)}
            </td>
          </tr>
        </table>
      </td>
    </tr>`)
        .join('');
}
const getOrderConfirmationEmailBody = (params) => {
    const currency = params.currency ?? 'Rs.';
    const lineItems = params.lineItems ?? [];
    const orderItemsHtml = lineItems.length > 0 ? buildDynamicLineItemsHtml(lineItems, currency) : undefined;
    const orderTotalsHtml = (0, order_confirmation_email_template_1.buildSimpleOrderTotalsHtml)({
        subtotal: (0, order_confirmation_email_template_1.formatOrderCurrency)(params.subtotal, currency),
        shipping: (0, order_confirmation_email_template_1.formatOrderCurrency)(params.shippingCost, currency),
        taxes: (0, order_confirmation_email_template_1.formatOrderCurrency)(params.tax, currency),
        total: `${(0, order_confirmation_email_template_1.formatOrderCurrency)(params.total, currency)} INR`,
        paymentMethod: 'Payment received',
    });
    const customerInfoHtml = params.shippingAddressLines || params.billingAddressLines
        ? (0, order_confirmation_email_template_1.buildCustomerInfoHtml)({
            shippingLines: params.shippingAddressLines,
            billingLines: params.billingAddressLines ?? params.shippingAddressLines,
        })
        : undefined;
    return (0, order_confirmation_email_template_1.buildOrderConfirmationEmailHtml)({
        store_name: params.storeName ?? 'My Store',
        order_number: params.orderNumber,
        view_order_url: params.viewOrderUrl ?? '#',
        store_url: params.storeUrl ?? '#',
        ...(orderItemsHtml ? { order_items_html: orderItemsHtml } : {}),
        ...(orderTotalsHtml ? { order_totals_html: orderTotalsHtml } : {}),
        ...(customerInfoHtml ? { customer_info_html: customerInfoHtml } : {}),
    });
};
exports.getOrderConfirmationEmailBody = getOrderConfirmationEmailBody;
const getOrderConfirmationEmailSubject = (orderNumber) => order_confirmation_email_template_1.ORDER_CONFIRMATION_EMAIL_SUBJECT.replace(/\{\{order_number\}\}/g, orderNumber);
exports.getOrderConfirmationEmailSubject = getOrderConfirmationEmailSubject;
function buildDraftOrderLineItemsHtml(lineItems, currency) {
    const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60" rx="4"/%3E%3Cpath fill="%23d1d5db" d="M18 38l8-10 6 7 10-14 10 17H18z"/%3E%3Ccircle fill="%23d1d5db" cx="22" cy="22" r="4"/%3E%3C/svg%3E';
    return lineItems
        .map((item) => `
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
              ${(0, draft_order_invoice_email_template_1.formatDraftOrderCurrency)(item.total, currency)}
            </td>
          </tr>
        </table>
      </td>
    </tr>`)
        .join('');
}
const getDraftOrderInvoiceEmailBody = (params) => {
    const currency = params.currency ?? 'Rs.';
    const lineItems = params.lineItems ?? [];
    const orderItemsHtml = lineItems.length > 0 ? buildDraftOrderLineItemsHtml(lineItems, currency) : undefined;
    const discountAmount = params.discount ?? 0;
    const orderTotalsHtml = (0, draft_order_invoice_email_template_1.buildDraftOrderTotalsHtml)({
        subtotal: (0, draft_order_invoice_email_template_1.formatDraftOrderCurrency)(params.subtotal, currency),
        discount: discountAmount > 0 ? `-${(0, draft_order_invoice_email_template_1.formatDraftOrderCurrency)(discountAmount, currency)}` : (0, draft_order_invoice_email_template_1.formatDraftOrderCurrency)(0, currency),
        discountCode: params.discountCode ?? '',
        shipping: (0, draft_order_invoice_email_template_1.formatDraftOrderCurrency)(params.shippingCost, currency),
        duties: (0, draft_order_invoice_email_template_1.formatDraftOrderCurrency)(params.duties ?? 0, currency),
        taxes: (0, draft_order_invoice_email_template_1.formatDraftOrderCurrency)(params.tax, currency),
        totalDueToday: `${(0, draft_order_invoice_email_template_1.formatDraftOrderCurrency)(params.totalDueToday, currency)} INR`,
        totalDue: `${(0, draft_order_invoice_email_template_1.formatDraftOrderCurrency)(params.totalDue, currency)} INR`,
        savings: params.savings ? (0, draft_order_invoice_email_template_1.formatDraftOrderCurrency)(params.savings, currency) : (0, draft_order_invoice_email_template_1.formatDraftOrderCurrency)(0, currency),
    });
    return (0, draft_order_invoice_email_template_1.buildDraftOrderInvoiceEmailHtml)({
        store_name: params.storeName ?? 'My Store',
        order_number: params.orderNumber,
        reservation_deadline: params.reservationDeadline,
        confirm_order_url: params.confirmOrderUrl ?? '#',
        store_url: params.storeUrl ?? '#',
        ...(orderItemsHtml ? { order_items_html: orderItemsHtml } : {}),
        ...(orderTotalsHtml ? { order_totals_html: orderTotalsHtml } : {}),
    });
};
exports.getDraftOrderInvoiceEmailBody = getDraftOrderInvoiceEmailBody;
const getDraftOrderInvoiceEmailSubject = (orderNumber) => draft_order_invoice_email_template_1.DRAFT_ORDER_INVOICE_EMAIL_SUBJECT.replace(/\{\{order_number\}\}/g, orderNumber);
exports.getDraftOrderInvoiceEmailSubject = getDraftOrderInvoiceEmailSubject;
function buildDynamicShipmentItemsHtml(lineItems) {
    const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60" rx="4"/%3E%3Cpath fill="%23d1d5db" d="M18 38l8-10 6 7 10-14 10 17H18z"/%3E%3Ccircle fill="%23d1d5db" cx="22" cy="22" r="4"/%3E%3C/svg%3E';
    return lineItems
        .map((item) => `
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
    </tr>`)
        .join('');
}
const getShippingConfirmationEmailBody = (params) => {
    const lineItems = params.lineItems ?? [];
    const shipmentItemsHtml = lineItems.length > 0 ? buildDynamicShipmentItemsHtml(lineItems) : undefined;
    return (0, shipping_confirmation_email_template_1.buildShippingConfirmationEmailHtml)({
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
exports.getShippingConfirmationEmailBody = getShippingConfirmationEmailBody;
const getShippingConfirmationEmailSubject = (orderNumber) => shipping_confirmation_email_template_1.SHIPPING_CONFIRMATION_EMAIL_SUBJECT.replace(/\{\{order_number\}\}/g, orderNumber);
exports.getShippingConfirmationEmailSubject = getShippingConfirmationEmailSubject;
function buildDynamicPickupLineItemsHtml(lineItems, currency) {
    const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect fill="%23f3f4f6" width="60" height="60" rx="4"/%3E%3Cpath fill="%23d1d5db" d="M18 38l8-10 6 7 10-14 10 17H18z"/%3E%3Ccircle fill="%23d1d5db" cx="22" cy="22" r="4"/%3E%3C/svg%3E';
    return (lineItems ?? [])
        .map((item) => {
        const price = (0, order_confirmation_email_template_1.formatOrderCurrency)(item.price, currency);
        const compareAt = item.compareAtPrice !== undefined
            ? (0, order_confirmation_email_template_1.formatOrderCurrency)(item.compareAtPrice, currency)
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
const getReadyForLocalPickupEmailBody = (params) => {
    const currency = params.currency ?? 'Rs.';
    const lineItems = params.lineItems ?? [];
    const orderItemsHtml = lineItems.length > 0 ? buildDynamicPickupLineItemsHtml(lineItems, currency) : undefined;
    const orderTotalsHtml = params.subtotal !== undefined && params.total !== undefined
        ? (0, ready_for_local_pickup_email_template_1.buildPickupOrderTotalsHtml)({
            subtotal: (0, order_confirmation_email_template_1.formatOrderCurrency)(params.subtotal, currency),
            discount: params.discount
                ? `-${(0, order_confirmation_email_template_1.formatOrderCurrency)(params.discount, currency)}`
                : (0, order_confirmation_email_template_1.formatOrderCurrency)(0, currency),
            discountCode: params.discountCode ?? '',
            shipping: 'Free',
            shippingOriginal: (0, order_confirmation_email_template_1.formatOrderCurrency)(params.shippingOriginal ?? 0, currency),
            shippingDiscountCode: params.shippingDiscountCode ?? '',
            taxes: (0, order_confirmation_email_template_1.formatOrderCurrency)(params.tax ?? 0, currency),
            total: `${(0, order_confirmation_email_template_1.formatOrderCurrency)(params.total, currency)} INR`,
            savings: params.savings
                ? (0, order_confirmation_email_template_1.formatOrderCurrency)(params.savings, currency)
                : (0, order_confirmation_email_template_1.formatOrderCurrency)(0, currency),
        })
        : undefined;
    return (0, ready_for_local_pickup_email_template_1.buildReadyForLocalPickupEmailHtml)({
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
exports.getReadyForLocalPickupEmailBody = getReadyForLocalPickupEmailBody;
const getReadyForLocalPickupEmailSubject = () => ready_for_local_pickup_email_template_1.READY_FOR_LOCAL_PICKUP_EMAIL_SUBJECT;
exports.getReadyForLocalPickupEmailSubject = getReadyForLocalPickupEmailSubject;
