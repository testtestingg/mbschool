import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Mail, User, Phone, BookOpen, MessageSquare, Send, MapPin, Building, AlertTriangle, Shield, Search } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

interface FormData {
  inquiryType: string;
  inquiryName: string;
  inquiryEmail: string;
  inquiryMessage: string;
  honeypot: string;
  timestamp: number;
  captchaToken: string | null;
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

const Contact = () => {
  // Define all steps in the form
  const formSteps = [
    'welcome',
    'inquiry-type',
    'inquiry-name',
    'inquiry-email',
    'inquiry-message',
    'inquiry-confirm'
  ] as const;
  
  type FormStep = typeof formSteps[number];
  
  const [currentStep, setCurrentStep] = useState<FormStep>('welcome');
  const [formData, setFormData] = useState<FormData>({
    inquiryType: '',
    inquiryName: '',
    inquiryEmail: '',
    inquiryMessage: '',
    honeypot: '',
    timestamp: Date.now(),
    captchaToken: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalState>({ isOpen: false, isSuccess: false, message: '' });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [spamWarnings, setSpamWarnings] = useState<SpamWarning[]>([]);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  // Add auto-scroll effect
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const validateField = (name: keyof FormData, value: string): string | null => {
    switch (name) {
      case 'inquiryName':
        return !value.trim() ? 'هذا الحقل مطلوب' : value.trim().length < 2 ? 'يجب أن يكون الاسم أكثر من حرفين' : null;
      case 'inquiryEmail':
        return value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'البريد الإلكتروني غير صحيح' : null;
      case 'inquiryMessage':
        return !value.trim() ? 'الرسالة مطلوبة' : value.trim().length < 10 ? 'الرسالة يجب أن تكون أكثر من 10 أحرف' : null;
      default:
        return null;
    }
  };

  const updateFormData = (field: keyof FormData, value: string | string[] | null) => {
    setFormData({ ...formData, [field]: value });
    if (typeof value === 'string') {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const detectSpam = (data: FormData): SpamWarning[] => {
    const warnings: SpamWarning[] = [];
    if (data.honeypot.trim()) warnings.push({ field: 'honeypot', message: 'Bot detected' });
    if (Date.now() - data.timestamp < 2000) warnings.push({ field: 'time', message: 'Submission too fast' });
    const obviousFakeEmails = [/^test@test\.com$/, /^fake@fake\.com$/, /^spam@spam\.com$/, /^example@example\.com$/];
    if (data.inquiryEmail && obviousFakeEmails.some(pattern => pattern.test(data.inquiryEmail))) warnings.push({ field: 'inquiryEmail', message: 'Fake email address' });
    const message = data.inquiryMessage.toLowerCase().trim();
    const spamPatterns = [/^test$/, /^spam$/, /^fake$/, /^[a-z]{1,2}$/, /^\.+$/, /^-+$/];
    if (spamPatterns.some(pattern => pattern.test(message))) warnings.push({ field: 'inquiryMessage', message: 'Suspicious message content' });
    return warnings;
  };

  const getFormspreeEndpoint = () => {
    return 'https://formspree.io/f/myzjbvwq';
  };

  const translateInquiryType = (type: string): string => {
    const translations = {
      'استفسار عام': 'Demande générale',
      'طلب معلومات': 'Demande d\'informations',
      'تمارين وتصحيح البكالوريا': 'Exercices et correction du Baccalauréat'
    };
    return translations[type] || type;
  };

  const createFrenchPayload = (data: FormData): any => {
    const payload: any = {};
    payload.nom_demandeur = data.inquiryName;
    payload.email_demandeur = data.inquiryEmail;
    payload.sujet = translateInquiryType(data.inquiryType);
    payload.message_demandeur = data.inquiryMessage;
    payload.captchaToken = data.captchaToken;
    return payload;
  };

  const handleNext = () => {
    // Validate current step before proceeding
    let canProceed = true;
    let fieldToValidate: keyof FormData | null = null;
    
    switch (currentStep) {
      case 'inquiry-name':
        fieldToValidate = 'inquiryName';
        break;
      case 'inquiry-email':
        if (formData.inquiryEmail) {
          fieldToValidate = 'inquiryEmail';
        }
        break;
      case 'inquiry-message':
        fieldToValidate = 'inquiryMessage';
        break;
    }
    
    if (fieldToValidate) {
      const error = validateField(fieldToValidate, formData[fieldToValidate]);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldToValidate]: error }));
        canProceed = false;
      }
    }
    
    if (!canProceed) return;
    
    // Move to next step
    const currentIndex = formSteps.indexOf(currentStep);
    if (currentIndex < formSteps.length - 1) {
      setCurrentStep(formSteps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = formSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(formSteps[currentIndex - 1]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.captchaToken) {
      setModal({
        isOpen: true,
        isSuccess: false,
        message: 'يرجى التحقق من CAPTCHA قبل الإرسال.',
      });
      setIsSubmitting(false);
      return;
    }
    
    const endpoint = getFormspreeEndpoint();
    
    try {
      const frenchPayload = createFrenchPayload(formData);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(frenchPayload),
      });
      
      if (response.ok) {
        setModal({
          isOpen: true,
          isSuccess: true,
          message: 'تم الإرسال بنجاح! سنتواصل معك قريباً 🎉'
        });
        setTimeout(() => {
          setCurrentStep('welcome');
          setFormData({
            inquiryType: '',
            inquiryName: '',
            inquiryEmail: '',
            inquiryMessage: '',
            honeypot: '',
            timestamp: Date.now(),
            captchaToken: null,
          });
          setErrors({});
          setSpamWarnings([]);
          setModal({ isOpen: false, isSuccess: false, message: '' });
          recaptchaRef.current?.reset();
        }, 3000);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      setModal({
        isOpen: true,
        isSuccess: false,
        message: 'فشل الإرسال. حدث خطأ، يرجى المحاولة مجددًا.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, isSuccess: false, message: '' });
  };

  const renderProgressBar = () => {
    // Only show steps up to the current one
    const visibleSteps = formSteps.slice(0, formSteps.indexOf(currentStep) + 1);
    
    return (
      <div className="w-full max-w-xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          {visibleSteps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep 
                    ? 'bg-[#EFB533] text-white' 
                    : 'bg-[#E6E6E6] text-[#3D506D]'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs mt-1 text-[#3D506D]">
                  {step === 'welcome' && 'مرحباً'}
                  {step === 'inquiry-type' && 'النوع'}
                  {step === 'inquiry-name' && 'الاسم'}
                  {step === 'inquiry-email' && 'البريد'}
                  {step === 'inquiry-message' && 'الرسالة'}
                  {step === 'inquiry-confirm' && 'تأكيد'}
                </span>
              </div>
              {index < visibleSteps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${
                  index < visibleSteps.length - 2 ? 'bg-[#EFB533]' : 'bg-[#E6E6E6]'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderWelcome = () => (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center space-y-6">
        <motion.div
          className="w-20 h-20 bg-[#EFB533] rounded-full mx-auto flex items-center justify-center shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        >
          <Mail className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold text-[#0E2138] mb-2">
          تواصل معنا
        </h1>
        <p className="text-lg text-[#3D506D] max-w-md mx-auto">
          اطرح أسئلتك واستفساراتك وسنكون سعداء لمساعدتك
        </p>
      </div>
      
      <div className="grid gap-6 mt-8">
        <motion.button
          onClick={() => {
            setCurrentStep('inquiry-type');
          }}
          className="group bg-gradient-to-r from-[#EFB533] to-[#D49E0C] text-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold text-white">استفسار عام</h3>
                <p className="text-white/90 text-sm">اطرح أسئلتك واستفساراتك</p>
              </div>
            </div>
            <ArrowLeft className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
        <motion.div
          className="bg-[#0E2138]/10 p-3 rounded-xl border border-[#0E2138]/5 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-[#0E2138]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-[#3D506D]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#3D506D]">اتصل بنا</p>
              <p className="font-medium text-[#0E2138] text-sm" dir="ltr">27 208 090</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          className="bg-[#0E2138]/10 p-3 rounded-xl border border-[#0E2138]/5 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-[#EFB533]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-[#EFB533]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#3D506D]">راسلنا</p>
              <p className="font-medium text-[#0E2138] text-xs" dir="ltr">contact@mbschool.tn</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          className="bg-[#0E2138]/10 p-3 rounded-xl border border-[#0E2138]/5 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 bg-[#0E2138]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-[#3D506D]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#3D506D]">زورونا</p>
              <p className="font-medium text-[#0E2138] text-xs">حمام الشط، بن عروس</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderInquiryType = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="p-3 hover:bg-[#E6E6E6] rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#3D506D]" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0E2138]">نوع الاستفسار</h2>
          <p className="text-[#3D506D] text-base">اختر نوع الاستفسار المناسب</p>
        </div>
        <div className="w-9"></div>
      </div>
      
      <div className="space-y-4">
        {[
          { type: 'استفسار عام', desc: 'أسئلة عامة حول المدرسة والخدمات', icon: MessageSquare },
          { type: 'طلب معلومات', desc: 'معلومات تفصيلية حول البرامج والخدمات', icon: Mail },
          { type: 'تمارين وتصحيح البكالوريا', desc: 'استفسارات حول التمارين والتصحيحات', icon: BookOpen }
        ].map((item, index) => (
          <motion.button
            key={item.type}
            onClick={() => {
              updateFormData('inquiryType', item.type);
              handleNext();
            }}
            className="w-full p-5 bg-white rounded-2xl shadow-md border border-[#E6E6E6] hover:border-[#EFB533] hover:bg-[#EFB533]/5 transition-all duration-300 text-right group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-[#EFB533]/10 rounded-xl flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-[#EFB533]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0E2138]">{item.type}</h3>
                  <p className="text-base text-[#3D506D]">{item.desc}</p>
                </div>
              </div>
              <ArrowLeft className="w-6 h-6 text-[#3D506D] group-hover:text-[#EFB533] group-hover:translate-x-1 transition-all" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  const renderInquiryName = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="p-3 hover:bg-[#E6E6E6] rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#3D506D]" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0E2138]">الاسم</h2>
          <p className="text-[#3D506D] text-base">أدخل اسمك</p>
        </div>
        <div className="w-9"></div>
      </div>
      
      <div className="space-y-2">
        <div className="relative">
          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3D506D]" />
          <input
            type="text"
            name="inquiryName"
            value={formData.inquiryName}
            onChange={(e) => updateFormData('inquiryName', e.target.value)}
            className={`w-full pr-10 pl-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#EFB533] focus:border-transparent transition-all bg-white text-sm ${
              errors.inquiryName ? 'border-red-300 bg-red-50/50' : 'border-[#0E2138]/10'
            }`}
            placeholder="أدخل اسمك"
            dir="rtl"
          />
        </div>
        {errors.inquiryName && <p className="text-red-500 text-xs mt-1">{errors.inquiryName}</p>}
      </div>
      
      <motion.button
        onClick={handleNext}
        disabled={!formData.inquiryName.trim()}
        className="w-full bg-gradient-to-r from-[#0E2138] to-[#1A3A5F] text-white py-4 px-6 rounded-xl font-semibold hover:from-[#0A1628] hover:to-[#0E2138] focus:ring-4 focus:ring-[#0E2138]/20 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>التالي</span>
      </motion.button>
    </motion.div>
  );

  const renderInquiryEmail = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="p-3 hover:bg-[#E6E6E6] rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#3D506D]" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0E2138]">البريد الإلكتروني</h2>
          <p className="text-[#3D506D] text-base">أدخل بريدك الإلكتروني (اختياري)</p>
        </div>
        <div className="w-9"></div>
      </div>
      
      <div className="space-y-2">
        <div className="relative">
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3D506D]" />
          <input
            type="email"
            name="inquiryEmail"
            value={formData.inquiryEmail}
            onChange={(e) => updateFormData('inquiryEmail', e.target.value)}
            className={`w-full pr-10 pl-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#EFB533] focus:border-transparent transition-all bg-white text-sm ${
              errors.inquiryEmail ? 'border-red-300 bg-red-50/50' : 'border-[#0E2138]/10'
            }`}
            placeholder="أدخل بريدك الإلكتروني"
            dir="rtl"
          />
        </div>
        {errors.inquiryEmail && <p className="text-red-500 text-xs mt-1">{errors.inquiryEmail}</p>}
      </div>
      
      <motion.button
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-[#0E2138] to-[#1A3A5F] text-white py-4 px-6 rounded-xl font-semibold hover:from-[#0A1628] hover:to-[#0E2138] focus:ring-4 focus:ring-[#0E2138]/20 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 space-x-reverse"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>التالي</span>
      </motion.button>
      
      <button
        onClick={handleNext}
        className="w-full text-[#3D506D] py-2 px-6 rounded-xl font-medium hover:bg-[#E6E6E6] transition-colors"
      >
        تخطي هذه الخطوة
      </button>
    </motion.div>
  );

  const renderInquiryMessage = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="p-3 hover:bg-[#E6E6E6] rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#3D506D]" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0E2138]">الرسالة</h2>
          <p className="text-[#3D506D] text-base">اكتب رسالتك</p>
        </div>
        <div className="w-9"></div>
      </div>
      
      <div className="space-y-2">
        <div className="relative">
          <MessageSquare className="absolute right-3 top-3 w-5 h-5 text-[#3D506D]" />
          <textarea
            name="inquiryMessage"
            value={formData.inquiryMessage}
            onChange={(e) => updateFormData('inquiryMessage', e.target.value)}
            rows={4}
            className={`w-full pr-10 pl-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#EFB533] focus:border-transparent transition-all bg-white resize-none text-sm ${
              errors.inquiryMessage ? 'border-red-300 bg-red-50/50' : 'border-[#0E2138]/10'
            }`}
            placeholder="اكتب رسالتك هنا..."
            dir="rtl"
          />
        </div>
        {errors.inquiryMessage && <p className="text-red-500 text-xs mt-1">{errors.inquiryMessage}</p>}
      </div>
      
      <motion.button
        onClick={handleNext}
        disabled={!formData.inquiryMessage.trim()}
        className="w-full bg-gradient-to-r from-[#0E2138] to-[#1A3A5F] text-white py-4 px-6 rounded-xl font-semibold hover:from-[#0A1628] hover:to-[#0E2138] focus:ring-4 focus:ring-[#0E2138]/20 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>التالي</span>
      </motion.button>
    </motion.div>
  );

  const renderInquiryConfirm = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="p-3 hover:bg-[#E6E6E6] rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#3D506D]" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0E2138]">تأكيد الاستفسار</h2>
          <p className="text-[#3D506D] text-base">تأكد من صحة البيانات قبل الإرسال</p>
        </div>
        <div className="w-9"></div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 border border-[#0E2138]/10 shadow-lg space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#0E2138]/10 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#0E2138]" />
          </div>
          <h3 className="text-lg font-semibold text-[#0E2138]">مراجعة البيانات</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3D506D]">الاسم</label>
            <p className="text-[#0E2138] font-medium bg-[#0E2138]/5 p-3 rounded-lg">{formData.inquiryName}</p>
          </div>
          
          {formData.inquiryEmail && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#3D506D]">البريد الإلكتروني</label>
              <p className="text-[#0E2138] font-medium bg-[#0E2138]/5 p-3 rounded-lg">{formData.inquiryEmail}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3D506D]">نوع الاستفسار</label>
            <p className="text-[#0E2138] font-medium bg-[#0E2138]/5 p-3 rounded-lg">{formData.inquiryType}</p>
          </div>
        </div>
        
        <div className="space-y-2 pt-3 border-t border-[#0E2138]/10">
          <label className="text-sm font-medium text-[#3D506D]">الرسالة</label>
          <p className="text-[#0E2138] bg-[#0E2138]/5 p-3 rounded-lg">{formData.inquiryMessage}</p>
        </div>
      </div>
      
      {spamWarnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-800">تحذيرات الأمان</h4>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {spamWarnings.map((warning, index) => (
              <li key={index}>• {warning.message}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="my-4">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey="6Lejpa8rAAAAAN6TGyQEruQWM1FnhhDk6NqplT6N"
          onChange={(token) => updateFormData('captchaToken', token)}
          dir="rtl"
        />
      </div>
      
      <motion.button
        onClick={handleSubmit}
        disabled={isSubmitting || spamWarnings.length > 0 || !formData.captchaToken}
        className="w-full bg-gradient-to-r from-[#EFB533] to-[#D49E0C] text-white py-4 px-6 rounded-xl font-semibold hover:from-[#D49E0C] hover:to-[#B8860B] focus:ring-4 focus:ring-[#EFB533]/20 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>جاري الإرسال...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>تأكيد الإرسال</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcome();
      case 'inquiry-type':
        return renderInquiryType();
      case 'inquiry-name':
        return renderInquiryName();
      case 'inquiry-email':
        return renderInquiryEmail();
      case 'inquiry-message':
        return renderInquiryMessage();
      case 'inquiry-confirm':
        return renderInquiryConfirm();
      default:
        return renderWelcome();
    }
  };

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
      {/* Background image for mobile */}
      <div className="md:hidden fixed inset-0 z-0">
        <img 
          src="https://i.ibb.co/fGD7jLsg/Blue-And-Yellow-Modern-School-Admission-Instagram-Post-1.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-10" 
        />
      </div>
      
      <div className="relative z-10 flex w-full min-h-screen">
        <div className="w-full md:w-3/5 py-16 md:py-24 flex flex-col justify-center px-6 md:px-8 overflow-y-auto" dir="rtl">
          <div className="w-full max-w-xl mx-auto">
            {renderProgressBar()}
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="hidden md:flex md:w-2/5 min-h-screen relative overflow-hidden items-center justify-center bg-gradient-to-br from-[#EFB533]/10 to-[#03CCED]/10">
          <div className="w-auto h-[80%] relative">
            <img
              src="https://i.ibb.co/TDykZxCM/Blue-And-Yellow-Modern-School-Admission-Instagram-Post-1.png"
              alt="MBSchool Background"
              className="w-auto h-full object-contain"
            />
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {modal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 max-w-md mx-4 text-center shadow-xl border border-white/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                {modal.isSuccess ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                    className="w-20 h-20 bg-[#EFB533] rounded-full flex items-center justify-center mx-auto shadow-lg"
                  >
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                    className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg"
                  >
                    <X className="w-10 h-10 text-white" />
                  </motion.div>
                )}
              </div>
              <p className="text-xl font-bold text-[#0E2138] mb-6" dir="rtl">
                {modal.message}
              </p>
              <button
                onClick={closeModal}
                className="bg-[#3D506D] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#0E2138] transition-all duration-300"
              >
                موافق
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;