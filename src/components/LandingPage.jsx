import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, MessageCircle, NotebookPen, ArrowRight, BrainCircuit, Sparkles, Users, Zap, PenTool } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
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
        <div className="min-h-screen bg-white text-black overflow-hidden selection:bg-black selection:text-white">
            {/* Abstract Background Shapes */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-green-100 rounded-full blur-3xl opacity-40 mix-blend-multiply animate-blob" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-40 mix-blend-multiply animate-blob animation-delay-2000" />
                <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-purple-100 rounded-full blur-3xl opacity-30 mix-blend-multiply animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-12 md:py-20 lg:py-32">
                {/* Hero Section */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center max-w-4xl mx-auto mb-24 md:mb-32"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-8 border border-gray-200">
                        <div className="bg-black text-white p-1 rounded-md">
                            <PenTool size={12} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">The Ultimate Learning Platform</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-gray-900 mb-8 leading-[0.9]">
                        Learn. Create. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500">
                            Grow Together.
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Unlock your potential with collaborative quizzes, smart notes, and real-time discussions. Join the community today.
                    </motion.p>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onGetStarted}
                        className="group px-10 py-5 bg-black text-white text-lg font-bold rounded-2xl shadow-2xl hover:bg-gray-900 transition-all flex items-center justify-center gap-2 mx-auto"
                    >
                        Get Started Free
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32"
                >
                    {/* Feature 1: Quizzes */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Zap size={32} className="text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Interactive Quizzes</h3>
                        <p className="text-gray-500 leading-relaxed">
                            Challenge yourself with community-created quizzes or build your own to master any subject.
                        </p>
                    </div>

                    {/* Feature 2: Notes */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <NotebookPen size={32} className="text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Smart Notes Library</h3>
                        <p className="text-gray-500 leading-relaxed">
                            Organize your study materials securely in the cloud. Access your notes anytime, anywhere.
                        </p>
                    </div>

                    {/* Feature 3: Community */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Users size={32} className="text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Real-time Community</h3>
                        <p className="text-gray-500 leading-relaxed">
                            Connect with peers, share knowledge, and chat in real-time to solve problems together.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                        <div className="bg-black text-white p-1.5 rounded-lg">
                            <PenTool size={16} />
                        </div>
                        <span className="font-bold text-lg">Lets Try</span>
                    </div>
                    <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Lets Try. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
