import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const sections = [
    {
        title: 'Information We Collect',
        content:
            'We collect information you provide directly: your name, email address, and any content you create on the canvas. We also collect usage data such as features used, session duration, and error reports to improve the service.',
    },
    {
        title: 'How We Use Your Information',
        content:
            'We use your information solely to operate and improve CreatiAI. This includes authenticating your account, syncing your canvas data, providing customer support, and sending product updates you opt into. We never sell your personal data.',
    },
    {
        title: 'AI & Your Data',
        content:
            'Your prompts and canvas content are NOT used to train any AI models — including the third-party models that power CreatiAI — without your explicit opt-in consent. AI learning features (when available) operate only within your personal workspace.',
    },
    {
        title: 'Data Storage & Security',
        content:
            'Your data is stored on secure, encrypted servers. We use industry-standard encryption in transit (TLS) and at rest (AES-256). Access to production data is strictly limited and audited.',
    },
    {
        title: 'Cookies',
        content:
            'We use strictly necessary cookies to keep you logged in, and optional analytics cookies (with your consent) to understand how the product is used. You can manage cookie preferences at any time via the banner shown on your first visit.',
    },
    {
        title: 'Third-Party Services',
        content:
            'We use a limited set of trusted third-party services (e.g., cloud infrastructure, AI inference providers). These providers are contractually obligated to protect your data and are prohibited from using it for their own purposes.',
    },
    {
        title: 'Data Export & Deletion',
        content:
            'You can export all of your data at any time from your account settings. You can request account deletion by contacting us at privacy@creatiai.app. We will delete your data within 30 days.',
    },
    {
        title: 'Your Rights',
        content:
            'Depending on your location, you may have rights under GDPR, CCPA, or other regulations — including the right to access, correct, or delete your personal data. Contact us to exercise any of these rights.',
    },
    {
        title: 'Changes to This Policy',
        content:
            'We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice at least 14 days before changes take effect.',
    },
    {
        title: 'Contact',
        content:
            'For any privacy-related questions, contact us at privacy@creatiai.app or through our contact page.',
    },
];

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-page)] selection:bg-[var(--purple)]/30 selection:text-white">
            {/* Background gradient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute w-[600px] h-[600px] bg-[var(--cyan)]/15 blur-[120px] rounded-full top-[-100px] right-[-100px]" />
                <div className="absolute w-[400px] h-[400px] bg-[var(--purple)]/10 blur-[120px] rounded-full bottom-[10%] left-[5%]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
                {/* Back link */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors duration-300 mb-12 group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
                    Back to home
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--cyan)] to-[var(--purple)]" />
                        <span className="text-xs font-mono font-medium text-[var(--text-muted)] uppercase tracking-widest">
                            Privacy
                        </span>
                    </div>
                    <h1 className="font-display font-bold text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight mb-4">
                        Privacy Policy
                    </h1>
                    <p className="font-body text-lg text-[var(--text-secondary)]">
                        Last updated: February 26, 2026
                    </p>
                </motion.div>

                {/* Hero callout */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="rounded-2xl border border-[var(--cyan)]/30 bg-[var(--cyan)]/5 p-8 mb-8 shadow-[0_0_30px_rgba(8,145,178,0.1)]"
                >
                    <p className="font-body text-lg text-white leading-relaxed">
                        <span className="font-bold text-[var(--cyan)]">TL;DR:</span> Your data is yours. We don't sell it, we don't train AI on it without your permission, and you can export or delete it at any time.
                    </p>
                </motion.div>

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section, i) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06, duration: 0.5 }}
                            className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 hover:border-white/20 hover:bg-white/5 transition-all duration-300"
                        >
                            <h2 className="font-display font-bold text-xl text-white mb-3">{section.title}</h2>
                            <p className="font-body text-[var(--text-secondary)] leading-relaxed">{section.content}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Footer note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-16 text-center font-body text-sm text-[var(--text-muted)]"
                >
                    Questions?{' '}
                    <Link to="/contact" className="text-[var(--cyan)] hover:underline">
                        Contact our privacy team →
                    </Link>
                </motion.p>
            </div>
        </div>
    );
}
