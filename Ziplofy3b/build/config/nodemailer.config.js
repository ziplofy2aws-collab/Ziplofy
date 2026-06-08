"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
// Env is loaded by env.utils (imported first in index.ts)
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envFile = process.env.DOTENV_CONFIG_PATH
    ?? `.env.${process.env.NODE_ENV || 'development'}`;
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), envFile) });
// Gmail App Passwords often have spaces when copied - remove them
const emailUser = process.env.EMAIL_ADDRESS?.trim();
const emailPass = (process.env.EMAIL_PASSWORD ?? '').replace(/\s/g, '');
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});
// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('Nodemailer configuration error:', error.message);
        if (error.message?.includes('Invalid login')) {
            console.error('Gmail tip: Use an App Password (not your regular password). ' +
                'Go to Google Account > Security > 2-Step Verification > App passwords');
        }
    }
    else {
        console.log('Nodemailer is ready to send emails');
    }
});
exports.default = transporter;
