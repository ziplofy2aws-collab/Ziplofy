import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.utils';

export const awsBucket = env.AWS_S3_BUCKET_NAME;
export const awsRegion = env.AWS_REGION;

export const s3Client = new S3Client({
  region: awsRegion,
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
  ...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});
