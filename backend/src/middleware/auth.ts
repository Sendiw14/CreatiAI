import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface JwtPayload {
  userId: string
  email: string
  role: 'user' | 'admin' | 'moderator'
  iat?: number
  exp?: number
}

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export function verifyAccessToken(token: string): JwtPayload {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) throw new Error('JWT_ACCESS_SECRET not set')
  return jwt.verify(token, secret) as JwtPayload
}

export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) throw new Error('JWT_ACCESS_SECRET not set')
  // Cast expiresIn to any to satisfy @types/jsonwebtoken overload resolution
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload as object, secret, { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as any })
}

export function signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) throw new Error('JWT_REFRESH_SECRET not set')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload as object, secret, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as any })
}

export function verifyRefreshToken(token: string): JwtPayload {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) throw new Error('JWT_REFRESH_SECRET not set')
  return jwt.verify(token, secret) as JwtPayload
}

// Express middleware
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header required' })
    return
  }
  const token = authHeader.split(' ')[1]
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
