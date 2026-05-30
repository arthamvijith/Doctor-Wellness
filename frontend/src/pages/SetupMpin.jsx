import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

function SetupMpin() {
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [showMpin, setShowMpin] = useState(false);
  const [showConfirmMpin, setShowConfirmMpin] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [doctorId, setDoctorId] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');

  // Retrieve cached registration data from verification step
  useEffect(() => {
    document.title = 'Set MPIN | Doctor Wellness';
    
    // SEO description update dynamically
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Configure your secure clinical workspace 2-step verification MPIN.');
    }

    const cachedId = sessionStorage.getItem('verifiedDoctorId');
    const cachedEmail = sessionStorage.getItem('verifiedDoctorEmail');
    
    if (cachedId) setDoctorId(cachedId);
    if (cachedEmail) setDoctorEmail(cachedEmail);
  }, []);

  const handleMpinChange = (val) => {
    setErrorMsg('');
    setMpin(val.replace(/\D/g, '').slice(0, 4));
  };

  const handleConfirmMpinChange = (val) => {
    setErrorMsg('');
    setConfirmMpin(val.replace(/\D/g, '').slice(0, 4));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (mpin.length !== 4) {
      setErrorMsg('MPIN must be exactly 4 digits.');
      return;
    }

    if (mpin !== confirmMpin) {
      setErrorMsg('MPINs do not match. Please verify.');
      return;
    }

    if (!doctorId || !doctorEmail) {
      setErrorMsg('Registration session has expired. Please register again.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/doctor-registrations/setup-mpin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: doctorId,
          email: doctorEmail,
          mpin
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Failed to establish MPIN. Please try again.');
      }

      setSuccessMsg('MPIN configured successfully! Redirecting you...');
      
      // Clear verification cache
      sessionStorage.removeItem('verifiedDoctorId');
      sessionStorage.removeItem('verifiedDoctorEmail');

      setTimeout(() => {
        window.location.pathname = '/dashboard';
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if session data is missing, prompt user to go register
  const isSessionValid = doctorId && doctorEmail;

  return (
    <div className="doctor-register-page">
      <Header />
      <main className="doctor-register-main">
        <section className="doctor-register-heading">
          <span className="eyebrow-accent">
            <ShieldCheck size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Step 4: Security Setup
          </span>
          <h1>SET MPIN</h1>
          <p>
            {isSessionValid
              ? `Establish a personal 4-digit security PIN for two-step verification and fast login.`
              : 'Secure access gateway initialization.'}
          </p>
        </section>

        <section className="otp-panel" aria-labelledby="mpin-title">
          {!isSessionValid ? (
            <div className="mpin-session-error">
              <AlertCircle size={44} className="session-error-icon" />
              <h2 id="mpin-title">Session Expired</h2>
              <p>
                We could not locate a verified registration draft. Please complete doctor registration first to establish your secure credentials.
              </p>
              <a href="/register/doctor" className="button primary mpin-redirect-button">
                Start Registration
              </a>
            </div>
          ) : (
            <form className="otp-form mpin-setup-form" onSubmit={handleSubmit} id="mpin-setup-form">
              <div className="form-heading">
                <h2 id="mpin-title" className="mpin-card-heading">Set up your PIN</h2>
                <p>
                  Use this 4-digit code for your future logins for <strong>{doctorEmail}</strong>.
                </p>
              </div>

              {errorMsg && (
                <div className="mpin-alert error" role="alert">
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mpin-alert success" role="alert">
                  <CheckCircle2 size={18} />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="mpin-input-grid">
                <label className="mpin-input-wrapper">
                  Set MPIN
                  <div className="mpin-field-container">
                    <span className="field-prefix"><Lock size={16} /></span>
                    <input
                      id="mpin-input-field"
                      type={showMpin ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      maxLength="4"
                      placeholder="••••"
                      value={mpin}
                      onChange={(e) => handleMpinChange(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="mpin-toggle-btn"
                      onClick={() => setShowMpin(!showMpin)}
                      aria-label={showMpin ? 'Hide Set MPIN' : 'Show Set MPIN'}
                    >
                      {showMpin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <label className="mpin-input-wrapper">
                  Confirm MPIN
                  <div className="mpin-field-container">
                    <span className="field-prefix"><Lock size={16} /></span>
                    <input
                      id="confirm-mpin-input-field"
                      type={showConfirmMpin ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      maxLength="4"
                      placeholder="••••"
                      value={confirmMpin}
                      onChange={(e) => handleConfirmMpinChange(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="mpin-toggle-btn"
                      onClick={() => setShowConfirmMpin(!showConfirmMpin)}
                      aria-label={showConfirmMpin ? 'Hide Confirm MPIN' : 'Show Confirm MPIN'}
                    >
                      {showConfirmMpin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              </div>

              {mpin.length === 4 && confirmMpin.length === 4 && (
                <div className="mpin-match-badge-wrap">
                  {mpin === confirmMpin ? (
                    <div className="mpin-match-badge match">
                      <CheckCircle2 size={15} /> MPINs Match
                    </div>
                  ) : (
                    <div className="mpin-match-badge mismatch">
                      <AlertCircle size={15} /> MPINs Do Not Match
                    </div>
                  )}
                </div>
              )}

              <div className="registration-actions mpin-actions">
                <button
                  id="mpin-continue-button"
                  type="submit"
                  disabled={isSubmitting || mpin.length !== 4 || confirmMpin.length !== 4 || mpin !== confirmMpin}
                  className="mpin-submit-button"
                >
                  {isSubmitting ? 'Configuring Secure Access...' : 'Configure & Continue'}
                  <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default SetupMpin;
