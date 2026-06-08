declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Server Configuration
      PORT?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
      DOTENV_CONFIG_PATH?: string;
      
      // Database Configuration
      MONGODB_URI?: string;
      
      // JWT Configuration
      JWT_SECRET?: string;
      JWT_EXPIRE?: string;
      JWT_COOKIE_EXPIRE?: string;
      ACCESS_TOKEN_SECRET?: string;
      
      // Email Configuration
      EMAIL_PASSWORD?: string;
      EMAIL_ADDRESS?: string;
      
      // CORS Configuration
      CORS_ORIGIN?: string;

      // AWS S3 Configuration
      AWS_REGION?: string;
      AWS_S3_BUCKET_NAME?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
    }
  }
}

export {};
