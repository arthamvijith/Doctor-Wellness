import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import DoctorRegistration from './models/DoctorRegistration.js';

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;
const otpExpiryMinutes = 10;
const registrationFields = [
  'fullName',
  'email',
  'phone',
  'dob',
  'gender',
  'pincode',
  'medicalCouncil',
  'rmpNumber',
  'specialization',
  'experience',
  'highestQualification',
  'qualificationFiles',
  'consentAccepted'
];

app.use(cors());
app.use(express.json());

if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log(
        `MongoDB connected: ${mongoose.connection.db.databaseName}.${DoctorRegistration.collection.name}`
      );
    })
    .catch((error) => {
      console.error('MongoDB connection failed:', error.message);
    });
} else {
  console.warn('MONGODB_URI is not set. Registration submissions will not be persisted.');
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend is ready' });
});

const isDatabaseReady = () => mongoUri && mongoose.connection.readyState === 1;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const createOtp = () => crypto.randomInt(100000, 1000000).toString();

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const createMailTransport = () => {
  const smtpPort = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS?.replace(/\s/g, '')
    }
  });
};

const sendOtpEmail = async ({ email, fullName, otp }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP email settings are not configured');
  }

  const transport = createMailTransport();

  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Your Doctor Wellness verification OTP',
    text: `Hello ${fullName || 'Doctor'},\n\nYour Doctor Wellness verification OTP is ${otp}. It expires in ${otpExpiryMinutes} minutes.\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#152023">
        <h2>Verify your Doctor Wellness registration</h2>
        <p>Hello ${fullName || 'Doctor'},</p>
        <p>Your 6-digit verification OTP is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p>
        <p>This code expires in ${otpExpiryMinutes} minutes.</p>
      </div>
    `
  });
};

const pickRegistrationData = (body) =>
  registrationFields.reduce((data, field) => {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }

    return data;
  }, {});

const getMissingFields = (data) =>
  registrationFields.filter((field) => {
    if (field === 'consentAccepted') {
      return data[field] !== true;
    }

    if (field === 'qualificationFiles') {
      return !Array.isArray(data[field]) || data[field].length === 0;
    }

    return !String(data[field] || '').trim();
  });

app.post('/api/doctor-registration-drafts', async (req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ message: 'Database is not connected' });
  }

  const draftData = {
    ...pickRegistrationData(req.body),
    lastCompletedStep: Number(req.body.step) || 1,
    status: 'draft'
  };

  try {
    let registration = null;

    if (mongoose.Types.ObjectId.isValid(req.body.draftId)) {
      registration = await DoctorRegistration.findByIdAndUpdate(req.body.draftId, draftData, {
        new: true
      });
    }

    if (!registration) {
      registration = await DoctorRegistration.create(draftData);
    }

    return res.status(200).json({
      id: registration._id,
      status: registration.status,
      collection: DoctorRegistration.collection.name,
      message: 'Doctor registration draft saved'
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Unable to save doctor registration draft',
      details: error.message
    });
  }
});

app.post('/api/doctor-registrations', async (req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ message: 'Database is not connected' });
  }

  const registrationData = pickRegistrationData(req.body);
  const missingFields = getMissingFields(registrationData);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Please complete all required registration fields',
      missingFields
    });
  }

  try {
    const submissionData = {
      ...registrationData,
      lastCompletedStep: 3,
      status: 'pending_verification'
    };
    let registration = null;

    if (mongoose.Types.ObjectId.isValid(req.body.draftId)) {
      registration = await DoctorRegistration.findByIdAndUpdate(req.body.draftId, submissionData, {
        new: true
      });
    }

    if (!registration) {
      registration = await DoctorRegistration.create(submissionData);
    }

    return res.status(201).json({
      id: registration._id,
      status: registration.status,
      collection: DoctorRegistration.collection.name,
      message: 'Doctor registration submitted'
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Unable to submit doctor registration',
      details: error.message
    });
  }
});

