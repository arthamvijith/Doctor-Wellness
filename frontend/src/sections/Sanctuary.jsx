import { Bot, CalendarDays, FileText, Activity } from 'lucide-react';

function Sanctuary() {
  return (
    <section className="sanctuary section-wrap">
      <div className="sanctuary-card">
        <div className="sanctuary-menu">
          <span>The Clinician&apos;s Sanctuary</span>
          <p>Experience the interface designed to lower cortical levels and increase focus.</p>
          <button className="active">
            <FileText size={14} /> Patient Dashboard
          </button>
          <button>
            <CalendarDays size={14} /> Smart Calendar
          </button>
          <button>
            <Bot size={14} /> AI Assistant
          </button>
        </div>
        <div className="schedule-card">
          <strong>Appointment Schedule</strong>
          <p>09:30 AM - Neha Rao <em>Follow-up</em></p>
          <p>10:30 AM - Aman Mehta <em>Review</em></p>
        </div>
        <div className="health-card">
          <span>Live coding view</span>
          <Activity size={20} />
          <h3>AI Health Insights</h3>
          <p>Patient #2321 shows a trending sleep imbalance. Adjust nutrition dosage and schedule a retest panel.</p>
          <button>Review Data</button>
        </div>
      </div>
    </section>
  );
}

export default Sanctuary;
