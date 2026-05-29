import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import Header from '../components/Header.jsx';
import logo from '../assets/doctor-wellness-logo.svg';

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.46h6.47a5.54 5.54 0 0 1-2.4 3.64v2.98h3.88c2.27-2.09 3.57-5.17 3.57-8.72Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-2.98c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.07A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.31A7.21 7.21 0 0 1 4.89 12c0-.8.14-1.58.38-2.31V6.62H1.26A12 12 0 0 0 0 12c0 1.94.46 3.78 1.26 5.38l4.01-3.07Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.74c1.76 0 3.35.61 4.6 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.26 6.62l4.01 3.07C6.22 6.85 8.87 4.74 12 4.74Z"
      />
    </svg>
  );
}

function SignIn() {
  return (
    <div className="signin-route">
      <Header />
      <main className="signin-page">
        <div className="signin-ambient one" />
        <div className="signin-ambient two" />
        <div className="signin-grid-glow" />

        <motion.section
          className="signin-shell"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <aside className="signin-showcase">
            <a href="/" className="signin-brand" aria-label="Back to home">
              <img src={logo} alt="Oorzaa Wellness logo" />
              <span>Oorzaa Wellness</span>
            </a>

            <div className="showcase-copy">
              <span>Clinical Workspace</span>
              <h1>Sign in to your wellness command center.</h1>
              <p>
                Continue into a calm, secure workspace for patient summaries, assistant workflows,
                and daily practice insight.
              </p>
            </div>
          </aside>

          <section className="signin-card" aria-labelledby="signin-title">
            <div className="signin-card-accent">
              <span />
              <span />
              <span />
            </div>
            <span className="signin-kicker">Secure Access</span>
            <h2 id="signin-title">Welcome back</h2>
            <p>Use your professional email to continue to Doctor Wellness.</p>

            <form className="signin-form">
              <label>
                Email Address
                <span className="signin-input">
                  <Mail size={16} />
                  <input type="email" name="email" placeholder="name@example.com" />
                </span>
              </label>

              <button type="submit">Continue with Email</button>
            </form>

            <div className="signin-divider">
              <span>Or</span>
            </div>

            <button className="google-button" type="button">
              <GoogleIcon />
              Sign in with Google
            </button>

            <p className="signin-register">
              Don&apos;t have an account? <a href="/register">Register</a>
            </p>
          </section>
        </motion.section>
      </main>
    </div>
  );
}

export default SignIn;
