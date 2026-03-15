// Reconciliation Service - Medication reconciliation and drug interaction checking
// Covers RF16 (Continuous Medications), RF17 (Reconciliation), RF18 (Interaction Checking)

// Database of known drug interactions with severity levels
const interactionsDatabase = [
    {
        drug1: 'warfarina',
        drug2: 'aas',
        severity: 'grave',
        type: 'Risco de hemorragia',
        description: 'A combinação de Warfarina com AAS aumenta significativamente o risco de sangramento gastrointestinal e hemorragias graves.',
        recommendation: 'CONTRAINDICADO. Evitar uso concomitante. Considerar alternativas terapêuticas. Se indispensável, monitorar INR rigorosamente.'
    },
    {
        drug1: 'ieca',
        drug2: 'espironolactona',
        severity: 'grave',
        type: 'Hipercalemia',
        description: 'IECA (Enalapril, Captopril, Ramipril) combinado com Espironolactona pode causar hipercalemia grave, potencialmente fatal.',
        recommendation: 'CONTRAINDICADO sem monitoramento rigoroso de potássio sérico. Avaliar necessidade clínica e monitorar eletrólitos frequentemente.'
    },
    {
        drug1: 'fluoxetina',
        drug2: 'tramadol',
        severity: 'grave',
        type: 'Síndrome serotoninérgica',
        description: 'A combinação de Fluoxetina com Tramadol pode desencadear síndrome serotoninérgica, condição potencialmente fatal com hipertermia, rigidez muscular e alterações do estado mental.',
        recommendation: 'CONTRAINDICADO. Utilizar analgésico alternativo. Se necessário opioide, preferir morfina ou oxicodona com monitoramento.'
    },
    {
        drug1: 'warfarina',
        drug2: 'ibuprofeno',
        severity: 'grave',
        type: 'Risco de hemorragia',
        description: 'AINEs como Ibuprofeno aumentam o risco de sangramento gastrointestinal quando combinados com Warfarina.',
        recommendation: 'CONTRAINDICADO. Preferir Paracetamol para analgesia. Se AINE indispensável, usar menor dose pelo menor tempo possível.'
    },
    {
        drug1: 'enalapril',
        drug2: 'espironolactona',
        severity: 'grave',
        type: 'Hipercalemia',
        description: 'Enalapril (IECA) com Espironolactona pode causar elevação perigosa do potássio sérico.',
        recommendation: 'CONTRAINDICADO sem monitoramento. Dosar potássio antes de iniciar e semanalmente no primeiro mês.'
    },
    {
        drug1: 'captopril',
        drug2: 'espironolactona',
        severity: 'grave',
        type: 'Hipercalemia',
        description: 'Captopril (IECA) com Espironolactona aumenta risco de hipercalemia severa.',
        recommendation: 'CONTRAINDICADO sem monitoramento rigoroso. Avaliar alternativa ao diurético poupador de potássio.'
    },
    {
        drug1: 'metformina',
        drug2: 'contraste iodado',
        severity: 'moderada',
        type: 'Acidose lática',
        description: 'Metformina deve ser suspensa antes de exames com contraste iodado pelo risco de acidose lática, especialmente em pacientes com função renal comprometida.',
        recommendation: 'Suspender Metformina 48h antes do exame com contraste. Reavaliar função renal antes de reintroduzir.'
    },
    {
        drug1: 'omeprazol',
        drug2: 'clopidogrel',
        severity: 'moderada',
        type: 'Redução do efeito antiplaquetário',
        description: 'Omeprazol inibe o CYP2C19, reduzindo a conversão do Clopidogrel em seu metabólito ativo e diminuindo seu efeito antiplaquetário.',
        recommendation: 'Substituir Omeprazol por Pantoprazol, que tem menor interação com CYP2C19. Monitorar eficácia antiplaquetária.'
    },
    {
        drug1: 'diclofenaco',
        drug2: 'losartana',
        severity: 'moderada',
        type: 'Nefrotoxicidade',
        description: 'AINEs como Diclofenaco reduzem o fluxo sanguíneo renal e podem comprometer a eficácia da Losartana, além de aumentar o risco de lesão renal aguda.',
        recommendation: 'Evitar uso prolongado. Monitorar função renal e pressão arterial. Considerar Paracetamol como alternativa analgésica.'
    },
    {
        drug1: 'captopril',
        drug2: 'litio',
        severity: 'moderada',
        type: 'Toxicidade por lítio',
        description: 'Captopril pode reduzir a excreção renal de Lítio, levando a níveis tóxicos no sangue.',
        recommendation: 'Monitorar níveis séricos de Lítio frequentemente. Considerar redução da dose de Lítio. Avaliar uso de BRA como alternativa.'
    },
    {
        drug1: 'aas',
        drug2: 'ibuprofeno',
        severity: 'moderada',
        type: 'Redução do efeito antiagregante',
        description: 'Ibuprofeno pode bloquear o efeito antiagregante plaquetário do AAS quando administrado concomitantemente.',
        recommendation: 'Se ambos necessários, administrar AAS 30 minutos antes do Ibuprofeno. Considerar alternativa analgésica.'
    },
    {
        drug1: 'sinvastatina',
        drug2: 'amiodarona',
        severity: 'moderada',
        type: 'Rabdomiólise',
        description: 'Amiodarona inibe o metabolismo da Sinvastatina, aumentando seus níveis plasmáticos e o risco de miopatia e rabdomiólise.',
        recommendation: 'Limitar dose de Sinvastatina a 20mg/dia. Considerar trocar para Atorvastatina ou Rosuvastatina. Monitorar CPK.'
    },
    {
        drug1: 'metoclopramida',
        drug2: 'haloperidol',
        severity: 'moderada',
        type: 'Efeitos extrapiramidais',
        description: 'Ambos são antagonistas dopaminérgicos. O uso concomitante aumenta o risco de efeitos extrapiramidais como distonia, acatisia e discinesia tardia.',
        recommendation: 'Evitar uso concomitante. Se necessário antiemético, considerar Ondansetrona como alternativa.'
    },
    {
        drug1: 'ciprofloxacino',
        drug2: 'teofilina',
        severity: 'moderada',
        type: 'Toxicidade por teofilina',
        description: 'Ciprofloxacino inibe o metabolismo da Teofilina, podendo causar níveis tóxicos com arritmias e convulsões.',
        recommendation: 'Reduzir dose de Teofilina em 30-50%. Monitorar níveis séricos. Considerar antibiótico alternativo.'
    },
    {
        drug1: 'digoxina',
        drug2: 'amiodarona',
        severity: 'moderada',
        type: 'Toxicidade digitálica',
        description: 'Amiodarona aumenta os níveis séricos de Digoxina por redução da depuração renal e não renal.',
        recommendation: 'Reduzir dose de Digoxina em 50% ao iniciar Amiodarona. Monitorar níveis de digoxinemia e ECG.'
    },
    {
        drug1: 'fluconazol',
        drug2: 'sinvastatina',
        severity: 'moderada',
        type: 'Rabdomiólise',
        description: 'Fluconazol inibe CYP3A4 e aumenta níveis de Sinvastatina, elevando risco de miopatia.',
        recommendation: 'Suspender estatina durante tratamento com Fluconazol ou usar Pravastatina (não metabolizada por CYP3A4).'
    },
    {
        drug1: 'omeprazol',
        drug2: 'metotrexato',
        severity: 'moderada',
        type: 'Toxicidade por metotrexato',
        description: 'Omeprazol pode reduzir a eliminação renal do Metotrexato, aumentando risco de toxicidade hematológica.',
        recommendation: 'Considerar suspensão temporária do Omeprazol em ciclos de Metotrexato em altas doses.'
    },
    {
        drug1: 'paracetamol',
        drug2: 'warfarina',
        severity: 'leve',
        type: 'Aumento discreto do INR',
        description: 'Uso regular de Paracetamol pode aumentar levemente o INR em pacientes em uso de Warfarina.',
        recommendation: 'Permitido em doses terapêuticas. Monitorar INR se uso prolongado (>7 dias). Limitar a 2g/dia.'
    },
    {
        drug1: 'amoxicilina',
        drug2: 'anticoncepcional',
        severity: 'leve',
        type: 'Possível redução da eficácia contraceptiva',
        description: 'Antibióticos de amplo espectro podem teoricamente reduzir a eficácia de contraceptivos orais por alteração da flora intestinal.',
        recommendation: 'Orientar método contraceptivo adicional (preservativo) durante o uso do antibiótico e por 7 dias após.'
    },
    {
        drug1: 'losartana',
        drug2: 'suplemento de potassio',
        severity: 'leve',
        type: 'Risco de hipercalemia',
        description: 'BRAs como Losartana retêm potássio. Suplementação adicional pode elevar o potássio sérico.',
        recommendation: 'Monitorar potássio sérico. Geralmente seguro se função renal normal, mas evitar suplementação desnecessária.'
    }
];

