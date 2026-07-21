import { Router } from "express";
import {
  adminLogin,
  adminLoginStep1,
  adminLogout,
  changePassword,
  getMe,
  resendAdminLoginOtp,
  requestEditVerificationOtp,
  verifyAdminInvite,
  verifyAdminLoginOtp,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";
import { googleAuth, login, register } from "../controllers/codiic-auth.controller";

export const authRouter = Router();

// Client (store-owner) auth — merged in from the former standalone `server` service.
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/google", googleAuth);

authRouter.get("/me", protect, getMe);
authRouter.post("/logout", protect, adminLogout);
authRouter.post("/admin/login", adminLogin);
authRouter.post("/admin/login-step1", adminLoginStep1);
authRouter.post("/admin/verify-otp", verifyAdminLoginOtp);
authRouter.post("/admin/resend-otp", resendAdminLoginOtp);
authRouter.get("/verify-admin-invite", verifyAdminInvite);
authRouter.post("/request-edit-otp", protect, requestEditVerificationOtp);
authRouter.put("/change-password", protect, changePassword);