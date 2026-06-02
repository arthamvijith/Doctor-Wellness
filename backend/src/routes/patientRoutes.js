import express from 'express';
import mongoose from 'mongoose';
import Patient from '../models/Patient.js';

const router = express.Router();

// GET /api/patients?doctorId=<id>&clinicId=<clinicId>
router.get('/', async (req, res) => {
  const { doctorId, clinicId } = req.query;

  if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ message: 'Valid doctorId query parameter is required' });
  }

  try {
    const filter = { doctorId };

    // If clinicId is passed and is a valid ObjectId, filter by it
    if (clinicId && mongoose.Types.ObjectId.isValid(clinicId)) {
      filter.clinicId = clinicId;
    }

    const patients = await Patient.find(filter).sort({ createdAt: 1 });
    return res.status(200).json(patients);
  } catch (error) {
    console.error('Failed to retrieve patients:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST /api/patients
router.post('/', async (req, res) => {
  const { name, age, gender, reason, time, clinicId, doctorId, status } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ message: 'Patient name is required' });
  if (!age || isNaN(age)) return res.status(400).json({ message: 'Valid patient age is required' });
  if (!gender) return res.status(400).json({ message: 'Gender is required' });
  if (!reason || !reason.trim()) return res.status(400).json({ message: 'Reason for consultation is required' });
  if (!time || !time.trim()) return res.status(400).json({ message: 'Consultation time is required' });
  
  if (!clinicId || !mongoose.Types.ObjectId.isValid(clinicId)) {
    return res.status(400).json({ message: 'Valid clinicId is required' });
  }
  
  if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
    return res.status(400).json({ message: 'Valid doctorId is required' });
  }

  try {
    const newPatient = await Patient.create({
      name: name.trim(),
      age: Number(age),
      gender,
      reason: reason.trim(),
      time: time.trim(),
      status: status || 'Waiting',
      clinicId,
      doctorId
    });

    return res.status(201).json(newPatient);
  } catch (error) {
    console.error('Failed to create patient:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// PUT /api/patients/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, age, gender, reason, time, status, clinicId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid patient ID' });
  }

  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (age !== undefined) updateData.age = Number(age);
    if (gender !== undefined) updateData.gender = gender;
    if (reason !== undefined) updateData.reason = reason.trim();
    if (time !== undefined) updateData.time = time.trim();
    if (status !== undefined) updateData.status = status;
    if (clinicId !== undefined && mongoose.Types.ObjectId.isValid(clinicId)) {
      updateData.clinicId = clinicId;
    }

    const updatedPatient = await Patient.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    return res.status(200).json(updatedPatient);
  } catch (error) {
    console.error('Failed to update patient:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// DELETE /api/patients/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid patient ID' });
  }

  try {
    const deletedPatient = await Patient.findByIdAndDelete(id);

    if (!deletedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    return res.status(200).json({ message: 'Patient deleted successfully', id });
  } catch (error) {
    console.error('Failed to delete patient:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
