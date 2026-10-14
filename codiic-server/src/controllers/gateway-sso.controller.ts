import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { CodiicUser } from '../models/codiic-user.model';
import { GatewayConsumedTicket } from '../models/gateway-consumed-ticket.model';
import { Store } from '../models/store/store.model';
import { createDefaultResourcesForNewUser } from '../utils/client-store-bootstrap.util';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { isFreshTimestamp, verifyGatewayHmac } from '../utils/gateway-hmac.util';
import { signAccessToken, toSecureUser } from './codiic-auth.controller';

const CLIENT_ROLE_ID = '68c2bf34749d79f42291f35a';

type ProvisionBody = {
  email?: string;
  name?: string;
  businessName?: string;
  industry?: string;
  industryKind?: 'ecommerce' | 'service' | '';
  selectedService?: string;
  platformUserId?: string;
};

function requireGatewaySecret(): string {
  const secret = process.env.GATEWAY_SSO_SECRET || (process.env.NODE_ENV === 'development'
    ? 'dev-gateway-sso-secret-change-me'
    : '');
  if (!secret) throw new CustomError('GATEWAY_SSO_SECRET is not configured', 500);
  return secret;
}

function assertGatewaySignature(req: Request): void {
  const timestamp = String(req.headers['x-gateway-timestamp'] || '');
  const signature = String(req.headers['x-gateway-signature'] || '');
  if (!isFreshTimestamp(timestamp) || !verifyGatewayHmac(requireGatewaySecret(), timestamp, req.body || {}, signature)) {
    throw new CustomError('Invalid gateway signature', 401);
  }
}

export const provisionMerchant = asyncErrorHandler(async (req: Request, res: Response) => {
  assertGatewaySignature(req);
  const body = req.body as ProvisionBody;
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim() || email.split('@')[0] || 'User';
  const businessName = String(body.businessName || '').trim();
  if (!email || !businessName) throw new CustomError('email and businessName are required', 400);

  let user = await CodiicUser.findOne({ email });
  let store = user ? await Store.findOne({ userId: user._id }) : null;

  if (!user) {
    user = await CodiicUser.create({
      name,
      email,
      provider: 'gateway',
      role: new mongoose.Types.ObjectId(CLIENT_ROLE_ID),
      status: 'Active',
      totalPurchases: 0,
      onboardingStatus: 'completed',
      onboardingCompletedAt: new Date(),
    });
    const created = await createDefaultResourcesForNewUser(user, {
      storeName: businessName,
      industry: body.industry || '',
      industryKind: body.industryKind === 'ecommerce' || body.industryKind === 'service' ? body.industryKind : '',
    });
    store = await Store.findById(created.storeId);
  } else {
    user.onboardingStatus = 'completed';
    user.onboardingCompletedAt = user.onboardingCompletedAt || new Date();
    await user.save();
    if (!store) {
      const created = await createDefaultResourcesForNewUser(user, {
        storeName: businessName,
        industry: body.industry || '',
        industryKind: body.industryKind === 'ecommerce' || body.industryKind === 'service' ? body.industryKind : '',
      });
      store = await Store.findById(created.storeId);
    } else if (body.industry && !store.industry) {
      store.industry = body.industry;
      store.industryKind = body.industryKind === 'ecommerce' || body.industryKind === 'service' ? body.industryKind : '';
      await store.save();
    }
  }

  return res.status(200).json({
    success: true,
    productUserId: user._id.toString(),
    productStoreId: store?._id?.toString() || '',
    launchPath: '/',
  });
});

type SsoTicketPayload = {
  typ?: string;
  jti?: string;
  dest?: string;
  productUserId?: string;
  launchPath?: string;
};

export const exchangeGatewaySso = asyncErrorHandler(async (req: Request, res: Response) => {
  const ticket = String((req.body as { ticket?: string })?.ticket || '');
  if (!ticket) throw new CustomError('ticket is required', 400);

  let decoded: SsoTicketPayload;
  try {
    decoded = jwt.verify(ticket, requireGatewaySecret()) as SsoTicketPayload;
  } catch {
    throw new CustomError('Invalid or expired ticket', 401);
  }

  if (decoded.typ !== 'gateway-sso' || decoded.dest !== 'codiic' || !decoded.jti || !decoded.productUserId) {
    throw new CustomError('Invalid ticket', 401);
  }

  try {
    await GatewayConsumedTicket.create({
      jti: decoded.jti,
      productUserId: decoded.productUserId,
    });
  } catch (err: any) {
    if (err?.code === 11000) throw new CustomError('Ticket already used', 401);
    throw err;
  }

  const user = await CodiicUser.findById(decoded.productUserId);
  if (!user) throw new CustomError('User not found', 404);

  const token = signAccessToken(user);
  return res.status(200).json(toSecureUser(user, token));
});
