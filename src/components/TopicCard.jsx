import React from 'react';
import { motion } from 'framer-motion';
import { Book, ArrowRight, Lock } from 'lucide-react';

const TopicCard = ({ topic, description, questionCount, onStart, disabled = false }) => {
    return (
        <motion.button
            whileHover={!disabled ? { y: -4, backgroundColor: '#ffffff' } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={!disabled ? onStart : undefined}
            className={`relative w-full text-left bg-white p-6 rounded-2xl border transition-all duration-300 group
        ${disabled
                    ? 'border-gray-100 opacity-60 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md cursor-pointer'
                }
      `}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${disabled ? 'bg-gray-100 text-gray-400' : 'bg-black text-white'}`}>
                    <Book size={24} />
                </div>
                {disabled && <Lock size={20} className="text-gray-300" />}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{topic}</h3>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">{description}</p>

            {!disabled && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-500">{questionCount} Questions</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-black group-hover:gap-3 transition-all">
                        Start
                        <ArrowRight size={16} />
                    </div>
                </div>
            )}
        </motion.button>
    );
};

export default TopicCard;
