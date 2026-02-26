import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AdminPage from '../pages/AdminPage';

const SecureAdminRoute = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const checkAdminAuth = () => {
      const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      setIsAdminAuthenticated(isAdminLoggedIn);
      setIsLoading(false);
    };

    checkAdminAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAdminAuthenticated ? <AdminPage /> : <Navigate to="/" replace />;
};

export default SecureAdminRoute;