import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

function ScrollTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > 120);
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateVisibility);
    };
  }, []);

  return (
    <a
      className={`scroll-top-button${isVisible ? ' visible' : ''}`}
      href="#top"
      aria-label="Scroll to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
    >
      <ChevronUp size={24} />
    </a>
  );
}

export default ScrollTopButton;
