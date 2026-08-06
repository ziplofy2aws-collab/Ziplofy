import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';
import { computeStoreOrderTax, resolveStoreTaxRate } from '../utils/store-tax.util';

/** GET /api/storefront/:storeId/tax-rate?country=&state=&countryId=&stateId=&subtotal=&shipping= */
export const getStorefrontTaxRate = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params as { storeId: string };
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError('Valid storeId is required', 400);
  }

  const {
    country,
    state,
    countryId,
    stateId,
    subtotal,
    shipping,
  } = req.query as {
    country?: string;
    state?: string;
    countryId?: string;
    stateId?: string;
    subtotal?: string;
    shipping?: string;
  };

  const resolved = await resolveStoreTaxRate({
    storeId,
    countryId,
    countryNameOrIso: country,
    stateId,
    stateNameOrCode: state,
  });

  const subtotalNum = subtotal != null ? Number(subtotal) : NaN;
  const shippingNum = shipping != null ? Number(shipping) : 0;

  let computed: Awaited<ReturnType<typeof computeStoreOrderTax>> | null = null;
  if (!Number.isNaN(subtotalNum)) {
    computed = await computeStoreOrderTax({
      storeId,
      subtotal: subtotalNum,
      shippingCost: shippingNum,
      countryId,
      countryNameOrIso: country,
      stateId,
      stateNameOrCode: state,
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      ratePercent: resolved.ratePercent,
      label: resolved.label,
      calculationMethod: resolved.calculationMethod,
      countryIso2: resolved.countryIso2,
      source: resolved.source,
      ...(computed
        ? {
            tax: computed.tax,
            taxableBase: computed.taxableBase,
            taxIncludedInPrice: computed.taxIncludedInPrice,
          }
        : {}),
    },
  });
});
