"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientUserStatsRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const client_user_stats_controller_1 = require("../controllers/client-user-stats.controller");
exports.clientUserStatsRouter = (0, express_1.Router)();
exports.clientUserStatsRouter.use(auth_middleware_1.protect);
exports.clientUserStatsRouter.get("/:userId", client_user_stats_controller_1.getClientUserStats);
