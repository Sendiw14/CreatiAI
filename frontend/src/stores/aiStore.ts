import { create } from 'zustand';
import type {
  AIResponse, AIRequest, AIExchange, RandomnessMode, InputType
} from '../types';
import api from '../lib/api';

interface AIStore {
  isThinking: boolean;
  isStreaming: boolean;
  streamingText: string;
  selfCritiquePhase: string | null;
  currentResponse: AIResponse | null;
  responses: AIResponse[];
  exchanges: AIExchange[];
  assertiveness: 1 | 2 | 3 | 4 | 5;
  randomnessMode: RandomnessMode;
  whatIfMode: boolean;
  fallbackActive: boolean;
  fallbackReason: string | null;
  quotaUsed: number;
  quotaLimit: number;
  activeInputType: InputType;
  abortController: AbortController | null;

  sendPrompt: (request: AIRequest) => Promise<void>;
  cancelStream: () => void;
  addToCanvas: (responseId: string) => void;
  branchResponse: (responseId: string) => void;
  challengeResponse: (responseId: string) => Promise<void>;
  submitFeedback: (responseId: string, feedback: 'up' | 'down') => void;
  setAssertiveness: (level: 1 | 2 | 3 | 4 | 5) => void;
  setRandomnessMode: (mode: RandomnessMode) => void;
  setActiveInputType: (type: InputType) => void;
  toggleWhatIfMode: () => void;
  clearResponses: () => void;
  fetchExchanges: (projectId: string) => Promise<void>;
}

const selfCritiquePhases = [
  'Reviewing my own output…',
  'Evaluating coherence… ✓',
  'Checking assumptions…',
  'Calibrating confidence…',
  'Finalizing response…',
];

export const useAIStore = create<AIStore>()((set, get) => ({
  isThinking: false,
  isStreaming: false,
  streamingText: '',
  selfCritiquePhase: null,
  currentResponse: null,
  responses: [],
  exchanges: [],
  assertiveness: 3,
  randomnessMode: 'balanced',
  whatIfMode: false,
  fallbackActive: false,
  fallbackReason: null,
  quotaUsed: 0,
  quotaLimit: 50,
  activeInputType: 'text',
  abortController: null,

  sendPrompt: async (request) => {
    const { abortController: prev } = get();
    if (prev) prev.abort();
    const controller = new AbortController();
    set({
      isThinking: true,
      isStreaming: false,
      streamingText: '',
      selfCritiquePhase: selfCritiquePhases[0],
      abortController: controller,
    });

    // Cycle through self-critique phases
    let phaseIdx = 0;
    const phaseInterval = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % selfCritiquePhases.length;
      set({ selfCritiquePhase: selfCritiquePhases[phaseIdx] });
    }, 800);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/ai/think`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        }
      );

      clearInterval(phaseInterval);

      if (!response.ok) {
        if (response.status === 429) {
          set({ isThinking: false, fallbackActive: true, fallbackReason: 'rate_limit' });
          return;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      set({ isStreaming: true, isThinking: false, selfCritiquePhase: null });

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.type === 'text') {
                  accumulated += parsed.text;
                  set({ streamingText: accumulated });
                } else if (parsed.type === 'complete') {
                  const aiResponse: AIResponse = {
                    id: parsed.id || crypto.randomUUID(),
                    text: accumulated,
                    confidenceLevel: parsed.confidenceLevel || 'medium',
                    confidenceScore: parsed.confidenceScore || 70,
                    reasoning: parsed.reasoning,
                    influences: parsed.influences,
                    promptEvolution: parsed.promptEvolution,
                    selfCritique: parsed.selfCritique,
                    internalQuestions: parsed.internalQuestions,
                    alternatives: parsed.alternatives,
                    modelUsed: parsed.modelUsed || 'claude-sonnet-4-6',
                    tokensUsed: parsed.tokensUsed || 0,
                    latencyMs: parsed.latencyMs || 0,
                    createdAt: new Date().toISOString(),
                  };
                  set((s) => ({
                    currentResponse: aiResponse,
                    responses: [aiResponse, ...s.responses],
                    isStreaming: false,
                    streamingText: '',
                    quotaUsed: s.quotaUsed + 1,
                    fallbackActive: false,
                  }));
                }
              } catch {
                // parse error on chunk, skip
              }
            }
          }
        }
      }
    } catch (err: unknown) {
      clearInterval(phaseInterval);
      if ((err as Error)?.name === 'AbortError') {
        set({ isThinking: false, isStreaming: false, streamingText: '' });
        return;
      }
      set({
        isThinking: false,
        isStreaming: false,
        streamingText: '',
        selfCritiquePhase: null,
        fallbackActive: true,
        fallbackReason: 'api_error',
      });
    }
  },

  cancelStream: () => {
    const { abortController } = get();
    if (abortController) abortController.abort();
    set({ isThinking: false, isStreaming: false, streamingText: '', selfCritiquePhase: null });
  },

  addToCanvas: (_responseId) => {
    // Handled by canvas store via component
  },

  branchResponse: (_responseId) => {
    // Creates 2 divergent nodes — handled by component with canvasStore
  },

  challengeResponse: async (responseId) => {
    const response = get().responses.find((r) => r.id === responseId);
    if (!response) return;
    await get().sendPrompt({
      projectId: '',
      prompt: `Challenge this idea and find its flaws: "${response.text}"`,
      inputType: 'text',
      assertiveness: 5,
      randomnessMode: 'experimental',
      whatIfMode: true,
      canvasContext: { nodeCount: 0, selectedNodeIds: [], recentNodeTitles: [] },
    });
  },

  submitFeedback: async (responseId, feedback) => {
    try {
      await api.post(`/api/ai/exchanges/${responseId}/feedback`, { feedback });
    } catch {
      // feedback is best-effort
    }
  },

  setAssertiveness: (level) => set({ assertiveness: level }),
  setRandomnessMode: (mode) => set({ randomnessMode: mode }),
  setActiveInputType: (type) => set({ activeInputType: type }),
  toggleWhatIfMode: () => set((s) => ({ whatIfMode: !s.whatIfMode })),
  clearResponses: () => set({ responses: [], exchanges: [], currentResponse: null }),

  fetchExchanges: async (projectId) => {
    const { data } = await api.get(`/api/ai/exchanges/${projectId}`);
    set({ exchanges: data });
  },
}));
