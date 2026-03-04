import { Router } from 'express'
import mongoose, { Schema, Document } from 'mongoose'
import { z } from 'zod'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// ─── Models ───────────────────────────────────────────────────────────────────

interface IPost extends Document {
  projectId: string
  ownerId: string
  ownerName: string
  ownerAvatar?: string
  title: string
  description: string
  thumbnail?: string
  tags: string[]
  likeCount: number
  forkCount: number
  viewCount: number
  featured: boolean
  likedBy: string[]
  createdAt: Date
  updatedAt: Date
}

const postSchema = new Schema<IPost>({
  projectId: { type: String, required: true },
  ownerId: { type: String, required: true },
  ownerName: { type: String, required: true },
  ownerAvatar: String,
  title: { type: String, required: true },
  description: { type: String, default: '' },
  thumbnail: String,
  tags: [String],
  likeCount: { type: Number, default: 0 },
  forkCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  likedBy: [String],
}, { timestamps: true })

const Post = mongoose.models.ExplorePost ?? mongoose.model<IPost>('ExplorePost', postSchema)

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/explore
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { tab = 'trending', tag, q, page = '1', limit = '20' } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const filter: Record<string, unknown> = {}
    if (tab === 'featured') filter.featured = true
    if (tag) filter.tags = tag
    if (q) filter.title = { $regex: q, $options: 'i' }
    const sortMap: Record<string, string> = {
      trending: '-likeCount -viewCount',
      newest: '-createdAt',
      featured: '-createdAt',
      following: '-createdAt',
    }
    const sort = sortMap[tab as string] ?? sortMap.trending
    const posts = await Post.find(filter).sort(sort).skip(skip).limit(parseInt(limit as string))
    const total = await Post.countDocuments(filter)
    return res.json({ posts, total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) })
  } catch {
    return res.status(500).json({ error: 'Failed to fetch explore' })
  }
})

// POST /api/explore/:id/like
router.post('/:id/like', requireAuth, async (req: AuthRequest, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found' })
    const userId = req.user!.userId
    const idx = post.likedBy.indexOf(userId)
    if (idx === -1) {
      post.likedBy.push(userId)
      post.likeCount++
    } else {
      post.likedBy.splice(idx, 1)
      post.likeCount = Math.max(0, post.likeCount - 1)
    }
    await post.save()
    return res.json({ liked: idx === -1, likeCount: post.likeCount })
  } catch {
    return res.status(500).json({ error: 'Like failed' })
  }
})

// POST /api/explore/:id/fork
router.post('/:id/fork', requireAuth, async (req: AuthRequest, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found' })
    post.forkCount++
    await post.save()
    // In a real system we'd duplicate the project here and return the new projectId
    return res.json({ forkCount: post.forkCount, newProjectId: null })
  } catch {
    return res.status(500).json({ error: 'Fork failed' })
  }
})

// POST /api/explore — publish a project to explore
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = z.object({
      projectId: z.string(),
      title: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      thumbnail: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }).parse(req.body)
    const post = await Post.create({
      ...data,
      ownerId: req.user!.userId,
      ownerName: req.user!.email,
    })
    return res.status(201).json(post)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    return res.status(500).json({ error: 'Publish failed' })
  }
})

export default router
