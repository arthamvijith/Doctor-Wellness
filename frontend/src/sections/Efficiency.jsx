import { Cloud, KeyRound, Sparkles } from 'lucide-react';

function Efficiency() {
  return (
    <section id="features" className="efficiency section-wrap">
      <div className="split-heading">
        <div>
          <span className="label">Performance Metrics</span>
          <h2>Engineered for Efficiency</h2>
        </div>
        <p>Designed to eliminate administrative friction and restore the physician-patient bond.</p>
      </div>
      <div className="feature-mosaic">
        <article className="large-feature">
          <div className="icon-chip">
            <Sparkles size={17} />
          </div>
          <h3>AI Summarization</h3>
          <p>
            Condense hours of patient consultations into actionable insights within seconds.
            Our proprietary LLM understands nuance and medical context.
          </p>
          <div className="summary-screen">
            <div className="summary-window-top">
              <strong>Summarization</strong>
              <span />
              <span />
            </div>
            <div className="summary-nav">
              {['Communications', 'Audio', 'Emotion data', 'Documents', 'Discharge', 'Generate'].map(
                (item) => (
                  <span key={item}>{item}</span>
                )
              )}
            </div>
            <div className="summary-workspace">
              <aside>
                <i />
                <i />
                <i />
              </aside>
              <section>
                <div className="summary-field long" />
                <div className="summary-field" />
                <p>Discussed ongoing patient care.</p>
                <div className="summary-note" />
                <div className="summary-actions">
                  <button>Preview</button>
                  <button>Generate Summary</button>
                </div>
              </section>
            </div>
          </div>
        </article>
        <article className="mini-feature muted">
          <KeyRound size={22} />
          <h3>Secure OTP/MPIN</h3>
          <p>Banking-grade security for patient data access.</p>
        </article>
        <article className="mini-feature green">
          <h3>Instant AI Consultation Chat</h3>
          <div className="chat-dots">
            <span />
            <span />
            <span />
          </div>
        </article>
        <article className="wide-feature">
          <div>
            <h3>Immutable Storage</h3>
            <p>Your records are encrypted and backed up across resilient nodes.</p>
          </div>
          <Cloud size={24} />
        </article>
      </div>
    </section>
  );
}

export default Efficiency;
