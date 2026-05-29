import { motion } from 'framer-motion';
import { Sparkles, UserRoundCheck } from 'lucide-react';
import DashboardMock from '../components/DashboardMock.jsx';

function Hero() {
  return (
    <section id="home" className="hero section-wrap">
      <motion.div
        className="hero-copy"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        <span className="eyebrow">
          <Sparkles size={13} /> AI-Powered Healthcare Platform
        </span>
        <h1>
          Transform Your <span>Medical Practice</span>
        </h1>
        <p>
          Streamline clinical workflows with intelligent assistants that handle the documentation,
          so you can focus on the patient. The future of serenity in medicine is here.
        </p>
        <div className="hero-actions">
          <a href="#start" className="button primary">Get Started</a>
          <a href="#modules" className="button secondary">Explore Modules</a>
        </div>
      </motion.div>
      <motion.div
        className="hero-visual"
        initial={{ opacity: 0, scale: 0.94, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.75, ease: 'easeOut', delay: 0.12 }}
      >
        <DashboardMock />
        <div className="toast-card">
          <UserRoundCheck size={12} />
          <div>
            <strong>Live Analysis</strong>
            <span>Patient record summarized successfully by AI Assistant.</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default Hero;
