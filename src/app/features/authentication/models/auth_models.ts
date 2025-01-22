// Interfaces for API Responses and Requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  username: string;
  user_email: string;
}

export interface TokenValidationRequest {
  access_token: string;
  token_type: string;
}

export interface PasswordChangeRequest {
  email: string;
  current_password: string;
  new_password: string;
}
