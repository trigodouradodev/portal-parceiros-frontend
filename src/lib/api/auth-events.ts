// Eventos usados para comunicar o interceptor do axios com o AuthContext
// sem criar dependência circular entre os módulos.

export const AUTH_TOKEN_REFRESHED_EVENT = "auth:token-refreshed";
export const AUTH_LOGOUT_EVENT = "auth:logout";

export interface AuthTokenRefreshedDetail {
  accessToken: string;
  refreshToken: string;
}

export const emitTokenRefreshed = (detail: AuthTokenRefreshedDetail) => {
  window.dispatchEvent(
    new CustomEvent<AuthTokenRefreshedDetail>(AUTH_TOKEN_REFRESHED_EVENT, {
      detail,
    }),
  );
};

export const emitAuthLogout = () => {
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
};
