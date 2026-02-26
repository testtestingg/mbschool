import React, { useState, useEffect } from 'react';
import {
  Users,
  Trophy,
  Star,
  X,
  Award,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle,
  Play,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURATION & DATA (Outside component for performance) ---

const COLORS = {
  primary: '#0A2546',
  secondary: '#07cced',
  accent: '#EFB533',
};

// 1. Featured images for the page layout (The collage)
const FEATURED_OLYMPIAD_IMAGES = [
  '/events/olympiad-1.jpg',
  '/events/olympiad-56.jpg',
];

const ALL_OLYMPIAD_IMAGES = [
  '/events/olympiad-1.jpg',
  '/events/olympiad-2.jpg',
  '/events/olympiad-3.jpg',
  '/events/olympiad-4.jpg',
  '/events/olympiad-5.jpg',
  '/events/olympiad-6.jpg',
  '/events/olympiad-16.jpg',
  '/events/olympiad-48.jpg',
  '/events/olympiad-56.jpg',
  '/events/olympiad-84.jpg',
  '/events/olympiad-111.jpg',
  '/events/olympiad-136.jpg',
  '/events/olympiad-203.jpg',
  '/events/olympiad-225.jpg',
  '/events/olympiad-262.jpg'
];

const CHAMPIONS_DATA = {
  '2024-2025': {
    national: [
      { name: "غفران الشابي", average: "17.5", achievement: "الأول جهوياً - بن عروس" },
      { name: "أيوب أورسغني", average: "17.5", achievement: "الأولى - معهد حمام أنف" },
      { name: "أشرف دريسي", average: "15.75", achievement: "الأول - معهد ابن رشيق" }
    ],
    bac: [
      { name: "دعاء الشفاي", mathGrade: "19.75", stream: "علوم", medal: "ذهبية" },
      { name: "زينب المدرسي", mathGrade: "19", stream: "تقنية", medal: "ذهبية" },
      { name: "أيوب بن خديجة", mathGrade: "19", stream: "علوم", medal: "ذهبية" },
      { name: "رنيم جربي", mathGrade: "18.75", stream: "تقنية", medal: "ذهبية" },
      { name: "يمنى جديدي", mathGrade: "18.5", stream: "علوم", medal: "ذهبية" },
      { name: "مرام الحداد", mathGrade: "18.25", stream: "تقنية", medal: "ذهبية" },
    ],
    middle: [
      { name: "آية السالمي", grade: "17.88", level: "السابعة", award: "الأولى" },
      { name: "محمد الغنيمي", grade: "17.42", level: "الثامنة", award: "الثالثة" }
    ]
  }
};

const ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

// --- SUB-COMPONENTS ---

const SectionHeader = ({ title, subtitle, icon: Icon }: { title: string, subtitle: string, icon?: any }) => (
  <motion.div 
    className="text-center mb-12"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={ANIMATION_VARIANTS}
  >
    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100 mb-4">
      {Icon && <Icon size={16} color={COLORS.secondary} />}
      <span className="text-xs font-bold tracking-wide uppercase text-slate-600">{subtitle}</span>
    </div>
    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{title}</h2>
    <div className="w-16 h-1 bg-gradient-to-r from-[#0A2546] to-[#07cced] mx-auto rounded-full"></div>
  </motion.div>
);

const ImageGalleryModal = ({ isOpen, onClose, images }: { isOpen: boolean, onClose: () => void, images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') prevImage(); // RTL logic
      if (e.key === 'ArrowLeft') nextImage();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-white/80 hover:text-white transition z-50 bg-white/10 p-2 rounded-full">
        <X size={24} />
      </button>

      {/* Navigation Left */}
      <button onClick={prevImage} className="absolute left-4 md:left-8 text-white/80 hover:text-[#07cced] transition p-3 bg-white/10 rounded-full hover:bg-white/20 z-50">
        <ChevronUp className="rotate-[-90deg]" size={28} />
      </button>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.img 
          key={currentIndex}
          initial={{ opacity: 0.5, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={images[currentIndex]} 
          alt={`Gallery ${currentIndex}`}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Navigation Right */}
      <button onClick={nextImage} className="absolute right-4 md:right-8 text-white/80 hover:text-[#07cced] transition p-3 bg-white/10 rounded-full hover:bg-white/20 z-50">
        <ChevronDown className="rotate-[-90deg]" size={28} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 font-mono text-sm tracking-widest bg-black/50 px-4 py-1 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>
    </motion.div>
  );
};

// --- SECTIONS ---

const HeroSection = () => (
  <section className="relative h-[550px] flex items-center justify-center overflow-hidden bg-slate-900" dir="rtl">
    <div className="absolute inset-0 z-0">
      {/* UPDATED: Increased opacity to 0.5 (was 0.3) so image is clearer */}
      <img 
        src="https://i.ibb.co/5x5DT5QT/1.jpg" 
        alt="Hero Background" 
        className="w-full h-full object-cover opacity-50"
        loading="eager"
      />
      {/* UPDATED: Changed gradient to fade to transparent at top, reducing blue tint */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A2546] via-[#0A2546]/60 to-transparent" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>
    </div>

    <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <div className="inline-block px-4 py-1 rounded-full border border-white/20 bg-white/5 text-[#07cced] text-sm font-bold mb-6 backdrop-blur-sm">
           2019 - 2025
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          نصنع <span style={{ color: COLORS.secondary }}>عباقرة</span> المستقبل
        </h1>
        <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-light leading-relaxed mb-8 opacity-90">
          منذ انطلاقتنا، نؤمن بأن كل تلميذ يحمل بداخله عبقرية رياضية. مهمتنا هي تحويل الخوف من الرياضيات إلى شغف حقيقي للإبداع.
        </p>
      </motion.div>
    </div>
  </section>
);

const OlympiadEventSection = () => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  return (
    <>
      <section className="py-16 md:py-24 bg-white overflow-hidden relative" dir="rtl">
        {/* Abstract shapes for decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-50/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-50/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Text Content */}
            <motion.div 
              className="lg:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={ANIMATION_VARIANTS}
            >
              <div className="inline-flex items-center gap-2 text-[#EFB533] font-bold mb-4 bg-yellow-50 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                <Trophy size={14} />
                <span>حدث مميز</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-[#0A2546] mb-6 leading-tight">
                الأولمبياد الوطني <br/><span className="text-transparent bg-clip-text bg-gradient-to-l from-[#07cced] to-[#0A2546]">للرياضيات</span>
              </h2>
              <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                فخورون باستضافة النسخة الأخيرة من الأولمبياد. شهد الحدث تنافساً شريفاً وإبداعاً لا حدود له من تلاميذنا الذين أثبتوا تفوقهم في حل المسائل الرياضية المعقدة في أجواء حماسية.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {['مشاركة 200+ تلميذ', 'جوائز وطنية قيمة', 'تأهل للتصفيات الدولية', 'إشراف نخبة الأساتذة'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[#0A2546] font-medium text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <CheckCircle size={16} className="text-[#07cced]" />
                    {item}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setIsGalleryOpen(true)}
                className="group inline-flex items-center gap-3 text-white bg-[#0A2546] px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-[#0A2546]/20 hover:bg-[#07cced] transition-all duration-300"
              >
                <span>شاهد صور الحدث</span>
                <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Collage Layout */}
            <motion.div 
              className="lg:w-1/2 w-full relative h-[450px]"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
               <div className="absolute top-0 right-0 w-[65%] h-[60%] rounded-2xl overflow-hidden shadow-2xl border-4 border-white z-20 hover:scale-[1.02] transition duration-500">
                  <img src={FEATURED_OLYMPIAD_IMAGES[0]} alt="Olympiad 1" className="w-full h-full object-cover" loading="lazy" />
               </div>
               <div className="absolute bottom-0 left-0 w-[60%] h-[55%] rounded-2xl overflow-hidden shadow-xl border-4 border-white z-10 hover:scale-[1.02] transition duration-500">
                  <img src={FEATURED_OLYMPIAD_IMAGES[1]} alt="Olympiad 2" className="w-full h-full object-cover" loading="lazy" />
               </div>

               
               {/* Stats Floating Badge */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl z-30 text-center border border-white/50 animate-float">
                  <span className="block text-4xl font-bold text-[#EFB533]">12</span>
                  <span className="text-xs font-bold text-[#0A2546] uppercase tracking-wider">ميدالية ذهبية</span>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <ImageGalleryModal 
            isOpen={isGalleryOpen} 
            onClose={() => setIsGalleryOpen(false)} 
            images={ALL_OLYMPIAD_IMAGES} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

const ChampionsSection = () => {
  const [activeTab, setActiveTab] = useState('bac');
  const [showAll, setShowAll] = useState(false);
  
  const currentData = CHAMPIONS_DATA['2024-2025'][activeTab as keyof typeof CHAMPIONS_DATA['2024-2025']] || [];
  const displayedData = showAll ? currentData : currentData.slice(0, 6);

  return (
    <section className="py-20 bg-slate-50 relative" dir="rtl">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <SectionHeader title="لوحة الشرف" subtitle="نحتفل بالتميز" icon={Star} />

        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-full shadow-sm border border-slate-200 inline-flex">
            {[
              { id: 'national', label: 'الوطني' },
              { id: 'bac', label: 'البكالوريا' },
              { id: 'middle', label: 'الإعدادي' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setShowAll(false); }}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id 
                  ? 'bg-[#0A2546] text-white shadow-md' 
                  : 'text-slate-500 hover:text-[#0A2546] hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayedData.map((student: any, idx: number) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={`${student.name}-${idx}`}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#07cced]/30 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-[#0A2546] font-bold text-lg group-hover:bg-[#07cced] group-hover:text-white transition-colors border border-slate-100">
                    {student.name.charAt(0)}
                  </div>
                  {student.medal && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      student.medal === 'ذهبية' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Award size={12} /> {student.medal}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#0A2546] mb-1">{student.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{student.stream || student.level}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <span className="text-xs text-slate-400 font-medium">النتيجة النهائية</span>
                   <span className="font-mono font-bold text-[#07cced] text-lg tracking-tight">
                     {student.average || student.mathGrade || student.grade}
                   </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {currentData.length > 6 && (
          <div className="text-center mt-12">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 text-[#0A2546] font-bold hover:text-[#07cced] transition bg-white px-6 py-2 rounded-full shadow-sm border border-slate-200"
            >
              {showAll ? (
                <>عرض أقل <ChevronUp size={18} /></>
              ) : (
                <>عرض المزيد من المتفوقين <ChevronDown size={18} /></>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const StatsSection = () => {
  const stats = [
    { label: "تلميذ متخرج", value: "3000+", icon: Users },
    { label: "نسبة نجاح", value: "98%", icon: Trophy },
    { label: "سنوات خبرة", value: "6", icon: Clock },
    { label: "جائزة وطنية", value: "15+", icon: Award },
  ];

  return (
    <section className="py-20 bg-[#0A2546] text-white relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10 divide-x-reverse">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              className="text-center p-4 group cursor-default"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 inline-flex p-3 rounded-full bg-white/5 group-hover:bg-[#07cced] transition-colors duration-500">
                <stat.icon className="w-6 h-6 text-[#07cced] group-hover:text-white transition-colors" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">{stat.value}</div>
              <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- MAIN PAGE COMPONENT ---

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#07cced] selection:text-white" style={{ fontFamily: "'Tajawal', 'Cairo', sans-serif" }}>
      <HeroSection />
      <OlympiadEventSection />
      <ChampionsSection />
      <StatsSection />
      
      {/* Footer CTA */}
      <div className="bg-slate-900 border-t border-slate-800 py-16 text-center px-4" dir="rtl">
        <h3 className="text-2xl md:text-3xl text-white font-bold mb-6">هل أنت مستعد للانضمام إلى نخبة الرياضيات؟</h3>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">سجل الآن وابدأ رحلة التفوق معنا</p>
        <button className="bg-[#EFB533] text-[#0A2546] px-10 py-4 rounded-full font-bold hover:bg-white transition-all shadow-lg hover:shadow-amber-500/20">
          تواصل معنا للتسجيل
        </button>
      </div>
    </div>
  );
};

export default About;