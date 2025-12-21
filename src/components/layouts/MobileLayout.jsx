import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PenTool, MessageCircle, NotebookPen, User, LogOut, Plus, BookOpen, Settings, Play, ArrowRight, Grid, Home, List, History, Search
} from 'lucide-react';
import CreateQuiz from '../CreateQuiz';
import CommunityQuizzes from '../CommunityQuizzes';
import TopicCard from '../TopicCard';
import Quiz from '../Quiz';
import Result from '../Result';
import Login from '../auth/Login';
import Signup from '../auth/Signup';
import UserProfile from '../UserProfile';
import Notes from '../Notes';
import LandingPage from '../LandingPage';
import Chat from '../Chat';
import NotificationToast from '../NotificationToast';
import { allQuizzes } from '../../data/quizzes';

// Animation variants for transitions
const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

function MobileLayout({
    user,
    screen,
    setScreen,
    activeSection,
    setActiveSection,
    notification,
    setNotification,
    handleLogout,
    handleTopicSelect,
    startQuiz,
    finishQuiz,
    restartQuiz,
    currentTopic,
    questionCount,
    setQuestionCount,
    quizQuestions,
    score,
    userAnswers,
}) {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Search Logic
    const filteredQuizzes = searchQuery
        ? allQuizzes.filter(q =>
            q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    const handleSearchResultClick = (quiz) => {
        handleTopicSelect(quiz.id);
        setSearchOpen(false);
        setSearchQuery('');
        setScreen('home');
        setActiveSection('quiz');
    };

    // Determine if we should show the bottom navigation
    const isFullScreenTask = ['quiz', 'result', 'config', 'login', 'signup'].includes(screen);
    // Also hide if valid user is not present (Landing Page)
    const showBottomNav = user && !isFullScreenTask;

    // Custom Navigation Item Component
    const NavItem = ({ icon: Icon, label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${isActive ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px]">{label}</span>
        </button>
    );

    return (
        <div className="h-screen overflow-hidden bg-gray-50 text-gray-800 font-sans flex flex-col">

            {/* Header - Simplified for Mobile */}
            {!isFullScreenTask && screen !== 'chat' && user && (
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-2" onClick={() => { setScreen('home'); setActiveSection('quiz'); }}>
                        <div className="bg-black text-white p-1.5 rounded-lg">
                            <PenTool size={18} />
                        </div>
                        <h1 className="text-lg font-bold tracking-tight">Let's Try</h1>
                    </div>

                    <div className="flex items-center gap-2 relative">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center font-bold text-sm text-gray-700 active:scale-95 transition-transform"
                        >
                            <Search size={18} />
                        </button>

                        <button
                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                            className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center font-bold text-sm text-gray-700 active:scale-95 transition-transform"
                        >
                            {user.name.charAt(0)}
                        </button>

                        <AnimatePresence>
                            {profileMenuOpen && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setProfileMenuOpen(false)}
                                        className="fixed inset-0 z-40 bg-black/5"
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50"
                                    >
                                        <button
                                            onClick={() => {
                                                setProfileMenuOpen(false);
                                                setScreen('home');
                                                setActiveSection('profile');
                                            }}
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                                                <History size={16} />
                                            </div>
                                            History
                                        </button>
                                        <div className="h-px bg-gray-50 mx-2 my-1" />
                                        <button
                                            onClick={() => {
                                                setProfileMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
                                                <LogOut size={16} />
                                            </div>
                                            Log out
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </header>
            )}

            {/* Global Search Overlay for Mobile */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-white flex flex-col"
                    >
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                            <button
                                onClick={() => setSearchOpen(false)}
                                className="p-2 -ml-2 text-gray-500 rounded-full hover:bg-gray-100"
                            >
                                <ArrowRight size={20} className="rotate-180" />
                            </button>
                            <div className="flex-1 bg-gray-100 rounded-xl flex items-center px-4 py-3 gap-2">
                                <Search size={18} className="text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent text-sm w-full outline-none placeholder:text-gray-400"
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {!searchQuery ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    <p className="mb-2">Start typing to search...</p>
                                    <p className="text-xs text-gray-300">Quizzes, Notes, People</p>
                                </div>
                            ) : (
                                <>
                                    {filteredQuizzes.length > 0 ? (
                                        <div className="space-y-3">
                                            <h3 className="px-2 text-xs font-bold text-gray-400 uppercase">Quizzes</h3>
                                            {filteredQuizzes.map(quiz => (
                                                <button
                                                    key={quiz.id}
                                                    onClick={() => handleSearchResultClick(quiz)}
                                                    className="w-full flex items-center gap-4 p-3 bg-gray-50 rounded-2xl active:scale-95 transition-transform text-left"
                                                >
                                                    <div className={`p-3 rounded-xl ${quiz.color ? quiz.color.replace('text-', 'bg-').replace('600', '100') : 'bg-gray-100'} ${quiz.color || 'text-gray-600'}`}>
                                                        {quiz.icon ? <quiz.icon size={20} /> : <BookOpen size={20} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{quiz.title}</h4>
                                                        <p className="text-xs text-gray-500 line-clamp-1">{quiz.description}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center text-gray-400">
                                            No results found.
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area - Scrollable */}
            <main className={`flex-1 relative w-full touch-pan-y ${screen === 'chat' ? 'overflow-hidden pb-[60px]' : 'overflow-y-auto overflow-x-hidden pb-24'}`}>
                <AnimatePresence mode="wait">
                    {/* Auth Screens */}
                    {screen === 'login' && (
                        <Login key="login" onSwitchToSignup={() => setScreen('signup')} onLoginSuccess={() => setScreen('home')} />
                    )}
                    {screen === 'signup' && (
                        <Signup key="signup" onSwitchToLogin={() => setScreen('login')} onSignupSuccess={() => setScreen('home')} />
                    )}

                    {/* Landing Page */}
                    {!user && screen === 'home' && (
                        <LandingPage key="landing" onGetStarted={() => setScreen('login')} />
                    )}

                    {/* App Screens */}
                    {user && (
                        <>
                            {/* Home Screen Logic */}
                            {screen === 'home' && (
                                <motion.div
                                    key="home-content"
                                    className="p-4 space-y-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {/* Home Sections */}
                                    {activeSection === 'quiz' && (
                                        <div className="space-y-6">
                                            {/* Welcome / Dashboard Card */}
                                            <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-xl shadow-gray-200">
                                                <h2 className="text-2xl font-bold mb-2 text-gray-900">Hello, {user.name}!</h2>
                                                <p className="text-gray-500 text-sm mb-6">Ready to challenge yourself today?</p>

                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => setActiveSection('create')}
                                                        className="flex-1 bg-white text-green-700 border-2 border-green-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-green-50"
                                                    >
                                                        <Plus size={16} /> Create
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveSection('community')}
                                                        className="flex-1 bg-white text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 border-black active:scale-95 transition-transform hover:bg-gray-50"
                                                    >
                                                        <BookOpen size={16} /> Explore
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Horizontal Scroll for Topics */}
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-bold text-lg">Top Picks for You</h3>
                                                    <button
                                                        onClick={() => setActiveSection('all-curated')}
                                                        className="text-xs font-bold text-gray-500 flex items-center gap-1"
                                                    >
                                                        See All <ArrowRight size={12} />
                                                    </button>
                                                </div>
                                                <div className="flex gap-4 overflow-x-auto pb-8 snap-x hide-scrollbar -mx-4 px-4 pt-2">
                                                    {allQuizzes.slice(0, 4).map(quiz => (
                                                        <motion.div
                                                            key={quiz.id}
                                                            className="min-w-[88vw] h-[220px] snap-center relative rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-xl cursor-pointer group flex flex-col justify-between p-6"
                                                            whileTap={{ scale: 0.95 }}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            onClick={(e) => {
                                                                // Prevent potential double firing if button clicked
                                                                if (e.target.tagName !== 'BUTTON') handleTopicSelect(quiz);
                                                            }}
                                                        >
                                                            {/* Minimal Content */}
                                                            <div>
                                                                <div className="mb-2 text-green-600">
                                                                    {quiz.icon && <quiz.icon size={28} strokeWidth={2} />}
                                                                </div>
                                                                <h3 className="text-2xl font-bold text-gray-900 leading-tight line-clamp-2">
                                                                    {quiz.title}
                                                                </h3>
                                                                <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                                                                    {quiz.description}
                                                                </p>
                                                            </div>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleTopicSelect(quiz);
                                                                }}
                                                                className="w-full py-4 bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-all shadow-md active:scale-95"
                                                            >
                                                                <span>Start</span>
                                                                <Play size={10} fill="currentColor" />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Notes Promotion */}
                                            <div
                                                onClick={() => setScreen('notes')}
                                                className="bg-green-50 rounded-3xl p-5 border border-green-100 flex items-center gap-4"
                                            >
                                                <div className="bg-green-100 p-3 rounded-full text-green-700">
                                                    <NotebookPen size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-800">Your Notes</h4>
                                                    <p className="text-xs text-gray-500">Review your study material</p>
                                                </div>
                                                <ArrowRight size={16} className="text-gray-400" />
                                            </div>
                                        </div>
                                    )}

                                    {activeSection === 'create' && <CreateQuiz onBack={() => setActiveSection('quiz')} />}
                                    {activeSection === 'community' && <CommunityQuizzes onBack={() => setActiveSection('quiz')} onPlay={(quiz) => startQuiz(quiz)} />}
                                    {activeSection === 'profile' && <UserProfile onBack={() => setActiveSection('quiz')} />}
                                    {activeSection === 'all-curated' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <button onClick={() => setActiveSection('quiz')} className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
                                                    <ArrowRight size={20} className="rotate-180" />
                                                </button>
                                                <h2 className="text-xl font-bold">All Topics</h2>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                {allQuizzes.map(quiz => (
                                                    <TopicCard
                                                        key={quiz.id}
                                                        topic={quiz.title}
                                                        icon={quiz.icon}
                                                        description={quiz.description}
                                                        color={quiz.color}
                                                        onStart={() => handleTopicSelect(quiz)}
                                                        questionCount={quiz.questions.length}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Chat View */}
                            {screen === 'chat' && (
                                <motion.div key="chat" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full px-1">
                                    <Chat onBack={() => setScreen('home')} />
                                </motion.div>
                            )}

                            {/* Notes View */}
                            {screen === 'notes' && (
                                <motion.div key="notes" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="p-4">
                                    <Notes />
                                </motion.div>
                            )}

                            {/* Config View */}
                            {screen === 'config' && (
                                <motion.div
                                    key="config"
                                    initial={{ opacity: 0, y: 100 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 h-full flex flex-col justify-center"
                                >
                                    <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Settings size={32} className="text-gray-700" />
                                        </div>
                                        <h2 className="text-2xl font-bold mb-2">Configure Quiz</h2>
                                        <p className="text-gray-500 mb-8 text-sm">How many questions?</p>

                                        <div className="grid grid-cols-2 gap-3 mb-8">
                                            {[10, 20, 30, 50, 'all'].map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setQuestionCount(opt)}
                                                    className={`py-3 rounded-xl font-bold border-2 transition-all text-sm ${questionCount === opt
                                                        ? 'border-black bg-black text-white'
                                                        : 'border-gray-100 bg-white text-gray-600'
                                                        }`}
                                                >
                                                    {opt === 'all' ? 'All' : opt}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setScreen('home')}
                                                className="flex-1 py-3 font-bold text-gray-500 bg-gray-50 rounded-xl"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => startQuiz(currentTopic)}
                                                className="flex-1 py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2"
                                            >
                                                <Play size={18} />
                                                Start
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Quiz View */}
                            {screen === 'quiz' && (
                                <motion.div key="quiz" className="h-full bg-white">
                                    <Quiz questions={quizQuestions} onFinish={finishQuiz} />
                                </motion.div>
                            )}

                            {/* Result View */}
                            {screen === 'result' && (
                                <motion.div key="result" className="h-full bg-white">
                                    <Result score={score} total={quizQuestions.length} userAnswers={userAnswers} onRestart={restartQuiz} />
                                </motion.div>
                            )}
                        </>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Navigation */}
            {showBottomNav && (
                <nav className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-100 pb-2 pt-2 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] h-[60px]">
                    <div className="grid grid-cols-4 h-[50px] items-center">
                        <NavItem
                            icon={Home}
                            label="Home"
                            isActive={screen === 'home' && activeSection !== 'profile'}
                            onClick={() => { setScreen('home'); setActiveSection('quiz'); }}
                        />
                        <NavItem
                            icon={NotebookPen}
                            label="Notes"
                            isActive={screen === 'notes'}
                            onClick={() => setScreen('notes')}
                        />
                        <NavItem
                            icon={MessageCircle}
                            label="Chat"
                            isActive={screen === 'chat'}
                            onClick={() => setScreen('chat')}
                        />
                        <NavItem
                            icon={User}
                            label="Profile"
                            isActive={activeSection === 'profile' && screen === 'home'}
                            onClick={() => { setScreen('home'); setActiveSection('profile'); }}
                        />
                    </div>
                </nav>
            )}

            <NotificationToast
                notification={notification}
                onClose={() => setNotification(null)}
                onClick={() => setScreen('chat')}
            />
        </div>
    );
}

export default MobileLayout;
