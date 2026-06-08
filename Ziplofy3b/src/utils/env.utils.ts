import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.DOTENV_CONFIG_PATH
  ?? `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export const loadedEnvFile = envFile;

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
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];

export type BackendEnv = {
  PORT: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  JWT_COOKIE_EXPIRE: string;
  ACCESS_TOKEN_SECRET: string;
  EMAIL_PASSWORD: string;
  EMAIL_ADDRESS: string;
  NODE_ENV: 'development' | 'production' | 'test';
  DOTENV_CONFIG_PATH?: string;
  CORS_ORIGIN?: string;
  AWS_REGION: string;
  AWS_S3_BUCKET_NAME: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
};

export function validateEnv(): void {
  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  console.log('✅ All required environment variables are set');
}

const getValidatedEnv = (key: RequiredEnvVar): string => process.env[key] as string;

export const env: BackendEnv = {
  PORT: getValidatedEnv('PORT'),
  MONGODB_URI: getValidatedEnv('MONGODB_URI'),
  JWT_SECRET: getValidatedEnv('JWT_SECRET'),
  JWT_EXPIRE: getValidatedEnv('JWT_EXPIRE'),
  JWT_COOKIE_EXPIRE: getValidatedEnv('JWT_COOKIE_EXPIRE'),
  ACCESS_TOKEN_SECRET: getValidatedEnv('ACCESS_TOKEN_SECRET'),
  EMAIL_PASSWORD: getValidatedEnv('EMAIL_PASSWORD'),
  EMAIL_ADDRESS: getValidatedEnv('EMAIL_ADDRESS'),
  NODE_ENV: (process.env.NODE_ENV || 'development') as BackendEnv['NODE_ENV'],
  DOTENV_CONFIG_PATH: process.env.DOTENV_CONFIG_PATH,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  AWS_REGION: getValidatedEnv('AWS_REGION'),
  AWS_S3_BUCKET_NAME: getValidatedEnv('AWS_S3_BUCKET_NAME'),
  AWS_ACCESS_KEY_ID: getValidatedEnv('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: getValidatedEnv('AWS_SECRET_ACCESS_KEY'),
};