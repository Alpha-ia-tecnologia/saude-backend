import express from 'express';
import { clinicalDecisionService } from '../services/clinical-decision.service.js';

const router = express.Router();

/**
 * POST /api/clinical-decision/analyze
 * Analyze symptoms and return possible diagnoses (with optional AI enhancement)
 */
router.post('/analyze', async (req, res) => {
    try {
        const { symptoms, patientData, useAI = true } = req.body;

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'É necessário informar ao menos um sintoma'
            });
        }

        // Use AI-enhanced analysis if available and requested
        let analysis;
        if (useAI) {
            analysis = await clinicalDecisionService.analyzeSymptomsWithAI(symptoms, patientData || {});
        } else {
            analysis = clinicalDecisionService.analyzeSymptoms(symptoms, patientData || {});
        }

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Erro na análise de sintomas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao analisar sintomas'
        });
    }
});

/**
 * POST /api/clinical-decision/ai-insights
 * Generate AI-powered insights using DeepSeek
 */
router.post('/ai-insights', async (req, res) => {
    try {
        const { symptoms, patientData, diagnoses } = req.body;

        // Use the new AI-enhanced insights method from the service
        const insights = await clinicalDecisionService.generateInsightsWithAI(
            patientData || {},
            symptoms || [],
            diagnoses || []
        );

        res.json({
            success: true,
            data: insights
        });
    } catch (error) {
        console.error('Erro ao gerar insights:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao gerar insights de IA'
        });
    }
});

/**
 * GET /api/clinical-decision/recommendations/:diagnosis
 * Get detailed recommendations for a specific diagnosis (rule-based)
 */
router.get('/recommendations/:diagnosis', async (req, res) => {
    try {
        const { diagnosis } = req.params;

        if (!diagnosis) {
            return res.status(400).json({
                success: false,
                error: 'Diagnóstico não informado'
            });
        }

        const recommendations = clinicalDecisionService.getRecommendations(decodeURIComponent(diagnosis));

        res.json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        console.error('Erro ao buscar recomendações:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar recomendações'
        });
    }
});

/**
 * POST /api/clinical-decision/recommendations
 * Get AI-powered detailed recommendations for a specific diagnosis
 */
router.post('/recommendations', async (req, res) => {
    try {
        const { diagnosis, patientData } = req.body;

        if (!diagnosis) {
            return res.status(400).json({
                success: false,
                error: 'Diagnóstico não informado'
            });
        }

        const recommendations = await clinicalDecisionService.getRecommendationsWithAI(
            diagnosis,
            patientData || {}
        );

        res.json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        console.error('Erro ao buscar recomendações com IA:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar recomendações'
        });
    }
});

export default router;

