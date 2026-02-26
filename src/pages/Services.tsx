import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Users,
  Award,
  ChevronDown,
  Star,
  Clock,
  CheckCircle,
  Heart,
  Phone,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Calendar,
  Menu,
  X
} from 'lucide-react';

const PRIMARY = '#0E2138';
const SECONDARY = '#03CCED';
const ACCENT = '#EFB533';
const MUTED = '#3D506D';
const BG = '#ffffff';

const Services = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('idle'); // idle, success, error
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Reset status when user starts typing again
    if (subscriptionStatus !== 'idle') {
      setSubscriptionStatus('idle');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setSubscriptionStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Submit to Formspree
      const response = await fetch('https://formspree.io/f/xblapbrl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        // Success
        setSubscriptionStatus('success');
        setEmail('');
        
        // Reset status after 5 seconds
        setTimeout(() => {
          setSubscriptionStatus('idle');
        }, 5000);
      } else {
        // Formspree returned an error
        setSubscriptionStatus('error');
      }
    } catch (error) {
      // Network error or other issue
      console.error('Form submission error:', error);
      setSubscriptionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "جدول دراسي متكامل",
      description: "تصفح جدولك الدراسي بسهولة وتابع جميع الأنشطة والامتحانات"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "محتوى تعليمي غني",
      description: "مواد تعليمية متنوعة تلبي احتياجات جميع المراحل الدراسية"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "تفاعل مع المعلمين",
      description: "تواصل مباشر مع المعلمين واطرح أسئلتك في أي وقت"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "تتبع التقدم الأكاديمي",
      description: "متابعة مستواك الأكاديمي ونتائجك بشكل دوري"
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]" style={{ fontFamily: "'Tajawal', sans-serif", direction: 'rtl' }}>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="inline-flex items-center bg-[#03CCED]/10 text-[#03CCED] px-4 py-2 rounded-full mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Sparkles className="w-5 h-5 ml-2" />
                <span className="font-medium">قريباً</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-[#0E2138] mb-6">
                منصة تعليمية <span className="text-[#03CCED]">متكاملة</span> قيد التطوير
              </h1>
              
              <p className="text-xl text-[#3D506D] mb-8 leading-relaxed">
                نحن نعمل بجد لتطوير منصة تعليمية متكاملة تقدم تجربة فريدة للطلاب والمعلمين في مدرستنا. ستكون المنصة متاحة قريباً بمجموعة من المميزات المبتكرة.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
<a
  href="/calendar"
  target="_blank"
  rel="noopener noreferrer"
  className="py-3 px-6 bg-[#03CCED] text-white rounded-full font-bold hover:bg-[#0299b8] transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
>
  <Calendar className="w-5 h-5" />
  جدولي الدراسي
  <ArrowRight size={20} />
</a>

                <Link 
                  to="/contact" 
                  className="py-3 px-6 border-2 border-[#EFB533] text-[#0E2138] rounded-full font-bold hover:bg-[#EFB533] hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  <Phone size={20} />
                  تواصل معنا
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="relative"
            >
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-[#03CCED] to-[#0299b8] flex items-center justify-center shadow-xl">
                <div className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://i.ibb.co/YT8wNFX0/MBS-WHITE-02.png" 
                    alt="MBSchool Logo" 
                    className="w-48 h-48 md:w-56 md:h-56 object-contain"
                  />
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                className="absolute top-0 right-0 bg-[#EFB533] text-white p-3 rounded-full shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <GraduationCap className="w-6 h-6" />
              </motion.div>
              
              <motion.div 
                className="absolute bottom-10 left-0 bg-[#0E2138] text-white p-3 rounded-full shadow-lg"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              >
                <Award className="w-6 h-6" />
              </motion.div>
              
              <motion.div 
                className="absolute top-10 left-10 bg-[#03CCED] text-white p-3 rounded-full shadow-lg"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <Users className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-[#0E2138] mb-4">ماذا سيكون في المنصة؟</h2>
            <p className="text-xl text-[#3D506D] max-w-2xl mx-auto">
              استعد لتجربة تعليمية ثرية بالمميزات التي نعمل على تطويرها
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`bg-gradient-to-br p-6 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 ${
                  activeFeature === index 
                    ? 'from-[#03CCED]/10 to-[#03CCED]/5 border-2 border-[#03CCED] transform -translate-y-2' 
                    : 'from-white to-[#f8f9fa] border border-[#E6E6E6] hover:shadow-xl'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  activeFeature === index ? 'bg-[#03CCED] text-white' : 'bg-[#E6E6E6] text-[#03CCED]'
                }`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0E2138] mb-3">{feature.title}</h3>
                <p className="text-[#3D506D]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Progress Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-[#0E2138] to-[#1A3A5F] rounded-3xl p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-2/3 mb-8 md:mb-0">
                <motion.h2 
                  className="text-3xl font-bold mb-4"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  مرحباً بك في مستقبل التعليم
                </motion.h2>
                <motion.p 
                  className="text-lg mb-6 text-[#E6E6E6]"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  نحن نعمل بجد لتطوير منصة تعليمية متكاملة تقدم تجربة فريدة للطلاب والمعلمين في مدرستنا. ستكون المنصة متاحة قريباً.
                </motion.p>
                
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#03CCED] ml-2" />
                    <span>تصميم عصري وسهل الاستخدام</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#03CCED] ml-2" />
                    <span>محتوى تعليمي عالي الجودة</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#03CCED] ml-2" />
                    <span>تجربة تفاعلية ممتعة</span>
                  </div>
                </motion.div>
              </div>
              
              <div className="md:w-1/3 flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="w-48 h-48 rounded-full border-4 border-[#03CCED] border-t-transparent border-r-transparent flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#03CCED] mb-2">75%</div>
                      <div className="text-sm">من الإنجاز</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 bg-[#f8f9fa]">
        <div className="container mx-auto px-4">
          <motion.div
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[#0E2138] mb-4">كن على اطلاع دائم</h2>
            <p className="text-xl text-[#3D506D] max-w-2xl mx-auto mb-8">
              سجل بريدك الإلكتروني ليصلك كل جديد حول إطلاق المنصة والمميزات الحصرية
            </p>
            
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  name="email"  // Added name attribute for Formspree
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="بريدك الإلكتروني" 
                  className="flex-1 px-4 py-3 border border-[#E6E6E6] rounded-full text-right focus:outline-none focus:ring-2 focus:ring-[#03CCED]"
                  disabled={isSubmitting}
                  required
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#03CCED] text-white rounded-full font-bold hover:bg-[#0299b8] transition-colors duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري الإرسال...
                    </>
                  ) : 'إشتراك'}
                </button>
              </div>
              
              <AnimatePresence>
                {subscriptionStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>تم الاشتراك بنجاح! شكراً لتسجيلك.</span>
                  </motion.div>
                )}
                
                {subscriptionStatus === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    <span>حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Services;