// Aliases for medication names (to handle different names for same drug)
const drugAliases = {
    'aas': ['aas', 'acido acetilsalicilico', 'aspirina', 'ácido acetilsalicílico'],
    'warfarina': ['warfarina', 'marevan', 'coumadin'],
    'ieca': ['ieca', 'inibidor da eca', 'inibidor de eca'],
    'enalapril': ['enalapril', 'renitec', 'vasopril'],
    'captopril': ['captopril', 'capoten'],
    'espironolactona': ['espironolactona', 'aldactone'],
    'fluoxetina': ['fluoxetina', 'prozac'],
    'tramadol': ['tramadol', 'tramal'],
    'metformina': ['metformina', 'glifage', 'glucoformin'],
    'contraste iodado': ['contraste iodado', 'contraste'],
    'omeprazol': ['omeprazol', 'losec', 'peprazol'],
    'clopidogrel': ['clopidogrel', 'plavix'],
    'diclofenaco': ['diclofenaco', 'voltaren', 'cataflan'],
    'losartana': ['losartana', 'cozaar', 'losartana potassica', 'losartana potássica'],
    'litio': ['litio', 'lítio', 'carbolitium', 'carbonato de litio', 'carbonato de lítio'],
    'ibuprofeno': ['ibuprofeno', 'advil', 'motrin', 'alivium'],
    'sinvastatina': ['sinvastatina', 'zocor'],
    'amiodarona': ['amiodarona', 'ancoron'],
    'metoclopramida': ['metoclopramida', 'plasil'],
    'haloperidol': ['haloperidol', 'haldol'],
    'ciprofloxacino': ['ciprofloxacino', 'cipro', 'ciprofloxacina'],
    'teofilina': ['teofilina', 'talofilina'],
    'digoxina': ['digoxina', 'lanoxin', 'digoxin'],
    'fluconazol': ['fluconazol', 'diflucan'],
    'metotrexato': ['metotrexato', 'methotrexate'],
    'paracetamol': ['paracetamol', 'tylenol', 'acetaminofeno'],
    'amoxicilina': ['amoxicilina', 'amoxil'],
    'anticoncepcional': ['anticoncepcional', 'contraceptivo oral', 'pílula anticoncepcional'],
    'suplemento de potassio': ['suplemento de potassio', 'suplemento de potássio', 'kcl', 'cloreto de potassio', 'cloreto de potássio', 'slow-k']
};

