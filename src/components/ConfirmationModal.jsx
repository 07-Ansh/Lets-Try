import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Trash2 } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
    isDanger = true
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/20 text-center"
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isDanger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                            {isDanger ? <Trash2 size={32} /> : <AlertCircle size={32} />}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            {message}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 py-3 font-bold text-white rounded-xl transition-colors shadow-lg ${isDanger
                                        ? 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/30'
                                        : 'bg-black hover:bg-gray-800 hover:shadow-gray-500/30'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
