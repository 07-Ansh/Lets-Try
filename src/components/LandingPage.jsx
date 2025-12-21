import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MessageCircle, NotebookPen, ArrowRight, BrainCircuit, Sparkles, Users, Zap, PenTool, CheckCircle2 } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <div className="min-h-screen bg-white text-black overflow-x-hidden selection:bg-black selection:text-white pb-10 md:pb-0">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-5%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-green-50 rounded-full blur-[80px] md:blur-[120px] opacity-60" />
                <div className="absolute bottom-[-5%] left-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-gray-50 rounded-full blur-[80px] md:blur-[120px] opacity-60" />
            </div>

            {/* Sticky Mobile Nav Header */}
            <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100/50 px-6 py-4 flex items-center justify-between md:hidden">
                <div className="flex items-center gap-2">
                    <div className="bg-black text-white p-1.5 rounded-lg shadow-lg shadow-black/10">
                        <PenTool size={18} />
                    </div>
                    <span className="font-black text-xl tracking-tight">Lets Try</span>
                </div>
                <button
                    onClick={onGetStarted}
                    className="text-sm font-bold bg-black text-white px-4 py-2 rounded-xl active:scale-95 transition-transform"
                >
                    Join
                </button>
            </header>

            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-10 md:pt-32 pb-10 md:pb-24">
                {/* Hero Section */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-left md:text-center max-w-4xl mx-auto mb-20 md:mb-32"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full mb-6 border border-green-100/50">
                        <div className="bg-green-600 text-white p-0.5 rounded-md">
                            <Sparkles size={10} />
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-green-700 uppercase tracking-wider">The Intelligent Learning Era</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-[44px] leading-[1.05] sm:text-7xl md:text-8xl font-black tracking-tighter text-gray-900 mb-6 md:mb-8">
                        Learn. Create. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-700 to-black">
                            Grow Together.
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-lg md:text-2xl text-gray-500 mb-10 max-w-xl md:mx-auto leading-tight md:leading-relaxed">
                        Master your subjects with collaborative quizzes, smart notes, and real-time discussions.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start md:items-center justify-start md:justify-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onGetStarted}
                            className="w-full sm:w-auto px-10 py-5 bg-black text-white text-lg font-bold rounded-2xl shadow-2xl shadow-black/20 flex items-center justify-center gap-2 transition-all"
                        >
                            Get Started Free
                            <ArrowRight size={20} />
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Mobile Feature Cards - App Style */}
                <div className="space-y-4 md:hidden mb-10">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Core Features</h2>
                    <FeatureCardMobile
                        icon={Zap}
                        title="Instant Quizzes"
                        desc="Build or play 100+ quizzes."
                        color="blue"
                    />
                    <FeatureCardMobile
                        icon={NotebookPen}
                        title="Smart Library"
                        desc="Cloud notes with safe access."
                        color="green"
                    />
                    <FeatureCardMobile
                        icon={Users}
                        title="Live Community"
                        desc="Real-time peer discussions."
                        color="purple"
                    />
                </div>

                {/* Desktop Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="hidden md:grid grid-cols-3 gap-8 mb-32"
                >
                    <FeatureCardDesktop icon={Zap} title="Interactive Quizzes" desc="Challenge yourself with community-created quizzes or build your own to master any subject." color="blue" />
                    <FeatureCardDesktop icon={NotebookPen} title="Smart Notes Library" desc="Organize your study materials securely in the cloud. Access your notes anytime, anywhere." color="green" />
                    <FeatureCardDesktop icon={Users} title="Real-time Community" desc="Connect with peers, share knowledge, and chat in real-time to solve problems together." color="purple" />
                </motion.div>
            </div>

            {/* Floating Mobile CTA */}
            <AnimatePresence>
                {scrolled && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-6 right-6 z-50 md:hidden"
                    >
                        <button
                            onClick={onGetStarted}
                            className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl shadow-black/40 active:scale-95 transition-transform"
                        >
                            Quick Start <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-12 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                        <div className="bg-black text-white p-1.5 rounded-lg">
                            <PenTool size={16} />
                        </div>
                        <span className="font-bold text-lg tracking-tighter">Lets Try</span>
                    </div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">© {new Date().getFullYear()} Precision Learning</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCardMobile = ({ icon: Icon, title, desc, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
    };
    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 active:bg-gray-50 transition-colors">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
                <Icon size={24} />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500">{desc}</p>
            </div>
        </div>
    );
};

const FeatureCardDesktop = ({ icon: Icon, title, desc, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
    };
    return (
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${colors[color]}`}>
                <Icon size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{desc}</p>
        </div>
    );
};

export default LandingPage;
