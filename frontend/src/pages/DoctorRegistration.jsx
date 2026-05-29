import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, FileUp, Plus, Trash2 } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const steps = ['Basic Details', 'Professional Details', 'Verification'];
const draftStorageKey = 'doctorRegistrationDraft';
const draftIdStorageKey = 'doctorRegistrationDraftId';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  pincode: '',
  medicalCouncil: '',
  rmpNumber: '',
  specialization: '',
  experience: '',
  highestQualification: '',
  qualificationFiles: [],
  consentAccepted: false
};

const medicalCouncils = [
  'Andhra Pradesh Medical Council',
  'Arunachal Pradesh Medical Council',
  'Assam Medical Council',
  'Bhopal Medical Council',
  'Bihar Medical Council',
  'Bombay Medical Council',
  'Chandigarh Medical Council',
  'Chattisgarh Medical Council',
  'Delhi Medical Council',
  'Goa Medical Council',
  'Gujarat Medical Council',
  'Haryana Medical Council',
  'Himachal Pradesh Medical Council',
  'Hyderabad Medical Council',
  'Jammu & Kashmir Medical Council',
  'Jharkhand Medical Council',
  'Karnataka Medical Council',
  'Madhya Pradesh Medical Council',
  'Madras Medical Council',
  'Mahakoshal Medical Council',
  'Maharashtra Medical Council',
  'Manipur Medical Council',
  'Medical Council of India',
  'Meghalaya Medical Council',
  'Mizoram Medical Council',
  'Mysore Medical Council',
  'Nagaland Medical Council',
  'Orissa Council of Medical Registration',
  'Pondicherry Medical Council',
  'Punjab Medical Council',
  'Rajasthan Medical Council',
  'Sikkim Medical Council',
  'Tamil Nadu Medical Council',
  'Telangana State Medical Council',
  'Travancore Cochin Medical Council, Trivandrum',
  'Tripura State Medical Council',
  'Uttar Pradesh Medical Council',
  'Uttarakhand Medical Council',
  'Vidharba Medical Council',
  'West Bengal Medical Council'
];

const specializations = [
  'General Physician',
  'Family Medicine',
  'Internal Medicine',
  'General Surgery',
  'Obstetrics and Gynaecology',
  'Paediatrics',
  'Orthopaedics',
  'Dermatology, Venereology and Leprosy',
  'Psychiatry',
  'Clinical Psychology',
  'Ophthalmology',
  'Otorhinolaryngology',
  'Anaesthesiology',
  'Emergency Medicine',
  'Respiratory Medicine',
  'Pulmonary Medicine',
  'Radiodiagnosis',
  'Radiation Oncology',
  'Pathology',
  'Microbiology',
  'Biochemistry',
  'Pharmacology',
  'Physiology',
  'Anatomy',
  'Forensic Medicine',
  'Community Medicine',
  'Physical Medicine and Rehabilitation',
  'Geriatric Medicine',
  'Sports Medicine',
  'Hospital Administration',
  'Cardiology',
  'Neurology',
  'Nephrology',
  'Endocrinology',
  'Gastroenterology',
  'Medical Oncology',
  'Clinical Haematology',
  'Critical Care Medicine',
  'Infectious Diseases',
  'Rheumatology',
  'Immunology',
  'Hepatology',
  'Medical Genetics',
  'Neonatology',
  'Cardiothoracic Surgery',
  'Neurosurgery',
  'Urology',
  'Plastic Surgery',
  'Paediatric Surgery',
  'Surgical Oncology',
  'Vascular Surgery',
  'Reproductive Medicine',
  'Dentistry',
  'Ayurveda',
  'Homeopathy',
  'Nutrition and Dietetics'
];

const qualifications = [
  'MBBS',
  'MD',
  'MS',
  'DNB',
  'DM',
  'MCh',
  'BDS',
  'MDS',
  'BAMS',
  'BHMS',
  'BUMS',
  'BSMS',
  'BNYS',
  'Diploma in Medical Specialty',
  'Fellowship',
  'PhD in Medical Sciences',
  'MPH',
  'Other Recognized Medical Qualification'
];

