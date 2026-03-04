// ============================================================
// CORE TYPES — CreatiAI
// ============================================================

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'speculative';
export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type PipelineStage = 'draft' | 'review' | 'final';
export type RandomnessMode = 'safe' | 'balanced' | 'experimental';
export type AdaptiveMode = 'novice' | 'expert';
export type NodeType = 'text' | 'image' | 'sketch' | 'ai_generated' | 'group';
export type EdgeType = 'supports' | 'contradicts' | 'extends' | 'questions' | 'inspires';
export type InputType = 'text' | 'voice' | 'image' | 'sketch';

// ============================================================
// USER & AUTH
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  handle?: string;
  avatarUrl?: string;
  avatar?: string; // alias for avatarUrl
  role: UserRole;
  workspaceId?: string;
  projectIds?: string[];
  creativityProfile?: CreativityProfile;
  preferences: AIPreferences;
  aiPersonality?: string;
  mode?: string;
  profile?: {
    bio?: string;
    website?: string;
    location?: string;
  };
  onboardingComplete: boolean;
  verified: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export interface CreativityProfile {
  domains: string[];
  thinkingStyle: {
    structure: 'structured' | 'chaotic';
    ideaState: 'refined' | 'raw';
    aiPartnerStyle: 'gentle' | 'bold';
  };
  assertiveness: number; // 1-5
  summary?: string;
  summaryGeneratedAt?: string;
}

export interface AIPreferences {
  assertiveness: 1 | 2 | 3 | 4 | 5;
  responseStyle: 'collaborative' | 'advisory' | 'socratic';
  confidenceDisplay: 'always' | 'hover' | 'expert';
  uncertaintyCommunication: 'inline' | 'badge' | 'suppress';
  showSelfCritique: boolean;
  showPromptEvolution: boolean;
  showInfluenceChain: boolean;
  defaultRandomness: RandomnessMode;
  whatIfModeDefault: 'off' | 'opt-in' | 'always';
  fallbackBehavior: 'silent' | 'notify' | 'show_alternatives';
  showAlternativePaths: boolean;
  maxResponseLength: 'short' | 'medium' | 'long' | 'comprehensive';
  enableSessionLearning: boolean;
  enableCrossSessionLearning: boolean;
  learningDomains: string[];
  notifyAISuggestions: boolean;
  notifyCollaborators: boolean;
  notifyVersionSaved: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// ============================================================
// WORKSPACE & PROJECTS
// ============================================================

export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
  planTier: 'solo' | 'team' | 'enterprise';
  aiQuotaMonthly: number;
  aiCallsUsed: number;
  createdAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  creatorId: string;
  name: string;
  description?: string;
  status: 'active' | 'archived';
  pipelineStage: PipelineStage;
  intentTags: IntentTag[];
  canvasState?: CanvasState;
  thumbnailUrl?: string;
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
  collaborators?: Collaborator[];
  currentVersion?: string;
}

export interface IntentTag {
  mood?: string;
  goal?: string;
  audience?: string;
  label: string;
  color?: string;
}

// ============================================================
// CANVAS
// ============================================================

export interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: Viewport;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasNode {
  id: string;
  projectId: string;
  type: NodeType;
  title: string;
  content: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  intentTags: IntentTag[];
  confidenceLevel?: ConfidenceLevel;
  confidenceScore?: number;
  aiGenerated: boolean;
  createdBy: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  // ReactFlow-compatible data bag (required for ReactFlow node compatibility)
  data: Record<string, unknown>;
  // For group nodes
  children?: string[];
  // For image/sketch nodes
  imageUrl?: string;
  caption?: string;
  // Metadata
  groupId?: string;
  selected?: boolean;
}

export interface CanvasEdge {
  id: string;
  projectId: string;
  sourceId: string;
  targetId: string;
  // ReactFlow-compatible aliases
  source: string;
  target: string;
  label?: string;
  edgeType?: EdgeType;
  createdBy: string;
  createdAt: string;
}

export interface CanvasSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  timestamp: number;
}

export interface Checkpoint {
  id: string;
  projectId: string;
  versionNumber: string;
  name: string;
  snapshot: CanvasState;
  changeSummary: string;
  aiDiff?: string;
  createdBy: string;
  createdAt: string;
  isCheckpoint: boolean;
}

// ============================================================
// AI
// ============================================================

export interface AIRequest {
  projectId: string;
  prompt: string;
  inputType: InputType;
  imageUrl?: string;
  sketchDataUrl?: string;
  assertiveness: number;
  randomnessMode: RandomnessMode;
  whatIfMode: boolean;
  canvasContext: {
    nodeCount: number;
    selectedNodeIds: string[];
    recentNodeTitles: string[];
  };
  userProfile?: Partial<CreativityProfile>;
}

