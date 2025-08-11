import * as express from 'express-serve-static-core';

declare global {
  namespace Express {
    interface Request {
      // Extend the Request interface if needed
      customField?: string; // Example: to hold user information after authentication
    }
  }
}
