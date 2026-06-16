"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.UrlType = void 0;
const nodemailer_config_1 = __importDefault(require("../config/nodemailer.config"));
var UrlType;
(function (UrlType) {
    UrlType["VIEW_REQUIREMENTS_FORM"] = "viewRequirementsForm";
})(UrlType || (exports.UrlType = UrlType = {}));
const sendEmail = async (options) => {
    const from = process.env.EMAIL_ADDRESS?.trim();
    if (!from) {
        throw new Error('EMAIL_ADDRESS is not configured. Check your .env file.');
    }
    let emailBody = options.body;
    if (options.url) {
        // Add the URL to the body, with a clickable link
        emailBody += `<br/><br/>Link: <a href="${options.url}" target="_blank">${options.url}</a>`;
    }
    const mailOptions = {
        from: `Ziplofy <${from}>`,
        to: options.to,
        subject: options.subject,
        html: emailBody,
    };
    await nodemailer_config_1.default.sendMail(mailOptions);
};
exports.sendEmail = sendEmail;
