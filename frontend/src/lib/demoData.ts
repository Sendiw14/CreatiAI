// ============================================================
// DEMO MODE — Mock data & API interceptor
// Provides realistic data for the entire app without a backend.
// ============================================================

import type { AxiosRequestConfig } from 'axios';

// ─── Demo User ──────────────────────────────────────────────

const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@creatiai.com',
  name: 'Alex Demo',
  displayName: 'Alex Demo',
  handle: 'alexdemo',
  role: 'admin',
  plan: 'pro',
  status: 'active',
  onboardingComplete: true,
  verified: true,
  bio: 'Creative director exploring the intersection of AI and design.',
  profile: {
    bio: 'Creative director exploring the intersection of AI and design.',
    website: 'https://creatiai.com',
    location: 'San Francisco, CA',
  },
  preferences: {
    assertiveness: 3,
    responseStyle: 'collaborative',
    confidenceDisplay: 'always',
    uncertaintyCommunication: 'inline',
    showSelfCritique: true,
    showPromptEvolution: false,
    showInfluenceChain: true,
    defaultRandomness: 'balanced',
    whatIfModeDefault: 'opt-in',
    fallbackBehavior: 'notify',
    showAlternativePaths: true,
    maxResponseLength: 'medium',
    enableSessionLearning: true,
    enableCrossSessionLearning: true,
    learningDomains: ['tone', 'structure', 'domain', 'collaboration'],
    notifyAISuggestions: true,
    notifyCollaborators: true,
    notifyVersionSaved: true,
  },
  creativityProfile: {
    domains: ['visual', 'product', 'writing'],
    thinkingStyle: {
      structure: 'chaotic',
      ideaState: 'raw',
      aiPartnerStyle: 'bold',
    },
    assertiveness: 3,
    summary: 'A visual thinker who thrives in creative chaos. Prefers bold AI suggestions.',
  },
  createdAt: '2025-06-15T10:00:00.000Z',
  lastActiveAt: new Date().toISOString(),
};

// ─── Demo Projects ──────────────────────────────────────────

const DEMO_PROJECTS = [
  {
    id: 'demo-proj-1',
    workspaceId: 'demo-ws-001',
    creatorId: 'demo-user-001',
    name: 'Brand Strategy 2026',
    description: 'Comprehensive brand identity refresh with AI-driven mood boards and copy generation.',
    status: 'active',
    pipelineStage: 'review',
    intentTags: [
      { label: 'Branding', mood: 'energetic', goal: 'rebrand', color: '#9333EA' },
      { label: 'Strategy', goal: 'growth', color: '#0891B2' },
    ],
    thumbnailUrl: undefined,
    isPublic: false,
    createdAt: '2025-12-10T09:00:00.000Z',
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    collaborators: [
      { userId: 'demo-user-002', displayName: 'Jordan Lee', role: 'editor' },
      { userId: 'demo-user-003', displayName: 'Sam Rivera', role: 'viewer' },
    ],
  },
  {
    id: 'demo-proj-2',
    workspaceId: 'demo-ws-001',
    creatorId: 'demo-user-001',
    name: 'Product Launch Campaign',
    description: 'Multi-channel campaign with AI-generated ad copy, visual assets, and audience targeting.',
    status: 'active',
    pipelineStage: 'draft',
    intentTags: [
      { label: 'Marketing', mood: 'bold', goal: 'launch', color: '#D97706' },
      { label: 'Social Media', goal: 'engagement', color: '#059669' },
    ],
    thumbnailUrl: undefined,
    isPublic: false,
    createdAt: '2026-01-05T14:00:00.000Z',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    collaborators: [],
  },
  {
    id: 'demo-proj-3',
    workspaceId: 'demo-ws-001',
    creatorId: 'demo-user-001',
    name: 'Short Film Script — "Echoes"',
    description: 'Sci-fi short film screenplay exploring memory, identity, and AI consciousness.',
    status: 'active',
    pipelineStage: 'draft',
    intentTags: [
      { label: 'Screenwriting', mood: 'contemplative', color: '#7C3AED' },
      { label: 'Sci-Fi', goal: 'storytelling', color: '#06B6D4' },
    ],
    thumbnailUrl: undefined,
    isPublic: true,
    shareToken: 'demo-share-xyz',
    createdAt: '2026-02-01T11:30:00.000Z',
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    collaborators: [
      { userId: 'demo-user-004', displayName: 'Taylor Kim', role: 'editor' },
    ],
  },
  {
    id: 'demo-proj-4',
    workspaceId: 'demo-ws-001',
    creatorId: 'demo-user-001',
    name: 'UX Research Notes',
    description: 'User interview synthesis and insight mapping for the CreatiAI dashboard redesign.',
    status: 'active',
    pipelineStage: 'final',
    intentTags: [
      { label: 'UX Research', mood: 'analytical', color: '#0891B2' },
    ],
    thumbnailUrl: undefined,
    isPublic: false,
    createdAt: '2025-11-20T08:00:00.000Z',
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    collaborators: [],
  },
  {
    id: 'demo-proj-5',
    workspaceId: 'demo-ws-001',
    creatorId: 'demo-user-001',
    name: 'Podcast Episode Outlines',
    description: 'Structured outlines and talking points for "Design Futures" podcast episodes.',
    status: 'archived',
    pipelineStage: 'final',
    intentTags: [
      { label: 'Content', mood: 'conversational', color: '#D97706' },
    ],
    thumbnailUrl: undefined,
    isPublic: false,
    createdAt: '2025-09-12T16:00:00.000Z',
    updatedAt: '2025-12-01T10:00:00.000Z',
    collaborators: [],
  },
];

