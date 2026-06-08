"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRouter = void 0;
const express_1 = require("express");
const client_controller_1 = require("../controllers/client.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.clientRouter = (0, express_1.Router)();
// Protect all client routes
exports.clientRouter.use(auth_middleware_1.protect);
exports.clientRouter.get("/", client_controller_1.getClients);
exports.clientRouter.post("/", client_controller_1.createClient);
exports.clientRouter.get("/:id", client_controller_1.getClient);
exports.clientRouter.put("/:id", client_controller_1.updateClient);
exports.clientRouter.delete("/:id", client_controller_1.deleteClient);
