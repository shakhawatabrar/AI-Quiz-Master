import React, { useEffect } from 'react';
import { Trophy, CheckCircle2, XCircle, RotateCcw, ArrowRight, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Quiz, QuizResult } from '../types';

interface ResultsProps {
  quiz: Quiz;
  result: QuizResult;
  onRestart: () => void;
}

export default function Results({ quiz, result, onRestart }: ResultsProps) {
  const percentage = Math.round((result.score / result.total) * 100);

  useEffect(() => {
    if (percentage >= 70) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [percentage]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden"
      >
        {/* Score Header */}
        <div className="bg-slate-900 p-12 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[100px]" />
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-3xl mb-6 backdrop-blur-md border border-white/20">
              <Trophy className={`w-12 h-12 ${percentage >= 70 ? 'text-yellow-400' : 'text-slate-400'}`} />
            </div>
            <h1 className="text-4xl font-bold mb-2">Quiz Completed!</h1>
            <p className="text-slate-400 text-lg">Here's how you performed in the exam</p>
          </motion.div>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold mb-1">{result.score}</div>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Correct</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold mb-1">{percentage}%</div>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Score</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold mb-1">{result.total}</div>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Total</div>
            </div>
          </div>
        </div>

        {/* Detailed Review */}
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center space-x-3">
            <span>Question Review</span>
            <span className="text-sm font-normal text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {result.total} Questions
            </span>
          </h2>

          <div className="space-y-6">
            {quiz.map((q, idx) => {
              const userAns = result.answers.find(a => a.questionIndex === idx);
              const isCorrect = userAns?.isCorrect;

              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`p-6 rounded-3xl border-2 transition-all ${isCorrect ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {idx + 1}
                      </span>
                      <h3 className="text-lg font-serif leading-relaxed text-slate-800 pt-0.5">
                        {q.question}
                      </h3>
                    </div>
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
                    <div className="p-4 rounded-xl bg-white border border-slate-100">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Your Answer</div>
                      <div className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {userAns?.userAnswer || <span className="italic opacity-50">Not answered</span>}
                      </div>
                    </div>
                    {!isCorrect && (
                      <div className="p-4 rounded-xl bg-white border border-slate-100">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Correct Answer</div>
                        <div className="font-medium text-green-600">{q.answer}</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onRestart}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Try Another Quiz</span>
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-600 border-2 border-slate-100 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-50 transition-all">
              <Share2 className="w-5 h-5" />
              <span>Share Results</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
