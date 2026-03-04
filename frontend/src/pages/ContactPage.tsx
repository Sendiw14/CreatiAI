import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

const contactOptions = [
    {
        icon: '✉',
        title: 'General Inquiries',
        description: 'Questions about the product or platform',
        email: 'hello@creatiai.app',
        color: 'var(--purple)',
    },
    {
        icon: '🤝',
        title: 'Enterprise & Sales',
        description: 'Custom plans, SSO, dedicated support',
        email: 'sales@creatiai.app',
        color: 'var(--gold)',
    },
    {
        icon: '🔐',
        title: 'Privacy & Legal',
        description: 'Data requests, GDPR, legal matters',
        email: 'legal@creatiai.app',
        color: 'var(--cyan)',
    },
];

export default function ContactPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.error('Please fill in all required fields.');
            return;
        }
        setLoading(true);
        // Simulate sending — replace with real API call
        await new Promise((r) => setTimeout(r, 1200));
        setLoading(false);
        setSent(true);
        toast.success('Message sent! We\'ll get back to you within 24 hours.', { duration: 5000 });
    };

    return (
        <div className="min-h-screen bg-[var(--bg-page)] selection:bg-[var(--purple)]/30 selection:text-white">
            {/* Background gradient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute w-[600px] h-[600px] bg-[var(--purple)]/15 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
                <div className="absolute w-[400px] h-[400px] bg-[var(--gold)]/10 blur-[120px] rounded-full bottom-[10%] right-[5%]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-24">
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
                    className="mb-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--purple)] to-[var(--gold)] animate-pulse" />
                        <span className="text-xs font-mono font-medium text-[var(--text-muted)] uppercase tracking-widest">
                            Contact
                        </span>
                    </div>
                    <h1 className="font-display font-bold text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight mb-4">
                        Get in touch
                    </h1>
                    <p className="font-body text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
                        We'd love to hear from you. Our team usually responds within 24 hours.
                    </p>
                </motion.div>

                {/* Contact option cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
                >
                    {contactOptions.map((opt, i) => (
                        <motion.a
                            key={opt.title}
                            href={`mailto:${opt.email}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i + 0.2 }}
                            whileHover={{ y: -6, scale: 1.01 }}
                            className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 flex flex-col gap-3 hover:bg-white/5 hover:border-white/20 transition-all duration-300 group cursor-pointer"
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                style={{ background: `${opt.color}20`, border: `1px solid ${opt.color}30` }}
                            >
                                {opt.icon}
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-white group-hover:text-white transition-colors">
                                    {opt.title}
                                </h3>
                                <p className="font-body text-sm text-[var(--text-muted)] mt-1">{opt.description}</p>
                            </div>
                            <span className="font-mono text-xs mt-auto" style={{ color: opt.color }}>
                                {opt.email}
                            </span>
                        </motion.a>
                    ))}
                </motion.div>

                {/* Contact form */}
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                    >
                        {sent ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-6 py-8"
                            >
                                <motion.div
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-5xl"
                                >
                                    ✉
                                </motion.div>
                                <h2 className="font-display font-bold text-2xl text-white">Message sent!</h2>
                                <p className="font-body text-[var(--text-secondary)]">
                                    We'll get back to you at <strong className="text-white">{form.email}</strong> within 24 hours.
                                </p>
                                <Button variant="ghost" onClick={() => setSent(false)} className="border border-white/20">
                                    Send another message
                                </Button>
                            </motion.div>
                        ) : (
                            <>
                                <h2 className="font-display font-bold text-2xl text-white mb-8">Send us a message</h2>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Input
                                            label="Your name"
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="Jane Smith"
                                            required
                                            leftIcon={<span className="text-sm">👤</span>}
                                        />
                                        <Input
                                            label="Email address"
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="jane@company.com"
                                            required
                                            leftIcon={<span className="text-sm">✉</span>}
                                        />
                                    </div>
                                    <Input
                                        label="Subject"
                                        type="text"
                                        value={form.subject}
                                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                        placeholder="What can we help you with?"
                                    />
                                    <div className="space-y-1.5">
                                        <label className="block font-body text-sm font-medium text-[var(--text-secondary)]">
                                            Message <span className="text-[var(--error)]">*</span>
                                        </label>
                                        <textarea
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            placeholder="Tell us more about your inquiry..."
                                            required
                                            rows={5}
                                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 font-body text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--purple)]/50 focus:border-[var(--purple)]/50 transition-all duration-200 resize-none"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="gradient"
                                        fullWidth
                                        size="lg"
                                        isLoading={loading}
                                        className="shadow-[0_0_20px_rgba(157,78,221,0.3)] hover:shadow-[0_0_30px_rgba(157,78,221,0.5)]"
                                    >
                                        Send Message →
                                    </Button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
