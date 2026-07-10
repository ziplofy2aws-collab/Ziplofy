"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permission_controller_1 = require("../controllers/permission.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permissionRouter = (0, express_1.Router)();
permissionRouter.use(auth_middleware_1.protect);
permissionRouter.get('/', permission_controller_1.getAllPermissions);
exports.default = permissionRouter;
