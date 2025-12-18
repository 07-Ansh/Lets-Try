import React, { useState } from 'react';
import TopicCard from './components/TopicCard';
import Quiz from './components/Quiz';
import Result from './components/Result';
import osQuestions from './data/os-questions.json';
import { PenTool, Settings, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [screen, setScreen] = useState('home'); // home, config, quiz, result
  const [currentTopic, setCurrentTopic] = useState(null);
  const [score, setScore] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [questionCount, setQuestionCount] = useState(10); // Default 10

  const handleTopicSelect = (topic) => {
    setCurrentTopic(topic);
    setScreen('config');
  };

  const startQuiz = () => {
    // Shuffle and Slice
    const shuffled = [...osQuestions].sort(() => 0.5 - Math.random());
    const selected = questionCount === 'all' ? shuffled : shuffled.slice(0, questionCount);

    setQuizQuestions(selected);
    setScreen('quiz');
    setScore(0);
  };

  const finishQuiz = (finalScore) => {
    setScore(finalScore);
    setScreen('result');
  };

  const restartQuiz = () => {
    setScreen('home');
    setCurrentTopic(null);
    setScore(0);
    setQuizQuestions([]);
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-black selection:text-white pb-10">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setScreen('home')}>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <motion.div
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  Select a Topic
                </h2>
                <p className="text-gray-500 text-lg">
                  Choose a subject to test your knowledge.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <TopicCard
                  topic="Operating Systems"
                  description="Processes, threads, scheduling, synchronization, and more."
                  questionCount={osQuestions.length}
                  onStart={() => handleTopicSelect('Operating Systems')}
                />

                <TopicCard
                  topic="Computer Networks"
                  description="Coming soon! TCP/IP, OSI Model, and protocols."
                  questionCount={0}
                  onStart={() => { }}
                  disabled
                />
                <TopicCard
                  topic="Databases"
                  description="Coming soon! SQL, Normalization, Transactions."
                  questionCount={0}
                  onStart={() => { }}
                  disabled
                />
              </div>
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
                    onClick={startQuiz}
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
                onRestart={restartQuiz}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
