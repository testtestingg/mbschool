import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Key, 
  Copy, 
  Trash2, 
  PlusCircle, 
  CalendarDays,
  Users,
  Trophy,
  LogOut,
  Loader2,
  Crown,
  AlertCircle,
  CheckCircle,
  X,
  Book,
  Shield,
  ArrowLeft,
  Medal,
  Award,
  BarChart3,
  Settings,
  Calculator,
  Target,
  Clock,
  Tag,
  XCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const COLORS = {
  primary: '#1D4ED8',
  secondary: '#3B82F6',
  accent: '#10B981',
  success: '#22C55E',
  warning: '#EAB308',
  error: '#EF4444',
  background: '#F9FAFB',
  text: '#111827',
  textLight: '#6B7280',
  support1: '#9CA3AF',
  support2: '#E5E7EB'
};


// Use central Supabase client (reads credentials from Vite env vars via src/lib/supabase)

// Define SUBJECTS as a constant array
const SUBJECTS = [
  { id: 'رياضيات', name: 'رياضيات', icon: Calculator, color: '#1D4ED8', bgColor: '#EFF6FF' },
  { id: 'لغة عربية', name: 'لغة عربية', icon: Book, color: '#10B981', bgColor: '#F0FDF4' },
  { id: 'علوم', name: 'علوم', icon: Shield, color: '#EAB308', bgColor: '#FEFCE8' },
  { id: 'تاريخ', name: 'تاريخ', icon: Clock, color: '#EF4444', bgColor: '#FEF2F2' },
  { id: 'الجغرافيا', name: 'الجغرافيا', icon: Target, color: '#3B82F6', bgColor: '#EFF6FF' },
  { id: 'فيزياء', name: 'فيزياء', icon: Shield, color: '#8B5CF6', bgColor: '#F5F3FF' },
  { id: 'كيمياء', name: 'كيمياء', icon: Shield, color: '#EC4899', bgColor: '#FDF2F8' },
  { id: 'بيولوجيا', name: 'بيولوجيا', icon: Shield, color: '#14B8A6', bgColor: '#F0FDFA' }
];

const GRADES = [
  { key: 'ابتدائي', label: 'ابتدائي' },
  { key: 'إعدادي', label: 'إعدادي' },
  { key: 'ثانوي', label: 'ثانوي' },
  { key: 'بكالوريا', label: 'بكالوريا' }
];

const DIFFICULTIES = [
  { key: 'easy', label: 'سهل', color: COLORS.success, icon: CheckCircle },
  { key: 'medium', label: 'متوسط', color: COLORS.warning, icon: AlertCircle },
  { key: 'hard', label: 'صعب', color: COLORS.error, icon: XCircle }
];

