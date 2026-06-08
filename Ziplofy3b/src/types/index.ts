import { SecureUserInfo } from "../middlewares/auth.middleware";
import { ICustomer } from "../models";
export interface ISuperAdminJwtDecode {
  id: string;
  iat: number;
  exp: number;
}

export enum RoleType {
  SUPER_ADMIN = "super-admin",
  ADMIN = "admin",
  SUPPORT_DEVELOPER = "support-developer",
  CLIENT = "client"
}

// Extend Socket.IO Socket to include user
declare module "socket.io" {
  interface Socket {
    user?: SecureUserInfo & {superAdmin?:boolean}
  }
}
// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: SecureUserInfo;
      storefrontUser?: Omit<ICustomer, "password"> & { defaultAddress?: string }
    }
  }
}

// Customer payload returned to storefront clients (no sensitive fields)
export interface ISecureCustomerInfo {
  _id: string;
  storeId: string;
  firstName: string;
  lastName: string;
  language: string;
  email: string;
  phoneNumber?: string;
  isVerified: boolean;
  agreedToMarketingEmails: boolean;
  agreedToSmsMarketing: boolean;
  collectTax: 'collect' | 'dont_collect' | 'collect_unless_exempt';
  tagIds: any[];
  createdAt: Date | string;
  updatedAt: Date | string;
  defaultAddress?: string;
}