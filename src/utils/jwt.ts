import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JwtPayload {
  _id: string;
  email: string;
  name: string;
  roles: string[];
  assignedCollections: string[];
}

export const generateToken = (user: IUser): string => {
  const payload: JwtPayload = {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    roles: user.roles,
    assignedCollections: user.assignedCollections.map((id) => id.toString()),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
