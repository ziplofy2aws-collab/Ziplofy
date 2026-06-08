"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginLogRouter = void 0;
const express_1 = require("express");
const login_log_controller_1 = require("../controllers/login-log.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.loginLogRouter = (0, express_1.Router)();
// All routes require authentication
exports.loginLogRouter.use(auth_middleware_1.protect);
// Get login logs with pagination and filters
exports.loginLogRouter.get("/", login_log_controller_1.getLoginLogs);
// Get login statistics
exports.loginLogRouter.get("/stats", login_log_controller_1.getLoginStats);
// Get recent successful logins
exports.loginLogRouter.get("/recent", login_log_controller_1.getRecentLogins);
