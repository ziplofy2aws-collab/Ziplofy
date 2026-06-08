"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = exports.awsRegion = exports.awsBucket = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_utils_1 = require("./env.utils");
exports.awsBucket = env_utils_1.env.AWS_S3_BUCKET_NAME;
exports.awsRegion = env_utils_1.env.AWS_REGION;
exports.s3Client = new client_s3_1.S3Client({
    region: exports.awsRegion,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    ...(env_utils_1.env.AWS_ACCESS_KEY_ID && env_utils_1.env.AWS_SECRET_ACCESS_KEY
        ? {
            credentials: {
                accessKeyId: env_utils_1.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env_utils_1.env.AWS_SECRET_ACCESS_KEY,
            },
        }
        : {}),
});
