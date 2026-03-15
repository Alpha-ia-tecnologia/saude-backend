// Clinical Decision Service - Backend logic for symptom analysis and diagnosis recommendations
import deepseekService from './deepseek.service.js';

// Knowledge base for symptom-diagnosis mapping
const symptomDatabase = {
    'febre': {
        diagnoses: [
            { name: 'Infecção viral', probability: 0.75 },
            { name: 'Infecção bacteriana', probability: 0.60 },
            { name: 'COVID-19', probability: 0.45 },
            { name: 'Dengue', probability: 0.40 }
        ],
        exams: ['Hemograma completo', 'PCR', 'Teste COVID-19', 'Sorologia Dengue'],
        treatments: ['Antitérmicos', 'Hidratação', 'Repouso']
    },
    'tosse': {
        diagnoses: [
            { name: 'Infecção de vias aéreas superiores', probability: 0.70 },
            { name: 'Bronquite', probability: 0.55 },
            { name: 'Pneumonia', probability: 0.35 },
            { name: 'Asma', probability: 0.30 }
        ],
        exams: ['Raio-X de tórax', 'Hemograma', 'Espirometria'],
        treatments: ['Antitussígenos', 'Expectorantes', 'Broncodilatadores']
    },
    'dor_cabeca': {
        diagnoses: [
            { name: 'Cefaleia tensional', probability: 0.65 },
            { name: 'Enxaqueca', probability: 0.50 },
            { name: 'Sinusite', probability: 0.40 },
            { name: 'Hipertensão', probability: 0.25 }
        ],
        exams: ['Avaliação neurológica', 'Tomografia (se persistente)', 'Aferição de PA'],
        treatments: ['Analgésicos', 'Anti-inflamatórios', 'Triptanos (para enxaqueca)']
    },
    'dor_abdominal': {
        diagnoses: [
            { name: 'Gastrite', probability: 0.60 },
            { name: 'Úlcera péptica', probability: 0.40 },
            { name: 'Síndrome do intestino irritável', probability: 0.35 },
            { name: 'Apendicite', probability: 0.20 }
        ],
        exams: ['Ultrassonografia abdominal', 'Endoscopia digestiva alta', 'Exames laboratoriais'],
        treatments: ['Inibidores de bomba de prótons', 'Antiácidos', 'Antiespasmódicos']
    },
    'nausea': {
        diagnoses: [
            { name: 'Gastroenterite', probability: 0.65 },
            { name: 'Intoxicação alimentar', probability: 0.55 },
            { name: 'Labirintite', probability: 0.30 },
            { name: 'Gravidez', probability: 0.25 }
        ],
        exams: ['Exames laboratoriais', 'Eletrólitos', 'Beta-HCG'],
        treatments: ['Antieméticos', 'Hidratação', 'Dieta leve']
    },
    'fadiga': {
        diagnoses: [
            { name: 'Anemia', probability: 0.55 },
            { name: 'Hipotireoidismo', probability: 0.45 },
            { name: 'Depressão', probability: 0.40 },
            { name: 'Diabetes', probability: 0.30 }
        ],
        exams: ['Hemograma', 'TSH', 'Glicemia de jejum', 'Ferritina'],
        treatments: ['Suplementação (se indicado)', 'Orientação nutricional', 'Avaliação psicológica']
    },
    'falta_ar': {
        diagnoses: [
            { name: 'Asma', probability: 0.55 },
            { name: 'DPOC', probability: 0.45 },
            { name: 'Insuficiência cardíaca', probability: 0.35 },
            { name: 'Ansiedade', probability: 0.30 }
        ],
        exams: ['Espirometria', 'Raio-X de tórax', 'Ecocardiograma', 'Oximetria'],
        treatments: ['Broncodilatadores', 'Corticoides inalatórios', 'Oxigenoterapia (se necessário)']
    },
    'dor_peito': {
        diagnoses: [
            { name: 'Costocondrite', probability: 0.45 },
            { name: 'DRGE', probability: 0.40 },
            { name: 'Angina', probability: 0.30 },
            { name: 'Infarto agudo do miocárdio', probability: 0.15 }
        ],
        exams: ['ECG', 'Troponina', 'Raio-X de tórax', 'Ecocardiograma'],
        treatments: ['Avaliação de emergência', 'AAS (se indicado)', 'Nitratos']
    },
    'tontura': {
        diagnoses: [
            { name: 'Vertigem posicional paroxística benigna', probability: 0.55 },
            { name: 'Labirintite', probability: 0.45 },
            { name: 'Hipotensão postural', probability: 0.35 },
            { name: 'Anemia', probability: 0.25 }
        ],
        exams: ['Avaliação neurológica', 'Audiometria', 'Aferição de PA', 'Hemograma'],
        treatments: ['Manobras de reposicionamento', 'Betaistina', 'Orientação postural']
    },
    'dor_muscular': {
        diagnoses: [
            { name: 'Mialgia pós-esforço', probability: 0.60 },
            { name: 'Fibromialgia', probability: 0.35 },
            { name: 'Síndrome gripal', probability: 0.50 },
            { name: 'Artrite', probability: 0.25 }
        ],
        exams: ['Marcadores inflamatórios', 'CPK', 'VHS', 'PCR'],
        treatments: ['Analgésicos', 'Relaxantes musculares', 'Fisioterapia']
    }
};

