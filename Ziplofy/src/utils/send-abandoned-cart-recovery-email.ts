import { axiosi } from '../config/axios.config';
import {
  RECOVERY_EMAIL_TEST_RECIPIENT,
  wrapCartRecoveryEmailHtml,
} from './recovery-email-templates';

export type SendAbandonedCartRecoveryEmailParams = {
  storeId: string;
  storeName: string;
  customerFirstName?: string;
  subject: string;
  bodyHtml: string;
  cartLink?: string;
};

export type SendAbandonedCartRecoveryEmailResponse = {
  success: boolean;
  message: string;
  sentTo: string;
};

export async function sendAbandonedCartRecoveryEmail(
  params: SendAbandonedCartRecoveryEmailParams
): Promise<SendAbandonedCartRecoveryEmailResponse> {
  const html = wrapCartRecoveryEmailHtml(params.bodyHtml, {
    storeName: params.storeName,
    customerFirstName: params.customerFirstName,
    cartLink: params.cartLink,
  });

  const response = await axiosi.post<SendAbandonedCartRecoveryEmailResponse>(
    `/storefront/cart/store/${params.storeId}/recovery-email`,
    {
      subject: params.subject,
      html,
    }
  );

  return response.data;
}

export { RECOVERY_EMAIL_TEST_RECIPIENT };
