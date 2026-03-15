import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // "document.documentElement.scrollTo" is the modern version of "window.scrollTo"
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Optional: adds a smooth scrolling effect
    });
  }, [pathname]); // Re-run this effect whenever the pathname changes

  return null; // This component doesn't render anything visible
}

export default ScrollToTop;
