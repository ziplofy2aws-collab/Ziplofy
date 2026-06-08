import dotenv from 'dotenv';
import { connectDB } from '../../config/database.config';
import { NotificationCategory } from '../../models/notification-category/notification-category.model';
import { NotificationOption } from '../../models/notification-option/notification-option.model';
import { CustomerNotifications } from '../../enums/customer-notifications.enum';
import { StaffNotifications } from '../../enums/staff-notifications.enum';
import { FulfillmentNotifications } from '../../enums/fulfillment-notifications.enum';

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
        emailSubject: 'Order confirmation',
        emailBody: 'Hi {{customer_name}}, your order {{order_number}} is confirmed. We\'ll notify you when it ships.',
        availableVariables: ['customer_name', 'order_number', 'order_total'],
      },
      {
        segment: 'order_processing',
        optionName: 'Draft order invoice',
        optionDesc: 'Sent when you create an invoice on the draft order page',
        key: CustomerNotifications.DraftOrderInvoice,
        emailSupported: true,
        emailSubject: 'Invoice for draft order',
        emailBody: 'Hi {{customer_name}}, you have a new invoice for draft order {{order_number}}.',
        availableVariables: ['customer_name', 'order_number', 'order_total'],
      },
      {
        segment: 'order_processing',
        optionName: 'Shipping confirmation',
        optionDesc: 'Sent when you mark an order as fulfilled',
        key: CustomerNotifications.ShippingConfirmation,
        emailSupported: true,
        emailSubject: 'Your order has shipped',
        emailBody: 'Hi {{customer_name}}, your order {{order_number}} is on its way. Track it here: {{tracking_url}}.',
        availableVariables: ['customer_name', 'order_number', 'tracking_url'],
      },
      {
        segment: 'local_pick_up',
        optionName: 'Ready for local pickup',
        optionDesc: 'Sent when an order is ready to be picked up',
        key: CustomerNotifications.ReadyForLocalPickup,
        emailSupported: true,
        emailSubject: 'Order ready for pickup',
        emailBody: 'Hi {{customer_name}}, order {{order_number}} is ready for pickup at {{pickup_location}}.',
        smsSupported: true,
        smsData: 'Order {{order_number}} is ready for pickup at {{pickup_location}}.',
        availableVariables: ['customer_name', 'order_number', 'pickup_location'],
      },
      {
        segment: 'local_pick_up',
        optionName: 'Picked up by customer',
        optionDesc: 'Sent to confirm an order was picked up by the customer',
        key: CustomerNotifications.PickedUpByCustomer,
        emailSupported: true,
        emailSubject: 'Order picked up',
        emailBody: 'Hi {{customer_name}}, thanks for picking up order {{order_number}}.',
        smsSupported: true,
        smsData: 'Order {{order_number}} has been picked up. Thank you!',
        availableVariables: ['customer_name', 'order_number'],
      },
      {
        segment: 'local_delivery',
        optionName: 'Order out for local delivery',
        optionDesc: 'Sent when an order is out for local delivery',
        toggle: true,
        toggleValue: 'true',
        key: CustomerNotifications.OrderOutForLocalDelivery,
        emailSupported: true,
        emailSubject: 'Order out for delivery',
        emailBody: 'Hi {{customer_name}}, your order {{order_number}} is out for local delivery.',
        availableVariables: ['customer_name', 'order_number'],
      },
      {
        segment: 'local_delivery',
        optionName: 'Order locally delivered',
        optionDesc: 'Sent to confirm the order was delivered',
        toggle: true,
        toggleValue: 'true',
        key: CustomerNotifications.OrderLocallyDelivered,
        emailSupported: true,
        emailSubject: 'Order delivered',
        emailBody: 'Hi {{customer_name}}, your order {{order_number}} has been delivered. Enjoy!',
        availableVariables: ['customer_name', 'order_number'],
      },
      {
        segment: 'local_delivery',
        optionName: 'Order missed local delivery',
        optionDesc: 'Sent when a customer misses a local delivery',
        toggle: true,
        toggleValue: 'true',
        key: CustomerNotifications.OrderMissedLocalDelivery,
        emailSupported: true,
        emailSubject: 'Missed delivery attempt',
        emailBody: 'Hi {{customer_name}}, we attempted to deliver order {{order_number}} but missed you. Please reschedule.',
        availableVariables: ['customer_name', 'order_number'],
      },
      {
        segment: 'gift_cards',
        optionName: 'New gift card',
        optionDesc: 'Sent to the customer or recipient when a gift card is fulfilled, or when you send a gift card',
        key: CustomerNotifications.NewGiftCard,
        emailSupported: true,
        emailSubject: 'You received a gift card',
        emailBody: 'Hi {{recipient_name}}, you received a gift card worth {{gift_card_amount}} from {{customer_name}}.',
        smsSupported: true,
        smsData: 'You received a gift card worth {{gift_card_amount}} from {{customer_name}}.',
        availableVariables: ['recipient_name', 'gift_card_amount', 'customer_name'],
      },
      {
        segment: 'gift_cards',
        optionName: 'Gift card receipt',
        optionDesc: 'Sent to the customer if they add a recipient to a gift card',
        key: CustomerNotifications.GiftCardReceipt,
        emailSupported: true,
        emailSubject: 'Gift card receipt',
        emailBody: 'Hi {{customer_name}}, here is the receipt for the gift card sent to {{recipient_name}}.',
        availableVariables: ['customer_name', 'recipient_name', 'gift_card_amount'],
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
        emailSubject: 'Invoice for order',
        emailBody: 'Hi {{customer_name}}, your order {{order_number}} has an outstanding balance of {{amount_due}}.',
        availableVariables: ['customer_name', 'order_number', 'amount_due'],
      },
      {
        segment: 'order_exceptions',
        optionName: 'Order edited',
        optionDesc: 'Sent when an order is edited',
        key: CustomerNotifications.OrderEdited,
        emailSupported: true,
        emailSubject: 'Order updated',
        emailBody: 'Hi {{customer_name}}, your order {{order_number}} was updated. Review the changes in your account.',
        availableVariables: ['customer_name', 'order_number'],
      },
      {
        segment: 'order_exceptions',
        optionName: 'Order canceled',
        optionDesc: 'Sent if a customer cancels their order',
        key: CustomerNotifications.OrderCanceled,
        emailSupported: true,
        emailSubject: 'Order canceled',
        emailBody: 'Hi {{customer_name}}, your order {{order_number}} has been canceled. Let us know if you have questions.',
        availableVariables: ['customer_name', 'order_number'],
      },
      {
        segment: 'order_exceptions',
        optionName: 'Order payment receipt',
        optionDesc: "Sent after you charge a customer's saved payment method",
        key: CustomerNotifications.OrderPaymentReceipt,
        emailSupported: true,
        emailSubject: 'Payment receipt',
        emailBody: 'Hi {{customer_name}}, we received payment for order {{order_number}}. Amount paid: {{amount_paid}}.',
        availableVariables: ['customer_name', 'order_number', 'amount_paid'],
      },
      {
        segment: 'order_exceptions',
        optionName: 'Order refund',
        optionDesc: 'Sent if an order is refunded',
        key: CustomerNotifications.OrderRefund,
        emailSupported: true,
        emailSubject: 'Order refund processed',
        emailBody: 'Hi {{customer_name}}, a refund of {{refund_amount}} for order {{order_number}} has been processed.',
        availableVariables: ['customer_name', 'order_number', 'refund_amount'],
      },
      {
        segment: 'order_exceptions',
        optionName: 'Order link',
        optionDesc: 'Sent when a customer requests a new link from an expired order status page',
        key: CustomerNotifications.OrderLink,
        emailSupported: true,
        emailSubject: 'Your updated order link',
        emailBody: 'Hi {{customer_name}}, here is the updated link for order {{order_number}}: {{order_status_url}}.',
        availableVariables: ['customer_name', 'order_number', 'order_status_url'],
      },
      {
        segment: 'payments',
        optionName: 'Payment error',
        optionDesc: "Sent if a customer's payment can't be processed during checkout",
        key: CustomerNotifications.PaymentError,
        emailSupported: true,
        emailSubject: 'Payment error on order',
        emailBody: 'Hi {{customer_name}}, we were unable to process payment for order {{order_number}}. Please update your payment method.',
        availableVariables: ['customer_name', 'order_number'],
      },
      {
        segment: 'payments',
        optionName: 'Pending payment error',
        optionDesc: "Sent when a customer's pending payment can't be processed",
        key: CustomerNotifications.PendingPaymentError,
        emailSupported: true,
        emailSubject: 'Pending payment error',
        emailBody: 'Hi {{customer_name}}, we were unable to process the pending payment for order {{order_number}}. Please review the payment details.',
        availableVariables: ['customer_name', 'order_number'],
      },
      {
        segment: 'payments',
        optionName: 'Pending payment success',
        optionDesc: "Sent after a customer's pending payment has been processed successfully",
        key: CustomerNotifications.PendingPaymentSuccess,
        emailSupported: true,
        emailSubject: 'Payment processed successfully',
        emailBody: 'Hi {{customer_name}}, the pending payment for order {{order_number}} has been processed successfully.',
        availableVariables: ['customer_name', 'order_number'],
      },
      {
        segment: 'payments',
        optionName: 'Payment reminder',
        optionDesc: 'Sent on or after the due date for an unpaid order',
        key: CustomerNotifications.PaymentReminder,
        emailSupported: true,
        emailSubject: 'Payment reminder',
        emailBody: 'Hi {{customer_name}}, payment for order {{order_number}} is due. Amount due: {{amount_due}}.',
        availableVariables: ['customer_name', 'order_number', 'amount_due'],
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
        emailSubject: 'Return created',
        emailBody: 'Hi {{customer_name}}, a return for order {{order_number}} has been created. Track it here: {{return_tracking_url}}.',
        availableVariables: ['customer_name', 'order_number', 'return_tracking_url'],
      },
      {
        segment: 'returns',
        optionName: 'Order-level return label created',
        optionDesc: 'Sent when you create a return label from the order page (US only)',
        key: CustomerNotifications.OrderLevelReturnLabelCreated,
        emailSupported: true,
        emailSubject: 'Return label created',
        emailBody: 'Hi {{customer_name}}, a return label for order {{order_number}} has been created. Download it here: {{return_label_url}}.',
        availableVariables: ['customer_name', 'order_number', 'return_label_url'],
      },
      {
        segment: 'returns',
        optionName: 'Return request received',
        optionDesc: "Sent to confirm a customer's self-serve return request was received",
        key: CustomerNotifications.ReturnRequestReceived,
        emailSupported: true,
        emailSubject: 'Return request received',
        emailBody: 'Hi {{customer_name}}, we received your return request for order {{order_number}}. We\'ll review it soon.',
        availableVariables: ['customer_name', 'order_number'],
      },
      {
        segment: 'returns',
        optionName: 'Return request approved',
        optionDesc: 'Sent when you approve a return request',
        key: CustomerNotifications.ReturnRequestApproved,
        emailSupported: true,
        emailSubject: 'Return approved',
        emailBody: 'Hi {{customer_name}}, your return request for order {{order_number}} has been approved.',
        availableVariables: ['customer_name', 'order_number'],
      },
      {
        segment: 'returns',
        optionName: 'Return request declined',
        optionDesc: 'Sent when you decline a return request',
        key: CustomerNotifications.ReturnRequestDeclined,
        emailSupported: true,
        emailSubject: 'Return request declined',
        emailBody: 'Hi {{customer_name}}, your return request for order {{order_number}} was declined. Contact support for help.',
        availableVariables: ['customer_name', 'order_number'],
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


