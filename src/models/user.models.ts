export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface UserRegisterRequest {
  first_name: string;
  last_name: string;
  address: Address;
  phone: string;
  dob: string;
  password: string;
  email: string;
}

export interface UserRegisterResponse {
  first_name: string;
  last_name: string;
  address: Address;
  phone: string;
  dob: string;
  email: string;
  id: string;
  provider: string;
  totp_enabled: boolean;
  enabled: boolean;
  failed_login_attempts: number;
  created_at: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LogoutResponse {
  message: string;
}