// Medication recommendations by diagnosis
const medicationDatabase = {
    'Hipertensão': ['Losartana 50mg', 'Anlodipino 5mg', 'Hidroclorotiazida 25mg'],
    'Diabetes Tipo 2': ['Metformina 850mg', 'Glibenclamida 5mg', 'Insulina NPH'],
    'Gastrite': ['Omeprazol 20mg', 'Ranitidina 150mg', 'Sucralfato'],
    'Infecção viral': ['Paracetamol 500mg', 'Dipirona 500mg'],
    'Bronquite': ['Ambroxol', 'Salbutamol inalatório', 'Prednisolona (se grave)'],
    'Pneumonia': ['Amoxicilina 500mg', 'Azitromicina 500mg', 'Levofloxacino 500mg'],
    'Enxaqueca': ['Sumatriptano 50mg', 'Ibuprofeno 400mg', 'Metoclopramida 10mg'],
    'Asma': ['Salbutamol inalatório', 'Budesonida inalatória', 'Formoterol'],
    'Insuficiência cardíaca': ['Carvedilol', 'Furosemida', 'Espironolactona'],
    'Depressão': ['Sertralina 50mg', 'Fluoxetina 20mg', 'Escitalopram 10mg'],
    'Anemia': ['Sulfato ferroso 40mg', 'Ácido fólico 5mg', 'Vitamina B12']
};

class ClinicalDecisionService {
    /**
     * Analyze symptoms and return possible diagnoses with probabilities
     */
    analyzeSymptoms(symptoms, patientData = {}) {
        const diagnosisMap = new Map();
        const allExams = new Set();
        const allTreatments = new Set();

        // Normalize symptoms
        const normalizedSymptoms = symptoms.map(s =>
            s.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '_')
        );

        // Collect diagnoses from all symptoms
        normalizedSymptoms.forEach(symptom => {
            const data = symptomDatabase[symptom];
            if (data) {
                data.diagnoses.forEach(d => {
                    if (diagnosisMap.has(d.name)) {
                        // Increase probability if multiple symptoms point to same diagnosis
                        const existing = diagnosisMap.get(d.name);
                        existing.probability = Math.min(0.95, existing.probability + d.probability * 0.3);
                        existing.matchingSymptoms++;
                    } else {
                        diagnosisMap.set(d.name, {
                            ...d,
                            matchingSymptoms: 1
                        });
                    }
                });
                data.exams.forEach(e => allExams.add(e));
                data.treatments.forEach(t => allTreatments.add(t));
            }
        });

        // Adjust probabilities based on patient data
        if (patientData.age) {
            diagnosisMap.forEach((diagnosis, name) => {
                // Higher risk for elderly patients
                if (patientData.age > 60 && ['Hipertensão', 'Diabetes', 'Insuficiência cardíaca'].includes(name)) {
                    diagnosis.probability = Math.min(0.95, diagnosis.probability * 1.2);
                }
            });
        }

        if (patientData.conditions) {
            const conditions = patientData.conditions.map(c => c.toLowerCase());
            diagnosisMap.forEach((diagnosis, name) => {
                // Increase probability if patient has related pre-existing conditions
                if (conditions.includes('hipertensão') && name === 'Insuficiência cardíaca') {
                    diagnosis.probability = Math.min(0.95, diagnosis.probability * 1.3);
                }
                if (conditions.includes('diabetes') && name === 'Infecção bacteriana') {
                    diagnosis.probability = Math.min(0.95, diagnosis.probability * 1.2);
                }
            });
        }

