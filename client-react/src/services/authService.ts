import { apiClient } from './apiClient';
import type { AuthResponse, RegisterPayload } from '../types/auth';

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  register: async (payload: RegisterPayload): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/register', payload);
  },
};

