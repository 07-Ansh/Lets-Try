import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';

const Result = ({ score, total, onRestart }) => {
    const percentage = Math.round((score / total) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-10 max-w-md w-full mx-auto text-center border border-gray-200 shadow-xl"
        >
            <div className="inline-flex items-center justify-center p-6 rounded-full bg-gray-50 mb-8">
                <Trophy size={48} className="text-black" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {percentage >= 70 ? "Great Job!" : "Completed"}
            </h2>
            <p className="text-gray-500 mb-8">
                You scored {score} out of {total}
            </p>

            <div className="relative h-4 bg-gray-100 rounded-full mb-8 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="absolute top-0 left-0 h-full bg-black rounded-full"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-2xl">
                    <span className="block text-gray-400 text-xs font-bold uppercase tracking-wider">Percentage</span>
                    <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                    <span className="block text-gray-400 text-xs font-bold uppercase tracking-wider">Correct</span>
                    <span className="text-2xl font-bold text-gray-900">{score}</span>
                </div>
            </div>

            <button
                onClick={onRestart}
                className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
            >
                <RotateCcw size={18} />
                Try Again
            </button>
        </motion.div>
    );
};

export default Result;
