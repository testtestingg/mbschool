// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md p-8"
      >
        <div className="w-24 h-24 bg-[#03CCED]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-12 h-12 text-[#03CCED]" />
        </div>
        <h1 className="text-4xl font-bold text-[#0E2138] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[#0E2138] mb-4">الصفحة غير موجودة</h2>
        <p className="text-[#3D506D] mb-8">
          عذراً، الصفحة التي تبحث عنها غير متوفرة. يرجى التحقق من الرابط أو العودة إلى الصفحة الرئيسية.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#03CCED] to-[#0390CC] text-white rounded-xl font-medium hover:from-[#0390CC] hover:to-[#03CCED] transition-all duration-300"
        >
          <Home className="w-5 h-5 ml-2" />
          العودة إلى الصفحة الرئيسية
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;