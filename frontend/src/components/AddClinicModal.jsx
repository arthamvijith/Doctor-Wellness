import React, { useState } from 'react';
import { X, Landmark } from 'lucide-react';

function AddClinicModal({ isOpen, onClose, doctorId, onClinicAdded }) {
  const [clinicName, setClinicName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clinicName.trim()) {
      setError('Please enter a clinic name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/clinics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: clinicName,
          doctorId
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to add clinic');
      }

      const newClinic = await response.json();
      onClinicAdded(newClinic);
      setClinicName('');
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
            <span className="modal-icon-chip"><Landmark size={18} /></span>
            <h3>Add New Clinic</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-body">
          <p className="modal-intro">
            Register a new clinical branch or workspace to start managing dedicated patient consultation queues.
          </p>

          {error && <div className="modal-error-banner">{error}</div>}

          <div className="form-group">
            <label htmlFor="clinic-name">Clinic or Hospital Name</label>
            <input
              id="clinic-name"
              type="text"
              placeholder="e.g. City Wellness Center"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              disabled={loading}
              autoFocus
            />
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
              {loading ? 'Registering...' : 'Register Clinic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddClinicModal;
