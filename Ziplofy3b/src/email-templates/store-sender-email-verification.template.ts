import { config } from '../config';
import type { EmailTemplateResult } from './types';

export interface StoreSenderEmailVerificationTemplateParams {
  storeName: string;
  verifyUrl: string;
  expiresInHours?: number;
}

export function buildStoreSenderEmailVerificationUrl(token: string): string {
  return `${config.clientUrl}/settings/notifications/verify-sender-email?token=${encodeURIComponent(token)}`;
}

export function buildStoreSenderEmailVerificationEmail(
  params: StoreSenderEmailVerificationTemplateParams
): EmailTemplateResult {
  const { storeName, verifyUrl, expiresInHours = 24 } = params;

  return {
    subject: `Verify your sender email for ${storeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin-bottom: 16px;">Verify your sender email</h2>
        <p>Confirm that you have access to this email address for <strong>${storeName}</strong>.</p>
        <p>Click the button below to verify your sender email. This link expires in ${expiresInHours} hours.</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;">
            Verify sender email
          </a>
        </p>
        <p style="font-size: 14px; color: #6b7280;">If you did not request this, you can ignore this email.</p>
      </div>
    `.trim(),
  };
}
