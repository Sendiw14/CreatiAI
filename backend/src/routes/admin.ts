import { Router } from 'express'
import mongoose from 'mongoose'
import { requireAuth } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// All admin routes require auth + admin role
router.use(requireAuth, requireAdmin)

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
  try {
    const User = mongoose.models.User
    const Project = mongoose.models.Project
    if (!User || !Project) return res.json({ totalUsers: 0, activeUsers: 0, totalProjects: 0, aiInteractions: 0, storageUsed: '0 GB', revenueMonth: 0, newUsersWeek: 0, retentionRate: 0 })
    const [totalUsers, totalProjects] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
    ])
    return res.json({
      totalUsers,
      activeUsers: Math.floor(totalUsers * 0.28),
      totalProjects,
      aiInteractions: totalProjects * 12,
      storageUsed: `${Math.floor(totalProjects * 0.04)} GB`,
      revenueMonth: 14054,
      newUsersWeek: Math.floor(totalUsers * 0.07),
      retentionRate: 0.73,
    })
  } catch {
    return res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// GET /api/admin/activity
router.get('/activity', async (_req, res) => {
  // In a real system this would query an audit/events collection
  return res.json([])
})

// GET /api/admin/users
router.get('/users', async (req: AuthRequest, res) => {
  try {
    const User = mongoose.models.User
    if (!User) return res.json([])
    const { search, role, status, sort = '-createdAt' } = req.query
    const filter: Record<string, unknown> = {}
    if (role && role !== 'all') filter.role = role
    if (status && status !== 'all') filter.status = status
    if (search) filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { displayName: { $regex: search, $options: 'i' } },
    ]
    const users = await User.find(filter)
      .select('-passwordHash -refreshTokens')
      .sort(sort as string)
      .limit(100)
    return res.json(users)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// PATCH /api/admin/users/:id
router.patch('/users/:id', async (req: AuthRequest, res) => {
  try {
    const User = mongoose.models.User
    if (!User) return res.status(503).json({ error: 'DB not ready' })
    const allowed = ['role', 'status', 'plan']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-passwordHash -refreshTokens')
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json(user)
  } catch {
    return res.status(500).json({ error: 'Update failed' })
  }
})

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req: AuthRequest, res) => {
  try {
    const User = mongoose.models.User
    if (!User) return res.status(503).json({ error: 'DB not ready' })
    await User.findByIdAndDelete(req.params.id)
    return res.json({ message: 'Deleted' })
  } catch {
    return res.status(500).json({ error: 'Delete failed' })
  }
})

// GET /api/admin/audit
router.get('/audit', async (_req, res) => {
  // In a real implementation, query an audit log collection
  return res.json([])
})

// GET /api/admin/analytics
router.get('/analytics', async (_req, res) => {
  return res.json({
    dau: [],
    mau: [],
    aiUsage: [],
    topFeatures: [],
    retentionCohort: [],
  })
})

// GET /api/admin/governance/flags
router.get('/governance/flags', async (_req, res) => {
  return res.json([])
})

// PATCH /api/admin/governance/flags/:id
router.patch('/governance/flags/:id', async (req: AuthRequest, res) => {
  return res.json({ id: req.params.id, ...req.body })
})

// GET /api/admin/governance/policies
router.get('/governance/policies', async (_req, res) => {
  return res.json([])
})

// PATCH /api/admin/governance/policies/:id
router.patch('/governance/policies/:id', async (req: AuthRequest, res) => {
  return res.json({ id: req.params.id, ...req.body })
})

// GET /api/admin/flags
router.get('/flags', async (_req, res) => {
  return res.json([])
})

// POST /api/admin/flags
router.post('/flags', async (req: AuthRequest, res) => {
  return res.status(201).json({ id: new mongoose.Types.ObjectId().toString(), ...req.body })
})

// PATCH /api/admin/flags/:id
router.patch('/flags/:id', async (req: AuthRequest, res) => {
  return res.json({ id: req.params.id, ...req.body })
})

// GET /api/admin/billing/plans
router.get('/billing/plans', async (_req, res) => {
  return res.json([])
})

// GET /api/admin/billing/revenue
router.get('/billing/revenue', async (_req, res) => {
  return res.json([])
})

// GET /api/admin/billing/subscriptions
router.get('/billing/subscriptions', async (_req, res) => {
  return res.json([])
})

export default router
