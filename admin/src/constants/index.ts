// constants/index.ts
export const SUPER_ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YzdhNjM4ZDMwNjk3ZDg0MTMxMWRiMiIsImlhdCI6MTc1NzkxNDc0OCwiZXhwIjoxNzYwNTA2NzQ4fQ.l_WEb7jfKaITY9XKJCjozKtLCZgD3yU_HaDEAMZJINM";

// You can also add other constants and types here
export interface AppConstants {
  SUPER_ADMIN_TOKEN: string;
  // Add other constants as needed
}

// Or export as a constants object
export const constants = {
  SUPER_ADMIN_TOKEN,
} as const;