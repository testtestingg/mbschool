import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Facebook,
  Instagram,
  Menu,
  X,
  MapPin,
  Mail,
  Phone,
  ChevronDown,
  ExternalLink,
  FileText,
  MessageCircle,
  Globe
} from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const navLinks = [
  { name: 'الرئيسية', path: '/' },
  { name: 'من نحن؟', path: '/about' },
  { name: 'خدماتنا', path: '/services' },
  { name: 'أرشيف البكالوريا', path: '/archives-bac' }, // Added this line
  { name: 'سجّل الآن', path: '/register' },
];

const menuVariants = {
  closed: { x: '100%', opacity: 0 },
  open: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut', staggerChildren: 0.05 },
  },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

const menuItemVariants = {
  closed: { x: 30, opacity: 0 },
  open: { x: 0, opacity: 1 },
  exit: { x: 30, opacity: 0 },
};

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hideTopBar, setHideTopBar] = useState(false);
  const location = useLocation();
  const ticking = useRef(false);
  const lastScrollY = useRef(0);

  // Pages where header should be completely hidden
  const noHeaderPages = ['/secure-admin-dashboard-2024', '/calendar', '/recrutement'];
  
  // Only show contact bar on home page
  const showContactBar = location.pathname === '/';
  
  // Check if we should show header at all
  const showHeader = !noHeaderPages.includes(location.pathname);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    lastScrollY.current = window.scrollY;
    
    if (!ticking.current) {
      ticking.current = true;
      
      requestAnimationFrame(() => {
        setScrolled(lastScrollY.current > 20);
        setHideTopBar(lastScrollY.current > 50);
        ticking.current = false;
      });
    }
  }, []);

  useEffect(() => {
    if (showHeader) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, showHeader]);

  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  // Don't render header at all for specified pages
  if (!showHeader) {
    return null;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
        * { font-family: 'Tajawal', sans-serif; }
        
        /* Base styles */
        @keyframes smoothGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes subtleShine {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          /* Reduce blur effects on mobile */
          .header-glass, .mobile-menu {
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
          }
          
          /* Optimize scrolling performance */
          body {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }
          
          /* Disable animations on low-end devices */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        }
        
        /* Hardware acceleration */
        .header-glass {
          transform: translateZ(0);
          will-change: transform;
        }
        
        /* Contact bar */
        .contact-bar {
          background: linear-gradient(135deg, #0A2546 0%, #0A2546 25%, #0A2546 50%, #0A2546 75%, #0A2546 100%);
          background-size: 200% 200%;
          animation: smoothGradient 8s ease-in-out infinite;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          height: 34px;
          overflow: hidden;
          transition: transform 0.2s ease-out, opacity 0.2s ease-out;
        }
        @media (min-width: 640px) {
          .contact-bar { height: 38px; }
        }
        .contact-bar::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), rgba(255,255,255,0.2), rgba(255,255,255,0.1), transparent);
          animation: subtleShine 6s ease-in-out infinite;
        }
        
        /* Header glass */
        .header-glass {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(10,37,70,0.1);
          box-shadow: 0 4px 20px rgba(10,37,70,0.08);
          position: fixed;
          left: 0;
          right: 0;
          z-index: 40;
          transition: all 0.2s ease-out;
        }
        
        /* Navigation links */
        .nav-link {
          position: relative;
          font-size: 1.125rem;
          font-weight: 600;
          transition: color 0.2s ease;
          overflow: hidden;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          background: #0A2546;
          transition: width 0.2s ease;
        }
        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }
        .nav-link:hover {
          color: #0A2546;
        }
        
        /* Mobile menu */
        .mobile-menu {
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 10px 30px rgba(10,37,70,0.1);
          border-radius: 16px 0 0 16px;
        }
        
        /* Register button */
        .register-btn {
          background: linear-gradient(135deg, #0A2546 0%, #0A2546 100%);
          color: white;
          transition: all 0.2s ease;
          font-size: 1.125rem;
          font-weight: 700;
          position: relative;
          overflow: hidden;
          border-radius: 8px;
        }
        .register-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(10,37,70,0.3);
        }
        .register-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.6s ease;
        }
        .register-btn:hover::before {
          left: 100%;
        }
        
        /* Contact info */
        .contact-info {
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .contact-info:hover { color: #07cced !important; }
        .contact-info a:hover { color: #07cced !important; }
        
        /* Glass button */
        .glass-button {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.2s ease;
        }
        .glass-button:hover {
          background: rgba(255,255,255,0.25);
          transform: translateY(-1px);
        }
      `}</style>
      
      {/* Contact Bar - Only on Home Page */}
      {showContactBar && (
        <motion.div
          className="contact-bar text-white h-[34px] sm:h-[38px] flex items-center justify-between px-4 sm:px-6"
          initial={{ y: -40, opacity: 0 }}
          animate={{
            y: hideTopBar ? -39 : 0,
            opacity: hideTopBar ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {/* Social */}
          <div className="flex items-center gap-3">
            {[
              { Icon: Facebook, href: 'https://www.facebook.com/profile.php?id=100063576610003' },
              { Icon: Instagram, href: 'https://www.instagram.com/mbs__school/' },
            ].map(({ Icon, href }, i) => (
              <motion.a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button p-1.5 rounded-full hover:text-yellow-300 transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Icon size={15} />
              </motion.a>
            ))}
          </div>
          
          {/* Contact info */}
          <motion.div
            className="flex items-center gap-3 sm:gap-5 contact-info"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="hidden md:flex items-center gap-2">
              <Mail size={13} />
              <a
                href="mailto:contact@mbschool.tn"
                className="hover:text-yellow-300 truncate max-w-[120px] lg:max-w-none transition-colors"
              >
                contact@mbschool.tn
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={13} className="hidden sm:block" />
              <a href="tel:+21627208090" className="hover:text-yellow-300 transition-colors" dir="ltr">
                27 208 090
              </a>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <MapPin size={13} />
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=08+Rue+Zouhair+Essafi,+Hammam+Chatt,+Tunisia"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-300 transition-colors"
                dir="ltr"
              >
                <span className="lg:hidden">Hammam Chatt</span>
                <span className="hidden lg:inline">08 Rue Zouhair Essafi, Hammam Chatt</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Main Header */}
      <motion.header
        className={`fixed inset-x-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'py-2 top-0 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg'
            : showContactBar
            ? 'py-3 top-[34px] sm:top-[38px] header-glass'
            : 'py-3 top-0 header-glass'
        }`}
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo & Desktop Nav */}
            <div className="flex items-center gap-10 lg:gap-16">
              <Link to="/" className="flex-shrink-0" onClick={closeMenu}>
                <img
                  src="https://i.ibb.co/YT8wNFX0/MBS-WHITE-02.png"
                  alt="Logo"
                  className="h-12 sm:h-14 object-contain"
                />
              </Link>
              <nav className="hidden lg:flex items-center gap-8 xl:gap-12">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavLink
                      to={link.path}
                      end={link.path === '/'}
                      className={({ isActive }) =>
                        `nav-link font-semibold text-gray-700 transition-colors duration-200 ${
                          isActive ? 'active text-[#0A2546]' : ''
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-4">
              <motion.div
                className="hidden lg:block"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <a
                  href="https://app.mbschool.tn"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="register-btn inline-flex items-center justify-center px-8 py-3 text-white font-bold hover:shadow-xl transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    منصتنا 
                    <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                  </span>
                </a>
              </motion.div>
              
              <motion.button
                onClick={toggleMenu}
                className="lg:hidden p-2 rounded-lg text-[#0A2546] hover:bg-gray-100 transition-all duration-200"
                aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div animate={{ rotate: isMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.div>
              </motion.button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <AnimatePresence mode="wait">
            {isMenuOpen && (
              <motion.div
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="exit"
                className="mobile-menu lg:hidden border-t border-gray-100/50 mt-3"
              >
                <div className="px-6 py-6 space-y-2">
                  {navLinks.map((link, index) => (
                    <motion.div key={link.path} variants={menuItemVariants} transition={{ delay: index * 0.05 }}>
                      <NavLink
                        to={link.path}
                        end={link.path === '/'}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          `block w-full text-right px-5 py-3 rounded-lg font-semibold transition-all duration-200 ${
                            isActive
                              ? 'bg-[#0A2546] text-white'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-[#0A2546]'
                          }`
                        }
                      >
                        {link.name}
                      </NavLink>
                    </motion.div>
                  ))}
                  <motion.div
                    className="pt-4 border-t border-gray-100"
                    variants={menuItemVariants}
                    transition={{ delay: navLinks.length * 0.05 }}
                  >
                    <a
                      href="https://app.mbschool.tn"
                      onClick={closeMenu}
                      className="register-btn inline-flex items-center justify-center w-full text-white text-center px-6 py-3 font-bold transition-all duration-200"
                    >
                      <span className="flex items-center gap-2">
                        منصتنا
                        <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                      </span>
                    </a>
                  </motion.div>
                  
                  {/* Additional mobile menu items */}
                  <motion.div
                    className="pt-4 border-t border-gray-100"
                    variants={menuItemVariants}
                    transition={{ delay: (navLinks.length + 1) * 0.05 }}
                  >
                    <div className="space-y-3">
                      <Link
                        to="/blog"
                        className="flex items-center gap-3 text-gray-700 hover:text-[#0A2546] transition-colors"
                        onClick={closeMenu}
                      >
                        <FileText size={18} />
                        <span>المدونة</span>
                      </Link>
                      <Link
                        to="/faq"
                        className="flex items-center gap-3 text-gray-700 hover:text-[#0A2546] transition-colors"
                        onClick={closeMenu}
                      >
                        <MessageCircle size={18} />
                        <span>الأسئلة الشائعة</span>
                      </Link>
                      <Link
                        to="/gallery"
                        className="flex items-center gap-3 text-gray-700 hover:text-[#0A2546] transition-colors"
                        onClick={closeMenu}
                      >
                        <Globe size={18} />
                        <span>معرض الصور</span>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
};

export default Header;