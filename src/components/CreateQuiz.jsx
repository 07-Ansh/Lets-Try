import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useUser } from '../context/UserContext';

const CreateQuiz = ({ onBack }) => {
    const { user } = useUser();
    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        questions: [
            {
                id: 1,
                question: '',
                options: [
                    { key: 'A', text: '' },
                    { key: 'B', text: '' },
                    { key: 'C', text: '' },
                    { key: 'D', text: '' }
                ],
                answer: 'A',
                explanation: ''
            }
        ]
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const addQuestion = () => {
        setQuizData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    id: prev.questions.length + 1,
                    question: '',
                    options: [
                        { key: 'A', text: '' },
                        { key: 'B', text: '' },
                        { key: 'C', text: '' },
                        { key: 'D', text: '' }
                    ],
                    answer: 'A',
                    explanation: ''
                }
            ]
        }));
    };

    const removeQuestion = (index) => {
        if (quizData.questions.length === 1) return;
        const newQuestions = quizData.questions.filter((_, i) => i !== index);
        setQuizData(prev => ({ ...prev, questions: newQuestions }));
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...quizData.questions];
        newQuestions[index][field] = value;
        setQuizData(prev => ({ ...prev, questions: newQuestions }));
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQuestions = [...quizData.questions];
        newQuestions[qIndex].options[oIndex].text = value;
        setQuizData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleSave = async () => {
        if (!quizData.title || !quizData.description) {
            setMessage("Please fill in Title and Description");
            return;
        }

        // basic validation
        for (let q of quizData.questions) {
            if (!q.question) {
                setMessage("All questions must have text");
                return;
            }
            for (let o of q.options) {
                if (!o.text) {
                    setMessage("All options must be filled");
                    return;
                }
            }
        }

        setSaving(true);
        setMessage("Saving...");

        try {
            await addDoc(collection(db, "quizzes"), {
                ...quizData,
                createdBy: user.uid,
                authorName: user.name || user.username || "Anonymous",
                createdAt: new Date().toISOString(),
                plays: 0
            });
            setMessage("Quiz Created Successfully! 🎉");
            setTimeout(onBack, 2000);
        } catch (error) {
            console.error(error);
            setMessage("Error saving quiz: " + error.message);
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-black mb-6">
                <ArrowLeft size={20} /> Back to Menu
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8"
            >
                <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>

                {message && (
                    <div className={`p-4 rounded-xl mb-6 text-center font-bold ${message.includes("Success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {message}
                    </div>
                )}

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Quiz Title</label>
                        <input
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-black transition-colors"
                            placeholder="e.g. Advanced JavaScript Trivia"
                            value={quizData.title}
                            onChange={e => setQuizData({ ...quizData, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-black transition-colors"
                            placeholder="What is this quiz about?"
                            value={quizData.description}
                            onChange={e => setQuizData({ ...quizData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    {quizData.questions.map((q, qIndex) => (
                        <div key={q.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 relative">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Question {qIndex + 1}</h3>
                                {quizData.questions.length > 1 && (
                                    <button onClick={() => removeQuestion(qIndex)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg">
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>

                            <input
                                className="w-full p-3 rounded-xl border border-gray-300 mb-4"
                                placeholder="Enter question text here..."
                                value={q.question}
                                onChange={e => updateQuestion(qIndex, 'question', e.target.value)}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {q.options.map((opt, oIndex) => (
                                    <div key={opt.key} className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border ${q.answer === opt.key ? 'bg-green-500 text-white border-green-500' : 'bg-white border-gray-300'}`}>
                                            {opt.key}
                                        </div>
                                        <input
                                            className="w-full p-2 rounded-lg border border-gray-300"
                                            placeholder={`Option ${opt.key}`}
                                            value={opt.text}
                                            onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                        />
                                        <input
                                            type="radio"
                                            name={`answer-${q.id}`}
                                            checked={q.answer === opt.key}
                                            onChange={() => updateQuestion(qIndex, 'answer', opt.key)}
                                            className="w-5 h-5 accent-black cursor-pointer"
                                        />
                                    </div>
                                ))}
                            </div>

                            <input
                                className="w-full p-3 rounded-xl border border-gray-300 border-dashed bg-white"
                                placeholder="Explanation (Optional)"
                                value={q.explanation}
                                onChange={e => updateQuestion(qIndex, 'explanation', e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-8">
                    <button
                        onClick={addQuestion}
                        className="flex-1 py-4 border-2 border-black border-dashed rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50"
                    >
                        <Plus size={20} /> Add Question
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 shadow-lg disabled:opacity-50"
                    >
                        {saving ? "Saving..." : <><Save size={20} /> Save Quiz</>}
                    </button>
                </div>

            </motion.div>
        </div>
    );
};

export default CreateQuiz;
