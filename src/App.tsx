import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import QuizInterface from './components/QuizInterface';
import Results from './components/Results';
import { Quiz, QuizResult } from './types';
import { motion, AnimatePresence } from 'motion/react';

type AppState = 'dashboard' | 'quiz' | 'results';

export default function App() {
  const [state, setState] = useState<AppState>('dashboard');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  const handleQuizGenerated = (generatedQuiz: Quiz) => {
    setQuiz(generatedQuiz);
    setState('quiz');
  };

  const handleQuizComplete = (userAnswers: string[]) => {
    if (!quiz) return;

    let score = 0;
    const answers = userAnswers.map((ans, idx) => {
      const isCorrect = ans.toLowerCase().trim() === quiz[idx].answer.toLowerCase().trim();
      if (isCorrect) score++;
      return {
        questionIndex: idx,
        userAnswer: ans,
        isCorrect
      };
    });

    setResult({
      score,
      total: quiz.length,
      answers
    });
    setState('results');
  };

  const handleRestart = () => {
    setQuiz(null);
    setResult(null);
    setState('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AnimatePresence mode="wait">
        {state === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard onQuizGenerated={handleQuizGenerated} />
          </motion.div>
        )}

        {state === 'quiz' && quiz && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizInterface quiz={quiz} onComplete={handleQuizComplete} />
          </motion.div>
        )}

        {state === 'results' && quiz && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Results quiz={quiz} result={result} onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100 bg-white mt-auto">
        <p>© {new Date().getFullYear()} AI Quiz Master. Powered by Shakhawat Abrar.</p>
      </footer>
    </div>
  );
}
