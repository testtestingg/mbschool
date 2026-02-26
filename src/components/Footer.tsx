import React, { useState } from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin, Youtube, Send, BookOpen, Award, Users, FileText, ChevronRight, ExternalLink, Clock, Calendar, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
    }
  };
  
  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
  };

  const quickLinks = [
    { name: 'الرئيسية', path: '/', icon: <ChevronRight size={14} /> },
    { name: 'من نحن', path: '/about', icon: <ChevronRight size={14} /> },
    { name: 'خدماتنا', path: '/services', icon: <ChevronRight size={14} /> },
    { name: 'إنجازاتنا', path: '/achievements', icon: <ChevronRight size={14} /> },
    { name: 'سجل الآن', path: '/register', icon: <ChevronRight size={14} /> },
  ];
  
  const services = [
    { name: 'دروس خصوصية', path: '/services/tutoring', icon: <BookOpen size={14} /> },
    { name: 'تحضير للامتحانات', path: '/services/exam-prep', icon: <Award size={14} /> },
    { name: 'استشارات تعليمية', path: '/services/consulting', icon: <Users size={14} /> },
    { name: 'تعليم عن بعد', href: 'https://app.mbschool.tn', icon: <ExternalLink size={14} /> },
  ];
  
  const resources = [
    { name: 'المدونة', path: '/blog', icon: <FileText size={14} /> },
    { name: 'الأسئلة الشائعة', path: '/faq', icon: <MessageCircle size={14} /> },
    { name: 'معرض الصور', path: '/gallery', icon: <ExternalLink size={14} /> },
    { name: 'فعاليات قادمة', path: '/events', icon: <Calendar size={14} /> },
  ];

  return (
    <motion.footer
      className="bg-[#0A2546] text-gray-100 py-16 relative shadow-2xl overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={sectionVariants}
      dir="rtl"
    >
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#07cced] to-transparent transform rotate-12 scale-150"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#07cced] to-transparent transform -rotate-12 scale-150"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* School Info with Enhanced Logo Section */}
          <motion.div variants={itemVariants} className="text-center md:text-right lg:col-span-2">
            <motion.img
              src="https://i.ibb.co/35HVPc2g/MBS-WHITE-01.png"
              alt="مدرسة المهداوي بشير"
              className="h-24 w-auto mx-auto md:mr-0 mb-6"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/200x80?text=Logo";
              }}
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            />
            <p className="text-gray-300 mb-6 leading-relaxed">
              منصة تعليمية متطورة للرياضيات والعلوم لتحقيق التفوق الأكاديمي. نقدم تعليمًا عالي الجودة بأساليب مبتكرة وفريق من الخبراء المتخصصين.
            </p>
            
            {/* Social Media with Enhanced Buttons */}
            <div className="flex justify-center md:justify-start gap-4 mb-6">
              {/* Facebook with official color */}
              <motion.a
                href="https://www.facebook.com/people/MBS/100063576610003/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                variants={itemVariants}
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#1877F2] to-[#4A90E2] rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-[#1877F2] to-[#4A90E2] p-3 rounded-full border-2 border-gray-500 group-hover:border-[#07cced] transition-colors shadow-md">
                  <Facebook size={24} className="text-white group-hover:text-white transition-colors" />
                </div>
              </motion.a>

              {/* Instagram */}
              <motion.a
                href="https://www.instagram.com/mbs__school/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                variants={itemVariants}
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full border-2 border-gray-500 group-hover:border-[#07cced] transition-colors shadow-md">
                  <Instagram size={24} className="text-white group-hover:text-white transition-colors" />
                </div>
              </motion.a>

              {/* LinkedIn */}
              <motion.a
                href="https://www.linkedin.com/company/mbschool"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                variants={itemVariants}
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A66C2] to-[#0D78D8] rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-[#0A66C2] to-[#0D78D8] p-3 rounded-full border-2 border-gray-500 group-hover:border-[#07cced] transition-colors shadow-md">
                  <Linkedin size={24} className="text-white group-hover:text-white transition-colors" />
                </div>
              </motion.a>
              

            </div>

          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xl font-bold mb-6 text-[#07cced] tracking-wide relative">
              روابط سريعة
              <div className="absolute -bottom-2 right-0 w-12 h-0.5 bg-gradient-to-r from-[#07cced] to-[#EFB533]"></div>
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li key={index} variants={itemVariants} whileHover={{ x: 5 }}>
                  <a
                    href={link.path}
                    className="flex items-center gap-2 text-gray-300 hover:text-[#07cced] transition-all duration-300"
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xl font-bold mb-6 text-[#07cced] tracking-wide relative">
              خدماتنا
              <div className="absolute -bottom-2 right-0 w-12 h-0.5 bg-gradient-to-r from-[#07cced] to-[#EFB533]"></div>
            </h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <motion.li key={index} variants={itemVariants} whileHover={{ x: 5 }}>
                  <a
                    href={service.path}
                    className="flex items-center gap-2 text-gray-300 hover:text-[#07cced] transition-all duration-300"
                  >
                    {service.icon}
                    <span>{service.name}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info with Enhanced Cards */}
          <motion.div variants={itemVariants}>
            <h4 className="text-xl font-bold mb-6 text-[#07cced] tracking-wide relative">
              تواصل معنا
              <div className="absolute -bottom-2 right-0 w-12 h-0.5 bg-gradient-to-r from-[#07cced] to-[#EFB533]"></div>
            </h4>
            <div className="space-y-4">
              <motion.div
                className="flex items-start group bg-white/10 backdrop-blur-sm p-4 rounded-lg border-l-4 border-[#07cced] hover:border-[#EFB533] transition-all duration-300 shadow-sm"
                variants={itemVariants}
                whileHover={{ x: 5, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              >
                <MapPin size={20} className="ml-3 mt-1 text-[#07cced] group-hover:text-[#EFB533] transition-colors flex-shrink-0" />
                <p className="text-sm text-gray-200 group-hover:text-white transition-colors leading-relaxed font-medium" style={{ direction: 'rtl', unicodeBidi: 'plaintext' }}>
                  08 شارع زهير الصافي، حمام الشط، بن عروس، تونس 1164
                </p>
              </motion.div>
              <motion.div
                className="flex items-center group bg-white/10 backdrop-blur-sm p-4 rounded-lg border-l-4 border-[#07cced] hover:border-[#EFB533] transition-all duration-300 shadow-sm"
                variants={itemVariants}
                whileHover={{ x: 5, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              >
                <Phone size={20} className="ml-3 text-[#07cced] group-hover:text-[#EFB533] transition-colors" />
                <p className="text-sm text-gray-200 group-hover:text-white transition-colors font-semibold" style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
                  27 208 090
                </p>
              </motion.div>
              <motion.div
                className="flex items-center group bg-white/10 backdrop-blur-sm p-4 rounded-lg border-l-4 border-[#07cced] hover:border-[#EFB533] transition-all duration-300 shadow-sm"
                variants={itemVariants}
                whileHover={{ x: 5, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              >
                <Mail size={20} className="ml-3 text-[#07cced] group-hover:text-[#EFB533] transition-colors" />
                <p className="text-sm text-gray-200 group-hover:text-white transition-colors break-all font-medium" style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
                  contact@mbschool.tn
                </p>
              </motion.div>

            </div>
          </motion.div>
        </div>

        {/* Enhanced Copyright Section */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-700 text-center relative"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-full px-8 py-3 inline-block border border-gray-600 shadow-md"
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            >
              <p className="text-sm text-gray-200 font-medium" style={{ direction: 'rtl', unicodeBidi: 'plaintext' }}>
                © {new Date().getFullYear()} MBSchool. جميع الحقوق محفوظة.
              </p>
            </motion.div>
            
            <div className="flex gap-6">
              <a href="/privacy" className="text-gray-400 hover:text-[#07cced] transition-colors text-sm">
                سياسة الخصوصية
              </a>
              <a href="/terms" className="text-gray-400 hover:text-[#07cced] transition-colors text-sm">
                الشروط والأحكام
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-[#07cced]/10 rounded-full filter blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.1, 0.25, 0.1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#07cced]/10 rounded-full filter blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.05, 0.2, 0.05],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#07cced]/5 rounded-full filter blur-3xl"
          animate={{ 
            scale: [0.8, 1.1, 0.8], 
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.footer>
  );
};

export default Footer;