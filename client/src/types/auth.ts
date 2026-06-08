// types/auth.ts
export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}