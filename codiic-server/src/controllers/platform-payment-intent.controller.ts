import { Request, Response } from 'express';
import { PlatformPaymentIntent } from '../models/platform-payment-intent.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

/** Super-admin / support-admin: list client SaaS onboarding payment intents. */
export const listPlatformPaymentIntents = asyncErrorHandler(async (req: Request, res: Response) => {
  const userRole = (req.user as { role?: string; superAdmin?: boolean } | undefined)?.role;
  const isSuperAdmin = Boolean((req.user as { superAdmin?: boolean } | undefined)?.superAdmin);
  const isSupportAdmin = userRole?.toLowerCase() === 'support-admin';

  if (!isSuperAdmin && !isSupportAdmin) {
    throw new CustomError('Only super-admin or support-admin can view payment intents', 403);
  }

  const rows = await PlatformPaymentIntent.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return res.status(200).json({
    success: true,
    count: rows.length,
    data: rows.map((row) => ({
      _id: row._id,
      userId: row.userId,
      userName: row.userName,
      userEmail: row.userEmail,
      goals: row.goals || [],
      paymentMethod: row.paymentMethod,
      paymentHint: row.paymentHint || '',
      planName: row.planName || 'Basic',
      amount: row.amount ?? 20,
      currency: row.currency || 'INR',
      status: row.status,
      createdAt: row.createdAt,
    })),
  });
});
