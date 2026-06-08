"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permission_controller_1 = require("../controllers/permission.controller");
const permissionRouter = (0, express_1.Router)();
permissionRouter.get('/', permission_controller_1.getAllPermissions);
exports.default = permissionRouter;