app.post('/api/doctor-registrations/request-otp', async (req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ message: 'Database is not connected' });
  }

  const registrationData = pickRegistrationData(req.body);
  const missingFields = getMissingFields(registrationData);
  const email = normalizeEmail(registrationData.email);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Please complete all required registration fields',
      missingFields
    });
  }

  try {
    const existingRegistration = await DoctorRegistration.findOne({
      email,
      status: { $in: ['pending_verification', 'verified'] },
      ...(mongoose.Types.ObjectId.isValid(req.body.draftId)
        ? { _id: { $ne: req.body.draftId } }
        : {})
    });

    if (existingRegistration) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const otp = createOtp();
    const otpData = {
      ...registrationData,
      email,
      lastCompletedStep: 3,
      status: 'draft',
      otpHash: hashOtp(otp),
      otpExpiresAt: new Date(Date.now() + otpExpiryMinutes * 60 * 1000),
      otpVerifiedAt: null
    };
    let registration = null;

    if (mongoose.Types.ObjectId.isValid(req.body.draftId)) {
      registration = await DoctorRegistration.findByIdAndUpdate(req.body.draftId, otpData, {
        new: true
      });
    }

    if (!registration) {
      registration = await DoctorRegistration.create(otpData);
    }

    await sendOtpEmail({ email, fullName: registration.fullName, otp });

    return res.status(200).json({
      id: registration._id,
      email: registration.email,
      message: 'OTP sent to email'
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Unable to send OTP',
      details: error.message
    });
  }
});

app.post('/api/doctor-registrations/resend-otp', async (req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ message: 'Database is not connected' });
  }

  const { draftId } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!email || !mongoose.Types.ObjectId.isValid(draftId)) {
    return res.status(400).json({ message: 'Invalid request parameters' });
  }

  try {
    const registration = await DoctorRegistration.findOne({
      _id: draftId,
      email,
      status: 'draft'
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration draft not found' });
    }

    const otp = createOtp();
    registration.otpHash = hashOtp(otp);
    registration.otpExpiresAt = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);
    registration.otpVerifiedAt = null;
    await registration.save();

    await sendOtpEmail({ email, fullName: registration.fullName, otp });

    return res.status(200).json({
      id: registration._id,
      email: registration.email,
      message: 'OTP resent successfully'
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Unable to resend OTP',
      details: error.message
    });
  }
});

app.post('/api/doctor-registrations/verify-otp', async (req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ message: 'Database is not connected' });
  }

  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp || '').trim();

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: 'Please enter a valid 6 digit OTP' });
  }

  try {
    const query = mongoose.Types.ObjectId.isValid(req.body.draftId)
      ? { _id: req.body.draftId, email }
      : { email, status: 'draft' };
    const registration = await DoctorRegistration.findOne(query);

    if (!registration || !registration.otpHash || !registration.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP request was not found' });
    }

    if (registration.otpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (registration.otpHash !== hashOtp(otp)) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    registration.status = 'verified';
    registration.otpHash = undefined;
    registration.otpExpiresAt = undefined;
    registration.otpVerifiedAt = new Date();
    await registration.save();

    return res.status(200).json({
      id: registration._id,
      status: registration.status,
      message: 'Email verified and registration completed'
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Unable to verify OTP',
      details: error.message
    });
  }
});

app.post('/api/doctor-registrations/setup-mpin', async (req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ message: 'Database is not connected' });
  }

  const { id, email, mpin } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!id || !normalizedEmail || !mpin) {
    return res.status(400).json({ message: 'Missing required parameters. Make sure id, email, and mpin are provided.' });
  }

  if (!/^\d{4}$/.test(mpin)) {
    return res.status(400).json({ message: 'MPIN must be exactly a 4-digit number' });
  }

  try {
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id, email: normalizedEmail }
      : { email: normalizedEmail };

    const registration = await DoctorRegistration.findOne(query);

    if (!registration) {
      return res.status(404).json({ message: 'Doctor registration not found for the provided details' });
    }

    if (registration.status !== 'verified') {
      return res.status(400).json({ message: 'Please complete OTP verification before setting up your MPIN' });
    }

    // Hash the MPIN using SHA-256 for data protection
    const hashed = crypto.createHash('sha256').update(mpin).digest('hex');
    registration.mpin = hashed;
    await registration.save();

    return res.status(200).json({
      id: registration._id,
      status: registration.status,
      message: 'MPIN configured successfully'
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Unable to set MPIN',
      details: error.message
    });
  }
});


app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
