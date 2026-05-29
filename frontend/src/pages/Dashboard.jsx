import { useEffect, useState } from 'react';
import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  FileText,
  Heart,
  LogOut,
  Mic,
  MicOff,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  User,
  Users
} from 'lucide-react';
import logo from '../assets/doctor-wellness-logo.svg';

const initialPatients = [
  { id: '1', name: 'Aarav Sharma', age: 34, gender: 'Male', reason: 'Routine Hypertension Follow-up', time: '09:30 AM', status: 'Completed' },
  { id: '2', name: 'Priya Patel', age: 29, gender: 'Female', reason: 'Acute Migraine Consultation', time: '10:15 AM', status: 'Completed' },
  { id: '3', name: 'Rohan Verma', age: 45, gender: 'Male', reason: 'Type 2 Diabetes Review', time: '11:00 AM', status: 'In Consultation' },
  { id: '4', name: 'Ananya Iyer', age: 58, gender: 'Female', reason: 'Post-op Cardiac Check', time: '11:45 AM', status: 'Waiting' },
  { id: '5', name: 'Kabir Mehta', age: 12, gender: 'Male', reason: 'Allergic Rhinitis Pediatric Consultation', time: '12:30 PM', status: 'Waiting' }
];

const mockScribeOutputs = [
  "Chief Complaint: Patient Rohan Verma, 45-year-old male, reports mild fatigue and occasional blurry vision over the past 2 weeks.",
  "History of Present Illness: Diagnosed with Type 2 Diabetes Mellitus 3 years ago. Currently managed with Metformin 1000mg daily. Admits to minor dietary non-compliance during the holidays.",
  "Physical Examination:\n- Blood Pressure: 128/82 mmHg\n- Heart Rate: 72 bpm\n- BMI: 27.4\n- Foot Exam: Intact sensation bilaterally, no active ulcers.",
  "Assessment:\n1. Type 2 Diabetes Mellitus - suboptimally controlled (HbA1c last week: 7.6%)\n2. Mild Diabetic Neuropathy (suspected, sensory screen normal)",
  "Plan:\n1. Increase Metformin to 1000mg twice daily with meals.\n2. Refer to nutritionist for structured carbohydrate management.\n3. Schedule repeat HbA1c in 3 months.\n4. Eye exam referral."
];

