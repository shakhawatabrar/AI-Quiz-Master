import React, { useState, useEffect, useRef } from 'react';
import { Timer, CheckCircle2, Flag } from 'lucide-react';
import { motion } from 'motion/react';
import { Quiz } from '../types';

interface QuizInterfaceProps {
  quiz: Quiz;
  onComplete: (userAnswers: string[]) => void;
}

export default function QuizInterface({ quiz, onComplete }: QuizInterfaceProps) {
  const [userAnswers, setUserAnswers] = useState<string[]>(new Array(quiz.length).fill(''));
  const [timeLeft, setTimeLeft] = useState(quiz.length * 60);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (qIdx: number, option: string) => {
    // Prevent changing answer if already selected
    if (userAnswers[qIdx] !== '') return;
    
    const newAnswers = [...userAnswers];
    newAnswers[qIdx] = option;
    setUserAnswers(newAnswers);
  };

  const handleFinish = () => {
    onComplete(userAnswers);
  };

  const scrollToQuestion = (idx: number) => {
    questionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const answeredCount = userAnswers.filter(a => a !== '').length;
  const progress = (answeredCount / quiz.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Sticky Header */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 mb-8 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-20">
          <div className="flex items-center space-x-6">
            <div className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 border border-blue-100">
              <Timer className="w-5 h-5" />
              <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Questions</div>
              <div className="text-lg font-bold text-slate-900">{quiz.length}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Progress</div>
              <div className="text-sm font-bold text-slate-900">{answeredCount} / {quiz.length} Answered</div>
            </div>
            <button 
              onClick={handleFinish}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Finish Exam</span>
            </button>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Questions List */}
          <div className="lg:col-span-9 space-y-8">
            {quiz.map((q, qIdx) => (
              <div 
                key={qIdx}
                ref={el => questionRefs.current[qIdx] = el}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10 transition-all hover:shadow-md"
              >
                <div className="flex items-start space-x-5 mb-8">
                  <span className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-slate-200">
                    {qIdx + 1}
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif leading-relaxed text-slate-800 pt-1">
                    {q.question}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((option, oIdx) => {
                    const label = String.fromCharCode(65 + oIdx);
                    const isSelected = userAnswers[qIdx] === option;
                    
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleOptionSelect(qIdx, option)}
                        disabled={userAnswers[qIdx] !== ''}
                        className={`
                          group flex items-center p-5 rounded-2xl border-2 text-left transition-all duration-200
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-50' 
                            : userAnswers[qIdx] !== '' 
                              ? 'border-slate-50 bg-slate-50 opacity-60 cursor-not-allowed'
                              : 'border-slate-50 bg-slate-50 hover:border-slate-200 hover:bg-white'}
                        `}
                      >
                        <span className={`
                          w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-4 transition-colors
                          ${isSelected ? 'bg-blue-500 text-white' : 'bg-white text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}
                        `}>
                          {label}
                        </span>
                        <span className={`text-lg font-medium ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 sticky top-32">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center space-x-2 border-b border-slate-100 pb-4">
                <Flag className="w-4 h-4 text-blue-500" />
                <span>Question Sheet</span>
              </h3>
              <div className="grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {quiz.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToQuestion(idx)}
                    className={`
                      aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all
                      ${userAnswers[idx] !== '' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}
                    `}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Legend</span>
                </div>
                <div className="flex items-center text-xs text-slate-600 font-medium">
                  <div className="w-3 h-3 bg-slate-900 rounded-full mr-3" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center text-xs text-slate-600 font-medium">
                  <div className="w-3 h-3 bg-slate-100 rounded-full mr-3" />
                  <span>Remaining</span>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={handleFinish}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  Submit All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
