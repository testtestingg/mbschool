import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Play, Trophy, Clock, CheckCircle, XCircle,
  Mail, Timer, Bell, Lock, Eye, EyeOff, LogOut, Loader2, User,
  Target, TrendingUp, Brain, Star, Award, Home, Settings, BarChart3,
  Calendar, Crown, Medal, Zap, RefreshCw, ArrowRight, Send, AlertCircle,
  ChevronDown, ChevronUp, MessageCircle, HelpCircle, X, Lightbulb,
  Sparkles, Calculator, Percent, Hash, DivideSquare, Plus, Minus, Activity,
  Flame, Shield, Rocket, Library, GraduationCap, Book, PenTool, Languages,
  Globe, Music, Palette, Camera, Thermometer, Dna, Atom, MapPin,
  Clock as ClockIcon, FileText, Users, Gift, Heart, Sun, Moon,
  Volume2, VolumeX, Volume1, Volume3, Copy, QrCode, Key, Users as UsersIcon,
  CalendarDays, Trash2, PlusCircle, Tag
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// Define COLORS as a custom constant
const COLORS = {
  primary: '#1D4ED8',    // Deep blue for main elements
  secondary: '#3B82F6',   // Lighter blue for accents/buttons
  accent: '#10B981',      // Green for success/positive
  success: '#22C55E',     // Brighter green
  warning: '#EAB308',     // Yellow for warnings
  error: '#EF4444',       // Red for errors
  background: '#F9FAFB',  // Light gray background
  text: '#111827',        // Dark text
  textLight: '#6B7280',   // Lighter text
  support1: '#9CA3AF',    // Medium gray
  support2: '#E5E7EB'     // Light gray borders
};

// Define SUBJECTS as a custom constant array based on QUESTION categories
const SUBJECTS = [
  {
    id: 'رياضيات',
    name: 'رياضيات',
    icon: Calculator,
    color: '#1D4ED8',
    bgColor: '#EFF6FF'
  },
  {
    id: 'لغة عربية', 
    name: 'لغة عربية',
    icon: Book,
    color: '#10B981',
    bgColor: '#F0FDF4'
  },
  {
    id: 'علوم',
    name: 'علوم',
    icon: Atom,
    color: '#EAB308',
    bgColor: '#FEFCE8'
  },
  {
    id: 'تاريخ',
    name: 'تاريخ',
    icon: ClockIcon,
    color: '#EF4444',
    bgColor: '#FEF2F2'
  },
  {
    id: 'الجغرافيا',
    name: 'الجغرافيا',
    icon: MapPin,
    color: '#3B82F6',
    bgColor: '#EFF6FF'
  },
  {
    id: 'فيزياء',
    name: 'فيزياء',
    icon: Zap,
    color: '#8B5CF6',
    bgColor: '#F5F3FF'
  },
  {
    id: 'كيمياء',
    name: 'كيمياء',
    icon: Thermometer,
    color: '#EC4899',
    bgColor: '#FDF2F8'
  },
  {
    id: 'بيولوجيا',
    name: 'بيولوجيا',
    icon: Dna,
    color: '#14B8A6',
    bgColor: '#F0FDFA'
  }
];

// Use central Supabase client (reads credentials from Vite env vars via src/lib/supabase)

