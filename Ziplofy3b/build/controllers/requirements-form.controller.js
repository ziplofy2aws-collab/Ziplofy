"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequirementsForm = exports.updateRequirementsFormStatus = exports.updateRequirementsForm = exports.createRequirementsForm = void 0;
const requirements_form_model_1 = require("../models/requirements-form.model");
const user_model_1 = require("../models/user.model");
const email_utils_1 = require("../utils/email.utils");
const error_utils_1 = require("../utils/error.utils");
const config_1 = require("../config");
exports.createRequirementsForm = (0, error_utils_1.asyncErrorHandler)(async (req, res, next) => {
    const { clientId, supportDeveloperId, requirements } = req.body;
    const requirementsForm = new requirements_form_model_1.RequirementsForm({
        clientId,
        supportDeveloperId,
        requirements,
        status: "Initiated"
    });
    await requirementsForm.save();
    // Fetch the user with the help of clientId
    const user = await user_model_1.User.findById(clientId).select("email");
    if (!user) {
        return next(new error_utils_1.CustomError("User not found.", 404));
    }
    // Send email asynchronously (non-blocking)
    (0, email_utils_1.sendEmail)({
        to: user.email,
        subject: "Action: Check Requirements form send by support developer",
        body: "A new requirements form has been created.",
        url: `${config_1.config.clientUrl}/requirements-form/${requirementsForm._id}`,
        urlType: email_utils_1.UrlType.VIEW_REQUIREMENTS_FORM,
    });
    res.status(201).json({
        success: true,
        data: requirementsForm,
        message: "Requirements form created successfully.",
    });
});
exports.updateRequirementsForm = (0, error_utils_1.asyncErrorHandler)(async (req, res, next) => {
    const { id } = req.params;
    const { requirements } = req.body;
    console.log(requirements);
    // Validate input
    if (!Array.isArray(requirements) || requirements.length === 0) {
        return next(new error_utils_1.CustomError("At least one requirement is required to update.", 400));
    }
    // Find and update the requirements form
    const updatedForm = await requirements_form_model_1.RequirementsForm.findByIdAndUpdate(id, { requirements }, { new: true });
    if (!updatedForm) {
        return next(new error_utils_1.CustomError("Requirements form not found.", 404));
    }
    res.status(200).json({
        success: true,
        data: updatedForm,
        message: "Requirements form updated successfully.",
    });
});
exports.updateRequirementsFormStatus = (0, error_utils_1.asyncErrorHandler)(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
        return next(new error_utils_1.CustomError("Invalid status. Status must be one of: Initiated, Accepted, Declined.", 400));
    }
    // Find and update the requirements form status
    const updatedForm = await requirements_form_model_1.RequirementsForm.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedForm) {
        return next(new error_utils_1.CustomError("Requirements form not found.", 404));
    }
    res.status(200).json({
        success: true,
        data: updatedForm,
        message: "Requirements form status updated successfully.",
    });
});
exports.getRequirementsForm = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const form = await requirements_form_model_1.RequirementsForm.findById(id);
    if (!form) {
        return res.status(404).json({
            success: false,
            message: "Requirements form not found.",
        });
    }
    res.status(200).json({
        success: true,
        data: form,
        message: "Requirements form fetched successfully.",
    });
});