// Pre-loaded sample patients with continuous medications
const patientsContinuousMeds = {
    'P001': {
        patientId: 'P001',
        patientName: 'Maria da Silva Santos',
        age: 68,
        medications: [
            { id: 1, name: 'Losartana', dose: '50mg', frequency: '1x ao dia', route: 'Oral', prescriber: 'Dr. Carlos Mendes', since: '2023-03-15' },
            { id: 2, name: 'Metformina', dose: '850mg', frequency: '2x ao dia', route: 'Oral', prescriber: 'Dra. Ana Souza', since: '2022-08-10' },
            { id: 3, name: 'Omeprazol', dose: '20mg', frequency: '1x ao dia (jejum)', route: 'Oral', prescriber: 'Dr. Carlos Mendes', since: '2023-01-20' },
            { id: 4, name: 'AAS', dose: '100mg', frequency: '1x ao dia', route: 'Oral', prescriber: 'Dra. Fernanda Lima', since: '2023-06-01' },
            { id: 5, name: 'Sinvastatina', dose: '20mg', frequency: '1x ao dia (noite)', route: 'Oral', prescriber: 'Dr. Carlos Mendes', since: '2023-03-15' }
        ]
    },
    'P002': {
        patientId: 'P002',
        patientName: 'João Carlos Pereira',
        age: 72,
        medications: [
            { id: 1, name: 'Enalapril', dose: '10mg', frequency: '2x ao dia', route: 'Oral', prescriber: 'Dra. Patrícia Rocha', since: '2021-11-05' },
            { id: 2, name: 'Warfarina', dose: '5mg', frequency: '1x ao dia', route: 'Oral', prescriber: 'Dr. Roberto Alves', since: '2022-04-18' },
            { id: 3, name: 'Digoxina', dose: '0.25mg', frequency: '1x ao dia', route: 'Oral', prescriber: 'Dr. Roberto Alves', since: '2022-04-18' },
            { id: 4, name: 'Furosemida', dose: '40mg', frequency: '1x ao dia (manhã)', route: 'Oral', prescriber: 'Dr. Roberto Alves', since: '2022-06-10' }
        ]
    },
    'P003': {
        patientId: 'P003',
        patientName: 'Ana Beatriz Oliveira',
        age: 45,
        medications: [
            { id: 1, name: 'Fluoxetina', dose: '20mg', frequency: '1x ao dia (manhã)', route: 'Oral', prescriber: 'Dra. Luciana Campos', since: '2024-01-10' },
            { id: 2, name: 'Captopril', dose: '25mg', frequency: '3x ao dia', route: 'Oral', prescriber: 'Dr. Marcos Vieira', since: '2023-09-22' },
            { id: 3, name: 'Amoxicilina', dose: '500mg', frequency: '3x ao dia (por 7 dias)', route: 'Oral', prescriber: 'Dr. Marcos Vieira', since: '2025-01-15' }
        ]
    },
    'P004': {
        patientId: 'P004',
        patientName: 'Roberto Lima Nascimento',
        age: 58,
        medications: [
            { id: 1, name: 'Metformina', dose: '500mg', frequency: '2x ao dia', route: 'Oral', prescriber: 'Dra. Cláudia Ferreira', since: '2022-05-14' },
            { id: 2, name: 'Losartana', dose: '100mg', frequency: '1x ao dia', route: 'Oral', prescriber: 'Dra. Cláudia Ferreira', since: '2022-05-14' },
            { id: 3, name: 'Sinvastatina', dose: '40mg', frequency: '1x ao dia (noite)', route: 'Oral', prescriber: 'Dr. Paulo Henrique', since: '2023-02-28' },
            { id: 4, name: 'Clopidogrel', dose: '75mg', frequency: '1x ao dia', route: 'Oral', prescriber: 'Dr. Paulo Henrique', since: '2024-06-10' },
            { id: 5, name: 'Omeprazol', dose: '20mg', frequency: '1x ao dia (jejum)', route: 'Oral', prescriber: 'Dr. Paulo Henrique', since: '2024-06-10' }
        ]
    }
};

