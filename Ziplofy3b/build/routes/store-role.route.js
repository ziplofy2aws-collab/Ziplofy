"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_role_controller_1 = require("../controllers/store-role.controller");
const storeRoleRouter = (0, express_1.Router)();
// CRUD
storeRoleRouter.get('/', store_role_controller_1.getRolesByStoreId); // /api/store-roles?storeId=...
storeRoleRouter.post('/', store_role_controller_1.createRole);
storeRoleRouter.patch('/:roleId', store_role_controller_1.updateRole);
storeRoleRouter.delete('/:roleId', store_role_controller_1.deleteRole);
exports.default = storeRoleRouter;
