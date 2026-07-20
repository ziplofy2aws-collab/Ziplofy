declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    MONGO_URI: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    CLIENT_URL: string;
    GOOGLE_CLIENT_ID: string;
    // Add more environment variables here as needed
  }
}