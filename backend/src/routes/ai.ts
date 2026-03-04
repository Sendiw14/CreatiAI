import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are CreatiAI's co-creator — an AI creative intelligence embedded in a visual canvas.
Your role is to help creatives think, explore, and express ideas on their collaborative canvas.

You are:
- Generative: You actively propose ideas, not just respond to prompts
- Honest: You provide self-critique and acknowledge limitations
- Confident with appropriate uncertainty: You state your confidence level
- Multimodal-aware: You understand the canvas context (nodes, connections, themes)

Your response format:
1. Lead with your best creative response
2. Provide a brief self-critique (what's strong, what's uncertain)
3. Offer 2-3 alternative angles
4. State your confidence level (0.0-1.0) honestly

Keep responses focused, creative, and actionable.`

const thinkSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  canvasContext: z.string().optional(),
  assertiveness: z.number().min(0).max(1).optional(),
  mode: z.enum(['explore', 'refine', 'challenge', 'what-if']).optional(),
})

// POST /api/ai/think — SSE streaming
router.post('/think', requireAuth, async (req: AuthRequest, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const send = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  try {
    const body = thinkSchema.parse(req.body)
    const assertiveness = body.assertiveness ?? 0.5
    const mode = body.mode ?? 'explore'

    const modeInstruction = {
      explore: 'Explore this idea broadly, generate possibilities.',
      refine: 'Refine and strengthen the existing idea. Be precise.',
      challenge: 'Constructively challenge assumptions. Be a critical thought partner.',
      'what-if': 'Think counterfactually. Explore the unexpected.',
    }[mode]

    const systemPrompt = `${SYSTEM_PROMPT}

Current mode: ${mode} — ${modeInstruction}
Assertiveness level: ${assertiveness} (0=tentative, 1=bold)
${body.canvasContext ? `Canvas context: ${body.canvasContext}` : ''}`

    const stream = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: body.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    })

    let fullText = ''
    let inputTokens = 0
    let outputTokens = 0

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullText += event.delta.text
        send({ type: 'token', token: event.delta.text })
      } else if (event.type === 'message_start') {
        inputTokens = event.message.usage?.input_tokens ?? 0
      } else if (event.type === 'message_delta') {
        outputTokens = event.usage?.output_tokens ?? 0
      }
    }

    // Parse confidence from the response text
    const confidenceMatch = fullText.match(/confidence[:\s]+([0-9.]+)/i)
    const confidenceLevel = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.7 + (assertiveness * 0.15)

    send({
      type: 'done',
      text: fullText,
      confidenceLevel: Math.min(1, Math.max(0, confidenceLevel)),
      usage: { inputTokens, outputTokens },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      send({ type: 'error', error: err.errors[0].message })
    } else if (err instanceof Anthropic.APIError) {
      send({ type: 'error', error: `Anthropic API error: ${err.message}` })
    } else {
      send({ type: 'error', error: 'AI request failed' })
    }
  } finally {
    res.write('data: [DONE]\n\n')
    res.end()
  }
})

// POST /api/ai/what-if — branching alternative exploration
router.post('/what-if', requireAuth, async (req: AuthRequest, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  try {
    const { originalPrompt, originalResponse, variation } = z.object({
      originalPrompt: z.string(),
      originalResponse: z.string(),
      variation: z.string(),
    }).parse(req.body)

    const stream = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Original prompt: "${originalPrompt}"\nOriginal response: "${originalResponse}"\n\nNow explore this what-if variation: "${variation}"\n\nGenerate an alternative creative direction that explores this variation.`,
        },
      ],
      stream: true,
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        send({ type: 'token', token: event.delta.text })
      }
    }
  } catch (err) {
    send({ type: 'error', error: err instanceof Error ? err.message : 'What-if failed' })
  } finally {
    res.write('data: [DONE]\n\n')
    res.end()
  }
})

// POST /api/ai/suggest-connections — suggest relationships between canvas nodes
router.post('/suggest-connections', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { nodes } = z.object({
      nodes: z.array(z.object({ id: z.string(), content: z.string() })).min(2).max(20),
    }).parse(req.body)

    const prompt = `Given these canvas nodes:\n${nodes.map(n => `- "${n.content}"`).join('\n')}\n\nSuggest 3-5 meaningful conceptual connections between them. Format as JSON array: [{"from": "content snippet", "to": "content snippet", "relationship": "explanation"}]`

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      system: 'You are a creative intelligence helping map conceptual relationships.',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const connections = jsonMatch ? JSON.parse(jsonMatch[0]) : []
    res.json({ connections })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Suggestion failed' })
  }
})

export default router
