export type UserRole = 'student' | 'cr' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  batch?: string;
  department?: string;
  student_id?: string;
  profile_picture?: string;
  skills?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  student_id: string;
  batch: string;
  department: string;
}

