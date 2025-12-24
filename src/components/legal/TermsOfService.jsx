import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const TermsOfService = ({ onBack }) => {
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
                <h1 className="text-3xl font-black text-gray-900">Terms of Service</h1>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl text-gray-700 text-sm font-medium">
                    <AlertCircle className="shrink-0" size={24} />
                    <p>By using "Let's Try", you agree to these terms. Please read them carefully.</p>
                </div>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">1. Acceptance of Terms</h2>
                    <p className="text-gray-600 leading-relaxed">
                        By accessing or using the "Let's Try" application, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">2. User Conduct</h2>
                    <p className="text-gray-600 leading-relaxed">
                        You are responsible for your use of the service. You agree NOT to:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Upload content that is illegal, offensive, or violates others' rights.</li>
                            <li>Use the Chat feature to harass, abuse, or spam other users.</li>
                            <li>Attempt to bypass security measures or reverse engineer the app.</li>
                            <li>Share false or misleading information in Community quizzes/notes.</li>
                        </ul>
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">3. User Content & License</h2>
                    <p className="text-gray-600 leading-relaxed">
                        <strong>Ownership:</strong> You retain ownership of the notes and quizzes you create.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        <strong>License:</strong> By making content "Public", you grant "Let's Try" and its users a non-exclusive, royalty-free license to view, use, and share that content within the platform.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">4. Service Availability</h2>
                    <p className="text-gray-600 leading-relaxed">
                        We strive to keep "Let's Try" up and running, but provided on an "AS IS" basis. We are not liable for any data loss, service interruptions, or storage failures.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">5. Termination</h2>
                    <p className="text-gray-600 leading-relaxed">
                        We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users.
                    </p>
                </section>

                <div className="pt-8 border-t border-gray-100 text-sm text-gray-400">
                    Last Updated: December 2024
                </div>
            </div>
        </motion.div>
    );
};

export default TermsOfService;