export interface AIResponse {
  id: string;
  text: string;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  reasoning?: string;
  influences?: AIInfluence[];
  promptEvolution?: string[];
  selfCritique?: string;
  internalQuestions?: string[];
  alternatives?: AIAlternative[];
  modelUsed: string;
  tokensUsed: number;
  latencyMs: number;
  createdAt: string;
}

export interface AIAlternative {
  id: string;
  text: string;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
}

export interface AIInfluence {
  type: 'node' | 'profile_pattern' | 'session_history' | 'randomness';
  label: string;
  value: string;
  nodeId?: string;
}

export interface AIExchange {
  id: string;
  projectId: string;
  userId: string;
  prompt: string;
  response: string;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  reasoning?: string;
  modelUsed: string;
  tokensUsed: number;
  latencyMs: number;
  createdAt: string;
}

// ============================================================
// COLLABORATION
// ============================================================

export interface Collaborator {
  id: string;
  projectId: string;
  userId: string;
  role: UserRole;
  joinedAt: string;
  lastSeenAt: string;
  user?: User;
  cursorColor?: string;
  isOnline?: boolean;
  currentActivity?: string;
}

export interface CursorPosition {
  userId: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

export interface Comment {
  id: string;
  projectId: string;
  nodeId?: string;
  authorId: string;
  author?: User;
  content: string;
  resolved: boolean;
  parentId?: string;
  replies?: Comment[];
  reactions: Record<string, string[]>;
  positionX?: number;
  positionY?: number;
  createdAt: string;
}

export interface SessionEvent {
  id: string;
  projectId: string;
  userId: string;
  eventType: string;
  payload: Record<string, unknown>;
  timestamp: string;
  sequenceNumber: number;
}

// ============================================================
// LIBRARY & EXPLORE
// ============================================================

export interface LibraryItem {
  id: string;
  workspaceId: string;
  creatorId: string;
  creator?: User;
  type: 'concept' | 'text' | 'image' | 'template' | 'ai_highlight';
  title: string;
  description?: string;
  content: Record<string, unknown>;
  tags: string[];
  scope: 'private' | 'team' | 'public';
  usageCount: number;
  originalItemId?: string;
  remixCount?: number;
  createdAt: string;
}

export interface LibraryLineageNode {
  id: string;
  item: LibraryItem;
  children: LibraryLineageNode[];
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export interface Notification {
  id: string;
  userId: string;
  type: 'ai' | 'collaboration' | 'system' | 'mention' | 'billing';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  actor?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

// ============================================================
// ADMIN
// ============================================================

export interface AdminStats {
  totalUsers: number;
  userGrowth: number;
  activeProjects: number;
  projectGrowth: number;
  aiCostThisMonth: number;
  aiCostBudget: number;
  avgConfidenceScore: number;
  liveSessionsNow: number;
  collaborationSessionsActive: number;
  systemHealth: 'operational' | 'degraded' | 'outage';
}

export interface FeatureFlag {
  id: string;
  orgId: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercent: number;
  targetGroups: string[];
  abTestConfig?: ABTestConfig;
  createdAt: string;
  updatedAt: string;
  author?: string;
}

export interface ABTestConfig {
  enabled: boolean;
  variantADescription: string;
  variantBDescription: string;
  trafficSplitPercent: number;
  successMetric: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLog {
  id: string;
  orgId: string;
  actorId: string;
  actor?: User;
  action: string;
  targetType: string;
  targetId: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  ipAddress: string;
  sessionId: string;
  createdAt: string;
}

export interface PromptVersion {
  id: string;
  name: string;
  version: string;
  content: string;
  status: 'active' | 'draft' | 'archived';
  deployedAt?: string;
  author: string;
  performanceMetrics?: {
    avgConfidence: number;
    userRating: number;
    sessionsActive: number;
  };
  createdAt: string;
}

// ============================================================
// API RESPONSE WRAPPERS
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  field?: string;
}

// ============================================================
// STORE TYPES
// ============================================================

export interface UIState {
  mode: AdaptiveMode;
  sidebarCollapsed: boolean;
  rightPanelCollapsed: boolean;
  rightPanelTab: 'properties' | 'diff' | 'connections' | 'comments';
  commandPaletteOpen: boolean;
  notificationPanelOpen: boolean;
  searchOverlayOpen: boolean;
  cookieConsentAccepted: boolean | null;
  onboardingTooltipStep: number;
  isOffline: boolean;
}
