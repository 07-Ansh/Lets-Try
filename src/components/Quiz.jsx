import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/sound';
import FeedbackBubble from './FeedbackBubble';

const Quiz = ({ questions, onFinish, isMobile }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);

    const [userAnswers, setUserAnswers] = useState([]);

    if (!questions || questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Oops! No questions found.</h2>
                <p className="text-gray-500 mt-2">There seems to be an issue loading this quiz.</p>
                <button
                    onClick={() => onFinish(0, [])}
                    className="mt-6 px-6 py-2 bg-black text-white rounded-lg font-bold"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    // Calculate progress including current step if answered
    const progress = ((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100;

    const handleOptionSelect = (key) => {
        if (isAnswered) return; // Prevent changing answer

        setSelectedOption(key);
        setIsAnswered(true);

        const isCorrect = key === currentQuestion.answer;

        // Track detailed answer
        setUserAnswers(prev => [...prev, {
            question: currentQuestion.question,
            selectedOption: key,
            correctAnswer: currentQuestion.answer,
            isCorrect,
            explanation: currentQuestion.explanation || "No explanation provided."
        }]);

        if (isCorrect) {
            setScore(s => s + 1);
            playSound('success');
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            setScore(s => s - 0.25);
            playSound('error');
        }
    };

    const handleGiveUp = () => {
        if (isAnswered) return;
        setIsAnswered(true);
        setSelectedOption(null); // No option selected
        playSound('error'); // Optional: feedback sound

        // Track as skipped/gave up
        setUserAnswers(prev => [...prev, {
            question: currentQuestion.question,
            selectedOption: null,
            correctAnswer: currentQuestion.answer,
            isCorrect: false,
            isSkipped: true,
            explanation: currentQuestion.explanation || "No explanation provided."
        }]);
        // No score deduction for giving up (Skipping)
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(c => c + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            onFinish(score, userAnswers);
        }
    };

    // Helper to get option style
    const getOptionStyle = (key) => {
        if (!isAnswered) {
            // Default hover state
            return "border-gray-200 hover:border-black hover:bg-gray-50 text-gray-700";
        }

        if (key === currentQuestion.answer) {
            // Correct Answer (Always show green if answered)
            return "border-green-500 bg-green-50 text-green-700";
        }

        if (selectedOption === key && key !== currentQuestion.answer) {
            // Wrong Selection
            return "border-red-500 bg-red-50 text-red-700";
        }

        // Other unselected options
        return "border-gray-100 text-gray-400 opacity-50";
    };

    const [showQuitModal, setShowQuitModal] = useState(false);

    const handleEndQuiz = () => {
        setShowQuitModal(true);
    };

    const confirmQuit = () => {
        setShowQuitModal(false);
        onFinish(score, userAnswers);
    };

    const desktopVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 }
    };

    const mobileVariants = {
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" }
    };

    return (
        <div className={`w-full max-w-6xl mx-auto relative pb-32 lg:pb-0 ${isMobile ? 'pt-2' : 'pt-0'}`}>
            <AnimatePresence>
                {showQuitModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowQuitModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/20 text-center"
                        >
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Give up so soon?</h3>
                            <p className="text-gray-500 mb-8">
                                You're doing great! Are you sure you want to quit? Your current score will be saved.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowQuitModal(false)}
                                    className="flex-1 py-3 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                >
                                    Keep Going
                                </button>
                                <button
                                    onClick={confirmQuit}
                                    className="flex-1 py-3 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-lg hover:shadow-red-500/30"
                                >
                                    Quit Quiz
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Bar */}
            <div className={`mb-6 ${isMobile ? 'px-4 pt-6 pb-2' : 'mb-12'}`}>
                <div className="flex justify-between items-end text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                    <span>Question {currentIndex + 1} / {questions.length}</span>
                    <div className="flex items-center gap-4">
                        <span className="text-black font-bold text-sm">Score: {score}</span>
                        <button
                            onClick={handleEndQuiz}
                            className="text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                            End Quiz
                        </button>
                    </div>
                </div>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-black rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 items-start ${isMobile ? 'px-4 mt-5' : 'mt-0'}`}>
                {/* Left Column: Question Card */}
                <div className={`lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm relative ${isMobile ? 'p-5' : 'p-8'}`}>
                    <FeedbackBubble
                        isCorrect={selectedOption === currentQuestion.answer}
                        show={isAnswered && selectedOption !== null}
                    />
                    <h2 className={`font-bold text-gray-900 mb-8 leading-snug ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                        {currentQuestion.question}
                    </h2>

                    <div className="space-y-3">
                        {currentQuestion.options.map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => handleOptionSelect(opt.key)}
                                disabled={isAnswered}
                                className={`w-full text-left rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${isMobile ? 'p-3' : 'p-4'} ${getOptionStyle(opt.key)}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold border ${isAnswered
                                        ? (opt.key === currentQuestion.answer ? 'bg-green-500 border-green-500 text-white'
                                            : (selectedOption === opt.key ? 'bg-red-500 border-red-500 text-white' : 'border-gray-200 text-gray-400'))
                                        : 'border-gray-200 text-gray-500 group-hover:border-black group-hover:text-black'
                                        }`}>
                                        {opt.key}
                                    </span>
                                    <span className="text-base font-medium">{opt.text}</span>
                                </div>

                                {isAnswered && opt.key === currentQuestion.answer && (
                                    <CheckCircle2 size={24} className="text-green-500" />
                                )}
                                {isAnswered && selectedOption === opt.key && opt.key !== currentQuestion.answer && (
                                    <XCircle size={24} className="text-red-500" />
                                )}
                            </button>
                        ))}
                    </div>

                    {!isAnswered && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={handleGiveUp}
                                className="w-full py-4 bg-red-500 text-white rounded-xl text-lg font-bold hover:bg-red-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/30"
                            >
                                <XCircle size={22} />
                                Give Up
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column: Status Overlay Only */}
                <div className="space-y-6 lg:col-span-1 lg:sticky lg:top-6 self-start">
                    {/* Question Status Palette */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Question Overview</h3>
                        <div className="grid grid-cols-5 gap-3">
                            {questions.map((_, idx) => {
                                const answer = userAnswers[idx];
                                let statusClass = "border-gray-200 text-gray-400"; // Default/Future

                                if (idx === currentIndex && !answer) {
                                    statusClass = "border-black border-2 text-black font-bold"; // Current Active
                                } else if (answer) {
                                    if (answer.isCorrect) {
                                        statusClass = "bg-green-500 border-green-500 text-white";
                                    } else {
                                        statusClass = "bg-red-500 border-red-500 text-white";
                                    }
                                } else {
                                    // Unattempted (Standard)
                                    statusClass = "bg-white border-2 border-gray-200 text-gray-500";
                                }

                                // User specific request strict override
                                if (!answer) {
                                    statusClass = "bg-white border-2 border-black text-black";
                                } else if (answer.isCorrect) {
                                    statusClass = "bg-green-500 border-green-500 text-white";
                                } else {
                                    statusClass = "bg-red-500 border-red-500 text-white";
                                }

                                return (
                                    <div
                                        key={idx}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${statusClass}`}
                                    >
                                        {idx + 1}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Section (Popup/Bottom Sheet) */}
            <AnimatePresence mode='wait'>
                {isAnswered && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[2px]"
                        />

                        {/* Desktop Modal vs Mobile Bottom Sheet */}
                        <motion.div
                            variants={isMobile ? mobileVariants : {
                                initial: { opacity: 0, scale: 0.9, x: "-50%", y: "-50%" },
                                animate: { opacity: 1, scale: 1, x: "-50%", y: "-50%" },
                                exit: { opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }
                            }}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className={isMobile
                                ? "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2rem] p-6 border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                                : "fixed top-1/2 left-1/2 z-50 bg-white rounded-3xl p-8 shadow-2xl w-full max-w-2xl border border-gray-100"
                            }
                        >
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                    {selectedOption === currentQuestion.answer ? (
                                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                                            <CheckCircle2 size={24} />
                                        </div>
                                    ) : (
                                        <div className="p-2 bg-red-100 rounded-full text-red-600">
                                            <XCircle size={24} />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">
                                            {selectedOption === currentQuestion.answer ? "Correct!" : "Incorrect"}
                                        </p>
                                        {selectedOption !== currentQuestion.answer && (
                                            <p className="text-sm text-gray-500">Correct Answer: {currentQuestion.answer}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2 text-gray-900 font-semibold">
                                        <HelpCircle size={18} />
                                        <span>Explanation</span>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {currentQuestion.explanation || "No additional explanation provided for this question."}
                                    </p>
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="w-full bg-black text-white px-8 py-4 rounded-xl font-bold text-base tracking-wide hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95"
                                >
                                    {currentIndex === questions.length - 1 ? "Finish Result" : "Next Question"}
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Quiz;
