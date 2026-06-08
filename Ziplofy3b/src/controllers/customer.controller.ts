import { Request, Response } from "express";
import mongoose from "mongoose";
import { CustomerAddress } from "../models/customer/customer-address.model";
import { Customer, ICustomer } from "../models/customer/customer.model";
import { asyncErrorHandler, CustomError } from "../utils/error.utils";

export const addCustomer = asyncErrorHandler(async (req: Request, res: Response) => {
  const {
    storeId,
    firstName,
    lastName,
    language,
    email,
    phoneNumber,
    agreedToMarketingEmails,
    agreedToSmsMarketing,
    collectTax,
    notes,
    tagIds
  } = req.body as Pick<ICustomer, "storeId" | "firstName" | "lastName" | "language" | "email" | "phoneNumber" | "agreedToMarketingEmails" | "agreedToSmsMarketing" | "collectTax" | "notes" | "tagIds">;

  // Validate required fields
  if (!storeId || !firstName || !lastName || !email || !phoneNumber) {
    throw new CustomError("Missing required fields: storeId, firstName, lastName, email, phoneNumber are required", 400);
  }


  // Validate tagIds if provided
  if (tagIds && tagIds.length > 0) {
    for (const tagId of tagIds) {
      if (!mongoose.Types.ObjectId.isValid(tagId)) {
        throw new CustomError(`Invalid tag ID format: ${tagId}`, 400);
      }
    }
  }

  // Create new customer first (without address)
  const customer = new Customer({
    storeId,
    firstName,
    lastName,
    language: language || "en",
    email,
    phoneNumber,
    agreedToMarketingEmails: agreedToMarketingEmails || false,
    agreedToSmsMarketing: agreedToSmsMarketing || false,
    collectTax: collectTax || 'collect',
    notes,
    tagIds: tagIds || []
  });

  const savedCustomer = await customer.save();

  // Populate tags if tagIds are provided
  let populatedCustomer = savedCustomer;
  if (tagIds && tagIds.length > 0) {
    const populated = await Customer.findById(savedCustomer._id)
      .populate('tagIds');
    if (populated) {
      populatedCustomer = populated;
    }
  }

  res.status(201).json({
    success: true,
    message: "Customer created successfully",
    data: populatedCustomer
  });
});

export const getCustomersByStoreId = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;

  // Validate storeId format
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new CustomError("Invalid store ID format", 400);
  }

  // Get customers with populated tags for the specific store
  const customers = await Customer.find({ storeId })
    .populate('tagIds')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Customers retrieved successfully",
    data: customers
  });
});

export const deleteCustomer = asyncErrorHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid customer ID format", 400);
  }

  // Find and delete the customer
  const customer = await Customer.findByIdAndDelete(id);

  if (!customer) {
    throw new CustomError("Customer not found", 404);
  }

  // Also delete all addresses for this customer
  await CustomerAddress.deleteMany({ customerId: id });

  res.status(200).json({
    success: true,
    message: "Customer deleted successfully",
    data: {
      deletedCustomer: {
        id: customer._id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email
      }
    }
  });
});

// Search customers with fuzzy search on first name and last name
export const searchCustomers = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { q, page = 1, limit = 10 } = req.query;
  
  if (!storeId) throw new CustomError("storeId is required", 400);
  if (!q || typeof q !== 'string') throw new CustomError("Search query 'q' is required", 400);

  const skip = (Number(page) - 1) * Number(limit);

  // Fuzzy search on both first name and last name
  const searchCriteria = {
    storeId: new mongoose.Types.ObjectId(storeId),
    $or: [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ]
  };

  // Get customers with pagination
  const customers = await Customer.find(searchCriteria)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // Get total count for pagination
  const totalCustomers = await Customer.countDocuments(searchCriteria);

  res.status(200).json({
    success: true,
    data: customers,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalCustomers / Number(limit)),
      totalItems: totalCustomers,
      itemsPerPage: Number(limit)
    }
  });
});