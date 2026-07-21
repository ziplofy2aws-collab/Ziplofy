import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  Company,
  COMPANY_ORDER_SUBMISSION,
  COMPANY_PAYMENT_TERMS,
  COMPANY_TAX_SETTINGS,
  type CompanyOrderSubmission,
  type CompanyPaymentTerms,
  type CompanyTaxSettings,
  type ICompanyAddress,
  type ICompanyLocation,
  type ICompanyMainContact,
} from "../models/company/company.model";
import { Customer } from "../models/customer/customer.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

type AddressInput = Partial<ICompanyAddress> | null | undefined;

type MainContactInput = {
  customerId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  newContact?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    agreedToMarketingEmails?: boolean;
    agreedToSmsMarketing?: boolean;
  };
};

type LocationInput = {
  externalId?: string;
  shippingAddress?: AddressInput;
  billingSameAsShipping?: boolean;
  billingAddress?: AddressInput;
  paymentTerms?: string;
  allowOneTimeShipAddress?: boolean;
  orderSubmission?: string;
  taxId?: string;
  taxSettings?: string;
};

function normalizePaymentTerms(value: unknown): CompanyPaymentTerms {
  if (typeof value === "string" && COMPANY_PAYMENT_TERMS.includes(value as CompanyPaymentTerms)) {
    return value as CompanyPaymentTerms;
  }
  return "none";
}

function normalizeTaxSettings(value: unknown): CompanyTaxSettings {
  if (typeof value === "string" && COMPANY_TAX_SETTINGS.includes(value as CompanyTaxSettings)) {
    return value as CompanyTaxSettings;
  }
  return "collect";
}

function normalizeOrderSubmission(value: unknown): CompanyOrderSubmission {
  if (
    typeof value === "string" &&
    COMPANY_ORDER_SUBMISSION.includes(value as CompanyOrderSubmission)
  ) {
    return value as CompanyOrderSubmission;
  }
  return "auto";
}

function normalizeAddress(input: AddressInput): ICompanyAddress | undefined {
  if (!input) return undefined;

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

function normalizeLocation(input: LocationInput | undefined): ICompanyLocation | undefined {
  if (!input) return undefined;

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

function mergeLocation(
  existing: ICompanyLocation | undefined,
  patch: Partial<ICompanyLocation>
): ICompanyLocation {
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

  const merged: ICompanyLocation = { ...existing, ...patch };

  if (patch.billingSameAsShipping === true) {
    merged.billingAddress = undefined;
  }

  return merged;
}

function normalizeLocationPatch(input: LocationInput): Partial<ICompanyLocation> {
  const patch: Partial<ICompanyLocation> = {};

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

function normalizeNotes(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new CustomError("notes must be a string", 400);
  }
  const trimmed = value.trim();
  return trimmed || undefined;
}

async function resolveMainContact(
  storeId: mongoose.Types.ObjectId,
  input: MainContactInput | undefined
): Promise<ICompanyMainContact | undefined> {
  if (!input) return undefined;

  if (input.customerId) {
    if (!mongoose.isValidObjectId(input.customerId)) {
      throw new CustomError("Valid main contact customerId is required", 400);
    }

    const customer = await Customer.findOne({ _id: input.customerId, storeId }).lean();
    if (!customer) {
      throw new CustomError("Main contact customer not found for this store", 404);
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
      throw new CustomError("Main contact first name and last name are required", 400);
    }
    if (!phoneNumber) {
      throw new CustomError("Main contact phone number is required", 400);
    }

    const existingCustomer = await Customer.findOne({ storeId, email }).select("_id").lean();
    if (existingCustomer) {
      throw new CustomError("A customer with this email already exists for this store", 409);
    }

    const customer = await Customer.create({
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

function assertStoreOwnership(
  companyStoreId: mongoose.Types.ObjectId | string,
  storeId?: string
) {
  if (!storeId) return;
  if (!mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }
  if (String(companyStoreId) !== String(storeId)) {
    throw new CustomError("Company does not belong to this store", 403);
  }
}

export const createCompany = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, name, externalId, mainContact, location, locations, notes } = req.body as {
    storeId?: string;
    name?: string;
    externalId?: string;
    mainContact?: MainContactInput;
    location?: LocationInput;
    /** @deprecated use `location` — accepted for backward compatibility */
    locations?: LocationInput[];
    notes?: string;
  };

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }
  if (!name?.trim()) {
    throw new CustomError("Company name is required", 400);
  }

  const trimmedExternalId = externalId?.trim();
  if (trimmedExternalId) {
    const duplicate = await Company.findOne({ storeId, externalId: trimmedExternalId })
      .select("_id")
      .lean();
    if (duplicate) {
      throw new CustomError("A company with this company ID already exists for this store", 409);
    }
  }

  const storeObjectId = new mongoose.Types.ObjectId(storeId);
  const resolvedMainContact = await resolveMainContact(storeObjectId, mainContact);

  const locationInput = location ?? locations?.[0];
  const normalizedLocation = normalizeLocation(locationInput);

  const company = await Company.create({
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

export const getCompaniesByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  if (!storeId || !mongoose.isValidObjectId(storeId)) {
    throw new CustomError("Valid storeId is required", 400);
  }

  const companies = await Company.find({ storeId })
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

export const getCompanyById = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId } = req.query as { storeId?: string };

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid company id is required", 400);
  }

  const company = await Company.findById(id)
    .populate({
      path: "mainContact.customerId",
      select: "firstName lastName email phoneNumber",
    })
    .lean();

  if (!company) {
    throw new CustomError("Company not found", 404);
  }

  assertStoreOwnership(company.storeId, storeId);

  res.status(200).json({
    success: true,
    data: company,
  });
});

export const updateCompany = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId, name, externalId, mainContact, location, locations, notes } = req.body as {
    storeId?: string;
    name?: string;
    externalId?: string;
    mainContact?: MainContactInput;
    location?: LocationInput;
    locations?: LocationInput[];
    notes?: string;
  };

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid company id is required", 400);
  }

  const existing = await Company.findById(id);
  if (!existing) {
    throw new CustomError("Company not found", 404);
  }

  assertStoreOwnership(existing.storeId, storeId);

  const updateData: Record<string, unknown> = {};

  if (name !== undefined) {
    if (!name?.trim()) throw new CustomError("Company name cannot be empty", 400);
    updateData.name = name.trim();
  }

  if (externalId !== undefined) {
    const trimmedExternalId = externalId?.trim();
    if (trimmedExternalId) {
      const duplicate = await Company.findOne({
        storeId: existing.storeId,
        externalId: trimmedExternalId,
        _id: { $ne: existing._id },
      })
        .select("_id")
        .lean();
      if (duplicate) {
        throw new CustomError("A company with this company ID already exists for this store", 409);
      }
      updateData.externalId = trimmedExternalId;
    } else {
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
        updateData.location = mergeLocation(
          existing.location ? JSON.parse(JSON.stringify(existing.location)) : undefined,
          locationPatch
        );
      }
    } else {
      updateData.location = undefined;
    }
  }

  const company = await Company.findByIdAndUpdate(id, updateData, {
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

export const deleteCompany = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { storeId } = req.query as { storeId?: string };

  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError("Valid company id is required", 400);
  }

  const company = await Company.findById(id);
  if (!company) {
    throw new CustomError("Company not found", 404);
  }

  assertStoreOwnership(company.storeId, storeId);

  await company.deleteOne();

  res.status(200).json({
    success: true,
    data: { deletedId: id },
    message: "Company deleted successfully",
  });
});
