export interface Question {
  id: number;
  question: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  grade: 'ابتدائي' | 'إعدادي' | 'ثانوي' | 'بكالوريا';
  category: string;
}
