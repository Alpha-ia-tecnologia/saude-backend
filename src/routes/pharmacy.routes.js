import express from 'express';
import { pharmacyService } from '../services/pharmacy.service.js';

const router = express.Router();

router.get('/inventory', async (req, res) => {
    try {
        const inventory = await pharmacyService.getInventory();
        res.json({ success: true, data: inventory });
    } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar estoque' });
    }
});

router.get('/medications', async (req, res) => {
    try {
        const medications = await pharmacyService.getMedications();
        res.json({ success: true, data: medications });
    } catch (error) {
        console.error('Erro ao buscar medicamentos:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar medicamentos' });
    }
});

router.post('/lots', async (req, res) => {
    try {
        const { medicationId, lote, validade, quantidade, fabricante } = req.body;
        if (!medicationId || !lote || !validade || !quantidade) {
            return res.status(400).json({ success: false, error: 'medicationId, lote, validade e quantidade são obrigatórios' });
        }
        const newLot = await pharmacyService.addLot({ medicationId, lote, validade, quantidade, fabricante });
        res.json({ success: true, data: newLot });
    } catch (error) {
        console.error('Erro ao adicionar lote:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao adicionar lote' });
    }
});

router.get('/lots/:medicationId', async (req, res) => {
    try {
        const { medicationId } = req.params;
        const medLots = await pharmacyService.getLotsByMedication(medicationId);
        res.json({ success: true, data: medLots });
    } catch (error) {
        console.error('Erro ao buscar lotes:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar lotes' });
    }
});

router.get('/expiring', async (req, res) => {
    try {
        const days = parseInt(req.query.days, 10) || 90;
        const expiring = await pharmacyService.getExpiringMedications(days);
        res.json({ success: true, data: expiring });
    } catch (error) {
        console.error('Erro ao buscar medicamentos vencendo:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar medicamentos vencendo' });
    }
});

router.post('/dispense', async (req, res) => {
    try {
        const { medicationId, quantidade, paciente, responsavel } = req.body;
        if (!medicationId || !quantidade) {
            return res.status(400).json({ success: false, error: 'medicationId e quantidade são obrigatórios' });
        }
        const dispensed = await pharmacyService.dispenseMedication({ medicationId, quantidade, paciente, responsavel });
        res.json({ success: true, data: dispensed });
    } catch (error) {
        console.error('Erro ao dispensar medicamento:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao dispensar medicamento' });
    }
});

router.get('/prescriptions/pending', async (req, res) => {
    try {
        const pending = await pharmacyService.getPendingPrescriptions();
        res.json({ success: true, data: pending });
    } catch (error) {
        console.error('Erro ao buscar prescrições pendentes:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar prescrições pendentes' });
    }
});

router.get('/prescriptions', async (req, res) => {
    try {
        const all = await pharmacyService.getAllPrescriptions();
        res.json({ success: true, data: all });
    } catch (error) {
        console.error('Erro ao buscar prescrições:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar prescrições' });
    }
});

router.post('/prescriptions', async (req, res) => {
    try {
        const { paciente, prontuario, medico, itens } = req.body;
        if (!paciente || !medico || !itens || !itens.length) {
            return res.status(400).json({ success: false, error: 'paciente, medico e itens são obrigatórios' });
        }
        const prescription = await pharmacyService.receivePrescription({ paciente, prontuario, medico, itens });
        res.json({ success: true, data: prescription });
    } catch (error) {
        console.error('Erro ao receber prescrição:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao receber prescrição' });
    }
});

router.post('/prescriptions/:id/separate', async (req, res) => {
    try {
        const { id } = req.params;
        const { separatedItemIndexes } = req.body;
        const prescription = await pharmacyService.separateItems(id, separatedItemIndexes);
        res.json({ success: true, data: prescription });
    } catch (error) {
        console.error('Erro ao separar prescrição:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao separar prescrição' });
    }
});

router.post('/prescriptions/:id/dispense', async (req, res) => {
    try {
        const { id } = req.params;
        const { responsavel } = req.body;
        const prescription = await pharmacyService.dispensePrescription(id, responsavel);
        res.json({ success: true, data: prescription });
    } catch (error) {
        console.error('Erro ao dispensar prescrição:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao dispensar prescrição' });
    }
});

router.get('/dispensations', async (req, res) => {
    try {
        const dispensations = await pharmacyService.getDispensations();
        res.json({ success: true, data: dispensations });
    } catch (error) {
        console.error('Erro ao buscar dispensações:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar dispensações' });
    }
});

export default router;
