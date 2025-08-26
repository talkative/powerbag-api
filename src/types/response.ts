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
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    roles: string[]; // Array of roles, e.g., ['member', 'admin']
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    name: string;
    roles: string[];
  };
}
