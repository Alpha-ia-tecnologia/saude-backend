import express from 'express';
import { nursingService } from '../services/nursing.service.js';

const router = express.Router();

/**
 * GET /api/nursing/patients
 * List all patients with active prescriptions
 */
router.get('/patients', (req, res) => {
    try {
        const patients = nursingService.getPatients();
        res.json({ success: true, data: patients });
    } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar pacientes' });
    }
});

/**
 * GET /api/nursing/prescriptions/:patientId
 * Get active prescriptions for a patient
 */
router.get('/prescriptions/:patientId', (req, res) => {
    try {
        const { patientId } = req.params;
        const prescriptions = nursingService.getPrescriptionsByPatient(patientId);
        res.json({ success: true, data: prescriptions });
    } catch (error) {
        console.error('Erro ao buscar prescrições:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar prescrições' });
    }
});

/**
 * POST /api/nursing/schedule
 * Create medication schedule (aprazamento)
 */
router.post('/schedule', (req, res) => {
    try {
        const { prescriptionId, patientId, horarios, criadoPor } = req.body;

        if (!prescriptionId) {
            return res.status(400).json({
                success: false,
                error: 'ID da prescrição é obrigatório'
            });
        }

        const schedule = nursingService.createSchedule({
            prescriptionId,
            patientId,
            horarios,
            criadoPor
        });

        res.json({ success: true, data: schedule });
    } catch (error) {
        console.error('Erro ao criar aprazamento:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao criar aprazamento' });
    }
});

/**
 * GET /api/nursing/schedule/:patientId
 * Get patient's medication schedule
 */
router.get('/schedule/:patientId', (req, res) => {
    try {
        const { patientId } = req.params;
        const schedules = nursingService.getSchedulesByPatient(patientId);
        res.json({ success: true, data: schedules });
    } catch (error) {
        console.error('Erro ao buscar aprazamento:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar aprazamento' });
    }
});

/**
 * GET /api/nursing/pending
 * Get all pending medications (due now or overdue)
 */
router.get('/pending', (req, res) => {
    try {
        const pending = nursingService.getPendingMedications();
        res.json({ success: true, data: pending });
    } catch (error) {
        console.error('Erro ao buscar medicações pendentes:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar medicações pendentes' });
    }
});

/**
 * POST /api/nursing/check
 * Record medication administration (checagem)
 */
router.post('/check', (req, res) => {
    try {
        const {
            scheduleId,
            prescriptionId,
            patientId,
            medicamento,
            dose,
            via,
            horarioPrevisto,
            horarioReal,
            data,
            responsavel,
            observacoes
        } = req.body;

        if (!scheduleId || !patientId || !medicamento) {
            return res.status(400).json({
                success: false,
                error: 'scheduleId, patientId e medicamento são obrigatórios'
            });
        }

        const check = nursingService.checkMedication({
            scheduleId,
            prescriptionId,
            patientId,
            medicamento,
            dose,
            via,
            horarioPrevisto,
            horarioReal,
            data,
            responsavel,
            observacoes
        });

        res.json({ success: true, data: check });
    } catch (error) {
        console.error('Erro ao registrar checagem:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao registrar checagem' });
    }
});

/**
 * GET /api/nursing/checks/:patientId
 * Get medication check history
 */
router.get('/checks/:patientId', (req, res) => {
    try {
        const { patientId } = req.params;
        const checksData = nursingService.getChecks(patientId);
        res.json({ success: true, data: checksData });
    } catch (error) {
        console.error('Erro ao buscar checagens:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar checagens' });
    }
});

/**
 * GET /api/nursing/checks
 * Get all medication check history
 */
router.get('/checks', (req, res) => {
    try {
        const checksData = nursingService.getChecks();
        res.json({ success: true, data: checksData });
    } catch (error) {
        console.error('Erro ao buscar checagens:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar checagens' });
    }
});

/**
 * GET /api/nursing/suggest-times/:intervalHours
 * Suggest times based on frequency interval
 */
router.get('/suggest-times/:intervalHours', (req, res) => {
    try {
        const intervalHours = parseInt(req.params.intervalHours, 10);
        if (isNaN(intervalHours) || intervalHours <= 0) {
            return res.status(400).json({ success: false, error: 'Intervalo inválido' });
        }
        const times = nursingService.suggestTimes(intervalHours);
        res.json({ success: true, data: times });
    } catch (error) {
        console.error('Erro ao sugerir horários:', error);
        res.status(500).json({ success: false, error: 'Erro ao sugerir horários' });
    }
});

export default router;
