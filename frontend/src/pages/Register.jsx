import { ArrowRight, BriefcaseMedical, UserRound } from 'lucide-react';
import Header from '../components/Header.jsx';

function Register() {
  return (
    <div className="register-page">
      <Header />
      <main className="register-main">
        <section className="register-hero" aria-labelledby="register-title">
          <h1 id="register-title">Welcome to Oorzaa</h1>
          <p>Empowering health through intelligent serenity.</p>
        </section>

        <section className="register-options" aria-label="Choose account type">
          <a href="/register/doctor" className="register-card doctor">
            <span className="register-icon">
              <BriefcaseMedical size={24} />
            </span>
            <h2>I&apos;m a Doctor</h2>
            <p>
              Streamline your clinical workflow with AI-driven documentation and patient
              longitudinal views designed for the modern practitioner.
            </p>
            <strong>
              Get Started <ArrowRight size={16} />
            </strong>
          </a>

          <a href="#patient-register" className="register-card patient">
            <span className="register-icon">
              <UserRound size={24} />
            </span>
            <h2>I&apos;m a Patient</h2>
            <p>
              Take control of your wellness journey with personalized health insights, digital
              records, and direct connection to your care team.
            </p>
            <strong>
              Get Started <ArrowRight size={16} />
            </strong>
          </a>
        </section>
      </main>
    </div>
  );
}

export default Register;
