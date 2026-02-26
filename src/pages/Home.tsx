// src/pages/HomePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownCircle, ArrowLeft, ArrowRight, Award, BookOpen, Pause, Brain, Calculator, Camera, 
  CheckCircle, ChevronLeft, ChevronRight, Clock, Eye, Globe, GraduationCap, Heart, Image, 
  MapPin, Mail, Play, Phone, Quote, Sparkles, Star, Target, TrendingUp, Trophy, Users, 
  UsersRound, Users2, Zap, X, ZoomIn, Handshake, ExternalLink, UserCheck, BarChart, Monitor, 
  MessageSquare, GraduationCap as GraduationCapIcon, BookmarkCheck, Lightbulb, Shield, 
  Rocket, LineChart, Video, FileText, Calendar, ChevronDown, ChevronUp, Beaker, Languages,
  Atom, FlaskConical, Microscope, BookText, PenTool, Music, Palette
} from 'lucide-react';

// ============================================
// NEW: Animated Counter Component
// ============================================
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, end, duration]);

  return (
    <span ref={counterRef}>
      {count}{suffix}
    </span>
  );
};

// ============================================
// NEW: Programs/Services Section
// ============================================
const ProgramsSection = () => {
  const programs = [
    {
      icon: Calculator,
      title: 'الرياضيات',
      description: 'برامج متقدمة لتطوير المهارات الرياضية من الأساسيات إلى المستويات المتقدمة',
      features: ['جبر', 'هندسة', 'تحليل', 'احتمالات'],
      color: '#07cced',
      bgGradient: 'from-[#07cced]/10 to-[#07cced]/5'
    },
    {
      icon: Beaker,
      title: 'الفيزياء',
      description: 'فهم عميق لقوانين الطبيعة مع تجارب عملية وتطبيقات حياتية',
      features: ['ميكانيك', 'كهرباء', 'ضوء', 'طاقة'],
      color: '#0A2546',
      bgGradient: 'from-[#0A2546]/10 to-[#0A2546]/5'
    },
    {
      icon: FlaskConical,
      title: 'العلوم الطبيعية',
      description: 'استكشاف الحياة والبيئة من خلال منهج علمي متكامل',
      features: ['بيولوجيا', 'جيولوجيا', 'بيئة', 'صحة'],
      color: '#07cced',
      bgGradient: 'from-[#07cced]/10 to-[#07cced]/5'
    },
    {
      icon: Languages,
      title: 'اللغات',
      description: 'إتقان اللغات العربية والإنجليزية والألمانية والفرنسية',
      features: ['عربي', 'إنجليزي', 'ألماني', 'فرنسي'],
      color: '#0A2546',
      bgGradient: 'from-[#0A2546]/10 to-[#0A2546]/5'
    },
    {
      icon: Brain,
      title: 'الفلسفة',
      description: 'تطوير التفكير النقدي والقدرة على التحليل والاستنتاج المنطقي',
      features: ['منطق', 'أخلاق', 'معرفة', 'تحليل'],
      color: '#07cced',
      bgGradient: 'from-[#07cced]/10 to-[#07cced]/5'
    },
    {
      icon: Monitor,
      title: 'الإعلامية',
      description: 'مهارات تقنية حديثة للتعامل مع عالم البرمجة والتكنولوجيا',
      features: ['برمجة', 'شبكات', 'تصميم', 'أمن'],
      color: '#0A2546',
      bgGradient: 'from-[#0A2546]/10 to-[#0A2546]/5'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#07cced]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0A2546]/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md mb-6 border border-gray-100">
            <BookOpen size={20} className="text-[#07cced]" />
            <span className="text-[#0A2546] font-semibold text-sm">برامجنا التعليمية</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0A2546] mb-4">
            مواد متنوعة لتعليم شامل
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            نقدم برامج تعليمية متكاملة تغطي جميع المواد الأساسية بأسلوب احترافي وحديث
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-gradient-to-br ${program.bgGradient} backdrop-blur-sm rounded-2xl p-8 border border-gray-100 hover:border-[#07cced]/30 transition-all duration-300 hover:shadow-xl group`}
            >
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: `${program.color}15` }}
              >
                <program.icon size={32} style={{ color: program.color }} />
              </div>
              
              <h3 className="text-2xl font-bold text-[#0A2546] mb-3">{program.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{program.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {program.features.map((feature, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-white rounded-full text-sm font-medium border border-gray-200"
                    style={{ color: program.color }}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// NEW: Why Choose Us Section
// ============================================
const WhyChooseUsSection = () => {
  const reasons = [
    {
      icon: Award,
      title: 'أعلى نسب نجاح',
      description: '97% من طلابنا يحققون نتائج متميزة في البكالوريا',
      stat: '97%',
      color: '#07cced'
    },
    {
      icon: Users,
      title: 'نخبة من الأساتذة',
      description: 'فريق من 30+ أستاذ متخصص وذو خبرة عالية',
      stat: '30+',
      color: '#0A2546'
    },
    {
      icon: Target,
      title: 'متابعة فردية',
      description: 'نظام متابعة شخصي لكل تلميذ لضمان التقدم المستمر',
      stat: '1:1',
      color: '#07cced'
    },
    {
      icon: Lightbulb,
      title: 'منهجية حديثة',
      description: 'أساليب تعليم مبتكرة تواكب أحدث التطورات التربوية',
      stat: '100%',
      color: '#0A2546'
    },
    {
      icon: Shield,
      title: 'بيئة آمنة',
      description: 'مرافق حديثة ومجهزة توفر بيئة تعلم مريحة وآمنة',
      stat: 'A+',
      color: '#07cced'
    },
    {
      icon: Rocket,
      title: 'نتائج سريعة',
      description: 'تحسن ملحوظ في الأداء خلال الأشهر الأولى من الدراسة',
      stat: '3x',
      color: '#0A2546'
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#07cced]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#0A2546]/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md mb-6 border border-gray-100">
            <CheckCircle size={20} className="text-[#07cced]" />
            <span className="text-[#0A2546] font-semibold text-sm">لماذا نحن</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0A2546] mb-4">
            ما يميزنا عن غيرنا
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            نجمع بين الخبرة والاحترافية لنقدم تجربة تعليمية استثنائية
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 group overflow-hidden"
            >
              <div 
                className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -translate-y-8 translate-x-8 transition-all duration-300 group-hover:scale-150"
                style={{ backgroundColor: reason.color }}
              ></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${reason.color}15` }}
                  >
                    <reason.icon size={28} style={{ color: reason.color }} />
                  </div>
                  <div 
                    className="text-3xl font-bold"
                    style={{ color: reason.color }}
                  >
                    {reason.stat}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-[#0A2546] mb-3">{reason.title}</h3>
                <p className="text-gray-600 leading-relaxed">{reason.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// NEW: Student Journey Section
// ============================================
const StudentJourneySection = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const journeySteps = [
    {
      number: '01',
      title: 'التسجيل والتقييم',
      description: 'نبدأ بتقييم شامل لمستوى التلميذ لتحديد نقاط القوة والضعف',
      icon: FileText,
      color: '#07cced'
    },
    {
      number: '02',
      title: 'خطة دراسية مخصصة',
      description: 'نضع خطة دراسية فردية تناسب احتياجات وأهداف كل تلميذ',
      icon: Target,
      color: '#0A2546'
    },
    {
      number: '03',
      title: 'دروس تفاعلية',
      description: 'حصص دراسية حديثة مع أفضل الأساتذة وأحدث الوسائل التعليمية',
      icon: Video,
      color: '#07cced'
    },
    {
      number: '04',
      title: 'متابعة مستمرة',
      description: 'تقييم دوري للتقدم مع تقارير مفصلة للأولياء',
      icon: LineChart,
      color: '#0A2546'
    },
    {
      number: '05',
      title: 'النجاح والتميز',
      description: 'تحقيق الأهداف والحصول على نتائج متميزة في الامتحانات',
      icon: Trophy,
      color: '#07cced'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % journeySteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-40 left-10 w-72 h-72 bg-[#07cced]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-64 h-64 bg-[#0A2546]/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md mb-6 border border-gray-100">
            <Rocket size={20} className="text-[#07cced]" />
            <span className="text-[#0A2546] font-semibold text-sm">رحلة النجاح</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0A2546] mb-4">
            خطواتك نحو التميز
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            مسار واضح ومدروس يضمن تحقيق أهدافك الأكاديمية
          </p>
        </motion.div>
        
        <div className="relative">
          {/* Desktop Timeline */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-[#07cced] to-[#0A2546] rounded-full"></div>
              
              {journeySteps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`relative z-10 flex flex-col items-center transition-all duration-300 ${
                    activeStep === index ? 'scale-110' : 'scale-100 opacity-60'
                  }`}
                >
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg transition-all duration-300 ${
                      activeStep === index ? 'ring-4 ring-offset-4' : ''
                    }`}
                    style={{ 
                      backgroundColor: step.color,
                      ringColor: `${step.color}40`
                    }}
                  >
                    <step.icon size={28} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-[#0A2546]">{step.number}</span>
                </button>
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <h3 className="text-3xl font-bold text-[#0A2546] mb-4">
                  {journeySteps[activeStep].title}
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {journeySteps[activeStep].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Mobile/Tablet Timeline */}
          <div className="lg:hidden space-y-6">
            {journeySteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 items-start bg-white rounded-2xl p-6 shadow-md border border-gray-100"
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                  style={{ backgroundColor: step.color }}
                >
                  <step.icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold" style={{ color: step.color }}>
                      {step.number}
                    </span>
                    <h3 className="text-xl font-bold text-[#0A2546]">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// NEW: Live Stats Section with Animated Counters
// ============================================
const LiveStatsSection = () => {
  const stats = [
    { icon: Users, label: 'تلميذ نشط', value: 500, suffix: '+', color: '#07cced' },
    { icon: GraduationCap, label: 'نسبة النجاح', value: 97, suffix: '%', color: '#0A2546' },
    { icon: Award, label: 'جائزة وإنجاز', value: 15, suffix: '+', color: '#07cced' },
    { icon: BookOpen, label: 'برنامج تعليمي', value: 12, suffix: '+', color: '#0A2546' }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-[#0A2546] to-[#07cced] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <stat.icon size={32} className="text-white" />
                </div>
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-white/90 font-medium text-lg">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// ENHANCED: Team Section (keeping your original with minor tweaks)
// ============================================
const TeamSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [isRTL, setIsRTL] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const carouselRef = useRef(null);
  
  const getRoleIcon = (role) => {
    switch(role) {
      case "أستاذ رياضيات":
      case "أستاذة رياضيات":
        return <Calculator size={24} />;
      case "مدير الشؤون الإدارية والمالية":
        return <Users size={24} />;
      case "مسؤولة الإحصائيات واللوجستيات":
        return <BarChart size={24} />;
      case "تكنولوجيا المعلومات":
        return <Monitor size={24} />;
      case "Community Manager":
        return <MessageSquare size={24} />;
      case "مدرب تعليم إلكتروني":
        return <GraduationCapIcon size={24} />;
      case "أستاذ عربي":
      case "أستاذة عربية":
        return <BookText size={24} />;
      case "أستاذة علوم":
      case "أستاذ علوم":
        return <Beaker size={24} />;
      case "أستاذ فيزياء":
        return <Atom size={24} />;
      case "أستاذ فلسفة":
        return <Brain size={24} />;
      case "أستاذة إنجليزية":
        return <Languages size={24} />;
      case "أستاذة ألمانية":
        return <Languages size={24} />;
      case "أستاذة إعلامية":
        return <Monitor size={24} />;
      default:
        return <UserCheck size={24} />;
    }
  };
  
  const teamData = [
    {
      id: 1,
      name: "بشير المهداوي",
      role: "أستاذ رياضيات",
      badge: "الرياضيات",
      color: "from-[#07cced] to-[#0A2546]"
    },
    {
      id: 2,
      name: "ماهر المهداوي",
      role: "مدير الشؤون الإدارية والمالية",
      badge: "المؤسس",
      color: "from-[#07cced] to-[#0A2546]"
    },
    {
      id: 3,
      name: "صفاء الكعبي",
      role: "مسؤولة الإحصائيات واللوجستيات",
      badge: "الإحصائيات",
      color: "from-[#07cced] to-[#0A2546]"
    },
    {
      id: 4,
      name: "أمير الدريدي",
      role: "تكنولوجيا المعلومات",
      badge: "التقنية",
      color: "from-[#07cced] to-[#0A2546]"
    },
    {
      id: 5,
      name: "ضياء تمر",
      role: "Community Manager",
      badge: "التطوير",
      color: "from-[#07cced] to-[#0A2546]"
    },
    { 
      id: 6,
      name: "عمر بن خليل",
      role: "مدرب تعليم إلكتروني",
      badge: "التدريب",
      color: "from-[#07cced] to-[#0A2546]"
    },
    {
      id: 7,
      name: "عادل فرشيشي",
      role: "أستاذ رياضيات",
      badge: "الرياضيات",
      color: "from-[#07cced] to-[#0A2546]"
    },
    {
      id: 8,
      name: "لسعد نجار",
      role: "أستاذ عربي",
      badge: "اللغة العربية",
      color: "from-[#07cced] to-[#0A2546]"
    },
    {
      id: 9,
      name: "هويدة كبير الحناشي",
      role: "أستاذة علوم",
      badge: "العلوم",
      color: "from-[#07cced] to-[#0A2546]"
    },
    { id: 10, name: "عفاف عزابي", role: "أستاذة رياضيات", badge: "الرياضيات", color: "from-[#07cced] to-[#0A2546]" },
    { id: 11, name: "علي البكوش", role: "أستاذ رياضيات", badge: "الرياضيات", color: "from-[#07cced] to-[#0A2546]" },
    { id: 12, name: "أمجد رزقي", role: "أستاذ رياضيات", badge: "الرياضيات", color: "from-[#07cced] to-[#0A2546]" },
    { id: 13, name: "لؤي جوعو", role: "أستاذ رياضيات", badge: "الرياضيات", color: "from-[#07cced] to-[#0A2546]" },
    { id: 14, name: "نجاة مليحي", role: "أستاذة رياضيات", badge: "الرياضيات", color: "from-[#07cced] to-[#0A2546]" },
    { id: 15, name: "سناء بن حمودة", role: "أستاذة رياضيات", badge: "الرياضيات", color: "from-[#07cced] to-[#0A2546]" },
    { id: 16, name: "سامي زواري", role: "أستاذ رياضيات", badge: "الرياضيات", color: "from-[#07cced] to-[#0A2546]" },
    { id: 17, name: "شيماء العابد", role: "أستاذة رياضيات", badge: "الرياضيات", color: "from-[#07cced] to-[#0A2546]" },
    { id: 18, name: "يوسف العباسي", role: "أستاذ رياضيات", badge: "الرياضيات", color: "from-[#07cced] to-[#0A2546]" },
    { id: 19, name: "عادل", role: "أستاذ فيزياء", badge: "الفيزياء", color: "from-[#07cced] to-[#0A2546]" },
    { id: 20, name: "بلال يزيد", role: "أستاذ فيزياء", badge: "الفيزياء", color: "from-[#07cced] to-[#0A2546]" },
    { id: 21, name: "هادي عويدي", role: "أستاذ فيزياء", badge: "الفيزياء", color: "from-[#07cced] to-[#0A2546]" },
    { id: 22, name: "سفيان قمّودي", role: "أستاذ فلسفة", badge: "الفلسفة", color: "from-[#07cced] to-[#0A2546]" },
    { id: 23, name: "عائشة بالدي", role: "أستاذة إنجليزية", badge: "الإنجليزية", color: "from-[#07cced] to-[#0A2546]" },
    { id: 24, name: "إمنى بن حميدة", role: "أستاذة إنجليزية", badge: "الإنجليزية", color: "from-[#07cced] to-[#0A2546]" },
    { id: 25, name: "وداد جبالي", role: "أستاذة علوم", badge: "العلوم", color: "from-[#07cced] to-[#0A2546]" },
    { id: 26, name: "وداد بلكحل", role: "أستاذة علوم", badge: "العلوم", color: "from-[#07cced] to-[#0A2546]" },
    { id: 27, name: "إيناس مراد", role: "أستاذة عربية", badge: "اللغة العربية", color: "from-[#07cced] to-[#0A2546]" },
    { id: 28, name: "سعيدة العبيّدي", role: "أستاذة ألمانية", badge: "الألمانية", color: "from-[#07cced] to-[#0A2546]" },
    { id: 29, name: "رندا", role: "أستاذة إعلامية", badge: "الإعلامية", color: "from-[#07cced] to-[#0A2546]" },
    { id: 30, name: "وداد مخلوي", role: "أستاذة إعلامية", badge: "الإعلامية", color: "from-[#07cced] to-[#0A2546]" },
  ];
  
  const getItemsPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 480) return 1;
      if (window.innerWidth < 768) return 2;
      if (window.innerWidth < 1024) return 3;
      return 4;
    }
    return 4;
  };

  useEffect(() => {
    const handleResize = () => {
      const newItemsPerView = getItemsPerView();
      setItemsPerView(newItemsPerView);
      setCurrentIndex(prev => Math.min(prev, Math.max(0, teamData.length - newItemsPerView)));
    };
    
    setItemsPerView(getItemsPerView());
    setIsRTL(document.dir === 'rtl' || document.documentElement.lang === 'ar');
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [teamData.length]);

  const maxIndex = Math.max(0, teamData.length - itemsPerView);
  
  useEffect(() => {
    if (maxIndex === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    
    return () => clearInterval(interval);
  }, [maxIndex]);

  const prevHandler = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
  };
  
  const nextHandler = () => {
    setCurrentIndex(prev => (prev < maxIndex ? prev + 1 : 0));
  };

  const leftHandler = isRTL ? nextHandler : prevHandler;
  const rightHandler = isRTL ? prevHandler : nextHandler;

  return (
    <section className="py-20 bg-white relative overflow-hidden font-tajawal">
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md mb-6 border border-gray-100">
            <Users size={20} className="text-[#07cced]" />
            <span className="text-[#0A2546] font-semibold text-sm">فريقنا المتميز</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0A2546] mb-4">
            القادة الذين يشكلون المستقبل
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            فريق من الخبراء المتخصصين يعملون بتفانٍ لتقديم تعليم عالي الجودة
          </p>
        </div>
        
        <div className="relative">
          {maxIndex > 0 ? (
            <>
              <div className="overflow-hidden" ref={carouselRef}>
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ 
                    transform: `translateX(${isRTL ? currentIndex * (100 / itemsPerView) : -currentIndex * (100 / itemsPerView)}%)`,
                  }}
                >
                  {teamData.map((member) => (
                    <div
                      key={member.id}
                      className="flex-shrink-0 px-3"
                      style={{ width: `${100 / itemsPerView}%` }}
                    >
                      <div 
                        className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#07cced]/30 max-w-sm mx-auto hover:-translate-y-2 cursor-pointer"
                        onMouseEnter={() => setHoveredCard(member.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <div className="relative h-40 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-300`}>
                            {getRoleIcon(member.role)}
                          </div>
                          
                          <div className="absolute top-3 right-3">
                            <span className="px-3 py-1 bg-[#07cced] text-white text-xs font-semibold rounded-full shadow-md">
                              {member.badge}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6 text-center">
                          <h3 className="text-xl font-bold text-[#0A2546] mb-2">
                            {member.name}
                          </h3>
                          <p className="text-gray-600 font-medium">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <>
                <button
                  onClick={leftHandler}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300 z-10 border border-gray-100"
                  aria-label="Previous team member"
                >
                  <ChevronLeft size={20} className="text-[#0A2546]" />
                </button>
                
                <button
                  onClick={rightHandler}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-300 z-10 border border-gray-100"
                  aria-label="Next team member"
                >
                  <ChevronRight size={20} className="text-[#0A2546]" />
                </button>
              </>
              
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`transition-all duration-300 ${
                      currentIndex === index
                        ? 'w-8 h-2 bg-[#07cced] rounded-full'
                        : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-[#0A2546]'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className={`grid gap-6 ${
              itemsPerView === 1 ? 'grid-cols-1' :
              itemsPerView === 2 ? 'grid-cols-2' :
              itemsPerView === 3 ? 'grid-cols-3' :
              'grid-cols-4'
            } justify-items-center`}>
              {teamData.map((member) => (
                <div
                  key={member.id}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 w-full max-w-sm hover:-translate-y-2 cursor-pointer"
                  onMouseEnter={() => setHoveredCard(member.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="relative h-40 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-300`}>
                      {getRoleIcon(member.role)}
                    </div>
                    
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-[#07cced] text-white text-xs font-semibold rounded-full shadow-md">
                        {member.badge}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-[#0A2546] mb-2">
                      {member.name}
                    </h3>
                    <p className="text-gray-600 font-medium">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ============================================
// Keep all your other original sections (PartnersSection, ReviewSection, SchoolGallery)
// with updated color scheme
// ============================================
const PartnersSection = () => {
  const partners = [
    { id: 1, logo: "https://ihet.ens.tn/wp-content/uploads/2024/10/cropped-image001.png", website: "https://ihet.ens.tn", name: "Ihet" },
    { id: 2, logo: "https://lh3.googleusercontent.com/p/AF1QipPw7RJ4tIkfQ01mxHcqHxQ06j_cPLZnUyUQTt9I=s1360-w1360-h1020-rw", website: "https://ecs-academie-sherbrooke.com/", name: "ECS" },
    { id: 4, logo: "https://i.ibb.co/DgVxD4xH/449660791-1519223022009283-3786115954027063177-n.jpg", website: "https://www.instagram.com/injah_tv/", name: "Injah TV" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md mb-6 border border-gray-100">
            <Handshake size={20} className="text-[#07cced]" />
            <span className="text-[#0A2546] font-semibold text-sm">شركاؤنا</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-[#0A2546] mb-4">شراكات استراتيجية</h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            نفخر بشراكاتنا التي تدعم رؤيتنا التعليمية وتفتح آفاقاً جديدة لطلابنا
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-12 lg:gap-16">
          {partners.map((p, i) => (
            <motion.a
              key={p.id}
              href={p.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center p-4 bg-transparent hover:shadow-none transition-all duration-300 grayscale hover:grayscale-0 w-full sm:w-auto max-w-[240px] hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
            >
              <div className="h-28 w-full flex items-center justify-center mb-4">
                <img
                  src={p.logo}
                  alt={p.name}
                  className="w-auto max-h-full object-contain opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&size=200&background=07cced&color=fff`;
                  }}
                />
              </div>

              <span className="text-center text-[#0A2546] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {p.name}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};


const ReviewSection = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 bg-[#07cced]/5 rounded-full -translate-x-40 -translate-y-40 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#0A2546]/5 rounded-full translate-x-32 translate-y-32 blur-3xl"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md mb-6 border border-gray-100">
            <Quote size={20} className="text-[#07cced]" />
            <span className="text-[#0A2546] font-semibold text-sm">شهادات طلابنا</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0A2546] mb-4">
            ما يقوله طلابنا
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            قصص نجاح حقيقية من تلاميذنا المتميزين
          </p>
        </motion.div>
        
        <div className="max-w-6xl mx-auto relative">
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#0A2546] shadow-lg hover:shadow-xl hover:bg-[#07cced] hover:text-white transition-all duration-300"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#0A2546] shadow-lg hover:shadow-xl hover:bg-[#07cced] hover:text-white transition-all duration-300"
          >
            <ChevronRight size={24} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(currentIndex, currentIndex + 3).concat(
              testimonials.slice(0, Math.max(0, currentIndex + 3 - testimonials.length))
            ).map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#07cced]/30 h-[420px] flex flex-col"
              >
                <div className="flex justify-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} className="text-[#FFD700] fill-[#FFD700]" />
                  ))}
                </div>
                
                <p className="text-gray-600 text-lg leading-relaxed italic text-center mb-8 flex-1 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:8]">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-4 justify-center mt-auto">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#07cced]/30 shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-[#0A2546] text-lg">
                      {testimonial.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{testimonial.year || 'تلميذ متميز'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const SchoolGallery = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const galleryImages = [
    "https://i.ibb.co/93gLxmqh/2.jpg",
    "https://i.ibb.co/vxXkcssN/3.jpg",
    "https://i.ibb.co/8gkztMgY/4.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % galleryImages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#07cced]/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#0A2546]/10 rounded-full translate-x-24 translate-y-24 blur-3xl"></div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md mb-6 border border-gray-100">
            <Camera size={20} className="text-[#07cced]" />
            <span className="text-[#0A2546] font-semibold text-sm">معرض الصور</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0A2546] mb-4">
            لحظات من التعلم والإبداع
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            استعرض أجمل اللحظات والأنشطة التي تعكس بيئة التعلم المميزة في مدرستنا
          </p>
        </motion.div>
        
        <motion.div 
          className="relative mb-12 max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <img
            src={galleryImages[activeIndex]}
            alt="School gallery"
            className="w-full h-[500px] object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2546]/20 to-transparent pointer-events-none"></div>
        </motion.div>
        
        <div className="flex justify-center gap-6 mb-12">
          {galleryImages.map((image, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.1 }}
              className={`w-24 h-24 rounded-2xl overflow-hidden shadow-md transition-all duration-300 ${
                index === activeIndex ? 'ring-4 ring-[#07cced] ring-offset-2' : 'opacity-60'
              }`}
              onClick={() => setActiveIndex(index)}
            >
              <img
                src={image}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
        
        <div className="flex justify-center gap-3">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'bg-[#07cced] w-8' : 'bg-gray-300'
              }`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// Main Home Component with Enhanced Structure
// ============================================
const Home = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Malek Khemakhem',
      image: 'https://i.ibb.co/B5K2XmdY/469650844-3440176252949656-5327760947951880917-n.jpg',
      text: 'Je recommande vivement ! Des profs compétents et attentionnés qui ont transformé ma perception des mathématiques.',
      rating: 5,
    },
    {
      id: 2,
      name: 'Mekki Nour',
      image: 'https://i.ibb.co/Q3XpMDgv/414481819-1621659651703621-804366094795188094-n.jpg',
      text: 'An outstanding academic experience with top-notch teaching. The interactive methods helped me improve from a C to an A in just two months!',
      rating: 5,
    },
    {
      id: 3,
      name: 'Mohamed Amjed Rezgui',
      image: 'https://i.ibb.co/jkwKkqTr/481309996-9186418871443966-2075014687307597261-n.jpg',
      text: "Une expérience éducative enrichissante et moderne. J'ai adoré l'approche pédagogique qui rend les concepts complexes faciles à comprendre.",
      rating: 5,
    },
    {
      id: 4,
      name: 'Farah Chaabane',
      image: 'https://i.ibb.co/230mvWm3/489431262-1690684371539791-2504762869389308917-n.jpg',
      text: 'ils prennent soin de chaque étudiant quel que soit leur niveau scolaire with MBS you always move forward',
      rating: 5,
    },
    {
      id: 5,
      name: 'Aymen Hbibi',
      image: 'https://i.ibb.co/QVdX3KX/465148175-1825107811629123-1206818394880966332-n.jpg',
      text: 'Je recommande vivement ! Je nai jamais rencontré des profs aussi compétents et attentionnés MBS is the best',
      rating: 5,
    },
    {
      id: 6,
      name: 'Dhia Tmar',
      image: 'https://i.ibb.co/RpbMBvn7/493678735-4124703724519804-3865957529728503939-n.jpg',
      text: 'Selecting the right educational institution is a pivotal decision that shapes a student\'s future. Mbs is an outstanding choice, renowned for its academic excellence, supportive community, and comprehensive educational approach. The school offers a dynamic and challenging curriculum designed to foster intellectual growth and critical thinking skills. Mbs is the best ever',
      rating: 5,
    },
    {
      id: 7,
      name: 'Wiem Ben Jdira',
      image: 'https://i.ibb.co/nT7ktV6/492611497-10224140718464957-6636948913000938364-n.jpg',
      text: 'MBS est une école pluridisciplinaire qui se différencie par son excellence traduite via les compétences déployées par les enseignants ainsi que la qualité des activités extrascolaires qu\'on peut y retrouver. Grâce à son adaptabilité aux besoins actuels, elle a su apporter la valeur ajoutée nécessaire et efficace à l\'enseignement primaire et secondaire. Bonne continuation et beaucoup de succès à toute l\'équipe MBS et spécialement à son fondateur Mr Béchir : Une vraie Sucess Story',
      rating: 5,
    },
  ];

  const [mapLoaded, setMapLoaded] = useState(false);
  const handleMapLoad = () => setMapLoaded(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      
      {/* NEW HERO SECTION - Replaced with the provided one */}
      <div className="min-h-screen bg-white relative overflow-x-hidden" style={{ fontFamily: "'Tajawal', sans-serif" }}>
        {/* CSS Styles for Animations - Embedded for easy copy-paste */}
        <style>{`
        @keyframes floatSlow {
        0%, 100% { transform: translateY(0) translateX(0); }
        50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes floatMedium {
        0%, 100% { transform: translateY(0) translateX(0); }
        50% { transform: translateY(-35px) translateX(-15px); }
        }
        @keyframes floatFast {
        0%, 100% { transform: translateY(0) translateX(0); }
        50% { transform: translateY(-50px) translateX(20px); }
        }
        @keyframes pulseSoft {
        0%, 100% { opacity: 0.4; scale: 1; }
        50% { opacity: 0.7; scale: 1.05; }
        }
        .particle { position: absolute; border-radius: 50%; pointer-events: none; }
        .p-slow { animation: floatSlow 15s ease-in-out infinite; }
        .p-medium { animation: floatMedium 10s ease-in-out infinite; }
        .p-fast { animation: floatFast 7s ease-in-out infinite; }
        .pulse { animation: pulseSoft 4s ease-in-out infinite; }
        `}</style>

        {/* Hero Section Main Container */}
        <section className="relative w-full bg-white min-h-[85vh] flex items-center justify-center overflow-hidden">

        {/* ==================== BACKGROUND PARTICLES LAYER ==================== */}
        {/* These are lightweight CSS shapes suggesting geometry/connections */}
        <div className="absolute inset-0 overflow-hidden">
        {/* Blue geometric nodes */}
        <div className="particle p-slow bg-[#03cced]/10 w-64 h-64 top-[-5%] left-[10%] blur-3xl"></div>
        <div className="particle p-medium bg-[#03cced]/20 w-32 h-32 bottom-[10%] right-[5%] blur-2xl"></div>

        {/* Gold geometric nodes */}
        <div className="particle p-slow bg-[#EFB533]/10 w-48 h-48 top-[20%] right-[15%] blur-3xl"></div>
        <div className="particle p-fast bg-[#EFB533]/20 w-24 h-24 bottom-[-5%] left-[20%] blur-xl"></div>

        {/* Subtle connecting lines/dots suggesting a grid */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-[#03cced]/40 rounded-full pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-2 h-2 bg-[#EFB533]/40 rounded-full pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-[#0E2138]/20 rounded-full pulse delay-300"></div>
        {/* A very faint angled line suggesting geometry */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent rotate-12 opacity-50"></div>
        </div>
        {/* ==================== END BACKGROUND ==================== */}


        {/* ==================== FOREGROUND CONTENT ==================== */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center">



        {/* Main Title - Clean, Dark, Professional */}
        {/* Using font-extrabold instead of black for a slightly cleaner modern look */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0E2138] mb-6 leading-tight tracking-tight" dir="rtl">
        مرحباً بكم في <span className="text-[#03cced] inline-block relative" style={{ fontFamily: "'Playfair Display', serif" }}>
        MBS
        {/* Subtle underline accent */}
        <svg className="absolute -bottom-2 left-0 w-full h-2 text-[#03cced]/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" /></svg>
        </span>
        </h1>

        {/* Subtitle - Dark Gray */}
        <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-6" dir="rtl">
        شريكك الموثوق نحو التفوق في <span className="text-[#EFB533]">الرياضيات والعلوم</span>
        </h2>

        {/* Description - Lighter Gray, constrained width */}
        <p className="text-gray-500 text-base md:text-lg max-w-2xl mb-10 leading-relaxed font-medium" dir="rtl">
        منصة تعليمية حديثة مصممة لتبسيط المفاهيم المعقدة وبناء أساس أكاديمي قوي للمستقبل.
        </p>

        {/* Action Buttons - Minimalist & Modern */}
        <div className="flex flex-col sm:flex-row-reverse gap-4 w-full justify-center mb-12">

        {/* Primary Button (Solid) */}
        <button
        onClick={() => window.location.href = '/Registration'}
        className="group bg-[#03cced] hover:bg-[#02b3d1] text-white px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2"
        >
        <span>ابدأ رحلتك الآن</span>
        {/* Arrow Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform rotate-180 transition-transform group-hover:-translate-x-1">
        <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
        </svg>
        </button>

        {/* Secondary Button (Outline) */}
        <button
        onClick={() => window.location.href = '/about'}
        className="group bg-white text-[#0E2138] border-2 border-[#0E2138]/20 hover:border-[#03cced] hover:text-[#03cced] px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2"
        >
        <span>اعرف المزيد عنا</span>
        </button>
        </div>

        </div>
        </section>
      </div>

      {/* New: Live Stats Section */}
      <LiveStatsSection />

      {/* Enhanced About Section */}
      <section id="about-section" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-32 h-32 bg-[#07cced]/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-32 right-32 w-48 h-48 bg-[#0A2546]/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md mb-6 border border-gray-100">
              <Globe size={20} className="text-[#07cced]" />
              <span className="text-[#0A2546] font-semibold text-sm">تأسست 2019</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#0A2546] mb-4">
              MBSchool: بوابة المستقبل
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نجمع بين التقاليد التعليمية والابتكار لنبني جيلاً مبدعاً
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <h3 className="text-3xl font-bold text-[#0A2546] leading-tight">
                التعليم الذي يلهم ويبني
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                في MBSchool، نركز على تطوير المهارات العلمية والإبداعية من خلال مناهج حديثة وفريق متخصص.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Brain, label: 'تعليم تفاعلي', color: '#07cced' },
                  { icon: Target, label: 'نتائج مضمونة', color: '#0A2546' },
                  { icon: Users, label: 'فريق خبير', color: '#07cced' },
                  { icon: Zap, label: 'ابتكار مستمر', color: '#0A2546' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 text-center hover:shadow-lg transition-all duration-300"
                  >
                    <item.icon size={32} className="mx-auto mb-4" style={{ color: item.color }} />
                    <span className="font-bold text-[#0A2546]">{item.label}</span>
                  </motion.div>
                ))}
              </div>
              
              <Link to="/about" className="inline-flex items-center gap-3 px-8 py-4 bg-[#0A2546] text-white rounded-full font-bold hover:bg-[#07cced] transition-all duration-300 shadow-lg hover:shadow-xl text-lg">
                اكتشف المزيد
                <ArrowLeft size={20} />
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <video
                src="https://res.cloudinary.com/dsajo4dk9/video/upload/q_auto/w4eekdsv8vvgiyqgtnyp.mp4"
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
                autoPlay
                muted
                loop
                playsInline
                controls
              />
              
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="absolute -top-6 -right-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-100 text-center"
              >
                <div className="text-4xl font-bold text-[#07cced]">
                  <AnimatedCounter end={500} suffix="+" />
                </div>
                <div className="text-gray-600 font-medium">تلميذ ناجح</div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-100 text-center"
              >
                <div className="text-4xl font-bold text-[#0A2546]">
                  <AnimatedCounter end={97} suffix="%" />
                </div>
                <div className="text-gray-600 font-medium">نسبة نجاح</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* New: Programs Section */}
      <ProgramsSection />

      {/* New: Why Choose Us Section */}
      <WhyChooseUsSection />

      {/* New: Student Journey Section */}
      <StudentJourneySection />

      {/* Team Section */}
      <TeamSection />

      {/* Achievements Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-48 h-48 bg-[#07cced]/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#0A2546]/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md mb-6 border border-gray-100">
              <Trophy size={24} className="text-[#07cced]" />
              <span className="text-[#0A2546] font-semibold text-sm">إنجازاتنا</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#0A2546] mb-4">
              نفخر بإنجازاتنا
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              شهادة على التزامنا بالتميز التعليمي
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Trophy, number: '1', label: 'المركز الأول', desc: 'في نسب النجاح بتونس', color: '#07cced' },
              { icon: GraduationCap, number: '97%', label: 'نجاح البكالوريا', desc: 'عام 2023', color: '#0A2546' },
              { icon: Users, number: '3000+', label: 'تلميذ متفوق', desc: 'تخرجوا بتميز', color: '#07cced' },
              { icon: Award, number: '15+', label: 'جائزة', desc: 'تقديرية وطنية', color: '#0A2546' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#07cced]/30 text-center group"
              >
                <item.icon size={48} className="mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" style={{ color: item.color }} />
                <div className="text-4xl font-bold text-[#0A2546] mb-2">{item.number}</div>
                <div className="text-xl font-bold text-[#0A2546] mb-2">{item.label}</div>
                <p className="text-gray-600 text-lg">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <ReviewSection testimonials={testimonials} />

      {/* Partners Section */}
      <PartnersSection />

      {/* Gallery Section */}
      <SchoolGallery />

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#0A2546]/10 rounded-full -translate-x-40 -translate-y-40 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#07cced]/10 rounded-full translate-x-32 translate-y-32 blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md mb-6 border border-gray-100">
              <MapPin size={20} className="text-[#07cced]" />
              <span className="text-[#0A2546] font-semibold text-sm">موقعنا</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#0A2546] mb-4">
              في قلب حمام الشط، سهل الوصول
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              موقع استراتيجي يضمن سهولة الوصول لطلابنا وزوارنا من مختلف المناطق
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
          >
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
              <div className="text-center md:text-right">
                <h3 className="text-2xl font-bold text-[#0A2546] mb-2">08 Rue Zouhair Essafi</h3>
                <p className="text-lg text-gray-600">Hammam Chatt, Ben Arous, Tunisia</p>
              </div>
              
              <div className="flex gap-6">
                <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-100 text-center hover:shadow-lg transition-all duration-300">
                  <Clock size={24} className="text-[#07cced] mx-auto mb-2" />
                  <div className="text-[#0A2546] font-bold">8:00 - 17:00</div>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-100 text-center hover:shadow-lg transition-all duration-300">
                  <Phone size={24} className="text-[#0A2546] mx-auto mb-2" />
                  <div className="text-[#0A2546] font-bold">090 208 27</div>
                </div>
              </div>
            </div>
            
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-xl">
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin w-16 h-16 border-4 border-[#07cced] border-t-transparent rounded-full"></div>
                </div>
              )}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3200.831963436187!2d10.34196867582587!3d36.71475447228903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd4b8c79c6b9f7%3A0x12e12e12a36e56b7!2s08%20Rue%20Zouhair%20Essafi%2C%20Hammam%20Chatt!5e0!3m2!1sfr!2stn!4v1712864083033!5m2!1sfr!2stn"
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
                onLoad={handleMapLoad}
              />
            </div>
            
            <div className="text-center mt-8">
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=08+Rue+Zouhair+Essafi,+Hammam+Chatt,+Tunisia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#0A2546] text-white rounded-full font-bold hover:bg-[#07cced] transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
              >
                <MapPin size={20} />
                احصل على الاتجاهات
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#0A2546] via-[#0A2546] to-[#07cced] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-32 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles size={64} className="text-[#07cced] mx-auto mb-8" />
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              انضم إلينا اليوم!
            </h2>
            <p className="text-xl lg:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed">
              ابدأ رحلتك نحو التميز مع MBSchool واستفد من تعليم حديث وملهم
            </p>
            <Link to="/contact" className="inline-flex items-center gap-3 px-12 py-5 bg-white text-[#0A2546] rounded-full font-bold hover:bg-[#07cced] hover:text-white transition-all duration-300 shadow-2xl text-lg">
              تواصل معنا الآن
              <ArrowLeft size={24} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
        
        .font-tajawal {
          font-family: 'Tajawal', sans-serif;
        }
        
        /* Enhanced Animations */
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translate3d(0, 40px, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        
        @keyframes slideInScale {
          0% {
            opacity: 0;
            transform: translate3d(0, 60px, 0) scale(0.85);
          }
          60% {
            opacity: 0.8;
            transform: translate3d(0, -12px, 0) scale(1.03);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        
        @keyframes textReveal {
          0% {
            opacity: 0;
            transform: translate3d(0, 30px, 0);
            filter: blur(8px);
          }
          60% {
            opacity: 0.8;
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            filter: blur(0);
          }
        }
        
        @keyframes glassShine {
          0% {
            transform: translateX(-100%) skewX(-15deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
            opacity: 0;
          }
        }
        
        @keyframes slideInFromLeft {
          0% {
            opacity: 0;
            transform: translate3d(-70px, 15px, 0) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        
        /* Enhanced Text Animations */
        .enhanced-title {
          animation: slideInFromLeft 1.8s cubic-bezier(0.165, 0.84, 0.44, 1) 0.4s both;
          position: relative;
        }
        
        .enhanced-subtitle {
          animation: slideInFromLeft 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s both;
          position: relative;
        }
        
        .enhanced-description {
          animation: slideInFromLeft 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1s both;
          position: relative;
        }
        
        .enhanced-title h1 {
          color: #ffffff;
          line-height: 1.15 !important;
          text-align: center;
          text-shadow: 0 6px 24px rgba(0, 0, 0, 0.4), 0 3px 12px rgba(255, 255, 255, 0.2);
          position: relative;
          z-index: 1;
        }
        
        .enhanced-subtitle h2 {
          color: #ffffff;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 255, 255, 0.3);
          text-align: center;
          position: relative;
          z-index: 1;
        }
        
        .enhanced-description p {
          color: #f0f0f0;
          text-shadow: 0 3px 18px rgba(0, 0, 0, 0.5), 0 0 22px rgba(255, 255, 255, 0.2);
          text-align: center;
          position: relative;
          z-index: 1;
        }
        
        .backdrop-blur-enhanced {
          backdrop-filter: blur(24px) saturate(180%);
          background: linear-gradient(135deg, rgba(10, 37, 70, 0.35) 0%, rgba(7, 204, 237, 0.2) 50%, rgba(10, 37, 70, 0.3) 100%);
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.25);
          position: relative;
          overflow: hidden;
        }
        
        .backdrop-blur-enhanced::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.25) 30%,
            rgba(255, 255, 255, 0.5) 50%,
            rgba(255, 255, 255, 0.25) 70%,
            transparent 100%
          );
          animation: glassShine 3.5s ease-in-out 1.8s infinite;
          pointer-events: none;
          z-index: 2;
        }
        
        /* Enhanced Card Styles */
        .info-card-enhanced {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 24px;
          padding: 1.5rem 2rem;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          animation: fadeInUp 1.2s ease-out both;
          flex: 1 1 45%;
          max-width: 320px;
          min-width: 0;
          width: auto;
          text-align: right;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          border: 1px solid rgba(7, 204, 237, 0.1);
          cursor: pointer;
        }
        
        .info-card-enhanced:hover {
          transform: translate3d(0, -12px, 0) scale(1.03);
          box-shadow: 0 28px 56px rgba(7, 204, 237, 0.2);
          border-color: rgba(7, 204, 237, 0.3);
        }
        
        .card-icon-enhanced {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #0A2546 0%, #07cced 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 10px 30px rgba(7, 204, 237, 0.35);
          transition: all 0.3s ease;
        }
        
        .info-card-enhanced:hover .card-icon-enhanced {
          transform: rotate(-5deg) scale(1.1);
          box-shadow: 0 14px 40px rgba(7, 204, 237, 0.5);
        }
        
        .card-icon-enhanced svg {
          width: 32px;
          height: 32px;
          color: white;
        }
        
        .card-content-enhanced {
          flex: 1;
          text-align: right;
        }
        
        .card-title-enhanced {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0A2546;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        
        .card-description-enhanced {
          color: #6B7280;
          font-size: 0.95rem;
          font-weight: 500;
        }
        
        .text-content-left {
          max-width: 800px;
          text-align: center;
          animation: slideInScale 2s cubic-bezier(0.165, 0.84, 0.44, 1) 0.3s both;
        }
        
        .bg-image-container {
          height: 75vh;
          min-height: 550px;
        }
        
        .cards-container {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: nowrap;
        }
        
        /* Desktop Responsive */
        @media (min-width: 1024px) {
          .hero-content-wrapper {
            justify-content: flex-end;
            padding-right: 5rem;
          }
          
          .text-content-left {
            padding-top: 3rem;
            max-width: 900px;
          }
          
          .bg-image-container {
            height: 80vh;
            min-height: 600px;
          }
          
          .info-card-enhanced {
            padding: 2rem 2.5rem;
            flex: 1 1 380px;
            max-width: 380px;
            gap: 1.75rem;
          }
          
          .card-icon-enhanced {
            width: 76px;
            height: 76px;
          }
          
          .card-icon-enhanced svg {
            width: 38px;
            height: 38px;
          }
          
          .card-title-enhanced {
            font-size: 1.4rem;
          }
          
          .card-description-enhanced {
            font-size: 1.05rem;
          }
        }
        
        /* Mobile Responsive */
        @media (max-width: 1023px) {
          .hero-content-wrapper {
            justify-content: center;
          }
          
          .bg-image-container .absolute.inset-0 img {
            object-position: left center !important;
          }
        }
        
        @media (max-width: 768px) {
          .enhanced-title h1 { font-size: 1.75rem !important; }
          .enhanced-subtitle h2 { font-size: 1.15rem !important; }
          .enhanced-description p { font-size: 0.95rem !important; }
          
          .text-content-left {
            position: absolute;
            top: 8rem;
            left: 0;
            right: 0;
            margin: 0 auto;
            padding: 0 1rem;
            max-width: 90%;
          }
          
          .backdrop-blur-enhanced {
            padding: 1.5rem;
          }
          
          .cards-container {
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            justify-content: center;
            gap: 1rem;
          }
          
          .info-card-enhanced {
            flex: 1 1 45%;
            max-width: 240px;
            min-width: 110px;
            padding: 1rem 1.25rem;
            gap: 1rem;
          }
          
          .card-icon-enhanced {
            width: 48px;
            height: 48px;
          }
          
          .card-icon-enhanced svg {
            width: 24px;
            height: 24px;
          }
          
          .card-title-enhanced {
            font-size: 1.05rem;
          }
          
          .card-description-enhanced {
            font-size: 0.85rem;
          }
        }
        
        @media (max-width: 480px) {
          .enhanced-title h1 { font-size: 1.4rem !important; }
          .enhanced-subtitle h2 { font-size: 1rem !important; }
          .enhanced-description p { font-size: 0.85rem !important; }
          
          .text-content-left {
            top: 10rem;
            max-width: 92%;
            padding: 0 0.75rem;
          }
          
          .backdrop-blur-enhanced {
            padding: 1.25rem;
          }
          
          .cards-container {
            gap: 0.75rem;
          }
          
          .info-card-enhanced {
            flex: 1 1 45%;
            max-width: 220px;
            padding: 0.9rem 1.1rem;
            gap: 0.85rem;
            min-width: 100px;
          }
          
          .card-icon-enhanced {
            width: 42px;
            height: 42px;
          }
          
          .card-icon-enhanced svg {
            width: 21px;
            height: 21px;
          }
          
          .card-title-enhanced {
            font-size: 0.9rem;
          }
          
          .card-description-enhanced {
            font-size: 0.75rem;
          }
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Additional polish */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
};

export default Home;
