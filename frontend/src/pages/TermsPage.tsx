import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const sections = [
    {
        title: '1. Acceptance of Terms',
        content:
            'By accessing or using CreatiAI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.',
    },
    {
        title: '2. Use of Service',
        content:
            'CreatiAI grants you a limited, non-exclusive, non-transferable license to use the platform for personal or business creative work. You agree not to misuse the service, attempt to gain unauthorized access to any portion of the service, or use it for any unlawful purpose.',
    },
    {
        title: '3. Intellectual Property',
        content:
            'You retain full ownership of all content you create using CreatiAI. We claim no intellectual property rights over the material you provide or produce. Your data is yours — we have no right to sell, share, or use it without your explicit consent.',
    },
    {
        title: '4. AI-Generated Content',
        content:
            'AI suggestions provided by CreatiAI are tools to assist your creative process. You are responsible for reviewing and taking ownership of any content you choose to publish or distribute. CreatiAI makes no guarantees about the accuracy or originality of AI suggestions.',
    },
    {
        title: '5. Privacy',
        content:
            'Your use of the service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. We do not use your canvas data or prompts to train AI models without explicit opt-in consent.',
    },
    {
        title: '6. Termination',
        content:
            'We may terminate or suspend access to the service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.',
    },
    {
        title: '7. Limitation of Liability',
        content:
            'CreatiAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.',
    },
    {
        title: '8. Changes to Terms',
        content:
            'We reserve the right to modify these terms at any time. We will notify users of significant changes via email or a prominent notice on the platform. Continued use after changes constitutes acceptance.',
    },
    {
        title: '9. Contact',
        content:
            'If you have questions about these Terms, please contact us at legal@creatiai.app.',
    },
];

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-page)] selection:bg-[var(--purple)]/30 selection:text-white">
            {/* Background gradient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute w-[600px] h-[600px] bg-[var(--purple)]/15 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
                <div className="absolute w-[400px] h-[400px] bg-[var(--cyan)]/10 blur-[120px] rounded-full bottom-[10%] right-[5%]" />
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
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)]" />
                        <span className="text-xs font-mono font-medium text-[var(--text-muted)] uppercase tracking-widest">
                            Legal
                        </span>
                    </div>
                    <h1 className="font-display font-bold text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight mb-4">
                        Terms of Service
                    </h1>
                    <p className="font-body text-lg text-[var(--text-secondary)]">
                        Last updated: February 26, 2026
                    </p>
                </motion.div>

                {/* Sections */}
                <div className="space-y-6">
                    {sections.map((section, i) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07, duration: 0.5 }}
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
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center font-body text-sm text-[var(--text-muted)]"
                >
                    Questions?{' '}
                    <Link to="/contact" className="text-[var(--cyan)] hover:underline">
                        Contact our team →
                    </Link>
                </motion.p>
            </div>
        </div>
    );
}
