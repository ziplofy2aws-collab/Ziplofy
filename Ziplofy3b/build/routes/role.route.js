"use strict";
// @ts-nocheck
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const types_1 = require("../types");
const role_controller_1 = require("../controllers/role.controller");
exports.roleRouter = (0, express_1.Router)();
// All routes protected and admin roles only
exports.roleRouter.use(auth_middleware_1.protect);
exports.roleRouter.use((0, auth_middleware_1.authorize)(types_1.RoleType.SUPER_ADMIN, types_1.RoleType.SUPPORT_ADMIN, types_1.RoleType.DEVELOPER_ADMIN, types_1.RoleType.CLIENT_ADMIN));
exports.roleRouter.get("/", role_controller_1.getRoles);
exports.roleRouter.post("/", role_controller_1.createRole);
exports.roleRouter.get("/default", role_controller_1.getDefaultRoles);
exports.roleRouter.get("/:id", role_controller_1.getRole);
exports.roleRouter.put("/:id", role_controller_1.updateRole);
exports.roleRouter.put("/:id/permissions", role_controller_1.updateRolePermissions);
exports.roleRouter.put("/permissions/bulk", role_controller_1.bulkUpdateRolePermissions);
exports.roleRouter.delete("/:id", role_controller_1.deleteRole);
