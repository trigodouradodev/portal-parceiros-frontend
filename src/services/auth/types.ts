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
  canSimulateQuote: boolean;
  canCreateQuote: boolean;
}

/**
 * Body de `PATCH /auth/me` (camelCase). E-mail não entra aqui: é o login do
 * usuário, não é editável pelo Perfil.
 */
export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string | null;
}

/** Body de `PATCH /auth/change-password` (camelCase). */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}
