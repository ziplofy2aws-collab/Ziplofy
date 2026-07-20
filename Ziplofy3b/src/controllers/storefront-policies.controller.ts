import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StoreContactInfo } from '../models/store-contact-info/store-contact-info.model';
import { StorePrivacyPolicy } from '../models/store-privacy-policy/store-privacy-policy.model';
import { StoreReturnRefundPolicy } from '../models/store-return-refund-policy/store-return-refund-policy.model';
import { StoreShippingPolicy } from '../models/store-shipping-policy/store-shipping-policy.model';
import { StoreTermsPolicy } from '../models/store-terms-policy/store-terms-policy.model';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

export type StorefrontPolicyType =
  | 'return-refund'
  | 'privacy'
  | 'terms'
  | 'shipping'
  | 'contact';

type PolicyContent = { content: string; updatedAt: string } | null;

type WrittenPolicies = {
  returnRefund: PolicyContent;
  privacy: PolicyContent;
  terms: PolicyContent;
  shipping: PolicyContent;
  contact: PolicyContent;
};

const POLICY_TYPES: StorefrontPolicyType[] = [
  'return-refund',
  'privacy',
  'terms',
  'shipping',
  'contact',
];

function toContent(raw: string | undefined | null, updatedAt?: Date | string | null): PolicyContent {
  const content = typeof raw === 'string' ? raw.trim() : '';
  if (!content) return null;
  return {
    content,
    updatedAt: updatedAt ? new Date(updatedAt).toISOString() : new Date().toISOString(),
  };
}

async function loadWrittenPolicies(storeId: string): Promise<WrittenPolicies> {
  const [returnRefund, privacy, terms, shipping, contact] = await Promise.all([
    StoreReturnRefundPolicy.findOne({ storeId }).lean(),
    StorePrivacyPolicy.findOne({ storeId }).lean(),
    StoreTermsPolicy.findOne({ storeId }).lean(),
    StoreShippingPolicy.findOne({ storeId }).lean(),
    StoreContactInfo.findOne({ storeId }).lean(),
  ]);

  return {
    returnRefund: toContent(
      (returnRefund as { returnRefundPolicy?: string; updatedAt?: Date } | null)?.returnRefundPolicy,
      (returnRefund as { updatedAt?: Date } | null)?.updatedAt
    ),
    privacy: toContent(
      (privacy as { privacyPolicy?: string; updatedAt?: Date } | null)?.privacyPolicy,
      (privacy as { updatedAt?: Date } | null)?.updatedAt
    ),
    terms: toContent(
      (terms as { termsPolicy?: string; updatedAt?: Date } | null)?.termsPolicy,
      (terms as { updatedAt?: Date } | null)?.updatedAt
    ),
    shipping: toContent(
      (shipping as { shippingPolicy?: string; updatedAt?: Date } | null)?.shippingPolicy,
      (shipping as { updatedAt?: Date } | null)?.updatedAt
    ),
    contact: toContent(
      (contact as { contactInfo?: string; updatedAt?: Date } | null)?.contactInfo,
      (contact as { updatedAt?: Date } | null)?.updatedAt
    ),
  };
}

function policyByType(all: WrittenPolicies, type: StorefrontPolicyType): PolicyContent {
  switch (type) {
    case 'return-refund':
      return all.returnRefund;
    case 'privacy':
      return all.privacy;
    case 'terms':
      return all.terms;
    case 'shipping':
      return all.shipping;
    case 'contact':
      return all.contact;
    default:
      return null;
  }
}

/** GET /storefront/policies/store/:storeId */
export const getStorefrontWrittenPolicies = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const data = await loadWrittenPolicies(storeId);
  return res.status(200).json({
    success: true,
    data,
    message: 'Store policies fetched',
  });
});

/** GET /storefront/policies/store/:storeId/type/:policyType */
export const getStorefrontPolicyByType = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, policyType } = req.params as { storeId: string; policyType: string };
  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }
  if (!POLICY_TYPES.includes(policyType as StorefrontPolicyType)) {
    throw new CustomError('Invalid policy type', 400);
  }

  const all = await loadWrittenPolicies(storeId);
  const data = policyByType(all, policyType as StorefrontPolicyType);
  return res.status(200).json({
    success: true,
    data,
    message: data ? 'Store policy fetched' : 'No policy found',
  });
});
