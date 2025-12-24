import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = ({ onBack }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-3xl mx-auto pb-20 p-4"
        >
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-black text-gray-900">Privacy Policy</h1>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl text-green-800 text-sm font-medium">
                    <Shield className="shrink-0" size={24} />
                    <p>Your privacy is important to us. We only collect what is necessary to provide the "Let's Try" experience.</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">1. Information We Collect</h2>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        <li><strong>Account Information:</strong> When you sign up, we collect your name and email address to create and secure your account.</li>
                        <li><strong>User Content:</strong> We store the quizzes you create, the notes you upload (including files), and the messages you send in the Chat.</li>
                        <li><strong>Activity Data:</strong> We track your quiz scores and progress to provide you with your comprehensive history and statistics.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">2. How We Use Your Data</h2>
                    <p className="text-gray-600 leading-relaxed">
                        We use your information to:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Provide, maintain, and improve our services.</li>
                            <li>Facilitate the "Community" features, such as sharing quizzes and public notes.</li>
                            <li>Enable real-time communication in the Chat feature.</li>
                            <li>Calculate and display your performance analytics.</li>
                        </ul>
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">3. Sharing & Public Content</h2>
                    <p className="text-gray-600 leading-relaxed">
                        <strong>Public Notes & Quizzes:</strong> If you verify/choose to make a note or quiz "Public", it becomes accessible to all users of the "Let's Try" platform. You can change this anytime.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        <strong>Chat:</strong> Messages sent in global chat rooms are visible to all current participants.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">4. Data Storage & Security</h2>
                    <p className="text-gray-600 leading-relaxed">
                        We use Google Firebase for secure authentication and data storage. While we implement robust security measures, no method of transmission over the internet is 100% secure.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">5. Your Rights</h2>
                    <p className="text-gray-600 leading-relaxed">
                        You have the right to access, update, or delete your personal information. You can delete specific notes, quizzes, or history items directly within the app. For full account deletion, please contact support or use the delete option in Settings (if available).
                    </p>
                </section>

                <div className="pt-8 border-t border-gray-100 text-sm text-gray-400">
                    Last Updated: December 2024
                </div>
            </div>
        </motion.div>
    );
};

export default PrivacyPolicy;
