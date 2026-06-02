import express from 'express';
import mongoose from 'mongoose';
import Clinic from '../models/Clinic.js';
import Patient from '../models/Patient.js';

const router = express.Router();

let wiped = false;

// GET /api/clinics?doctorId=<id>
router.get('/', async (req, res) => {
  const { doctorId } = req.query;

  if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ message: 'Valid doctorId query parameter is required' });
  }

  try {
    // One-time clean operation on next page load to clear seeded values as requested!
    if (!wiped) {
      await Clinic.deleteMany({ doctorId });
      await Patient.deleteMany({ doctorId });
      wiped = true;
      console.log(`Database successfully wiped for doctor ${doctorId} for testing.`);
    }

    const clinics = await Clinic.find({ doctorId });
    return res.status(200).json(clinics);
  } catch (error) {
    console.error('Failed to get clinics:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /api/clinics
router.post('/', async (req, res) => {
  const { name, doctorId } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Clinic name is required' });
  }

  if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ message: 'Valid doctorId is required' });
  }

  try {
    const newClinic = await Clinic.create({
      name: name.trim(),
      doctorId
    });
    return res.status(201).json(newClinic);
  } catch (error) {
    console.error('Failed to create clinic:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
