"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = exports.loadedEnvFile = void 0;
exports.validateEnv = validateEnv;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envFile = process.env.DOTENV_CONFIG_PATH
    ?? `.env.${process.env.NODE_ENV || 'development'}`;
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), envFile) });
exports.loadedEnvFile = envFile;
const requiredEnvVars = [
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRE',
    'JWT_COOKIE_EXPIRE',
    'ACCESS_TOKEN_SECRET',
    'EMAIL_PASSWORD',
    'EMAIL_ADDRESS',
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
];
function validateEnv() {
    const missingVars = [];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missingVars.push(envVar);
        }
    }
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}\n` +
            'Please check your .env file and ensure all required variables are set.');
    }
    console.log('✅ All required environment variables are set');
}
const getValidatedEnv = (key) => process.env[key];
exports.env = {
    PORT: getValidatedEnv('PORT'),
    MONGODB_URI: getValidatedEnv('MONGODB_URI'),
    JWT_SECRET: getValidatedEnv('JWT_SECRET'),
    JWT_EXPIRE: getValidatedEnv('JWT_EXPIRE'),
    JWT_COOKIE_EXPIRE: getValidatedEnv('JWT_COOKIE_EXPIRE'),
    ACCESS_TOKEN_SECRET: getValidatedEnv('ACCESS_TOKEN_SECRET'),
    EMAIL_PASSWORD: getValidatedEnv('EMAIL_PASSWORD'),
    EMAIL_ADDRESS: getValidatedEnv('EMAIL_ADDRESS'),
    NODE_ENV: (process.env.NODE_ENV || 'development'),
    DOTENV_CONFIG_PATH: process.env.DOTENV_CONFIG_PATH,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    AWS_REGION: getValidatedEnv('AWS_REGION'),
    AWS_S3_BUCKET_NAME: getValidatedEnv('AWS_S3_BUCKET_NAME'),
    AWS_ACCESS_KEY_ID: getValidatedEnv('AWS_ACCESS_KEY_ID'),
    AWS_SECRET_ACCESS_KEY: getValidatedEnv('AWS_SECRET_ACCESS_KEY'),
};
