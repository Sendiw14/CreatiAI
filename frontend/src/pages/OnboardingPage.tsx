import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useUserStore } from '../stores/userStore';
import toast from 'react-hot-toast';

const domains = [
  { id: 'writing', label: 'Writing & Storytelling', emoji: '✍️' },
  { id: 'visual', label: 'Visual Design & Art', emoji: '🎨' },
  { id: 'music', label: 'Music & Sound', emoji: '🎵' },
  { id: 'product', label: 'Product & Strategy', emoji: '🧭' },
  { id: 'research', label: 'Research & Analysis', emoji: '🔬' },
  { id: 'marketing', label: 'Marketing & Brand', emoji: '📣' },
  { id: 'education', label: 'Education & Teaching', emoji: '📚' },
  { id: 'other', label: 'Something else', emoji: '✦' },
];

const thinkingQuestions = [
  {
    q: 'When starting a new idea, I prefer to…',
    options: [
      { id: 'structured', label: 'Start with structure and a clear plan', icon: '📐' },
      { id: 'chaotic', label: 'Dive into the chaos and figure it out', icon: '🌊' },
    ],
  },
  {
    q: 'Ideas feel best when they\'re…',
    options: [
      { id: 'refined', label: 'Refined, precise, and polished', icon: '💎' },
      { id: 'raw', label: 'Raw, evolving, and alive', icon: '🌱' },
    ],
  },
  {
    q: 'I want my AI partner to be…',
    options: [
      { id: 'gentle', label: 'A quiet, gentle nudge', icon: '🌙' },
      { id: 'bold', label: 'A bold, honest challenger', icon: '⚡' },
    ],
  },
];

const assertivenessLevels = ['Whisper', 'Gentle', 'Balanced', 'Direct', 'Opinionated'];
const assertivenessExamples = [
  'Perhaps you might consider exploring this angle…',
  'There could be an interesting direction here worth thinking about.',
  'This looks solid. Here are two directions to consider.',
  'This direction has clear potential. I recommend focusing on the core tension.',
  'This direction has a flaw — here\'s why and what I\'d do instead.',
];

