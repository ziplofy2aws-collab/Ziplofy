import { Request, Response } from "express";
import {
  IMembershipPlan,
  IMembershipPlanFeature,
  MembershipPlan,
} from "../models/membership-plan/membership-plan.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

type PlanPayload = Pick<
  IMembershipPlan,
  "name" | "description" | "priceMonthly" | "priceYearly" | "features" | "isPopular" | "isActive" | "sortOrder"
>;

const normalizeFeatures = (features: IMembershipPlanFeature[] = []): IMembershipPlanFeature[] =>
  features
    .map((feature) => ({
      name: String(feature.name || "").trim(),
      included: Boolean(feature.included),
    }))
    .filter((feature) => feature.name.length > 0);

const validatePlanPayload = (payload: Partial<PlanPayload>, isCreate = false) => {
  if (isCreate) {
    if (!payload.name?.trim()) throw new CustomError("Plan name is required", 400);
    if (!payload.description?.trim()) throw new CustomError("Plan description is required", 400);
    if (payload.priceMonthly == null || payload.priceMonthly < 0) {
      throw new CustomError("Valid monthly price is required", 400);
    }
    if (payload.priceYearly == null || payload.priceYearly < 0) {
      throw new CustomError("Valid yearly price is required", 400);
    }
  }
};

const clearOtherPopularPlans = async (excludeId?: string) => {
  const filter: Record<string, unknown> = { isPopular: true };
  if (excludeId) filter._id = { $ne: excludeId };
  await MembershipPlan.updateMany(filter, { isPopular: false });
};

export const getMembershipPlans = asyncErrorHandler(async (_req: Request, res: Response) => {
  const plans = await MembershipPlan.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  res.status(200).json({
    success: true,
    data: plans,
    count: plans.length,
  });
});

export const getAllMembershipPlansAdmin = asyncErrorHandler(async (_req: Request, res: Response) => {
  const plans = await MembershipPlan.find()
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  res.status(200).json({
    success: true,
    data: plans,
    count: plans.length,
  });
});

export const getMembershipPlanById = asyncErrorHandler(async (req: Request, res: Response) => {
  const plan = await MembershipPlan.findById(req.params.id).lean();
  if (!plan) throw new CustomError("Membership plan not found", 404);

  res.status(200).json({
    success: true,
    data: plan,
  });
});

export const createMembershipPlan = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    name,
    description,
    priceMonthly,
    priceYearly,
    features = [],
    isPopular = false,
    isActive = true,
    sortOrder = 0,
  } = req.body as Partial<PlanPayload>;

  validatePlanPayload(req.body, true);

  if (isPopular) {
    await clearOtherPopularPlans();
  }

  const plan = await MembershipPlan.create({
    name: name!.trim(),
    description: description!.trim(),
    priceMonthly,
    priceYearly,
    features: normalizeFeatures(features),
    isPopular,
    isActive,
    sortOrder,
  });

  res.status(201).json({
    success: true,
    data: plan,
    message: "Membership plan created successfully",
  });
});

export const updateMembershipPlan = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const plan = await MembershipPlan.findById(id);
  if (!plan) throw new CustomError("Membership plan not found", 404);

  const {
    name,
    description,
    priceMonthly,
    priceYearly,
    features,
    isPopular,
    isActive,
    sortOrder,
  } = req.body as Partial<PlanPayload>;

  if (isPopular === true) {
    await clearOtherPopularPlans(id);
  }

  if (name != null) plan.name = name.trim();
  if (description != null) plan.description = description.trim();
  if (priceMonthly != null) plan.priceMonthly = priceMonthly;
  if (priceYearly != null) plan.priceYearly = priceYearly;
  if (features != null) plan.features = normalizeFeatures(features);
  if (isPopular != null) plan.isPopular = isPopular;
  if (isActive != null) plan.isActive = isActive;
  if (sortOrder != null) plan.sortOrder = sortOrder;

  await plan.save();

  res.status(200).json({
    success: true,
    data: plan,
    message: "Membership plan updated successfully",
  });
});

export const deleteMembershipPlan = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const plan = await MembershipPlan.findByIdAndDelete(id);
  if (!plan) throw new CustomError("Membership plan not found", 404);

  res.status(200).json({
    success: true,
    data: { deletedId: id },
    message: "Membership plan deleted successfully",
  });
});
