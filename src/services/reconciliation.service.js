// Reconciliation Service - Medication reconciliation and drug interaction checking
// Covers RF16 (Continuous Medications), RF17 (Reconciliation), RF18 (Interaction Checking)

import prisma from '../lib/prisma.js';

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
     * Queries the DrugAlias table first, falls back to normalized name
     */
    async resolveAlias(drugName) {
        const normalized = this.normalizeDrugName(drugName);

        // Try to find a matching alias in the DB
        const aliasRecord = await prisma.drugAlias.findFirst({
            where: {
                alias: {
                    contains: normalized,
                    mode: 'insensitive'
                }
            }
        });

        if (aliasRecord) {
            return aliasRecord.canonicalName;
        }

        // Also try if the normalized name is contained in an alias
        const allAliases = await prisma.drugAlias.findMany();
        for (const record of allAliases) {
            const aliasNorm = this.normalizeDrugName(record.alias);
            if (aliasNorm.includes(normalized) || normalized.includes(aliasNorm)) {
                return record.canonicalName;
            }
        }

        return normalized;
    }

    /**
     * Synchronous alias resolution for use within checkInteractions
     * Uses a pre-loaded alias map
     */
    _resolveAliasSync(drugName, aliasMap) {
        const normalized = this.normalizeDrugName(drugName);

        for (const [canonical, aliases] of aliasMap.entries()) {
            if (aliases.some(alias => normalized.includes(alias) || alias.includes(normalized))) {
                return canonical;
            }
        }

        return normalized;
    }

    /**
     * Load aliases from DB into a Map for efficient synchronous lookups
     */
    async _loadAliasMap() {
        const allAliases = await prisma.drugAlias.findMany();
        const aliasMap = new Map();

        allAliases.forEach(record => {
            const canonical = record.canonicalName;
            if (!aliasMap.has(canonical)) {
                aliasMap.set(canonical, []);
            }
            aliasMap.get(canonical).push(this.normalizeDrugName(record.alias));
        });

        return aliasMap;
    }

    /**
     * RF16 - Register continuous medications for a patient
     */
    async registerContinuousMedications(patientId, patientName, medications) {
        // Upsert the patient
        let patient = await prisma.reconciliationPatient.findUnique({
            where: { id: patientId }
        });

        if (!patient) {
            patient = await prisma.reconciliationPatient.create({
                data: {
                    id: patientId,
                    patientName: patientName || `Paciente ${patientId}`,
                    age: null
                }
            });
        }

        // Create new medications
        const newMeds = [];
        for (const med of medications) {
            const created = await prisma.continuousMedication.create({
                data: {
                    patientId,
                    name: med.name,
                    dose: med.dose || '',
                    frequency: med.frequency || '',
                    route: med.route || 'Oral',
                    prescriber: med.prescriber || '',
                    since: med.since || new Date().toISOString().split('T')[0]
                }
            });
            newMeds.push(created);
        }

        // Fetch all medications for the patient
        const allMeds = await prisma.continuousMedication.findMany({
            where: { patientId }
        });

        return {
            patientId,
            addedCount: newMeds.length,
            totalMedications: allMeds.length,
            medications: allMeds
        };
    }

    /**
     * RF16 - Get continuous medications for a patient
     */
    async getContinuousMedications(patientId) {
        const patient = await prisma.reconciliationPatient.findUnique({
            where: { id: patientId },
            include: { medications: true }
        });

        if (!patient) return null;

        return {
            patientId: patient.id,
            patientName: patient.patientName,
            age: patient.age,
            medications: patient.medications.map(m => ({
                id: m.id,
                name: m.name,
                dose: m.dose,
                frequency: m.frequency,
                route: m.route,
                prescriber: m.prescriber,
                since: m.since
            }))
        };
    }

    /**
     * Get all patients
     */
    async getAllPatients() {
        const patients = await prisma.reconciliationPatient.findMany({
            include: {
                _count: {
                    select: { medications: true }
                }
            }
        });

        return patients.map(p => ({
            patientId: p.id,
            patientName: p.patientName,
            age: p.age,
            medicationCount: p._count.medications
        }));
    }

    /**
     * Remove a medication from a patient's continuous list
     */
    async removeMedication(patientId, medicationId) {
        const patient = await prisma.reconciliationPatient.findUnique({
            where: { id: patientId }
        });
        if (!patient) return null;

        const med = await prisma.continuousMedication.findFirst({
            where: { id: medicationId, patientId }
        });
        if (!med) return null;

        await prisma.continuousMedication.delete({
            where: { id: medicationId }
        });

        // Return updated patient with remaining medications
        const updated = await prisma.reconciliationPatient.findUnique({
            where: { id: patientId },
            include: { medications: true }
        });

        return {
            patientId: updated.id,
            patientName: updated.patientName,
            age: updated.age,
            medications: updated.medications
        };
    }

    /**
     * Update a medication in a patient's continuous list
     */
    async updateMedication(patientId, medicationId, updates) {
        const patient = await prisma.reconciliationPatient.findUnique({
            where: { id: patientId }
        });
        if (!patient) return null;

        const med = await prisma.continuousMedication.findFirst({
            where: { id: medicationId, patientId }
        });
        if (!med) return null;

        // Only update allowed fields
        const updateData = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.dose !== undefined) updateData.dose = updates.dose;
        if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
        if (updates.route !== undefined) updateData.route = updates.route;
        if (updates.prescriber !== undefined) updateData.prescriber = updates.prescriber;
        if (updates.since !== undefined) updateData.since = updates.since;

        await prisma.continuousMedication.update({
            where: { id: medicationId },
            data: updateData
        });

        // Return updated patient with all medications
        const updated = await prisma.reconciliationPatient.findUnique({
            where: { id: patientId },
            include: { medications: true }
        });

        return {
            patientId: updated.id,
            patientName: updated.patientName,
            age: updated.age,
            medications: updated.medications
        };
    }

    /**
     * RF18 - Check for interactions among a list of medications
     * Keeps algorithmic logic for interaction checking
     */
    async checkInteractions(medicationList) {
        // Load interactions and aliases from DB
        const [interactionsDb, aliasMap] = await Promise.all([
            prisma.drugInteraction.findMany(),
            this._loadAliasMap()
        ]);

        const interactions = [];
        const resolvedMeds = medicationList.map(med => ({
            original: med,
            resolved: this._resolveAliasSync(typeof med === 'string' ? med : med.name, aliasMap)
        }));

        // Check each pair
        for (let i = 0; i < resolvedMeds.length; i++) {
            for (let j = i + 1; j < resolvedMeds.length; j++) {
                const med1 = resolvedMeds[i];
                const med2 = resolvedMeds[j];

                const foundInteractions = interactionsDb.filter(interaction => {
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
    async reconcile(patientId, newPrescription) {
        const patient = await prisma.reconciliationPatient.findUnique({
            where: { id: patientId },
            include: { medications: true }
        });

        if (!patient) {
            return {
                error: 'Paciente não encontrado',
                patientId
            };
        }

        const continuousMeds = patient.medications.map(m => ({
            id: m.id,
            name: m.name,
            dose: m.dose,
            frequency: m.frequency,
            route: m.route,
            prescriber: m.prescriber,
            since: m.since
        }));

        const allMeds = [
            ...continuousMeds.map(m => ({ name: m.name, source: 'continuous', ...m })),
            ...newPrescription.map(m => ({ name: m.name, source: 'new', ...m }))
        ];

        // Check interactions among all medications (continuous + new)
        const allMedNames = allMeds.map(m => m.name);
        const interactionResult = await this.checkInteractions(allMedNames);

        // Load alias map for synchronous resolution in the loop
        const aliasMap = await this._loadAliasMap();

        // Classify new prescriptions
        const safe = [];
        const warnings = [];
        const blocked = [];

        newPrescription.forEach(newMed => {
            const resolvedNew = this._resolveAliasSync(newMed.name, aliasMap);

            // Find interactions involving this new medication
            const relatedInteractions = interactionResult.interactions.filter(inter => {
                const r1 = this._resolveAliasSync(inter.drug1, aliasMap);
                const r2 = this._resolveAliasSync(inter.drug2, aliasMap);
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
