import express from 'express';
import { acsService } from '../services/acs.service.js';

const router = express.Router();

/**
 * GET /api/acs/microareas
 * List microareas with ACS assignments and stats
 */
router.get('/microareas', (req, res) => {
    try {
        const microareas = acsService.getMicroareas();
        res.json({ success: true, data: microareas });
    } catch (error) {
        console.error('Erro ao buscar microáreas:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar microáreas' });
    }
});

/**
 * GET /api/acs/families
 * List families with filters (microareaId, vulnerabilidade, search)
 */
router.get('/families', (req, res) => {
    try {
        const { microareaId, vulnerabilidade, search } = req.query;
        const families = acsService.getFamilies({ microareaId, vulnerabilidade, search });
        res.json({ success: true, data: families });
    } catch (error) {
        console.error('Erro ao buscar famílias:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar famílias' });
    }
});

/**
 * POST /api/acs/families
 * Register new family
 */
router.post('/families', (req, res) => {
    try {
        const family = acsService.registerFamily(req.body);
        res.status(201).json({ success: true, data: family });
    } catch (error) {
        console.error('Erro ao cadastrar família:', error);
        res.status(500).json({ success: false, error: 'Erro ao cadastrar família' });
    }
});

/**
 * GET /api/acs/families/:id
 * Get family details with individuals and microarea
 */
router.get('/families/:id', (req, res) => {
    try {
        const family = acsService.getFamilyById(req.params.id);
        if (!family) {
            return res.status(404).json({ success: false, error: 'Família não encontrada' });
        }
        res.json({ success: true, data: family });
    } catch (error) {
        console.error('Erro ao buscar família:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar família' });
    }
});

/**
 * GET /api/acs/risk-stratification
 * Get risk stratification for individuals
 */
router.get('/risk-stratification', (req, res) => {
    try {
        const { familiaId, microareaId, categoria, nivel } = req.query;
        const result = acsService.stratifyRisk({ familiaId, microareaId, categoria, nivel });
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Erro na estratificação de risco:', error);
        res.status(500).json({ success: false, error: 'Erro na estratificação de risco' });
    }
});

/**
 * GET /api/acs/alerts
 * Get active search alerts
 */
router.get('/alerts', (req, res) => {
    try {
        const { tipo, urgencia, microareaId } = req.query;
        const alertsList = acsService.getAlerts({ tipo, urgencia, microareaId });
        res.json({ success: true, data: alertsList });
    } catch (error) {
        console.error('Erro ao buscar alertas:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar alertas' });
    }
});

/**
 * POST /api/acs/alerts/:id/resolve
 * Mark alert as resolved
 */
router.post('/alerts/:id/resolve', (req, res) => {
    try {
        const alert = acsService.resolveAlert(req.params.id);
        if (!alert) {
            return res.status(404).json({ success: false, error: 'Alerta não encontrado' });
        }
        res.json({ success: true, data: alert });
    } catch (error) {
        console.error('Erro ao resolver alerta:', error);
        res.status(500).json({ success: false, error: 'Erro ao resolver alerta' });
    }
});

/**
 * GET /api/acs/visits
 * Get visits schedule
 */
router.get('/visits', (req, res) => {
    try {
        const { status, acsId, data, tipo } = req.query;
        const visitsList = acsService.getVisits({ status, acsId, data, tipo });
        res.json({ success: true, data: visitsList });
    } catch (error) {
        console.error('Erro ao buscar visitas:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar visitas' });
    }
});

/**
 * POST /api/acs/visits
 * Schedule or record a visit
 */
router.post('/visits', (req, res) => {
    try {
        const visit = acsService.scheduleVisit(req.body);
        res.status(201).json({ success: true, data: visit });
    } catch (error) {
        console.error('Erro ao agendar visita:', error);
        res.status(500).json({ success: false, error: 'Erro ao agendar visita' });
    }
});

/**
 * POST /api/acs/visits/:id/record
 * Record visit outcome
 */
router.post('/visits/:id/record', (req, res) => {
    try {
        const visit = acsService.recordVisit(req.params.id, req.body);
        if (!visit) {
            return res.status(404).json({ success: false, error: 'Visita não encontrada' });
        }
        res.json({ success: true, data: visit });
    } catch (error) {
        console.error('Erro ao registrar visita:', error);
        res.status(500).json({ success: false, error: 'Erro ao registrar visita' });
    }
});

/**
 * GET /api/acs/care-lines
 * Get care lines dashboard (MACC)
 */
router.get('/care-lines', (req, res) => {
    try {
        const lines = acsService.getCareLines();
        res.json({ success: true, data: lines });
    } catch (error) {
        console.error('Erro ao buscar linhas de cuidado:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar linhas de cuidado' });
    }
});

/**
 * POST /api/acs/referral
 * Send alert/referral to nurse or doctor (RF30)
 */
router.post('/referral', (req, res) => {
    try {
        const referral = acsService.sendAlert(req.body);
        res.status(201).json({ success: true, data: referral });
    } catch (error) {
        console.error('Erro ao enviar encaminhamento:', error);
        res.status(500).json({ success: false, error: 'Erro ao enviar encaminhamento' });
    }
});

export default router;