const TeacherPage = () => {
  const [teacherName, setTeacherName] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [newCode, setNewCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState(24);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [showCopied, setShowCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState('all');
  
  // New state for subject, difficulty, and grade selection
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  
  // Check if teacher is already logged in
  useEffect(() => {
    const savedTeacherName = localStorage.getItem('teacherName');
    if (savedTeacherName) {
      setTeacherName(savedTeacherName);
      setIsLoggedIn(true);
      loadTeacherCodes(savedTeacherName);
    }
  }, []);
  
  const handleLogin = async () => {
    if (!teacherName.trim() || !teacherPassword.trim()) {
      showToast('الرجاء إدخال اسم المعلم وكلمة المرور', 'error');
      return;
    }
    setIsSubmitting(true);
    
    try {
      console.log("Attempting login with:", { 
        teacherName: teacherName.trim(), 
        teacherPassword: teacherPassword 
      });
      
      // Check teacher credentials in database
      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('name', teacherName.trim())
        .eq('password', teacherPassword)
        .single();
      
      console.log("Supabase response:", { teacher, error });
        
      if (error || !teacher) {
        console.error("Login failed:", error);
        showToast('اسم المعلم أو كلمة المرور غير صحيحة', 'error');
        return;
      }
      
      console.log("Login successful for:", teacher.name);
      setIsLoggedIn(true);
      localStorage.setItem('teacherName', teacherName);
      await loadTeacherCodes(teacherName);
      showToast('تم تسجيل الدخول بنجاح', 'success');
    } catch (error) {
      console.error('Login error:', error);
      showToast('حدث خطأ في تسجيل الدخول', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('teacherName');
    setTeacherName('');
    setTeacherPassword('');
    showToast('تم تسجيل الخروج بنجاح', 'success');
  };
  
  const loadTeacherCodes = async (teacher) => {
    try {
      // First get teacher ID
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('name', teacher)
        .single();
      if (teacherError) throw teacherError;
      
      const { data, error } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('teacher_id', teacherData.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setGeneratedCodes(data || []);
    } catch (error) {
      console.error('Error loading teacher codes:', error);
      showToast('حدث خطأ في تحميل الرموز', 'error');
    }
  };
  
  const generateNewCode = async () => {
    if (!teacherName || !selectedSubject || !selectedDifficulty || !selectedGrade) {
      showToast('الرجاء اختيار المادة والصعوبة والمرحلة التعليمية', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get teacher ID
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('name', teacherName)
        .single();
      if (teacherError) throw teacherError;
      
      // Generate a random 6-character code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + codeExpiry);
      
      // Save to database with subject, difficulty, and grade
      const { data, error } = await supabase
        .from('verification_codes')
        .insert({
          code: result,
          teacher_id: teacherData.id,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          max_attempts: maxAttempts,
          is_active: true,
          subject: selectedSubject,
          difficulty: selectedDifficulty,
          grade: selectedGrade
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setNewCode(result);
      setGeneratedCodes(prev => [data, ...prev]);
      showToast('تم إنشاء الرمز بنجاح', 'success');
    } catch (error) {
      console.error('Error generating code:', error);
      showToast('حدث خطأ في إنشاء الرمز', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const goToLearningPage = () => {
    window.location.href = '/learning-challenge';
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };
  
  const deleteCode = async (id) => {
    try {
      const { error } = await supabase
        .from('verification_codes')
        .update({ is_active: false })
        .eq('id', id);
        
      if (error) throw error;
      
      setGeneratedCodes(prev => prev.filter(code => code.id !== id));
      showToast('تم حذف الرمز بنجاح', 'success');
    } catch (error) {
      console.error('Error deleting code:', error);
      showToast('حدث خطأ في حذف الرمز', 'error');
    }
  };
  
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
  
  if (!isLoggedIn) {
    return (
      <div className="teacher-page min-h-screen flex items-center justify-center p-4" 
        style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }} 
        dir="rtl">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl animate-pulse"
              style={{ backgroundColor: COLORS.accent }}>
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">لوحة المعلم</h1>
            <p className="text-white/80">إنشاء رموز الوصول للطلاب</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: COLORS.primary }}>
              تسجيل دخول المعلم
            </h2>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: COLORS.support1 }}>
                  <Users />
                </div>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border-2 focus:outline-none focus:border-blue-400 transition-all"
                  style={{ borderColor: COLORS.support2 }}
                  placeholder=" "
                />
                <label className={`absolute right-12 transition-all ${teacherName ? 'top-1 text-xs' : 'top-1/2 -translate-y-1/2'}`}
                  style={{ color: COLORS.textLight }}>
                  اسم المعلم
                </label>
              </div>
              
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: COLORS.support1 }}>
                  <Key />
                </div>
                <input
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border-2 focus:outline-none focus:border-blue-400 transition-all"
                  style={{ borderColor: COLORS.support2 }}
                  placeholder=" "
                />
                <label className={`absolute right-12 transition-all ${teacherPassword ? 'top-1 text-xs' : 'top-1/2 -translate-y-1/2'}`}
                  style={{ color: COLORS.textLight }}>
                  كلمة المرور
                </label>
              </div>
            </div>
            
            <button
              onClick={handleLogin}
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
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                  دخول
                </>
              )}
            </button>
            
            <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-center" style={{ color: COLORS.primary }}>
                <span className="font-bold">ملاحظة:</span> هذه الصفحة مخصصة للمعلمين فقط
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="teacher-page min-h-screen" style={{ backgroundColor: COLORS.background }} dir="rtl">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10" style={{ borderColor: COLORS.support2 }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: COLORS.accent }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold" style={{ color: COLORS.primary }}>لوحة المعلم</h1>
                <p className="text-sm" style={{ color: COLORS.textLight }}>
                  مرحباً، {teacherName}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowLeaderboard(true);
                  loadLeaderboard();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                style={{ color: COLORS.primary }}
                title="لوحة المتصدرين"
              >
                <Trophy className="w-5 h-5" />
              </button>
              
              <button
                onClick={goToLearningPage}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: COLORS.secondary }}
                title="العودة إلى صفحة التعلم"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>صفحة التعلم</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: COLORS.error }}
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Generate Code Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: COLORS.primary }}>
              <Settings className="w-6 h-6" />
              إنشاء رمز جديد  
            </h2>
            
            {/* Enhanced Subject Selection */}
            <div className="mb-6">
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: COLORS.text }}>
                <Book className="w-5 h-5" />
                اختر المادة
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {SUBJECTS.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                      selectedSubject === subject.id ? 'scale-105 shadow-md' : 'hover:scale-102'
                    }`}
                    style={{
                      borderColor: selectedSubject === subject.id ? COLORS.secondary : COLORS.support2,
                      backgroundColor: selectedSubject === subject.id ? `${COLORS.secondary}20` : 'white'
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: subject.bgColor }}>
                      <subject.icon className="w-5 h-5" style={{ color: subject.color }} />
                    </div>
                    <div className="text-sm font-bold text-center"
                      style={{ color: selectedSubject === subject.id ? COLORS.secondary : COLORS.text }}>
                      {subject.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Enhanced Grade Selection */}
            <div className="mb-6">
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: COLORS.text }}>
                <GraduationCap className="w-5 h-5" />
                اختر المرحلة التعليمية
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {GRADES.map(grade => (
                  <button
                    key={grade.key}
                    onClick={() => setSelectedGrade(grade.key)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                      selectedGrade === grade.key ? 'scale-105 shadow-md' : 'hover:scale-102'
                    }`}
                    style={{
                      borderColor: selectedGrade === grade.key ? COLORS.secondary : COLORS.support2,
                      backgroundColor: selectedGrade === grade.key ? `${COLORS.secondary}10` : 'white'
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: COLORS.primary + '20' }}>
                      <Users className="w-5 h-5" style={{ color: COLORS.primary }} />
                    </div>
                    <div className="text-sm font-bold text-center"
                      style={{ color: selectedGrade === grade.key ? COLORS.secondary : COLORS.text }}>
                      {grade.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Enhanced Difficulty Selection */}
            <div className="mb-6">
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: COLORS.text }}>
                <Target className="w-5 h-5" />
                اختر مستوى الصعوبة
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTIES.map(diff => (
                  <button
                    key={diff.key}
                    onClick={() => setSelectedDifficulty(diff.key)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                      selectedDifficulty === diff.key ? 'scale-105 shadow-md' : 'hover:scale-102'
                    }`}
                    style={{
                      borderColor: selectedDifficulty === diff.key ? COLORS.secondary : COLORS.support2,
                      backgroundColor: selectedDifficulty === diff.key ? `${COLORS.secondary}20` : 'white'
                    }}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      diff.key === 'easy' ? 'bg-green-100' : 
                      diff.key === 'medium' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <diff.icon className="w-5 h-5" style={{ 
                        color: diff.key === 'easy' ? COLORS.success : 
                              diff.key === 'medium' ? COLORS.warning : COLORS.error 
                      }} />
                    </div>
                    <div className="text-sm font-bold text-center"
                      style={{ color: selectedDifficulty === diff.key ? COLORS.secondary : COLORS.text }}>
                      {diff.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1" style={{ color: COLORS.text }}>
                  <Clock className="w-4 h-4" />
                  مدة الصلاحية (ساعات)
                </label>
                <select
                  value={codeExpiry}
                  onChange={(e) => setCodeExpiry(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-blue-400 transition-all"
                  style={{ borderColor: COLORS.support2 }}
                >
                  <option value="1">1 ساعة</option>
                  <option value="6">6 ساعات</option>
                  <option value="24">24 ساعة</option>
                  <option value="48">48 ساعة</option>
                  <option value="72">3 أيام</option>
                  <option value="168">أسبوع</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1" style={{ color: COLORS.text }}>
                  <BarChart3 className="w-4 h-4" />
                  عدد المحاولات المسموحة
                </label>
                <select
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-blue-400 transition-all"
                  style={{ borderColor: COLORS.support2 }}
                >
                  <option value="1">1 محاولة</option>
                  <option value="3">3 محاولات</option>
                  <option value="5">5 محاولات</option>
                  <option value="10">10 محاولات</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={generateNewCode}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: COLORS.secondary }}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      إنشاء رمز
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {newCode && (
              <div className="p-4 rounded-xl border-2 border-dashed animate-pulse" style={{ borderColor: COLORS.secondary }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium mb-1 flex items-center gap-1" style={{ color: COLORS.textLight }}>
                      <Key className="w-4 h-4" />
                      الرمز الجديد:
                    </div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                      {newCode}
                    </div>
                    <div className="mt-2 text-sm" style={{ color: COLORS.textLight }}>
                      <div className="flex items-center gap-1">
                        <Book className="w-3 h-3" />
                        المادة: {selectedSubject}
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        المرحلة: {selectedGrade}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        الصعوبة: {selectedDifficulty === 'easy' ? 'سهل' : selectedDifficulty === 'medium' ? 'متوسط' : 'صعب'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(newCode)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                    style={{ color: COLORS.secondary }}
                  >
                    {showCopied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className="mt-2 text-sm flex items-center gap-1" style={{ color: COLORS.textLight }}>
                  <Clock className="w-3 h-3" />
                  ينتهي في: {formatDate(new Date(Date.now() + codeExpiry * 60 * 60 * 1000))}
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Generated Codes */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: COLORS.primary }}>
              <Key className="w-6 h-6" />
              الرموز المنشأة
            </h2>
            
            {generatedCodes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: COLORS.support2 }}>
                      <th className="py-3 px-4 text-right text-sm font-medium" style={{ color: COLORS.textLight }}>
                        الرمز
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium" style={{ color: COLORS.textLight }}>
                        المادة
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium" style={{ color: COLORS.textLight }}>
                        المرحلة
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium" style={{ color: COLORS.textLight }}>
                        الصعوبة
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium" style={{ color: COLORS.textLight }}>
                        تاريخ الإنشاء
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium" style={{ color: COLORS.textLight }}>
                        تاريخ الانتهاء
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium" style={{ color: COLORS.textLight }}>
                        المحاولات
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium" style={{ color: COLORS.textLight }}>
                        الحالة
                      </th>
                      <th className="py-3 px-4 text-right text-sm font-medium" style={{ color: COLORS.textLight }}>
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedCodes.map((code) => (
                      <tr key={code.id} className="border-b hover:bg-gray-50" style={{ borderColor: COLORS.support2 }}>
                        <td className="py-3 px-4 font-medium" style={{ color: COLORS.primary }}>
                          {code.code}
                        </td>
                        <td className="py-3 px-4 text-sm" style={{ color: COLORS.text }}>
                          {code.subject}
                        </td>
                        <td className="py-3 px-4 text-sm" style={{ color: COLORS.text }}>
                          {code.grade}
                        </td>
                        <td className="py-3 px-4 text-sm" style={{ color: COLORS.text }}>
                          {code.difficulty === 'easy' ? 'سهل' : code.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                        </td>
                        <td className="py-3 px-4 text-sm" style={{ color: COLORS.text }}>
                          {formatDate(code.created_at)}
                        </td>
                        <td className="py-3 px-4 text-sm" style={{ color: COLORS.text }}>
                          {formatDate(code.expires_at)}
                        </td>
                        <td className="py-3 px-4 text-sm" style={{ color: COLORS.text }}>
                          {code.max_attempts || 3}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            new Date(code.expires_at) < new Date() 
                              ? 'bg-red-100 text-red-800' 
                              : code.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {new Date(code.expires_at) < new Date() 
                              ? 'منتهي الصلاحية' 
                              : code.is_active 
                                ? 'نشط' 
                                : 'غير نشط'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => deleteCode(code.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-all"
                            style={{ color: COLORS.error }}
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Key className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm" style={{ color: COLORS.textLight }}>
                  لا توجد رموز منشأة بعد
                </p>
              </div>
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
                            <Users className="w-4 h-4" />
                            {entry.student_name}
                          </div>
                          <div className="text-sm flex flex-col sm:flex-row gap-1 sm:gap-4" style={{ color: COLORS.textLight }}>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              دقة: {entry.accuracy}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              متتالية: {entry.best_streak}
                            </span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {entry.grade} - {entry.difficulty === 'easy' ? 'سهل' : entry.difficulty === 'medium' ? 'متوسط' : 'صعب'}
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
};

export default TeacherPage;