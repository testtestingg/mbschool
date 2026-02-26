// Create a new file: src/hooks/useScrollRestoration.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollRestoration = () => {
  const location = useLocation();

  useEffect(() => {
    // Only scroll to top if it's a new navigation (not back/forward)
    if (window.history.state === null) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return null;
};

export default useScrollRestoration;