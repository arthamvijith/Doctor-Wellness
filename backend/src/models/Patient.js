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
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorRegistration', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Patient', patientSchema);
