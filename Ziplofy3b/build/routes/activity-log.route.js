"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityLogRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const activity_log_controller_1 = require("../controllers/activity-log.controller");
exports.activityLogRouter = (0, express_1.Router)();
exports.activityLogRouter.use(auth_middleware_1.protect);
// Log export (any authenticated admin)
exports.activityLogRouter.post('/export', activity_log_controller_1.logExportActivity);
// Super-admin only - checked in controller
exports.activityLogRouter.get('/:id/download', activity_log_controller_1.downloadExportFromActivity);
exports.activityLogRouter.get('/:id', activity_log_controller_1.getActivityLogDetail);
exports.activityLogRouter.get('/', activity_log_controller_1.listActivityLogs);
