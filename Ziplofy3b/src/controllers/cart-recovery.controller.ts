import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { sendEmail } from '../utils/email.utils';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

/** Temporary until customer emails are verified — mirrors frontend test recipient. */
const RECOVERY_EMAIL_TEST_RECIPIENT = 'developer200419@gmail.com';

export const sendCartRecoveryEmail = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { subject, html } = req.body as { subject?: string; html?: string };

  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const trimmedSubject = subject?.trim();
  const trimmedHtml = html?.trim();

  if (!trimmedSubject) {
    throw new CustomError('Email subject is required', 400);
  }

  if (!trimmedHtml) {
    throw new CustomError('Email body is required', 400);
  }

  await sendEmail({
    to: RECOVERY_EMAIL_TEST_RECIPIENT,
    subject: trimmedSubject,
    body: trimmedHtml,
  });

  res.status(200).json({
    success: true,
    message: `Recovery email sent to ${RECOVERY_EMAIL_TEST_RECIPIENT}`,
    sentTo: RECOVERY_EMAIL_TEST_RECIPIENT,
  });
});
