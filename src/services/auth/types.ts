export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  role: string;
  permissions: string[];
}

/** Body de `PATCH /auth/me` (camelCase). */
export interface UpdateProfileRequest {
  email?: string;
  fullName?: string;
  phoneNumber?: string | null;
}
