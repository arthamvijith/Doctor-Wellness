import { useEffect, useState } from 'react';
import {
  Activity,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  LogOut,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  User,
  Users
} from 'lucide-react';
import logo from '../assets/doctor-wellness-logo.svg';
import PatientEmptyState from '../components/PatientEmptyState.jsx';
import AddClinicModal from '../components/AddClinicModal.jsx';
import AddPatientModal from '../components/AddPatientModal.jsx';
import EditPatientModal from '../components/EditPatientModal.jsx';
import { Sliders, Edit2, Trash2 } from 'lucide-react';

const initialPatients = [
  { id: '1', name: 'Aarav Sharma', age: 34, gender: 'Male', reason: 'Routine Hypertension Follow-up', time: '09:30 AM', status: 'Completed' },
  { id: '2', name: 'Priya Patel', age: 29, gender: 'Female', reason: 'Acute Migraine Consultation', time: '10:15 AM', status: 'Completed' },
  { id: '3', name: 'Rohan Verma', age: 45, gender: 'Male', reason: 'Type 2 Diabetes Review', time: '11:00 AM', status: 'In Consultation' },
  { id: '4', name: 'Ananya Iyer', age: 58, gender: 'Female', reason: 'Post-op Cardiac Check', time: '11:45 AM', status: 'Waiting' },
  { id: '5', name: 'Kabir Mehta', age: 12, gender: 'Male', reason: 'Allergic Rhinitis Pediatric Consultation', time: '12:30 PM', status: 'Waiting' }
];