function Dashboard() {
  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatient, setSelectedPatient] = useState(initialPatients[2]); // Rohan Verma
  const [searchTerm, setSearchTerm] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStep, setRecordingStep] = useState(-1);
  const [scribeText, setScribeText] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [timeStr, setTimeStr] = useState('');

  // Clock effect
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTimeStr(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scribe recording simulation
  useEffect(() => {
    let timer = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingStep((prev) => {
          const next = prev + 1;
          if (next < mockScribeOutputs.length) {
            setScribeText((currentText) => 
              currentText + (currentText ? "\n\n" : "") + mockScribeOutputs[next]
            );
            return next;
          } else {
            setIsRecording(false);
            return prev;
          }
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      setScribeText('');
      setRecordingStep(-1);
      setIsRecording(true);
    } else {
      setIsRecording(false);
    }
  };

  const handleLogout = () => {
    window.location.pathname = '/';
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dash-root">
      {/* Sidebar navigation */}
      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="Oorzaa Wellness" />
          <span>Oorzaa Clinical</span>
        </div>

        <nav className="sidebar-nav">
          {['Overview', 'Patient Queue', 'AI Scribe', 'Analytics', 'Settings'].map((tab) => {
            const getIcon = () => {
              switch (tab) {
                case 'Overview': return <Activity size={18} />;
                case 'Patient Queue': return <Users size={18} />;
                case 'AI Scribe': return <Sparkles size={18} />;
                case 'Analytics': return <TrendingUp size={18} />;
                default: return <User size={18} />;
              }
            };
            return (
              <button
                key={tab}
                className={`sidebar-link ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {getIcon()}
                <span>{tab}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="doctor-badge">
            <div className="badge-avatar">MD</div>
            <div>
              <strong>Dr. Vijith Artham</strong>
              <span>General Medicine</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content body */}
      <main className="dash-main">
        {/* Header toolbar */}
        <header className="dash-toolbar">
          <div>
            <h1>Welcome Back, Dr. Vijith</h1>
            <p>Your clinical sanctuary is fully operational.</p>
          </div>
          <div className="toolbar-stats">
            <span className="live-clock">{timeStr}</span>
            <div className="serenity-rating">
              <Heart size={14} fill="#0d6b00" />
              <span>Serenity: 98%</span>
            </div>
          </div>
        </header>

        {activeTab === 'Overview' && (
          <div className="dash-content-grid">
            {/* Quick stats section */}
            <section className="stats-row">
              <div className="stat-card">
                <span className="stat-icon"><Users size={20} /></span>
                <div>
                  <h3>Total Patients</h3>
                  <strong>1,424</strong>
                  <span><TrendingUp size={12} /> +12% this month</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon"><Calendar size={20} /></span>
                <div>
                  <h3>Today&apos;s Queue</h3>
                  <strong>18 Patients</strong>
                  <span><Clock size={12} /> 5 completed, 1 active</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon"><Mic size={20} /></span>
                <div>
                  <h3>AI Scribe Summaries</h3>
                  <strong>12 dictations</strong>
                  <span><CheckCircle size={12} /> 100% synchronized</span>
                </div>
              </div>
            </section>

            {/* Split layout: Patient Queue & AI Scribe simulation */}
            <div className="overview-split">
              {/* Queue panel */}
              <section className="dashboard-panel queue-panel">
                <div className="panel-header">
                  <h2>Patient Consultation Queue</h2>
                  <div className="search-bar">
                    <Search size={14} />
                    <input
                      type="text"
                      placeholder="Search queue..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="queue-list">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`queue-item ${selectedPatient.id === patient.id ? 'selected' : ''} ${patient.status.toLowerCase().replace(' ', '-')}`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="item-left">
                        <div className="patient-initial">{patient.name[0]}</div>
                        <div>
                          <h4>{patient.name}</h4>
                          <span>{patient.gender}, {patient.age} yrs • {patient.time}</span>
                        </div>
                      </div>
                      <div className="item-right">
                        <span className="reason-pill">{patient.reason}</span>
                        <span className={`status-pill ${patient.status.toLowerCase().replace(' ', '-')}`}>
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Scribe panel */}
              <section className="dashboard-panel scribe-panel">
                <div className="panel-header">
                  <div>
                    <h2>Interactive AI Scribe</h2>
                    <p>Real-time conversational note dictation</p>
                  </div>
                  <button
                    onClick={toggleRecording}
                    className={`scribe-record-btn ${isRecording ? 'recording' : ''}`}
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                    <span>{isRecording ? 'Stop Dictation' : 'Start Scribe Simulation'}</span>
                  </button>
                </div>

                <div className="scribe-consultation-banner">
                  <span>Currently Editing:</span>
                  <strong>{selectedPatient.name} ({selectedPatient.reason})</strong>
                </div>

                <div className="scribe-output-box">
                  {scribeText ? (
                    <pre className="scribe-pre">{scribeText}</pre>
                  ) : (
                    <div className="scribe-empty-state">
                      <Sparkles size={36} />
                      <p>
                        Select a patient, then click <strong>"Start Scribe Simulation"</strong> to witness real-time speech-to-text medical note generation.
                      </p>
                    </div>
                  )}
                  {isRecording && (
                    <div className="dictation-wave">
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  )}
                </div>

                <div className="scribe-footer-actions">
                  <span className="scribe-provider"><Database size={12} /> Syncing secure EHR draft</span>
                  <button 
                    disabled={!scribeText || isRecording}
                    onClick={() => {
                      alert(`Successfully committed AI SOAP Note for ${selectedPatient.name} to patient longitudinal history!`);
                      setScribeText('');
                    }}
                  >
                    Commit to EHR Record
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'Patient Queue' && (
          <section className="dashboard-panel full-panel">
            <div className="panel-header">
              <h2>Extended Patient Directory</h2>
              <button className="add-btn"><Plus size={16} /> Register New Patient</button>
            </div>
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Age & Gender</th>
                  <th>Reason for Consultation</th>
                  <th>Scheduled Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.age} years old ({p.gender})</td>
                    <td><span className="reason-pill">{p.reason}</span></td>
                    <td>{p.time}</td>
                    <td><span className={`status-pill ${p.status.toLowerCase().replace(' ', '-')}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'AI Scribe' && (
          <section className="dashboard-panel full-panel">
            <div className="panel-header">
              <h2>Historical Scribe Transcripts</h2>
            </div>
            <div className="transcripts-grid">
              <div className="transcript-card">
                <h3>Cardiology SOAP Summary — Aarav Sharma</h3>
                <span>Date: May 28, 2026 • Duration: 14 mins</span>
                <p>EHR synchronized. Patient reports general wellness, stable energy, and zero ischemic chest pain since initiating daily Bisoprolol 5mg.</p>
              </div>
              <div className="transcript-card">
                <h3>Neurological Assessment — Priya Patel</h3>
                <span>Date: May 27, 2026 • Duration: 9 mins</span>
                <p>Migraine log reviewed. Recommended daily magnesium supplementation and Sumatriptan 50mg PRN at onset of aura. Sumatriptan prescription renewed.</p>
              </div>
            </div>
          </section>
        )}

        {(activeTab === 'Analytics' || activeTab === 'Settings') && (
          <div className="dash-coming-soon">
            <Sparkles size={48} />
            <h2>{activeTab} Module</h2>
            <p>Our engineering team is finalizing this high-fidelity component for deployment.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