const SimplifiedMathChallenge = () => {

  // ============ STATE MANAGEMENT ============
  const [gameState, setGameState] = useState('enterCode'); // New initial state
  const [studentName, setStudentName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameQuestions, setGameQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameTimeLeft, setGameTimeLeft] = useState(300);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiHelpCount, setAiHelpCount] = useState(0);
  const [maxAiHelp] = useState(3);
  const [gameStats, setGameStats] = useState({
    score: 0,
    accuracy: 0,
    bestStreak: 0,
    totalQuestions: 0,
    correctAnswers: 0
  });
  const [currentStreak, setCurrentStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState('light');
  const [isExiting, setIsExiting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [showRegisterButton, setShowRegisterButton] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showTeacherButton, setShowTeacherButton] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState('');
  // Leaderboard states
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardFilter, setLeaderboardFilter] = useState('all'); // all, today, week
  
  // ============ EFFECTS & FUNCTIONS ============
  useEffect(() => {
    // Check if user is registered
    const checkRegistration = () => {
      const cookies = document.cookie.split(';');
      const registeredCookie = cookies.find(cookie => cookie.trim().startsWith('mbschool_registered='));
      setIsRegistered(!!registeredCookie);
    };
    
    checkRegistration();
    
    // Scroll to top when entering game
    if (gameState === 'game') {
      window.scrollTo(0, 0);
    }
    
    // Load leaderboard data if needed
    if (gameState === 'leaderboard') {
      loadLeaderboard();
    }
    
    // Check if we should show teacher button
    setShowTeacherButton(true);
    
    // Re-fetch attempts count when entering setup page
    if (gameState === 'setup' && studentName && verificationCode) {
      fetchAttemptsCount();
    }
  }, [gameState, studentName, verificationCode]);
  
  // Handle exit animation
  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        setGameState('setup');
        setSelectedGrade('');
        setSelectedDifficulty('');
        setSelectedSubject('');
        setIsExiting(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isExiting]);
  
  const fetchAttemptsCount = async () => {
    try {
      // Get verification code details
      const { data: codeData } = await supabase
        .from('verification_codes')
        .select('max_attempts')
        .eq('code', verificationCode)
        .eq('is_active', true)
        .single();

      // Get attempts count for this student and code
      const { data: attemptsData } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact' })
        .eq('student_name', studentName)
        .eq('verification_code', verificationCode);
        
      const attemptsCount = attemptsData ? attemptsData.length : 0;
      const maxAttempts = codeData?.max_attempts || 3;
      const remainingAttempts = Math.max(0, maxAttempts - attemptsCount);
      setAttemptsLeft(remainingAttempts);
      
      if (remainingAttempts <= 0) {
        setShowRegisterButton(true);
      }
    } catch (error) {
      console.error('Error fetching attempts count:', error);
    }
  };
  // In your SimplifiedMathChallenge component, add a className to the main container

  
  const showToast = (message, type = 'success') => {
    // Enhanced toast implementation
    const toastElement = document.createElement('div');
    toastElement.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-white font-medium shadow-lg flex items-center gap-2 animate-fade-in ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    
    const icon = type === 'success' ? 
      <CheckCircle className="w-5 h-5" /> : 
      <AlertCircle className="w-5 h-5" />;
    
    toastElement.innerHTML = `
      <div class="flex items-center gap-2">
        ${icon.outerHTML}
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.style.opacity = '0';
      toastElement.style.transform = 'translate(-50%, -20px)';
      toastElement.style.transition = 'all 0.3s ease-out';
      setTimeout(() => toastElement.remove(), 300);
    }, 3000);
  };
  
  const validateCode = async () => {
    if (!studentName.trim()) {
      setCodeError('الرجاء إدخال اسمك');
      return;
    }
    
    if (!verificationCode.trim()) {
      setCodeError('الرجاء إدخال رمز التحقق');
      return;
    }
    
    setIsSubmitting(true);
    setCodeError('');
    
    try {
      // Check if verification code exists and is valid
      const { data: codeData, error: codeError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('code', verificationCode.trim())
        .eq('is_active', true)
        .single();
        
      if (codeError || !codeData) {
        setCodeError('رمز التحقق غير صالح');
        setIsSubmitting(false);
        return;
      }
      
      // Check if code is expired
      if (new Date(codeData.expires_at) < new Date()) {
        setCodeError('رمز التحقق منتهي الصلاحية');
        setIsSubmitting(false);
        return;
      }
      
      // Get attempts count for this student and code
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('game_sessions')
        .select('*', { count: 'exact' })
        .eq('student_name', studentName.trim())
        .eq('verification_code', verificationCode.trim());
        
      if (attemptsError) {
        console.error('Error fetching attempts:', attemptsError);
        setAttemptsLeft(codeData.max_attempts || 3);
      } else {
        const attemptsCount = attemptsData ? attemptsData.length : 0;
        const maxAttempts = codeData.max_attempts || 3;
        const remainingAttempts = Math.max(0, maxAttempts - attemptsCount);
        setAttemptsLeft(remainingAttempts);
        
        if (remainingAttempts <= 0) {
          setShowRegisterButton(true);
        }
      }
      
      // Set the subject, difficulty, and grade from the code data
      setSelectedSubject(codeData.subject);
      setSelectedDifficulty(codeData.difficulty);
      setSelectedGrade(codeData.grade);
      
      // Move to setup screen
      setGameState('setup');
    } catch (error) {
      console.error('Error validating code:', error);
      setCodeError('حدث خطأ أثناء التحقق من الرمز');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const goToTeacherPage = () => {
    window.location.href = '/teacher';
  };
  
  const goToRegistrationPage = () => {
    window.location.href = '/register';
  };
  
  // Leaderboard functions
  const loadLeaderboard = async () => {
    try {
      let query = supabase
        .from('game_sessions')
        .select('*')
        .order('score', { ascending: false })
        .order('accuracy', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(100);
      
      // Apply time filters
      if (leaderboardFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('created_at', today.toISOString());
      } else if (leaderboardFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Add rank to each entry
      const leaderboardData = data.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      showToast('حدث خطأ في تحميل لوحة المتصدرين', 'error');
    }
  };
  
  // ============ GAME LOGIC WITH RANDOMIZATION ============
  const isMathCategory = (cat) => {
    const mathCats = [
      'جمع', 'ضرب', 'طرح', 'قسمة', 'مسائل كلامية', 'نسبة مئوية', 'هندسة', 'جبر', 'أسس', 
      'جذور', 'معادلات', 'نظرية الأعداد', 'مثلثات', 'لوغاريتمات', 'دوال', 'متتاليات', 
      'تفاضل', 'تكامل', 'نهايات'
    ];
    return mathCats.includes(cat);
  };
  
  // ============ SECURE QUESTION FETCHING ============
  const getFilteredQuestions = async () => {
    setIsLoadingQuestions(true);
    setQuestionsError('');
    
    try {
      // Fetch questions from secure database
      const { data, error } = await supabase
        .from('course_content')
        .select('content')
        .eq('subject', selectedSubject)
        .eq('grade', selectedGrade)
        .eq('difficulty', selectedDifficulty)
        .eq('is_active', true);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setQuestionsError('لا توجد أسئلة متاحة للمادة والمرحلة والصعوبة المختارة');
        return [];
      }
      
      // Extract questions from the content field
      const allQuestions = [];
      data.forEach(row => {
        if (row.content && row.content.questions) {
          allQuestions.push(...row.content.questions);
        }
      });
      
      if (allQuestions.length === 0) {
        setQuestionsError('لا توجد أسئلة متاحة');
        return [];
      }
      
      // Enhanced randomization:
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      
      // Also shuffle the options for each question while keeping track of correct answer
      return shuffled.map(question => {
        const originalOptions = [...question.options];
        const correctAnswer = originalOptions[question.correct];
        
        const indices = [0, 1, 2, 3];
        const shuffledIndices = indices.sort(() => Math.random() - 0.5);
        
        const shuffledOptions = shuffledIndices.map(i => originalOptions[i]);
        
        const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
        
        return {
          ...question,
          options: shuffledOptions,
          correct: newCorrectIndex,
          originalQuestion: question
        };
      });
      
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestionsError('حدث خطأ في تحميل الأسئلة');
      return [];
    } finally {
      setIsLoadingQuestions(false);
    }
  };
  const startGame = async () => {
    // If user is registered, they can play unlimited times
    // If not registered, check attempts left
    if (!isRegistered && attemptsLeft <= 0 && !showRegisterButton) {
      showToast('لقد استنفذت محاولاتك المجانية', 'error');
      return;
    }
    
    setIsLoadingQuestions(true);
    const questions = await getFilteredQuestions();
    
    if (questions.length < 10) {
      showToast(`لا توجد أسئلة كافية للمرحلة والصعوبة المختارة. متوفر فقط ${questions.length} أسئلة والمطلوب 10.`, 'error');
      return;
    }
    
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const gameQuestions = shuffled.slice(0, 10);
    
    setCurrentQuestion(gameQuestions[0]);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsAnswered(false);
    setTimeLeft(30);
    setGameTimeLeft(300);
    setCurrentStreak(0);
    setGameStats({ score: 0, accuracy: 0, bestStreak: 0, totalQuestions: 0, correctAnswers: 0 });
    setGameQuestions(gameQuestions);
    resetAiAssistant();
    setGameState('game');
  };
  
  const handleAnswer = (answerIndex) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    const isCorrect = answerIndex === currentQuestion.correct;
    const newStreak = isCorrect ? currentStreak + 1 : 0;
    setCurrentStreak(newStreak);
    
    setGameStats(prev => {
      const newTotalQuestions = prev.totalQuestions + 1;
      const newCorrectAnswers = prev.correctAnswers + (isCorrect ? 1 : 0);
      const newScore = Math.round((newCorrectAnswers / 10) * 100);
      const newAccuracy = Math.round((newCorrectAnswers / newTotalQuestions) * 100);
      const newBestStreak = Math.max(prev.bestStreak, newStreak);
      return { 
        score: newScore, 
        accuracy: newAccuracy, 
        bestStreak: newBestStreak, 
        totalQuestions: newTotalQuestions, 
        correctAnswers: newCorrectAnswers 
      };
    });
    
    setTimeout(() => {
      const nextIndex = questionIndex + 1;
      if (nextIndex < gameQuestions.length && gameTimeLeft > 0) {
        setCurrentQuestion(gameQuestions[nextIndex]);
        setQuestionIndex(nextIndex);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setIsAnswered(false);
        setTimeLeft(30);
      } else {
        endGame();
      }
    }, 3000);
  };
  
  const endGame = async () => {
    const finalScore = Math.round((gameStats.correctAnswers / 10) * 100);
    const finalAccuracy = gameStats.totalQuestions > 0 
      ? Math.round((gameStats.correctAnswers / gameStats.totalQuestions) * 100)
      : 0;
      
    setGameStats(prev => ({
      ...prev,
      score: finalScore,
      accuracy: finalAccuracy
    }));
    
    try {
      // Save game session to database
      const { error } = await supabase
        .from('game_sessions')
        .insert({
          student_name: studentName.trim(),
          verification_code: verificationCode.trim(),
          attempt_number: 4 - attemptsLeft, // Since attemptsLeft is remaining
          grade: selectedGrade,
          difficulty: selectedDifficulty,
          subject: selectedSubject,
          score: finalScore,
          accuracy: finalAccuracy,
          best_streak: gameStats.bestStreak,
          total_questions: gameStats.totalQuestions
        });
        
      if (error) {
        console.error('Error saving game session:', error);
        showToast('حدث خطأ في حفظ النتيجة', 'error');
      } else {
        // Update attempts left only if user is not registered
        if (!isRegistered) {
          const newAttemptsLeft = Math.max(0, attemptsLeft - 1);
          setAttemptsLeft(newAttemptsLeft);
          
          if (newAttemptsLeft <= 0) {
            setShowRegisterButton(true);
          }
        }
      }
    } catch (error) {
      console.error('Save attempt error:', error);
      showToast('حدث خطأ في حفظ النتيجة', 'error');
    } finally {
      setGameState('results');
    }
  };
  
  useEffect(() => {
    if (gameState !== 'game') return;
    if (gameTimeLeft <= 0) {
      const finalScore = Math.round((gameStats.correctAnswers / 10) * 100);
      const finalAccuracy = gameStats.totalQuestions > 0 
        ? Math.round((gameStats.correctAnswers / gameStats.totalQuestions) * 100)
        : 0;
        
      setGameStats(prev => ({
        ...prev,
        score: finalScore,
        accuracy: finalAccuracy
      }));
      
      endGame();
      return;
    }
    const interval = setInterval(() => {
      setGameTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, gameTimeLeft]);
  
  useEffect(() => {
    if (gameState !== 'game' || isAnswered) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, timeLeft, isAnswered]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Use toLocaleDateString with 'en-US' to ensure Latin numerals
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return COLORS.success;
      case 'medium': return COLORS.warning;
      case 'hard': return COLORS.error;
      default: return COLORS.text;
    }
  };
  
  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'سهل';
      case 'medium': return 'متوسط';
      case 'hard': return 'صعب';
      default: return '';
    }
  };
  
  // ============ FIXED GEMINI AI INTEGRATION ============
  const callGeminiAPI = async (message, question) => {
    try {
      setIsAiLoading(true);
      const GEMINI_API_KEY = 'AIzaSyC7f1kCsBRrOi-2aCfNSzTvzLPif1vA1Ik';
      const prompt = `
أنت مساعد ذكي لتعليم الرياضيات باللغة العربية. 
السؤال الحالي: ${question.question}
الخيارات: ${question.options.join(', ')}
المرحلة التعليمية: ${selectedGrade}
الفئة: ${question.category}
المواد: ${selectedSubject}
سؤال الطالب: ${message}
تعليمات:
- أجب باللغة العربية فقط
- لا تعطي الإجابة الصحيحة مباشرة
- قدم تلميحات وشروحات تعليمية
- استخدم أمثلة بسيطة ومناسبة للمرحلة
- كن مشجعاً ومحفزاً
- اجعل إجابتك قصيرة (3-4 جمل كحد أقصى)
`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          }
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No valid response from Gemini API');
      }
    } catch (error) {
      console.error('❌ Gemini AI Error:', error);
      const category = question.category;
      let fallbackResponse = '';
      if (message.includes('تلميح') || message.includes('hint')) {
        const hints = {
          'جمع': 'ابدأ بالرقم الأكبر ثم أضف الأصغر',
          'ضرب': 'الضرب هو جمع متكرر - فكر في جداول الضرب',
          'طرح': 'ابدأ من العدد الأكبر وانقص منه',
          'قسمة': 'كم مرة يدخل العدد الثاني في الأول؟',
          'جبر': 'اعزل المتغير بنقل الأرقام للجانب الآخر',
          'جذور': 'أي عدد مضروب في نفسه يعطي هذا الرقم؟',
          'مثلثات': 'تذكر الزوايا الخاصة ونسب المثلثات',
          'تفاضل': 'استخدم قواعد الاشتقاق الأساسية',
          'تكامل': 'التكامل عكس التفاضل',
          'اللغة العربية': 'ابدأ بتحليل الكلمات والتركيب',
          'العلوم': 'فكر في القوانين العلمية الأساسية',
          'التاريخ': 'تذكر الأحداث المهمة والتوقيت الزمني',
          'الجغرافيا': 'فكر في المواقع الجغرافية والمناطق',
          'فيزياء': 'استخدم القوانين الفيزيائية الأساسية',
          'كيمياء': 'فكر في الروابط الكيميائية والخصائص',
          'بيولوجيا': 'تذكر الأنظمة البيولوجية والعمليات الحيوية'
        };
        fallbackResponse = `💡 تلميح: ${hints[category] || 'فكر في خطوات حل هذا النوع من المسائل'}`;
      } else if (message.includes('شرح') || message.includes('explain')) {
        fallbackResponse = `📚 الشرح: في ${category}، نحتاج لفهم المفهوم الأساسي أولاً. ابدأ بتحليل المعطيات.`;
      } else {
        fallbackResponse = `🤔 فهمت سؤالك حول ${category}! دعني أساعدك خطوة بخطوة.`;
      }
      return fallbackResponse;
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const handleAiHelp = async () => {
    if (aiHelpCount >= maxAiHelp) {
      showToast(`لقد استخدمت جميع المحاولات المتاحة (${maxAiHelp}) في هذا التحدي`, 'error');
      return;
    }
    if (!aiInput.trim()) return;
    const userMessage = aiInput.trim();
    setAiInput('');
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setAiMessages(prev => [...prev, newUserMessage]);
    setAiHelpCount(prev => prev + 1);
    const aiResponse = await callGeminiAPI(userMessage, currentQuestion);
    const aiMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };
    setAiMessages(prev => [...prev, aiMessage]);
  };
  
  const handleQuickHelp = async (type) => {
    if (aiHelpCount >= maxAiHelp) {
      showToast(`لقد استخدمت جميع المحاولات المتاحة (${maxAiHelp}) في هذا التحدي`, 'error');
      return;
    }
    let prompt = '';
    switch (type) {
      case 'hint':
        prompt = 'أعطني تلميحاً لحل هذا السؤال دون إعطاء الإجابة مباشرة';
        break;
      case 'explain':
        prompt = 'اشرح لي المفهوم المطلوب في هذا السؤال';
        break;
      case 'step':
        prompt = 'ما هي الخطوة الأولى لحل هذا السؤال؟';
        break;
      default:
        return;
    }
    setAiHelpCount(prev => prev + 1);
    const quickMessage = {
      id: Date.now(),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };
    setAiMessages(prev => [...prev, quickMessage]);
    const aiResponse = await callGeminiAPI(prompt, currentQuestion);
    const aiMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };
    setAiMessages(prev => [...prev, aiMessage]);
  };
  
  const resetAiAssistant = () => {
    setAiMessages([]);
    setAiHelpCount(0);
    setShowAiAssistant(false);
    setAiInput('');
  };
  
  // ============ UI COMPONENTS ============
  
  // Code Entry Screen
  if (gameState === 'enterCode') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" 
        style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }} 
        dir="rtl">
        <div className="w-full max-w-md">
          {/* Logo with animation */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl animate-pulse"
              style={{ backgroundColor: COLORS.accent }}>
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">تحدي التعلم</h1>
            <p className="text-white/80">اختبر مهاراتك في مواد متنوعة</p>
          </div>
          
          {/* Enhanced Card Design */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: COLORS.primary }}>
              أدخل بياناتك للبدء
            </h2>
            
            {/* Enhanced error display */}
            {codeError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center animate-pulse">
                <AlertCircle className="w-5 h-5 ml-2" />
                {codeError}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Enhanced input with floating label */}
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 z-10" 
                  style={{ color: COLORS.support1 }} />
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border-2 focus:outline-none focus:border-blue-400 transition-all"
                  style={{ borderColor: COLORS.support2 }}
                  placeholder=" "
                />
                <label className={`absolute right-12 transition-all ${studentName ? 'top-1 text-xs' : 'top-1/2 -translate-y-1/2'}`}
                  style={{ color: COLORS.textLight }}>
                  اسمك
                </label>
              </div>
              
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 z-10" 
                  style={{ color: COLORS.support1 }} />
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border-2 focus:outline-none focus:border-blue-400 transition-all"
                  style={{ borderColor: COLORS.support2 }}
                  placeholder=" "
                />
                <label className={`absolute right-12 transition-all ${verificationCode ? 'top-1 text-xs' : 'top-1/2 -translate-y-1/2'}`}
                  style={{ color: COLORS.textLight }}>
                  رمز التحقق من المعلم
                </label>
              </div>
            </div>
            
            {/* Enhanced button with animation */}
            <button
              onClick={validateCode}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: COLORS.secondary }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  دخول
                </>
              )}
            </button>
            
            {/* Enhanced info section */}
            <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-center" style={{ color: COLORS.primary }}>
                <span className="font-bold">ملاحظة:</span> لديك 3 محاولات مجانية فقط
              </p>
              <p className="text-xs text-center mt-1" style={{ color: COLORS.textLight }}>
                بعد استنفاذ المحاولات، يجب عليك التسجيل في MBSchool
              </p>
            </div>
            
            {/* Teacher Button */}
            {showTeacherButton && (
              <div className="mt-6 text-center">
                <button
                  onClick={goToTeacherPage}
                  className="text-sm font-medium underline hover:text-blue-700 transition-colors"
                  style={{ color: COLORS.primary }}
                >
                  صفحة المعلم
                </button>
              </div>
            )}
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-white opacity-10"></div>
        </div>
      </div>
    );
  }
  
  // Simplified Setup Screen
  if (gameState === 'setup') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COLORS.background }} dir="rtl">
        {/* Enhanced Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-10" style={{ borderColor: COLORS.support2 }}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: COLORS.accent }}>
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold" style={{ color: COLORS.primary }}>تحدي التعلم</h1>
                  <p className="text-sm" style={{ color: COLORS.textLight }}>
                    مرحباً، {studentName}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Enhanced attempts display */}
                <div className="text-center">
                  <div className="text-xs font-bold" style={{ color: COLORS.textLight }}>
                    المحاولات المتبقية
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <div className={`text-xl font-bold ${attemptsLeft <= 1 ? 'animate-pulse' : ''}`} 
                      style={{ color: attemptsLeft > 1 ? COLORS.accent : COLORS.error }}>
                      {attemptsLeft}
                    </div>
                    <div className="flex">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full mx-0.5" 
                          style={{ 
                            backgroundColor: i < attemptsLeft ? COLORS.accent : COLORS.support2,
                            opacity: i < attemptsLeft ? 1 : 0.3
                          }}></div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Enhanced exit button */}
                <button
                  onClick={() => {
                    setGameState('enterCode');
                    setStudentName('');
                    setVerificationCode('');
                    setAttemptsLeft(3);
                    setShowRegisterButton(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium transition-all hover:opacity-90 shadow-sm"
                  style={{ backgroundColor: COLORS.error }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Enhanced warning banner */}
            {attemptsLeft <= 1 && (
              <div className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200 animate-pulse">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 ml-2" />
                  <p className="text-yellow-700">
                    {attemptsLeft === 1 
                      ? 'لديك محاولة واحدة متبقية فقط! بعد هذه المحاولة، يجب عليك التسجيل في MBSchool للمتابعة.'
                      : 'لقد استنفذت محاولاتك المجانية. يرجى التسجيل في MBSchool للمتابعة.'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Enhanced Game Setup Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: COLORS.primary }}>
                <Settings className="w-6 h-6" />
                إعدادات التحدي
              </h2>
              
              {/* Enhanced Subject Selection */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: COLORS.text }}>
                  <BookOpen className="w-5 h-5" />
                  المادة
                </h3>
                <div className="p-4 rounded-xl border-2 flex items-center gap-3 transition-all hover:shadow-sm"
                  style={{ borderColor: COLORS.support2, backgroundColor: COLORS.background }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: SUBJECTS.find(s => s.id === selectedSubject)?.bgColor || COLORS.support2 }}>
                    {(() => {
                      const Icon = SUBJECTS.find(s => s.id === selectedSubject)?.icon || Book;
                      return <Icon className="w-5 h-5" style={{ color: SUBJECTS.find(s => s.id === selectedSubject)?.color || COLORS.primary }} />;
                    })()}
                  </div>
                  <div>
                    <div className="text-lg font-bold" style={{ color: COLORS.primary }}>
                      {selectedSubject}
                    </div>
                    <div className="text-sm" style={{ color: COLORS.textLight }}>
                      تم تحديدها من خلال رمز التحقق
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Grade Selection */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: COLORS.text }}>
                  <GraduationCap className="w-5 h-5" />
                  المرحلة التعليمية
                </h3>
                <div className="p-4 rounded-xl border-2 flex items-center gap-3 transition-all hover:shadow-sm"
                  style={{ borderColor: COLORS.support2, backgroundColor: COLORS.background }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: COLORS.primary + '20' }}>
                    <Users className="w-5 h-5" style={{ color: COLORS.primary }} />
                  </div>
                  <div>
                    <div className="text-lg font-bold" style={{ color: COLORS.primary }}>
                      {selectedGrade}
                    </div>
                    <div className="text-sm" style={{ color: COLORS.textLight }}>
                      تم تحديدها من خلال رمز التحقق
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Difficulty Selection */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: COLORS.text }}>
                  <Target className="w-5 h-5" />
                  مستوى الصعوبة
                </h3>
                <div className="p-4 rounded-xl border-2 flex items-center gap-3 transition-all hover:shadow-sm"
                  style={{ borderColor: COLORS.support2, backgroundColor: COLORS.background }}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedDifficulty === 'easy' ? 'bg-green-100' : 
                    selectedDifficulty === 'medium' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    {selectedDifficulty === 'easy' ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> : 
                      selectedDifficulty === 'medium' ? 
                      <AlertCircle className="w-5 h-5 text-yellow-600" /> : 
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                  </div>
                  <div>
                    <div className="text-lg font-bold" style={{ color: COLORS.primary }}>
                      {selectedDifficulty === 'easy' ? 'سهل' : selectedDifficulty === 'medium' ? 'متوسط' : 'صعب'}
                    </div>
                    <div className="text-sm" style={{ color: COLORS.textLight }}>
                      تم تحديدها من خلال رمز التحقق
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Start Button */}
              <button
                onClick={startGame}
                disabled={!selectedGrade || !selectedDifficulty || (attemptsLeft <= 0 && !showRegisterButton) || isLoadingQuestions}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-2 shadow-md ${
                  selectedGrade && selectedDifficulty && (attemptsLeft > 0 || showRegisterButton) && !isLoadingQuestions
                        ? 'hover:scale-105 hover:shadow-lg' : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ 
                  backgroundColor: selectedGrade && selectedDifficulty && (attemptsLeft > 0 || showRegisterButton) && !isLoadingQuestions
                        ? COLORS.secondary : COLORS.support1
                }}
              >
                {isLoadingQuestions ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    تحميل الأسئلة...
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    {selectedGrade && selectedDifficulty 
                      ? (attemptsLeft > 0 || showRegisterButton) ? 'ابدأ التحدي' : 'لا توجد محاولات متبقية'
                      : 'اختر المرحلة والصعوبة والمادة'}
                  </>
                )}
              </button>
            </div>
            
            {/* Enhanced Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: COLORS.primary }}>
                <BarChart3 className="w-5 h-5" />
                إحصائيات سريعة
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm flex items-center gap-1" style={{ color: COLORS.textLight }}>
                      <BookOpen className="w-4 h-4" />
                      المواد المتاحة
                    </span>
                    <span className="text-sm font-bold" style={{ color: COLORS.primary }}>
                      {SUBJECTS.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-700"
                      style={{ 
                        width: '100%',
                        backgroundColor: COLORS.secondary 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm flex items-center gap-1" style={{ color: COLORS.textLight }}>
                      <HelpCircle className="w-4 h-4" />
                      الأسئلة المتاحة
                    </span>
                    <span className="text-sm font-bold" style={{ color: COLORS.primary }}>
                     متاح في قاعدة البيانات
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-700"
                      style={{ 
                        width: '100%',
                        backgroundColor: COLORS.success 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm flex items-center gap-1" style={{ color: COLORS.textLight }}>
                      <Users className="w-4 h-4" />
                      المراحل التعليمية
                    </span>
                    <span className="text-sm font-bold" style={{ color: COLORS.primary }}>
                      4
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-700"
                      style={{ 
                        width: '100%',
                        backgroundColor: COLORS.accent 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Simplified Game Screen
  if (gameState === 'game' && currentQuestion) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COLORS.background }} dir="rtl">
        {/* Enhanced Game Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            {/* Enhanced Stats Bar */}
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-1" style={{ color: COLORS.primary }}>
                    <Trophy className="w-5 h-5" />
                    {gameStats.score}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.textLight }}>النقاط</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-1" style={{ color: COLORS.accent }}>
                    <Zap className="w-5 h-5" />
                    {currentStreak}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.textLight }}>متتالية</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold flex items-center justify-center gap-2" style={{ 
                  color: gameTimeLeft <= 60 ? COLORS.error : COLORS.secondary 
                }}>
                  <Clock className="w-6 h-6" />
                  {formatTime(gameTimeLeft)}
                </div>
              </div>
              {/* Enhanced Exit Button */}
              <button
                onClick={() => setIsExiting(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1"
                style={{ color: COLORS.error }}
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
            {/* Enhanced Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${((300 - gameTimeLeft) / 300) * 100}%`,
                  backgroundColor: COLORS.secondary 
                }}
              />
            </div>
          </div> 
        </div>
        
        {/* Exit Loading Overlay */}
        {isExiting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 flex flex-col items-center">
              <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: COLORS.secondary }} />
              <p className="text-lg font-medium" style={{ color: COLORS.primary }}>
                جاري الخروج من التحدي...
              </p>
            </div>
          </div>
        )}
        
        {/* Enhanced Question */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              {/* Enhanced Question Header */}
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                    style={{ backgroundColor: COLORS.primary }}>
                    {questionIndex + 1}
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-1" style={{ color: COLORS.primary }}>
                      <BookOpen className="w-4 h-4" />
                      السؤال {questionIndex + 1}
                    </div>
                    <div className="text-sm flex items-center gap-1" style={{ color: COLORS.textLight }}>
                      <Tag className="w-3 h-3" />
                      {currentQuestion.category}
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Timer */}
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke={COLORS.support2}
                      strokeWidth="4"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke={timeLeft <= 10 ? COLORS.error : COLORS.secondary}
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - (timeLeft / 30))}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold ${timeLeft <= 10 ? 'animate-pulse' : ''}`}
                      style={{ color: timeLeft <= 10 ? COLORS.error : COLORS.primary }}>
                      {timeLeft}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced AI Assistant Toggle */}
              <button
                onClick={() => setShowAiAssistant(!showAiAssistant)}
                className={`mb-4 px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  aiHelpCount >= maxAiHelp ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ 
                  backgroundColor: showAiAssistant ? COLORS.secondary : `${COLORS.secondary}20`,
                  color: showAiAssistant ? 'white' : COLORS.secondary
                }}
                disabled={aiHelpCount >= maxAiHelp}
              >
                <Sparkles className="w-4 h-4" />
                مساعد ذكي ({maxAiHelp - aiHelpCount} متبقي)
              </button>
              
              {/* Enhanced AI Assistant Panel */}
              {showAiAssistant && (
                <div className="mb-6 rounded-xl border-2 overflow-hidden transition-all"
                  style={{ borderColor: COLORS.secondary + '40' }}>
                  <div className="p-4" style={{ backgroundColor: COLORS.secondary + '10' }}>
                    {aiMessages.length === 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        <button
                          onClick={() => handleQuickHelp('hint')}
                          className="px-3 py-2 rounded-lg text-sm font-medium bg-white hover:scale-105 transition-all shadow-sm flex items-center gap-1"
                          style={{ color: COLORS.secondary }}
                          disabled={aiHelpCount >= maxAiHelp} 
                        >
                          <Lightbulb className="w-4 h-4" />
                          تلميح
                        </button>
                        <button
                          onClick={() => handleQuickHelp('explain')}
                          className="px-3 py-2 rounded-lg text-sm font-medium bg-white hover:scale-105 transition-all shadow-sm flex items-center gap-1"
                          style={{ color: COLORS.secondary }}
                          disabled={aiHelpCount >= maxAiHelp}
                        >
                          <BookOpen className="w-4 h-4" />
                          شرح
                        </button>
                      </div>
                    )}
                    <div className="max-h-40 overflow-y-auto mb-3 space-y-2">
                      {aiMessages.map((msg) => (
                        <div key={msg.id} className={`mb-2 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                          <span className={`inline-block px-3 py-2 rounded-xl text-sm ${
                            msg.type === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white'
                          }`}>
                            {msg.content}
                          </span>
                        </div>
                      ))}
                    </div>
                    {aiHelpCount < maxAiHelp && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAiHelp()}
                          placeholder="اسأل سؤالاً..."
                          className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-300"
                          style={{ borderColor: COLORS.support2 }}
                        />
                        <button
                          onClick={handleAiHelp}
                          disabled={!aiInput.trim() || isAiLoading}
                          className="px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center"
                          style={{ backgroundColor: COLORS.secondary }}
                        >
                          {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Enhanced Question Text */}
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-8 leading-relaxed" style={{ color: COLORS.primary }}>
                {currentQuestion.question}
              </h2>
              
              {/* Enhanced Answer Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={isAnswered}
                    className={`p-4 rounded-xl border-2 font-medium transition-all hover:scale-105 disabled:cursor-not-allowed flex items-start gap-3 ${
                      isAnswered
                        ? index === currentQuestion.correct
                          ? 'border-green-500 bg-green-50'
                          : index === selectedAnswer
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                      isAnswered
                        ? index === currentQuestion.correct
                          ? 'bg-green-500'
                          : index === selectedAnswer
                          ? 'bg-red-500'
                          : 'bg-gray-300'
                        : 'bg-blue-500'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 text-right">{option}</span>
                    {isAnswered && index === currentQuestion.correct && (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                    {isAnswered && index === selectedAnswer && index !== currentQuestion.correct && (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              
              {/* Enhanced Explanation */}
              {showExplanation && (
                <div className="rounded-xl p-4 animate-fadeIn" style={{ backgroundColor: `${COLORS.accent}10` }}>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: COLORS.accent }} />
                    <div>
                      <h4 className="font-bold mb-2 flex items-center gap-1" style={{ color: COLORS.primary }}>
                        <BookOpen className="w-4 h-4" />
                        التفسير
                      </h4>
                      <p style={{ color: COLORS.text }}>{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Progress indicator */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm" style={{ color: COLORS.textLight }}>
                السؤال {questionIndex + 1} من 10
              </span>
              <span className="text-sm font-medium" style={{ color: COLORS.primary }}>
                {Math.round(((questionIndex + 1) / 10) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{ 
                  width: `${((questionIndex + 1) / 10) * 100}%`,
                  backgroundColor: COLORS.secondary 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Simplified Results Screen
  if (gameState === 'results') {
    const performanceLevel = 
      gameStats.accuracy >= 90 ? { level: 'ممتاز', color: COLORS.success, icon: Crown } :
      gameStats.accuracy >= 75 ? { level: 'جيد جداً', color: COLORS.accent, icon: Star } :
      gameStats.accuracy >= 60 ? { level: 'جيد', color: COLORS.secondary, icon: Award } :
      { level: 'يحتاج تحسين', color: COLORS.error, icon: Target };
      
    return (
      <div className="min-h-screen flex items-center justify-center p-4" 
        style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }} 
        dir="rtl">
        <div className="w-full max-w-2xl mx-auto">
          {/* Enhanced Results Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 transition-all duration-500 transform hover:scale-105">
            {/* Enhanced Performance Badge */}
            <div className="text-center mb-8">
              <div className="relative w-32 h-32 mx-auto mb-4 transition-all duration-700 ease-out transform scale-100 hover:scale-110">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke={COLORS.support2}
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke={performanceLevel.color}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - (gameStats.accuracy / 100))}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold" style={{ color: performanceLevel.color }}>
                    {gameStats.accuracy}%
                  </span>
                  <span className="text-sm" style={{ color: COLORS.textLight }}>دقة</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2 transition-all duration-500" style={{ color: COLORS.primary }}>
                انتهى التحدي!
              </h1>
              <div className="flex items-center justify-center gap-2">
                <performanceLevel.icon className="w-6 h-6" style={{ color: performanceLevel.color }} />
                <p className="text-xl transition-all duration-500" style={{ color: performanceLevel.color }}>
                  أداء {performanceLevel.level}
                </p>
              </div>
            </div>
            
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Trophy, label: 'النقاط', value: `${gameStats.score}/100`, color: COLORS.accent },
                { icon: Target, label: 'الدقة', value: `${gameStats.accuracy}%`, color: COLORS.success },
                { icon: Zap, label: 'متتالية', value: gameStats.bestStreak, color: COLORS.secondary },
                { icon: Brain, label: 'أسئلة', value: `${gameStats.correctAnswers}/10`, color: COLORS.primary }
              ].map((stat, i) => (
                <div key={i} className="text-center opacity-0 animate-fade-in" style={{ animationDelay: `${i * 200}ms` }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-transform duration-300 hover:scale-110"
                    style={{ backgroundColor: stat.color + '20' }}>
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <div className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                    {stat.value}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.textLight }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1" style={{ color: COLORS.textLight }}>
                <span>التقدم</span>
                <span>{questionIndex + 1}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${((questionIndex + 1) / 10) * 100}%`,
                    backgroundColor: COLORS.secondary 
                  }}
                />
              </div>
            </div>
            
            {/* Enhanced Attempts Left */}
            {!isRegistered && (
              <div className="mb-8 p-4 rounded-xl text-center animate-pulse" style={{ 
                backgroundColor: attemptsLeft > 1 ? `${COLORS.accent}10` : `${COLORS.error}10`,
                border: `2px solid ${attemptsLeft > 1 ? COLORS.accent : COLORS.error}`
              }}>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-bold" style={{ color: attemptsLeft > 1 ? COLORS.accent : COLORS.error }}>
                    المحاولات المتبقية: {attemptsLeft}
                  </span>
                </div>
              </div>
            )}
            
            {/* Enhanced Leaderboard Button */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setShowLeaderboard(true);
                  loadLeaderboard();
                }}
                className="w-full py-3 rounded-xl font-bold transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-sm"
                style={{ backgroundColor: COLORS.support2, color: COLORS.primary }}
              >
                <Trophy className="w-5 h-5" />
                عرض لوحة المتصدرين
              </button>
            </div>
            
            {/* Enhanced Achievements */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { condition: gameStats.accuracy === 100, icon: Crown, title: 'دقة مثالية' },
                { condition: gameStats.bestStreak >= 5, icon: Flame, title: 'متتالية رائعة' },
                { condition: gameStats.score >= 100, icon: Trophy, title: 'نقاط عالية' }
              ].map((achievement, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-center transition-all hover:shadow-md ${
                    achievement.condition ? 'shadow-sm' : 'opacity-50'
                  }`}
                  style={{
                    backgroundColor: achievement.condition ? `${COLORS.accent}10` : COLORS.support2
                  }}
                >
                  <achievement.icon 
                    className="w-6 h-6 mx-auto mb-1" 
                    style={{ color: achievement.condition ? COLORS.accent : COLORS.support1 }} 
                  />
                  <div className="text-xs font-medium"
                    style={{ color: achievement.condition ? COLORS.accent : COLORS.textLight }}>
                    {achievement.title}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="flex flex-col gap-4">
              {!isRegistered && showRegisterButton ? (
                <>
                  <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 animate-pulse">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 ml-2" />
                      <p className="text-red-700">
                        لقد استنفذت محاولاتك المجانية. يرجى التسجيل في MBSchool للمتابعة.
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={goToRegistrationPage}
                    className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-md"
                    style={{ backgroundColor: COLORS.secondary }}
                  >
                    <GraduationCap className="w-5 h-5" />
                    سجل في MBSchool
                  </button>
                  
                  <button
                    onClick={() => {
                      setGameState('enterCode');
                      setStudentName('');
                      setVerificationCode('');
                      setAttemptsLeft(3);
                      setShowRegisterButton(false);
                    }}
                    className="w-full py-3 rounded-xl font-bold transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ backgroundColor: COLORS.support2, color: COLORS.primary }}
                  >
                    <RefreshCw className="w-5 h-5" />
                    استخدام رمز جديد
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setGameState('setup');
                      setSelectedGrade('');
                      setSelectedDifficulty('');
                      setSelectedSubject('');
                    }}
                    className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-md"
                    style={{ backgroundColor: COLORS.secondary }}
                  >
                    <RefreshCw className="w-5 h-5" />
                    تحدي جديد
                  </button>
                  
                  <button
                    onClick={startGame}
                    className="w-full py-3 rounded-xl font-bold transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ backgroundColor: COLORS.support2, color: COLORS.primary }}
                  >
                    <Play className="w-5 h-5" />
                    إعادة المحاولة
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Enhanced Leaderboard Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b" style={{ borderColor: COLORS.support2 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: COLORS.primary }}>
                    <Trophy className="w-6 h-6" style={{ color: COLORS.accent }} />
                    لوحة المتصدرين
                  </h2>
                  <button
                    onClick={() => setShowLeaderboard(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <X className="w-5 h-5" style={{ color: COLORS.support1 }} />
                  </button>
                </div>
                
                {/* Enhanced Filter Tabs */}
                <div className="flex flex-wrap mb-4 border-b" style={{ borderColor: COLORS.support2 }}>
                  {['all', 'today', 'week'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => {
                        setLeaderboardFilter(tab);
                        loadLeaderboard();
                      }}
                      className={`px-4 py-2 font-medium transition-all ${
                        leaderboardFilter === tab ? 'border-b-2' : ''
                      }`}
                      style={{
                        color: leaderboardFilter === tab ? COLORS.primary : COLORS.textLight,
                        borderColor: leaderboardFilter === tab ? COLORS.primary : 'transparent'
                      }}
                    >
                      {tab === 'all' ? 'الكل' : tab === 'today' ? 'اليوم' : 'هذا الأسبوع'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl transition-all hover:shadow-md ${
                          entry.rank <= 3 ? `${COLORS.accent}10` : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm"
                            style={{
                              backgroundColor: 
                                entry.rank === 1 ? COLORS.accent :
                                entry.rank === 2 ? COLORS.secondary :
                                entry.rank === 3 ? '#CD7F32' : COLORS.support1
                            }}
                          >
                            {entry.rank <= 3 ? (
                              entry.rank === 1 ? <Crown className="w-5 h-5" /> :
                              entry.rank === 2 ? <Medal className="w-5 h-5" /> :
                              <Award className="w-5 h-5" />
                            ) : (
                              entry.rank
                            )}
                          </div>
                          <div>
                            <div className="font-bold flex items-center gap-1" style={{ color: COLORS.text }}>
                              <User className="w-4 h-4" />
                              {entry.student_name}
                            </div>
                            <div className="text-sm flex flex-col sm:flex-row gap-1 sm:gap-4" style={{ color: COLORS.textLight }}>
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                دقة: {entry.accuracy}%
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                متتالية: {entry.best_streak}
                              </span>
                              <span className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                {entry.grade} - {getDifficultyLabel(entry.difficulty)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right mt-2 sm:mt-0">
                          <div className="text-2xl font-bold flex items-center justify-end gap-1" style={{ color: COLORS.primary }}>
                            {entry.score}
                            <Trophy className="w-5 h-5" style={{ color: COLORS.accent }} />
                          </div>
                          <div className="text-xs" style={{ color: COLORS.textLight }}>
                            نقطة
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm" style={{ color: COLORS.textLight }}>
                      لا توجد نتائج بعد
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
   
  // Error fallback
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
      <div className="text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.error }} />
        <h2 className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
          حدث خطأ
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: COLORS.secondary }}
        >
          إعادة تحميل
        </button>
      </div>
    </div>
  );
};

export default SimplifiedMathChallenge;