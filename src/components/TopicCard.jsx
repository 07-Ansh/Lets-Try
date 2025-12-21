import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

function TopicCard({ topic, description, questionCount, onStart, disabled = false, compact = false }) {
    return (
        <motion.div
            whileHover={!disabled ? { y: -5 } : {}}
            onClick={() => !disabled && onStart && onStart()}
            className={`bg-white rounded-2xl border transition-all ${disabled ? 'opacity-50 border-gray-100 cursor-not-allowed' : 'border-gray-200 hover:border-black hover:shadow-xl cursor-pointer'
                } ${compact ? 'p-4 flex items-center justify-between gap-4' : 'p-8 flex flex-col h-full'}`}
        >
            <div className={compact ? '' : 'mb-6'}>
                <h3 className={`font-bold text-gray-900 ${compact ? 'text-lg' : 'text-2xl mb-2'}`}>{topic}</h3>
                {!compact && <p className="text-gray-500 leading-relaxed">{description}</p>}
            </div>

            <div className={`${compact ? 'flex-shrink-0' : 'mt-auto pt-6 flex items-center justify-between'}`}>
                {!compact && (
                    <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        {questionCount} Questions
                    </div>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent double triggering
                        if (!disabled && onStart) onStart();
                    }}
                    disabled={disabled}
                    className={`${compact ? 'p-3' : 'px-6 py-3'} bg-black text-white rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors ${disabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''
                        }`}
                >
                    {compact ? <Play size={18} /> : <>Start Quiz <Play size={18} /></>}
                </button>
            </div>
        </motion.div>
    );
}

export default TopicCard;
