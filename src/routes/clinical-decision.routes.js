import express from 'express';
import { clinicalDecisionService } from '../services/clinical-decision.service.js';
import { openaiService, geminiService, deepseekService } from '../services/index.js';

const router = express.Router();

/**
 * POST /api/clinical-decision/analyze
 * Analyze symptoms and return possible diagnoses
 */
router.post('/analyze', async (req, res) => {
    try {
        const { symptoms, patientData } = req.body;

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'É necessário informar ao menos um sintoma'
            });
        }

        const analysis = clinicalDecisionService.analyzeSymptoms(symptoms, patientData || {});

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
 * Generate AI-powered insights using configured providers
 */
router.post('/ai-insights', async (req, res) => {
    try {
        const { symptoms, patientData, diagnoses, provider = 'deepseek' } = req.body;

        // First, get rule-based insights
        const ruleBasedInsights = clinicalDecisionService.generateInsights(
            patientData || {},
            symptoms || [],
            diagnoses || []
        );

        // Try to enhance with AI provider
        let aiEnhanced = false;
        let aiResponse = null;

        const prompt = buildAIPrompt(symptoms, patientData, diagnoses);

        try {
            let service;
            switch (provider) {
                case 'gemini':
                    service = geminiService;
                    break;
                case 'deepseek':
                    service = deepseekService;
                    break;
                default:
                    service = openaiService;
            }

            if (service.isConfigured()) {
                const messages = [
                    { role: 'system', content: 'Você é um assistente médico especializado em apoio à decisão clínica. Forneça análises baseadas em evidências, sempre lembrando que a decisão final é do profissional de saúde.' },
                    { role: 'user', content: prompt }
                ];

                aiResponse = await service.chat(messages);
                aiEnhanced = true;
            }
        } catch (aiError) {
            console.error('AI provider error:', aiError);
            // Continue with rule-based insights only
        }

        res.json({
            success: true,
            data: {
                ...ruleBasedInsights,
                aiAnalysis: aiResponse?.content || null,
                aiEnhanced,
                provider: aiEnhanced ? provider : null
            }
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
 * Get detailed recommendations for a specific diagnosis
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
 * Build AI prompt for clinical insights
 */
function buildAIPrompt(symptoms, patientData, diagnoses) {
    let prompt = 'Analise o seguinte caso clínico e forneça insights:\n\n';

    if (patientData) {
        prompt += '**Dados do Paciente:**\n';
        if (patientData.age) prompt += `- Idade: ${patientData.age} anos\n`;
        if (patientData.sex) prompt += `- Sexo: ${patientData.sex}\n`;
        if (patientData.conditions?.length) prompt += `- Condições pré-existentes: ${patientData.conditions.join(', ')}\n`;
        if (patientData.allergies?.length) prompt += `- Alergias: ${patientData.allergies.join(', ')}\n`;
        if (patientData.medications?.length) prompt += `- Medicamentos em uso: ${patientData.medications.join(', ')}\n`;
        prompt += '\n';
    }

    if (symptoms?.length) {
        prompt += `**Sintomas Relatados:** ${symptoms.join(', ')}\n\n`;
    }

    if (diagnoses?.length) {
        prompt += '**Diagnósticos Considerados:**\n';
        diagnoses.forEach(d => {
            prompt += `- ${d.name} (${d.probability}%)\n`;
        });
        prompt += '\n';
    }

    prompt += 'Por favor, forneça:\n';
    prompt += '1. Análise geral do caso\n';
    prompt += '2. Possíveis diagnósticos diferenciais adicionais\n';
    prompt += '3. Exames prioritários\n';
    prompt += '4. Alertas importantes\n';
    prompt += '5. Recomendações de acompanhamento\n';

    return prompt;
}

export default router;
