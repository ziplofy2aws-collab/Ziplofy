"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminRouter = void 0;
const express_1 = require("express");
const super_admin_controller_1 = require("../controllers/super-admin.controller");
exports.superAdminRouter = (0, express_1.Router)();
exports.superAdminRouter.get("/notifications", super_admin_controller_1.getSuperAdminNotifications);
