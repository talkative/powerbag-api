import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ErrorResponse, AuthenticatedRequest } from '../types/response';
import { HTTP_STATUS } from '../constants/httpStatusCodes';

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const publicRoutes = [
    { method: 'POST', route: '/api/users/send-totp' },
    { method: 'POST', route: '/api/users/login' },
    { method: 'GET', route: '/api/users/check-email' },
    { method: 'GET', route: '/api/collections' },
    { method: 'GET', route: '/api/collections/:id' },
    { method: 'GET', route: '/api/storylines' },
    { method: 'GET', route: '/api/info' },
  ];

  // Check if the request is to a public route
  const isPublicRoute = publicRoutes.some(
    (route) =>
      req.method === route.method && req.originalUrl.startsWith(route.route)
  );

  // Skip authentication for public routes
  if (isPublicRoute) return next();

  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: 'Access token is required',
    } as ErrorResponse);
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      message: 'Invalid or expired token',
    } as ErrorResponse);
  }

  req.user = decoded;
  next();
};