        // Sort by probability
        const sortedDiagnoses = Array.from(diagnosisMap.values())
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 5);

        return {
            possibleDiagnoses: sortedDiagnoses.map(d => ({
                name: d.name,
                probability: Math.round(d.probability * 100),
                matchingSymptoms: d.matchingSymptoms
            })),
            recommendedExams: Array.from(allExams),
            suggestedTreatments: Array.from(allTreatments),
            symptomCount: normalizedSymptoms.length,
            analyzedAt: new Date().toISOString()
        };
    }

    /**
     * Analyze symptoms using DeepSeek AI for advanced analysis
     */
    async analyzeSymptomsWithAI(symptoms, patientData = {}) {
        // First get rule-based analysis
        const ruleBasedAnalysis = this.analyzeSymptoms(symptoms, patientData);

        // If DeepSeek is not configured, return rule-based analysis
        if (!deepseekService.isConfigured()) {
            return {
                ...ruleBasedAnalysis,
                aiEnhanced: false
            };
        }

        try {
            const prompt = this.buildSymptomAnalysisPrompt(symptoms, patientData, ruleBasedAnalysis);

            const messages = [
                {
                    role: 'system',
                    content: `Você é o assistente de IA do PEC (Prontuário Eletrônico do Cidadão), sistema de saúde pública do Brasil.

Suas habilidades incluem:
- Apoio à decisão clínica baseada em evidências
- Análise de sintomas e sugestão de diagnósticos diferenciais
- Recomendação de exames laboratoriais e de imagem
- Identificação de alertas de segurança e interações medicamentosas
- Suporte aos protocolos do Ministério da Saúde e SUS

Analise os sintomas do paciente e forneça uma análise detalhada.
Responda SEMPRE em formato JSON válido com a seguinte estrutura:
{
    "analise": "análise clínica detalhada",
    "diagnosticos_adicionais": ["diagnóstico 1", "diagnóstico 2"],
    "exames_prioritarios": ["exame 1", "exame 2"],
    "alertas": ["alerta 1", "alerta 2"],
    "recomendacoes": ["recomendação 1", "recomendação 2"],
    "gravidade": "baixa|moderada|alta|urgente"
}

Lembre-se: suas sugestões são apenas apoio à decisão do profissional de saúde.`
                },
                { role: 'user', content: prompt }
            ];

            const response = await deepseekService.chat(messages);

            // Try to parse AI response as JSON
            let aiAnalysis = null;
            try {
                const jsonMatch = response.content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    aiAnalysis = JSON.parse(jsonMatch[0]);
                }
            } catch (parseError) {
                // If JSON parsing fails, use raw content
                aiAnalysis = { analise: response.content };
            }

            return {
                ...ruleBasedAnalysis,
                aiEnhanced: true,
                aiAnalysis,
                aiModel: response.model
            };
        } catch (error) {
            console.error('DeepSeek analysis error:', error);
            return {
                ...ruleBasedAnalysis,
                aiEnhanced: false,
                aiError: error.message
            };
        }
    }

    /**
     * Build prompt for symptom analysis
     */
    buildSymptomAnalysisPrompt(symptoms, patientData, ruleBasedAnalysis) {
        let prompt = 'Analise o seguinte caso clínico:\n\n';

        if (patientData.age) prompt += `Idade: ${patientData.age} anos\n`;
        if (patientData.sex) prompt += `Sexo: ${patientData.sex}\n`;
        if (patientData.conditions?.length) prompt += `Condições pré-existentes: ${patientData.conditions.join(', ')}\n`;
        if (patientData.allergies?.length) prompt += `Alergias: ${patientData.allergies.join(', ')}\n`;
        if (patientData.medications?.length) prompt += `Medicamentos em uso: ${patientData.medications.join(', ')}\n`;

        prompt += `\nSintomas relatados: ${symptoms.join(', ')}\n`;

        if (ruleBasedAnalysis.possibleDiagnoses?.length) {
            prompt += '\nDiagnósticos sugeridos pelo sistema:\n';
            ruleBasedAnalysis.possibleDiagnoses.forEach(d => {
                prompt += `- ${d.name} (${d.probability}%)\n`;
            });
        }

        prompt += '\nForneça sua análise clínica considerando:\n';
        prompt += '1. Correlação entre sintomas e histórico do paciente\n';
        prompt += '2. Diagnósticos diferenciais que podem não ter sido considerados\n';
        prompt += '3. Exames mais urgentes a solicitar\n';
        prompt += '4. Alertas de segurança ou interações medicamentosas\n';
        prompt += '5. Nível de gravidade do quadro\n';

        return prompt;
    }

    /**
     * Get detailed recommendations for a specific diagnosis
     */
    getRecommendations(diagnosis) {
        const medications = medicationDatabase[diagnosis] || [];

        // Find all related exams and treatments
        let exams = [];
        let treatments = [];

        Object.values(symptomDatabase).forEach(data => {
            data.diagnoses.forEach(d => {
                if (d.name === diagnosis) {
                    exams = [...new Set([...exams, ...data.exams])];
                    treatments = [...new Set([...treatments, ...data.treatments])];
                }
            });
        });

        return {
            diagnosis,
            medications,
            exams,
            treatments,
            warnings: this.getWarnings(diagnosis),
            protocols: this.getProtocols(diagnosis)
        };
    }

    /**
     * Get AI-powered recommendations using DeepSeek
     */
    async getRecommendationsWithAI(diagnosis, patientData = {}) {
        const baseRecommendations = this.getRecommendations(diagnosis);

        if (!deepseekService.isConfigured()) {
            return {
                ...baseRecommendations,
                aiEnhanced: false
            };
        }

        try {
            const messages = [
                {
                    role: 'system',
                    content: `Você é o assistente de IA do PEC (Prontuário Eletrônico do Cidadão), sistema de saúde pública do Brasil.

Suas habilidades incluem:
- Recomendações de tratamento baseadas em protocolos do SUS e Ministério da Saúde
- Sugestão de medicamentos da RENAME (Relação Nacional de Medicamentos Essenciais)
- Orientações gerais ao paciente
- Identificação de sinais de alarme
- Planejamento de seguimento clínico

Forneça recomendações de tratamento personalizadas considerando o diagnóstico e dados do paciente.
Responda em formato JSON:
{
    "tratamento_recomendado": "descrição do tratamento",
    "medicamentos_sugeridos": [{"nome": "", "dose": "", "frequencia": "", "duracao": ""}],
    "orientacoes_gerais": ["orientação 1", "orientação 2"],
    "sinais_alarme": ["sinal 1", "sinal 2"],
    "seguimento": "recomendação de seguimento"
}

Lembre-se: suas sugestões são apenas apoio à decisão do profissional de saúde.`
                },
                {
                    role: 'user',
                    content: `Diagnóstico: ${diagnosis}
Idade: ${patientData.age || 'não informada'}
Sexo: ${patientData.sex || 'não informado'}
Condições pré-existentes: ${patientData.conditions?.join(', ') || 'nenhuma'}
Alergias: ${patientData.allergies?.join(', ') || 'nenhuma conhecida'}
Medicamentos em uso: ${patientData.medications?.join(', ') || 'nenhum'}

Forneça recomendações de tratamento personalizadas.`
                }
            ];

            const response = await deepseekService.chat(messages);

            let aiRecommendations = null;
            try {
                const jsonMatch = response.content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    aiRecommendations = JSON.parse(jsonMatch[0]);
                }
            } catch (parseError) {
                aiRecommendations = { tratamento_recomendado: response.content };
            }

            return {
                ...baseRecommendations,
                aiEnhanced: true,
                aiRecommendations,
                aiModel: response.model
            };
        } catch (error) {
            console.error('DeepSeek recommendations error:', error);
            return {
                ...baseRecommendations,
                aiEnhanced: false,
                aiError: error.message
            };
        }
    }

    /**
     * Get clinical warnings for a diagnosis
     */
    getWarnings(diagnosis) {
        const warningsDb = {
            'Infarto agudo do miocárdio': ['EMERGÊNCIA MÉDICA - Encaminhar imediatamente', 'Não administrar sem avaliação cardiológica'],
            'Apendicite': ['Avaliar necessidade de cirurgia de emergência', 'Manter paciente em jejum'],
            'Pneumonia': ['Avaliar critérios de internação (CURB-65)', 'Monitorar oximetria'],
            'Angina': ['Descartar infarto agudo', 'ECG seriado recomendado'],
            'Hipotensão postural': ['Orientar mudanças posturais gradativas', 'Avaliar medicações em uso']
        };

        return warningsDb[diagnosis] || [];
    }

    /**
     * Get recommended clinical protocols
     */
    getProtocols(diagnosis) {
        const protocolsDb = {
            'Hipertensão': ['Protocolo de Manejo da HAS - MS 2024', 'Fluxograma de Estratificação de Risco CV'],
            'Diabetes Tipo 2': ['Protocolo de Diabetes na APS - MS 2024', 'Rastreamento de Complicações Crônicas'],
            'Asma': ['GINA 2024 - Manejo da Asma', 'Protocolo de Exacerbação Aguda'],
            'Pneumonia': ['Protocolo PAC - Sociedade Brasileira de Pneumologia', 'Critérios CURB-65'],
            'Depressão': ['Protocolo de Saúde Mental na APS', 'Escala PHQ-9 para Rastreamento']
        };

        return protocolsDb[diagnosis] || ['Protocolo Geral de Atendimento na APS'];
    }

    /**
     * Generate AI insights based on patient data and symptoms
     */
    generateInsights(patientData, symptoms, diagnoses) {
        const insights = [];
        const alerts = [];
        const recommendations = [];

        // Age-based insights
        if (patientData.age > 60) {
            insights.push('Paciente idoso requer atenção especial a polifarmácia e interações medicamentosas.');
        }

        // Condition-based insights
        if (patientData.conditions?.includes('Hipertensão') && patientData.conditions?.includes('Diabetes')) {
            insights.push('Paciente com hipertensão e diabetes apresenta risco aumentado para complicações cardiovasculares.');
            recommendations.push('Considerar monitoramento mais frequente da pressão arterial e glicemia.');
        }

        // Allergy alerts
        if (patientData.allergies?.length > 0) {
            alerts.push(`Atenção às alergias documentadas: ${patientData.allergies.join(', ')}.`);
        }

        // Symptom-based insights
        if (symptoms.includes('dor_peito') || symptoms.includes('falta_ar')) {
            alerts.push('Sintomas podem indicar condição cardiovascular. Avaliar necessidade de ECG urgente.');
        }

        if (symptoms.length > 4) {
            insights.push('Múltiplos sintomas reportados. Considerar investigação sistêmica.');
        }

        // Medication interaction warnings
        if (patientData.medications?.some(m => m.toLowerCase().includes('anti-inflamatório'))) {
            if (patientData.conditions?.includes('Hipertensão')) {
                alerts.push('Possível interação: Anti-inflamatórios podem reduzir eficácia de anti-hipertensivos.');
            }
        }

        return {
            insights,
            alerts,
            recommendations,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Generate AI-enhanced insights using DeepSeek
     */
    async generateInsightsWithAI(patientData, symptoms, diagnoses) {
        const baseInsights = this.generateInsights(patientData, symptoms, diagnoses);

        if (!deepseekService.isConfigured()) {
            return {
                ...baseInsights,
                aiEnhanced: false
            };
        }

        try {
            const messages = [
                {
                    role: 'system',
                    content: `Você é o assistente de IA do PEC (Prontuário Eletrônico do Cidadão), sistema de saúde pública do Brasil.

Suas habilidades incluem:
- Análise clínica integrada considerando histórico, sintomas e condições do paciente
- Identificação de riscos e fatores agravantes
- Detecção de interações medicamentosas
- Recomendações personalizadas baseadas em evidências
- Avaliação de prognóstico
- Indicação de encaminhamentos para especialidades
- Suporte aos protocolos do SUS e Ministério da Saúde

Analise o caso e forneça insights clínicos avançados.
Responda em formato JSON:
{
    "analise_integrada": "análise considerando todos os fatores",
    "riscos_identificados": ["risco 1", "risco 2"],
    "interacoes_medicamentosas": ["interação 1"],
    "recomendacoes_personalizadas": ["recomendação 1", "recomendação 2"],
    "prognostico_estimado": "descrição do prognóstico",
    "necessidade_encaminhamento": "sim/não e para qual especialidade"
}

Lembre-se: suas sugestões são apenas apoio à decisão do profissional de saúde.`
                },
                {
                    role: 'user',
                    content: `Dados do Paciente:
Idade: ${patientData.age || 'não informada'}
Sexo: ${patientData.sex || 'não informado'}
Condições: ${patientData.conditions?.join(', ') || 'nenhuma'}
Alergias: ${patientData.allergies?.join(', ') || 'nenhuma'}
Medicamentos: ${patientData.medications?.join(', ') || 'nenhum'}

Sintomas: ${symptoms.join(', ')}

Diagnósticos considerados:
${diagnoses.map(d => `- ${d.name} (${d.probability}%)`).join('\n')}

Forneça uma análise clínica integrada com insights avançados.`
                }
            ];

            const response = await deepseekService.chat(messages);

            let aiInsights = null;
            try {
                const jsonMatch = response.content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    aiInsights = JSON.parse(jsonMatch[0]);
                }
            } catch (parseError) {
                aiInsights = { analise_integrada: response.content };
            }

            return {
                ...baseInsights,
                aiEnhanced: true,
                aiInsights,
                aiModel: response.model
            };
        } catch (error) {
            console.error('DeepSeek insights error:', error);
            return {
                ...baseInsights,
                aiEnhanced: false,
                aiError: error.message
            };
        }
    }
}

export const clinicalDecisionService = new ClinicalDecisionService();
export default clinicalDecisionService;

