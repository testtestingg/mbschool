import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, X, Mail, User, Phone, BookOpen, MessageSquare, Send, MapPin, Building, AlertTriangle, Shield, Search, Calculator, AlertCircle } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

// --- Types ---
interface FormData {
  fullName: string;
  email: string;
  studentPhone: string;
  school: string;
  address: string;
  additionalMessage: string;
  level: string;
  grade: string;
  section: string;
  courses: string[];
  honeypot: string;
  timestamp: number;
  captchaToken: string | null;
  moyenneGenerale: string;
}

interface ModalState {
  isOpen: boolean;
  isSuccess: boolean;
  message: string;
}

interface SpamWarning {
  field: string;
  message: string;
}

// --- Helper Components (Moved OUTSIDE to fix focus issues) ---

const HeaderWithBack = ({ title, sub, onBack }: { title: string, sub: string, onBack: () => void }) => (
  <div className="flex items-center justify-between mb-8">
    <button 
      onClick={onBack} 
      className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-gray-500 hover:text-[#0E2138]"
      type="button"
    >
      <ArrowRight className="w-6 h-6" />
    </button>
    <div className="text-center">
      <h2 className="text-2xl font-extrabold text-[#0E2138]">{title}</h2>
      <p className="text-gray-500 text-sm mt-1">{sub}</p>
    </div>
    <div className="w-12"></div>
  </div>
);

const SelectionCard = ({ title, subtitle, icon: Icon, onClick, delay = 0, accentColor = "03CCED" }: any) => (
  <motion.button
    onClick={onClick}
    className="w-full p-6 bg-white rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 text-right group hover:border-[#03CCED] hover:shadow-lg hover:shadow-[#03CCED]/10 relative overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type="button"
  >
    <div className="flex items-center justify-between relative z-10">
      <div className="flex items-center space-x-5 space-x-reverse">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-[#${accentColor}]/10 group-hover:bg-[#${accentColor}] transition-colors duration-300`}>
          <Icon className={`w-7 h-7 text-[#${accentColor}] group-hover:text-white transition-colors duration-300`} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#0E2138]">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className={`w-8 h-8 rounded-full border-2 border-gray-100 flex items-center justify-center group-hover:border-[#${accentColor}] group-hover:bg-[#${accentColor}] transition-all`}>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-white" />
      </div>
    </div>
  </motion.button>
);

const InputField = ({ label, icon: Icon, value, onChange, error, placeholder, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-[#0E2138] mr-1">{label}</label>
    <div className="relative group">
      <Icon className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#03CCED]'}`} />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pr-12 pl-4 py-4 border rounded-2xl outline-none transition-all bg-gray-50 focus:bg-white text-base ${
          error 
          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
          : 'border-transparent focus:border-[#03CCED] focus:ring-4 focus:ring-[#03CCED]/10'
        }`}
        placeholder={placeholder}
        dir="rtl"
      />
    </div>
    {error && <p className="text-red-500 text-xs font-medium mr-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {error}</p>}
  </div>
);

const PrimaryButton = ({ onClick, disabled, label, icon: Icon }: any) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    className="w-full bg-[#0E2138] text-white py-5 px-6 rounded-2xl font-bold hover:bg-[#1a3a5f] focus:ring-4 focus:ring-[#0E2138]/20 transition-all duration-300 shadow-xl shadow-[#0E2138]/20 flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    type="button"
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </motion.button>
);

const ReviewItem = ({ label, value, fullWidth = false }: any) => (
  <div className={`${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{label}</label>
    <p className="text-[#0E2138] font-semibold text-lg">{value || '-'}</p>
  </div>
);

// --- Main Component ---

const Registration = () => {
  const formSteps = [
    'welcome',
    'level',
    'grade',
    'section',
    'courses',
    'contactInfo',
    'academicInfo',
    'message',
    'confirm'
  ] as const;
  
  type FormStep = typeof formSteps[number];
  
  const [currentStep, setCurrentStep] = useState<FormStep>('welcome');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    studentPhone: '',
    school: '',
    address: '',
    additionalMessage: '',
    level: '',
    grade: '',
    section: '',
    courses: [],
    honeypot: '',
    timestamp: Date.now(),
    captchaToken: null,
    moyenneGenerale: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalState>({ isOpen: false, isSuccess: false, message: '' });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [spamWarnings, setSpamWarnings] = useState<SpamWarning[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const validateField = (name: keyof FormData, value: string): string | null => {
    switch (name) {
      case 'fullName':
        return !value.trim() ? 'هذه الخانة مطلوبة' : value.trim().length < 2 ? 'يجب أن يكون الاسم أكثر من حرفين' : null;
      case 'email':
        return value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'البريد الإلكتروني غير صحيح' : null;
      case 'studentPhone':
        return !value.trim() ? 'رقم الهاتف مطلوب' : !/^\d{8}$/.test(value.replace(/\s/g, '')) ? 'رقم الهاتف يجب أن يكون 8 أرقام' : null;
      case 'school':
        return !value.trim() ? 'اسم المعهد/المدرسة مطلوب' : null;
      case 'address':
        return !value.trim() ? 'العنوان مطلوب' : null;
      case 'additionalMessage':
        return value.trim().length > 0 && value.trim().length < 10 ? 'الرسالة يجب أن تكون أكثر من 10 أحرف' : null;
      case 'moyenneGenerale':
        if (!value.trim()) return 'هذه الخانة مطلوبة';
        const num = parseFloat(value);
        if (isNaN(num)) return 'يجب أن يكون رقماً';
        if (num < 0 || num > 20) return 'المعدل يجب أن يكون بين 0 و 20';
        return null;
      case 'grade':
        if (formData.level && !value.trim() && formData.level !== 'بكالوريا') return 'يجب اختيار السنة الدراسية';
        return null;
      case 'section':
        const needsSection = 
          (formData.level === 'ثانوي' && formData.grade && formData.grade !== 'السنة الأولى') ||
          formData.level === 'بكالوريا';
        if (needsSection && !value.trim()) return 'يجب اختيار الشعبة';
        return null;
      default:
        return null;
    }
  };

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => {
        const newData = { ...prev, [field]: value };
        return newData;
    });
    
    if (typeof value === 'string') {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const detectSpam = (data: FormData): SpamWarning[] => {
    const warnings: SpamWarning[] = [];
    if (data.honeypot.trim()) warnings.push({ field: 'honeypot', message: 'Bot detected' });
    if (Date.now() - data.timestamp < 2000) warnings.push({ field: 'time', message: 'Submission too fast' });
    const obviousFakePhones = [/^1{8}$/, /^0{8}$/, /^12345678$/, /^87654321$/, /^11111111$/, /^00000000$/];
    if (obviousFakePhones.some(pattern => pattern.test(data.studentPhone.replace(/\s/g, '')))) warnings.push({ field: 'studentPhone', message: 'Fake phone number' });
    return warnings;
  };

  const handleNext = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    let canProceed = true;
    
    // Validation logic per step
    if (currentStep === 'level' && !formData.level) {
        setErrors(prev => ({ ...prev, level: 'يجب اختيار المستوى الدراسي' }));
        canProceed = false;
    }
    else if (currentStep === 'grade') {
        const gradeError = validateField('grade', formData.grade);
        if (gradeError) { setErrors(prev => ({ ...prev, grade: gradeError })); canProceed = false; }
    }
    else if (currentStep === 'section') {
        const sectionError = validateField('section', formData.section);
        if (sectionError) { setErrors(prev => ({ ...prev, section: sectionError })); canProceed = false; }
    }
    else if (currentStep === 'contactInfo') {
        const contactFields: (keyof FormData)[] = ['fullName', 'studentPhone', 'address'];
        if (formData.email) contactFields.push('email');
        for (const field of contactFields) {
          const error = validateField(field, formData[field] as string);
          if (error) { setErrors(prev => ({ ...prev, [field]: error })); canProceed = false; }
        }
    }
    else if (currentStep === 'academicInfo') {
        const academicFields: (keyof FormData)[] = ['moyenneGenerale', 'school'];
        for (const field of academicFields) {
          const error = validateField(field, formData[field] as string);
          if (error) { setErrors(prev => ({ ...prev, [field]: error })); canProceed = false; }
        }
    }
    else if (currentStep === 'courses' && formData.courses.length === 0) {
        setErrors(prev => ({ ...prev, courses: 'يرجى اختيار مادة واحدة على الأقل' }));
        canProceed = false;
    }
    
    if (!canProceed) {
      setIsProcessing(false);
      return;
    }
    
    const currentIndex = formSteps.indexOf(currentStep);
    if (currentIndex < formSteps.length - 1) {
      if (currentStep === 'level') {
        if (formData.level === 'بكالوريا') setCurrentStep('section');
        else setCurrentStep('grade');
      } else if (currentStep === 'grade') {
        if (formData.level === 'إعدادي' || (formData.level === 'ثانوي' && formData.grade === 'السنة الأولى')) setCurrentStep('courses');
        else setCurrentStep('section');
      } else {
        setCurrentStep(formSteps[currentIndex + 1]);
      }
    }
    setIsProcessing(false);
  };

  const handleBack = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const currentIndex = formSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      if (currentStep === 'courses') {
        if (formData.level === 'بكالوريا') setCurrentStep('section');
        else if (formData.level === 'إعدادي' || (formData.level === 'ثانوي' && formData.grade === 'السنة الأولى')) setCurrentStep('grade');
        else setCurrentStep('section');
      } else if (currentStep === 'section') {
        if (formData.level === 'بكالوريا') setCurrentStep('level');
        else setCurrentStep('grade');
      } else {
        setCurrentStep(formSteps[currentIndex - 1]);
      }
    }
    setIsProcessing(false);
  };

  const handleCaptchaChange = (token: string | null) => {
    try {
      updateFormData('captchaToken', token || '');
      setCaptchaError(null);
    } catch (error) {
      console.error("reCAPTCHA error:", error);
      setCaptchaError('فشل التحقق من reCAPTCHA');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submit
    setIsSubmitting(true);
    
    const warnings = detectSpam(formData);
    setSpamWarnings(warnings);

    if (warnings.length > 0) {
       setIsSubmitting(false);
       return;
    }

    if (!formData.captchaToken && !captchaError) {
      setModal({ isOpen: true, isSuccess: false, message: 'يرجى التحقق من CAPTCHA قبل الإرسال.' });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch('/api/send-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setModal({ isOpen: true, isSuccess: true, message: 'تم التسجيل بنجاح! سنتواصل معك قريباً 🎉' });
        setTimeout(() => {
          setCurrentStep('welcome');
          setFormData({
            fullName: '', email: '', studentPhone: '', school: '', address: '', additionalMessage: '',
            level: '', grade: '', section: '', courses: [], honeypot: '',
            timestamp: Date.now(), captchaToken: null, moyenneGenerale: '',
          });
          setErrors({});
          setSpamWarnings([]);
          setModal({ isOpen: false, isSuccess: false, message: '' });
          recaptchaRef.current?.reset();
        }, 3000);
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      setModal({ isOpen: true, isSuccess: false, message: `فشل التسجيل. يرجى المحاولة مرة أخرى لاحقاً.` });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const closeModal = () => setModal({ isOpen: false, isSuccess: false, message: '' });

  const toggleCourse = (course: string) => {
    let newCourses = [...formData.courses];
    if (newCourses.includes(course)) newCourses = newCourses.filter(c => c !== course);
    else newCourses.push(course);
    updateFormData('courses', newCourses);
    setErrors(prev => ({ ...prev, courses: null }));
  };

  // --- Lists ---
  const getCoursesList = () => {
    const baseCourses = [
      { name: 'فرنسية', value: 'Français' }, { name: 'عربية', value: 'Arabe' },
      { name: 'رياضيات', value: 'Math' }, { name: 'فيزياء', value: 'Physique' },
      { name: 'إنجليزية', value: 'Anglais' }, { name: 'علوم', value: 'Science' }
    ];
    if (formData.level === 'بكالوريا' || (formData.level === 'ثانوي' && formData.grade === 'السنة الثالثة')) {
      baseCourses.push({ name: 'Philosophie', value: 'Philosophie' });
    }
    return baseCourses;
  };

  const getSectionsList = () => {
    if (formData.level === 'إعدادي') {
      if (formData.grade === 'السابعة') return [{ value: '7ème info', label: 'سابعة إعلامية' }, { value: '7ème science', label: 'سابعة علوم' }, { value: '7ème eco', label: 'سابعة اقتصاد' }];
      if (formData.grade === 'الثامنة') return [{ value: '8ème info', label: 'ثامنة إعلامية' }, { value: '8ème science', label: 'ثامنة علوم' }, { value: '8ème eco', label: 'ثامنة اقتصاد' }];
      if (formData.grade === 'التاسعة') return [{ value: '9ème info', label: 'تاسعة إعلامية' }, { value: '9ème science', label: 'تاسعة علوم' }, { value: '9ème eco', label: 'تاسعة اقتصاد' }];
    } else if (formData.level === 'ثانوي') {
      if (formData.grade === 'السنة الثانية') return [{ value: '2ème année — Économie', label: 'السنة الثانية — اقتصاد' }, { value: '2ème année — Lettres', label: 'السنة الثانية — آداب' }, { value: '2ème année — Sciences', label: 'السنة الثانية — علوم' }, { value: '2ème année — Info', label: 'السنة الثانية — إعلامية' }];
      if (formData.grade === 'السنة الثالثة') return [{ value: '3ème — Économie', label: 'السنة الثالثة — اقتصاد' }, { value: '3ème — Lettres', label: 'السنة الثالثة — آداب' }, { value: '3ème — Math', label: 'السنة الثالثة — رياضيات' }, { value: '3ème — Info', label: 'السنة الثالثة — إعلامية' }, { value: '3ème — Sciences', label: 'السنة الثالثة — علوم تجريبية' }, { value: '3ème — Technique', label: 'السنة الثالثة — تقنية' }];
    } else if (formData.level === 'بكالوريا') {
      return [{ value: 'بكالوريا علوم', label: 'بكالوريا علوم' }, { value: 'بكالوريا إعلامية', label: 'بكالوريا إعلامية' }, { value: 'بكالوريا رياضيات', label: 'بكالوريا رياضيات' }, { value: 'بكالوريا اقتصاد', label: 'بكالوريا اقتصاد و تصرف' }, { value: 'بكالوريا تقنية', label: 'بكالوريا تقنية' }];
    }
    return [];
  };

  const getGradesList = () => {
    if (formData.level === 'إعدادي') return [{ value: 'السابعة', label: 'السابعة أساسي' }, { value: 'الثامنة', label: 'الثامنة أساسي' }, { value: 'التاسعة', label: 'التاسعة أساسي' }];
    if (formData.level === 'ثانوي') return [{ value: 'السنة الأولى', label: 'السنة الأولى ثانوي' }, { value: 'السنة الثانية', label: 'السنة الثانية ثانوي' }, { value: 'السنة الثالثة', label: 'السنة الثالثة ثانوي' }];
    return [];
  };

  const filteredCourses = getCoursesList().filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Step Renders ---
  const renderProgressBar = () => {
    const visibleSteps = formSteps.slice(0, formSteps.indexOf(currentStep) + 1);
    return (
      <div className="w-full max-w-xl mx-auto mb-10" dir="rtl">
        <div className="relative pt-4">
           <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
           <div 
             className="absolute top-1/2 right-0 h-1 bg-[#03CCED] -translate-y-1/2 rounded-full transition-all duration-500" 
             style={{ width: `${(formSteps.indexOf(currentStep) / (formSteps.length - 1)) * 100}%` }}
           />
           <div className="flex justify-between relative">
             {visibleSteps.map((step, index) => (
                <motion.div key={step} initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 z-10 ${
                    step === currentStep 
                      ? 'bg-[#03CCED] border-[#03CCED] text-white shadow-lg shadow-[#03CCED]/30 scale-110' 
                      : 'bg-white border-[#03CCED] text-[#03CCED]'
                  }`}>
                    {formSteps.indexOf(step) + 1}
                  </div>
                </motion.div>
             ))}
           </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm font-medium text-[#03CCED]">
            {currentStep === 'welcome' && 'البداية'}
            {currentStep === 'level' && 'المستوى التعليمي'}
            {currentStep === 'grade' && 'السنة الدراسية'}
            {currentStep === 'section' && 'الشعبة'}
            {currentStep === 'courses' && 'المواد الدراسية'}
            {currentStep === 'contactInfo' && 'معلومات الاتصال'}
            {currentStep === 'academicInfo' && 'المعلومات الدراسية'}
            {currentStep === 'message' && 'ملاحظات إضافية'}
            {currentStep === 'confirm' && 'المراجعة والتأكيد'}
          </p>
        </div>
      </div>
    );
  };

  const renderWelcome = () => (
    <motion.div className="space-y-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="text-center space-y-6">
        <motion.div
          className="w-24 h-24 bg-gradient-to-br from-[#03CCED] to-[#029ab3] rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-[#03CCED]/20"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        >
          <BookOpen className="w-12 h-12 text-white" />
        </motion.div>
        <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0E2138] mb-4 tracking-tight">سجّل الآن</h1>
            <p className="text-lg text-[#3D506D] max-w-md mx-auto leading-relaxed">انضم إلينا اليوم وكن جزءاً من قصة نجاح متميزة في MBSchool</p>
        </div>
      </div>
      <div className="grid gap-6 mt-10">
        <motion.button
          onClick={handleNext}
          className="group relative overflow-hidden bg-[#0E2138] text-white p-6 rounded-2xl shadow-xl shadow-[#0E2138]/20 hover:shadow-2xl hover:shadow-[#0E2138]/30 transition-all duration-300 transform"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        >
           <div className="absolute inset-0 bg-gradient-to-r from-[#03CCED] to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-5 space-x-reverse">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <User className="w-7 h-7 text-[#03CCED]" />
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold text-white mb-1">ابدأ التسجيل</h3>
                <p className="text-gray-300 text-sm">خطوات بسيطة وسريعة</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-[#03CCED] transition-colors duration-300">
                <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );

  // Simplified Step Renders
  const renderLevelSelection = () => (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <HeaderWithBack title="المرحلة التعليمية" sub="اختر المرحلة الدراسية الحالية" onBack={handleBack} />
        <div className="space-y-4">
          {[{ value: 'إعدادي', label: 'المرحلة الإعدادية', desc: 'من السابعة إلى التاسعة أساسي' }, { value: 'ثانوي', label: 'المرحلة الثانوية', desc: 'السنة الأولى إلى الثالثة ثانوي' }, { value: 'بكالوريا', label: 'مرحلة البكالوريا', desc: 'التحضير للامتحان الوطني' }].map((levelItem, index) => (
            <SelectionCard key={levelItem.value} title={levelItem.label} subtitle={levelItem.desc} icon={BookOpen} delay={index} onClick={() => { updateFormData('level', levelItem.value); handleNext(); }} />
          ))}
        </div>
    </motion.div>
  );

  const renderGradeSelection = () => (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <HeaderWithBack title="السنة الدراسية" sub="في أي سنة تدرس حالياً؟" onBack={handleBack} />
        <div className="space-y-4">
          {getGradesList().map((gradeItem, index) => (
            <SelectionCard key={gradeItem.value} title={gradeItem.label} icon={BookOpen} delay={index} onClick={() => { updateFormData('grade', gradeItem.value); handleNext(); }} />
          ))}
        </div>
    </motion.div>
  );

  const renderSectionSelection = () => (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <HeaderWithBack title="اختيار الشعبة" sub="ما هو تخصصك الدراسي؟" onBack={handleBack} />
        <div className="space-y-4">
          {getSectionsList().map((section, index) => (
             <SelectionCard key={section.value} title={section.label} icon={BookOpen} delay={index} accentColor="EFB533" onClick={() => { updateFormData('section', section.value); handleNext(); }} />
          ))}
        </div>
    </motion.div>
  );

  const renderCourseSelection = () => (
    <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <HeaderWithBack title="المواد المطلوبة" sub="يمكنك اختيار مادة واحدة أو أكثر" onBack={handleBack} />
      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="ابحث عن مادة..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-12 pl-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#03CCED]/20 focus:border-[#03CCED] transition-all bg-white shadow-sm text-sm outline-none" dir="rtl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredCourses.map((course, index) => (
          <motion.button key={course.value} onClick={() => toggleCourse(course.value)} className={`p-5 rounded-2xl border-2 transition-all duration-200 text-right flex items-center justify-between group ${formData.courses.includes(course.value) ? 'bg-[#03CCED]/5 border-[#03CCED] shadow-md' : 'bg-white border-transparent shadow-sm hover:border-[#03CCED]/30'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="button">
            <span className={`font-bold text-base ${formData.courses.includes(course.value) ? 'text-[#03CCED]' : 'text-[#0E2138]'}`}>{course.name}</span>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${formData.courses.includes(course.value) ? 'bg-[#03CCED] border-[#03CCED]' : 'border-gray-200 group-hover:border-[#03CCED]'}`}>{formData.courses.includes(course.value) && <Check className="w-4 h-4 text-white" />}</div>
          </motion.button>
        ))}
      </div>
      {errors.courses && <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-1"><AlertCircle className="w-4 h-4"/> {errors.courses}</p>}
      <PrimaryButton onClick={handleNext} disabled={formData.courses.length === 0} label="التالي" icon={ArrowRight} />
    </motion.div>
  );

  const renderContactInfo = () => (
    <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <HeaderWithBack title="معلومات الطالب" sub="يرجى ملء البيانات بدقة للتواصل" onBack={handleBack} />
      <div className="space-y-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <InputField label="الاسم واللقب" icon={User} value={formData.fullName} onChange={(v: string) => updateFormData('fullName', v)} error={errors.fullName} placeholder="مثال: محمد بن علي" />
        <InputField label="رقم الهاتف" icon={Phone} value={formData.studentPhone} onChange={(v: string) => updateFormData('studentPhone', v)} error={errors.studentPhone} placeholder="-- --- --" type="tel" />
        <InputField label="العنوان" icon={MapPin} value={formData.address} onChange={(v: string) => updateFormData('address', v)} error={errors.address} placeholder="المدينة، الحي" />
        <InputField label="البريد الإلكتروني (اختياري)" icon={Mail} value={formData.email} onChange={(v: string) => updateFormData('email', v)} error={errors.email} placeholder="example@mail.com" type="email" />
      </div>
      <PrimaryButton onClick={handleNext} disabled={!formData.fullName.trim() || !formData.studentPhone.trim() || !formData.address.trim()} label="التالي" icon={ArrowRight} />
    </motion.div>
  );

  const renderAcademicInfo = () => (
    <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <HeaderWithBack title="المعلومات الدراسية" sub="ساعدنا في معرفة مستواك الحالي" onBack={handleBack} />
      <div className="space-y-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <InputField label="المعدل العام" icon={Calculator} value={formData.moyenneGenerale} onChange={(v: string) => updateFormData('moyenneGenerale', v)} error={errors.moyenneGenerale} placeholder="مثال: 14.50" />
        <InputField label="المعهد / المدرسة" icon={Building} value={formData.school} onChange={(v: string) => updateFormData('school', v)} error={errors.school} placeholder="اسم المؤسسة التعليمية" />
      </div>
      <PrimaryButton onClick={handleNext} disabled={!formData.moyenneGenerale.trim() || !formData.school.trim()} label="التالي" icon={ArrowRight} />
    </motion.div>
  );

  const renderMessage = () => (
    <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <HeaderWithBack title="ملاحظات إضافية" sub="هل لديك أي استفسار أو تفاصيل أخرى؟" onBack={handleBack} />
      <div className="space-y-2">
        <div className="relative">
          <MessageSquare className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
          <textarea value={formData.additionalMessage} onChange={(e) => updateFormData('additionalMessage', e.target.value)} rows={5} className="w-full pr-12 pl-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#03CCED]/20 focus:border-[#03CCED] transition-all bg-white resize-none text-base outline-none shadow-sm" placeholder="اكتب رسالتك هنا..." dir="rtl" />
        </div>
        {errors.additionalMessage && <p className="text-red-500 text-sm mt-1">{errors.additionalMessage}</p>}
      </div>
      <PrimaryButton onClick={handleNext} label="التالي" icon={ArrowRight} />
      <button onClick={handleNext} className="w-full text-gray-500 py-3 font-medium hover:text-[#0E2138] transition-colors" type="button">تخطي هذه الخطوة</button>
    </motion.div>
  );

  const renderConfirm = () => (
    <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <HeaderWithBack title="مراجعة وتأكيد" sub="تأكد من صحة البيانات قبل الإرسال النهائي" onBack={handleBack} />
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-[#0E2138]/5 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 bg-[#0E2138]/5 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#0E2138]" />
          </div>
          <h3 className="text-xl font-bold text-[#0E2138]">ملخص التسجيل</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
            <ReviewItem label="الاسم الكامل" value={formData.fullName} />
            <ReviewItem label="رقم الهاتف" value={formData.studentPhone} />
            {formData.email && <ReviewItem label="البريد الإلكتروني" value={formData.email} />}
            <ReviewItem label="العنوان" value={formData.address} />
            <div className="col-span-1 md:col-span-2 h-px bg-gray-100 my-2"></div>
            <ReviewItem label="المؤسسة" value={formData.school} />
            <ReviewItem label="المعدل" value={formData.moyenneGenerale} />
            <ReviewItem label="المستوى" value={`${formData.level} ${formData.grade ? ' - ' + formData.grade : ''}`} />
            {formData.section && <ReviewItem label="الشعبة" value={formData.section} />}
            <div className="col-span-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">المواد المختارة</label>
                <div className="flex flex-wrap gap-2">
                    {formData.courses.map((course, index) => (<span key={index} className="bg-[#03CCED]/10 text-[#009bb5] px-4 py-1.5 rounded-full text-sm font-bold">{course}</span>))}
                </div>
            </div>
        </div>
        {formData.additionalMessage && (<div className="pt-4 border-t border-gray-100"><ReviewItem label="ملاحظات" value={formData.additionalMessage} fullWidth /></div>)}
      </div>
      {spamWarnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div><h4 className="font-bold text-red-800 text-sm">تنبيه أمني</h4><ul className="text-xs text-red-700 mt-1 list-disc list-inside">{spamWarnings.map((w, i) => <li key={i}>{w.message}</li>)}</ul></div>
        </div>
      )}
      {captchaError && (<div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-600" /><span className="text-sm text-red-700 font-medium">{captchaError}</span></div>)}
      <div className="flex justify-center my-4 scale-90 origin-center">
        <ReCAPTCHA ref={recaptchaRef} sitekey="6Lfdoa8rAAAAAFd7_dzPObT7zitVHDkSPUrecSYk" onChange={handleCaptchaChange} hl="ar" />
      </div>
      <motion.button
        onClick={handleSubmit}
        disabled={isSubmitting || isProcessing || spamWarnings.length > 0 || !formData.captchaToken}
        className="w-full bg-[#0E2138] text-white py-5 px-6 rounded-2xl font-bold hover:bg-[#1a3a5f] focus:ring-4 focus:ring-[#0E2138]/30 transition-all duration-300 shadow-xl shadow-[#0E2138]/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center space-x-3 space-x-reverse"
        whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
        type="submit"
      >
        {isSubmitting ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>جاري المعالجة...</span></>) : (<><Send className="w-5 h-5" /><span>تأكيد وإرسال</span></>)}
      </motion.button>
    </motion.div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome': return renderWelcome();
      case 'level': return renderLevelSelection();
      case 'grade': return renderGradeSelection();
      case 'section': return renderSectionSelection();
      case 'courses': return renderCourseSelection();
      case 'contactInfo': return renderContactInfo();
      case 'academicInfo': return renderAcademicInfo();
      case 'message': return renderMessage();
      case 'confirm': return renderConfirm();
      default: return renderWelcome();
    }
  };

  return (
    <div className="relative flex min-h-screen bg-[#F4F7F9] font-sans">
      <div className="md:hidden fixed inset-0 z-0"><img src="https://i.ibb.co/9mPbSTJb/registernow-1.png" alt="Background" className="w-full h-full object-cover opacity-[0.03]" /></div>
      <div className="relative z-10 flex w-full min-h-screen">
        <div className="w-full md:w-3/5 py-12 md:py-16 flex flex-col px-6 md:px-12 overflow-y-auto" dir="rtl">
          <div className="w-full max-w-lg mx-auto flex-grow flex flex-col justify-center">
            {renderProgressBar()}
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>
          <div className="text-center mt-10 text-gray-400 text-xs">© {new Date().getFullYear()} MBSchool. جميع الحقوق محفوظة.</div>
        </div>
        <div className="hidden md:flex md:w-2/5 min-h-screen relative overflow-hidden items-center justify-center bg-[#EBF1F5]">
          <div className="absolute inset-0 bg-[radial-gradient(#03CCED_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.15]"></div>
          <div className="w-auto h-[80%] relative z-10 drop-shadow-2xl"><img src="https://i.ibb.co/9mPbSTJb/registernow-1.png" alt="MBSchool Background" className="w-auto h-full object-contain" /></div>
        </div>
      </div>
      <AnimatePresence>
        {modal.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0E2138]/60 backdrop-blur-md flex items-center justify-center z-50 p-6" onClick={closeModal}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6">
                {modal.isSuccess ? (<div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-12 h-12 text-green-600" /></div>) : (<div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><X className="w-12 h-12 text-red-600" /></div>)}
              </div>
              <h3 className="text-2xl font-bold text-[#0E2138] mb-3">{modal.isSuccess ? 'تم بنجاح!' : 'تنبيه'}</h3>
              <p className="text-gray-500 mb-8 leading-relaxed" dir="rtl">{modal.message}</p>
              <button onClick={closeModal} className="w-full bg-[#0E2138] text-white py-4 rounded-xl font-bold hover:bg-[#1a3a5f] transition-all shadow-lg shadow-[#0E2138]/20">حسناً</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Registration;