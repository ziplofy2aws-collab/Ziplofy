"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.use(auth_middleware_1.protect);
// List users: super-admin OR users with view permission in User Management > Manage User
exports.userRouter.get("/", (0, auth_middleware_1.authorizePermission)("User Management", "view", "Manage User"), user_controller_1.getUsers);
exports.userRouter.get("/:id", (0, auth_middleware_1.authorizePermission)("User Management", "view", "Manage User"), user_controller_1.getUser);
// Create: super-admin OR users with upload permission
exports.userRouter.post("/", (0, auth_middleware_1.authorizePermission)("User Management", "upload", "Manage User"), user_controller_1.createUser);
// Update: super-admin OR users with edit permission in User Management > Manage User
exports.userRouter.put("/:id", (0, auth_middleware_1.authorizePermission)("User Management", "edit", "Manage User"), user_controller_1.updateUser);
// Delete: super-admin OR users with edit permission
exports.userRouter.delete("/:id", (0, auth_middleware_1.authorizePermission)("User Management", "edit", "Manage User"), user_controller_1.deleteUser);
