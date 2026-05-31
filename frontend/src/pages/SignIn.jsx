import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
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
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'mpin'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [mpin, setMpin] = useState('');
  const [showMpin, setShowMpin] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showGoogleSimulator, setShowGoogleSimulator] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

  // Timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((timer) => timer - 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [step, resendTimer]);

  // Load Google Identity Services (GIS) script
  useEffect(() => {
    const existingScript = document.getElementById('google-gsi-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogleGsi();
      document.body.appendChild(script);
    } else if (window.google) {
      initGoogleGsi();
    }
  }, [step]); // Re-bind GSI container if step toggles back to email

  const initGoogleGsi = () => {
    try {
      window.google?.accounts.id.initialize({
        // Standard client ID for out-of-the-box local testing
        client_id: (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim() || '85542718395-fakeclientid.apps.googleusercontent.com',
        callback: handleGoogleLoginResponse
      });

      // Render hidden standard Google button
      const anchor = document.getElementById('google-hidden-btn-container');
      if (anchor) {
        window.google?.accounts.id.renderButton(anchor, { theme: 'outline', size: 'large' });
      }
    } catch (err) {
      console.warn('Google GSI initialization warning:', err);
    }
  };

  const handleGoogleLoginResponse = async (response) => {
    if (!response.credential) return;
    
    setIsSubmitting(true);
    setStatusMsg('Verifying Google credentials...');
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Decode JWT token payload
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const { email, name } = payload;

      if (!email) {
        throw new Error('Google account is missing an email address.');
      }

      const backendResponse = await fetch(`${apiBaseUrl}/api/doctor-login/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), name })
      });

      const result = await backendResponse.json().catch(() => ({}));

      if (backendResponse.status === 404) {
        setErrorMsg('This Google account is not registered with us. Redirecting you to sign up with a fresh email...');
        setTimeout(() => {
          window.location.pathname = '/register/doctor';
        }, 3000);
        return;
      }

      if (!backendResponse.ok) {
        throw new Error(result.message || 'Google verification failed.');
      }

      setSuccessMsg('Session authorized successfully! Welcome back.');
      localStorage.setItem('loggedInDoctor', JSON.stringify(result.doctor));

      setTimeout(() => {
        window.location.pathname = '/dashboard';
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
      setStatusMsg('');
    }
  };

  const handleGoogleClick = () => {
    if (isSubmitting) return;

    const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
    if (!clientId || clientId.includes('fakeclientid') || clientId.includes('placeholder')) {
      setShowGoogleSimulator(true);
      return;
    }

    window.google?.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const hiddenBtn = document.querySelector('#google-hidden-btn-container div[role="button"]');
        if (hiddenBtn) {
          hiddenBtn.click();
        } else {
          setErrorMsg('Google login library is currently initializing. Please try again.');
          initGoogleGsi();
        }
      }
    });
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setIsSubmitting(true);
    setStatusMsg('Checking clinical records...');
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/doctor-login/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: normalizedEmail })
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 404) {
        setErrorMsg('This email is not registered with us. Redirecting you to sign up with a fresh email...');
        setTimeout(() => {
          window.location.pathname = '/register/doctor';
        }, 3000);
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Unable to check email. Please try again.');
      }

      setSuccessMsg('Email registered. OTP sent successfully.');
      setTimeout(() => {
        setSuccessMsg('');
        setStep('otp');
        setOtp('');
        setResendTimer(30);
      }, 800);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
      setStatusMsg('');
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (otp.length !== 6) {
      setErrorMsg('Please enter a 6-digit OTP.');
      return;
    }

    setIsSubmitting(true);
    setStatusMsg('Verifying security code...');
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/doctor-login/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Incorrect OTP or verification failed.');
      }

      setSuccessMsg('Security code verified.');
      setTimeout(() => {
        setSuccessMsg('');
        setStep('mpin');
        setMpin('');
      }, 800);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
      setStatusMsg('');
    }
  };

  const handleMpinSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (mpin.length !== 4) {
      setErrorMsg('MPIN must be exactly 4 digits.');
      return;
    }

    setIsSubmitting(true);
    setStatusMsg('Checking credentials...');
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/doctor-login/verify-mpin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), mpin })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Incorrect MPIN. Please try again.');
      }

      setSuccessMsg('Session authorized successfully! Redirecting...');
      
      // Cache doctor session details so Dashboard can load them dynamically
      localStorage.setItem('loggedInDoctor', JSON.stringify(result.doctor));

      setTimeout(() => {
        window.location.pathname = '/dashboard';
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
      setStatusMsg('');
    }
  };

  const handleResendOtp = async () => {
    if (isSubmitting || resendTimer > 0) return;

    setIsSubmitting(true);
    setStatusMsg('Resending secure code...');
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/doctor-login/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Unable to resend OTP.');
      }

      setResendTimer(30);
      setSuccessMsg('A new security code has been sent to your email.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
      setStatusMsg('');
    }
  };

  // Render standard side-by-side email signin screen
  if (step === 'email') {
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

              {errorMsg && (
                <div className="mpin-alert error" role="alert" style={{ marginBottom: '20px' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mpin-alert success" role="alert" style={{ marginBottom: '20px' }}>
                  <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form className="signin-form" onSubmit={handleEmailSubmit}>
                <label>
                  Email Address
                  <span className="signin-input">
                    <Mail size={16} />
                    <input
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </span>
                </label>

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (statusMsg || 'Checking...') : 'Continue with Email'}
                </button>
              </form>

              <div className="signin-divider">
                <span>Or</span>
              </div>

              <button
                className="google-button"
                type="button"
                onClick={handleGoogleClick}
                disabled={isSubmitting}
              >
                <GoogleIcon />
                Sign in with Google
              </button>

              <div id="google-hidden-btn-container" style={{ display: 'none' }} />

              <p className="signin-register">
                Don&apos;t have an account? <a href="/register">Register</a>
              </p>
            </section>
          </motion.section>
        </main>

        {showGoogleSimulator && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(15, 23, 25, 0.45)',
            backdropFilter: 'blur(8px)',
            padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                width: '100%',
                maxWidth: '420px',
                background: '#fff',
                borderRadius: '24px',
                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.16)',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.06)'
              }}
            >
              {/* Modal header */}
              <div style={{ padding: '34px 34px 20px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
                  <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GoogleIcon />
                  </div>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1f2d32', margin: '0 0 8px' }}>
                  Sign in with Google
                </h2>
                <p style={{ fontSize: '14px', color: '#6b777c', margin: 0 }}>
                  Choose a clinical account to continue to Doctor Wellness
                </p>
              </div>

              {/* Account List */}
              <div style={{ padding: '0 24px 20px' }}>
                {/* Option 1: Registered doctor vijith */}
                <div
                  onClick={() => {
                    const mockPayload = { email: 'vijithartham@gmail.com', name: 'vijith' };
                    const encodedPayload = btoa(JSON.stringify(mockPayload));
                    const mockCredential = `header.${encodedPayload}.signature`;
                    setShowGoogleSimulator(false);
                    handleGoogleLoginResponse({ credential: mockCredential });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    background: '#f8fafb',
                    border: '1px solid #e1e8eb',
                    transition: 'background 180ms ease, border-color 180ms ease',
                    marginBottom: '12px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f3f5';
                    e.currentTarget.style.borderColor = '#d1d8dc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafb';
                    e.currentTarget.style.borderColor = '#e1e8eb';
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: '800',
                    fontSize: '15px'
                  }}>
                    V
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#1f2d32' }}>vijith</strong>
                    <span style={{ fontSize: '13px', color: '#6b777c' }}>vijithartham@gmail.com</span>
                  </div>
                </div>

                {/* Input for testing other accounts */}
                <div style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: '#fff',
                  border: '1px solid #e1e8eb'
                }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#7b858a', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                    Test Another Google Email
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      placeholder="doctor@example.com"
                      id="simulator-custom-email"
                      style={{
                        flex: 1,
                        height: '40px',
                        padding: '0 12px',
                        border: '1px solid #c9d4da',
                        borderRadius: '8px',
                        fontSize: '13px',
                        outline: 0
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const emailInput = e.currentTarget.value;
                          if (emailInput.trim()) {
                            const mockPayload = { email: emailInput.trim().toLowerCase(), name: 'Doctor' };
                            const encodedPayload = btoa(JSON.stringify(mockPayload));
                            const mockCredential = `header.${encodedPayload}.signature`;
                            setShowGoogleSimulator(false);
                            handleGoogleLoginResponse({ credential: mockCredential });
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const emailInput = document.getElementById('simulator-custom-email')?.value;
                        if (emailInput && emailInput.trim()) {
                          const mockPayload = { email: emailInput.trim().toLowerCase(), name: 'Doctor' };
                          const encodedPayload = btoa(JSON.stringify(mockPayload));
                          const mockCredential = `header.${encodedPayload}.signature`;
                          setShowGoogleSimulator(false);
                          handleGoogleLoginResponse({ credential: mockCredential });
                        }
                      }}
                      style={{
                        height: '40px',
                        padding: '0 16px',
                        background: 'var(--primary)',
                        color: '#fff',
                        border: 0,
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Use
                    </button>
                  </div>
                </div>
              </div>

              {/* Cancel footer */}
              <div style={{
                padding: '16px 24px 24px',
                borderTop: '1px solid #f0f3f5',
                display: 'flex',
                justifyContent: 'flex-end',
                background: '#f8fafb'
              }}>
                <span
                  role="button"
                  onClick={() => setShowGoogleSimulator(false)}
                  style={{
                    fontSize: '13px',
                    fontWeight: '800',
                    color: '#6b777c',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    userSelect: 'none'
                  }}
                >
                  Cancel
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // Render full-page OTP template from yesterday's registration flow
  if (step === 'otp') {
    return (
      <div className="doctor-register-page">
        <Header />
        <main className="doctor-register-main">
          <section className="doctor-register-heading">
            <span>Get Started</span>
            <h1>Verify OTP</h1>
            <p>We sent a 6 digit verification code to {email}.</p>
          </section>

          <section className="otp-panel" aria-labelledby="otp-title" style={{ marginTop: '52px' }}>
            {errorMsg && (
              <div className="mpin-alert error" role="alert" style={{ marginBottom: '22px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mpin-alert success" role="alert" style={{ marginBottom: '22px' }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{successMsg}</span>
              </div>
            )}

            <form className="otp-form" onSubmit={handleOtpSubmit}>
              <div className="form-heading">
                <h2 id="otp-title">Verify OTP</h2>
                <p>
                  Enter the 6 digit code sent to <strong>{email}</strong>. This helps us confirm that your professional email belongs to you.
                </p>
              </div>

              <label>
                6 Digit OTP
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength="6"
                  placeholder="000000"
                  value={otp}
                  onChange={(event) => {
                    setErrorMsg('');
                    setOtp(event.target.value.replace(/\D/g, '').slice(0, 6));
                  }}
                  required
                  style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 'bold' }}
                />
              </label>

              <div className="otp-resend-section">
                {resendTimer > 0 ? (
                  <p className="otp-resend-countdown" style={{ margin: 0 }}>
                    Resend OTP in <strong>{resendTimer}s</strong>
                  </p>
                ) : (
                  <span
                    role="button"
                    className="otp-resend-button"
                    onClick={handleResendOtp}
                    style={{ cursor: 'pointer', fontWeight: 'bold', color: 'var(--primary)', userSelect: 'none' }}
                  >
                    Resend OTP
                  </span>
                )}
              </div>

              <div className="registration-actions">
                <span
                  role="button"
                  className="ghost-action"
                  onClick={() => {
                    setStep('email');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}
                >
                  <ArrowLeft size={16} /> Back
                </span>
                <button type="submit" disabled={isSubmitting || otp.length !== 6}>
                  {isSubmitting ? (statusMsg || 'Verifying...') : 'Verify & Continue'}
                </button>
              </div>

              <span
                role="button"
                className="otp-login-link"
                onClick={() => {
                  setStep('email');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                style={{ cursor: 'pointer', display: 'block', textAlign: 'center', marginTop: '16px', userSelect: 'none' }}
              >
                Go to Login
              </span>
            </form>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Render full-page MPIN template from yesterday's SetupMpin flow
  if (step === 'mpin') {
    return (
      <div className="doctor-register-page">
        <Header />
        <main className="doctor-register-main">
          <section className="doctor-register-heading">
            <span className="eyebrow-accent">
              <ShieldCheck size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Security Clearance
            </span>
            <h1>ENTER MPIN</h1>
            <p>Provide your 4-digit security PIN for session initialization.</p>
          </section>

          <section className="otp-panel" aria-labelledby="mpin-title" style={{ marginTop: '52px' }}>
            {errorMsg && (
              <div className="mpin-alert error" role="alert" style={{ marginBottom: '22px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mpin-alert success" role="alert" style={{ marginBottom: '22px' }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{successMsg}</span>
              </div>
            )}

            <form className="otp-form mpin-setup-form" onSubmit={handleMpinSubmit} id="mpin-setup-form">
              <div className="form-heading">
                <h2 id="mpin-title" className="mpin-card-heading">Security Verification</h2>
                <p>
                  Enter your 4-digit clinical login PIN for <strong>{email}</strong>.
                </p>
              </div>

              <div className="mpin-input-grid" style={{ gridTemplateColumns: '1fr', justifyItems: 'center' }}>
                <label className="mpin-input-wrapper" style={{ width: '100%', maxWidth: '320px', margin: 0 }}>
                  Enter MPIN
                  <div className="mpin-field-container">
                    <input
                      id="mpin-input-field"
                      type={showMpin ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      maxLength="4"
                      placeholder="••••"
                      value={mpin}
                      onChange={(e) => {
                        setErrorMsg('');
                        setMpin(e.target.value.replace(/\D/g, '').slice(0, 4));
                      }}
                      required
                      autoComplete="current-password"
                    />
                    <span className="field-prefix"><Lock size={16} /></span>
                    <span
                      role="button"
                      className="mpin-toggle-btn"
                      onClick={() => setShowMpin(!showMpin)}
                      aria-label={showMpin ? 'Hide MPIN' : 'Show MPIN'}
                      style={{ userSelect: 'none' }}
                    >
                      {showMpin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                  </div>
                </label>
              </div>

              <div className="registration-actions mpin-actions" style={{ marginTop: '34px' }}>
                <span
                  role="button"
                  className="ghost-action"
                  onClick={() => {
                    setStep('otp');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}
                >
                  <ArrowLeft size={16} /> Back
                </span>
                <button
                  id="mpin-continue-button"
                  type="submit"
                  disabled={isSubmitting || mpin.length !== 4}
                  className="mpin-submit-button"
                  style={{ height: '52px' }}
                >
                  {isSubmitting ? (statusMsg || 'Checking...') : 'Verify & Login'}
                  <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </button>
              </div>
            </form>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return null;
}

export default SignIn;
