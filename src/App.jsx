import React, { useState, useEffect } from 'react';
import CreateQuiz from './components/CreateQuiz';
import CommunityQuizzes from './components/CommunityQuizzes';
import TopicCard from './components/TopicCard';
import Quiz from './components/Quiz';
import Result from './components/Result';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import UserProfile from './components/UserProfile';
import Notes from './components/Notes';
import LandingPage from './components/LandingPage';
import { allQuizzes } from './data/quizzes';
import { PenTool, MessageCircle, NotebookPen, User, LogOut, Plus, BookOpen, Settings, Play, ArrowRight, BrainCircuit, Grid, Trash2, Menu, X } from 'lucide-react';
import { db } from './firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import NotificationToast from './components/NotificationToast'; // Import Toast
import Chat from './components/Chat';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from './context/UserContext';

function App() {
  const { user, logout, loading } = useUser();
  const [notification, setNotification] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Notification State
  const [screen, setScreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('screen') || 'login';
  });
  const [activeSection, setActiveSection] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('section') || 'quiz';
  });

  const [currentTopic, setCurrentTopic] = useState(null);
  const [score, setScore] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);

  // Sync State -> URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentScreenParam = params.get('screen');
    const currentSectionParam = params.get('section');

    if (currentScreenParam !== screen || currentSectionParam !== activeSection) {
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('screen', screen);
      if (screen === 'home') {
        newUrl.searchParams.set('section', activeSection);
      } else {
        newUrl.searchParams.delete('section');
      }
      window.history.pushState({}, '', newUrl);
    }
  }, [screen, activeSection]);

  // Handle Back Button (URL -> State)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const newScreen = params.get('screen');
      const newSection = params.get('section');

      if (newScreen) setScreen(newScreen);
      if (newSection) setActiveSection(newSection);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Effect to redirect based on auth status
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (screen === 'login' || screen === 'signup') {
          setScreen('home');
        }
      } else {
        // If not logged in, allow 'home' (Landing Page) or 'login'/'signup'
        // Redirect protected routes to login
        if (screen !== 'login' && screen !== 'signup' && screen !== 'home') {
          setScreen('login');
        }
      }
    }
  }, [user, loading, screen]);

  const handleTopicSelect = (quiz) => {
    setCurrentTopic(quiz);
    setScreen('config');
  };

  const startQuiz = (quizData) => {
    try {
      console.log("Starting Quiz with Data:", quizData);

      if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        alert("Error: No questions found in this quiz data.");
        console.error("Quiz Data missing questions:", quizData);
        return;
      }

      setActiveSection('quiz');

      // Use provided quiz questions
      const selected = quizData.questions;

      console.log("Total Questions Available:", selected.length);

      // Shuffle
      const shuffled = [...selected].sort(() => 0.5 - Math.random());

      // Determine count. If we are launching from Quick Start, we want to respect the 
      // questionCount state BUT ensure we don't return 0. 
      // Also, if the user hasn't configured, default to 10? 
      // The user asked for "100 mcqs". If they didn't go to config, 'questionCount' is 10.
      // Let's force 'all' if the user explicitly clicked "Start" on a card that says "100 Questions"?
      // Actually, standard behavior is to respect the global setting or default to 10.
      // BUT for debugging, let's log the count.
      console.log("Requested Question Count:", questionCount);

      let countToTake = 10;
      if (questionCount === 'all') {
        countToTake = shuffled.length;
      } else {
        // Ensure it's a number and valid
        countToTake = Math.min(Number(questionCount) || 10, shuffled.length);
      }

      const finalSelection = shuffled.slice(0, countToTake);

      console.log("Final Selection Size:", finalSelection.length);

      if (finalSelection.length === 0) {
        alert("Error: Selection resulted in 0 questions.");
        return;
      }

      setQuizQuestions(finalSelection);
      setUserAnswers([]);
      setScreen('quiz');
      setScore(0);
    } catch (error) {
      console.error("Failed to start quiz:", error);
      alert("An error occurred while starting the quiz. Check console for details.");
    }
  };

  const finishQuiz = (finalScore) => {
    setScore(finalScore);
    setScreen('result');
  };

  const restartQuiz = () => {
    setScreen('welcome');
    setActiveSection('quiz');
    setCurrentTopic(null);
    setScore(0);
    setQuizQuestions([]);
  };

  const handleLogout = () => {
    logout();
    setScreen('login');
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-black selection:text-white">

      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-2xl saturate-150 border-b border-white/80 shadow-sm transition-all duration-300">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setScreen('home'); setActiveSection('quiz'); }}>
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-black text-white p-2 rounded-lg"
            >
              <PenTool size={20} />
            </motion.div>
            <h1 className="text-xl font-bold tracking-tight text-black group-hover:text-gray-700 transition-colors">
              Let's Try
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                  <button
                    onClick={() => setScreen('chat')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${screen === 'chat' ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50 text-gray-600'
                      }`}
                  >
                    <MessageCircle size={18} />
                    <span>Chat</span>
                  </button>

                  <button
                    onClick={() => setScreen('notes')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${screen === 'notes' ? 'bg-gray-100 font-bold' : 'hover:bg-gray-50 text-gray-600'
                      }`}
                  >
                    <NotebookPen size={18} />
                    <span>Notes</span>
                  </button>

                  <div className="h-6 w-px bg-gray-200 mx-2"></div>

                  <button
                    onClick={() => { setScreen('home'); setActiveSection('profile'); }}
                    className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <div className="bg-gray-100 p-2 rounded-full border border-gray-200">
                      <User size={18} />
                    </div>
                    <span className="hover:underline">{user.name}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>

                {/* Mobile Navigation Controls */}
                <div className="flex md:hidden items-center gap-3">
                  <button
                    onClick={() => setScreen('chat')}
                    className={`p-2 rounded-xl transition-colors ${screen === 'chat' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <MessageCircle size={20} />
                  </button>
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <Menu size={20} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setScreen('login')}
                className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-lg shadow-black/10"
              >
                Get Started
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 w-full bg-white z-50 shadow-2xl border-b border-gray-100 p-6 md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="bg-black text-white p-2 rounded-lg">
                    <PenTool size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Menu</h2>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {user && (
                <div className="space-y-6">
                  {/* User Profile Snippet */}
                  <div
                    onClick={() => { setScreen('home'); setActiveSection('profile'); setMobileMenuOpen(false); }}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 active:scale-95 transition-transform"
                  >
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">View Profile</p>
                    </div>
                    <ArrowRight size={16} className="ml-auto text-gray-400" />
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => { setScreen('home'); setMobileMenuOpen(false); }}
                      className="w-full p-4 flex items-center gap-4 font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Grid size={20} /> Dashboard
                    </button>
                    <button
                      onClick={() => { setScreen('notes'); setMobileMenuOpen(false); }}
                      className="w-full p-4 flex items-center gap-4 font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <NotebookPen size={20} /> Notes
                    </button>
                    <button
                      onClick={() => { setScreen('chat'); setMobileMenuOpen(false); }}
                      className="w-full p-4 flex items-center gap-4 font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <MessageCircle size={20} /> Chat
                    </button>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="w-full py-3 bg-red-50 text-red-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className={`flex-1 relative z-0 ${(screen === 'chat' || !user) ? 'w-full' : 'w-full max-w-[1920px] mx-auto px-4 sm:px-8 py-8'}`}>
        <AnimatePresence mode="wait">
          {screen === 'login' && (
            <Login
              key="login"
              onSwitchToSignup={() => setScreen('signup')}
              onLoginSuccess={() => setScreen('home')}
            />
          )}

          {screen === 'signup' && (
            <Signup
              key="signup"
              onSwitchToLogin={() => setScreen('login')}
              onSignupSuccess={() => setScreen('home')}
            />
          )}

          {screen === 'home' && (
            <AnimatePresence mode="wait">
              {!user ? (
                // RESTRICTED / HERO VIEW (Landing Page for Guests)
                <LandingPage onGetStarted={() => setScreen('login')} />
              ) : (
                // AUTHENTICATED VIEWS
                <>
                  {activeSection === 'profile' && (
                    <UserProfile key="profile" onBack={() => setActiveSection('quiz')} />
                  )}

                  {activeSection === 'create' && (
                    <CreateQuiz key="create" onBack={() => setActiveSection('quiz')} />
                  )}

                  {activeSection === 'community' && (
                    <CommunityQuizzes key="community" onBack={() => setActiveSection('quiz')} onPlay={(quiz) => startQuiz(quiz)} />
                  )}

                  {activeSection === 'quiz' && (
                    <motion.div
                      key="dashboard"
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-16"
                    >
                      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-white to-gray-100 p-8 md:p-16 text-gray-900 shadow-2xl border border-gray-200">
                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                          <div className="flex-1 text-center lg:text-left space-y-6">
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
                              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Level Up?</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 font-medium">
                              Master your skills with our curated quizzes or challenge the community with your own creations.
                            </p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                              <button
                                onClick={() => setActiveSection('create')}
                                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2 group shadow-lg hover:shadow-xl"
                              >
                                <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                Create Quiz
                              </button>
                              <button
                                onClick={() => setActiveSection('community')}
                                className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                              >
                                <BookOpen size={20} />
                                Community
                              </button>
                            </div>
                          </div>

                          <div className="w-full max-w-md">
                            <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
                              <div className="flex items-center justify-between text-gray-800">
                                <h3 className="font-bold uppercase tracking-wider text-sm">Study Material</h3>
                                <button
                                  onClick={() => setScreen('notes')}
                                  className="text-xs font-bold hover:text-blue-600 flex items-center gap-1 transition-colors"
                                >
                                  Go to Notes <ArrowRight size={12} />
                                </button>
                              </div>

                              <div className="bg-white/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3 min-h-[140px] border border-white/50">
                                <div className="bg-white p-3 rounded-full text-green-600 shadow-sm">
                                  <NotebookPen size={28} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">Your Notes Library</h4>
                                  <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                                    Upload and manage your study notes securely in the cloud.
                                  </p>
                                </div>
                                <button
                                  onClick={() => setScreen('notes')}
                                  className="mt-8 w-full py-2 bg-white text-black text-sm font-bold rounded-xl border-2 border-green-600 hover:bg-green-50 transition-colors shadow-sm hover:shadow-md"
                                >
                                  Add Notes
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Topic Grid */}
                      <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center sm:text-left">
                          What do you want to learn today?
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {/* Create New Card (Duplicate for grid) */}
                          <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white text-black rounded-3xl p-8 shadow-xl cursor-pointer flex flex-col justify-between h-[320px] group relative overflow-hidden border-2 border-black"
                            onClick={() => setActiveSection('create')}
                          >
                            <div className="absolute top-0 right-0 p-32 bg-black/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-black/10" />
                            <div>
                              <div className="bg-black w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                                <Plus size={24} className="text-white" />
                              </div>
                              <h3 className="text-2xl font-bold mb-2">Create New</h3>
                              <p className="text-gray-500 leading-relaxed">Craft your own quiz to challenge yourself and others.</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-black opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                              Start Creating <ArrowRight size={16} />
                            </div>
                          </motion.div>

                          {/* Community Card - Replaces the Component Injection */}
                          <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white border border-gray-100 text-gray-900 rounded-3xl p-8 shadow-xl cursor-pointer flex flex-col justify-between h-[320px] group relative overflow-hidden hover:shadow-2xl transition-all"
                            onClick={() => setActiveSection('community')}
                          >
                            <div className="absolute top-0 right-0 p-32 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-green-100" />
                            <div>
                              <div className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                                <BookOpen size={24} className="text-green-600" />
                              </div>
                              <h3 className="text-2xl font-bold mb-2">Community</h3>
                              <p className="text-gray-500 leading-relaxed">Explore quizzes created by other users.</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                              Browse Library <ArrowRight size={16} />
                            </div>
                          </motion.div>

                          {allQuizzes.map((quiz) => (
                            <div key={quiz.id} className="lg:col-span-2 h-full">
                              <TopicCard
                                topic={quiz.title}
                                icon={quiz.icon}
                                description={quiz.description}
                                color={quiz.color}
                                onStart={() => handleTopicSelect(quiz)}
                                questionCount={quiz.questions.length}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeSection === 'all-curated' && (
                    <motion.div
                      // ... All Curated View ...
                      key="all-curated"
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="space-y-8"
                    >
                      <div className="flex items-center gap-4 mb-8">
                        <button
                          onClick={() => setActiveSection('quiz')}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <ArrowRight className="rotate-180" size={24} />
                        </button>
                        <h2 className="text-3xl font-bold text-gray-900">All Topics</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allQuizzes.map((quiz) => (
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
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          )}

          {screen === 'notes' && (
            <motion.div
              key="notes"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Notes />
            </motion.div>
          )}

          {screen === 'chat' && (
            <motion.div
              key="chat"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Chat onBack={() => setScreen('home')} />
            </motion.div>
          )}

          {screen === 'config' && (
            <motion.div
              key="config"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center min-h-[60vh]"
            >
              {/* ... Config JSX (Same as before but wrapped in framer motion) ... */}
              <div className="w-full max-w-xl bg-white rounded-3xl p-10 border border-gray-200 shadow-xl text-center">
                <div className="inline-flex justify-center items-center p-4 bg-gray-100 rounded-full mb-6">
                  <Settings size={32} className="text-gray-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Configure Quiz</h2>
                <p className="text-gray-500 mb-8">How many questions would you like to attempt?</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[10, 20, 30, 50, 'all'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setQuestionCount(opt)}
                      className={`py-4 rounded-xl font-bold border-2 transition-all ${questionCount === opt
                        ? 'border-black bg-black text-white shadow-lg'
                        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300 transform hover:-translate-y-0.5'
                        }`}
                    >
                      {opt === 'all' ? 'All Questions' : `${opt} Questions`}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setScreen('home')}
                    className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => startQuiz(currentTopic)}
                    className="flex-1 py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Play size={20} />
                    Start Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {screen === 'quiz' && (
            <motion.div
              key="quiz"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Quiz
                questions={quizQuestions}
                onFinish={finishQuiz}
              />
            </motion.div>
          )}

          {screen === 'result' && (
            <motion.div
              key="result"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Result
                score={score}
                total={quizQuestions.length}
                userAnswers={userAnswers}
                onRestart={restartQuiz}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main >
      {/* Global Notification Toast */}
      < NotificationToast
        notification={notification}
        onClose={() => setNotification(null)
        }
        onClick={() => setScreen('chat')}
      />
    </div >
  );
}

export default App;
