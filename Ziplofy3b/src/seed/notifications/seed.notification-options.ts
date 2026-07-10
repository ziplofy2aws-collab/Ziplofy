import dotenv from 'dotenv';
import { connectDB } from '../../config/database.config';
import { NotificationCategory } from '../../models/notification-category/notification-category.model';
import { NotificationOption } from '../../models/notification-option/notification-option.model';
import { CustomerNotifications } from '../../enums/customer-notifications.enum';
import { StaffNotifications } from '../../enums/staff-notifications.enum';
import { FulfillmentNotifications } from '../../enums/fulfillment-notifications.enum';
import {
  ORDER_LEVEL_RETURN_LABEL_EMAIL_BODY,
  ORDER_LEVEL_RETURN_LABEL_EMAIL_SUBJECT,
} from '../../templates/order-level-return-label-email.template';
import {
  RETURN_CREATED_EMAIL_BODY,
  RETURN_CREATED_EMAIL_SUBJECT,
} from '../../templates/return-created-email.template';
import {
  RETURN_REQUEST_APPROVED_EMAIL_BODY,
  RETURN_REQUEST_APPROVED_EMAIL_SUBJECT,
} from '../../templates/return-request-approved-email.template';
import {
  RETURN_REQUEST_DECLINED_EMAIL_BODY,
  RETURN_REQUEST_DECLINED_EMAIL_SUBJECT,
} from '../../templates/return-request-declined-email.template';
import {
  RETURN_REQUEST_RECEIVED_EMAIL_BODY,
  RETURN_REQUEST_RECEIVED_EMAIL_SUBJECT,
} from '../../templates/return-request-received-email.template';
import {
  PAYMENT_ERROR_EMAIL_BODY,
  PAYMENT_ERROR_EMAIL_SUBJECT,
} from '../../templates/payment-error-email.template';
import {
  PAYMENT_REMINDER_EMAIL_BODY,
  PAYMENT_REMINDER_EMAIL_SUBJECT,
} from '../../templates/payment-reminder-email.template';
import {
  PENDING_PAYMENT_ERROR_EMAIL_BODY,
  PENDING_PAYMENT_ERROR_EMAIL_SUBJECT,
} from '../../templates/pending-payment-error-email.template';
import {
  PENDING_PAYMENT_SUCCESS_EMAIL_BODY,
  PENDING_PAYMENT_SUCCESS_EMAIL_SUBJECT,
} from '../../templates/pending-payment-success-email.template';
import {
  ORDER_CANCELED_EMAIL_BODY,
  ORDER_CANCELED_EMAIL_SUBJECT,
} from '../../templates/order-canceled-email.template';
import {
  ORDER_EDITED_EMAIL_BODY,
  ORDER_EDITED_EMAIL_SUBJECT,
} from '../../templates/order-edited-email.template';
import {
  ORDER_INVOICE_EMAIL_BODY,
  ORDER_INVOICE_EMAIL_SUBJECT,
} from '../../templates/order-invoice-email.template';
import {
  ORDER_LINK_EMAIL_BODY,
  ORDER_LINK_EMAIL_SUBJECT,
} from '../../templates/order-link-email.template';
import {
  ORDER_PAYMENT_RECEIPT_EMAIL_BODY,
  ORDER_PAYMENT_RECEIPT_EMAIL_SUBJECT,
} from '../../templates/order-payment-receipt-email.template';
import {
  ORDER_REFUND_EMAIL_BODY,
  ORDER_REFUND_EMAIL_SUBJECT,
} from '../../templates/order-refund-email.template';
import {
  GIFT_CARD_RECEIPT_EMAIL_BODY,
  GIFT_CARD_RECEIPT_EMAIL_SUBJECT,
} from '../../templates/gift-card-receipt-email.template';
import {
  NEW_GIFT_CARD_EMAIL_BODY,
  NEW_GIFT_CARD_EMAIL_SUBJECT,
} from '../../templates/new-gift-card-email.template';
import {
  ORDER_LOCALLY_DELIVERED_EMAIL_BODY,
  ORDER_LOCALLY_DELIVERED_EMAIL_SUBJECT,
} from '../../templates/order-locally-delivered-email.template';
import {
  ORDER_MISSED_LOCAL_DELIVERY_EMAIL_BODY,
  ORDER_MISSED_LOCAL_DELIVERY_EMAIL_SUBJECT,
} from '../../templates/order-missed-local-delivery-email.template';
import {
  ORDER_OUT_FOR_LOCAL_DELIVERY_EMAIL_BODY,
  ORDER_OUT_FOR_LOCAL_DELIVERY_EMAIL_SUBJECT,
} from '../../templates/order-out-for-local-delivery-email.template';
import {
  PICKED_UP_BY_CUSTOMER_EMAIL_BODY,
  PICKED_UP_BY_CUSTOMER_EMAIL_SUBJECT,
} from '../../templates/picked-up-by-customer-email.template';
import {
  DRAFT_ORDER_INVOICE_EMAIL_BODY,
  DRAFT_ORDER_INVOICE_EMAIL_SUBJECT,
} from '../../templates/draft-order-invoice-email.template';
import {
  READY_FOR_LOCAL_PICKUP_EMAIL_BODY,
  READY_FOR_LOCAL_PICKUP_EMAIL_SUBJECT,
} from '../../templates/ready-for-local-pickup-email.template';
import {
  SHIPPING_CONFIRMATION_EMAIL_BODY,
  SHIPPING_CONFIRMATION_EMAIL_SUBJECT,
} from '../../templates/shipping-confirmation-email.template';
import {
  ORDER_CONFIRMATION_EMAIL_BODY,
  ORDER_CONFIRMATION_EMAIL_SUBJECT,
} from '../../templates/order-confirmation-email.template';

