import React from 'react';
import { Calendar } from 'lucide-react';

function PatientEmptyState() {
  return (
    <div className="patient-empty-state-card">
      <div className="orange-icon-circle">
        <Calendar size={32} strokeWidth={2} />
      </div>
      <h3>No patients today</h3>
      <p>Select a clinic to view today&apos;s patients, or click <strong>&quot;+ Add Patient&quot;</strong> above to register a new consultation.</p>
    </div>
  );
}

export default PatientEmptyState;
