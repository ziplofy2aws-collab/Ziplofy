import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreInvite } from '../models/store-invite/store-invite.model';
import { StoreRole } from '../models/store-role/store-role.model';
import { Store } from '../models/store/store.model';
import { User } from '../models/user.model';
import { sendEmail } from '../utils/email.utils';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { assertStoreAccess } from '../utils/store-access.util';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type StoreUserRow = {
  _id: string;
  email: string;
  name?: string;
  status: 'active' | 'pending' | 'inactive';
  role: string;
  roleId?: string;
  type: 'owner' | 'invite';
  createdAt?: string;
};

function createInviteToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * GET /api/store-invites?storeId=...
 * Returns store owner + pending/accepted invites for the Users table.
 */
export const listStoreUsers = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.query as { storeId?: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  await assertStoreAccess(storeId, req.user);

  const store = await Store.findById(storeId).select('userId storeName').lean();
  if (!store) throw new CustomError('Store not found', 404);

  const owner = await User.findById(store.userId).select('email name status').lean();
  const invites = await StoreInvite.find({
    storeId,
    status: { $in: ['pending', 'accepted'] },
  })
    .populate({ path: 'roleId', select: 'name' })
    .sort({ createdAt: -1 })
    .lean();

  const users: StoreUserRow[] = [];

  if (owner) {
    users.push({
      _id: owner._id.toString(),
      email: owner.email,
      name: owner.name,
      status: owner.status === 'inactive' ? 'inactive' : 'active',
      role: 'Store owner',
      type: 'owner',
    });
  }

  for (const invite of invites) {
    const roleDoc = invite.roleId as unknown as { _id?: mongoose.Types.ObjectId; name?: string } | null;
    users.push({
      _id: invite._id.toString(),
      email: invite.inviteeEmail,
      status: invite.status === 'accepted' ? 'active' : 'pending',
      role: roleDoc?.name || 'Staff',
      roleId: roleDoc?._id?.toString() || invite.roleId?.toString(),
      type: 'invite',
      createdAt: invite.createdAt?.toISOString?.() ?? undefined,
    });
  }

  return res.status(200).json({
    success: true,
    data: users,
    count: users.length,
    message: 'Store users fetched successfully',
  });
});

/**
 * POST /api/store-invites
 * Body: { storeId, email, roleId }
 */
export const createStoreInvite = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, email, roleId } = req.body || {};
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  if (!roleId || !mongoose.isValidObjectId(roleId)) {
    throw new CustomError('Valid roleId is required', 400);
  }

  const inviteeEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(inviteeEmail)) {
    throw new CustomError('A valid email address is required', 400);
  }

  await assertStoreAccess(storeId, req.user);
  if (!req.user) throw new CustomError('Unauthorized', 401);

  const store = await Store.findById(storeId).select('userId storeName').lean();
  if (!store) throw new CustomError('Store not found', 404);

  const owner = await User.findById(store.userId).select('email').lean();
  if (owner?.email?.toLowerCase() === inviteeEmail) {
    throw new CustomError('The store owner already has access to this store', 400);
  }

  const role = await StoreRole.findOne({ _id: roleId, storeId }).lean();
  if (!role) throw new CustomError('Role not found for this store', 404);

  const existingPending = await StoreInvite.findOne({
    storeId,
    inviteeEmail,
    status: 'pending',
  }).lean();
  if (existingPending) {
    throw new CustomError('An invite is already pending for this email', 409);
  }

  const inviter = await User.findById(req.user.id).select('email name').lean();
  const inviterEmail = inviter?.email || req.user.email;
  const token = createInviteToken();

  const invite = await StoreInvite.create({
    storeId,
    inviterId: req.user.id,
    inviterEmail,
    inviteeEmail,
    roleId,
    status: 'pending',
    token,
  });

  try {
    const storeName = store.storeName || 'the store';
    const inviterName = inviter?.name || inviterEmail;
    await sendEmail({
      to: inviteeEmail,
      subject: `You've been invited to ${storeName}`,
      body: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#202223;">
          <h2 style="margin:0 0 12px;">You're invited to join ${storeName}</h2>
          <p style="margin:0 0 12px;">${inviterName} invited you as <strong>${role.name}</strong>.</p>
          <p style="margin:0 0 12px;">Sign in to Codiic with this email to access the store once your invite is ready.</p>
          <p style="margin:0;color:#6d7175;font-size:13px;">If you weren't expecting this invite, you can ignore this email.</p>
        </div>
      `.trim(),
    });
  } catch (emailError) {
    console.error('Failed to send store invite email:', emailError);
  }

  const populated = await StoreInvite.findById(invite._id)
    .populate({ path: 'roleId', select: 'name' })
    .lean();

  const roleDoc = populated?.roleId as unknown as { _id?: mongoose.Types.ObjectId; name?: string } | null;

  return res.status(201).json({
    success: true,
    data: {
      _id: invite._id.toString(),
      email: invite.inviteeEmail,
      status: 'pending' as const,
      role: roleDoc?.name || role.name,
      roleId: role._id.toString(),
      type: 'invite' as const,
      createdAt: invite.createdAt?.toISOString?.(),
    },
    message: 'Invite sent successfully',
  });
});