// ─── Demo Notifications ─────────────────────────────────────

const DEMO_NOTIFICATIONS = [
  { id: 'n1', type: 'ai_suggestion', title: 'AI has new suggestions', message: 'CreatiAI generated 3 alternative directions for "Brand Strategy 2026".', read: false, createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: 'n2', type: 'collaboration', title: 'Jordan joined your project', message: 'Jordan Lee started editing "Brand Strategy 2026".', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n3', type: 'version', title: 'Version auto-saved', message: 'A new version of "Short Film Script — Echoes" was saved.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'n4', type: 'system', title: 'Welcome to CreatiAI!', message: 'You\'re exploring demo mode. Feel free to click around and explore all features.', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
];

// ─── Demo Library Items ─────────────────────────────────────

const DEMO_LIBRARY = [
  { id: 'lib-1', title: 'Brand Mood Board — Neon Futurism', type: 'image', projectId: 'demo-proj-1', createdAt: '2026-01-20T10:00:00.000Z', tags: ['branding', 'visual'] },
  { id: 'lib-2', title: 'Campaign Copy Variants', type: 'text', projectId: 'demo-proj-2', createdAt: '2026-01-15T14:30:00.000Z', tags: ['marketing', 'copy'] },
  { id: 'lib-3', title: 'Character Backstory — Ada', type: 'text', projectId: 'demo-proj-3', createdAt: '2026-02-10T09:00:00.000Z', tags: ['screenwriting', 'character'] },
  { id: 'lib-4', title: 'User Journey Map', type: 'image', projectId: 'demo-proj-4', createdAt: '2025-11-25T11:00:00.000Z', tags: ['ux', 'research'] },
  { id: 'lib-5', title: 'AI Prompt Templates', type: 'text', projectId: null, createdAt: '2025-10-01T08:00:00.000Z', tags: ['ai', 'templates'] },
];

// ─── Demo Explore Items ─────────────────────────────────────

const DEMO_EXPLORE = [
  { id: 'exp-1', title: 'Generative Art Exploration', creator: 'Maya Chen', likes: 342, isPublic: true, thumbnailUrl: undefined, createdAt: '2026-02-10T10:00:00.000Z', tags: ['art', 'generative'] },
  { id: 'exp-2', title: 'AI-Powered Brand Kit', creator: 'Noah Patel', likes: 218, isPublic: true, thumbnailUrl: undefined, createdAt: '2026-02-05T14:00:00.000Z', tags: ['branding', 'ai'] },
  { id: 'exp-3', title: 'Interactive Story: The Last Signal', creator: 'Aria Gomez', likes: 567, isPublic: true, thumbnailUrl: undefined, createdAt: '2026-01-28T09:00:00.000Z', tags: ['storytelling', 'interactive'] },
  { id: 'exp-4', title: 'UX Teardown: Travel Apps', creator: 'Liam O\'Brien', likes: 134, isPublic: true, thumbnailUrl: undefined, createdAt: '2026-01-20T11:00:00.000Z', tags: ['ux', 'analysis'] },
];

// ─── Demo Canvas State ──────────────────────────────────────

const DEMO_CANVAS = {
  id: 'canvas-demo-1',
  nodes: [
    {
      id: 'node-1',
      type: 'text',
      position: { x: 100, y: 100 },
      data: {
        content: 'Welcome to CreatiAI! This is your creative canvas.\n\nTry clicking around, adding nodes, and exploring the AI tools in the sidebar.',
        title: 'Getting Started',
      },
      width: 320,
      height: 200,
    },
    {
      id: 'node-2',
      type: 'ai_generated',
      position: { x: 500, y: 150 },
      data: {
        content: 'Here\'s an AI-generated insight: Your brand strategy could benefit from a bolder color palette. Consider neon accents against dark backgrounds for a futuristic feel.',
        title: 'AI Suggestion',
        confidence: 'high',
      },
      width: 300,
      height: 180,
    },
    {
      id: 'node-3',
      type: 'text',
      position: { x: 300, y: 400 },
      data: {
        content: 'Key themes:\n• Innovation\n• Accessibility\n• Human-AI collaboration\n• Creative empowerment',
        title: 'Core Themes',
      },
      width: 280,
      height: 160,
    },
  ],
  edges: [
    { id: 'e1', source: 'node-1', target: 'node-2', type: 'extends' },
    { id: 'e2', source: 'node-1', target: 'node-3', type: 'supports' },
  ],
  viewport: { x: 0, y: 0, zoom: 1 },
};

// ─── Demo Version History ───────────────────────────────────

const DEMO_VERSIONS = [
  { id: 'v5', label: 'Current', createdAt: new Date(Date.now() - 3600000).toISOString(), createdBy: 'Alex Demo', changes: 12 },
  { id: 'v4', label: 'After AI brainstorm', createdAt: new Date(Date.now() - 86400000).toISOString(), createdBy: 'Alex Demo', changes: 8 },
  { id: 'v3', label: 'Jordan\'s feedback', createdAt: new Date(Date.now() - 172800000).toISOString(), createdBy: 'Jordan Lee', changes: 5 },
  { id: 'v2', label: 'Initial structure', createdAt: new Date(Date.now() - 604800000).toISOString(), createdBy: 'Alex Demo', changes: 15 },
  { id: 'v1', label: 'First draft', createdAt: new Date(Date.now() - 1209600000).toISOString(), createdBy: 'Alex Demo', changes: 0 },
];

// ─── Demo AI Response ───────────────────────────────────────

const DEMO_AI_RESPONSE = {
  id: 'ai-resp-1',
  content: 'Based on your creative brief, here are three directions to consider:\n\n**1. Neon Futurism** — Bold gradients, dark backgrounds, glowing accents. Speaks to innovation and forward-thinking.\n\n**2. Organic Minimalism** — Soft earth tones, natural textures, generous whitespace. Conveys trust and approachability.\n\n**3. Retro Revival** — Vintage typography, warm palette, halftone patterns. Creates nostalgia while feeling fresh.\n\nI\'d recommend Direction 1 for its alignment with your "innovation" and "empowerment" themes. Want me to explore any of these further?',
  confidence: 'high',
  model: 'claude-3.5-sonnet',
  tokens: 247,
};

// ─── Mock Response Factory ──────────────────────────────────

function mockResponse(data: unknown, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as AxiosRequestConfig,
  };
}

