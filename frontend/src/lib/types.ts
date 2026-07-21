export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  companyName: string;
}

export interface User {
  email: string;
  role: string;
  companyName: string;
}