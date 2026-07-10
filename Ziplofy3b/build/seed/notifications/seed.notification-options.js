"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_config_1 = require("../../config/database.config");
const notification_category_model_1 = require("../../models/notification-category/notification-category.model");
const notification_option_model_1 = require("../../models/notification-option/notification-option.model");
const customer_notifications_enum_1 = require("../../enums/customer-notifications.enum");
const staff_notifications_enum_1 = require("../../enums/staff-notifications.enum");
const fulfillment_notifications_enum_1 = require("../../enums/fulfillment-notifications.enum");
const order_level_return_label_email_template_1 = require("../../templates/order-level-return-label-email.template");
const return_created_email_template_1 = require("../../templates/return-created-email.template");
const return_request_approved_email_template_1 = require("../../templates/return-request-approved-email.template");
const return_request_declined_email_template_1 = require("../../templates/return-request-declined-email.template");
const return_request_received_email_template_1 = require("../../templates/return-request-received-email.template");
const payment_error_email_template_1 = require("../../templates/payment-error-email.template");
const payment_reminder_email_template_1 = require("../../templates/payment-reminder-email.template");
const pending_payment_error_email_template_1 = require("../../templates/pending-payment-error-email.template");
const pending_payment_success_email_template_1 = require("../../templates/pending-payment-success-email.template");
const order_canceled_email_template_1 = require("../../templates/order-canceled-email.template");
const order_edited_email_template_1 = require("../../templates/order-edited-email.template");
const order_invoice_email_template_1 = require("../../templates/order-invoice-email.template");
const order_link_email_template_1 = require("../../templates/order-link-email.template");
const order_payment_receipt_email_template_1 = require("../../templates/order-payment-receipt-email.template");
const order_refund_email_template_1 = require("../../templates/order-refund-email.template");
const gift_card_receipt_email_template_1 = require("../../templates/gift-card-receipt-email.template");
const new_gift_card_email_template_1 = require("../../templates/new-gift-card-email.template");
const order_locally_delivered_email_template_1 = require("../../templates/order-locally-delivered-email.template");
const order_missed_local_delivery_email_template_1 = require("../../templates/order-missed-local-delivery-email.template");
const order_out_for_local_delivery_email_template_1 = require("../../templates/order-out-for-local-delivery-email.template");
const picked_up_by_customer_email_template_1 = require("../../templates/picked-up-by-customer-email.template");
const draft_order_invoice_email_template_1 = require("../../templates/draft-order-invoice-email.template");
const ready_for_local_pickup_email_template_1 = require("../../templates/ready-for-local-pickup-email.template");
const shipping_confirmation_email_template_1 = require("../../templates/shipping-confirmation-email.template");
const order_confirmation_email_template_1 = require("../../templates/order-confirmation-email.template");
dotenv_1.default.config();
const optionSeeds = [
    {
        categoryName: 'Customer notifications',
        options: [
            {
                segment: 'order_processing',
                optionName: 'Order confirmation',
                optionDesc: 'Sent when a customer places an order',
                key: customer_notifications_enum_1.CustomerNotifications.OrderConfirmation,
                emailSupported: true,
                emailSubject: order_confirmation_email_template_1.ORDER_CONFIRMATION_EMAIL_SUBJECT,
                emailBody: order_confirmation_email_template_1.ORDER_CONFIRMATION_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'view_order_url',
                    'store_url',
                    'customer_name',
                    'order_total',
                ],
            },
            {
                segment: 'order_processing',
                optionName: 'Draft order invoice',
                optionDesc: 'Sent when you create an invoice on the draft order page',
                key: customer_notifications_enum_1.CustomerNotifications.DraftOrderInvoice,
                emailSupported: true,
                emailSubject: draft_order_invoice_email_template_1.DRAFT_ORDER_INVOICE_EMAIL_SUBJECT,
                emailBody: draft_order_invoice_email_template_1.DRAFT_ORDER_INVOICE_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'reservation_deadline',
                    'confirm_order_url',
                    'store_url',
                    'customer_name',
                    'order_total',
                ],
            },
            {
                segment: 'order_processing',
                optionName: 'Shipping confirmation',
                optionDesc: 'Sent when you mark an order as fulfilled',
                key: customer_notifications_enum_1.CustomerNotifications.ShippingConfirmation,
                emailSupported: true,
                emailSubject: shipping_confirmation_email_template_1.SHIPPING_CONFIRMATION_EMAIL_SUBJECT,
                emailBody: shipping_confirmation_email_template_1.SHIPPING_CONFIRMATION_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'view_order_url',
                    'tracking_url',
                    'store_url',
                    'carrier_name',
                    'tracking_number',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'local_pick_up',
                optionName: 'Ready for local pickup',
                optionDesc: 'Sent when an order is ready to be picked up',
                key: customer_notifications_enum_1.CustomerNotifications.ReadyForLocalPickup,
                emailSupported: true,
                emailSubject: ready_for_local_pickup_email_template_1.READY_FOR_LOCAL_PICKUP_EMAIL_SUBJECT,
                emailBody: ready_for_local_pickup_email_template_1.READY_FOR_LOCAL_PICKUP_EMAIL_BODY,
                smsSupported: true,
                smsData: 'Order {{order_number}} is ready for pickup at {{pickup_location_name}}.',
                availableVariables: [
                    'store_name',
                    'order_number',
                    'view_order_url',
                    'store_url',
                    'pickup_location_name',
                    'pickup_address_line1',
                    'pickup_address_line2',
                    'pickup_city',
                    'pickup_state',
                    'pickup_zip',
                    'pickup_map_url',
                    'customer_name',
                ],
            },
            {
                segment: 'local_pick_up',
                optionName: 'Picked up by customer',
                optionDesc: 'Sent to confirm an order was picked up by the customer',
                key: customer_notifications_enum_1.CustomerNotifications.PickedUpByCustomer,
                emailSupported: true,
                emailSubject: picked_up_by_customer_email_template_1.PICKED_UP_BY_CUSTOMER_EMAIL_SUBJECT,
                emailBody: picked_up_by_customer_email_template_1.PICKED_UP_BY_CUSTOMER_EMAIL_BODY,
                smsSupported: true,
                smsData: 'Order {{order_number}} has been picked up. Thank you!',
                availableVariables: [
                    'store_name',
                    'order_number',
                    'view_order_url',
                    'store_url',
                    'pickup_location_name',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'local_delivery',
                optionName: 'Order out for local delivery',
                optionDesc: 'Sent when an order is out for local delivery',
                toggle: true,
                toggleValue: 'true',
                key: customer_notifications_enum_1.CustomerNotifications.OrderOutForLocalDelivery,
                emailSupported: true,
                emailSubject: order_out_for_local_delivery_email_template_1.ORDER_OUT_FOR_LOCAL_DELIVERY_EMAIL_SUBJECT,
                emailBody: order_out_for_local_delivery_email_template_1.ORDER_OUT_FOR_LOCAL_DELIVERY_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'view_order_url',
                    'tracking_url',
                    'store_url',
                    'delivery_name',
                    'delivery_address_line1',
                    'delivery_address_line2',
                    'delivery_city',
                    'delivery_state',
                    'delivery_zip',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'local_delivery',
                optionName: 'Order locally delivered',
                optionDesc: 'Sent to confirm the order was delivered',
                toggle: true,
                toggleValue: 'true',
                key: customer_notifications_enum_1.CustomerNotifications.OrderLocallyDelivered,
                emailSupported: true,
                emailSubject: order_locally_delivered_email_template_1.ORDER_LOCALLY_DELIVERED_EMAIL_SUBJECT,
                emailBody: order_locally_delivered_email_template_1.ORDER_LOCALLY_DELIVERED_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'view_order_url',
                    'store_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'local_delivery',
                optionName: 'Order missed local delivery',
                optionDesc: 'Sent when a customer misses a local delivery',
                toggle: true,
                toggleValue: 'true',
                key: customer_notifications_enum_1.CustomerNotifications.OrderMissedLocalDelivery,
                emailSupported: true,
                emailSubject: order_missed_local_delivery_email_template_1.ORDER_MISSED_LOCAL_DELIVERY_EMAIL_SUBJECT,
                emailBody: order_missed_local_delivery_email_template_1.ORDER_MISSED_LOCAL_DELIVERY_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'view_order_url',
                    'store_url',
                    'delivery_name',
                    'delivery_address_line1',
                    'delivery_address_line2',
                    'delivery_city',
                    'delivery_state',
                    'delivery_zip',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'gift_cards',
                optionName: 'New gift card',
                optionDesc: 'Sent to the customer or recipient when a gift card is fulfilled, or when you send a gift card',
                key: customer_notifications_enum_1.CustomerNotifications.NewGiftCard,
                emailSupported: true,
                emailSubject: new_gift_card_email_template_1.NEW_GIFT_CARD_EMAIL_SUBJECT,
                emailBody: new_gift_card_email_template_1.NEW_GIFT_CARD_EMAIL_BODY,
                smsSupported: true,
                smsData: 'You received a gift card worth {{gift_card_amount}} from {{customer_name}}.',
                availableVariables: [
                    'store_name',
                    'gift_card_amount',
                    'gift_card_amount_formatted',
                    'gift_card_code',
                    'store_url',
                    'gift_card_balance_url',
                    'recipient_name',
                    'customer_name',
                ],
            },
            {
                segment: 'gift_cards',
                optionName: 'Gift card receipt',
                optionDesc: 'Sent to the customer if they add a recipient to a gift card',
                key: customer_notifications_enum_1.CustomerNotifications.GiftCardReceipt,
                emailSupported: true,
                emailSubject: gift_card_receipt_email_template_1.GIFT_CARD_RECEIPT_EMAIL_SUBJECT,
                emailBody: gift_card_receipt_email_template_1.GIFT_CARD_RECEIPT_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'customer_name',
                    'recipient_name',
                    'gift_card_amount',
                    'gift_card_amount_formatted',
                    'gift_card_code',
                    'view_order_url',
                    'store_url',
                    'support_email',
                ],
            },
            {
                segment: 'store_credit',
                optionName: 'Store credit issued',
                optionDesc: "Sent when a store credit amount is credited to the customer's account",
                key: customer_notifications_enum_1.CustomerNotifications.StoreCreditIssued,
                emailSupported: true,
                emailSubject: 'Store credit issued',
                emailBody: 'Hi {{customer_name}}, store credit of {{credit_amount}} has been added to your account.',
                availableVariables: ['customer_name', 'credit_amount'],
            },
            {
                segment: 'order_exceptions',
                optionName: 'Order invoice',
                optionDesc: 'Sent when an order has an outstanding balance',
                key: customer_notifications_enum_1.CustomerNotifications.OrderInvoice,
                emailSupported: true,
                emailSubject: order_invoice_email_template_1.ORDER_INVOICE_EMAIL_SUBJECT,
                emailBody: order_invoice_email_template_1.ORDER_INVOICE_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'amount_due',
                    'pay_now_url',
                    'store_url',
                    'customer_name',
                ],
            },
            {
                segment: 'order_exceptions',
                optionName: 'Order edited',
                optionDesc: 'Sent when an order is edited',
                key: customer_notifications_enum_1.CustomerNotifications.OrderEdited,
                emailSupported: true,
                emailSubject: order_edited_email_template_1.ORDER_EDITED_EMAIL_SUBJECT,
                emailBody: order_edited_email_template_1.ORDER_EDITED_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'view_order_url',
                    'store_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'order_exceptions',
                optionName: 'Order canceled',
                optionDesc: 'Sent if a customer cancels their order',
                key: customer_notifications_enum_1.CustomerNotifications.OrderCanceled,
                emailSupported: true,
                emailSubject: order_canceled_email_template_1.ORDER_CANCELED_EMAIL_SUBJECT,
                emailBody: order_canceled_email_template_1.ORDER_CANCELED_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'view_order_url',
                    'store_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'order_exceptions',
                optionName: 'Order payment receipt',
                optionDesc: "Sent after you charge a customer's saved payment method",
                key: customer_notifications_enum_1.CustomerNotifications.OrderPaymentReceipt,
                emailSupported: true,
                emailSubject: order_payment_receipt_email_template_1.ORDER_PAYMENT_RECEIPT_EMAIL_SUBJECT,
                emailBody: order_payment_receipt_email_template_1.ORDER_PAYMENT_RECEIPT_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'amount_paid',
                    'view_order_url',
                    'store_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'order_exceptions',
                optionName: 'Order refund',
                optionDesc: 'Sent if an order is refunded',
                key: customer_notifications_enum_1.CustomerNotifications.OrderRefund,
                emailSupported: true,
                emailSubject: order_refund_email_template_1.ORDER_REFUND_EMAIL_SUBJECT,
                emailBody: order_refund_email_template_1.ORDER_REFUND_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'refund_amount',
                    'view_order_url',
                    'store_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'order_exceptions',
                optionName: 'Order link',
                optionDesc: 'Sent when a customer requests a new link from an expired order status page',
                key: customer_notifications_enum_1.CustomerNotifications.OrderLink,
                emailSupported: true,
                emailSubject: order_link_email_template_1.ORDER_LINK_EMAIL_SUBJECT,
                emailBody: order_link_email_template_1.ORDER_LINK_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'order_status_url',
                    'store_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'payments',
                optionName: 'Payment error',
                optionDesc: "Sent if a customer's payment can't be processed during checkout",
                key: customer_notifications_enum_1.CustomerNotifications.PaymentError,
                emailSupported: true,
                emailSubject: payment_error_email_template_1.PAYMENT_ERROR_EMAIL_SUBJECT,
                emailBody: payment_error_email_template_1.PAYMENT_ERROR_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'return_to_cart_url',
                    'store_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'payments',
                optionName: 'Pending payment error',
                optionDesc: "Sent when a customer's pending payment can't be processed",
                key: customer_notifications_enum_1.CustomerNotifications.PendingPaymentError,
                emailSupported: true,
                emailSubject: pending_payment_error_email_template_1.PENDING_PAYMENT_ERROR_EMAIL_SUBJECT,
                emailBody: pending_payment_error_email_template_1.PENDING_PAYMENT_ERROR_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'view_order_url',
                    'store_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'payments',
                optionName: 'Pending payment success',
                optionDesc: "Sent after a customer's pending payment has been processed successfully",
                key: customer_notifications_enum_1.CustomerNotifications.PendingPaymentSuccess,
                emailSupported: true,
                emailSubject: pending_payment_success_email_template_1.PENDING_PAYMENT_SUCCESS_EMAIL_SUBJECT,
                emailBody: pending_payment_success_email_template_1.PENDING_PAYMENT_SUCCESS_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'view_order_url',
                    'store_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'payments',
                optionName: 'Payment reminder',
                optionDesc: 'Sent on or after the due date for an unpaid order',
                key: customer_notifications_enum_1.CustomerNotifications.PaymentReminder,
                emailSupported: true,
                emailSubject: payment_reminder_email_template_1.PAYMENT_REMINDER_EMAIL_SUBJECT,
                emailBody: payment_reminder_email_template_1.PAYMENT_REMINDER_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'amount_due',
                    'pay_now_url',
                    'view_order_url',
                    'store_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'shipping_updated',
                optionName: 'Shipping update',
                optionDesc: 'Sent when you add or update an order tracking number',
                key: customer_notifications_enum_1.CustomerNotifications.ShippingUpdate,
                emailSupported: true,
                emailSubject: 'Shipping update',
                emailBody: 'Hi {{customer_name}}, the tracking information for order {{order_number}} has been updated. Track here: {{tracking_url}}.',
                availableVariables: ['customer_name', 'order_number', 'tracking_url'],
            },
            {
                segment: 'shipping_updated',
                optionName: 'Out for delivery',
                optionDesc: 'Sent when an order with a tracking number is out for delivery',
                toggle: true,
                toggleValue: 'true',
                key: customer_notifications_enum_1.CustomerNotifications.OutForDelivery,
                emailSupported: true,
                emailSubject: 'Order out for delivery',
                emailBody: 'Hi {{customer_name}}, your order {{order_number}} is out for delivery.',
                availableVariables: ['customer_name', 'order_number'],
            },
            {
                segment: 'shipping_updated',
                optionName: 'Delivered',
                optionDesc: 'Sent if an order with a tracking number is delivered',
                toggle: true,
                toggleValue: 'true',
                key: customer_notifications_enum_1.CustomerNotifications.Delivered,
                emailSupported: true,
                emailSubject: 'Order delivered',
                emailBody: 'Hi {{customer_name}}, order {{order_number}} has been delivered successfully.',
                availableVariables: ['customer_name', 'order_number'],
            },
            {
                segment: 'returns',
                optionName: 'Return created',
                optionDesc: 'Sent when you create a return, including any return label or tracking information',
                key: customer_notifications_enum_1.CustomerNotifications.ReturnCreated,
                emailSupported: true,
                emailSubject: return_created_email_template_1.RETURN_CREATED_EMAIL_SUBJECT,
                emailBody: return_created_email_template_1.RETURN_CREATED_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'return_tracking_url',
                    'view_order_url',
                    'store_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'returns',
                optionName: 'Order-level return label created',
                optionDesc: 'Sent when you create a return label from the order page (US only)',
                key: customer_notifications_enum_1.CustomerNotifications.OrderLevelReturnLabelCreated,
                emailSupported: true,
                emailSubject: order_level_return_label_email_template_1.ORDER_LEVEL_RETURN_LABEL_EMAIL_SUBJECT,
                emailBody: order_level_return_label_email_template_1.ORDER_LEVEL_RETURN_LABEL_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'return_label_url',
                    'view_order_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'returns',
                optionName: 'Return request received',
                optionDesc: "Sent to confirm a customer's self-serve return request was received",
                key: customer_notifications_enum_1.CustomerNotifications.ReturnRequestReceived,
                emailSupported: true,
                emailSubject: return_request_received_email_template_1.RETURN_REQUEST_RECEIVED_EMAIL_SUBJECT,
                emailBody: return_request_received_email_template_1.RETURN_REQUEST_RECEIVED_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'view_order_url',
                    'store_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'returns',
                optionName: 'Return request approved',
                optionDesc: 'Sent when you approve a return request',
                key: customer_notifications_enum_1.CustomerNotifications.ReturnRequestApproved,
                emailSupported: true,
                emailSubject: return_request_approved_email_template_1.RETURN_REQUEST_APPROVED_EMAIL_SUBJECT,
                emailBody: return_request_approved_email_template_1.RETURN_REQUEST_APPROVED_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'view_order_url',
                    'store_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'returns',
                optionName: 'Return request declined',
                optionDesc: 'Sent when you decline a return request',
                key: customer_notifications_enum_1.CustomerNotifications.ReturnRequestDeclined,
                emailSupported: true,
                emailSubject: return_request_declined_email_template_1.RETURN_REQUEST_DECLINED_EMAIL_SUBJECT,
                emailBody: return_request_declined_email_template_1.RETURN_REQUEST_DECLINED_EMAIL_BODY,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'view_order_url',
                    'store_url',
                    'support_email',
                    'customer_name',
                ],
            },
            {
                segment: 'accounts_and_outreach',
                optionName: 'Customer account invite',
                optionDesc: 'Sent when you invite a customer to create an account',
                key: customer_notifications_enum_1.CustomerNotifications.CustomerAccountInvite,
                emailSupported: true,
                emailSubject: 'Invitation to create your account',
                emailBody: 'Hi {{customer_name}}, create your account using this link: {{account_invite_url}}.',
                availableVariables: ['customer_name', 'account_invite_url'],
            },
            {
                segment: 'accounts_and_outreach',
                optionName: 'Customer account welcome',
                optionDesc: 'Sent when a customer completes their account activation',
                key: customer_notifications_enum_1.CustomerNotifications.CustomerAccountWelcome,
                emailSupported: true,
                emailSubject: 'Welcome to our store',
                emailBody: 'Hi {{customer_name}}, welcome! You can manage your account here: {{account_url}}.',
                availableVariables: ['customer_name', 'account_url'],
            },
            {
                segment: 'accounts_and_outreach',
                optionName: 'Customer account password reset',
                optionDesc: 'Sent when a customer requests to reset their account password',
                key: customer_notifications_enum_1.CustomerNotifications.CustomerAccountPasswordReset,
                emailSupported: true,
                emailSubject: 'Reset your password',
                emailBody: 'Hi {{customer_name}}, reset your password using this link: {{password_reset_url}}.',
                availableVariables: ['customer_name', 'password_reset_url'],
            },
            {
                segment: 'accounts_and_outreach',
                optionName: 'Contact customer',
                optionDesc: 'Sent when you contact a customer from the orders or customers page',
                key: customer_notifications_enum_1.CustomerNotifications.ContactCustomer,
                emailSupported: true,
                emailSubject: 'Message from {{store_name}}',
                emailBody: 'Hi {{customer_name}}, {{message_body}}',
                availableVariables: ['customer_name', 'store_name', 'message_body'],
            },
            {
                segment: 'accounts_and_outreach',
                optionName: 'Customer email address change confirmation',
                optionDesc: 'Sent when a customer changes their email address',
                key: customer_notifications_enum_1.CustomerNotifications.CustomerEmailAddressChangeConfirmation,
                emailSupported: true,
                emailSubject: 'Email address changed',
                emailBody: 'Hi {{customer_name}}, your email address has been changed to {{new_email}}.',
                availableVariables: ['customer_name', 'new_email'],
            },
        ],
    },
    {
        categoryName: 'Staff notifications',
        options: [
            {
                segment: 'orders',
                optionName: 'New order',
                optionDesc: 'Sent when a customer places an order',
                key: staff_notifications_enum_1.StaffNotifications.NewOrder,
                emailSupported: true,
                smsSupported: false,
                emailSubject: 'New order received',
                emailBody: 'A new order {{order_number}} has been placed by {{customer_name}} for {{order_total}}.',
                availableVariables: ['order_number', 'customer_name', 'order_total'],
            },
            {
                segment: 'returns',
                optionName: 'New return request',
                optionDesc: 'Sent when a customer requests a return on an order',
                key: staff_notifications_enum_1.StaffNotifications.NewReturnRequest,
                emailSupported: true,
                smsSupported: false,
                emailSubject: 'New return request',
                emailBody: 'A return request has been submitted for order {{order_number}} by {{customer_name}}.',
                availableVariables: ['order_number', 'customer_name'],
            },
            {
                segment: 'orders',
                optionName: 'Sales attribution edited',
                optionDesc: 'Sent to order notification subscribers when the attributed staff on an order is edited.',
                toggle: true,
                toggleValue: 'true',
                key: staff_notifications_enum_1.StaffNotifications.SalesAttributionEdited,
                emailSupported: true,
                smsSupported: false,
                emailSubject: 'Sales attribution edited',
                emailBody: 'The sales attribution for order {{order_number}} has been edited. Previous: {{previous_staff}}, New: {{new_staff}}.',
                availableVariables: ['order_number', 'previous_staff', 'new_staff'],
            },
            {
                segment: 'orders',
                optionName: 'New draft order',
                optionDesc: 'Sent when a customer submits a draft order. Only sent to store owner',
                toggle: true,
                toggleValue: 'true',
                key: staff_notifications_enum_1.StaffNotifications.NewDraftOrder,
                emailSupported: true,
                smsSupported: false,
                emailSubject: 'New draft order submitted',
                emailBody: 'A new draft order {{order_number}} has been submitted by {{customer_name}}.',
                availableVariables: ['order_number', 'customer_name'],
            },
        ],
    },
    {
        categoryName: 'Fulfillment request notification',
        options: [
            {
                segment: 'fulfillment',
                optionName: 'Order fulfillment request',
                optionDesc: 'Notify your fulfillment service provider when you mark an order as fulfilled',
                toggle: false,
                toggleValue: 'false',
                key: fulfillment_notifications_enum_1.FulfillmentNotifications.OrderFulfillmentRequest,
                emailSupported: true,
                smsSupported: false,
                emailSubject: 'Order fulfillment request for {{store_name}}',
                emailBody: `Please fulfill order #{{order_number}}.

Total number of items:

Unique items:

Items to fulfill:

Shipping Address:

{{shipping_name}}
{{shipping_address_line1}}
{{shipping_city}}, {{shipping_state}}
{{shipping_zip}}
{{shipping_country}}

Phone: {{shipping_phone}}

Shipping Method:

{{shipping_method}}

Tracking Number:

{{tracking_number}}

Customer Email:

{{customer_email}}

Thank you,
{{store_name}}`,
                availableVariables: [
                    'store_name',
                    'order_number',
                    'shipping_name',
                    'shipping_address_line1',
                    'shipping_city',
                    'shipping_state',
                    'shipping_zip',
                    'shipping_country',
                    'shipping_phone',
                    'shipping_method',
                    'tracking_number',
                    'customer_email',
                ],
            },
        ],
    },
];
async function seedNotificationOptions() {
    try {
        await (0, database_config_1.connectDB)();
        // Delete all existing notification options
        await notification_option_model_1.NotificationOption.deleteMany({});
        console.log('Deleted all existing notification options');
        // Resolve category IDs dynamically by name for current DB.
        const targetNames = optionSeeds.map((c) => c.categoryName);
        const categories = await notification_category_model_1.NotificationCategory.find({ name: { $in: targetNames } })
            .select('_id name')
            .lean();
        const categoryIdMap = new Map();
        categories.forEach((cat) => {
            categoryIdMap.set(cat.name, cat._id);
        });
        for (const categorySeed of optionSeeds) {
            const targetCategoryId = categoryIdMap.get(categorySeed.categoryName);
            if (!targetCategoryId) {
                console.warn(`Notification category "${categorySeed.categoryName}" not found. Please run seed:notification-categories first.`);
                continue;
            }
            for (const option of categorySeed.options) {
                await notification_option_model_1.NotificationOption.updateOne({
                    notificationCategoryId: targetCategoryId,
                    optionName: option.optionName,
                }, {
                    $set: {
                        notificationCategoryId: targetCategoryId,
                        optionName: option.optionName,
                        optionDesc: option.optionDesc,
                        segment: option.segment,
                        toggle: option.toggle ?? false,
                        toggleValue: option.toggleValue ?? '',
                        emailSupported: option.emailSupported ?? true,
                        smsSupported: option.smsSupported ?? false,
                        emailBody: option.emailBody ?? '',
                        emailSubject: option.emailSubject ?? '',
                        smsData: option.smsData ?? '',
                        availableVariables: option.availableVariables ?? [],
                        key: option.key,
                    },
                }, { upsert: true });
            }
        }
        console.log('Notification options seeded successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding notification options:', error);
        process.exit(1);
    }
}
seedNotificationOptions();
