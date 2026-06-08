"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignedSupportDeveloperRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const types_1 = require("../types");
const assigned_support_developer_controller_1 = require("../controllers/assigned-support-developer.controller");
exports.assignedSupportDeveloperRouter = (0, express_1.Router)();
exports.assignedSupportDeveloperRouter.post("/", auth_middleware_1.protect, (0, auth_middleware_1.authorize)(types_1.RoleType.SUPER_ADMIN), assigned_support_developer_controller_1.createAssignedSupportDeveloper);
