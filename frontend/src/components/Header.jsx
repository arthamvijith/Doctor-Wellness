import { useEffect, useState } from 'react';
import logo from '../assets/doctor-wellness-logo.svg';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => {
      setIsScrolled(window.scrollY > 12);
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateHeader);
    };
  }, []);

  return (
    <header id="top" className={`navbar${isScrolled ? ' glass' : ''}`}>
      <a href="/#home" className="brand">
        <img src={logo} alt="Doctor Wellness logo" />
        <span>Doctor Wellness</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="/#home">Home</a>
        <a href="/#modules">Modules</a>
        <a href="/#features">Features</a>
        <a href="/#contact">Contact</a>
      </nav>
      <div className="nav-actions">
        <a href="/signin" className="nav-signin">Sign In</a>
        <a href="/#start" className="nav-cta">Get Started</a>
      </div>
    </header>
  );
}

export default Header;
