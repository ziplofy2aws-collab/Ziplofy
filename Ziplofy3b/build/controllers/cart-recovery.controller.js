"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCartRecoveryEmail = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const email_utils_1 = require("../utils/email.utils");
const error_utils_1 = require("../utils/error.utils");
/** Temporary until customer emails are verified — mirrors frontend test recipient. */
const RECOVERY_EMAIL_TEST_RECIPIENT = 'developer200419@gmail.com';
exports.sendCartRecoveryEmail = (0, error_utils_1.asyncErrorHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { subject, html } = req.body;
    if (!storeId || !mongoose_1.default.Types.ObjectId.isValid(storeId)) {
        throw new error_utils_1.CustomError('Valid storeId is required', 400);
    }
    const trimmedSubject = subject?.trim();
    const trimmedHtml = html?.trim();
    if (!trimmedSubject) {
        throw new error_utils_1.CustomError('Email subject is required', 400);
    }
    if (!trimmedHtml) {
        throw new error_utils_1.CustomError('Email body is required', 400);
    }
    await (0, email_utils_1.sendEmail)({
        to: RECOVERY_EMAIL_TEST_RECIPIENT,
        subject: trimmedSubject,
        body: trimmedHtml,
    });
    res.status(200).json({
        success: true,
        message: `Recovery email sent to ${RECOVERY_EMAIL_TEST_RECIPIENT}`,
        sentTo: RECOVERY_EMAIL_TEST_RECIPIENT,
    });
});
