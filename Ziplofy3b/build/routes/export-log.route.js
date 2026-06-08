"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportLogRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const export_log_controller_1 = require("../controllers/export-log.controller");
exports.exportLogRouter = (0, express_1.Router)();
exports.exportLogRouter.use(auth_middleware_1.protect);
// Log an export (any authenticated user)
exports.exportLogRouter.post('/', export_log_controller_1.logExport);
// Download a specific export (super-admin only) - must be before /:id
exports.exportLogRouter.get('/:id/download', export_log_controller_1.downloadExport);
// List export logs (super-admin only)
exports.exportLogRouter.get('/', export_log_controller_1.listExportLogs);
