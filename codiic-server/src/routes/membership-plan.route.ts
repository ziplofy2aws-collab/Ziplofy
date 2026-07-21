import { Router } from "express";
import {
  createMembershipPlan,
  deleteMembershipPlan,
  getAllMembershipPlansAdmin,
  getMembershipPlanById,
  getMembershipPlans,
  updateMembershipPlan,
} from "../controllers/membership-plan.controller";
import { authorize, protect } from "../middlewares/auth.middleware";

export const membershipPlanRouter = Router();

membershipPlanRouter.use(protect);

membershipPlanRouter.get("/", getMembershipPlans);
membershipPlanRouter.get("/admin/all", authorize("super-admin"), getAllMembershipPlansAdmin);
membershipPlanRouter.get("/:id", getMembershipPlanById);

membershipPlanRouter.post("/", authorize("super-admin"), createMembershipPlan);
membershipPlanRouter.put("/:id", authorize("super-admin"), updateMembershipPlan);
membershipPlanRouter.delete("/:id", authorize("super-admin"), deleteMembershipPlan);
