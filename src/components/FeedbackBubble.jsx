import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const bubbleVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.5, y: -20 }
};

export default function FeedbackBubble({ isCorrect, show }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    variants={bubbleVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className={`absolute -top-16 right-0 p-4 rounded-2xl shadow-xl border-2 font-bold transform -rotate-6 z-10 ${isCorrect
                            ? 'bg-green-100 border-green-500 text-green-800'
                            : 'bg-red-100 border-red-500 text-red-800'
                        }`}
                >
                    {isCorrect ? "Doing great! 🎉" : "Uh oh... 😬"}
                    <div className={`absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-4 h-4 border-r-2 border-b-2 bg-inherit ${isCorrect ? 'border-green-500' : 'border-red-500'
                        }`}></div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
