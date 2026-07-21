import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { config } from '../config';
import { Customer, ResetPasswordToken, Store, Subdomain } from '../models';
import { ISecureCustomerInfo } from '../types';
import { sendEmail } from '../utils/email.utils';
import { asyncErrorHandler, CustomError } from '../utils/error.utils';

// Interface for reset password token payload
export interface IResetPasswordTokenPayload {
  userId: string;
  email: string;
  type: 'password_reset';
  iat?: number;
  exp?: number;
}

function signCustomerToken(payload: { _id: string; storeId: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export const storefrontSignup = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, firstName, lastName, email, password } = req.body as { storeId: string; firstName: string; lastName: string; email: string; password: string };
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) throw new CustomError('Valid storeId is required', 400);
  if (!firstName || !lastName || !email || !password) throw new CustomError('firstName, lastName, email, password are required', 400);

  const existing = await Customer.findOne({ storeId, email: email.toLowerCase() }).lean();
  if (existing) throw new CustomError('Email already in use', 409);

  const hash = await bcrypt.hash(password, 10);
  const created = await Customer.create({ storeId, firstName, lastName, email: email.toLowerCase(), phoneNumber: '', password: hash });
  const token = signCustomerToken({ _id: created._id.toString(), storeId });

  const secureCustomerInfo: ISecureCustomerInfo = {
    _id: created._id.toString(),
    storeId: created.storeId.toString(),
    firstName: created.firstName,
    lastName: created.lastName,
    language: created.language,
    email: created.email,
    phoneNumber: created.phoneNumber ?? '',
    isVerified: created.isVerified ?? false,
    agreedToMarketingEmails: created.agreedToMarketingEmails ?? false,
    agreedToSmsMarketing: created.agreedToSmsMarketing ?? false,
    collectTax: created.collectTax,
    tagIds: created.tagIds ?? [],
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
    defaultAddress: created.defaultAddress?.toString() ?? '',
  };
  res
    .cookie('accessToken', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 })
    .status(201)
    .json({ success: true, data: secureCustomerInfo, token });
});

export const storefrontLogin = asyncErrorHandler(async (req: Request, res: Response) => {
  const { storeId, email, password } = req.body as { storeId: string; email: string; password: string };
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) throw new CustomError('Valid storeId is required', 400);
  if (!email || !password) throw new CustomError('email and password are required', 400);

  const customer = await Customer.findOne({ storeId, email: email.toLowerCase() }).select('+password');
  if (!customer || !customer.password) throw new CustomError('Invalid credentials', 401);

  const ok = await bcrypt.compare(password, customer.password);
  if (!ok) throw new CustomError('Invalid credentials', 401);

  const token = signCustomerToken({ _id: customer._id.toString(), storeId });

  
  const secureCustomerInfo: ISecureCustomerInfo = {
    _id: customer._id.toString(),
    storeId: customer.storeId.toString(),
    firstName: customer.firstName,
    lastName: customer.lastName,
    language: customer.language,
    email: customer.email,
    phoneNumber: customer.phoneNumber ?? '',
    isVerified: customer.isVerified ?? false,
    agreedToMarketingEmails: customer.agreedToMarketingEmails ?? false,
    agreedToSmsMarketing: customer.agreedToSmsMarketing ?? false,
    collectTax: customer.collectTax,
    tagIds: customer.tagIds ?? [],
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    defaultAddress: customer.defaultAddress?.toString() ?? '',
  };
  res
    .cookie('customer_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 })
    .json({ success: true, data: secureCustomerInfo, token });
});

