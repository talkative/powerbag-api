// Investigate if can get directly from mongoose

import { Request } from 'express';

export interface ErrorResponse {
  message: string;
  error?: unknown; // Optional field for more detailed error information
}

export interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[]; // Array of roles, e.g., ['member', 'admin']
  assignedCollections: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}
