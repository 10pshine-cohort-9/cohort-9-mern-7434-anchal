import api from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
}

export interface CurrentUserResponse {
  success: boolean;
  message?: string;
  data: AuthUser;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export const registerUser = async (
  data: RegisterData
): Promise<{ success: boolean; message: string; data?: AuthUser }> => {
  const response = await api.post('/auth/signup', data);

  return response.data;
};

export const loginUser = async (
  data: LoginData
): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);

  return response.data;
};

export const getCurrentUser =
  async (): Promise<CurrentUserResponse> => {
    const response = await api.get('/auth/me');

    return response.data;
  };

export const logoutUser =
  async (): Promise<LogoutResponse> => {
    const response = await api.post('/auth/logout');

    return response.data;
  };