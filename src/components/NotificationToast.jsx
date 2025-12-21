import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';

const NotificationToast = ({ notification, onClose, onClick }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // Auto close after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 20, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    className="fixed top-0 left-1/2 z-50 flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-2xl border border-gray-100 min-w-[320px] max-w-md cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => {
                        onClick();
                        onClose();
                    }}
                >
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageCircle size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">
                            {notification.title}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                            {notification.body}
                        </p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationToast;
