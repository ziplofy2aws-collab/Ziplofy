import { Router } from "express";
import {
  createCompany,
  deleteCompany,
  getCompaniesByStoreId,
  getCompanyById,
  updateCompany,
} from "../controllers/company.controller";
import { protect } from "../middlewares/auth.middleware";

export const companyRouter = Router();

companyRouter.use(protect);

companyRouter.get("/store/:storeId", getCompaniesByStoreId);
companyRouter.get("/:id", getCompanyById);
companyRouter.post("/", createCompany);
companyRouter.put("/:id", updateCompany);
companyRouter.patch("/:id", updateCompany);
companyRouter.delete("/:id", deleteCompany);
