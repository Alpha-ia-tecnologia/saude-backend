import express from 'express';
import { reconciliationService } from '../services/reconciliation.service.js';

const router = express.Router();

/**
 * POST /api/reconciliation/continuous-meds
 * RF16 - Register continuous medications for a patient
 */
router.post('/continuous-meds', async (req, res) => {
    try {
        const { patientId, patientName, medications } = req.body;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                error: 'ID do paciente é obrigatório'
            });
        }

        if (!medications || !Array.isArray(medications) || medications.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'É necessário informar ao menos um medicamento'
            });
        }

        const result = await reconciliationService.registerContinuousMedications(patientId, patientName, medications);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Erro ao registrar medicamentos contínuos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao registrar medicamentos contínuos'
        });
    }
});

/**
 * GET /api/reconciliation/continuous-meds/:patientId
 * RF16 - Get patient's continuous medications
 */
router.get('/continuous-meds/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;

        const patient = await reconciliationService.getContinuousMedications(patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                error: 'Paciente não encontrado'
            });
        }

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error('Erro ao buscar medicamentos contínuos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar medicamentos contínuos'
        });
    }
});

/**
 * GET /api/reconciliation/patients
 * List all patients with continuous medications
 */
router.get('/patients', async (req, res) => {
    try {
        const patients = await reconciliationService.getAllPatients();

        res.json({
            success: true,
            data: patients
        });
    } catch (error) {
        console.error('Erro ao listar pacientes:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao listar pacientes'
        });
    }
});

/**
 * DELETE /api/reconciliation/continuous-meds/:patientId/:medicationId
 * Remove a medication from patient's continuous list
 */
router.delete('/continuous-meds/:patientId/:medicationId', async (req, res) => {
    try {
        const { patientId, medicationId } = req.params;

        const result = await reconciliationService.removeMedication(patientId, parseInt(medicationId));

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Paciente ou medicamento não encontrado'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Erro ao remover medicamento:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao remover medicamento'
        });
    }
});

/**
 * PUT /api/reconciliation/continuous-meds/:patientId/:medicationId
 * Update a medication in patient's continuous list
 */
router.put('/continuous-meds/:patientId/:medicationId', async (req, res) => {
    try {
        const { patientId, medicationId } = req.params;
        const updates = req.body;

        const result = await reconciliationService.updateMedication(patientId, parseInt(medicationId), updates);

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Paciente ou medicamento não encontrado'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Erro ao atualizar medicamento:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar medicamento'
        });
    }
});

/**
 * POST /api/reconciliation/reconcile
 * RF17 - Run reconciliation against new prescription
 */
router.post('/reconcile', async (req, res) => {
    try {
        const { patientId, newPrescription } = req.body;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                error: 'ID do paciente é obrigatório'
            });
        }

        if (!newPrescription || !Array.isArray(newPrescription) || newPrescription.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'É necessário informar ao menos um medicamento na nova prescrição'
            });
        }

        const result = await reconciliationService.reconcile(patientId, newPrescription);

        if (result.error) {
            return res.status(404).json({
                success: false,
                error: result.error
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Erro na reconciliação:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao realizar reconciliação medicamentosa'
        });
    }
});

/**
 * POST /api/reconciliation/check-interactions
 * RF18 - Check for drug interactions among a list of medications
 */
router.post('/check-interactions', async (req, res) => {
    try {
        const { medications } = req.body;

        if (!medications || !Array.isArray(medications) || medications.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'É necessário informar ao menos dois medicamentos para verificar interações'
            });
        }

        const result = await reconciliationService.checkInteractions(medications);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Erro ao verificar interações:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao verificar interações medicamentosas'
        });
    }
});

export default router;
