import express from 'express'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

import authRoutes from './routes/auth'
import projectRoutes from './routes/projects'
import aiRoutes from './routes/ai'
import libraryRoutes from './routes/library'
import exploreRoutes from './routes/explore'
import shareRoutes from './routes/share'
import adminRoutes from './routes/admin'
import { verifyAccessToken } from './middleware/auth'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// ─── Socket.IO ───────────────────────────────────────────────────────────────

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})

io.use((socket, next) => {
  const token = socket.handshake.auth?.token as string | undefined
  if (!token) {
    return next(new Error('Authentication required'))
  }
  try {
    const payload = verifyAccessToken(token)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(socket as any).userId = payload.userId
    next()
  } catch {
    next(new Error('Invalid token'))
  }
})

io.on('connection', socket => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (socket as any).userId as string

  socket.on('join-project', (projectId: string) => {
    socket.join(`project:${projectId}`)
    socket.to(`project:${projectId}`).emit('user-joined', { userId, socketId: socket.id })
  })

  socket.on('cursor-move', ({ projectId, x, y }: { projectId: string; x: number; y: number }) => {
    socket.to(`project:${projectId}`).emit('cursor-update', { userId, x, y })
  })

  socket.on('node-update', ({ projectId, node }: { projectId: string; node: unknown }) => {
    socket.to(`project:${projectId}`).emit('node-update', { userId, node })
  })

  socket.on('node-delete', ({ projectId, nodeId }: { projectId: string; nodeId: string }) => {
    socket.to(`project:${projectId}`).emit('node-delete', { userId, nodeId })
  })

  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project:${projectId}`)
    socket.to(`project:${projectId}`).emit('user-left', { userId, socketId: socket.id })
  })

  socket.on('disconnect', () => {
    // Broadcast to all rooms this socket was in
    socket.rooms.forEach(room => {
      if (room.startsWith('project:')) {
        socket.to(room).emit('user-left', { userId, socketId: socket.id })
      }
    })
  })
})

// ─── Express middleware ───────────────────────────────────────────────────────

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}))

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

app.use(express.json({ limit: '10mb' }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/library', libraryRoutes)
app.use('/api/explore', exploreRoutes)
app.use('/api/share', shareRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message })
})

// ─── DB + Start ───────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '4000', 10)
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/creatiai'

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB connected')
    httpServer.listen(PORT, () => {
      console.log(`✓ CreatiAI backend running on port ${PORT}`)
    })
  })
  .catch(err => {
    console.error('✗ MongoDB connection failed:', err.message)
    console.log('  Starting without database (dev mode)...')
    httpServer.listen(PORT, () => {
      console.log(`✓ CreatiAI backend running on port ${PORT} (no DB)`)
    })
  })

export { io }
