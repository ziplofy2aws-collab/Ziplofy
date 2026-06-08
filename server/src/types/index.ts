import { SecureUserInfo } from "../controllers/auth.controller";

declare global {
    namespace Express {
      interface Request {
        user?: SecureUserInfo; 
      }
    }
}