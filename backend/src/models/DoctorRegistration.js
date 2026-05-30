import mongoose from 'mongoose';

const doctorRegistrationSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    dob: { type: String },
    gender: { type: String },
    pincode: { type: String, trim: true },
    medicalCouncil: { type: String, trim: true },
    rmpNumber: { type: String, trim: true },
    specialization: { type: String, trim: true },
    experience: { type: String, trim: true },
    highestQualification: { type: String, trim: true },
    qualificationFiles: [
      {
        name: { type: String, trim: true },
        type: { type: String, trim: true },
        size: { type: Number }
      }
    ],
    consentAccepted: { type: Boolean, default: false },
    otpHash: { type: String },
    otpExpiresAt: { type: Date },
    otpVerifiedAt: { type: Date },
    mpin: { type: String, trim: true },
    lastCompletedStep: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'pending_verification', 'verified'],
      default: 'draft'
    }
  },
  { timestamps: true }
);

export default mongoose.model('DoctorRegistration', doctorRegistrationSchema);
