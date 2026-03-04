import { Router } from 'express'
import { z } from 'zod'
import mongoose, { Schema, Document } from 'mongoose'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// ─── Models ───────────────────────────────────────────────────────────────────

interface INode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

interface IEdge {
  id: string
  source: string
  target: string
  data?: Record<string, unknown>
}

interface IVersion {
  id: string
  nodes: INode[]
  edges: IEdge[]
  label?: string
  isCheckpoint: boolean
  createdAt: Date
}

interface IProject extends Document {
  name: string
  description: string
  ownerId: string
  collaborators: { userId: string; role: 'viewer' | 'editor' }[]
  nodes: INode[]
  edges: IEdge[]
  versions: IVersion[]
  isPublic: boolean
  shareToken?: string
  tags: string[]
  thumbnail?: string
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new Schema<IProject>({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  ownerId: { type: String, required: true },
  collaborators: [{ userId: String, role: { type: String, enum: ['viewer', 'editor'] } }],
  nodes: [{ type: Schema.Types.Mixed }],
  edges: [{ type: Schema.Types.Mixed }],
  versions: [{ type: Schema.Types.Mixed }],
  isPublic: { type: Boolean, default: false },
  shareToken: String,
  tags: [String],
  thumbnail: String,
}, { timestamps: true })

const Project = mongoose.models.Project ?? mongoose.model<IProject>('Project', projectSchema)

// ─── Schemas ─────────────────────────────────────────────────────────────────

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
})

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/projects
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { ownerId: req.user!.userId },
        { 'collaborators.userId': req.user!.userId },
      ],
    }).sort({ updatedAt: -1 }).select('-nodes -edges -versions')
    return res.json(projects)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// POST /api/projects
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = createProjectSchema.parse(req.body)
    const project = await Project.create({
      ...data,
      ownerId: req.user!.userId,
      nodes: [],
      edges: [],
      versions: [],
    })
    return res.status(201).json(project)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    return res.status(500).json({ error: 'Failed to create project' })
  }
})

// GET /api/projects/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    const isOwner = project.ownerId === req.user!.userId
    const isCollab = project.collaborators.some((c: { userId: string; role: string }) => c.userId === req.user!.userId)
    if (!isOwner && !isCollab && !project.isPublic) {
      return res.status(403).json({ error: 'Access denied' })
    }
    return res.json(project)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// PUT /api/projects/:id — full canvas save
router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    const isOwner = project.ownerId === req.user!.userId
    const isEditor = project.collaborators.some((c: { userId: string; role: string }) => c.userId === req.user!.userId && c.role === 'editor')
    if (!isOwner && !isEditor) return res.status(403).json({ error: 'Write access denied' })

    const { nodes, edges, name, description, thumbnail } = req.body

    // Auto-version every 20 saves (simple heuristic)
    if (project.versions.length === 0 || Math.random() < 0.05) {
      const version: IVersion = {
        id: new mongoose.Types.ObjectId().toString(),
        nodes: project.nodes,
        edges: project.edges,
        isCheckpoint: false,
        createdAt: new Date(),
      }
      project.versions.push(version)
      if (project.versions.length > 50) {
        project.versions = project.versions.slice(-50)
      }
    }

    if (nodes !== undefined) project.nodes = nodes
    if (edges !== undefined) project.edges = edges
    if (name !== undefined) project.name = name
    if (description !== undefined) project.description = description
    if (thumbnail !== undefined) project.thumbnail = thumbnail

    await project.save()
    return res.json({ id: project.id, updatedAt: project.updatedAt })
  } catch {
    return res.status(500).json({ error: 'Failed to save project' })
  }
})

// DELETE /api/projects/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    if (project.ownerId !== req.user!.userId) return res.status(403).json({ error: 'Only owner can delete' })
    await project.deleteOne()
    return res.json({ message: 'Project deleted' })
  } catch {
    return res.status(500).json({ error: 'Failed to delete project' })
  }
})

// POST /api/projects/:id/checkpoint — save named version
router.post('/:id/checkpoint', requireAuth, async (req: AuthRequest, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    const { label } = z.object({ label: z.string().min(1).max(100) }).parse(req.body)
    const version: IVersion = {
      id: new mongoose.Types.ObjectId().toString(),
      nodes: project.nodes,
      edges: project.edges,
      label,
      isCheckpoint: true,
      createdAt: new Date(),
    }
    project.versions.push(version)
    await project.save()
    return res.status(201).json(version)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    return res.status(500).json({ error: 'Failed to create checkpoint' })
  }
})

// GET /api/projects/:id/versions
router.get('/:id/versions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const project = await Project.findById(req.params.id).select('versions ownerId collaborators')
    if (!project) return res.status(404).json({ error: 'Project not found' })
    return res.json(project.versions)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch versions' })
  }
})

// POST /api/projects/:id/versions/:versionId/restore
router.post('/:id/versions/:versionId/restore', requireAuth, async (req: AuthRequest, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    const version = project.versions.find((v: IVersion) => v.id === req.params.versionId)
    if (!version) return res.status(404).json({ error: 'Version not found' })
    project.nodes = version.nodes
    project.edges = version.edges
    await project.save()
    return res.json({ message: 'Restored', nodes: project.nodes, edges: project.edges })
  } catch {
    return res.status(500).json({ error: 'Restore failed' })
  }
})

// POST /api/projects/:id/collaborators
router.post('/:id/collaborators', requireAuth, async (req: AuthRequest, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    if (project.ownerId !== req.user!.userId) return res.status(403).json({ error: 'Owner only' })
    const { userId, role } = z.object({
      userId: z.string(),
      role: z.enum(['viewer', 'editor']),
    }).parse(req.body)
    const existing = project.collaborators.findIndex((c: { userId: string; role: string }) => c.userId === userId)
    if (existing !== -1) {
      project.collaborators[existing].role = role
    } else {
      project.collaborators.push({ userId, role })
    }
    await project.save()
    return res.json({ message: 'Collaborator added' })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    return res.status(500).json({ error: 'Failed to add collaborator' })
  }
})

// PATCH /api/projects/:id/share
router.patch('/:id/share', requireAuth, async (req: AuthRequest, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    if (project.ownerId !== req.user!.userId) return res.status(403).json({ error: 'Owner only' })
    const { isPublic } = z.object({ isPublic: z.boolean() }).parse(req.body)
    project.isPublic = isPublic
    if (isPublic && !project.shareToken) {
      project.shareToken = Math.random().toString(36).slice(2) + Date.now().toString(36)
    }
    await project.save()
    return res.json({ isPublic: project.isPublic, shareToken: project.shareToken })
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    return res.status(500).json({ error: 'Share update failed' })
  }
})

export default router
