// Triage Service - Manchester Protocol risk classification and priority queue management

// Priority levels based on Manchester Protocol
const MANCHESTER_LEVELS = {
    RED: { code: 'RED', label: 'Emergencia', color: '#dc2626', maxWaitMinutes: 0, order: 1 },
    ORANGE: { code: 'ORANGE', label: 'Muito Urgente', color: '#ea580c', maxWaitMinutes: 10, order: 2 },
    YELLOW: { code: 'YELLOW', label: 'Urgente', color: '#eab308', maxWaitMinutes: 60, order: 3 },
    GREEN: { code: 'GREEN', label: 'Pouco Urgente', color: '#16a34a', maxWaitMinutes: 120, order: 4 },
    BLUE: { code: 'BLUE', label: 'Nao Urgente', color: '#2563eb', maxWaitMinutes: 240, order: 5 }
};

// Predefined symptom options
const PREDEFINED_SYMPTOMS = [
    { id: 'febre', label: 'Febre' },
    { id: 'tosse', label: 'Tosse' },
    { id: 'dor_cabeca', label: 'Dor de cabeca' },
    { id: 'dor_abdominal', label: 'Dor abdominal' },
    { id: 'nausea', label: 'Nausea' },
    { id: 'vomito', label: 'Vomito' },
    { id: 'diarreia', label: 'Diarreia' },
    { id: 'dispneia', label: 'Dispneia' },
    { id: 'tontura', label: 'Tontura' },
    { id: 'dor_toracica', label: 'Dor toracica' },
    { id: 'dor_muscular', label: 'Dor muscular' },
    { id: 'fadiga', label: 'Fadiga' },
    { id: 'perda_consciencia', label: 'Perda de consciencia' },
    { id: 'convulsao', label: 'Convulsao' },
    { id: 'sangramento', label: 'Sangramento' },
    { id: 'edema', label: 'Edema' },
    { id: 'cianose', label: 'Cianose' },
    { id: 'confusao_mental', label: 'Confusao mental' },
    { id: 'dor_lombar', label: 'Dor lombar' },
    { id: 'erupcao_cutanea', label: 'Erupcao cutanea' }
];

