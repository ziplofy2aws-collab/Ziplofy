// @ts-nocheck

import { Router } from "express";

import { authorize, protect } from "../middlewares/auth.middleware";
import { RoleType } from "../types";
import { getRoles, createRole, getDefaultRoles, getRole, updateRole, deleteRole, updateRolePermissions, bulkUpdateRolePermissions } from "../controllers/role.controller";

export const roleRouter = Router();

// All routes protected and admin roles only
roleRouter.use(protect);
roleRouter.use(authorize(RoleType.SUPER_ADMIN, RoleType.SUPPORT_ADMIN, RoleType.DEVELOPER_ADMIN, RoleType.CLIENT_ADMIN));

roleRouter.get("/", getRoles);
roleRouter.post("/", createRole);

roleRouter.get("/default", getDefaultRoles);

roleRouter.get("/:id", getRole);
roleRouter.put("/:id", updateRole);
roleRouter.put("/:id/permissions", updateRolePermissions);
roleRouter.put("/permissions/bulk", bulkUpdateRolePermissions);
roleRouter.delete("/:id", deleteRole);
