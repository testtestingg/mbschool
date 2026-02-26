import React, { useState } from 'react';
import { 
  GraduationCap, 
  User, 
  Mail, 
  Lock, 
  CheckCircle,
  AlertCircle,  
  Loader2
} from 'lucide-react';

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

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.name.trim()) {
      setError('الرجاء إدخال الاسم');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('الرجاء إدخال البريد الإلكتروني');
      return;
    }
    
    if (!formData.password) {
      setError('الرجاء إدخال كلمة المرور');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call to register the user
      // For demo purposes, we'll simulate a successful registration
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set a cookie to track registration
      document.cookie = `mbschool_registered=true; path=/; max-age=${365 * 24 * 60 * 60}`; // 1 year
      
      setRegistrationSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError('حدث خطأ أثناء التسجيل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToGame = () => {
    window.location.href = '/';
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" 
        style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }} 
        dir="rtl">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.primary }}>
              تم التسجيل بنجاح!
            </h2>
            <p className="mb-6" style={{ color: COLORS.textLight }}>
              شكراً لتسجيلك في MBSchool. يمكنك الآن الوصول الكامل إلى جميع التحديات.
            </p>
            <button
              onClick={goToGame}
              className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: COLORS.secondary }}
            >
              ابدأ التعلم الآن
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
      style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }} 
      dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl"
            style={{ backgroundColor: COLORS.accent }}>
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">تسجيل في MBSchool</h1>
          <p className="text-white/80">احصل على وصول كامل إلى جميع التحديات</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: COLORS.primary }}>
            إنشاء حساب جديد
          </h2>
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center">
              <AlertCircle className="w-5 h-5 ml-2" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: COLORS.support1 }}>
                  <User />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border-2 focus:outline-none focus:border-blue-400 transition-all"
                  style={{ borderColor: COLORS.support2 }}
                  placeholder="الاسم الكامل"
                />
              </div>
              
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: COLORS.support1 }}>
                  <Mail />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border-2 focus:outline-none focus:border-blue-400 transition-all"
                  style={{ borderColor: COLORS.support2 }}
                  placeholder="البريد الإلكتروني"
                />
              </div>
              
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: COLORS.support1 }}>
                  <Lock />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border-2 focus:outline-none focus:border-blue-400 transition-all"
                  style={{ borderColor: COLORS.support2 }}
                  placeholder="كلمة المرور"
                />
              </div>
              
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                  style={{ color: COLORS.support1 }}>
                  <Lock />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border-2 focus:outline-none focus:border-blue-400 transition-all"
                  style={{ borderColor: COLORS.support2 }}
                  placeholder="تأكيد كلمة المرور"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 mt-6 disabled:opacity-50"
              style={{ backgroundColor: COLORS.secondary }}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                'إنشاء حساب'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm" style={{ color: COLORS.textLight }}>
            <p>بالإنضمام إلينا، أنت توافق على شروط الخدمة وسياسة الخصوصية</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;