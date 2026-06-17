"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompany = exports.updateCompany = exports.getCompanyById = exports.getCompaniesByStoreId = exports.createCompany = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const company_model_1 = require("../models/company/company.model");
const customer_model_1 = require("../models/customer/customer.model");
const error_utils_1 = require("../utils/error.utils");
function normalizePaymentTerms(value) {
    if (typeof value === "string" && company_model_1.COMPANY_PAYMENT_TERMS.includes(value)) {
        return value;
    }
    return "none";
}
function normalizeTaxSettings(value) {
    if (typeof value === "string" && company_model_1.COMPANY_TAX_SETTINGS.includes(value)) {
        return value;
    }
    return "collect";
}
function normalizeOrderSubmission(value) {
    if (typeof value === "string" &&
        company_model_1.COMPANY_ORDER_SUBMISSION.includes(value)) {
        return value;
    }
    return "auto";
}
function normalizeAddress(input) {
    if (!input)
        return undefined;
    const country = input.country?.trim();
    const firstName = input.firstName?.trim();
    const lastName = input.lastName?.trim();
    const address = input.address?.trim();
    const city = input.city?.trim();
    if (!country || !firstName || !lastName || !address || !city) {
        return undefined;
    }
    return {
        country,
        firstName,
        lastName,
        companyAttention: input.companyAttention?.trim() || undefined,
        address,
        apartment: input.apartment?.trim() || undefined,
        city,
        state: input.state?.trim() || undefined,
        pinCode: input.pinCode?.trim() || undefined,
        phone: input.phone?.trim() || undefined,
    };
}
function normalizeLocation(input) {
    if (!input)
        return undefined;
    const billingSameAsShipping = input.billingSameAsShipping !== false;
    const shippingAddress = normalizeAddress(input.shippingAddress);
    const billingAddress = billingSameAsShipping
        ? undefined
        : normalizeAddress(input.billingAddress);
    return {
        externalId: input.externalId?.trim() || undefined,
        shippingAddress,
        billingSameAsShipping,
        billingAddress,
        paymentTerms: normalizePaymentTerms(input.paymentTerms),
        allowOneTimeShipAddress: Boolean(input.allowOneTimeShipAddress),
        orderSubmission: normalizeOrderSubmission(input.orderSubmission),
        taxId: input.taxId?.trim() || undefined,
        taxSettings: normalizeTaxSettings(input.taxSettings),
    };
}
function mergeLocation(existing, patch) {
    if (!existing) {
        return {
            billingSameAsShipping: patch.billingSameAsShipping ?? true,
            paymentTerms: patch.paymentTerms ?? "none",
            allowOneTimeShipAddress: patch.allowOneTimeShipAddress ?? false,
            orderSubmission: patch.orderSubmission ?? "auto",
            taxSettings: patch.taxSettings ?? "collect",
            ...patch,
        };
    }
    const merged = { ...existing, ...patch };
    if (patch.billingSameAsShipping === true) {
        merged.billingAddress = undefined;
    }
    return merged;
}
function normalizeLocationPatch(input) {
    const patch = {};
    if (input.externalId !== undefined) {
        patch.externalId = input.externalId?.trim() || undefined;
    }
    if (input.shippingAddress !== undefined) {
        patch.shippingAddress = normalizeAddress(input.shippingAddress);
    }
    if (input.billingSameAsShipping !== undefined) {
        patch.billingSameAsShipping = input.billingSameAsShipping !== false;
        if (patch.billingSameAsShipping) {
            patch.billingAddress = undefined;
        }
    }
    if (input.billingAddress !== undefined && input.billingSameAsShipping === false) {
        patch.billingAddress = normalizeAddress(input.billingAddress);
    }
    if (input.paymentTerms !== undefined) {
        patch.paymentTerms = normalizePaymentTerms(input.paymentTerms);
    }
    if (input.allowOneTimeShipAddress !== undefined) {
        patch.allowOneTimeShipAddress = Boolean(input.allowOneTimeShipAddress);
    }
    if (input.orderSubmission !== undefined) {
        patch.orderSubmission = normalizeOrderSubmission(input.orderSubmission);
    }
    if (input.taxId !== undefined) {
        patch.taxId = input.taxId?.trim() || undefined;
    }
    if (input.taxSettings !== undefined) {
        patch.taxSettings = normalizeTaxSettings(input.taxSettings);
    }
    return patch;
}
function normalizeNotes(value) {
    if (value === undefined || value === null)
        return undefined;
    if (typeof value !== "string") {
        throw new error_utils_1.CustomError("notes must be a string", 400);
    }
    const trimmed = value.trim();
    return trimmed || undefined;
}
async function resolveMainContact(storeId, input) {
    if (!input)
        return undefined;
    if (input.customerId) {
        if (!mongoose_1.default.isValidObjectId(input.customerId)) {
            throw new error_utils_1.CustomError("Valid main contact customerId is required", 400);
        }
        const customer = await customer_model_1.Customer.findOne({ _id: input.customerId, storeId }).lean();
        if (!customer) {
            throw new error_utils_1.CustomError("Main contact customer not found for this store", 404);
        }
        return {
            customerId: customer._id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
        };
    }
    const newContact = input.newContact;
    const email = (newContact?.email || input.email)?.trim().toLowerCase();
    const firstName = (newContact?.firstName || input.firstName)?.trim();
    const lastName = (newContact?.lastName || input.lastName)?.trim();
    const phoneNumber = (newContact?.phoneNumber || input.phoneNumber)?.trim();
    if (email) {
        if (!firstName || !lastName) {
            throw new error_utils_1.CustomError("Main contact first name and last name are required", 400);
        }
        if (!phoneNumber) {
            throw new error_utils_1.CustomError("Main contact phone number is required", 400);
        }
        const existingCustomer = await customer_model_1.Customer.findOne({ storeId, email }).select("_id").lean();
        if (existingCustomer) {
            throw new error_utils_1.CustomError("A customer with this email already exists for this store", 409);
        }
        const customer = await customer_model_1.Customer.create({
            storeId,
            firstName,
            lastName,
            email,
            phoneNumber,
            language: "en",
            agreedToMarketingEmails: Boolean(newContact?.agreedToMarketingEmails),
            agreedToSmsMarketing: Boolean(newContact?.agreedToSmsMarketing),
            collectTax: "collect",
            tagIds: [],
        });
        return {
            customerId: customer._id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
        };
    }
    if (firstName || lastName || phoneNumber) {
        return {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            email: email || undefined,
            phoneNumber: phoneNumber || undefined,
        };
    }
    return undefined;
}
function assertStoreOwnership(companyStoreId, storeId) {
    if (!storeId)
        return;
    if (!mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    if (String(companyStoreId) !== String(storeId)) {
        throw new error_utils_1.CustomError("Company does not belong to this store", 403);
    }
}
exports.createCompany = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId, name, externalId, mainContact, location, locations, notes } = req.body;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    if (!name?.trim()) {
        throw new error_utils_1.CustomError("Company name is required", 400);
    }
    const trimmedExternalId = externalId?.trim();
    if (trimmedExternalId) {
        const duplicate = await company_model_1.Company.findOne({ storeId, externalId: trimmedExternalId })
            .select("_id")
            .lean();
        if (duplicate) {
            throw new error_utils_1.CustomError("A company with this company ID already exists for this store", 409);
        }
    }
    const storeObjectId = new mongoose_1.default.Types.ObjectId(storeId);
    const resolvedMainContact = await resolveMainContact(storeObjectId, mainContact);
    const locationInput = location ?? locations?.[0];
    const normalizedLocation = normalizeLocation(locationInput);
    const company = await company_model_1.Company.create({
        storeId,
        name: name.trim(),
        externalId: trimmedExternalId || undefined,
        mainContact: resolvedMainContact,
        location: normalizedLocation,
        notes: notes !== undefined ? normalizeNotes(notes) : undefined,
    });
    res.status(201).json({
        success: true,
        data: company,
        message: "Company created successfully",
    });
});
exports.getCompaniesByStoreId = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    if (!storeId || !mongoose_1.default.isValidObjectId(storeId)) {
        throw new error_utils_1.CustomError("Valid storeId is required", 400);
    }
    const companies = await company_model_1.Company.find({ storeId })
        .sort({ updatedAt: -1 })
        .populate({
        path: "mainContact.customerId",
        select: "firstName lastName email phoneNumber",
    })
        .lean();
    res.status(200).json({
        success: true,
        data: companies,
        count: companies.length,
    });
});
exports.getCompanyById = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId } = req.query;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid company id is required", 400);
    }
    const company = await company_model_1.Company.findById(id)
        .populate({
        path: "mainContact.customerId",
        select: "firstName lastName email phoneNumber",
    })
        .lean();
    if (!company) {
        throw new error_utils_1.CustomError("Company not found", 404);
    }
    assertStoreOwnership(company.storeId, storeId);
    res.status(200).json({
        success: true,
        data: company,
    });
});
exports.updateCompany = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId, name, externalId, mainContact, location, locations, notes } = req.body;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid company id is required", 400);
    }
    const existing = await company_model_1.Company.findById(id);
    if (!existing) {
        throw new error_utils_1.CustomError("Company not found", 404);
    }
    assertStoreOwnership(existing.storeId, storeId);
    const updateData = {};
    if (name !== undefined) {
        if (!name?.trim())
            throw new error_utils_1.CustomError("Company name cannot be empty", 400);
        updateData.name = name.trim();
    }
    if (externalId !== undefined) {
        const trimmedExternalId = externalId?.trim();
        if (trimmedExternalId) {
            const duplicate = await company_model_1.Company.findOne({
                storeId: existing.storeId,
                externalId: trimmedExternalId,
                _id: { $ne: existing._id },
            })
                .select("_id")
                .lean();
            if (duplicate) {
                throw new error_utils_1.CustomError("A company with this company ID already exists for this store", 409);
            }
            updateData.externalId = trimmedExternalId;
        }
        else {
            updateData.externalId = undefined;
        }
    }
    if (mainContact !== undefined) {
        updateData.mainContact = await resolveMainContact(existing.storeId, mainContact);
    }
    if (notes !== undefined) {
        updateData.notes = normalizeNotes(notes);
    }
    if (location !== undefined || locations !== undefined) {
        const locationInput = location ?? locations?.[0];
        if (locationInput) {
            const locationPatch = normalizeLocationPatch(locationInput);
            if (Object.keys(locationPatch).length > 0) {
                updateData.location = mergeLocation(existing.location ? JSON.parse(JSON.stringify(existing.location)) : undefined, locationPatch);
            }
        }
        else {
            updateData.location = undefined;
        }
    }
    const company = await company_model_1.Company.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    })
        .populate({
        path: "mainContact.customerId",
        select: "firstName lastName email phoneNumber",
    })
        .lean();
    res.status(200).json({
        success: true,
        data: company,
        message: "Company updated successfully",
    });
});
exports.deleteCompany = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { id } = req.params;
    const { storeId } = req.query;
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new error_utils_1.CustomError("Valid company id is required", 400);
    }
    const company = await company_model_1.Company.findById(id);
    if (!company) {
        throw new error_utils_1.CustomError("Company not found", 404);
    }
    assertStoreOwnership(company.storeId, storeId);
    await company.deleteOne();
    res.status(200).json({
        success: true,
        data: { deletedId: id },
        message: "Company deleted successfully",
    });
});
