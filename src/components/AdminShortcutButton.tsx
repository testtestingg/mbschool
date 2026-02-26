// src/components/AdminShortcutButton.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
 
const AdminShortcutButton = () => {
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();
 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Shift+A
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowButton(true);
        
        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
          setShowButton(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleAdminClick = () => {
    navigate('/secure-admin-dashboard-2024');
    setShowButton(false);
  };

  if (!showButton) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
      style={{ direction: 'ltr' }}
    >
      <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg text-sm mb-1 animate-fadeIn">
        Accès Administration
      </div>
      <button
        onClick={handleAdminClick}
        className="bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center animate-fadeIn"
      >
        <Settings className="w-5 h-5 mr-2" />
        Admin
      </button>
    </div>
  );
};

export default AdminShortcutButton;
