// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import LearningChallenge from './pages/learning-challenge';
import Registration from './pages/Registration';
import CalendarPage from './pages/CalendarPage';
import TeacherPage from './pages/TeacherPage';
import RegistrationPage from './pages/RegistrationPage';
import AdminPage from './pages/AdminPage';
import RecruitmentPage from './pages/RecruitmentPage'; // Add this import
import MathParallax from './components/MathParallax';
import ScrollToTop from './ScrollToTop';
import NotFound from './pages/NotFound';
import { Analytics } from "@vercel/analytics/react";
import AdminShortcutButton from './components/AdminShortcutButton';
import SecureAdminRoute from './components/SecureAdminRoute';

function App() {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      setHeaderHeight(header.offsetHeight);
    }
    
    const handleResize = () => {
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen relative">
        
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-indigo-50" style={{ zIndex: 0 }} />
        <MathParallax />
        <div className="flex flex-col min-h-screen relative" style={{ zIndex: 2 }}>
          <Header />
          <main className="flex-grow" style={{ paddingTop: `${headerHeight}px` }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/services" element={<Services />} />
              <Route path="/خدماتنا" element={<Services />} />
              <Route path="/learning-challenge" element={<LearningChallenge />} />
              {/* Registration Routes */}
              <Route path="/register" element={<Registration />} />
              <Route path="/registration" element={<Navigate to="/register" replace />} />
              
              {/* Calendar Page - handles its own authentication */}
              <Route path="/calendar" element={<CalendarPage />} />
              
              {/* Admin Page - Changed to a more secure URL */}
              <Route path="/secure-admin-dashboard-2024" element={<AdminPage />} />
              <Route path="/teacher" element={<TeacherPage />} />
              
              {/* Recruitment Page */}
              <Route path="/recrutement" element={<RecruitmentPage />} />
 
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
        
        {/* Admin Shortcut Button - This will appear on all pages */}
        <AdminShortcutButton />
        
        {/* Vercel Web Analytics - tracks all page views automatically */}
        <Analytics />
      </div>
    </Router>
  );
}

export default App;