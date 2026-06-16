"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOrderConfirmationEmail = exports.buildStoreSenderEmailVerificationUrl = exports.buildStoreSenderEmailVerificationEmail = void 0;
var store_sender_email_verification_template_1 = require("./store-sender-email-verification.template");
Object.defineProperty(exports, "buildStoreSenderEmailVerificationEmail", { enumerable: true, get: function () { return store_sender_email_verification_template_1.buildStoreSenderEmailVerificationEmail; } });
Object.defineProperty(exports, "buildStoreSenderEmailVerificationUrl", { enumerable: true, get: function () { return store_sender_email_verification_template_1.buildStoreSenderEmailVerificationUrl; } });
var order_confirmation_template_1 = require("./order-confirmation.template");
Object.defineProperty(exports, "buildOrderConfirmationEmail", { enumerable: true, get: function () { return order_confirmation_template_1.buildOrderConfirmationEmail; } });
