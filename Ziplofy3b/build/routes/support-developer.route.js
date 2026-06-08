"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportDeveloperRouter = void 0;
const express_1 = require("express");
const support_developer_controller_1 = require("../controllers/support-developer.controller");
exports.supportDeveloperRouter = (0, express_1.Router)();
exports.supportDeveloperRouter.post("/", support_developer_controller_1.createSupportDeveloper);
exports.supportDeveloperRouter.get("/", support_developer_controller_1.getSupportDevelopers);
