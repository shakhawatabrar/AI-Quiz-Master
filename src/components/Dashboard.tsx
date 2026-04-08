import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Image as ImageIcon, Loader2, AlertCircle, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractQuizFromDocument } from '../lib/gemini';
import { Quiz } from '../types';

interface DashboardProps {
  onQuizGenerated: (quiz: Quiz) => void;
}

export default function Dashboard({ onQuizGenerated }: DashboardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const quiz = await extractQuizFromDocument(base64, file.type);
          if (quiz.length === 0) {
            setError("No questions could be extracted from this image. Please try a clearer image.");
          } else {
            onQuizGenerated(quiz);
          }
        } catch (err: any) {
          if (err.message === 'API_KEY_MISSING') {
            setError("API Key is missing. Please set VITE_GEMINI_API_KEY in Netlify settings.");
          } else {
            setError("Failed to process image. Make sure it contains clear MCQs.");
          }
          console.error(err);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error reading file.");
      setIsProcessing(false);
    }
  }, [onQuizGenerated]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'image/*': [] as string[],
      'application/pdf': [] as string[]
    },
    multiple: false,
    noClick: isProcessing,
    noKeyboard: isProcessing
  } as any);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          AI Quiz Master
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Upload an image of your question paper, and our AI will generate a professional board-exam style interactive quiz for you.
        </p>
      </motion.div>

      <div 
        {...getRootProps()} 
        className={`
          relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
            {isProcessing ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : (
              <Upload className="w-10 h-10" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">
              {isProcessing ? 'Processing your document...' : 'Drop your question paper here'}
            </h3>
            <p className="text-slate-500">
              Supports PDF, English and Bengali question papers (Handwritten or Printed)
            </p>
          </div>

          {!isProcessing && (
            <button className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              Select Image
            </button>
          )}
        </div>

        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-3xl flex items-center justify-center"
          >
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="font-medium text-slate-700">Gemini is analyzing the questions...</p>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-700"
          >
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <FileText className="w-6 h-6" />, title: "PDF & Image Support", desc: "Upload PDFs or images. Advanced AI handles both formats." },
          { icon: <AlertCircle className="w-6 h-6" />, title: "Smart Options", desc: "Automatically identifies questions, options, and correct answers." },
          { icon: <Upload className="w-6 h-6" />, title: "Bilingual Support", desc: "Seamlessly handles both English and Bengali text." }
        ].map((feature, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 mb-4">
              {feature.icon}
            </div>
            <h4 className="font-bold text-slate-800 mb-2">{feature.title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