// In-memory patient queue
let triageQueue = [
    {
        id: 'TRI-001',
        patientId: 'PAC-001',
        patientName: 'Maria Silva Santos',
        patientAge: 67,
        patientCNS: '898.0001.0002.0003',
        vitalSigns: {
            temperature: 38.8,
            systolicBP: 180,
            diastolicBP: 110,
            heartRate: 110,
            respiratoryRate: 22,
            oxygenSaturation: 93,
            painLevel: 7,
            bloodGlucose: 220
        },
        symptoms: ['febre', 'dispneia', 'dor_toracica'],
        mainComplaint: 'Dor no peito intensa ha 2 horas, com falta de ar e febre',
        classification: MANCHESTER_LEVELS.ORANGE,
        alerts: [
            'PA Sistolica elevada: 180 mmHg',
            'FC elevada: 110 bpm',
            'Glicemia elevada: 220 mg/dL',
            'Dor toracica presente'
        ],
        status: 'waiting',
        registeredAt: new Date(Date.now() - 25 * 60000).toISOString(),
        registeredBy: 'Enf. Ana Paula',
        updatedAt: null
    },
    {
        id: 'TRI-002',
        patientId: 'PAC-002',
        patientName: 'Joao Carlos Oliveira',
        patientAge: 45,
        patientCNS: '898.0002.0003.0004',
        vitalSigns: {
            temperature: 39.8,
            systolicBP: 90,
            diastolicBP: 60,
            heartRate: 130,
            respiratoryRate: 28,
            oxygenSaturation: 88,
            painLevel: 9,
            bloodGlucose: 95
        },
        symptoms: ['febre', 'dispneia', 'confusao_mental', 'cianose'],
        mainComplaint: 'Febre alta, dificuldade respiratoria severa, confusao mental',
        classification: MANCHESTER_LEVELS.RED,
        alerts: [
            'EMERGENCIA: Temperatura >= 39.5C: 39.8C',
            'EMERGENCIA: SpO2 < 90%: 88%',
            'EMERGENCIA: Dor nivel >= 9',
            'PA Sistolica baixa: 90 mmHg (hipotensao)',
            'FC muito elevada: 130 bpm',
            'FR elevada: 28 irpm',
            'Confusao mental presente',
            'Cianose presente'
        ],
        status: 'waiting',
        registeredAt: new Date(Date.now() - 10 * 60000).toISOString(),
        registeredBy: 'Enf. Carlos Lima',
        updatedAt: null
    },
    {
        id: 'TRI-003',
        patientId: 'PAC-003',
        patientName: 'Ana Beatriz Souza',
        patientAge: 32,
        patientCNS: '898.0003.0004.0005',
        vitalSigns: {
            temperature: 37.2,
            systolicBP: 120,
            diastolicBP: 80,
            heartRate: 78,
            respiratoryRate: 16,
            oxygenSaturation: 98,
            painLevel: 4,
            bloodGlucose: 90
        },
        symptoms: ['dor_cabeca', 'nausea'],
        mainComplaint: 'Dor de cabeca persistente ha 3 dias, com nausea ocasional',
        classification: MANCHESTER_LEVELS.GREEN,
        alerts: [],
        status: 'waiting',
        registeredAt: new Date(Date.now() - 45 * 60000).toISOString(),
        registeredBy: 'Enf. Ana Paula',
        updatedAt: null
    },
    {
        id: 'TRI-004',
        patientId: 'PAC-004',
        patientName: 'Pedro Henrique Lima',
        patientAge: 8,
        patientCNS: '898.0004.0005.0006',
        vitalSigns: {
            temperature: 39.0,
            systolicBP: 100,
            diastolicBP: 65,
            heartRate: 120,
            respiratoryRate: 24,
            oxygenSaturation: 95,
            painLevel: 6,
            bloodGlucose: 88
        },
        symptoms: ['febre', 'tosse', 'dor_abdominal', 'vomito'],
        mainComplaint: 'Crianca com febre alta ha 1 dia, vomitando e com tosse',
        classification: MANCHESTER_LEVELS.YELLOW,
        alerts: [
            'Temperatura elevada: 39.0C',
            'FC elevada para idade: 120 bpm',
            'FR elevada: 24 irpm',
            'Paciente pediatrico com vomitos'
        ],
        status: 'waiting',
        registeredAt: new Date(Date.now() - 35 * 60000).toISOString(),
        registeredBy: 'Enf. Maria Santos',
        updatedAt: null
    },
    {
        id: 'TRI-005',
        patientId: 'PAC-005',
        patientName: 'Lucia Fernanda Costa',
        patientAge: 55,
        patientCNS: '898.0005.0006.0007',
        vitalSigns: {
            temperature: 36.8,
            systolicBP: 135,
            diastolicBP: 85,
            heartRate: 72,
            respiratoryRate: 15,
            oxygenSaturation: 97,
            painLevel: 2,
            bloodGlucose: 110
        },
        symptoms: ['dor_lombar', 'fadiga'],
        mainComplaint: 'Dor lombar cronica piorando nas ultimas semanas',
        classification: MANCHESTER_LEVELS.BLUE,
        alerts: [],
        status: 'waiting',
        registeredAt: new Date(Date.now() - 60 * 60000).toISOString(),
        registeredBy: 'Enf. Ana Paula',
        updatedAt: null
    },
    {
        id: 'TRI-006',
        patientId: 'PAC-006',
        patientName: 'Roberto Alves Mendes',
        patientAge: 72,
        patientCNS: '898.0006.0007.0008',
        vitalSigns: {
            temperature: 38.2,
            systolicBP: 160,
            diastolicBP: 100,
            heartRate: 98,
            respiratoryRate: 20,
            oxygenSaturation: 91,
            painLevel: 8,
            bloodGlucose: 280
        },
        symptoms: ['dispneia', 'dor_toracica', 'edema', 'fadiga'],
        mainComplaint: 'Falta de ar progressiva, dor no peito, pernas inchadas',
        classification: MANCHESTER_LEVELS.ORANGE,
        alerts: [
            'Dor nivel >= 8 (Muito Urgente)',
            'SpO2 baixa: 91%',
            'PA Sistolica elevada: 160 mmHg',
            'Glicemia muito elevada: 280 mg/dL',
            'Dor toracica presente',
            'Paciente idoso (72 anos)'
        ],
        status: 'waiting',
        registeredAt: new Date(Date.now() - 15 * 60000).toISOString(),
        registeredBy: 'Enf. Carlos Lima',
        updatedAt: null
    }
];

let nextTriageId = 7;

