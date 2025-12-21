import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/sound';
import FeedbackBubble from './FeedbackBubble';

const Quiz = ({ questions, onFinish }) => {
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
            playSound('error');
        }
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

    const handleEndQuiz = () => {
        if (window.confirm("Are you sure you want to end the quiz early? \nYour current score will be submitted.")) {
            onFinish(score, userAnswers);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Question Card */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative">
                    <FeedbackBubble
                        isCorrect={selectedOption === currentQuestion.answer}
                        show={isAnswered}
                    />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 leading-snug">
                        {currentQuestion.question}
                    </h2>

                    <div className="space-y-3">
                        {currentQuestion.options.map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => handleOptionSelect(opt.key)}
                                disabled={isAnswered}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${getOptionStyle(opt.key)}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${isAnswered
                                        ? (opt.key === currentQuestion.answer ? 'bg-green-500 border-green-500 text-white'
                                            : (selectedOption === opt.key ? 'bg-red-500 border-red-500 text-white' : 'border-gray-200 text-gray-400'))
                                        : 'border-gray-200 text-gray-500 group-hover:border-black group-hover:text-black'
                                        }`}>
                                        {opt.key}
                                    </span>
                                    <span className="text-base font-medium">{opt.text}</span>
                                </div>

                                {isAnswered && opt.key === currentQuestion.answer && (
                                    <CheckCircle2 size={20} className="text-green-500" />
                                )}
                                {isAnswered && selectedOption === opt.key && opt.key !== currentQuestion.answer && (
                                    <XCircle size={20} className="text-red-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column: Feedback / Explanation Section */}
                {/* Always occupy space on large screens or float? 
            Visual choice: If we want it "responsive", it should probably be an AnimatePresence block. 
            On desktop, it will pop in on the right. On mobile, it will pop in below (due to grid-cols-1).
        */}
                <div className="lg:sticky lg:top-24">
                    <AnimatePresence mode='wait'>
                        {isAnswered && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg"
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
                                        <p className="text-gray-600 leading-relaxed">
                                            {currentQuestion.explanation || "No additional explanation provided for this question."}
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        className="w-full bg-black text-white px-8 py-4 rounded-xl font-bold text-base tracking-wide hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        {currentIndex === questions.length - 1 ? "Finish Result" : "Next Question"}
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Quiz;
