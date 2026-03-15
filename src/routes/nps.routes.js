import { Router } from 'express';
import npsService from '../services/nps.service.js';

const router = Router();

// POST /api/nps/survey - Submit NPS survey
router.post('/survey', (req, res) => {
    try {
        const { pacienteNome, score, category, comment } = req.body;

        if (score === undefined || score === null) {
            return res.status(400).json({ error: 'Score e obrigatorio (0-10)' });
        }

        const parsedScore = parseInt(score);
        if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 10) {
            return res.status(400).json({ error: 'Score deve ser um numero entre 0 e 10' });
        }

        if (!category) {
            return res.status(400).json({ error: 'Categoria e obrigatoria' });
        }

        const survey = npsService.submitSurvey({ pacienteNome, score: parsedScore, category, comment });
        res.status(201).json({ success: true, survey });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar pesquisa NPS', message: error.message });
    }
});

// GET /api/nps/score - Get current NPS score with breakdown
router.get('/score', (req, res) => {
    try {
        const score = npsService.getNPSScore();
        res.json({ success: true, data: score });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao calcular NPS', message: error.message });
    }
});

// GET /api/nps/trend - Get NPS trend over months
router.get('/trend', (req, res) => {
    try {
        const trend = npsService.getNPSTrend();
        res.json({ success: true, data: trend });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter tendencia NPS', message: error.message });
    }
});

// GET /api/nps/surveys - List all surveys with filters
router.get('/surveys', (req, res) => {
    try {
        const { category, classification, startDate, endDate } = req.query;
        const surveys = npsService.getSurveys({ category, classification, startDate, endDate });
        res.json({ success: true, data: surveys, total: surveys.length });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar pesquisas', message: error.message });
    }
});

// GET /api/nps/categories - Get NPS by category/department
router.get('/categories', (req, res) => {
    try {
        const byCategory = npsService.getNPSByCategory();
        res.json({ success: true, data: byCategory });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter NPS por categoria', message: error.message });
    }
});

export default router;