class TriageService {
    /**
     * Classify patient based on vital signs using Manchester Protocol
     */
    classifyByVitalSigns(vitalSigns, symptoms = []) {
        const alerts = [];
        let level = 'BLUE'; // Default: Non-urgent

        // === RED (Emergency) conditions ===
        if (vitalSigns.temperature >= 39.5) {
            alerts.push(`EMERGENCIA: Temperatura >= 39.5C: ${vitalSigns.temperature}C`);
            level = 'RED';
        }
        if (vitalSigns.oxygenSaturation < 90) {
            alerts.push(`EMERGENCIA: SpO2 < 90%: ${vitalSigns.oxygenSaturation}%`);
            level = 'RED';
        }
        if (vitalSigns.painLevel >= 9) {
            alerts.push(`EMERGENCIA: Dor nivel >= 9`);
            level = 'RED';
        }
        if (vitalSigns.systolicBP > 200 || vitalSigns.systolicBP < 80) {
            alerts.push(`EMERGENCIA: PA Sistolica critica: ${vitalSigns.systolicBP} mmHg`);
            level = 'RED';
        }
        if (vitalSigns.heartRate > 140 || vitalSigns.heartRate < 40) {
            alerts.push(`EMERGENCIA: FC critica: ${vitalSigns.heartRate} bpm`);
            level = 'RED';
        }
        if (vitalSigns.respiratoryRate > 30) {
            alerts.push(`EMERGENCIA: FR critica: ${vitalSigns.respiratoryRate} irpm`);
            level = 'RED';
        }
        if (vitalSigns.bloodGlucose < 50 || vitalSigns.bloodGlucose > 400) {
            alerts.push(`EMERGENCIA: Glicemia critica: ${vitalSigns.bloodGlucose} mg/dL`);
            level = 'RED';
        }
        // Dangerous symptoms that immediately classify as RED
        if (symptoms.includes('perda_consciencia') || symptoms.includes('convulsao')) {
            alerts.push('EMERGENCIA: Sintoma critico presente (perda de consciencia/convulsao)');
            level = 'RED';
        }

        // === ORANGE (Very Urgent) conditions (only escalate, never downgrade) ===
        if (level !== 'RED') {
            if (vitalSigns.painLevel >= 8) {
                alerts.push(`Dor nivel >= 8 (Muito Urgente)`);
                level = 'ORANGE';
            }
            if (vitalSigns.oxygenSaturation >= 90 && vitalSigns.oxygenSaturation < 93) {
                alerts.push(`SpO2 baixa: ${vitalSigns.oxygenSaturation}%`);
                level = 'ORANGE';
            }
            if (vitalSigns.systolicBP >= 180 || vitalSigns.systolicBP < 90) {
                alerts.push(`PA Sistolica elevada: ${vitalSigns.systolicBP} mmHg${vitalSigns.systolicBP < 90 ? ' (hipotensao)' : ''}`);
                level = 'ORANGE';
            }
            if (vitalSigns.heartRate > 120 || vitalSigns.heartRate < 50) {
                alerts.push(`FC muito elevada: ${vitalSigns.heartRate} bpm`);
                level = 'ORANGE';
            }
            if (vitalSigns.bloodGlucose > 300 || vitalSigns.bloodGlucose < 60) {
                alerts.push(`Glicemia muito alterada: ${vitalSigns.bloodGlucose} mg/dL`);
                level = 'ORANGE';
            }
            if (symptoms.includes('dor_toracica')) {
                alerts.push('Dor toracica presente');
                level = 'ORANGE';
            }
            if (symptoms.includes('confusao_mental')) {
                alerts.push('Confusao mental presente');
                level = 'ORANGE';
            }
            if (symptoms.includes('cianose')) {
                alerts.push('Cianose presente');
                level = 'ORANGE';
            }
        }

        // === YELLOW (Urgent) conditions ===
        if (level !== 'RED' && level !== 'ORANGE') {
            if (vitalSigns.temperature >= 38.5) {
                alerts.push(`Temperatura elevada: ${vitalSigns.temperature}C`);
                level = 'YELLOW';
            }
            if (vitalSigns.painLevel >= 5) {
                alerts.push(`Dor moderada: nivel ${vitalSigns.painLevel}`);
                level = 'YELLOW';
            }
            if (vitalSigns.systolicBP >= 160 || vitalSigns.diastolicBP >= 100) {
                alerts.push(`PA elevada: ${vitalSigns.systolicBP}/${vitalSigns.diastolicBP} mmHg`);
                level = 'YELLOW';
            }
            if (vitalSigns.heartRate > 100 || vitalSigns.heartRate < 55) {
                alerts.push(`FC alterada: ${vitalSigns.heartRate} bpm`);
                level = 'YELLOW';
            }
            if (vitalSigns.respiratoryRate > 22) {
                alerts.push(`FR elevada: ${vitalSigns.respiratoryRate} irpm`);
                level = 'YELLOW';
            }
            if (vitalSigns.oxygenSaturation >= 93 && vitalSigns.oxygenSaturation < 95) {
                alerts.push(`SpO2 levemente baixa: ${vitalSigns.oxygenSaturation}%`);
                level = 'YELLOW';
            }
            if (vitalSigns.bloodGlucose > 200 || vitalSigns.bloodGlucose < 70) {
                alerts.push(`Glicemia alterada: ${vitalSigns.bloodGlucose} mg/dL`);
                level = 'YELLOW';
            }
            if (symptoms.includes('dispneia')) {
                alerts.push('Dispneia presente');
                level = 'YELLOW';
            }
            if (symptoms.includes('sangramento')) {
                alerts.push('Sangramento relatado');
                level = 'YELLOW';
            }
            if (symptoms.includes('vomito') && symptoms.includes('febre')) {
                alerts.push('Vomito associado a febre');
                level = 'YELLOW';
            }
        }

        // === GREEN (Standard) conditions ===
        if (level !== 'RED' && level !== 'ORANGE' && level !== 'YELLOW') {
            if (vitalSigns.temperature >= 37.5) {
                alerts.push(`Febre leve: ${vitalSigns.temperature}C`);
                level = 'GREEN';
            }
            if (vitalSigns.painLevel >= 3) {
                alerts.push(`Dor leve: nivel ${vitalSigns.painLevel}`);
                level = 'GREEN';
            }
            if (vitalSigns.systolicBP >= 140 || vitalSigns.diastolicBP >= 90) {
                alerts.push(`PA levemente elevada: ${vitalSigns.systolicBP}/${vitalSigns.diastolicBP} mmHg`);
                level = 'GREEN';
            }
            if (symptoms.length >= 3) {
                alerts.push('Multiplos sintomas relatados');
                level = 'GREEN';
            }
        }

        return {
            classification: MANCHESTER_LEVELS[level],
            alerts
        };
    }

