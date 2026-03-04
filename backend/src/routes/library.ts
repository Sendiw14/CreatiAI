import { Router } from 'express'
import mongoose, { Schema, Document } from 'mongoose'
import { z } from 'zod'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// ─── Models ───────────────────────────────────────────────────────────────────

interface IAsset extends Document {
  ownerId: string
  type: 'image' | 'text' | 'sketch' | 'ai_generated'
  name: string
  content: string
  tags: string[]
  projectId?: string
  projectName?: string
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const assetSchema = new Schema<IAsset>({
  ownerId: { type: String, required: true },
  type: { type: String, enum: ['image', 'text', 'sketch', 'ai_generated'], required: true },
  name: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  projectId: String,
  projectName: String,
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true })

const Asset = mongoose.models.Asset ?? mongoose.model<IAsset>('Asset', assetSchema)

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/library
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { type, tag, sort = 'createdAt', q } = req.query
    const filter: Record<string, unknown> = { ownerId: req.user!.userId }
    if (type) filter.type = type
    if (tag) filter.tags = tag
    if (q) filter.name = { $regex: q, $options: 'i' }
    const sortField = sort === 'name' ? 'name' : sort === 'updatedAt' ? '-updatedAt' : '-createdAt'
    const assets = await Asset.find(filter).sort(sortField)
    return res.json(assets)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch library' })
  }
})

// POST /api/library
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = z.object({
      type: z.enum(['image', 'text', 'sketch', 'ai_generated']),
      name: z.string().min(1).max(200),
      content: z.string(),
      tags: z.array(z.string()).optional(),
      projectId: z.string().optional(),
      projectName: z.string().optional(),
      metadata: z.record(z.unknown()).optional(),
    }).parse(req.body)
    const asset = await Asset.create({ ...data, ownerId: req.user!.userId })
    return res.status(201).json(asset)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    return res.status(500).json({ error: 'Failed to save asset' })
  }
})

// DELETE /api/library/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
    if (!asset) return res.status(404).json({ error: 'Asset not found' })
    if (asset.ownerId !== req.user!.userId) return res.status(403).json({ error: 'Not your asset' })
    await asset.deleteOne()
    return res.json({ message: 'Deleted' })
  } catch {
    return res.status(500).json({ error: 'Delete failed' })
  }
})

export default router
