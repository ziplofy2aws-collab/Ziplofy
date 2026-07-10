"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMembershipPlan = exports.updateMembershipPlan = exports.createMembershipPlan = exports.getMembershipPlanById = exports.getAllMembershipPlansAdmin = exports.getMembershipPlans = void 0;
const membership_plan_model_1 = require("../models/membership-plan/membership-plan.model");
const error_utils_1 = require("../utils/error.utils");
const normalizeFeatures = (features = []) => features
    .map((feature) => ({
    name: String(feature.name || "").trim(),
    included: Boolean(feature.included),
}))
    .filter((feature) => feature.name.length > 0);
const validatePlanPayload = (payload, isCreate = false) => {
    if (isCreate) {
        if (!payload.name?.trim())
            throw new error_utils_1.CustomError("Plan name is required", 400);
        if (!payload.description?.trim())
            throw new error_utils_1.CustomError("Plan description is required", 400);
        if (payload.priceMonthly == null || payload.priceMonthly < 0) {
            throw new error_utils_1.CustomError("Valid monthly price is required", 400);
        }
        if (payload.priceYearly == null || payload.priceYearly < 0) {
            throw new error_utils_1.CustomError("Valid yearly price is required", 400);
        }
    }
};
const clearOtherPopularPlans = async (excludeId) => {
    const filter = { isPopular: true };
    if (excludeId)
        filter._id = { $ne: excludeId };
    await membership_plan_model_1.MembershipPlan.updateMany(filter, { isPopular: false });
};
exports.getMembershipPlans = (0, error_utils_1.asyncErrorHandler)(async (_req, res) => {
    const plans = await membership_plan_model_1.MembershipPlan.find({ isActive: true })
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    res.status(200).json({
        success: true,
        data: plans,
        count: plans.length,
    });
});
exports.getAllMembershipPlansAdmin = (0, error_utils_1.asyncErrorHandler)(async (_req, res) => {
    const plans = await membership_plan_model_1.MembershipPlan.find()
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    res.status(200).json({
        success: true,
        data: plans,
        count: plans.length,
    });
});
exports.getMembershipPlanById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const plan = await membership_plan_model_1.MembershipPlan.findById(req.params.id).lean();
    if (!plan)
        throw new error_utils_1.CustomError("Membership plan not found", 404);
    res.status(200).json({
        success: true,
        data: plan,
    });
});
exports.createMembershipPlan = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { name, description, priceMonthly, priceYearly, features = [], isPopular = false, isActive = true, sortOrder = 0, } = req.body;
    validatePlanPayload(req.body, true);
    if (isPopular) {
        await clearOtherPopularPlans();
    }
    const plan = await membership_plan_model_1.MembershipPlan.create({
        name: name.trim(),
        description: description.trim(),
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
exports.updateMembershipPlan = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const plan = await membership_plan_model_1.MembershipPlan.findById(id);
    if (!plan)
        throw new error_utils_1.CustomError("Membership plan not found", 404);
    const { name, description, priceMonthly, priceYearly, features, isPopular, isActive, sortOrder, } = req.body;
    if (isPopular === true) {
        await clearOtherPopularPlans(id);
    }
    if (name != null)
        plan.name = name.trim();
    if (description != null)
        plan.description = description.trim();
    if (priceMonthly != null)
        plan.priceMonthly = priceMonthly;
    if (priceYearly != null)
        plan.priceYearly = priceYearly;
    if (features != null)
        plan.features = normalizeFeatures(features);
    if (isPopular != null)
        plan.isPopular = isPopular;
    if (isActive != null)
        plan.isActive = isActive;
    if (sortOrder != null)
        plan.sortOrder = sortOrder;
    await plan.save();
    res.status(200).json({
        success: true,
        data: plan,
        message: "Membership plan updated successfully",
    });
});
exports.deleteMembershipPlan = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const plan = await membership_plan_model_1.MembershipPlan.findByIdAndDelete(id);
    if (!plan)
        throw new error_utils_1.CustomError("Membership plan not found", 404);
    res.status(200).json({
        success: true,
        data: { deletedId: id },
        message: "Membership plan deleted successfully",
    });
});