    /**
     * Register a new triage entry and add to queue
     */
    addToQueue(triageData) {
        const { classification, alerts } = this.classifyByVitalSigns(
            triageData.vitalSigns,
            triageData.symptoms || []
        );

        const triageEntry = {
            id: `TRI-${String(nextTriageId++).padStart(3, '0')}`,
            patientId: triageData.patientId || `PAC-${String(nextTriageId).padStart(3, '0')}`,
            patientName: triageData.patientName,
            patientAge: triageData.patientAge || null,
            patientCNS: triageData.patientCNS || null,
            vitalSigns: triageData.vitalSigns,
            symptoms: triageData.symptoms || [],
            mainComplaint: triageData.mainComplaint || '',
            classification,
            alerts,
            status: 'waiting',
            registeredAt: new Date().toISOString(),
            registeredBy: triageData.registeredBy || 'Sistema',
            updatedAt: null
        };

        triageQueue.push(triageEntry);
        return triageEntry;
    }

    /**
     * Get the priority-sorted queue
     * Sorted by: classification level (ascending = more urgent first), then by registeredAt (older first)
     */
    getQueue(statusFilter = null) {
        let queue = [...triageQueue];

        if (statusFilter) {
            queue = queue.filter(t => t.status === statusFilter);
        }

        // Sort by priority (lower order = higher priority), then by registration time
        queue.sort((a, b) => {
            const orderDiff = a.classification.order - b.classification.order;
            if (orderDiff !== 0) return orderDiff;
            return new Date(a.registeredAt) - new Date(b.registeredAt);
        });

        return queue;
    }

    /**
     * Get a specific patient's triage data
     */
    getPatientTriage(id) {
        return triageQueue.find(t => t.id === id) || null;
    }

    /**
     * Update triage data for a patient
     */
    updateTriage(id, updateData) {
        const index = triageQueue.findIndex(t => t.id === id);
        if (index === -1) return null;

        const existing = triageQueue[index];

        // If vital signs or symptoms are updated, re-classify
        if (updateData.vitalSigns || updateData.symptoms) {
            const newVitalSigns = updateData.vitalSigns || existing.vitalSigns;
            const newSymptoms = updateData.symptoms || existing.symptoms;
            const { classification, alerts } = this.classifyByVitalSigns(newVitalSigns, newSymptoms);
            updateData.classification = classification;
            updateData.alerts = alerts;
        }

        triageQueue[index] = {
            ...existing,
            ...updateData,
            id: existing.id, // Prevent ID from being overwritten
            updatedAt: new Date().toISOString()
        };

        return triageQueue[index];
    }

    /**
     * Get high-priority alerts (RED and ORANGE patients)
     */
    getAlerts() {
        return triageQueue
            .filter(t =>
                (t.classification.code === 'RED' || t.classification.code === 'ORANGE') &&
                t.status === 'waiting'
            )
            .sort((a, b) => {
                const orderDiff = a.classification.order - b.classification.order;
                if (orderDiff !== 0) return orderDiff;
                return new Date(a.registeredAt) - new Date(b.registeredAt);
            });
    }

    /**
     * Get available Manchester levels reference
     */
    getManchesterLevels() {
        return MANCHESTER_LEVELS;
    }

    /**
     * Get predefined symptoms list
     */
    getPredefinedSymptoms() {
        return PREDEFINED_SYMPTOMS;
    }
}

export const triageService = new TriageService();
export default triageService;