dotenv.config();

type SeedOption = {
  optionName: string;
  optionDesc: string;
  segment: string;
  toggle?: boolean;
  toggleValue?: string;
  emailSupported?: boolean;
  smsSupported?: boolean;
  emailBody?: string;
  emailSubject?: string;
  smsData?: string;
  availableVariables?: string[];
  key: CustomerNotifications | StaffNotifications | FulfillmentNotifications;
};

type CategorySeed = {
  categoryName: string;
  options: SeedOption[];
};

const optionSeeds: CategorySeed[] = [
  {
    categoryName: 'Customer notifications',
    options: [
      {
        segment: 'order_processing',
        optionName: 'Order confirmation',
        optionDesc: 'Sent when a customer places an order',
        key: CustomerNotifications.OrderConfirmation,
        emailSupported: true,
        emailSubject: ORDER_CONFIRMATION_EMAIL_SUBJECT,
        emailBody: ORDER_CONFIRMATION_EMAIL_BODY,
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
        key: CustomerNotifications.DraftOrderInvoice,
        emailSupported: true,
        emailSubject: DRAFT_ORDER_INVOICE_EMAIL_SUBJECT,
        emailBody: DRAFT_ORDER_INVOICE_EMAIL_BODY,
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
        key: CustomerNotifications.ShippingConfirmation,
        emailSupported: true,
        emailSubject: SHIPPING_CONFIRMATION_EMAIL_SUBJECT,
        emailBody: SHIPPING_CONFIRMATION_EMAIL_BODY,
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
        key: CustomerNotifications.ReadyForLocalPickup,
        emailSupported: true,
        emailSubject: READY_FOR_LOCAL_PICKUP_EMAIL_SUBJECT,
        emailBody: READY_FOR_LOCAL_PICKUP_EMAIL_BODY,
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
        key: CustomerNotifications.PickedUpByCustomer,
        emailSupported: true,
        emailSubject: PICKED_UP_BY_CUSTOMER_EMAIL_SUBJECT,
        emailBody: PICKED_UP_BY_CUSTOMER_EMAIL_BODY,
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
        key: CustomerNotifications.OrderOutForLocalDelivery,
        emailSupported: true,
        emailSubject: ORDER_OUT_FOR_LOCAL_DELIVERY_EMAIL_SUBJECT,
        emailBody: ORDER_OUT_FOR_LOCAL_DELIVERY_EMAIL_BODY,
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
        key: CustomerNotifications.OrderLocallyDelivered,
        emailSupported: true,
        emailSubject: ORDER_LOCALLY_DELIVERED_EMAIL_SUBJECT,
        emailBody: ORDER_LOCALLY_DELIVERED_EMAIL_BODY,
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
        key: CustomerNotifications.OrderMissedLocalDelivery,
        emailSupported: true,
        emailSubject: ORDER_MISSED_LOCAL_DELIVERY_EMAIL_SUBJECT,
        emailBody: ORDER_MISSED_LOCAL_DELIVERY_EMAIL_BODY,
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
        key: CustomerNotifications.NewGiftCard,
        emailSupported: true,
        emailSubject: NEW_GIFT_CARD_EMAIL_SUBJECT,
        emailBody: NEW_GIFT_CARD_EMAIL_BODY,
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
        key: CustomerNotifications.GiftCardReceipt,
        emailSupported: true,
        emailSubject: GIFT_CARD_RECEIPT_EMAIL_SUBJECT,
        emailBody: GIFT_CARD_RECEIPT_EMAIL_BODY,
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
        key: CustomerNotifications.StoreCreditIssued,
        emailSupported: true,
        emailSubject: 'Store credit issued',
        emailBody: 'Hi {{customer_name}}, store credit of {{credit_amount}} has been added to your account.',
        availableVariables: ['customer_name', 'credit_amount'],
      },
      {
        segment: 'order_exceptions',
        optionName: 'Order invoice',
        optionDesc: 'Sent when an order has an outstanding balance',
        key: CustomerNotifications.OrderInvoice,
        emailSupported: true,
        emailSubject: ORDER_INVOICE_EMAIL_SUBJECT,
        emailBody: ORDER_INVOICE_EMAIL_BODY,
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
        key: CustomerNotifications.OrderEdited,
        emailSupported: true,
        emailSubject: ORDER_EDITED_EMAIL_SUBJECT,
        emailBody: ORDER_EDITED_EMAIL_BODY,
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
        key: CustomerNotifications.OrderCanceled,
        emailSupported: true,
        emailSubject: ORDER_CANCELED_EMAIL_SUBJECT,
        emailBody: ORDER_CANCELED_EMAIL_BODY,
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
        key: CustomerNotifications.OrderPaymentReceipt,
        emailSupported: true,
        emailSubject: ORDER_PAYMENT_RECEIPT_EMAIL_SUBJECT,
        emailBody: ORDER_PAYMENT_RECEIPT_EMAIL_BODY,
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
        key: CustomerNotifications.OrderRefund,
        emailSupported: true,
        emailSubject: ORDER_REFUND_EMAIL_SUBJECT,
        emailBody: ORDER_REFUND_EMAIL_BODY,
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
        key: CustomerNotifications.OrderLink,
        emailSupported: true,
        emailSubject: ORDER_LINK_EMAIL_SUBJECT,
        emailBody: ORDER_LINK_EMAIL_BODY,
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
        key: CustomerNotifications.PaymentError,
        emailSupported: true,
        emailSubject: PAYMENT_ERROR_EMAIL_SUBJECT,
        emailBody: PAYMENT_ERROR_EMAIL_BODY,
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
        key: CustomerNotifications.PendingPaymentError,
        emailSupported: true,
        emailSubject: PENDING_PAYMENT_ERROR_EMAIL_SUBJECT,
        emailBody: PENDING_PAYMENT_ERROR_EMAIL_BODY,
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
        key: CustomerNotifications.PendingPaymentSuccess,
        emailSupported: true,
        emailSubject: PENDING_PAYMENT_SUCCESS_EMAIL_SUBJECT,
        emailBody: PENDING_PAYMENT_SUCCESS_EMAIL_BODY,
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
        key: CustomerNotifications.PaymentReminder,
        emailSupported: true,
        emailSubject: PAYMENT_REMINDER_EMAIL_SUBJECT,
        emailBody: PAYMENT_REMINDER_EMAIL_BODY,
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
        key: CustomerNotifications.ShippingUpdate,
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
        key: CustomerNotifications.OutForDelivery,
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
        key: CustomerNotifications.Delivered,
        emailSupported: true,
        emailSubject: 'Order delivered',
        emailBody: 'Hi {{customer_name}}, order {{order_number}} has been delivered successfully.',
        availableVariables: ['customer_name', 'order_number'],
      },
      {
        segment: 'returns',
        optionName: 'Return created',
        optionDesc: 'Sent when you create a return, including any return label or tracking information',
        key: CustomerNotifications.ReturnCreated,
        emailSupported: true,
        emailSubject: RETURN_CREATED_EMAIL_SUBJECT,
        emailBody: RETURN_CREATED_EMAIL_BODY,
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
        key: CustomerNotifications.OrderLevelReturnLabelCreated,
        emailSupported: true,
        emailSubject: ORDER_LEVEL_RETURN_LABEL_EMAIL_SUBJECT,
        emailBody: ORDER_LEVEL_RETURN_LABEL_EMAIL_BODY,
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
        key: CustomerNotifications.ReturnRequestReceived,
        emailSupported: true,
        emailSubject: RETURN_REQUEST_RECEIVED_EMAIL_SUBJECT,
        emailBody: RETURN_REQUEST_RECEIVED_EMAIL_BODY,
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
        key: CustomerNotifications.ReturnRequestApproved,
        emailSupported: true,
        emailSubject: RETURN_REQUEST_APPROVED_EMAIL_SUBJECT,
        emailBody: RETURN_REQUEST_APPROVED_EMAIL_BODY,
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
        key: CustomerNotifications.ReturnRequestDeclined,
        emailSupported: true,
        emailSubject: RETURN_REQUEST_DECLINED_EMAIL_SUBJECT,
        emailBody: RETURN_REQUEST_DECLINED_EMAIL_BODY,
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
        key: CustomerNotifications.CustomerAccountInvite,
        emailSupported: true,
        emailSubject: 'Invitation to create your account',
        emailBody: 'Hi {{customer_name}}, create your account using this link: {{account_invite_url}}.',
        availableVariables: ['customer_name', 'account_invite_url'],
      },
      {
        segment: 'accounts_and_outreach',
        optionName: 'Customer account welcome',
        optionDesc: 'Sent when a customer completes their account activation',
        key: CustomerNotifications.CustomerAccountWelcome,
        emailSupported: true,
        emailSubject: 'Welcome to our store',
        emailBody: 'Hi {{customer_name}}, welcome! You can manage your account here: {{account_url}}.',
        availableVariables: ['customer_name', 'account_url'],
      },
      {
        segment: 'accounts_and_outreach',
        optionName: 'Customer account password reset',
        optionDesc: 'Sent when a customer requests to reset their account password',
        key: CustomerNotifications.CustomerAccountPasswordReset,
        emailSupported: true,
        emailSubject: 'Reset your password',
        emailBody: 'Hi {{customer_name}}, reset your password using this link: {{password_reset_url}}.',
        availableVariables: ['customer_name', 'password_reset_url'],
      },
      {
        segment: 'accounts_and_outreach',
        optionName: 'Contact customer',
        optionDesc: 'Sent when you contact a customer from the orders or customers page',
        key: CustomerNotifications.ContactCustomer,
        emailSupported: true,
        emailSubject: 'Message from {{store_name}}',
        emailBody: 'Hi {{customer_name}}, {{message_body}}',
        availableVariables: ['customer_name', 'store_name', 'message_body'],
      },
      {
        segment: 'accounts_and_outreach',
        optionName: 'Customer email address change confirmation',
        optionDesc: 'Sent when a customer changes their email address',
        key: CustomerNotifications.CustomerEmailAddressChangeConfirmation,
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
        key: StaffNotifications.NewOrder,
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
        key: StaffNotifications.NewReturnRequest,
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
        key: StaffNotifications.SalesAttributionEdited,
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
        key: StaffNotifications.NewDraftOrder,
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
        key: FulfillmentNotifications.OrderFulfillmentRequest,
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
    await connectDB();

    // Delete all existing notification options
    await NotificationOption.deleteMany({});
    console.log('Deleted all existing notification options');

    // Resolve category IDs dynamically by name for current DB.
    const targetNames = optionSeeds.map((c) => c.categoryName);
    const categories = await NotificationCategory.find({ name: { $in: targetNames } })
      .select('_id name')
      .lean();
    const categoryIdMap = new Map<string, unknown>();
    categories.forEach((cat) => {
      categoryIdMap.set(cat.name, cat._id);
    });

    for (const categorySeed of optionSeeds) {
      const targetCategoryId = categoryIdMap.get(categorySeed.categoryName);
      if (!targetCategoryId) {
        console.warn(
          `Notification category "${categorySeed.categoryName}" not found. Please run seed:notification-categories first.`
        );
        continue;
      }

      for (const option of categorySeed.options) {
        await NotificationOption.updateOne(
          {
            notificationCategoryId: targetCategoryId,
            optionName: option.optionName,
          },
          {
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
          },
          { upsert: true }
        );
      }
    }

    console.log('Notification options seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding notification options:', error);
    process.exit(1);
  }
}

seedNotificationOptions();


