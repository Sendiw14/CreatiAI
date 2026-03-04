import { Router } from 'express'
import mongoose from 'mongoose'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/share/:token — public share view (no auth required)
router.get('/:token', async (req, res) => {
  try {
    // Dynamic import to avoid circular dependency
    const Project = mongoose.models.Project
    if (!Project) return res.status(503).json({ error: 'Service starting up' })
    const project = await Project.findOne({ shareToken: req.params.token, isPublic: true })
      .select('-versions -collaborators')
    if (!project) return res.status(404).json({ error: 'Shared project not found or no longer public' })
    project.viewCount = (project.viewCount ?? 0) + 1
    await project.save().catch(() => { /* non-critical */ })
    return res.json(project)
  } catch {
    return res.status(500).json({ error: 'Failed to load shared project' })
  }
})

// POST /api/share/:token/fork — fork a shared project
router.post('/:token/fork', requireAuth, async (req: AuthRequest, res) => {
  try {
    const Project = mongoose.models.Project
    if (!Project) return res.status(503).json({ error: 'Service starting up' })
    const original = await Project.findOne({ shareToken: req.params.token, isPublic: true })
    if (!original) return res.status(404).json({ error: 'Shared project not found' })
    const forked = await Project.create({
      name: `${original.name} (fork)`,
      description: original.description,
      ownerId: req.user!.userId,
      nodes: original.nodes,
      edges: original.edges,
      versions: [],
      isPublic: false,
      tags: original.tags,
    })
    original.forkCount = (original.forkCount ?? 0) + 1
    await original.save().catch(() => { /* non-critical */ })
    return res.status(201).json({ projectId: forked.id, name: forked.name })
  } catch {
    return res.status(500).json({ error: 'Fork failed' })
  }
})

export default router
