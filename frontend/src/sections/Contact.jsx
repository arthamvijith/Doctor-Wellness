import { Mail, Phone, Share2, Globe2, Network } from 'lucide-react';

function Contact() {
  return (
    <section id="contact" className="contact-shell">
      <div className="contact section-wrap">
        <div className="contact-heading">
          <h2>Connect with the Sanctuary</h2>
          <p>
            Whether you&apos;re a clinician looking to transform your practice or an institution
            seeking enterprise solutions, our team is here to guide you.
          </p>
        </div>

        <div className="contact-layout">
          <form className="contact-form">
            <div className="form-row">
              <label>
                Name
                <input type="text" name="name" placeholder="Dr. Sarah Smith" />
              </label>
              <label>
                Professional Email
                <input type="email" name="email" placeholder="sarah.smith@institution.org" />
              </label>
            </div>
            <label>
              Institution / Practice Name
              <input type="text" name="institution" placeholder="City General Hospital" />
            </label>
            <label>
              Message
              <textarea name="message" placeholder="How can we help you transform your workflow?" />
            </label>
            <button type="submit">Send Message</button>
          </form>

          <aside className="contact-aside" aria-label="Contact details">
            <div className="contact-methods">
              <article>
                <span>
                  <Mail size={17} />
                </span>
                <div>
                  <strong>Email Us</strong>
                  <a href="mailto:support@oorzaa.wellness">support@oorzaa.wellness</a>
                </div>
              </article>
              <article>
                <span>
                  <Phone size={17} />
                </span>
                <div>
                  <strong>Call Us</strong>
                  <a href="tel:+15550000000">+1 (555) 000-0000</a>
                </div>
              </article>
            </div>

            <div className="social-block">
              <strong>Follow Our Journey</strong>
              <div className="social-links">
                <a href="#share" aria-label="Share">
                  <Share2 size={14} />
                </a>
                <a href="#global" aria-label="Global community">
                  <Globe2 size={14} />
                </a>
                <a href="#network" aria-label="Professional network">
                  <Network size={14} />
                </a>
              </div>
            </div>

            <blockquote>
              <p>
                "The team at Oorzaa helped our clinic reduce burnout by 40% in just three months of
                implementation."
              </p>
              <cite>Medical Director, Wellness Center</cite>
            </blockquote>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Contact;
