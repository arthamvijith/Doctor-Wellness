import logo from '../assets/doctor-wellness-logo.svg';

function Footer() {
  return (
    <footer className="footer section-wrap">
      <div>
        <strong className="footer-brand">
          <img src={logo} alt="Doctor Wellness logo" />
          Doctor Wellness
        </strong>
        <span>© 2026 Doctor Wellness. AI-powered clinical serenity.</span>
      </div>
      <nav aria-label="Footer navigation">
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
        <a href="#cookies">Cookie Policy</a>
        <a href="#support">Support</a>
      </nav>
    </footer>
  );
}

export default Footer;
