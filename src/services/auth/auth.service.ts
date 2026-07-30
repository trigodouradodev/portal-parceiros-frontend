import { api } from "@/lib/api/axios";
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UpdateProfileRequest,
  UserProfile,
} from "@/services/auth/types";

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>(
      "/auth/refresh",
      data,
    );
    return response.data;
  },

  async getProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>("/auth/me");
    return response.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await api.patch<UserProfile>("/auth/me", data);
    return response.data;
  },

  async changePassword(
    data: ChangePasswordRequest,
  ): Promise<ChangePasswordResponse> {
    const response = await api.patch<ChangePasswordResponse>(
      "/auth/me/password",
      data,
    );
    return response.data;
  },
};

export default authService;
