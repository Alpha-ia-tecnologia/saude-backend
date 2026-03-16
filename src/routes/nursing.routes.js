import express from 'express';
import { nursingService } from '../services/nursing.service.js';

const router = express.Router();

router.get('/patients', async (req, res) => {
    try {
        const patients = await nursingService.getPatients();
        res.json({ success: true, data: patients });
    } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar pacientes' });
    }
});

router.get('/prescriptions/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const prescriptions = await nursingService.getPrescriptionsByPatient(patientId);
        res.json({ success: true, data: prescriptions });
    } catch (error) {
        console.error('Erro ao buscar prescrições:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar prescrições' });
    }
});

router.post('/schedule', async (req, res) => {
    try {
        const { prescriptionId, patientId, horarios, criadoPor } = req.body;
        if (!prescriptionId) {
            return res.status(400).json({ success: false, error: 'ID da prescrição é obrigatório' });
        }
        const schedule = await nursingService.createSchedule({ prescriptionId, patientId, horarios, criadoPor });
        res.json({ success: true, data: schedule });
    } catch (error) {
        console.error('Erro ao criar aprazamento:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao criar aprazamento' });
    }
});

router.get('/schedule/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const schedules = await nursingService.getSchedulesByPatient(patientId);
        res.json({ success: true, data: schedules });
    } catch (error) {
        console.error('Erro ao buscar aprazamento:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar aprazamento' });
    }
});

router.get('/pending', async (req, res) => {
    try {
        const pending = await nursingService.getPendingMedications();
        res.json({ success: true, data: pending });
    } catch (error) {
        console.error('Erro ao buscar medicações pendentes:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar medicações pendentes' });
    }
});

router.post('/check', async (req, res) => {
    try {
        const { scheduleId, prescriptionId, patientId, medicamento, dose, via, horarioPrevisto, horarioReal, data, responsavel, observacoes } = req.body;
        if (!scheduleId || !patientId || !medicamento) {
            return res.status(400).json({ success: false, error: 'scheduleId, patientId e medicamento são obrigatórios' });
        }
        const check = await nursingService.checkMedication({ scheduleId, prescriptionId, patientId, medicamento, dose, via, horarioPrevisto, horarioReal, data, responsavel, observacoes });
        res.json({ success: true, data: check });
    } catch (error) {
        console.error('Erro ao registrar checagem:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao registrar checagem' });
    }
});

router.get('/checks/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const checksData = await nursingService.getChecks(patientId);
        res.json({ success: true, data: checksData });
    } catch (error) {
        console.error('Erro ao buscar checagens:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar checagens' });
    }
});

router.get('/checks', async (req, res) => {
    try {
        const checksData = await nursingService.getChecks();
        res.json({ success: true, data: checksData });
    } catch (error) {
        console.error('Erro ao buscar checagens:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar checagens' });
    }
});

router.get('/suggest-times/:intervalHours', async (req, res) => {
    try {
        const intervalHours = parseInt(req.params.intervalHours, 10);
        if (isNaN(intervalHours) || intervalHours <= 0) {
            return res.status(400).json({ success: false, error: 'Intervalo inválido' });
        }
        const times = await nursingService.suggestTimes(intervalHours);
        res.json({ success: true, data: times });
    } catch (error) {
        console.error('Erro ao sugerir horários:', error);
        res.status(500).json({ success: false, error: 'Erro ao sugerir horários' });
    }
});

export default router;
