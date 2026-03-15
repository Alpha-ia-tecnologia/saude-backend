import express from 'express';
import { pharmacyService } from '../services/pharmacy.service.js';

const router = express.Router();

/**
 * GET /api/pharmacy/inventory
 * Get full inventory with lot details
 */
router.get('/inventory', (req, res) => {
    try {
        const inventory = pharmacyService.getInventory();
        res.json({ success: true, data: inventory });
    } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar estoque' });
    }
});

/**
 * GET /api/pharmacy/medications
 * Get medications catalog (for selectors)
 */
router.get('/medications', (req, res) => {
    try {
        const medications = pharmacyService.getMedications();
        res.json({ success: true, data: medications });
    } catch (error) {
        console.error('Erro ao buscar medicamentos:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar medicamentos' });
    }
});

/**
 * POST /api/pharmacy/lots
 * Add new lot to inventory
 */
router.post('/lots', (req, res) => {
    try {
        const { medicationId, lote, validade, quantidade, fabricante } = req.body;

        if (!medicationId || !lote || !validade || !quantidade) {
            return res.status(400).json({
                success: false,
                error: 'medicationId, lote, validade e quantidade são obrigatórios'
            });
        }

        const newLot = pharmacyService.addLot({ medicationId, lote, validade, quantidade, fabricante });
        res.json({ success: true, data: newLot });
    } catch (error) {
        console.error('Erro ao adicionar lote:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao adicionar lote' });
    }
});

/**
 * GET /api/pharmacy/lots/:medicationId
 * Get lots for a specific medication
 */
router.get('/lots/:medicationId', (req, res) => {
    try {
        const { medicationId } = req.params;
        const medLots = pharmacyService.getLotsByMedication(medicationId);
        res.json({ success: true, data: medLots });
    } catch (error) {
        console.error('Erro ao buscar lotes:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar lotes' });
    }
});

/**
 * GET /api/pharmacy/expiring
 * Get medications near expiry
 */
router.get('/expiring', (req, res) => {
    try {
        const days = parseInt(req.query.days, 10) || 90;
        const expiring = pharmacyService.getExpiringMedications(days);
        res.json({ success: true, data: expiring });
    } catch (error) {
        console.error('Erro ao buscar medicamentos vencendo:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar medicamentos vencendo' });
    }
});

/**
 * POST /api/pharmacy/dispense
 * Record dispensation (FIFO)
 */
router.post('/dispense', (req, res) => {
    try {
        const { medicationId, quantidade, paciente, responsavel } = req.body;

        if (!medicationId || !quantidade) {
            return res.status(400).json({
                success: false,
                error: 'medicationId e quantidade são obrigatórios'
            });
        }

        const dispensed = pharmacyService.dispenseMedication({ medicationId, quantidade, paciente, responsavel });
        res.json({ success: true, data: dispensed });
    } catch (error) {
        console.error('Erro ao dispensar medicamento:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao dispensar medicamento' });
    }
});

/**
 * GET /api/pharmacy/prescriptions/pending
 * Get pending prescriptions to separate
 */
router.get('/prescriptions/pending', (req, res) => {
    try {
        const pending = pharmacyService.getPendingPrescriptions();
        res.json({ success: true, data: pending });
    } catch (error) {
        console.error('Erro ao buscar prescrições pendentes:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar prescrições pendentes' });
    }
});

/**
 * GET /api/pharmacy/prescriptions
 * Get all prescriptions
 */
router.get('/prescriptions', (req, res) => {
    try {
        const all = pharmacyService.getAllPrescriptions();
        res.json({ success: true, data: all });
    } catch (error) {
        console.error('Erro ao buscar prescrições:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar prescrições' });
    }
});

/**
 * POST /api/pharmacy/prescriptions
 * Receive a new prescription (prescription explosion)
 */
router.post('/prescriptions', (req, res) => {
    try {
        const { paciente, prontuario, medico, itens } = req.body;

        if (!paciente || !medico || !itens || !itens.length) {
            return res.status(400).json({
                success: false,
                error: 'paciente, medico e itens são obrigatórios'
            });
        }

        const prescription = pharmacyService.receivePrescription({ paciente, prontuario, medico, itens });
        res.json({ success: true, data: prescription });
    } catch (error) {
        console.error('Erro ao receber prescrição:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao receber prescrição' });
    }
});

/**
 * POST /api/pharmacy/prescriptions/:id/separate
 * Mark items as separated in a prescription
 */
router.post('/prescriptions/:id/separate', (req, res) => {
    try {
        const { id } = req.params;
        const { separatedItemIndexes } = req.body;

        const prescription = pharmacyService.separateItems(id, separatedItemIndexes);
        res.json({ success: true, data: prescription });
    } catch (error) {
        console.error('Erro ao separar prescrição:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao separar prescrição' });
    }
});

/**
 * POST /api/pharmacy/prescriptions/:id/dispense
 * Mark prescription as dispensed
 */
router.post('/prescriptions/:id/dispense', (req, res) => {
    try {
        const { id } = req.params;
        const { responsavel } = req.body;

        const prescription = pharmacyService.dispensePrescription(id, responsavel);
        res.json({ success: true, data: prescription });
    } catch (error) {
        console.error('Erro ao dispensar prescrição:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao dispensar prescrição' });
    }
});

/**
 * GET /api/pharmacy/dispensations
 * Get dispensation history
 */
router.get('/dispensations', (req, res) => {
    try {
        const dispensations = pharmacyService.getDispensations();
        res.json({ success: true, data: dispensations });
    } catch (error) {
        console.error('Erro ao buscar dispensações:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar dispensações' });
    }
});

export default router;
