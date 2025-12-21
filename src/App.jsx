import React, { useState, useEffect } from 'react';
import { useUser } from './context/UserContext';
import DesktopLayout from './components/layouts/DesktopLayout';
import MobileLayout from './components/layouts/MobileLayout';

// Simple hook for media query
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

function App() {
  const { user, logout, loading } = useUser();
  const [notification, setNotification] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [screen, setScreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('screen') || 'home';
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

      const selected = quizData.questions;
      const shuffled = [...selected].sort(() => 0.5 - Math.random());

      let countToTake = 10;
      if (questionCount === 'all') {
        countToTake = shuffled.length;
      } else {
        countToTake = Math.min(Number(questionCount) || 10, shuffled.length);
      }

      const finalSelection = shuffled.slice(0, countToTake);

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
    setScreen('home');
    setActiveSection('quiz');
    setCurrentTopic(null);
    setScore(0);
    setQuizQuestions([]);
  };

  const handleLogout = () => {
    logout();
    setScreen('login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const layoutProps = {
    user,
    screen,
    setScreen,
    activeSection,
    setActiveSection,
    mobileMenuOpen,
    setMobileMenuOpen,
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
  };

  return isMobile ? <MobileLayout {...layoutProps} /> : <DesktopLayout {...layoutProps} />;
}

export default App;

