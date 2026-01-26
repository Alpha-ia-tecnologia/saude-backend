// Clinical Decision Service - Backend logic for symptom analysis and diagnosis recommendations

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
}

export const clinicalDecisionService = new ClinicalDecisionService();
export default clinicalDecisionService;