// Auto-increment ID counter
let nextMedId = 100;

class ReconciliationService {
    /**
     * Normalize a drug name for comparison
     */
    normalizeDrugName(name) {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Find the canonical name for a drug (resolve aliases)
     */
    resolveAlias(drugName) {
        const normalized = this.normalizeDrugName(drugName);
        for (const [canonical, aliases] of Object.entries(drugAliases)) {
            if (aliases.some(alias => normalized.includes(alias) || alias.includes(normalized))) {
                return canonical;
            }
        }
        return normalized;
    }

    /**
     * RF16 - Register continuous medications for a patient
     */
    registerContinuousMedications(patientId, patientName, medications) {
        if (!patientsContinuousMeds[patientId]) {
            patientsContinuousMeds[patientId] = {
                patientId,
                patientName: patientName || `Paciente ${patientId}`,
                age: null,
                medications: []
            };
        }

        const newMeds = medications.map(med => ({
            id: nextMedId++,
            name: med.name,
            dose: med.dose || '',
            frequency: med.frequency || '',
            route: med.route || 'Oral',
            prescriber: med.prescriber || '',
            since: med.since || new Date().toISOString().split('T')[0]
        }));

        patientsContinuousMeds[patientId].medications.push(...newMeds);

        return {
            patientId,
            addedCount: newMeds.length,
            totalMedications: patientsContinuousMeds[patientId].medications.length,
            medications: patientsContinuousMeds[patientId].medications
        };
    }

    /**
     * RF16 - Get continuous medications for a patient
     */
    getContinuousMedications(patientId) {
        return patientsContinuousMeds[patientId] || null;
    }

    /**
     * Get all patients
     */
    getAllPatients() {
        return Object.values(patientsContinuousMeds).map(p => ({
            patientId: p.patientId,
            patientName: p.patientName,
            age: p.age,
            medicationCount: p.medications.length
        }));
    }

    /**
     * Remove a medication from a patient's continuous list
     */
    removeMedication(patientId, medicationId) {
        const patient = patientsContinuousMeds[patientId];
        if (!patient) return null;

        const index = patient.medications.findIndex(m => m.id === medicationId);
        if (index === -1) return null;

        patient.medications.splice(index, 1);
        return patient;
    }

    /**
     * Update a medication in a patient's continuous list
     */
    updateMedication(patientId, medicationId, updates) {
        const patient = patientsContinuousMeds[patientId];
        if (!patient) return null;

        const med = patient.medications.find(m => m.id === medicationId);
        if (!med) return null;

        Object.assign(med, updates);
        return patient;
    }

    /**
     * RF18 - Check for interactions among a list of medications
     */
    checkInteractions(medicationList) {
        const interactions = [];
        const resolvedMeds = medicationList.map(med => ({
            original: med,
            resolved: this.resolveAlias(typeof med === 'string' ? med : med.name)
        }));

        // Check each pair
        for (let i = 0; i < resolvedMeds.length; i++) {
            for (let j = i + 1; j < resolvedMeds.length; j++) {
                const med1 = resolvedMeds[i];
                const med2 = resolvedMeds[j];

                const foundInteractions = interactionsDatabase.filter(interaction => {
                    const d1 = interaction.drug1;
                    const d2 = interaction.drug2;
                    return (
                        (med1.resolved === d1 && med2.resolved === d2) ||
                        (med1.resolved === d2 && med2.resolved === d1)
                    );
                });

                foundInteractions.forEach(inter => {
                    interactions.push({
                        drug1: typeof med1.original === 'string' ? med1.original : med1.original.name,
                        drug2: typeof med2.original === 'string' ? med2.original : med2.original.name,
                        severity: inter.severity,
                        type: inter.type,
                        description: inter.description,
                        recommendation: inter.recommendation
                    });
                });
            }
        }

        // Sort by severity: grave first, then moderada, then leve
        const severityOrder = { grave: 0, moderada: 1, leve: 2 };
        interactions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        return {
            totalMedications: medicationList.length,
            totalInteractions: interactions.length,
            graveCount: interactions.filter(i => i.severity === 'grave').length,
            moderadaCount: interactions.filter(i => i.severity === 'moderada').length,
            leveCount: interactions.filter(i => i.severity === 'leve').length,
            interactions,
            checkedAt: new Date().toISOString()
        };
    }

    /**
     * RF17 - Reconcile continuous medications with a new prescription
     */
    reconcile(patientId, newPrescription) {
        const patient = patientsContinuousMeds[patientId];
        if (!patient) {
            return {
                error: 'Paciente não encontrado',
                patientId
            };
        }

        const continuousMeds = patient.medications;
        const allMeds = [
            ...continuousMeds.map(m => ({ name: m.name, source: 'continuous', ...m })),
            ...newPrescription.map(m => ({ name: m.name, source: 'new', ...m }))
        ];

        // Check interactions among all medications (continuous + new)
        const allMedNames = allMeds.map(m => m.name);
        const interactionResult = this.checkInteractions(allMedNames);

        // Classify new prescriptions
        const safe = [];
        const warnings = [];
        const blocked = [];

        newPrescription.forEach(newMed => {
            const resolvedNew = this.resolveAlias(newMed.name);

            // Find interactions involving this new medication
            const relatedInteractions = interactionResult.interactions.filter(inter => {
                const r1 = this.resolveAlias(inter.drug1);
                const r2 = this.resolveAlias(inter.drug2);
                return r1 === resolvedNew || r2 === resolvedNew;
            });

            const graveInteractions = relatedInteractions.filter(i => i.severity === 'grave');
            const moderadaInteractions = relatedInteractions.filter(i => i.severity === 'moderada');
            const leveInteractions = relatedInteractions.filter(i => i.severity === 'leve');

            if (graveInteractions.length > 0) {
                blocked.push({
                    medication: newMed,
                    interactions: graveInteractions,
                    reason: graveInteractions.map(i => i.type).join(', ')
                });
            } else if (moderadaInteractions.length > 0) {
                warnings.push({
                    medication: newMed,
                    interactions: moderadaInteractions,
                    reason: moderadaInteractions.map(i => i.type).join(', ')
                });
            } else {
                safe.push({
                    medication: newMed,
                    interactions: leveInteractions.length > 0 ? leveInteractions : []
                });
            }
        });

        return {
            patientId,
            patientName: patient.patientName,
            continuousMedications: continuousMeds,
            newPrescription,
            safe,
            warnings,
            blocked,
            interactions: interactionResult.interactions,
            summary: {
                totalContinuous: continuousMeds.length,
                totalNew: newPrescription.length,
                safeCount: safe.length,
                warningCount: warnings.length,
                blockedCount: blocked.length,
                totalInteractions: interactionResult.totalInteractions
            },
            reconciledAt: new Date().toISOString()
        };
    }
}

export const reconciliationService = new ReconciliationService();
export default reconciliationService;
