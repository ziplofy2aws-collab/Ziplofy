export type { EmailTemplateResult } from './types';

export {
  buildStoreSenderEmailVerificationEmail,
  buildStoreSenderEmailVerificationUrl,
  type StoreSenderEmailVerificationTemplateParams,
} from './store-sender-email-verification.template';

export {
  buildOrderConfirmationEmail,
  type OrderConfirmationEmailTemplateParams,
} from './order-confirmation.template';
