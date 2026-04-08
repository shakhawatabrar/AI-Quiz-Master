export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export type Quiz = Question[];

export interface QuizResult {
  score: number;
  total: number;
  answers: {
    questionIndex: number;
    userAnswer: string;
    isCorrect: boolean;
  }[];
}
