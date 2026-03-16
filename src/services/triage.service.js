// Triage Service - Manchester Protocol risk classification and priority queue management
// Refactored to use Prisma instead of in-memory arrays

import prisma from '../lib/prisma.js';

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

/**
 * Reconstruct the full triage entry from a DB row.
 * The `classification` column stores the MANCHESTER_LEVELS object as JSON,
 * but we re-hydrate from the constant so the reference stays consistent.
 */
function formatEntry(row) {
    const classObj = row.classification;
    const level = MANCHESTER_LEVELS[classObj.code] || classObj;

    return {
        id: row.codigo,
        patientId: row.patientId,
        patientName: row.patientName,
        patientAge: row.patientAge,
        patientCNS: row.patientCNS,
        vitalSigns: row.vitalSigns,
        symptoms: row.symptoms,
        mainComplaint: row.mainComplaint,
        classification: level,
        alerts: row.alerts,
        status: row.status,
        registeredAt: row.createdAt.toISOString(),
        registeredBy: row.registeredBy,
        updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null
    };
}

/**
 * Generate the next TRI-XXX code by querying the max existing code.
 */
async function nextTriageCode() {
    const last = await prisma.triageEntry.findFirst({
        where: { codigo: { startsWith: 'TRI-' } },
        orderBy: { codigo: 'desc' }
    });

    let nextNum = 1;
    if (last) {
        const numPart = parseInt(last.codigo.replace('TRI-', ''), 10);
        if (!isNaN(numPart)) nextNum = numPart + 1;
    }

    return `TRI-${String(nextNum).padStart(3, '0')}`;
}

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
        if (symptoms.includes('perda_consciencia') || symptoms.includes('convulsao')) {
            alerts.push('EMERGENCIA: Sintoma critico presente (perda de consciencia/convulsao)');
            level = 'RED';
        }

        // === ORANGE (Very Urgent) conditions ===
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
    async addToQueue(triageData) {
        const { classification, alerts } = this.classifyByVitalSigns(
            triageData.vitalSigns,
            triageData.symptoms || []
        );

        const codigo = await nextTriageCode();

        const row = await prisma.triageEntry.create({
            data: {
                codigo,
                patientId: triageData.patientId || codigo.replace('TRI', 'PAC'),
                patientName: triageData.patientName,
                patientAge: triageData.patientAge || null,
                patientCNS: triageData.patientCNS || null,
                vitalSigns: triageData.vitalSigns,
                symptoms: triageData.symptoms || [],
                mainComplaint: triageData.mainComplaint || '',
                classification,
                alerts,
                status: 'waiting',
                registeredBy: triageData.registeredBy || 'Sistema'
            }
        });

        return formatEntry(row);
    }

    /**
     * Get the priority-sorted queue
     * Sorted by: classification level (ascending = more urgent first), then by createdAt (older first)
     */
    async getQueue(statusFilter = null) {
        const where = {};
        if (statusFilter) {
            where.status = statusFilter;
        }

        const rows = await prisma.triageEntry.findMany({
            where,
            orderBy: { createdAt: 'asc' }
        });

        const entries = rows.map(formatEntry);

        // Sort by classification order, then by registeredAt
        entries.sort((a, b) => {
            const orderDiff = a.classification.order - b.classification.order;
            if (orderDiff !== 0) return orderDiff;
            return new Date(a.registeredAt) - new Date(b.registeredAt);
        });

        return entries;
    }

    /**
     * Get a specific patient's triage data
     */
    async getPatientTriage(id) {
        const row = await prisma.triageEntry.findUnique({
            where: { codigo: id }
        });

        if (!row) return null;
        return formatEntry(row);
    }

    /**
     * Update triage data for a patient
     */
    async updateTriage(id, updateData) {
        const existing = await prisma.triageEntry.findUnique({
            where: { codigo: id }
        });

        if (!existing) return null;

        // If vital signs or symptoms are updated, re-classify
        if (updateData.vitalSigns || updateData.symptoms) {
            const newVitalSigns = updateData.vitalSigns || existing.vitalSigns;
            const newSymptoms = updateData.symptoms || existing.symptoms;
            const { classification, alerts } = this.classifyByVitalSigns(newVitalSigns, newSymptoms);
            updateData.classification = classification;
            updateData.alerts = alerts;
        }

        // Build Prisma update payload from allowed fields
        const data = {};
        if (updateData.patientName !== undefined) data.patientName = updateData.patientName;
        if (updateData.patientAge !== undefined) data.patientAge = updateData.patientAge;
        if (updateData.patientCNS !== undefined) data.patientCNS = updateData.patientCNS;
        if (updateData.vitalSigns !== undefined) data.vitalSigns = updateData.vitalSigns;
        if (updateData.symptoms !== undefined) data.symptoms = updateData.symptoms;
        if (updateData.mainComplaint !== undefined) data.mainComplaint = updateData.mainComplaint;
        if (updateData.classification !== undefined) data.classification = updateData.classification;
        if (updateData.alerts !== undefined) data.alerts = updateData.alerts;
        if (updateData.status !== undefined) data.status = updateData.status;
        if (updateData.registeredBy !== undefined) data.registeredBy = updateData.registeredBy;

        const row = await prisma.triageEntry.update({
            where: { codigo: id },
            data
        });

        return formatEntry(row);
    }

    /**
     * Get high-priority alerts (RED and ORANGE patients)
     */
    async getAlerts() {
        const rows = await prisma.triageEntry.findMany({
            where: { status: 'waiting' },
            orderBy: { createdAt: 'asc' }
        });

        return rows
            .map(formatEntry)
            .filter(e => e.classification.code === 'RED' || e.classification.code === 'ORANGE')
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
