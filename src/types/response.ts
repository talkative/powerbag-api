// Investigate if can get directly from mongoose

export interface ErrorResponse {
  message: string;
  error?: unknown; // Optional field for more detailed error information
}

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number; // Optional field
}
