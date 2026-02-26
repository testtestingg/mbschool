import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <motion.button
      className="theme-toggle"
      onClick={() => setIsDark(!isDark)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        background: isDark ? '#FF914D' : '#16213e',
        color: '#fff',
        padding: '10px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </motion.button>
  );
};

export default ThemeToggle;