function AccountPrompt() {
  return (
    <p className="registration-account-prompt">
      Already have an account? <a href="/signin">Sign in here</a>
    </p>
  );
}

function DoctorRegistration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    const savedDraft = sessionStorage.getItem(draftStorageKey);

    if (!savedDraft) {
      return initialFormData;
    }

    try {
      return { ...initialFormData, ...JSON.parse(savedDraft) };
    } catch {
      return initialFormData;
    }
  });
  const [draftId, setDraftId] = useState(() => sessionStorage.getItem(draftIdStorageKey) || '');
  const [submitStatus, setSubmitStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    sessionStorage.setItem(draftStorageKey, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (draftId) {
      sessionStorage.setItem(draftIdStorageKey, draftId);
    } else {
      sessionStorage.removeItem(draftIdStorageKey);
    }
  }, [draftId]);

  useEffect(() => {
    let interval = null;
    if (isOtpStep && resendTimer > 0) {
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
  }, [isOtpStep, resendTimer]);

  const updateField = (event) => {
    const { checked, name, type, value } = event.target;
    setSubmitStatus('');
    setFormData((currentData) => ({
      ...currentData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const updateQualificationFile = (event) => {
    const selectedFiles = Array.from(event.target.files || []).map((file) => ({
      name: file.name,
      type: file.type || file.name.split('.').pop()?.toUpperCase() || 'Unknown file type',
      size: file.size
    }));

    setSubmitStatus('');
    setFormData((currentData) => ({
      ...currentData,
      qualificationFiles: [...currentData.qualificationFiles, ...selectedFiles]
    }));
    event.target.value = '';
  };

  const removeQualificationFile = (fileIndex) => {
    setSubmitStatus('');
    setFormData((currentData) => ({
      ...currentData,
      qualificationFiles: currentData.qualificationFiles.filter((_, index) => index !== fileIndex)
    }));
  };

  const goNext = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Saving your progress...');

    try {
      const response = await fetch(`${apiBaseUrl}/api/doctor-registration-drafts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, draftId, step })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.details || result.message || 'Unable to save progress');
      }

      setDraftId(result.id);
      setSubmitStatus('');
      setStep((currentStep) => Math.min(currentStep + 1, steps.length));
    } catch (error) {
      setSubmitStatus(`Could not save progress: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    setSubmitStatus('');
    setStep((currentStep) => Math.max(currentStep - 1, 1));
  };

  const submitRegistration = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Sending OTP to your email...');

    try {
      if (formData.qualificationFiles.length === 0) {
        throw new Error('Please upload at least one qualification document');
      }

      const response = await fetch(`${apiBaseUrl}/api/doctor-registrations/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, draftId })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          response.status === 409
            ? result.message || 'Email already exists'
            : result.details || result.message || 'Unable to send OTP'
        );
      }

      setDraftId(result.id);
      setIsOtpStep(true);
      setOtp('');
      setResendTimer(30);
      setSubmitStatus('');
    } catch (error) {
      setSubmitStatus(`Could not continue: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (isSubmitting || resendTimer > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Resending OTP to your email...');

    try {
      const response = await fetch(`${apiBaseUrl}/api/doctor-registrations/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ draftId, email: formData.email })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.details || result.message || 'Unable to resend OTP');
      }

      setResendTimer(30);
      setSubmitStatus('A new OTP has been sent to your email.');
    } catch (error) {
      setSubmitStatus(`Could not resend OTP: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Verifying OTP...');

    try {
      const response = await fetch(`${apiBaseUrl}/api/doctor-registrations/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ draftId, email: formData.email, otp })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.details || result.message || 'Unable to verify OTP');
      }

      sessionStorage.removeItem(draftStorageKey);
      sessionStorage.removeItem(draftIdStorageKey);
      setDraftId('');
      setOtp('');
      window.location.pathname = '/dashboard';
    } catch (error) {
      setSubmitStatus(`Could not verify OTP: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBackToVerification = () => {
    setSubmitStatus('');
    setIsOtpStep(false);
    setStep(3);
  };

  return (
    <div className="doctor-register-page">
      <Header />
      <main className="doctor-register-main">
        <section className="doctor-register-heading">
          <span>Get Started</span>
          <h1>{isOtpStep ? 'Verify OTP' : 'Doctor Registration'}</h1>
          <p>
            {isOtpStep
              ? `We sent a 6 digit verification code to ${formData.email}.`
              : 'Complete your professional profile in three calm, secure steps.'}
          </p>
        </section>

        {isOtpStep ? (
          <section className="otp-panel" aria-labelledby="otp-title">
            {submitStatus && <p className="registration-status">{submitStatus}</p>}
            <form className="otp-form" onSubmit={verifyOtp}>
              <div className="form-heading">
                <h2 id="otp-title">Verify OTP</h2>
                <p>
                  Enter the 6 digit code sent to <strong>{formData.email}</strong>. This helps us
                  confirm that your registration email belongs to you.
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
                    setSubmitStatus('');
                    setOtp(event.target.value.replace(/\D/g, '').slice(0, 6));
                  }}
                  required
                />
              </label>

              <div className="otp-resend-section">
                {resendTimer > 0 ? (
                  <p className="otp-resend-countdown">
                    Resend OTP in <strong>{resendTimer}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    className="otp-resend-button"
                    onClick={resendOtp}
                    disabled={isSubmitting}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="registration-actions">
                <button className="ghost-action" type="button" onClick={goBackToVerification}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="submit" disabled={isSubmitting || otp.length !== 6}>
                  {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </div>

              <a href="/signin" className="otp-login-link">
                Go to Login
              </a>
            </form>
          </section>
        ) : (
          <section className="registration-panel" aria-labelledby="doctor-registration-title">
          {submitStatus && <p className="registration-status">{submitStatus}</p>}
          <div className="registration-body">
            <div className="registration-progress">
              <strong>
                Step {step} of {steps.length}
              </strong>
              <div className="progress-track" aria-hidden="true">
                <span style={{ width: `${(step / steps.length) * 100}%` }} />
              </div>
              <ol>
                {steps.map((item, index) => (
                  <li className={step >= index + 1 ? 'active' : ''} key={item}>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            {step === 1 && (
              <form className="doctor-registration-form" onSubmit={goNext}>
              <div className="form-heading">
                <h2 id="doctor-registration-title">Basic Details</h2>
                <p>Tell us who you are so we can begin setting up your doctor profile.</p>
              </div>

              <div className="registration-grid">
                <label>
                  Full Name
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Dr. Sarah Smith"
                    value={formData.fullName}
                    onChange={updateField}
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    placeholder="sarah@example.com"
                    value={formData.email}
                    onChange={updateField}
                    required
                  />
                </label>
                <label>
                  Phone Number
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={updateField}
                    required
                  />
                </label>
                <label>
                  Date of Birth
                  <input type="date" name="dob" value={formData.dob} onChange={updateField} required />
                </label>
                <label>
                  Gender
                  <select name="gender" value={formData.gender} onChange={updateField} required>
                    <option value="" disabled>
                      Select gender
                    </option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </label>
                <label>
                  Pincode
                  <input
                    type="text"
                    name="pincode"
                    placeholder="500001"
                    inputMode="numeric"
                    value={formData.pincode}
                    onChange={updateField}
                    required
                  />
                </label>
              </div>

              <div className="registration-actions">
                <a href="/register" className="ghost-action">
                  <ArrowLeft size={16} /> Back
                </a>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Next'} <ArrowRight size={16} />
                </button>
              </div>
              <AccountPrompt />
              </form>
            )}

            {step === 2 && (
              <form className="doctor-registration-form" onSubmit={goNext}>
              <div className="form-heading">
                <h2>Professional Details</h2>
                <p>Add your council registration and practice specialization.</p>
              </div>

              <div className="registration-grid">
                <label>
                  Medical Council Name
                  <input
                    type="text"
                    name="medicalCouncil"
                    list="medical-council-options"
                    placeholder="Search and select council"
                    value={formData.medicalCouncil}
                    onChange={updateField}
                    required
                  />
                </label>
                <label>
                  RMP Number
                  <input
                    type="text"
                    name="rmpNumber"
                    placeholder="Registered Medical Practitioner No."
                    value={formData.rmpNumber}
                    onChange={updateField}
                    required
                  />
                </label>
                <label>
                  Specialization
                  <input
                    type="text"
                    name="specialization"
                    list="specialization-options"
                    placeholder="Search and select specialization"
                    value={formData.specialization}
                    onChange={updateField}
                    required
                  />
                </label>
                <label>
                  Years of Experience
                  <input
                    type="number"
                    name="experience"
                    min="0"
                    max="70"
                    placeholder="8"
                    value={formData.experience}
                    onChange={updateField}
                    required
                  />
                </label>
              </div>

              <datalist id="medical-council-options">
                {medicalCouncils.map((council) => (
                  <option value={council} key={council} />
                ))}
              </datalist>

              <datalist id="specialization-options">
                {specializations.map((specialization) => (
                  <option value={specialization} key={specialization} />
                ))}
              </datalist>

              <div className="registration-actions">
                <button className="ghost-action" type="button" onClick={goBack}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Next'} <ArrowRight size={16} />
                </button>
              </div>
              <AccountPrompt />
              </form>
            )}

            {step === 3 && (
              <form className="doctor-registration-form verification-step" onSubmit={(event) => {
                event.preventDefault();
                submitRegistration();
              }}>
                <div className="form-heading">
                  <h2>Verification</h2>
                  <p>Upload your highest qualification and confirm consent for secure review.</p>
                </div>

                <div className="registration-grid verification-grid">
                  <label>
                    Highest Qualification
                    <select
                      name="highestQualification"
                      value={formData.highestQualification}
                      onChange={updateField}
                      required
                    >
                      <option value="" disabled>
                        Select qualification
                      </option>
                      {qualifications.map((qualification) => (
                        <option value={qualification} key={qualification}>
                          {qualification}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="qualification-upload">
                    Qualification Documents
                    <span className="upload-control">
                      <FileUp size={18} />
                      <span>
                        Upload qualification documents
                        <small>Accepted file types: PDF, JPG, PNG, DOC, DOCX, and other credential files.</small>
                      </span>
                      <input
                        type="file"
                        name="qualificationDocument"
                        multiple
                        onChange={updateQualificationFile}
                      />
                    </span>
                  </label>
                </div>

                {formData.qualificationFiles.length > 0 && (
                  <ul className="uploaded-file-list" aria-label="Uploaded qualification documents">
                    {formData.qualificationFiles.map((file, index) => (
                      <li key={`${file.name}-${file.size}-${index}`}>
                        <div>
                          <strong>{file.name}</strong>
                          <span>
                            {file.type || 'Credential file'} - {Math.max(file.size / 1024, 1).toFixed(0)} KB
                          </span>
                        </div>
                        <button
                          type="button"
                          className="delete-file-button"
                          onClick={() => removeQualificationFile(index)}
                          aria-label={`Remove ${file.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <label className="add-more-files">
                  <Plus size={16} />
                  Add more files
                  <input type="file" name="additionalQualificationDocuments" multiple onChange={updateQualificationFile} />
                </label>

                <label className="consent-card">
                  <input
                    type="checkbox"
                    name="consentAccepted"
                    checked={formData.consentAccepted}
                    onChange={updateField}
                    required
                  />
                  <span>
                    <strong>I agree to the verification terms and conditions.</strong>
                    I confirm that the details and qualification document provided are accurate, and I
                    authorize Doctor Wellness to verify my professional identity, medical council
                    registration, and submitted credentials for onboarding and platform safety.
                  </span>
                </label>

                <div className="registration-actions">
                  <button className="ghost-action" type="button" onClick={goBack}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <div className="registration-submit-wrap">
                    {isSubmitting && submitStatus && (
                      <span className="registration-submit-loader">
                        {submitStatus}
                      </span>
                    )}
                    <button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending...' : 'Complete Registration'}
                    </button>
                  </div>
                </div>
                <AccountPrompt />
              </form>
            )}
          </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default DoctorRegistration;
