import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreContactInfo } from '../models/store-contact-info/store-contact-info.model';
import { StorePrivacyPolicy } from '../models/store-privacy-policy/store-privacy-policy.model';
import { StoreReturnRefundPolicy } from '../models/store-return-refund-policy/store-return-refund-policy.model';
import { StoreShippingPolicy } from '../models/store-shipping-policy/store-shipping-policy.model';
import { StoreTermsPolicy } from '../models/store-terms-policy/store-terms-policy.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import {
  hasMeaningfulPolicyContent,
  isStorefrontPolicyType,
  type StorefrontPolicyTypeKey,
} from '../utils/store-policy-content.util';

export type StorefrontPolicyPayload = {
  content: string;
  updatedAt: string;
};

export type StorefrontWrittenPoliciesPayload = {
  returnRefund: StorefrontPolicyPayload | null;
  privacy: StorefrontPolicyPayload | null;
  terms: StorefrontPolicyPayload | null;
  shipping: StorefrontPolicyPayload | null;
  contact: StorefrontPolicyPayload | null;
};

function assertValidStoreId(storeId: string): void {
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
}

function toPublicPolicy(
  doc: unknown,
  content: string | undefined | null
): StorefrontPolicyPayload | null {
  if (!doc || !hasMeaningfulPolicyContent(content)) return null;
  const updatedAt = (doc as { updatedAt?: Date }).updatedAt;
  return {
    content: content!.trim(),
    updatedAt: updatedAt ? new Date(updatedAt).toISOString() : new Date().toISOString(),
  };
}

async function loadPolicyByType(
  storeId: string,
  policyType: StorefrontPolicyTypeKey
): Promise<StorefrontPolicyPayload | null> {
  switch (policyType) {
    case 'return-refund': {
      const doc = await StoreReturnRefundPolicy.findOne({ storeId })
        .select({ returnRefundPolicy: 1, updatedAt: 1 })
        .lean();
      return toPublicPolicy(doc, doc?.returnRefundPolicy);
    }
    case 'privacy': {
      const doc = await StorePrivacyPolicy.findOne({ storeId })
        .select({ privacyPolicy: 1, updatedAt: 1 })
        .lean();
      return toPublicPolicy(doc, doc?.privacyPolicy);
    }
    case 'terms': {
      const doc = await StoreTermsPolicy.findOne({ storeId })
        .select({ termsPolicy: 1, updatedAt: 1 })
        .lean();
      return toPublicPolicy(doc, doc?.termsPolicy);
    }
    case 'shipping': {
      const doc = await StoreShippingPolicy.findOne({ storeId })
        .select({ shippingPolicy: 1, updatedAt: 1 })
        .lean();
      return toPublicPolicy(doc, doc?.shippingPolicy);
    }
    case 'contact': {
      const doc = await StoreContactInfo.findOne({ storeId })
        .select({ contactInfo: 1, updatedAt: 1 })
        .lean();
      return toPublicPolicy(doc, doc?.contactInfo);
    }
    default:
      return null;
  }
}

async function loadWrittenPoliciesForStore(storeId: string): Promise<StorefrontWrittenPoliciesPayload> {
  const [returnRefund, privacy, terms, shipping, contact] = await Promise.all([
    StoreReturnRefundPolicy.findOne({ storeId }).select({ returnRefundPolicy: 1, updatedAt: 1 }).lean(),
    StorePrivacyPolicy.findOne({ storeId }).select({ privacyPolicy: 1, updatedAt: 1 }).lean(),
    StoreTermsPolicy.findOne({ storeId }).select({ termsPolicy: 1, updatedAt: 1 }).lean(),
    StoreShippingPolicy.findOne({ storeId }).select({ shippingPolicy: 1, updatedAt: 1 }).lean(),
    StoreContactInfo.findOne({ storeId }).select({ contactInfo: 1, updatedAt: 1 }).lean(),
  ]);

  return {
    returnRefund: toPublicPolicy(returnRefund, returnRefund?.returnRefundPolicy),
    privacy: toPublicPolicy(privacy, privacy?.privacyPolicy),
    terms: toPublicPolicy(terms, terms?.termsPolicy),
    shipping: toPublicPolicy(shipping, shipping?.shippingPolicy),
    contact: toPublicPolicy(contact, contact?.contactInfo),
  };
}

// GET /storefront/policies/store/:storeId
export const getStorefrontWrittenPoliciesByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  assertValidStoreId(storeId);

  const data = await loadWrittenPoliciesForStore(storeId);

  return res.status(200).json({
    success: true,
    data,
    message: 'Storefront written policies fetched',
  });
});

// GET /storefront/policies/store/:storeId/type/:policyType
export const getStorefrontPolicyByType = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, policyType } = req.params as { storeId: string; policyType: string };
  assertValidStoreId(storeId);

  if (!isStorefrontPolicyType(policyType)) {
    throw new CustomError(
      'policyType must be one of: return-refund, privacy, terms, shipping, contact',
      400
    );
  }

  const policy = await loadPolicyByType(storeId, policyType);

  return res.status(200).json({
    success: true,
    data: policy,
    message: policy ? 'Storefront policy fetched' : 'No policy found',
  });
});
