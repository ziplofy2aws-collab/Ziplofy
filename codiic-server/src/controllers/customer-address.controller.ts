import { Request, Response } from "express";
import mongoose from "mongoose";
import { CustomerAddress, ICustomerAddress } from "../models/customer/customer-address.model";
import { Customer } from "../models/customer/customer.model";
import { Country } from "../models/country/country.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

function resolveCountryId(countryId?: string | mongoose.Types.ObjectId, countryIso2?: string): Promise<mongoose.Types.ObjectId | null> {
  const idStr = typeof countryId === "string" ? countryId : countryId?.toString?.();
  if (idStr && mongoose.Types.ObjectId.isValid(idStr)) {
    return Promise.resolve(new mongoose.Types.ObjectId(idStr));
  }
  if (countryIso2 && typeof countryIso2 === "string" && countryIso2.length === 2) {
    return Country.findOne({ iso2: countryIso2.toUpperCase() }).then((c) => (c ? c._id : null));
  }
  return Promise.resolve(null);
}

// Create a new customer address
export const createCustomerAddress = asyncErrorHandler(async (req: Request, res: Response) => {
  const { customerId, countryId, country, firstName, lastName, company, address, apartment, city, state, pinCode, phoneNumber, addressType }
    = req.body as Omit<ICustomerAddress, "_id"> & { country?: string };

  if (!customerId) {
    throw new CustomError("Customer ID is required", 400);
  }
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new CustomError("Invalid customer ID format", 400);
  }
  if (!firstName || !lastName || !address || !city || !state || !pinCode || !phoneNumber) {
    throw new CustomError("Missing required address fields", 400);
  }

  const resolvedCountryId = await resolveCountryId(countryId, country);
  if (!resolvedCountryId) {
    throw new CustomError("Valid country ID or country ISO2 code (e.g. US, IN) is required", 400);
  }

  // Check if this is the first address for this customer
  const existingAddresses = await CustomerAddress.countDocuments({ customerId });
  const isFirstAddress = existingAddresses === 0;

  const newAddress = await CustomerAddress.create({
    customerId,
    countryId: resolvedCountryId,
    firstName,
    lastName,
    company,
    address,
    apartment,
    city,
    state,
    pinCode,
    phoneNumber,
    addressType,
  });

  // If this is the first address, set it as the default address
  if (isFirstAddress) {
    await Customer.findByIdAndUpdate(customerId, {
      defaultAddress: newAddress._id
    });
  }

  const populated = await CustomerAddress.findById(newAddress._id).populate("countryId", "name iso2").lean();
  res.status(201).json({
    success: true,
    message: "Customer address created successfully",
    data: populated || newAddress,
  });
});

// Update a customer address
export const updateCustomerAddress = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body as Partial<ICustomerAddress> & { country?: string };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid address ID format", 400);
  }

  const { country, ...rest } = payload;
  const updatePayload = { ...rest } as Partial<ICustomerAddress>;
  if (payload.countryId !== undefined || country !== undefined) {
    const resolved = await resolveCountryId(payload.countryId, country);
    if (!resolved) {
      throw new CustomError("Valid country ID or country ISO2 code (e.g. US, IN) is required", 400);
    }
    updatePayload.countryId = resolved;
  }

  const updated = await CustomerAddress.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
  if (!updated) {
    throw new CustomError("Customer address not found", 404);
  }

  const populated = await CustomerAddress.findById(updated._id).populate("countryId", "name iso2").lean();
  res.status(200).json({
    success: true,
    message: "Customer address updated successfully",
    data: populated || updated,
  });
});

// Delete a customer address
export const deleteCustomerAddress = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid address ID format", 400);
  }

  const deleted = await CustomerAddress.findByIdAndDelete(id);
  if (!deleted) {
    throw new CustomError("Customer address not found", 404);
  }

  // Check if the deleted address was the default address
  const customer = await Customer.findById(deleted.customerId);
  if (customer && customer.defaultAddress && customer.defaultAddress.toString() === id) {
    // Find another address for this customer to set as default
    const remainingAddresses = await CustomerAddress.find({ customerId: deleted.customerId });
    
    if (remainingAddresses.length > 0) {
      // Set the first remaining address as the new default
      await Customer.findByIdAndUpdate(deleted.customerId, {
        defaultAddress: remainingAddresses[0]._id
      });
    } else {
      // No remaining addresses, set defaultAddress to null
      await Customer.findByIdAndUpdate(deleted.customerId, {
        defaultAddress: null
      });
    }
  }

  res.status(200).json({
    success: true,
    message: "Customer address deleted successfully",
    data: {
      deletedAddress: {
        id: deleted._id,
        customerId: deleted.customerId,
        address: deleted.address,
      },
    },
  });
});

// Get all addresses for a customer
export const getCustomerAddressesByCustomerId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { customerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new CustomError("Invalid customer ID format", 400);
  }

  const addresses = await CustomerAddress.find({ customerId })
    .populate("countryId", "name iso2")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    message: "Customer addresses retrieved successfully",
    data: addresses,
    count: addresses.length,
  });
});


