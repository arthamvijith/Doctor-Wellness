import React, { useState, useEffect } from 'react';
import { X, Edit2, Calendar, Clock, FileText, Activity } from 'lucide-react';

function EditPatientModal({ isOpen, onClose, doctorId, patient, clinics, onPatientUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    reason: '',
    time: '',
    status: 'Waiting',
    clinicId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom clock-picker states
  const [showClockPicker, setShowClockPicker] = useState(false);
  const [clockHour, setClockHour] = useState(9);
  const [clockMinute, setClockMinute] = useState('30');
  const [clockAmPm, setClockAmPm] = useState('AM');

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        age: patient.age || '',
        gender: patient.gender || 'Male',
        reason: patient.reason || '',
        time: patient.time || '',
        status: patient.status || 'Waiting',
        clinicId: patient.clinicId || ''
      });

      // Try parsing existing time string (e.g. "09:30 AM")
      try {
        const timeParts = patient.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (timeParts) {
          setClockHour(parseInt(timeParts[1], 10));
          setClockMinute(timeParts[2]);
          setClockAmPm(timeParts[3].toUpperCase());
        }
      } catch (e) {
        console.error('Failed to parse time string:', e);
      }
    }
  }, [patient, isOpen]);

  const updateTimeStr = (h, m, ap) => {
    const formattedH = String(h).padStart(2, '0');
    setFormData(prev => ({ ...prev, time: `${formattedH}:${m} ${ap}` }));
  };

  const handleHourClick = (h) => {
    setClockHour(h);
    updateTimeStr(h, clockMinute, clockAmPm);
  };

  const handleMinuteClick = (m) => {
    setClockMinute(m);
    updateTimeStr(clockHour, m, clockAmPm);
  };

  const handleAmPmClick = (ap) => {
    setClockAmPm(ap);
    updateTimeStr(clockHour, clockMinute, ap);
  };

  if (!isOpen || !patient) return null;

  // Filter out "All Clinics" from selection dropdown
  const eligibleClinics = clinics.filter(c => c._id !== 'All Clinics');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, age, gender, reason, time, status, clinicId } = formData;

    if (!name.trim()) return setError('Please enter a patient name.');
    if (!age || isNaN(age) || Number(age) <= 0) return setError('Please enter a valid age.');
    if (!reason.trim()) return setError('Please enter a reason for consultation.');
    if (!time.trim()) return setError('Please enter a scheduled time.');
    if (!clinicId) return setError('Please select a clinic location.');

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/patients/${patient._id || patient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          age: Number(age),
          gender,
          reason,
          time,
          status,
          clinicId
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update patient details');
      }

      const updated = await response.json();
      onPatientUpdated(updated);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <header className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon-chip"><Edit2 size={18} /></span>
            <h3>Edit Patient & Status</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-body">
          <p className="modal-intro">
            Modify patient parameters or update their current consultation queue status.
          </p>

          {error && <div className="modal-error-banner">{error}</div>}

          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="edit-patient-name">Patient Full Name</label>
              <input
                id="edit-patient-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-patient-age">Age (Years)</label>
              <input
                id="edit-patient-age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-patient-gender">Gender</label>
              <select
                id="edit-patient-gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-patient-time">Scheduled Time</label>
              <div className="input-icon-wrap">
                <Clock size={14} className="input-icon" />
                <input
                  id="edit-patient-time"
                  type="text"
                  name="time"
                  value={formData.time}
                  onFocus={() => {
                    setShowClockPicker(true);
                    updateTimeStr(clockHour, clockMinute, clockAmPm);
                  }}
                  readOnly
                  disabled={loading}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="edit-patient-clinic">Clinic Location</label>
              <select
                id="edit-patient-clinic"
                name="clinicId"
                value={formData.clinicId}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">-- Select Clinic --</option>
                {eligibleClinics.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="edit-patient-status">Queue Consultation Status</label>
              <div className="input-icon-wrap">
                <Activity size={14} className="input-icon" />
                <select
                  id="edit-patient-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ paddingLeft: '44px' }}
                >
                  <option value="Waiting">Waiting (Yet to consult)</option>
                  <option value="In Consultation">In Consultation (Active)</option>
                  <option value="Completed">Completed (Consulted)</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="edit-patient-reason">Reason for Consultation</label>
              <div className="input-icon-wrap">
                <FileText size={14} className="input-icon" />
                <input
                  id="edit-patient-reason"
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn primary"
              disabled={loading}
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {showClockPicker && (
        <div className="clock-modal-overlay">
          <div className="clock-modal-card">
            <header className="clock-modal-header">
              <div className="clock-modal-title">
                <Clock size={16} />
                <h3>Set Consultation Time</h3>
              </div>
              <button
                type="button"
                className="clock-modal-close"
                onClick={() => setShowClockPicker(false)}
              >
                <X size={16} />
              </button>
            </header>

            <div className="clock-modal-body">
              {/* AM/PM segments */}
              <div className="clock-ampm-segments-double">
                <button
                  type="button"
                  className={clockAmPm === 'AM' ? 'active' : ''}
                  onClick={() => handleAmPmClick('AM')}
                >
                  AM
                </button>
                <button
                  type="button"
                  className={clockAmPm === 'PM' ? 'active' : ''}
                  onClick={() => handleAmPmClick('PM')}
                >
                  PM
                </button>
              </div>

              {/* Nested Dual Ring Dial */}
              <div className="clock-double-dial-container">
                <div className="clock-dial-double">
                  <div className="clock-pivot-double" />

                  {/* Short Hour Hand */}
                  <div
                    className="clock-hand-hour"
                    style={{ transform: `rotate(${clockHour * 30}deg)` }}
                  />

                  {/* Long Minute Hand */}
                  <div
                    className="clock-hand-minute"
                    style={{
                      transform: `rotate(${['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].indexOf(clockMinute) * 30}deg)`
                    }}
                  />

                  {/* Outer Ring: Hours (1-12) */}
                  {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h, index) => {
                    const angle = (index * 30 * Math.PI) / 180;
                    const radius = 92;
                    const x = Math.sin(angle) * radius;
                    const y = -Math.cos(angle) * radius;
                    return (
                      <button
                        key={`hour-${h}`}
                        type="button"
                        className={`clock-hour-outer ${clockHour === h ? 'active' : ''}`}
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`
                        }}
                        onClick={() => handleHourClick(h)}
                        title={`Hour ${h}`}
                      >
                        {h}
                      </button>
                    );
                  })}

                  {/* Inner Ring: Minutes (:00 to :55) */}
                  {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m, index) => {
                    const angle = (index * 30 * Math.PI) / 180;
                    const radius = 56;
                    const x = Math.sin(angle) * radius;
                    const y = -Math.cos(angle) * radius;
                    return (
                      <button
                        key={`minute-${m}`}
                        type="button"
                        className={`clock-minute-inner ${clockMinute === m ? 'active' : ''}`}
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`
                        }}
                        onClick={() => handleMinuteClick(m)}
                        title={`Minute ${m}`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active selection preview and Done button */}
              <div className="clock-footer-double">
                <div className="clock-preview-value">
                  Selected Time: <span>{String(clockHour).padStart(2, '0')}:{clockMinute} {clockAmPm}</span>
                </div>
                <button
                  type="button"
                  className="clock-btn-done-double"
                  onClick={() => setShowClockPicker(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditPatientModal;
