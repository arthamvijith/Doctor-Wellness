import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    status: { type: String, default: 'Waiting', enum: ['Waiting', 'In Consultation', 'Completed'] },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorRegistration', required: true },
    files: [
      {
        name: { type: String, required: true },
        fileType: { type: String, required: true }, // 'X-ray', 'Lab Report', 'Prescription', 'Discharge Summary', 'Other'
        data: { type: String }, // Base64 string for file preview/downloads
        summary: { type: String }, // Document summary/notes
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    clinicalSummary: { type: String },
    chiefComplaint: { type: String, default: '' },
    chiefComplaintDuration: { type: String, default: '' },
    severity: { type: String, default: 'Mild' },
    selectedSuggestions: [{ type: String }],
    soapNote: {
      subjective: { type: String, default: '' },
      objective: { type: String, default: '' },
      assessment: { type: String, default: '' },
      plan: { type: String, default: '' }
    },
    soapAddedToHistory: { type: Boolean, default: false },
    aiCaseSummary: {
      keyFindings: [{ type: String }],
      possibleCauses: [{ type: String }],
      doctorSummary: { type: String, default: '' },
      followUp: { type: String, default: '' },
      mediaReferences: [{ type: String }]
    },
    efficiencySnapshot: {
      responseTimeMs: { type: Number, default: 0 },
      papersReviewedCount: { type: Number, default: 0 }
    },
    pastHistory: { type: String, default: '' },
    personalHistory: {
      diet: { type: String, default: 'Mixed' }, // 'Veg', 'Non-Veg', 'Mixed'
      activity: { type: String, default: 'Moderate' }, // 'Active', 'Moderate', 'Sedentary'
      alcohol: { type: Boolean, default: false },
      smoking: { type: Boolean, default: false },
      drugs: { type: Boolean, default: false }
    },
    vitals: {
      bp: { type: String, default: '' },
      pulse: { type: String, default: '' },
      rr: { type: String, default: '' },
      temp: { type: String, default: '' },
      spo2: { type: String, default: '' }
    },
    physicalExamination: {
      general: {
        nad: { type: Boolean, default: true },
        pallor: { type: Boolean, default: false },
        icterus: { type: Boolean, default: false },
        edema: { type: Boolean, default: false },
        cyanosis: { type: Boolean, default: false }
      },
      cvs: { type: String, default: '' },
      rs: { type: String, default: '' },
      cns: { type: String, default: '' },
      pa: { type: String, default: '' }
    },
    investigationsAdvised: {
      tests: [{ type: String }],
      notes: { type: String, default: '' }
    },
    prescriptionDetails: {
      facility: {
        clinicName: { type: String, default: '' },
        department: { type: String, default: '' },
        address: { type: String, default: '' },
        city: { type: String, default: '' }
      },
      doctor: {
        name: { type: String, default: '' },
        qualification: { type: String, default: '' },
        registrationNumber: { type: String, default: '' },
        address: { type: String, default: '' },
        mobile: { type: String, default: '' }
      },
      patientContact: {
        mobile: { type: String, default: '' },
        address: { type: String, default: '' }
      },
      visitType: { type: String, default: 'OPD' }, // 'OPD', 'Emergency', 'Telecommunication'
      presentIllness: {
        onset: { type: String, default: 'Acute' }, // 'Acute', 'Subacute', 'Chronic'
        progression: { type: String, default: 'Improving' }, // 'Improving', 'Worsening', 'Static'
        symptoms: { type: String, default: '' }
      },
      medications: [
        {
          name: { type: String },
          dosage: { type: String },
          frequency: { type: String },
          duration: { type: String },
          notes: { type: String }
        }
      ],
      advice: { type: String, default: '' },
      followUpDays: { type: Number, default: 7 },
      signatureData: { type: String, default: '' } // Base64 signature image
    }
  },
  { timestamps: true }
);

export default mongoose.model('Patient', patientSchema);