// ─── Demo Interceptor ───────────────────────────────────────

export function demoInterceptor(config: AxiosRequestConfig) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  // ── Auth routes ──
  if (url.includes('/api/auth/me') || url.includes('/api/users/me')) {
    return mockResponse(DEMO_USER);
  }
  if (url.includes('/api/auth/logout')) {
    return mockResponse({ message: 'Logged out' });
  }
  if (url.includes('/api/auth/refresh')) {
    return mockResponse({ accessToken: 'demo-token', refreshToken: 'demo-refresh' });
  }

  // ── Projects ──
  if (url.match(/\/projects\/?$/) && method === 'get') {
    return mockResponse({ data: DEMO_PROJECTS });
  }
  if (url.match(/\/projects\/?$/) && method === 'post') {
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    const newProject = {
      id: `demo-proj-${Date.now()}`,
      workspaceId: 'demo-ws-001',
      creatorId: 'demo-user-001',
      name: body?.title || 'Untitled Project',
      description: '',
      status: 'active',
      pipelineStage: 'draft',
      intentTags: [],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      collaborators: [],
    };
    return mockResponse({ data: newProject });
  }
  if (url.match(/\/projects\/[\w-]+$/) && method === 'get') {
    const projectId = url.split('/').pop();
    const project = DEMO_PROJECTS.find(p => p.id === projectId) || DEMO_PROJECTS[0];
    return mockResponse({ data: { ...project, canvasState: DEMO_CANVAS } });
  }
  if (url.match(/\/projects\/[\w-]+$/) && method === 'delete') {
    return mockResponse({ message: 'Deleted' });
  }
  if (url.match(/\/projects\/[\w-]+/) && (method === 'patch' || method === 'put')) {
    return mockResponse({ data: DEMO_PROJECTS[0] });
  }

  // ── Versions ──
  if (url.includes('/versions') || url.includes('/history')) {
    return mockResponse({ data: DEMO_VERSIONS });
  }

  // ── AI ──
  if (url.includes('/api/ai')) {
    return mockResponse({ data: DEMO_AI_RESPONSE });
  }

  // ── Library ──
  if (url.includes('/api/library')) {
    return mockResponse({ data: DEMO_LIBRARY });
  }

  // ── Explore ──
  if (url.includes('/api/explore')) {
    return mockResponse({ data: DEMO_EXPLORE });
  }

  // ── Notifications ──
  if (url.includes('/notifications')) {
    return mockResponse({ data: DEMO_NOTIFICATIONS });
  }

  // ── Admin routes ──
  if (url.includes('/api/admin') || url.includes('/admin')) {
    // Admin pages use mock data internally, so just return empty success
    return mockResponse({ data: {} });
  }

  // ── Share ──
  if (url.includes('/api/share')) {
    return mockResponse({ data: { token: 'demo-share-xyz', project: DEMO_PROJECTS[2] } });
  }

  // ── User profile updates ──
  if (url.includes('/api/users') && (method === 'patch' || method === 'put')) {
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    return mockResponse({ ...DEMO_USER, ...body });
  }

  // ── Catch-all: return empty success ──
  return mockResponse({ data: {} });
}