function Dashboard() {
  const [doctor, setDoctor] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState('All Clinics');
  const [isAddClinicOpen, setIsAddClinicOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Clinical Assistant');
  const [timeStr, setTimeStr] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Vijith Artham');
  const [doctorSpecialization, setDoctorSpecialization] = useState('General Medicine');

  // Load customized doctor details
  useEffect(() => {
    try {
      const cached = localStorage.getItem('loggedInDoctor');
      if (cached) {
        const doc = JSON.parse(cached);
        if (doc) {
          setDoctor(doc);
          if (doc.fullName) {
            const formattedName = doc.fullName.toLowerCase().startsWith('dr.')
              ? doc.fullName
              : `Dr. ${doc.fullName}`;
            setDoctorName(formattedName);
          }
          if (doc.specialization) {
            setDoctorSpecialization(doc.specialization);
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse logged-in doctor session:', e);
    }
  }, []);

  // Fetch Clinics from Database
  const fetchClinics = async (docId) => {
    if (!docId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/clinics?doctorId=${docId}`);
      if (res.ok) {
        const data = await res.json();
        setClinics([{ _id: 'All Clinics', name: 'All Clinics' }, ...data]);
      }
    } catch (err) {
      console.error('Failed to fetch clinics:', err);
    }
  };

  // Fetch Patients from Database
  const fetchPatients = async (docId, clinicId) => {
    if (!docId) return;
    try {
      const clinicQuery = clinicId && clinicId !== 'All Clinics' ? `&clinicId=${clinicId}` : '';
      const res = await fetch(`http://localhost:5000/api/patients?doctorId=${docId}${clinicQuery}`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
        if (data.length > 0) {
          setSelectedPatient(prev => {
            const stillExists = prev && data.find(p => p._id === prev._id);
            return stillExists || data[0];
          });
        } else {
          setSelectedPatient(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  };

  const deletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient from the queue?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/patients/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchPatients(doctor.id, selectedClinicId);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete patient');
      }
    } catch (err) {
      console.error('Error deleting patient:', err);
      alert('Error deleting patient');
    }
  };

  // Fetch initial clinics and patients once doctor loads
  useEffect(() => {
    if (doctor && doctor.id) {
      fetchClinics(doctor.id);
    }
  }, [doctor]);

  // Refetch patients when doctor or selected clinic changes
  useEffect(() => {
    if (doctor && doctor.id) {
      fetchPatients(doctor.id, selectedClinicId);
    }
  }, [doctor, selectedClinicId]);

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



  const handleLogout = () => {
    localStorage.removeItem('loggedInDoctor');
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
          {['Clinical Assistant', 'Patient Queue', 'AI Scribe', 'Analytics', 'Settings'].map((tab) => {
            const getIcon = () => {
              switch (tab) {
                case 'Clinical Assistant': return <Activity size={18} />;
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
              <strong>{doctorName}</strong>
              <span>{doctorSpecialization}</span>
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
            <h1>Welcome Back, {doctorName.replace(/^Dr\.\s+/i, '')}</h1>
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

        {activeTab === 'Clinical Assistant' && (
          <div className="dash-content-grid">
            {/* Quick stats section */}
            <section className="stats-row">
              <div className="stat-card">
                <span className="stat-icon"><Users size={20} /></span>
                <div>
                  <h3>Total Patients</h3>
                  <strong>{patients.length}</strong>
                  <span><TrendingUp size={12} /> Active clinic registry</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon"><Calendar size={20} /></span>
                <div>
                  <h3>Today&apos;s Queue</h3>
                  <strong>{patients.length} Patients</strong>
                  <span><Clock size={12} /> {patients.filter(p => p.status === 'Completed').length} completed, {patients.filter(p => p.status === 'In Consultation').length} active</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon"><Building size={20} /></span>
                <div>
                  <h3>Total Clinics</h3>
                  <strong>{Math.max(0, clinics.length - 1)}</strong>
                  <span><CheckCircle size={12} /> Active clinical network</span>
                </div>
              </div>
            </section>

            {/* Side-by-side Clinical Assistant & Today's Patients layout */}
            <div className="overview-split" style={{ alignItems: 'flex-start' }}>
              {/* Clinical Assistant Dropdown Card */}
              <section className="clinic-assistant-card" style={{ marginBottom: '0px' }}>
                <h2>Clinical Assistant</h2>
                <p className="card-desc">Patient lookup, summary workflow, prescriptions and buddy access</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                  <div className="clinic-select-wrap" style={{ width: '100%', minWidth: '0px' }}>
                    <select
                      value={selectedClinicId}
                      onChange={(e) => setSelectedClinicId(e.target.value)}
                    >
                      {clinics.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', width: '100%' }}>
                    <button
                      className="btn-add-clinic"
                      onClick={() => setIsAddClinicOpen(true)}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Plus size={16} /> Add New Clinic
                    </button>
                  </div>
                </div>
              </section>

              {/* Queue list container */}
              <section className="dashboard-panel queue-panel" style={{ marginTop: '0px' }}>
                <div className="patients-section-header">
                  <div>
                    <h2>Today&apos;s Patients</h2>
                    <span className="date-label">
                      {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <button
                    className="btn-add-patient"
                    onClick={() => setIsAddPatientOpen(true)}
                  >
                    <Plus size={16} /> Add Patient
                  </button>
                </div>

                <div className="search-bar" style={{ marginBottom: '20px' }}>
                  <Search size={14} />
                  <input
                    type="text"
                    placeholder="Search queue..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="queue-list">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <div
                        key={patient._id || patient.id}
                        className={`queue-item ${selectedPatient && (selectedPatient._id === patient._id || selectedPatient.id === patient.id) ? 'selected' : ''} ${patient.status ? patient.status.toLowerCase().replace(' ', '-') : 'waiting'}`}
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="reason-pill">{patient.reason}</span>
                            <span className={`status-pill ${patient.status ? patient.status.toLowerCase().replace(' ', '-') : 'waiting'}`}>
                              {patient.status}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {patient.status !== 'Completed' && (
                              <button
                                type="button"
                                className="btn-start-consultation-inline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `/consultation?patientId=${patient._id || patient.id}`;
                                }}
                              >
                                Start Consultation
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-edit-patient-inline"
                              title="Edit Patient & Status"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPatientToEdit(patient);
                                setIsEditPatientOpen(true);
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn-delete-patient-inline"
                              title="Delete Patient"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePatient(patient._id || patient.id);
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <PatientEmptyState />
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'Patient Queue' && (
          <section className="dashboard-panel full-panel">
            <div className="panel-header">
              <h2>Extended Patient Directory</h2>
              <button className="add-btn" onClick={() => setIsAddPatientOpen(true)}>
                <Plus size={16} /> Register New Patient
              </button>
            </div>
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Age & Gender</th>
                  <th>Reason for Consultation</th>
                  <th>Scheduled Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => (
                  <tr key={p._id || p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.age} years old ({p.gender})</td>
                    <td><span className="reason-pill">{p.reason}</span></td>
                    <td>{p.time}</td>
                    <td><span className={`status-pill ${p.status ? p.status.toLowerCase().replace(' ', '-') : 'waiting'}`}>{p.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {p.status !== 'Completed' && (
                          <button
                            type="button"
                            className="btn-start-consultation-table"
                            style={{
                              height: '28px',
                              padding: '0 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'var(--primary)',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 180ms ease'
                            }}
                            onClick={() => {
                              window.location.href = `/consultation?patientId=${p._id || p.id}`;
                            }}
                          >
                            Start Consultation
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-edit-patient-table"
                          onClick={() => {
                            setPatientToEdit(p);
                            setIsEditPatientOpen(true);
                          }}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn-delete-patient-table"
                          style={{
                            height: '28px',
                            padding: '0 10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(234, 67, 53, 0.15)',
                            background: '#ffffff',
                            color: '#ea4335',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 180ms ease'
                          }}
                          onClick={() => {
                            deletePatient(p._id || p.id);
                          }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
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

      {/* Interactive Database Modals */}
      {doctor && (
        <>
          <AddClinicModal
            isOpen={isAddClinicOpen}
            onClose={() => setIsAddClinicOpen(false)}
            doctorId={doctor.id}
            onClinicAdded={(newClinic) => {
              fetchClinics(doctor.id);
              setSelectedClinicId(newClinic._id);
            }}
          />
          <AddPatientModal
            isOpen={isAddPatientOpen}
            onClose={() => setIsAddPatientOpen(false)}
            doctorId={doctor.id}
            clinics={clinics}
            defaultClinicId={selectedClinicId}
            onPatientAdded={() => {
              fetchPatients(doctor.id, selectedClinicId);
            }}
          />
          <EditPatientModal
            isOpen={isEditPatientOpen}
            onClose={() => {
              setIsEditPatientOpen(false);
              setPatientToEdit(null);
            }}
            doctorId={doctor.id}
            patient={patientToEdit}
            clinics={clinics}
            onPatientUpdated={(updatedPatient) => {
              fetchPatients(doctor.id, selectedClinicId);
              if (selectedPatient && (selectedPatient._id === updatedPatient._id || selectedPatient.id === updatedPatient.id)) {
                setSelectedPatient(updatedPatient);
              }
            }}
          />
        </>
      )}
    </div>
  );
}

export default Dashboard;
