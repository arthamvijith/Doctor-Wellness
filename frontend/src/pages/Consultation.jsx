import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  File,
  FileText,
  Activity,
  Image as ImageIcon,
  Trash2,
  Upload,
  User,
  Heart,
  Calendar,
  Clock,
  CheckCircle2,
  Check,
  Sparkles,
  Timer,
  BookOpen,
  Plus,
  Trash,
  PenTool,
  Printer,
  AlertTriangle
} from 'lucide-react';
import logo from '../assets/doctor-wellness-logo.svg';

function Consultation() {
  const [patientId, setPatientId] = useState('');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Step wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Patient Intake States (Step 1)
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [chiefComplaintDuration, setChiefComplaintDuration] = useState('');

  // Health Locker form state (Step 1)
  const [fileType, setFileType] = useState('X-ray');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [activePreviewFile, setActivePreviewFile] = useState(null);

  // Step 2 AI States
  const [suggestions, setSuggestions] = useState([]);
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
  const [generatingSoap, setGeneratingSoap] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [activeSummaryTab, setActiveSummaryTab] = useState('findings');
  const [soapInputs, setSoapInputs] = useState({ subjective: '', objective: '', assessment: '', plan: '' });

  // Step 3 Clinical Exam States
  const [pastHistory, setPastHistory] = useState('');
  const [personalHistory, setPersonalHistory] = useState({
    diet: 'Mixed',
    activity: 'Moderate',
    alcohol: false,
    smoking: false,
    drugs: false
  });
  const [vitals, setVitals] = useState({
    bp: '',
    pulse: '',
    rr: '',
    temp: '',
    spo2: ''
  });
  const [physicalExamination, setPhysicalExamination] = useState({
    general: {
      nad: true,
      pallor: false,
      icterus: false,
      edema: false,
      cyanosis: false
    },
    cvs: '',
    rs: '',
    cns: '',
    pa: ''
  });
  const [investigationsAdvised, setInvestigationsAdvised] = useState({
    tests: [],
    notes: ''
  });
  const [currentTestInput, setCurrentTestInput] = useState('');

  // Step 4 Prescription Details States
  const [facility, setFacility] = useState({
    clinicName: '',
    department: 'General Medicine',
    address: '',
    city: ''
  });
  const [doctor, setDoctor] = useState({
    name: '',
    qualification: '',
    registrationNumber: '',
    address: '',
    mobile: ''
  });
  const [patientContact, setPatientContact] = useState({
    mobile: '',
    address: ''
  });
  const [visitType, setVisitType] = useState('OPD');
  const [presentIllness, setPresentIllness] = useState({
    onset: 'Acute',
    progression: 'Improving',
    symptoms: ''
  });
  const [medications, setMedications] = useState([]);
  const [advice, setAdvice] = useState('');
  const [followUpDays, setFollowUpDays] = useState(7);
  const [signatureData, setSignatureData] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Canvas drawing ref
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('patientId');
    if (id) {
      setPatientId(id);
      fetchPatient(id);
    } else {
      setError('No patient specified. Please return to the dashboard.');
      setLoading(false);
    }
  }, []);

  const fetchPatient = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/patients/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPatient(data);

        // Pre-populate input states
        setChiefComplaint(data.chiefComplaint || '');
        setChiefComplaintDuration(data.chiefComplaintDuration || '');
        setPastHistory(data.pastHistory || '');
        setPersonalHistory(data.personalHistory || { diet: 'Mixed', activity: 'Moderate', alcohol: false, smoking: false, drugs: false });
        setVitals(data.vitals || { bp: '', pulse: '', rr: '', temp: '', spo2: '' });
        setPhysicalExamination(data.physicalExamination || { general: { nad: true, pallor: false, icterus: false, edema: false, cyanosis: false }, cvs: '', rs: '', cns: '', pa: '' });
        setInvestigationsAdvised(data.investigationsAdvised || { tests: [], notes: '' });

        if (data.soapNote) {
          setSoapInputs(data.soapNote);
        }

        if (data.prescriptionDetails) {
          setFacility(data.prescriptionDetails.facility || { clinicName: '', department: 'General Medicine', address: '', city: '' });
          setDoctor(data.prescriptionDetails.doctor || { name: '', qualification: '', registrationNumber: '', address: '', mobile: '' });
          setPatientContact(data.prescriptionDetails.patientContact || { mobile: '', address: '' });
          setVisitType(data.prescriptionDetails.visitType || 'OPD');
          setPresentIllness(data.prescriptionDetails.presentIllness || { onset: 'Acute', progression: 'Improving', symptoms: '' });
          setMedications(data.prescriptionDetails.medications || []);
          setAdvice(data.prescriptionDetails.advice || '');
          setFollowUpDays(data.prescriptionDetails.followUpDays || 7);
          setSignatureData(data.prescriptionDetails.signatureData || '');
        } else {
          fetchPrefillDetails(id);
        }
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to retrieve patient details.');
      }
    } catch (err) {
      console.error('Error fetching patient:', err);
      setError('Server connection failed. Could not fetch patient details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrefillDetails = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/patients/${id}/prefill`);
      if (res.ok) {
        const prefill = await res.json();
        if (prefill.facility) {
          setFacility(prev => ({ ...prev, ...prefill.facility }));
        }
        if (prefill.doctor) {
          setDoctor(prev => ({ ...prev, ...prefill.doctor }));
        }
      }
    } catch (err) {
      console.error('Failed to load pre-fill doctor variables:', err);
    }
  };

  const saveClinicalProgress = async (nextStep = null) => {
    const updatedDetails = {
      chiefComplaint,
      chiefComplaintDuration,
      pastHistory,
      personalHistory,
      vitals,
      physicalExamination,
      investigationsAdvised,
      prescriptionDetails: {
        facility,
        doctor,
        patientContact,
        visitType,
        presentIllness,
        medications,
        advice,
        followUpDays,
        signatureData
      }
    };

    try {
      const res = await fetch(`http://localhost:5000/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDetails)
      });
      if (res.ok) {
        const data = await res.json();
        setPatient(data);
        if (nextStep !== null) {
          setCurrentStep(nextStep);
        }
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  // Health Locker Functions (Step 1)
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError('');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        try {
          const base64Data = reader.result;

          const newFile = {
            name: selectedFile.name,
            fileType: fileType,
            data: base64Data,
            uploadedAt: new Date()
          };

          const updatedFiles = [...(patient.files || []), newFile];

          const res = await fetch(`http://localhost:5000/api/patients/${patientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files: updatedFiles })
          });

          if (res.ok) {
            const updatedPatient = await res.json();
            setPatient(updatedPatient);
            setSelectedFile(null);
            const fileInput = document.getElementById('locker-file-input');
            if (fileInput) fileInput.value = '';
          } else {
            setUploadError('Failed to save file to Health Locker.');
          }
        } catch (err) {
          setUploadError('Transmission error occurred during upload.');
        } finally {
          setUploading(false);
        }
      };
    } catch (err) {
      setUploadError('An unexpected error occurred during upload.');
      setUploading(false);
    }
  };

  const handleFileDelete = async (fileIndex) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const updatedFiles = patient.files.filter((_, idx) => idx !== fileIndex);

      const res = await fetch(`http://localhost:5000/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: updatedFiles })
      });

      if (res.ok) {
        const updatedPatient = await res.json();
        setPatient(updatedPatient);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  // Step 2 AI Functions
  const fetchSuggestions = async () => {
    if (!chiefComplaint) return alert('Please enter a chief complaint in Step 1 first.');
    setFetchingSuggestions(true);
    try {
      const res = await fetch(`http://localhost:5000/api/patients/${patientId}/generate-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chiefComplaint })
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions);
        handlePatientUpdate({ selectedSuggestions: [] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingSuggestions(false);
    }
  };

  const triggerSoapGeneration = async () => {
    setGeneratingSoap(true);
    const filesText = (patient.files || []).map(f => `${f.fileType} (${f.name}): ${f.summary || ''}`).join('\n');
    try {
      const res = await fetch(`http://localhost:5000/api/patients/${patientId}/generate-soap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chiefComplaint,
          severity: patient.severity || 'Mild',
          selectedSuggestions: patient.selectedSuggestions || [],
          filesText
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSoapInputs(data.soapNote);
        handlePatientUpdate({ soapNote: data.soapNote });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingSoap(false);
    }
  };

  const triggerSummaryGeneration = async () => {
    setGeneratingSummary(true);
    const filesText = (patient.files || []).map(f => `${f.fileType} (${f.name}): ${f.summary || ''}`).join('\n');
    try {
      const res = await fetch(`http://localhost:5000/api/patients/${patientId}/generate-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chiefComplaint,
          reason: patient.reason,
          filesText
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPatient(prev => ({
          ...prev,
          aiCaseSummary: data.aiCaseSummary,
          efficiencySnapshot: data.efficiencySnapshot
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handlePatientUpdate = async (fields) => {
    setPatient(prev => ({ ...prev, ...fields }));
    try {
      await fetch(`http://localhost:5000/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSoapInput = (field, val) => {
    setSoapInputs(prev => {
      const updated = { ...prev, [field]: val };
      handlePatientUpdate({ soapNote: updated });
      return updated;
    });
  };

  // Step 3 Helpers
  const addInvestigationTest = () => {
    if (!currentTestInput.trim()) return;
    setInvestigationsAdvised(prev => {
      const updated = { ...prev, tests: [...prev.tests, currentTestInput.trim()] };
      return updated;
    });
    setCurrentTestInput('');
  };

  const removeInvestigationTest = (idx) => {
    setInvestigationsAdvised(prev => {
      const updated = { ...prev, tests: prev.tests.filter((_, i) => i !== idx) };
      return updated;
    });
  };

  // Step 4 Helpers
  const addMedication = () => {
    setMedications(prev => [...prev, { name: '', dosage: '500 mg', frequency: 'Times a day', duration: '5 days', notes: 'Take after food' }]);
  };

  const updateMedication = (idx, field, val) => {
    setMedications(prev => prev.map((m, i) => i === idx ? { ...m, [field]: val } : m));
  };

  const removeMedication = (idx) => {
    setMedications(prev => prev.filter((_, i) => i !== idx));
  };

  // Pointer canvas events
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#07100d';

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData('');
  };

  const handleCompleteConsultation = async () => {
    try {
      // Save current status and medications
      const finalDetails = {
        status: 'Completed',
        chiefComplaint,
        chiefComplaintDuration,
        pastHistory,
        personalHistory,
        vitals,
        physicalExamination,
        investigationsAdvised,
        prescriptionDetails: {
          facility,
          doctor,
          patientContact,
          visitType,
          presentIllness,
          medications,
          advice,
          followUpDays,
          signatureData
        }
      };

      const res = await fetch(`http://localhost:5000/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalDetails)
      });

      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        alert('Failed to complete consultation.');
      }
    } catch (err) {
      console.error(err);
      alert('Error finalizing clinical consultation.');
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'X-ray':
        return <ImageIcon size={20} className="file-icon-img" />;
      case 'Lab Report':
        return <Activity size={20} className="file-icon-lab" />;
      case 'Prescription':
        return <Clipboard size={20} className="file-icon-rx" />;
      case 'Discharge Summary':
        return <FileText size={20} className="file-icon-summary" />;
      default:
        return <File size={20} className="file-icon-other" />;
    }
  };

  if (loading) {
    return (
      <div className="consult-loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading clinical consultation session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="consult-error-screen">
        <h2>Session Error</h2>
        <p>{error}</p>
        <button onClick={() => (window.location.href = '/dashboard')} className="btn-back">
          <ArrowLeft size={16} /> Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="consult-root">
      {/* Wizard Header Bar */}
      <header className="consult-header">
        <div className="header-brand">
          <img src={logo} alt="Doctor Wellness" />
          <span>Oorzaa Clinical • Consultation Hub</span>
        </div>
        <button onClick={() => {
          if (window.confirm('Are you sure you want to exit? Your progress in this session will not be saved.')) {
            window.location.href = '/dashboard';
          }
        }} className="btn-exit">
          Cancel Consultation
        </button>
      </header>

      {/* Main Layout Area */}
      <main className="consult-layout-container">
        {/* Wizard Side Stepper */}
        <aside className="consult-stepper-sidebar">
          <div className="patient-quick-card">
            <div className="quick-avatar">{patient.name[0]}</div>
            <div>
              <h3>{patient.name}</h3>
              <span>{patient.gender}, {patient.age} yrs</span>
            </div>
          </div>

          <div className="stepper-progress-track">
            <div
              className="stepper-progress-bar-fill"
              style={{ height: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            ></div>
            {[1, 2, 3, 4].map((step) => (
              <button
                key={step}
                className={`stepper-node ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                onClick={() => saveClinicalProgress(step)}
                disabled={currentStep < step}
              >
                <div className="node-icon-circle">
                  {currentStep > step ? <Check size={12} strokeWidth={3} /> : step}
                </div>
                <div className="node-label">
                  <strong>Step {step}</strong>
                  <span>
                    {step === 1 && 'Intake & Records'}
                    {step === 2 && 'AI Clinical Insights'}
                    {step === 3 && 'Exams & Diagnostics'}
                    {step === 4 && 'Prescription Output'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Content Wizard Body */}
        <section className="consult-wizard-panel">
          <header className="wizard-step-header">
            <div>
              <h2>Step {currentStep}: {
                currentStep === 1 ? 'Patient Intake & Health Locker' :
                  currentStep === 2 ? 'AI Clinical Intelligence' :
                    currentStep === 3 ? 'Exams, Vitals & Investigations' :
                      'Prescription Builder'
              }</h2>
              <p className="step-desc">
                {currentStep === 1 && 'Record complaints and upload patient medical records to the Health Locker.'}
                {currentStep === 2 && 'Review AI-extracted files, clinical CDS suggestions, SOAP notes, and literature guidelines.'}
                {currentStep === 3 && 'Analyze lab results, record vitals, personal/past history, physical exams, and tests.'}
                {currentStep === 4 && 'Compile medical prescription, outline treatment, draw doctor signature, and generate Rx.'}
              </p>
            </div>
            <div className="badge-step-indicator">
              Step {currentStep} of {totalSteps}
            </div>
          </header>

          {/* STEP 1: INTAKE & RECORDS */}
          {currentStep === 1 && (
            <div className="step-content animate-fade-in">
              <div className="consult-grid-split">
                
                {/* Left Card: Patient Info & Intake details */}
                <div className="info-card-left-wrapper">
                  <div className="info-card-left">
                    <h3 className="section-title">Patient Profile Card</h3>
                    <div className="info-data-list">
                      <div className="info-item">
                        <User className="info-icon" size={16} />
                        <div>
                          <label>Full Name</label>
                          <strong>{patient.name}</strong>
                        </div>
                      </div>
                      <div className="info-item">
                        <Heart className="info-icon" size={16} />
                        <div>
                          <label>Age & Gender</label>
                          <strong>{patient.age} years old • {patient.gender}</strong>
                        </div>
                      </div>
                      <div className="info-item">
                        <Calendar className="info-icon" size={16} />
                        <div>
                          <label>Visit Reason (Dashboard)</label>
                          <strong>{patient.reason}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="info-card-left input-form-card">
                    <h3 className="section-title">Clinical Intake</h3>
                    <div className="intake-form-group">
                      <label htmlFor="intake-complaint">Chief Complaint / Problem</label>
                      <input
                        id="intake-complaint"
                        type="text"
                        placeholder="e.g. Sharp dry cough, chest tightness"
                        value={chiefComplaint}
                        onChange={(e) => setChiefComplaint(e.target.value)}
                      />
                    </div>
                    <div className="intake-form-group">
                      <label htmlFor="intake-duration">Duration of Symptoms</label>
                      <input
                        id="intake-duration"
                        type="text"
                        placeholder="e.g. 3 days, 2 weeks"
                        value={chiefComplaintDuration}
                        onChange={(e) => setChiefComplaintDuration(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Card: Health Locker */}
                <div className="health-locker-card">
                  <div className="locker-header-bar">
                    <h3 className="section-title">Health Locker</h3>
                    <span className="locker-counter">{(patient.files || []).length} items stored</span>
                  </div>

                  <form onSubmit={handleFileUpload} className="locker-upload-form">
                    <div className="form-group-locker">
                      <label htmlFor="locker-type-select">Document Category</label>
                      <select
                        id="locker-type-select"
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value)}
                      >
                        <option value="X-ray">X-ray file</option>
                        <option value="Lab Report">Lab Report</option>
                        <option value="Prescription">Prescription</option>
                        <option value="Discharge Summary">Discharge Summary</option>
                        <option value="Other">Others</option>
                      </select>
                    </div>

                    <div className="form-group-locker upload-zone-group">
                      <label>Upload File</label>
                      <div className="drag-upload-dropzone">
                        <Upload size={24} className="upload-cloud-icon" />
                        <input
                          id="locker-file-input"
                          type="file"
                          onChange={handleFileChange}
                          disabled={uploading}
                        />
                        <span>{selectedFile ? selectedFile.name : 'Choose a file or drag it here'}</span>
                        <small>Supports PNG, JPG, PDF, TXT (Max 5MB)</small>
                      </div>
                    </div>

                    {uploadError && <div className="locker-error">{uploadError}</div>}

                    <button
                      type="submit"
                      className="btn-upload-file"
                      disabled={uploading || !selectedFile}
                    >
                      {uploading ? 'Uploading File...' : 'Upload File'}
                    </button>
                  </form>

                  <div className="locker-files-list">
                    <h4>Stored Digital Artifacts</h4>
                    {(patient.files || []).length > 0 ? (
                      <div className="files-scroll-wrap">
                        {patient.files.map((file, idx) => (
                          <div key={idx} className="stored-file-row">
                            <div className="file-details-left">
                              <span className="icon-badge-box">
                                {getFileIcon(file.fileType)}
                              </span>
                              <div className="name-meta">
                                <strong>{file.name}</strong>
                                <span>{file.fileType} • {new Date(file.uploadedAt).toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="file-actions-right">
                              {file.data && (
                                <a
                                  href={file.data}
                                  download={file.name}
                                  className="btn-download-file-action"
                                  title="Download file"
                                >
                                  Download
                                </a>
                              )}
                              <button
                                type="button"
                                className="btn-delete-file-action"
                                onClick={() => handleFileDelete(idx)}
                                title="Delete file"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="locker-empty-state">
                        <File size={36} />
                        <p>No documents uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: AI CLINICAL INTELLIGENCE */}
          {currentStep === 2 && (
            <div className="step-content animate-fade-in">
              <div className="ai-layout-stack">
                
                {/* Top Section: Suggestions, Severity, & Snapshot */}
                <div className="ai-top-row-grid">
                  
                  {/* CDS Suggestions Card */}
                  <div className="ai-widget-card suggestions-widget">
                    <div className="ai-widget-header">
                      <h3>Clinical Decision Support</h3>
                      <button
                        onClick={fetchSuggestions}
                        disabled={fetchingSuggestions}
                        className="btn-sparkle-mini"
                      >
                        <Sparkles size={14} /> {fetchingSuggestions ? 'Fetching...' : 'Suggest'}
                      </button>
                    </div>

                    <div className="suggestions-list-box">
                      {suggestions.length > 0 ? (
                        suggestions.map((sug, idx) => {
                          const isChecked = (patient.selectedSuggestions || []).includes(sug);
                          return (
                            <label key={idx} className={`suggestion-check-item ${isChecked ? 'selected' : ''}`}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const list = patient.selectedSuggestions || [];
                                  const updated = e.target.checked
                                    ? [...list, sug]
                                    : list.filter(item => item !== sug);
                                  handlePatientUpdate({ selectedSuggestions: updated });
                                }}
                              />
                              <span>{sug}</span>
                            </label>
                          );
                        })
                      ) : (
                        <p className="no-sug-message">
                          {chiefComplaint
                            ? 'Click "Suggest" to analyze complaint and load decision guidelines.'
                            : 'Enter chief complaint in Step 1 to trigger suggestions.'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Disease Severity Selector */}
                  <div className="ai-widget-card severity-widget">
                    <div className="ai-widget-header">
                      <h3>Disease Severity</h3>
                    </div>
                    <div className="severity-options-grid">
                      {['Mild', 'Moderate', 'Severe'].map((sev) => {
                        const isSelected = (patient.severity || 'Mild') === sev;
                        return (
                          <button
                            key={sev}
                            className={`severity-btn ${sev.toLowerCase()} ${isSelected ? 'active' : ''}`}
                            onClick={() => handlePatientUpdate({ severity: sev })}
                          >
                            <AlertTriangle size={16} />
                            <strong>{sev}</strong>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Efficiency Snapshot Card */}
                  {patient.efficiencySnapshot && patient.efficiencySnapshot.responseTimeMs > 0 && (
                    <div className="ai-widget-card snapshot-widget animate-fade-in">
                      <div className="ai-widget-header">
                        <h3>AI Efficiency Snapshot</h3>
                      </div>
                      <div className="snapshot-data-list">
                        <div className="snapshot-item">
                          <Timer size={18} className="snap-icon" />
                          <div>
                            <label>Response Latency</label>
                            <strong>{patient.efficiencySnapshot.responseTimeMs} ms</strong>
                          </div>
                        </div>
                        <div className="snapshot-item">
                          <BookOpen size={18} className="snap-icon" />
                          <div>
                            <label>Reference Materials Evaluated</label>
                            <strong>{patient.efficiencySnapshot.papersReviewedCount} publications & guidelines</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Middle Section: Extracted file summaries & SOAP Note */}
                <div className="ai-mid-row-grid">
                  
                  {/* Extracted Records Scrollbox */}
                  <div className="ai-widget-card records-text-card">
                    <div className="ai-widget-header">
                      <h3>Extracted Medical Text Context</h3>
                    </div>
                    <div className="extracted-text-scroller">
                      {(patient.files || []).length > 0 ? (
                        patient.files.map((file, idx) => (
                          <div key={idx} className="file-summary-badge" style={{ marginBottom: '8px' }}>
                            <strong>{file.fileType} ({file.name}):</strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                              {file.summary || 'Clinical reviews pending analysis in Step 1.'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="no-sug-message">No uploaded documents context found in Health Locker.</p>
                      )}
                    </div>
                  </div>

                  {/* SOAP Note Card */}
                  <div className="ai-widget-card soap-editor-card">
                    <div className="ai-widget-header">
                      <h3>Clinical SOAP Notes</h3>
                      <button
                        onClick={triggerSoapGeneration}
                        disabled={generatingSoap}
                        className="btn-sparkle-mini"
                      >
                        <Sparkles size={14} /> {generatingSoap ? 'Compiling SOAP...' : 'Compile SOAP'}
                      </button>
                    </div>

                    <div className="soap-inputs-grid">
                      <div className="soap-field">
                        <label>S (Subjective)</label>
                        <textarea
                          placeholder="Symptoms, history, timelines..."
                          value={soapInputs.subjective}
                          onChange={(e) => handleSoapInput('subjective', e.target.value)}
                        />
                      </div>
                      <div className="soap-field">
                        <label>O (Objective)</label>
                        <textarea
                          placeholder="Vitals, exams, physical markers..."
                          value={soapInputs.objective}
                          onChange={(e) => handleSoapInput('objective', e.target.value)}
                        />
                      </div>
                      <div className="soap-field">
                        <label>A (Assessment)</label>
                        <textarea
                          placeholder="Diagnoses, justifications..."
                          value={soapInputs.assessment}
                          onChange={(e) => handleSoapInput('assessment', e.target.value)}
                        />
                      </div>
                      <div className="soap-field">
                        <label>P (Plan)</label>
                        <textarea
                          placeholder="Prescriptions, advice, labs..."
                          value={soapInputs.plan}
                          onChange={(e) => handleSoapInput('plan', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="soap-action-footer">
                      <label className="toggle-soap-history">
                        <input
                          type="checkbox"
                          checked={patient.soapAddedToHistory || false}
                          onChange={(e) => handlePatientUpdate({ soapAddedToHistory: e.target.checked })}
                        />
                        <span>Add generated SOAP note to patient medical history records</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: AI Case Summary Tabs */}
                <div className="ai-summary-card">
                  <div className="ai-summary-header">
                    <span>✨ Clinical Case Analysis</span>
                    <div className="ai-summary-header-actions">
                      <button
                        onClick={triggerSummaryGeneration}
                        disabled={generatingSummary}
                        className="btn-sparkle-mini"
                      >
                        <Sparkles size={14} /> {generatingSummary ? 'Synthesizing...' : 'Synthesize Insights'}
                      </button>
                      <span className="ai-badge">Gemini 2.5 Flash</span>
                    </div>
                  </div>

                  {patient.aiCaseSummary && patient.aiCaseSummary.doctorSummary ? (
                    <div className="summary-tabs-wrapper animate-fade-in">
                      <div className="summary-tabs-bar">
                        <button
                          className={`tab-btn ${activeSummaryTab === 'findings' ? 'active' : ''}`}
                          onClick={() => setActiveSummaryTab('findings')}
                        >
                          Key Findings
                        </button>
                        <button
                          className={`tab-btn ${activeSummaryTab === 'causes' ? 'active' : ''}`}
                          onClick={() => setActiveSummaryTab('causes')}
                        >
                          Potential Causes
                        </button>
                        <button
                          className={`tab-btn ${activeSummaryTab === 'summary' ? 'active' : ''}`}
                          onClick={() => setActiveSummaryTab('summary')}
                        >
                          Executive Summary
                        </button>
                        <button
                          className={`tab-btn ${activeSummaryTab === 'references' ? 'active' : ''}`}
                          onClick={() => setActiveSummaryTab('references')}
                        >
                          Literature References
                        </button>
                      </div>

                      <div className="summary-tab-content">
                        {activeSummaryTab === 'findings' && (
                          <ul className="bullet-findings">
                            {(patient.aiCaseSummary.keyFindings || []).map((kf, i) => (
                              <li key={i}>{kf}</li>
                            ))}
                          </ul>
                        )}

                        {activeSummaryTab === 'causes' && (
                          <ul className="bullet-findings">
                            {(patient.aiCaseSummary.possibleCauses || []).map((pc, i) => (
                              <li key={i}>{pc}</li>
                            ))}
                          </ul>
                        )}

                        {activeSummaryTab === 'summary' && (
                          <div className="text-summary-box">
                            <textarea
                              value={patient.aiCaseSummary.doctorSummary}
                              onChange={(e) => {
                                const updated = { ...patient.aiCaseSummary, doctorSummary: e.target.value };
                                handlePatientUpdate({ aiCaseSummary: updated });
                              }}
                            />
                            <small className="field-hint">You can modify or refine the generated executive summary directly.</small>
                          </div>
                        )}

                        {activeSummaryTab === 'references' && (
                          <ul className="bullet-references">
                            {(patient.aiCaseSummary.mediaReferences || []).map((refText, i) => (
                              <li key={i}>{refText}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="ai-summary-card pending">
                      <div className="ai-summary-body" style={{ textAlign: 'center', padding: '24px 0' }}>
                        <p className="no-summary-msg">
                          No case summary generated. Click <strong>"Synthesize Insights"</strong> to evaluate the complaints and records.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: EXAMS, VITALS & INVESTIGATIONS */}
          {currentStep === 3 && (
            <div className="step-content animate-fade-in">
              <div className="consult-grid-split">
                
                {/* Left Column: Labs, Social and Past History */}
                <div className="info-card-left-wrapper">
                  
                  {/* Lab Reports Filter */}
                  <div className="info-card-left">
                    <h3 className="section-title">Review Lab Reports</h3>
                    <div className="lab-reports-scrollbox">
                      {(patient.files || []).filter(f => f.fileType === 'Lab Report').length > 0 ? (
                        (patient.files || [])
                          .filter(f => f.fileType === 'Lab Report')
                          .map((file, idx) => (
                            <div
                              key={idx}
                              className="stored-file-row audit-row"
                              onClick={() => setActivePreviewFile(file)}
                              style={{ cursor: 'pointer', marginBottom: '8px' }}
                            >
                              <div className="file-details-left">
                                <span className="icon-badge-box">
                                  {getFileIcon(file.fileType)}
                                </span>
                                <div className="name-meta">
                                  <strong>{file.name}</strong>
                                  <span>Uploaded at {new Date(file.uploadedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="no-labs-message">No lab report documents uploaded in the Health Locker (Step 1).</p>
                      )}
                    </div>
                  </div>

                  {/* Past History */}
                  <div className="info-card-left input-form-card">
                    <h3 className="section-title">Past Medical History</h3>
                    <textarea
                      placeholder="e.g. Type 2 Diabetes, Bronchial Asthma, No past major surgeries"
                      value={pastHistory}
                      onChange={(e) => setPastHistory(e.target.value)}
                      style={{ minHeight: '80px' }}
                    />
                  </div>

                  {/* Personal and Social History */}
                  <div className="info-card-left input-form-card">
                    <h3 className="section-title">Personal & Social History</h3>
                    
                    <div className="history-form-grid">
                      <div className="radio-group">
                        <label>Diet Type</label>
                        <div className="radio-options">
                          {['Veg', 'Non-Veg', 'Mixed'].map(d => (
                            <label key={d}>
                              <input
                                type="radio"
                                name="diet-type"
                                checked={personalHistory.diet === d}
                                onChange={() => setPersonalHistory(prev => ({ ...prev, diet: d }))}
                              />
                              <span>{d}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="radio-group">
                        <label>Activity Level</label>
                        <div className="radio-options">
                          {['Sedentary', 'Moderate', 'Active'].map(a => (
                            <label key={a}>
                              <input
                                type="radio"
                                name="activity-level"
                                checked={personalHistory.activity === a}
                                onChange={() => setPersonalHistory(prev => ({ ...prev, activity: a }))}
                              />
                              <span>{a}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="lifestyle-checkboxes-bar">
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={personalHistory.alcohol}
                          onChange={(e) => setPersonalHistory(prev => ({ ...prev, alcohol: e.target.checked }))}
                        />
                        <span>Alcohol Consumption</span>
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={personalHistory.smoking}
                          onChange={(e) => setPersonalHistory(prev => ({ ...prev, smoking: e.target.checked }))}
                        />
                        <span>Tobacco Smoking</span>
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={personalHistory.drugs}
                          onChange={(e) => setPersonalHistory(prev => ({ ...prev, drugs: e.target.checked }))}
                        />
                        <span>Recreational Drugs</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column: Vitals, Physical Exam & Investigations */}
                <div className="health-locker-card">
                  <h3 className="section-title">Patient Vitals Record</h3>
                  
                  <div className="vitals-inputs-grid">
                    <div className="vital-input-box">
                      <label htmlFor="vital-bp">BP (mmHg)</label>
                      <input
                        id="vital-bp"
                        type="text"
                        placeholder="120/80"
                        value={vitals.bp}
                        onChange={(e) => setVitals(prev => ({ ...prev, bp: e.target.value }))}
                      />
                      <span className="vital-range-badge">Normal: &lt;120/80</span>
                    </div>
                    <div className="vital-input-box">
                      <label htmlFor="vital-pulse">Pulse (bpm)</label>
                      <input
                        id="vital-pulse"
                        type="text"
                        placeholder="72"
                        value={vitals.pulse}
                        onChange={(e) => setVitals(prev => ({ ...prev, pulse: e.target.value }))}
                      />
                      <span className="vital-range-badge">Normal: 60-100</span>
                    </div>
                    <div className="vital-input-box">
                      <label htmlFor="vital-rr">RR (/min)</label>
                      <input
                        id="vital-rr"
                        type="text"
                        placeholder="16"
                        value={vitals.rr}
                        onChange={(e) => setVitals(prev => ({ ...prev, rr: e.target.value }))}
                      />
                      <span className="vital-range-badge">Normal: 12-20</span>
                    </div>
                    <div className="vital-input-box">
                      <label htmlFor="vital-temp">Temp (°F)</label>
                      <input
                        id="vital-temp"
                        type="text"
                        placeholder="98.6"
                        value={vitals.temp}
                        onChange={(e) => setVitals(prev => ({ ...prev, temp: e.target.value }))}
                      />
                      <span className="vital-range-badge">Normal: 97-99</span>
                    </div>
                    <div className="vital-input-box">
                      <label htmlFor="vital-spo2">SpO2 (%)</label>
                      <input
                        id="vital-spo2"
                        type="text"
                        placeholder="98"
                        value={vitals.spo2}
                        onChange={(e) => setVitals(prev => ({ ...prev, spo2: e.target.value }))}
                      />
                      <span className="vital-range-badge">Normal: 95-100</span>
                    </div>
                  </div>

                  <h3 className="section-title" style={{ marginTop: '20px' }}>Physical & Systemic Examinations</h3>
                  
                  <div className="exam-inputs-wrapper">
                    <div className="general-exam-checks">
                      <label>General Indicators</label>
                      <div className="checkboxes-row">
                        <label>
                          <input
                            type="checkbox"
                            checked={physicalExamination.general.nad}
                            onChange={(e) => setPhysicalExamination(prev => ({
                              ...prev,
                              general: { ...prev.general, nad: e.target.checked }
                            }))}
                          />
                          <span>NAD</span>
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={physicalExamination.general.pallor}
                            onChange={(e) => setPhysicalExamination(prev => ({
                              ...prev,
                              general: { ...prev.general, pallor: e.target.checked }
                            }))}
                          />
                          <span>Pallor</span>
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={physicalExamination.general.icterus}
                            onChange={(e) => setPhysicalExamination(prev => ({
                              ...prev,
                              general: { ...prev.general, icterus: e.target.checked }
                            }))}
                          />
                          <span>Icterus</span>
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={physicalExamination.general.edema}
                            onChange={(e) => setPhysicalExamination(prev => ({
                              ...prev,
                              general: { ...prev.general, edema: e.target.checked }
                            }))}
                          />
                          <span>Edema</span>
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={physicalExamination.general.cyanosis}
                            onChange={(e) => setPhysicalExamination(prev => ({
                              ...prev,
                              general: { ...prev.general, cyanosis: e.target.checked }
                            }))}
                          />
                          <span>Cyanosis</span>
                        </label>
                      </div>
                    </div>

                    <div className="systemic-exams-inputs">
                      <div className="exam-text-box">
                        <label>CVS</label>
                        <input
                          type="text"
                          placeholder="S1 S2 heard, no murmurs"
                          value={physicalExamination.cvs}
                          onChange={(e) => setPhysicalExamination(prev => ({ ...prev, cvs: e.target.value }))}
                        />
                      </div>
                      <div className="exam-text-box">
                        <label>RS</label>
                        <input
                          type="text"
                          placeholder="Clear chest, normal breath sounds"
                          value={physicalExamination.rs}
                          onChange={(e) => setPhysicalExamination(prev => ({ ...prev, rs: e.target.value }))}
                        />
                      </div>
                      <div className="exam-text-box">
                        <label>CNS</label>
                        <input
                          type="text"
                          placeholder="Conscious, oriented, no focal deficits"
                          value={physicalExamination.cns}
                          onChange={(e) => setPhysicalExamination(prev => ({ ...prev, cns: e.target.value }))}
                        />
                      </div>
                      <div className="exam-text-box">
                        <label>P/A (Per Abdomen)</label>
                        <input
                          type="text"
                          placeholder="Soft, non-tender, no organomegaly"
                          value={physicalExamination.pa}
                          onChange={(e) => setPhysicalExamination(prev => ({ ...prev, pa: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="section-title" style={{ marginTop: '20px' }}>Investigations Advised</h3>
                  
                  <div className="investigations-editor-section">
                    <div className="add-test-bar">
                      <input
                        type="text"
                        placeholder="e.g. CBC, Epigastric Ultrasound"
                        value={currentTestInput}
                        onChange={(e) => setCurrentTestInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') addInvestigationTest(); }}
                      />
                      <button type="button" onClick={addInvestigationTest} className="btn-add-test">
                        <Plus size={16} /> Add Test
                      </button>
                    </div>

                    <div className="tests-tags-display">
                      {(investigationsAdvised.tests || []).length > 0 ? (
                        (investigationsAdvised.tests || []).map((t, idx) => (
                          <span key={idx} className="test-tag">
                            {t}
                            <button type="button" onClick={() => removeInvestigationTest(idx)}>&times;</button>
                          </span>
                        ))
                      ) : (
                        <p className="no-tests-adv">No clinical investigations added yet.</p>
                      )}
                    </div>

                    <div className="investigations-notes-box" style={{ marginTop: '12px' }}>
                      <label htmlFor="investigation-notes">Laboratory Notes / Guidelines</label>
                      <input
                        id="investigation-notes"
                        type="text"
                        placeholder="e.g. Undergo fasting tests tomorrow morning"
                        value={investigationsAdvised.notes}
                        onChange={(e) => setInvestigationsAdvised(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PRESCRIPTION BUILDER */}
          {currentStep === 4 && (
            <div className="step-content animate-fade-in">
              <div className="rx-full-wizard-grid">
                
                {/* Doctor Details & Patient contact */}
                <div className="rx-form-section-card">
                  <h3 className="section-title">Facility & Doctor Profile</h3>
                  
                  <div className="facility-doctor-form-grid">
                    <div className="input-field-box">
                      <label>Healthcare Facility Name</label>
                      <input
                        type="text"
                        value={facility.clinicName}
                        onChange={(e) => setFacility(prev => ({ ...prev, clinicName: e.target.value }))}
                      />
                    </div>
                    <div className="input-field-box">
                      <label>Department</label>
                      <input
                        type="text"
                        value={facility.department}
                        onChange={(e) => setFacility(prev => ({ ...prev, department: e.target.value }))}
                      />
                    </div>
                    <div className="input-field-box">
                      <label>Address</label>
                      <input
                        type="text"
                        placeholder="Clinic Street Address"
                        value={facility.address}
                        onChange={(e) => setFacility(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div className="input-field-box">
                      <label>City</label>
                      <input
                        type="text"
                        placeholder="City"
                        value={facility.city}
                        onChange={(e) => setFacility(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>

                    <div className="input-field-box">
                      <label>Doctor Name</label>
                      <input
                        type="text"
                        value={doctor.name}
                        onChange={(e) => setDoctor(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="input-field-box">
                      <label>Qualifications</label>
                      <input
                        type="text"
                        value={doctor.qualification}
                        onChange={(e) => setDoctor(prev => ({ ...prev, qualification: e.target.value }))}
                      />
                    </div>
                    <div className="input-field-box">
                      <label>RMP Registration Number</label>
                      <input
                        type="text"
                        value={doctor.registrationNumber}
                        onChange={(e) => setDoctor(prev => ({ ...prev, registrationNumber: e.target.value }))}
                      />
                    </div>
                    <div className="input-field-box">
                      <label>Doctor Mobile / Phone</label>
                      <input
                        type="text"
                        value={doctor.mobile}
                        onChange={(e) => setDoctor(prev => ({ ...prev, mobile: e.target.value }))}
                      />
                    </div>
                  </div>

                  <h3 className="section-title" style={{ marginTop: '20px' }}>Patient Contact & Visit details</h3>
                  <div className="facility-doctor-form-grid">
                    <div className="input-field-box">
                      <label>Patient Contact Mobile</label>
                      <input
                        type="text"
                        placeholder="Mobile Number"
                        value={patientContact.mobile}
                        onChange={(e) => setPatientContact(prev => ({ ...prev, mobile: e.target.value }))}
                      />
                    </div>
                    <div className="input-field-box">
                      <label>Patient Address</label>
                      <input
                        type="text"
                        placeholder="Home Address"
                        value={patientContact.address}
                        onChange={(e) => setPatientContact(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div className="input-field-box">
                      <label>Visit Type</label>
                      <select value={visitType} onChange={(e) => setVisitType(e.target.value)}>
                        <option value="OPD">OPD</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Telecommunication">Telecommunication</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Clinical Present Illness details */}
                <div className="rx-form-section-card">
                  <h3 className="section-title">History of Present Illness</h3>
                  
                  <div className="illness-details-grid">
                    <div className="input-field-box">
                      <label>Illness Onset</label>
                      <select
                        value={presentIllness.onset}
                        onChange={(e) => setPresentIllness(prev => ({ ...prev, onset: e.target.value }))}
                      >
                        <option value="Acute">Acute</option>
                        <option value="Subacute">Subacute</option>
                        <option value="Chronic">Chronic</option>
                      </select>
                    </div>

                    <div className="input-field-box">
                      <label>Progression</label>
                      <select
                        value={presentIllness.progression}
                        onChange={(e) => setPresentIllness(prev => ({ ...prev, progression: e.target.value }))}
                      >
                        <option value="Improving">Improving</option>
                        <option value="Worsening">Worsening</option>
                        <option value="Static">Static</option>
                      </select>
                    </div>

                    <div className="input-field-box full-width-field">
                      <label>Associated Clinical Symptoms</label>
                      <textarea
                        placeholder="Inquire and list key symptoms..."
                        value={presentIllness.symptoms}
                        onChange={(e) => setPresentIllness(prev => ({ ...prev, symptoms: e.target.value }))}
                        style={{ minHeight: '60px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Treatment/Medications builder table */}
                <div className="rx-form-section-card full-width-card">
                  <div className="locker-header-bar">
                    <h3 className="section-title">Medication details</h3>
                    <button type="button" onClick={addMedication} className="btn-add-med">
                      <Plus size={16} /> Add Medication
                    </button>
                  </div>

                  <div className="meds-table-scroller">
                    <table className="meds-build-table">
                      <thead>
                        <tr>
                          <th>Medication Name</th>
                          <th>Times a Day (Frequency)</th>
                          <th>Dosage (mg)</th>
                          <th>Duration</th>
                          <th>Notes / Instructions</th>
                          <th style={{ width: '50px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {medications.length > 0 ? (
                          medications.map((med, idx) => (
                            <tr key={idx}>
                              <td>
                                <input
                                  type="text"
                                  placeholder="e.g. Paracetamol"
                                  value={med.name}
                                  onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  placeholder="Once a day, QD, BID..."
                                  value={med.frequency}
                                  onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  placeholder="650 mg"
                                  value={med.dosage}
                                  onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  placeholder="5 days"
                                  value={med.duration}
                                  onChange={(e) => updateMedication(idx, 'duration', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  placeholder="After food, SOS..."
                                  value={med.notes}
                                  onChange={(e) => updateMedication(idx, 'notes', e.target.value)}
                                />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => removeMedication(idx)}
                                  className="btn-delete-med-row"
                                >
                                  <Trash size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="no-meds-td">
                              No medications added to prescription sheet yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Advice & Counselling, Follow up, Signature pad */}
                <div className="rx-form-section-card">
                  <h3 className="section-title">Advice, Counselling & Follow-up</h3>
                  
                  <div className="advice-followup-box">
                    <div className="input-field-box">
                      <label htmlFor="rx-advice">Advice and Counseling</label>
                      <textarea
                        id="rx-advice"
                        placeholder="Dietary modifications, lifestyle habits, warning signs..."
                        value={advice}
                        onChange={(e) => setAdvice(e.target.value)}
                        style={{ minHeight: '80px' }}
                      />
                    </div>

                    <div className="input-field-box" style={{ marginTop: '12px' }}>
                      <label htmlFor="rx-followup">Follow-up Review After (Days)</label>
                      <select
                        id="rx-followup"
                        value={followUpDays}
                        onChange={(e) => setFollowUpDays(Number(e.target.value))}
                      >
                        <option value="1">1 day</option>
                        <option value="2">2 days</option>
                        <option value="3">3 days</option>
                        <option value="5">5 days</option>
                        <option value="7">7 days</option>
                        <option value="10">10 days</option>
                        <option value="14">14 days</option>
                        <option value="30">30 days</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Signature canvas */}
                <div className="rx-form-section-card">
                  <h3 className="section-title">Doctor Authentication</h3>
                  <p className="field-hint" style={{ marginBottom: '8px' }}>Draw your authentication signature below:</p>
                  
                  <div className="signature-pad-container">
                    <canvas
                      ref={canvasRef}
                      width={380}
                      height={160}
                      onPointerDown={startDrawing}
                      onPointerMove={draw}
                      onPointerUp={stopDrawing}
                      onPointerLeave={stopDrawing}
                      style={{ touchAction: 'none' }}
                    />
                    <div className="sig-buttons-row">
                      <button type="button" onClick={clearSignature} className="btn-clear-sig">
                        Clear Pad
                      </button>
                      {signatureData && <span className="sig-saved-label"><Check size={12} /> Saved</span>}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Wizard Footer Controls */}
          <footer className="wizard-action-footer">
            <button
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1);
                } else {
                  if (window.confirm('Exit session? Any changes in this step will be kept.')) {
                    window.location.href = '/dashboard';
                  }
                }
              }}
              className="btn-wizard-nav secondary"
            >
              <ChevronLeft size={18} /> {currentStep === 1 ? 'Back to Dashboard' : 'Previous Step'}
            </button>

            <div className="wizard-footer-right">
              {currentStep === 4 && (
                <button
                  onClick={() => {
                    saveClinicalProgress();
                    setShowPdfModal(true);
                  }}
                  className="btn-wizard-nav secondary"
                  style={{ marginRight: '12px' }}
                >
                  <Printer size={18} /> Print Rx Preview
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  onClick={() => saveClinicalProgress(currentStep + 1)}
                  className="btn-wizard-nav primary"
                >
                  Next Step <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleCompleteConsultation}
                  className="btn-wizard-nav success"
                >
                  Complete Session & Print <CheckCircle2 size={18} />
                </button>
              )}
            </div>
          </footer>
        </section>
      </main>

      {/* Document Preview Overlay Modal */}
      {activePreviewFile && (
        <div className="preview-modal-overlay" onClick={() => setActivePreviewFile(null)}>
          <div className="preview-modal-card" onClick={(e) => e.stopPropagation()}>
            <header className="preview-modal-header">
              <h3>Preview: {activePreviewFile.name}</h3>
              <button className="preview-modal-close" onClick={() => setActivePreviewFile(null)}>
                &times;
              </button>
            </header>
            <div className="preview-modal-body">
              <div className="preview-badge-category">{activePreviewFile.fileType}</div>
              <div className="preview-content-box">
                {activePreviewFile.data && activePreviewFile.data.startsWith('data:image/') ? (
                  <img src={activePreviewFile.data} alt={activePreviewFile.name} className="preview-image-elem" />
                ) : activePreviewFile.data && (activePreviewFile.data.startsWith('data:text/') || activePreviewFile.name.endsWith('.txt')) ? (
                  <pre className="preview-text-elem">{atob(activePreviewFile.data.split(',')[1])}</pre>
                ) : (
                  <div className="preview-no-view">
                    <File size={64} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
                    <p>Inline preview is not supported for this file type.</p>
                    {activePreviewFile.data && (
                      <a href={activePreviewFile.data} download={activePreviewFile.name} className="btn-preview-download">
                        Download Document
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Prescription PDF Preview Modal */}
      {showPdfModal && (
        <div className="preview-modal-overlay print-preview-overlay" onClick={() => setShowPdfModal(false)}>
          <div className="preview-modal-card rx-preview-card" onClick={(e) => e.stopPropagation()}>
            <header className="preview-modal-header no-print-element">
              <h3>Prescription Output Preview</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => window.print()}
                  className="btn-preview-download btn-print-trigger"
                >
                  <Printer size={16} /> Print Rx
                </button>
                <button className="preview-modal-close" onClick={() => setShowPdfModal(false)}>
                  &times;
                </button>
              </div>
            </header>
            
            <div className="preview-modal-body rx-pdf-print-body">
              <div className="prescription-layout-sheet">
                
                {/* Facility & Doctor Letterhead */}
                <div className="rx-sheet-header">
                  <div className="rx-facility-details">
                    <h2>{facility.clinicName || 'CLINIC FACILITY NAME'}</h2>
                    <span>{facility.department || 'General Medicine'}</span>
                    <p>{facility.address || 'Street address'}</p>
                    <p>{facility.city || 'City'}</p>
                  </div>
                  <div className="rx-doctor-details">
                    <h3>Dr. {doctor.name || 'DOCTOR NAME'}</h3>
                    <p className="doc-qual">{doctor.qualification || 'Qualification'}</p>
                    <p>RMP Reg No: {doctor.registrationNumber || 'RMP-00000'}</p>
                    <p>Mob: {doctor.mobile || 'Phone details'}</p>
                    <p>{doctor.address || ''}</p>
                  </div>
                </div>

                <div className="rx-sheet-divider"></div>

                {/* Patient particulars */}
                <div className="rx-sheet-patient-particulars">
                  <div className="part-col">
                    <p><strong>Patient Name:</strong> {patient.name}</p>
                    <p><strong>Age / Gender:</strong> {patient.age} yrs • {patient.gender}</p>
                  </div>
                  <div className="part-col">
                    <p><strong>Date of Visit:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Visit Type:</strong> {visitType}</p>
                  </div>
                  <div className="part-col full-particulars-col">
                    <p><strong>Address:</strong> {patientContact.address || 'Not specified'}</p>
                    <p><strong>Mobile:</strong> {patientContact.mobile || 'Not specified'}</p>
                  </div>
                </div>

                <div className="rx-sheet-divider"></div>

                {/* Vitals summary bar */}
                <div className="rx-sheet-vitals-bar">
                  <span><strong>Vitals:</strong></span>
                  <span><strong>BP:</strong> {vitals.bp || '—'}</span>
                  <span><strong>Pulse:</strong> {vitals.pulse || '—'} bpm</span>
                  <span><strong>RR:</strong> {vitals.rr || '—'} /min</span>
                  <span><strong>Temp:</strong> {vitals.temp || '—'} °F</span>
                  <span><strong>SpO2:</strong> {vitals.spo2 || '—'} %</span>
                </div>

                <div className="rx-sheet-divider"></div>

                {/* Presenting complaint */}
                <div className="rx-sheet-body-section">
                  <h4>Chief Complaints & History</h4>
                  <p>
                    Patient presents today with the primary complaint of **{chiefComplaint || patient.reason}** suffering for **{chiefComplaintDuration || 'unspecified duration'}**.
                  </p>
                  {presentIllness.symptoms && (
                    <p><strong>Associated Symptoms:</strong> {presentIllness.symptoms}</p>
                  )}
                  <p>
                    <strong>Timeline & Course:</strong> Symptoms described as {presentIllness.onset} onset with a {presentIllness.progression} progression.
                  </p>
                </div>

                {/* Physical examinations */}
                <div className="rx-sheet-body-section">
                  <h4>Physical Examinations</h4>
                  <p>
                    <strong>General Examination:</strong> NAD (No Abnormality Detected): {physicalExamination.general.nad ? 'Yes' : 'No'}, Pallor: {physicalExamination.general.pallor ? 'Yes' : 'No'}, Icterus: {physicalExamination.general.icterus ? 'Yes' : 'No'}, Edema: {physicalExamination.general.edema ? 'Yes' : 'No'}, Cyanosis: {physicalExamination.general.cyanosis ? 'Yes' : 'No'}.
                  </p>
                  {(physicalExamination.cvs || physicalExamination.rs || physicalExamination.cns || physicalExamination.pa) && (
                    <p>
                      <strong>Systemic Examination:</strong> 
                      {physicalExamination.cvs && ` CVS: ${physicalExamination.cvs};`}
                      {physicalExamination.rs && ` RS: ${physicalExamination.rs};`}
                      {physicalExamination.cns && ` CNS: ${physicalExamination.cns};`}
                      {physicalExamination.pa && ` P/A: ${physicalExamination.pa};`}
                    </p>
                  )}
                </div>

                {/* Investigations advised */}
                {(investigationsAdvised.tests || []).length > 0 && (
                  <div className="rx-sheet-body-section">
                    <h4>Investigations Advised</h4>
                    <ul className="rx-tests-print-list">
                      {(investigationsAdvised.tests || []).map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                    {investigationsAdvised.notes && (
                      <p className="rx-tests-notes"><strong>Notes:</strong> {investigationsAdvised.notes}</p>
                    )}
                  </div>
                )}

                {/* Treatment / Medication prescriptions */}
                <div className="rx-sheet-body-section">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>Rx</span> (Prescribed Medications)
                  </h4>
                  <table className="rx-print-meds-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40%' }}>Medication</th>
                        <th>Frequency</th>
                        <th>Dosage</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medications.length > 0 ? (
                        medications.map((m, i) => (
                          <tr key={i}>
                            <td><strong>{m.name || 'Unspecified'}</strong></td>
                            <td>{m.frequency || 'Once a day'}</td>
                            <td>{m.dosage || '—'}</td>
                            <td>{m.duration || '—'}</td>
                            <td>{m.notes || '—'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">No medications prescribed.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Advice & Counselling */}
                {advice && (
                  <div className="rx-sheet-body-section">
                    <h4>Advice & Counselling</h4>
                    <p>{advice}</p>
                  </div>
                )}

                {/* Footer review and signature */}
                <div className="rx-sheet-footer-particulars">
                  <div className="follow-up-note">
                    <p><strong>Follow-up:</strong> Review patient clinic status after {followUpDays} days.</p>
                  </div>
                  <div className="signature-signoff-box">
                    {signatureData ? (
                      <div className="printed-sig-img">
                        <img src={signatureData} alt="Doctor Signature" />
                        <span>Authorized Medical Signatory</span>
                      </div>
                    ) : (
                      <div className="printed-sig-blank">
                        <div className="sign-line"></div>
                        <span>Doctor Signature & Stamp</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Consultation;
