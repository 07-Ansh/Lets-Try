import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, User, BookOpen, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useUser } from '../context/UserContext';

const CommunityQuizzes = ({ onBack, onPlay }) => {
    const { user } = useUser();
    const [myQuizzes, setMyQuizzes] = useState([]);
    const [otherQuizzes, setOtherQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "quizzes"));
            const fetched = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (user) {
                setMyQuizzes(fetched.filter(q => q.createdBy === user.uid));
                setOtherQuizzes(fetched.filter(q => q.createdBy !== user.uid));
            } else {
                setOtherQuizzes(fetched);
            }
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, [user]);

    const handleDeleteQuiz = async (quizId) => {
        if (!confirm("Are you sure you want to delete this quiz? This cannot be undone.")) return;

        try {
            await deleteDoc(doc(db, "quizzes", quizId));
            // Optimistic update
            setMyQuizzes(prev => prev.filter(q => q.id !== quizId));
        } catch (error) {
            console.error("Error deleting quiz:", error);
            alert("Failed to delete quiz.");
        }
    };

    const QuizCard = ({ quiz, isMine }) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${isMine ? 'bg-black text-white' : 'bg-purple-50 text-purple-600'}`}>
                    <BookOpen size={24} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                        {quiz.questions?.length || 0} Qs
                    </span>
                    {isMine && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.id); }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Quiz"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            <h3 className="text-xl font-bold mb-2 line-clamp-1">{quiz.title}</h3>
            <p className="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[40px] flex-grow">
                {quiz.description}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                    <User size={14} />
                    <span>{quiz.authorName || "Anonymous"}</span>
                </div>
                <button
                    onClick={() => onPlay(quiz)}
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
                >
                    <Play size={14} fill="currentColor" /> Play
                </button>
            </div>
        </motion.div>
    );

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-8">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 font-bold transition-colors">
                <ArrowLeft size={20} /> Back to Menu
            </button>

            <div className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Community Quizzes</h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                    Explore and challenge yourself with quizzes created by the community, or manage your own creations.
                </p>
            </div>

            {loading ? (
                <div className="text-center text-gray-400 py-20 animate-pulse">Loading amazing quizzes...</div>
            ) : (
                <div className="space-y-16">
                    {/* My Quizzes Section */}
                    {myQuizzes.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-3">
                                <span className="bg-black text-white px-3 py-1 rounded-lg text-sm">You</span>
                                Your Created Quizzes
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {myQuizzes.map((quiz) => (
                                        <QuizCard key={quiz.id} quiz={quiz} isMine={true} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Other Quizzes Section */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-3">
                            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-sm">Community</span>
                            Trending Quizzes
                        </h2>

                        {otherQuizzes.length === 0 && myQuizzes.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium">No quizzes found yet. Be the first to create one!</p>
                            </div>
                        ) : otherQuizzes.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 italic">
                                No community quizzes yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {otherQuizzes.map((quiz) => (
                                    <QuizCard key={quiz.id} quiz={quiz} isMine={false} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityQuizzes;
