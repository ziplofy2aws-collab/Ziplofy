import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Customer } from '../../models/customer/customer.model';
import { asyncErrorHandler, CustomError } from '../../utils/error.utils';
import { ISecureCustomerInfo } from '../../types';

export const updateCustomer = asyncErrorHandler(async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const updateData = req.body;

  // Validate customerId
  if (!customerId || !mongoose.isValidObjectId(customerId)) {
    throw new CustomError('Valid customerId is required', 400);
  }

  // Check if customer exists
  const existingCustomer = await Customer.findById(customerId);
  if (!existingCustomer) {
    throw new CustomError('Customer not found', 404);
  }

  // Validate allowed fields for update
  const allowedFields = [
    'firstName',
    'lastName', 
    'language',
    'phoneNumber',
    'password',
    'isVerified',
    'agreedToMarketingEmails',
    'agreedToSmsMarketing',
    'collectTax',
    'notes',
    'tagIds',
    'defaultAddress'
  ];

  // Filter out any fields that are not allowed
  const filteredUpdateData: any = {};
  for (const [key, value] of Object.entries(updateData)) {
    if (allowedFields.includes(key)) {
      filteredUpdateData[key] = value;
    }
  }

  // If no valid fields to update
  if (Object.keys(filteredUpdateData).length === 0) {
    throw new CustomError('No valid fields provided for update', 400);
  }

  // Handle email uniqueness if email is being updated
  if (filteredUpdateData.email && filteredUpdateData.email !== existingCustomer.email) {
    const emailExists = await Customer.findOne({
      email: filteredUpdateData.email,
      _id: { $ne: customerId }
    });
    
    if (emailExists) {
      throw new CustomError('Email already exists', 400);
    }
  }

  // Handle defaultAddress validation if provided
  if (filteredUpdateData.defaultAddress) {
    if (!mongoose.isValidObjectId(filteredUpdateData.defaultAddress)) {
      throw new CustomError('Invalid defaultAddress ID', 400);
    }
  }

  // Handle tagIds validation if provided
  if (filteredUpdateData.tagIds) {
    if (!Array.isArray(filteredUpdateData.tagIds)) {
      throw new CustomError('tagIds must be an array', 400);
    }
    
    // Validate each tagId
    for (const tagId of filteredUpdateData.tagIds) {
      if (!mongoose.isValidObjectId(tagId)) {
        throw new CustomError('Invalid tagId in tagIds array', 400);
      }
    }
  }

  // Update customer
  const updatedCustomer = await Customer.findByIdAndUpdate(
    customerId,
    filteredUpdateData,
    { 
      new: true, 
      runValidators: true,
      select: '-password' // Exclude password from response
    }
  );
  if (!updatedCustomer) {
    throw new CustomError('Customer not found', 404);
  }

  const secureCustomerInfo: ISecureCustomerInfo = {
    _id: updatedCustomer._id.toString(),
    storeId: updatedCustomer.storeId.toString(),
    firstName: updatedCustomer.firstName,
    lastName: updatedCustomer.lastName,
    language: updatedCustomer.language,
    email: updatedCustomer.email,
    phoneNumber: updatedCustomer.phoneNumber ?? '',
    isVerified: updatedCustomer.isVerified ?? false,
    agreedToMarketingEmails: updatedCustomer.agreedToMarketingEmails ?? false,
    agreedToSmsMarketing: updatedCustomer.agreedToSmsMarketing ?? false,
    collectTax: updatedCustomer.collectTax,
    tagIds: updatedCustomer.tagIds ?? [],
    createdAt: updatedCustomer.createdAt,
    updatedAt: updatedCustomer.updatedAt,
    defaultAddress: updatedCustomer.defaultAddress?.toString() ?? '',
  };
  res.status(200).json({ success: true, data: secureCustomerInfo, message: 'Customer updated successfully' });
});
