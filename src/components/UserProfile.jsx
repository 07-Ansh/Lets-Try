import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Calendar, Edit2, Save, X, Trophy, Trash2 } from 'lucide-react';

import ConfirmationModal from './ConfirmationModal';

export default function UserProfile({ onBack }) {
    const { user, updateUserProfile, deleteHistoryItem } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        gender: user?.gender || 'male'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    if (!user) return null;

    const handleSave = async () => {
        setLoading(true);
        const result = await updateUserProfile(formData);
        setLoading(false);
        if (result.success) {
            setIsEditing(false);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage(result.message || 'Error updating profile');
        }
    };

    const handleDeleteClick = (displayIndex) => {
        setItemToDelete(displayIndex);
        setDeleteModalOpen(true);
    };

    const confirmDeleteHistory = async () => {
        if (itemToDelete === null) return;

        // Calculate actual index in the original array (since we map reversed)
        const actualIndex = user.history.length - 1 - itemToDelete;
        await deleteHistoryItem(actualIndex);
        setItemToDelete(null);
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl mx-auto space-y-8"
        >
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteHistory}
                title="Delete History Item?"
                message="Are you sure you want to delete this quiz attempt from your history? This action cannot be undone."
                confirmText="Delete"
            />

            {/* Header / Profile Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <button
                        onClick={onBack}
                        className="text-gray-400 hover:text-black transition-colors font-bold text-sm"
                    >
                        Close
                    </button>
                </div>

                {/* Avatar */}
                <div className="w-32 h-32 bg-black rounded-full flex items-center justify-center text-white shrink-0 mx-auto md:mx-0">
                    <span className="text-4xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
                </div>

                {/* Details */}
                <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {isEditing ? 'Edit Profile' : 'My Profile'}
                        </h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
                            >
                                <Edit2 size={16} />
                                Edit
                            </button>
                        )}
                    </div>

                    {message && (
                        <div className={`mb-4 p-3 rounded-lg text-sm font-bold ${message.includes('Error') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                            {message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 font-medium"
                                />
                            ) : (
                                <div className="flex items-center gap-3 text-lg font-medium text-gray-900">
                                    <User size={20} className="text-gray-400" />
                                    {user.name}
                                </div>
                            )}
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Username</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 font-medium"
                                />
                            ) : (
                                <div className="flex items-center gap-3 text-lg font-medium text-gray-900">
                                    <span className="text-gray-400 font-bold">@</span>
                                    {user.username}
                                </div>
                            )}
                        </div>

                        {/* Email (Read Only) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                            <div className="flex items-center gap-3 text-lg font-medium text-gray-900 opacity-60">
                                <Mail size={20} className="text-gray-400" />
                                {user.email}
                            </div>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gender</label>
                            {isEditing ? (
                                <div className="flex gap-4">
                                    {['male', 'female'].map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setFormData({ ...formData, gender: g })}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize border ${formData.gender === g ? 'bg-black text-white border-black' : 'bg-white border-gray-200'
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-lg font-medium text-gray-900 capitalize">
                                    {user.gender}
                                </div>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 py-3 bg-black text-white rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        name: user.name,
                                        username: user.username,
                                        gender: user.gender
                                    });
                                }}
                                className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                                <X size={18} />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* History Section */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-green-100 rounded-xl text-green-600">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Quiz History</h2>
                        <p className="text-gray-500">Your past attempts and scores</p>
                    </div>
                </div>

                <div className="overflow-hidden">
                    {user.history && user.history.length > 0 ? (
                        <div className="space-y-4">
                            {[...user.history].reverse().map((attempt, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 group">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{attempt.topic}</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <Calendar size={14} />
                                            {formatDate(attempt.date)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-black">
                                                {attempt.percentage !== undefined ? attempt.percentage : Math.round((attempt.score / 10) * 100)}%
                                            </div>
                                            <div className="text-xs font-bold text-gray-400 uppercase">Score</div>
                                            {attempt.details && (
                                                <button className="text-xs font-bold text-blue-600 hover:underline mt-1 bg-transparent border-0 p-0 cursor-pointer">
                                                    Review
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteClick(index)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete from history"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // ... empty state
                        <div className="text-center py-12 text-gray-400 italic">
                            No quiz history yet. Start learning!
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
