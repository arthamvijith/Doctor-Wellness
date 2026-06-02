import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorRegistration', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Clinic', clinicSchema);