export const storefrontMe = asyncErrorHandler(async (req: Request, res: Response) => {
  // Return the same shape as signup/login without virtuals
  const me = req.storefrontUser;
  if (!me) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const secureCustomerInfo: ISecureCustomerInfo = {
    _id: me._id.toString(),
    storeId: me.storeId.toString(),
    firstName: me.firstName,
    lastName: me.lastName,
    language: me.language,
    email: me.email,
    phoneNumber: me.phoneNumber ?? '',
    isVerified: me.isVerified ?? false,
    agreedToMarketingEmails: me.agreedToMarketingEmails ?? false,
    agreedToSmsMarketing: me.agreedToSmsMarketing ?? false,
    collectTax: me.collectTax,
    tagIds: me.tagIds ?? [],
    createdAt: me.createdAt,
    updatedAt: me.updatedAt,
    defaultAddress: me.defaultAddress?.toString() ?? '',
  };
  res.json({ success: true, data: secureCustomerInfo });
});


// Forgot Password - Send reset email
export const forgotPassword = asyncErrorHandler(async (req: Request, res: Response) => {
  const { email, storeId } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: 'Store ID is required'
    });
  }

  // Validate storeId format
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid store ID format'
    });
  }

  // Check if store exists
  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(400).json({
      success: false,
      message: 'Store not found'
    });
  }

  // Check if customer exists for this store
  const customer = await Customer.findOne({ 
    email: email.toLowerCase(),
    storeId: storeId
  });

  console.log('customer data is', customer);
  
  if (!customer) {
    // Return success even if email doesn't exist (security best practice)
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  }

  // Generate JWT token
  const tokenPayload: IResetPasswordTokenPayload = {
    userId: customer._id.toString(),
    email: customer.email,
    type: 'password_reset'
  };

  const resetToken = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );

  // Create reset password token record
  const resetPasswordToken = new ResetPasswordToken({
    token: resetToken,
    userId: customer._id,
    storeId: customer.storeId,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
  });

  await resetPasswordToken.save();

  const storeSubdomain = await Subdomain.findOne({ storeId: store._id });
  if (!storeSubdomain) {
    return res.status(400).json({
      success: false,
      message: 'Store subdomain not found'
    });
  }

  // Generate URL based on environment
  const baseUrl = config.clientUrl.replace(/^https?:\/\//, ''); // Remove protocol
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const resetUrl = `${protocol}://${storeSubdomain.subdomain}.${baseUrl}/auth/reset-password?reset-token=${resetToken}`;
  
  await sendEmail({
    to: customer.email,
    subject: 'Password Reset',
    body: `Click the link below to reset your password: ${resetUrl}`,
    url: resetUrl
  });

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent'
  });
});

// Reset Password - Handle password reset
export const resetPassword = asyncErrorHandler(async (req: Request, res: Response) => {
  const { token, newPassword, storeId } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Token and new password are required'
    });
  }

  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: 'Store ID is required'
    });
  }

  // Validate storeId format
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid store ID format'
    });
  }

  // Check if store exists
  const store = await Store.findById(storeId);
  if (!store) {
    return res.status(400).json({
      success: false,
      message: 'Store not found'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  // Verify the JWT token first
  let tokenPayload: IResetPasswordTokenPayload;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as IResetPasswordTokenPayload;
    
    // Validate token type
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token type'
      });
    }
    
    tokenPayload = decoded;
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Find the reset token in database with storeId validation
  const resetTokenRecord = await ResetPasswordToken.findOne({
    token,
    storeId: storeId,
    expiresAt: { $gt: new Date() }
  });

  if (!resetTokenRecord) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Find the customer using the token payload
  const customer = await Customer.findOne({
    _id: tokenPayload.userId,
    storeId: storeId
  });
  
  if (!customer) {
    return res.status(400).json({
      success: false,
      message: 'Customer not found'
    });
  }

  // Verify the email matches
  if (customer.email !== tokenPayload.email) {
    return res.status(400).json({
      success: false,
      message: 'Token email mismatch'
    });
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update customer password
  customer.password = hashedPassword;
  await customer.save();

  // Delete the used token
  await ResetPasswordToken.findByIdAndDelete(resetTokenRecord._id);

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully'
  });
});