const inputTypes = [
  { id: 'text', icon: '📝', label: 'Text' },
  { id: 'voice', icon: '🎙', label: 'Voice' },
  { id: 'image', icon: '🖼', label: 'Image' },
  { id: 'sketch', icon: '✏️', label: 'Sketch' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { updateProfile } = useUserStore();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [thinking, setThinking] = useState<Record<number, string>>({});
  const [assertiveness, setAssertiveness] = useState(2); // 0-indexed
  const [confidenceDisplay, setConfidenceDisplay] = useState<'always' | 'hover' | 'expert'>('always');
  const [learningEnabled, setLearningEnabled] = useState(true);
  const [firstInput, setFirstInput] = useState('');
  const [activeInputType, setActiveInputType] = useState('text');

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleDomainToggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Final step — create first project
      try {
        await updateProfile({
          onboardingComplete: true,
          creativityProfile: {
            domains: selected,
            thinkingStyle: {
              structure: (thinking[0] as 'structured' | 'chaotic') || 'chaotic',
              ideaState: (thinking[1] as 'refined' | 'raw') || 'raw',
              aiPartnerStyle: (thinking[2] as 'gentle' | 'bold') || 'gentle',
            },
            assertiveness: assertiveness + 1,
          },
          preferences: {
            assertiveness: (assertiveness + 1) as 1 | 2 | 3 | 4 | 5,
            confidenceDisplay,
            enableSessionLearning: learningEnabled,
            enableCrossSessionLearning: learningEnabled,
          } as never,
        });
        toast.success('Your creative space is ready!');
        navigate('/workspace');
      } catch {
        navigate('/workspace');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col font-body selection:bg-[var(--purple)]/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--purple)]/10 blur-[120px] rounded-full mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--cyan)]/10 blur-[120px] rounded-full mix-blend-screen animate-[pulse_8s_ease-in-out_infinite_1s]" />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5">
        <div className="h-1 bg-white/5">
          <motion.div
            className="h-full relative"
            style={{ background: 'linear-gradient(90deg, var(--purple), var(--cyan))' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/30 blur-[4px]" />
          </motion.div>
        </div>
        <div className="flex items-center justify-between px-8 py-4 max-w-4xl mx-auto">
          <span className="font-accent text-xs font-medium tracking-wider text-[var(--text-muted)] uppercase">
            Step {step + 1} of {totalSteps}
          </span>
          <button
            onClick={() => navigate('/workspace')}
            className="font-body text-xs font-medium text-[var(--text-muted)] hover:text-white transition-colors duration-300"
          >
            Skip for now
          </button>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-6 pt-24 pb-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-3xl"
          >
            {/* ── Step 0: Domain selection ── */}
            {step === 0 && (
              <div className="space-y-10">
                <div className="text-center space-y-4">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-display font-bold text-4xl md:text-5xl text-white tracking-tight"
                  >
                    What kind of creator are you?
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-body text-lg text-[var(--text-muted)] max-w-xl mx-auto"
                  >
                    Select everything that feels like you. You can always change this later.
                  </motion.p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {domains.map((domain, i) => (
                    <motion.button
                      key={domain.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDomainToggle(domain.id)}
                      className={`group flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                        selected.includes(domain.id)
                          ? 'border-[var(--purple)] bg-[var(--purple)]/10 shadow-[0_0_30px_rgba(157,78,221,0.2)]'
                          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
                      }`}
                      aria-pressed={selected.includes(domain.id)}
                    >
                      <span className="text-4xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">{domain.emoji}</span>
                      <span className={`font-body text-sm font-medium text-center transition-colors duration-300 ${
                        selected.includes(domain.id) ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-white/90'
                      }`}>
                        {domain.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center pt-4"
                >
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={handleContinue}
                    disabled={selected.length === 0}
                    className="min-w-[200px] shadow-[0_0_20px_rgba(157,78,221,0.3)]"
                  >
                    Continue <span className="ml-2">→</span>
                  </Button>
                </motion.div>
              </div>
            )}

            {/* ── Step 1: How do you think ── */}
            {step === 1 && (
              <div className="space-y-10">
                <div className="text-center space-y-4">
                  <h1 className="font-display font-bold text-4xl md:text-5xl text-white tracking-tight">
                    Tell us how your mind works.
                  </h1>
                  <p className="font-body text-lg text-[var(--text-muted)] max-w-xl mx-auto">
                    3 quick questions to personalize your AI partner.
                  </p>
                </div>
                <div className="space-y-8 max-w-2xl mx-auto">
                  {thinkingQuestions.map((question, qi) => (
                    <motion.div 
                      key={qi} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: qi * 0.1 }}
                      className="space-y-4"
                    >
                      <p className="font-body font-medium text-lg text-white/90">{question.q}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {question.options.map((opt) => (
                          <motion.button
                            key={opt.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setThinking((prev) => ({ ...prev, [qi]: opt.id }))}
                            className={`group p-5 rounded-2xl border text-left flex items-center gap-4 backdrop-blur-xl transition-all duration-300 ${
                              thinking[qi] === opt.id
                                ? 'border-[var(--cyan)] bg-[var(--cyan)]/10 shadow-[0_0_20px_rgba(0,229,255,0.15)]'
                                : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                            }`}
                            aria-pressed={thinking[qi] === opt.id}
                          >
                            <span className="text-3xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">{opt.icon}</span>
                            <span className={`font-body text-sm font-medium leading-snug transition-colors duration-300 ${
                              thinking[qi] === opt.id ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-white/90'
                            }`}>
                              {opt.label}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 pt-4">
                  <Button variant="ghost" onClick={() => setStep(0)} className="hover:bg-white/5">← Back</Button>
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={handleContinue}
                    disabled={Object.keys(thinking).length < 3}
                    className="min-w-[200px]"
                  >
                    Continue <span className="ml-2">→</span>
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 2: AI personality ── */}
            {step === 2 && (
              <div className="space-y-10 max-w-2xl mx-auto">
                <div className="text-center space-y-4">
                  <h1 className="font-display font-bold text-4xl md:text-5xl text-white tracking-tight">
                    Customize your creative partner.
                  </h1>
                  <p className="font-body text-lg text-[var(--text-muted)]">
                    You can change any of these in your preferences anytime.
                  </p>
                </div>

                <div className="space-y-10 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                  {/* Assertiveness slider */}
                  <div className="space-y-6">
                    <label className="font-body font-semibold text-lg text-white flex items-center gap-2">
                      Assertiveness Level
                      <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-white/10 text-[var(--text-muted)]">AI Voice</span>
                    </label>
                    <div className="space-y-4">
                      <div className="flex justify-between px-1">
                        {assertivenessLevels.map((level, i) => (
                          <button
                            key={level}
                            onClick={() => setAssertiveness(i)}
                            className={`font-accent text-xs font-medium transition-all duration-300 ${
                              assertiveness === i
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)] scale-110'
                                : 'text-[var(--text-muted)] hover:text-white/80'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                      <div className="relative h-3 rounded-full bg-black/40 border border-white/5 shadow-inner">
                        <motion.div
                          className="absolute h-full rounded-full shadow-[0_0_15px_rgba(157,78,221,0.5)]"
                          style={{
                            background: 'linear-gradient(90deg, var(--purple), var(--cyan))',
                          }}
                          animate={{ width: `${(assertiveness / 4) * 100}%` }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={4}
                          value={assertiveness}
                          onChange={(e) => setAssertiveness(Number(e.target.value))}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full"
                          aria-label="Assertiveness level"
                        />
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={assertiveness}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="relative overflow-hidden rounded-xl bg-black/20 border border-white/5 p-4"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--purple)] to-[var(--cyan)]" />
                          <p className="font-mono text-sm text-[var(--text-secondary)] italic pl-2">
                            "{assertivenessExamples[assertiveness]}"
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  <hr className="border-white/10" />

                  {/* Confidence display */}
                  <div className="space-y-4">
                    <label className="font-body font-semibold text-lg text-white">
                      Confidence Display
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'always', label: 'Always visible', icon: '👁️' },
                        { id: 'hover', label: 'On hover', icon: '🖱️' },
                        { id: 'expert', label: 'Expert mode only', icon: '⚡' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setConfidenceDisplay(opt.id as never)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                            confidenceDisplay === opt.id
                              ? 'border-[var(--gold)] bg-[var(--gold)]/10 shadow-[0_0_20px_rgba(255,215,0,0.1)]'
                              : 'border-white/10 bg-black/20 hover:border-white/30 hover:bg-white/5'
                          }`}
                        >
                          <span className="text-xl">{opt.icon}</span>
                          <span className={`font-body text-xs font-medium ${
                            confidenceDisplay === opt.id ? 'text-white' : 'text-[var(--text-muted)]'
                          }`}>
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-white/10" />

                  {/* Learning toggle */}
                  <div
                    className={`group p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      learningEnabled
                        ? 'border-[var(--cyan)] bg-[var(--cyan)]/10 shadow-[0_0_20px_rgba(0,229,255,0.1)]'
                        : 'border-white/10 bg-black/20 hover:border-white/30'
                    }`}
                    onClick={() => setLearningEnabled(!learningEnabled)}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className={`font-body font-semibold text-base transition-colors ${
                          learningEnabled ? 'text-white' : 'text-white/80 group-hover:text-white'
                        }`}>
                          Allow CreatiAI to learn from my feedback
                        </p>
                        <p className="mt-2 font-body text-sm text-[var(--text-muted)] leading-relaxed">
                          Your 👍/👎 ratings and usage patterns help personalize future suggestions.
                          Your data never trains Anthropic's models. Disable anytime.
                        </p>
                      </div>
                      <div
                        className={`w-14 h-7 rounded-full transition-colors duration-300 flex items-center px-1 shrink-0 shadow-inner ${
                          learningEnabled ? 'bg-[var(--cyan)]' : 'bg-white/10'
                        }`}
                      >
                        <motion.div
                          className="w-5 h-5 bg-white rounded-full shadow-md"
                          animate={{ x: learningEnabled ? 28 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="hover:bg-white/5">← Back</Button>
                  <Button variant="gradient" size="lg" onClick={handleContinue} className="min-w-[200px]">
                    Continue <span className="ml-2">→</span>
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3: First canvas ── */}
            {step === 3 && (
              <div className="space-y-10 max-w-3xl mx-auto">
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="w-20 h-20 mx-auto bg-gradient-to-br from-[var(--purple)] to-[var(--cyan)] rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(157,78,221,0.4)] mb-6"
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </motion.div>
                  <h1 className="font-display font-bold text-4xl md:text-5xl text-white tracking-tight">
                    Your creative space is ready.
                  </h1>
                  <p className="font-body text-lg text-[var(--text-muted)]">
                    Start with a thought. Any thought.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-[0_16px_40px_rgba(0,0,0,0.3)] space-y-8 relative overflow-hidden">
                  {/* Decorative glow inside card */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[var(--purple)]/10 blur-[60px] pointer-events-none" />

                  {/* Input type tabs */}
                  <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5 relative z-10">
                    {inputTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setActiveInputType(type.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          activeInputType === type.id
                            ? 'bg-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
                            : 'text-[var(--text-muted)] hover:text-white/80 hover:bg-white/5'
                        }`}
                      >
                        <span className="text-lg">{type.icon}</span>
                        <span className="hidden sm:inline">{type.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="relative z-10 bg-black/20 rounded-2xl border border-white/5 p-6 focus-within:border-[var(--purple)]/50 focus-within:bg-black/40 transition-all duration-300 shadow-inner">
                    {activeInputType === 'text' && (
                      <textarea
                        className="w-full h-40 bg-transparent resize-none font-body text-lg text-white placeholder:text-[var(--text-muted)] focus:outline-none"
                        placeholder="What's been on your mind? A project, a problem, a question, an image…"
                        value={firstInput}
                        onChange={(e) => setFirstInput(e.target.value)}
                        autoFocus
                      />
                    )}
                    {activeInputType !== 'text' && (
                      <div className="h-40 flex flex-col items-center justify-center gap-4 text-[var(--text-muted)] font-body">
                        <span className="text-4xl opacity-50">
                          {activeInputType === 'voice' && '🎙'}
                          {activeInputType === 'image' && '🖼'}
                          {activeInputType === 'sketch' && '✏️'}
                        </span>
                        <p className="text-sm font-medium">
                          {activeInputType === 'voice' && 'Click mic to start recording'}
                          {activeInputType === 'image' && 'Drop an image or paste a URL'}
                          {activeInputType === 'sketch' && 'Drawing canvas will open on the canvas page'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-4 pt-2 relative z-10">
                    <Button variant="ghost" onClick={() => setStep(2)} className="hover:bg-white/5">← Back</Button>
                    <Button
                      variant="gradient"
                      size="lg"
                      onClick={handleContinue}
                      disabled={activeInputType === 'text' && !firstInput.trim()}
                      className="min-w-[240px] shadow-[0_0_30px_rgba(157,78,221,0.4)]"
                    >
                      Let's begin <span className="ml-2">→</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
