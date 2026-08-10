import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { Role } from '../types/index.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
