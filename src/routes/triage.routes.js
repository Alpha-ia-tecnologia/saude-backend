import express from 'express';
import { triageService } from '../services/triage.service.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { patientName, patientAge, patientCNS, patientId, vitalSigns, symptoms, mainComplaint, registeredBy } = req.body;

        if (!patientName) {
            return res.status(400).json({ success: false, error: 'Nome do paciente e obrigatorio' });
        }
        if (!vitalSigns) {
            return res.status(400).json({ success: false, error: 'Sinais vitais sao obrigatorios' });
        }

        const triageEntry = await triageService.addToQueue({
            patientId, patientName, patientAge, patientCNS,
            vitalSigns, symptoms: symptoms || [],
            mainComplaint: mainComplaint || '',
            registeredBy: registeredBy || 'Sistema'
        });

        res.status(201).json({ success: true, data: triageEntry });
    } catch (error) {
        console.error('Erro ao registrar triagem:', error);
        res.status(500).json({ success: false, error: 'Erro ao registrar triagem' });
    }
});

router.get('/queue', async (req, res) => {
    try {
        const { status } = req.query;
        const queue = await triageService.getQueue(status || null);
        res.json({ success: true, data: queue, total: queue.length });
    } catch (error) {
        console.error('Erro ao buscar fila de triagem:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar fila de triagem' });
    }
});

router.get('/patient/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const triage = await triageService.getPatientTriage(id);
        if (!triage) {
            return res.status(404).json({ success: false, error: 'Triagem nao encontrada' });
        }
        res.json({ success: true, data: triage });
    } catch (error) {
        console.error('Erro ao buscar triagem do paciente:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar triagem do paciente' });
    }
});

router.put('/patient/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await triageService.updateTriage(id, req.body);
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Triagem nao encontrada' });
        }
        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('Erro ao atualizar triagem:', error);
        res.status(500).json({ success: false, error: 'Erro ao atualizar triagem' });
    }
});

router.get('/alerts', async (req, res) => {
    try {
        const alerts = await triageService.getAlerts();
        res.json({ success: true, data: alerts, total: alerts.length });
    } catch (error) {
        console.error('Erro ao buscar alertas de triagem:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar alertas' });
    }
});

export default router;
