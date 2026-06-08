"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storefrontAuthRouter = void 0;
const express_1 = require("express");
const storefront_auth_controller_1 = require("../controllers/storefront-auth.controller");
const storefront_auth_middleware_1 = require("../middlewares/storefront-auth.middleware");
exports.storefrontAuthRouter = (0, express_1.Router)();
// Public storefront auth routes
exports.storefrontAuthRouter.post('/signup', storefront_auth_controller_1.storefrontSignup);
exports.storefrontAuthRouter.post('/login', storefront_auth_controller_1.storefrontLogin);
exports.storefrontAuthRouter.get('/me', storefront_auth_middleware_1.storefrontProtect, storefront_auth_controller_1.storefrontMe);
exports.storefrontAuthRouter.post('/forgot-password', storefront_auth_controller_1.forgotPassword);
exports.storefrontAuthRouter.post('/reset-password', storefront_auth_controller_1.resetPassword);
