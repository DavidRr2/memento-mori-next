import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface UserPayload {
  userId: number;
  email: string;
}

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(
    'JWT_SECRET is not configured. Set the JWT_SECRET environment variable to enable authentication.',
  );
}

const resolvedJwtSecret: string = jwtSecret;

export function getJwtSecret(): string {
  return resolvedJwtSecret;
}

export function getUserFromRequest(request: NextRequest): UserPayload | null {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, resolvedJwtSecret) as UserPayload;
  } catch {
    return null;
  }
}
