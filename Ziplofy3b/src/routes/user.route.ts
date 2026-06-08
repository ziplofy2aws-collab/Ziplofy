import { Router } from "express";
import { createUser, deleteUser, getUser, getUsers, updateUser } from "../controllers/user.controller";
import { authorize, authorizePermission, protect } from "../middlewares/auth.middleware";
import { RoleType } from "../types";

export const userRouter = Router();

userRouter.use(protect);

// List users: super-admin OR users with view permission in User Management > Manage User
userRouter.get(
  "/",
  authorizePermission("User Management", "view", "Manage User"),
  getUsers
);
userRouter.get(
  "/:id",
  authorizePermission("User Management", "view", "Manage User"),
  getUser
);

// Create: super-admin OR users with upload permission
userRouter.post(
  "/",
  authorizePermission("User Management", "upload", "Manage User"),
  createUser
);

// Update: super-admin OR users with edit permission in User Management > Manage User
userRouter.put(
  "/:id",
  authorizePermission("User Management", "edit", "Manage User"),
  updateUser
);

// Delete: super-admin OR users with edit permission
userRouter.delete(
  "/:id",
  authorizePermission("User Management", "edit", "Manage User"),
  deleteUser
);