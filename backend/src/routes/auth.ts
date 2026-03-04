import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import mongoose, { Schema, Document } from 'mongoose'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  requireAuth,
  AuthRequest,
} from '../middleware/auth'

const router = Router()

// ─── User Model ──────────────────────────────────────────────────────────────

interface IUser extends Document {
  email: string
  passwordHash: string
  displayName: string
  bio: string
  role: 'user' | 'admin' | 'moderator'
  plan: 'free' | 'pro' | 'team' | 'enterprise'
  status: 'active' | 'suspended' | 'pending'
  emailVerified: boolean
  avatarUrl?: string
  refreshTokens: string[]
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, required: true, trim: true },
  bio: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  plan: { type: String, enum: ['free', 'pro', 'team', 'enterprise'], default: 'free' },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  emailVerified: { type: Boolean, default: false },
  avatarUrl: String,
  refreshTokens: [String],
}, { timestamps: true })

const User = mongoose.models.User ?? mongoose.model<IUser>('User', userSchema)

// ─── Validation schemas ───────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2).max(50),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body)
    const existing = await User.findOne({ email: data.email })
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }
    const passwordHash = await bcrypt.hash(data.password, 12)
    const user = await User.create({ email: data.email, passwordHash, displayName: data.displayName })
    const tokenPayload = { userId: user.id as string, email: user.email, role: user.role }
    const accessToken = signAccessToken(tokenPayload)
    const refreshToken = signRefreshToken(tokenPayload)
    user.refreshTokens.push(refreshToken)
    await user.save()
    return res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role, plan: user.plan },
    })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    return res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body)
    const user = await User.findOne({ email: data.email })
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended' })
    }
    const tokenPayload = { userId: user.id as string, email: user.email, role: user.role }
    const accessToken = signAccessToken(tokenPayload)
    const refreshToken = signRefreshToken(tokenPayload)
    // Keep max 5 refresh tokens per user
    user.refreshTokens = [...user.refreshTokens.slice(-4), refreshToken]
    await user.save()
    return res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role, plan: user.plan, bio: user.bio, avatarUrl: user.avatarUrl },
    })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    return res.status(500).json({ error: 'Login failed' })
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' })
  try {
    const payload = verifyRefreshToken(refreshToken)
    const user = await User.findById(payload.userId)
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }
    const tokenPayload = { userId: user.id as string, email: user.email, role: user.role }
    const newAccessToken = signAccessToken(tokenPayload)
    const newRefreshToken = signRefreshToken(tokenPayload)
    user.refreshTokens = user.refreshTokens.filter((t: string) => t !== refreshToken)
    user.refreshTokens.push(newRefreshToken)
    await user.save()
    return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' })
  }
})

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req: AuthRequest, res) => {
  const { refreshToken } = req.body
  try {
    const user = await User.findById(req.user!.userId)
    if (user && refreshToken) {
      user.refreshTokens = user.refreshTokens.filter((t: string) => t !== refreshToken)
      await user.save()
    }
    return res.json({ message: 'Logged out' })
  } catch {
    return res.status(500).json({ error: 'Logout failed' })
  }
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.userId).select('-passwordHash -refreshTokens')
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json(user)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// PATCH /api/auth/profile
router.patch('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const updates = z.object({
      displayName: z.string().min(2).max(50).optional(),
      bio: z.string().max(500).optional(),
      avatarUrl: z.string().url().optional(),
    }).parse(req.body)
    const user = await User.findByIdAndUpdate(req.user!.userId, updates, { new: true }).select('-passwordHash -refreshTokens')
    return res.json(user)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    return res.status(500).json({ error: 'Update failed' })
  }
})

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)
    const user = await User.findById(req.user!.userId)
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(401).json({ error: 'Current password incorrect' })
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12)
    user.refreshTokens = [] // Invalidate all sessions
    await user.save()
    return res.json({ message: 'Password changed. Please log in again.' })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    return res.status(500).json({ error: 'Password change failed' })
  }
})

// DELETE /api/auth/account
router.delete('/account', requireAuth, async (req: AuthRequest, res) => {
  try {
    await User.findByIdAndDelete(req.user!.userId)
    return res.json({ message: 'Account deleted' })
  } catch {
    return res.status(500).json({ error: 'Account deletion failed' })
  }
})

export default router
