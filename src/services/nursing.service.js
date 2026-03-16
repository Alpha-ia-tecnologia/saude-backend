// Nursing Service - Aprazamento (medication scheduling) and Checagem (medication checking)
// RF12 - Aprazamento de Medicamentos
// RF13 - Checagem de Medicamentos
// Refactored to use Prisma instead of in-memory arrays

import prisma from '../lib/prisma.js';

/**
 * Generate time slots from frequency
 * E.g., "6/6h" starting at baseHour generates: 00:00, 06:00, 12:00, 18:00
 */
function generateTimesFromFrequency(intervalHours, baseHour = 6) {
    if (intervalHours <= 0) return [];
    const times = [];
    const slotsPerDay = Math.floor(24 / intervalHours);
    for (let i = 0; i < slotsPerDay; i++) {
        const hour = (baseHour + i * intervalHours) % 24;
        times.push(`${String(hour).padStart(2, '0')}:00`);
    }
    times.sort();
    return times;
}

/**
 * Generate the next S-prefixed schedule ID.
 */
async function nextScheduleId() {
    const last = await prisma.medicationSchedule.findFirst({
        where: { id: { startsWith: 'S' } },
        orderBy: { id: 'desc' }
    });

    let nextNum = 1;
    if (last) {
        const numPart = parseInt(last.id.replace('S', ''), 10);
        if (!isNaN(numPart)) nextNum = numPart + 1;
    }

    return `S${String(nextNum).padStart(3, '0')}`;
}

/**
 * Generate the next C-prefixed check ID.
 */
async function nextCheckId() {
    const last = await prisma.medicationCheck.findFirst({
        where: { id: { startsWith: 'C' } },
        orderBy: { id: 'desc' }
    });

    let nextNum = 1;
    if (last) {
        const numPart = parseInt(last.id.replace('C', ''), 10);
        if (!isNaN(numPart)) nextNum = numPart + 1;
    }

    return `C${String(nextNum).padStart(3, '0')}`;
}

class NursingService {
    /**
     * Get all patients
     */
    async getPatients() {
        const patients = await prisma.nursingPatient.findMany({
            orderBy: { id: 'asc' }
        });

        return patients.map(p => ({
            id: p.id,
            nome: p.nome,
            leito: p.leito,
            idade: p.idade,
            prontuario: p.prontuario
        }));
    }

    /**
     * Get prescriptions for a patient
     */
    async getPrescriptionsByPatient(patientId) {
        const prescriptions = await prisma.nursingPrescription.findMany({
            where: { patientId, status: 'ativa' },
            orderBy: { id: 'asc' }
        });

        return prescriptions.map(p => ({
            id: p.id,
            patientId: p.patientId,
            medicamento: p.medicamento,
            dose: p.dose,
            via: p.via,
            frequencia: p.frequencia,
            intervalHours: p.intervalHours,
            prescritor: p.prescritor,
            dataInicio: p.dataInicio,
            dataFim: p.dataFim,
            status: p.status
        }));
    }

    /**
     * Create a medication schedule (aprazamento).
     * Deletes existing schedule for the same prescription first, inside a transaction.
     */
    async createSchedule({ prescriptionId, patientId, horarios, criadoPor }) {
        const prescription = await prisma.nursingPrescription.findUnique({
            where: { id: prescriptionId }
        });

        if (!prescription) {
            throw new Error('Prescricao nao encontrada');
        }

        const schedId = await nextScheduleId();
        const resolvedPatientId = patientId || prescription.patientId;
        const resolvedHorarios = horarios || generateTimesFromFrequency(prescription.intervalHours);

        const schedule = await prisma.$transaction(async (tx) => {
            // Remove existing schedule for this prescription
            await tx.medicationSchedule.deleteMany({
                where: { prescriptionId }
            });

            return tx.medicationSchedule.create({
                data: {
                    id: schedId,
                    prescriptionId,
                    patientId: resolvedPatientId,
                    medicamento: prescription.medicamento,
                    dose: prescription.dose,
                    via: prescription.via,
                    horarios: resolvedHorarios,
                    criadoPor: criadoPor || 'Enfermeiro(a)'
                }
            });
        });

        return {
            id: schedule.id,
            prescriptionId: schedule.prescriptionId,
            patientId: schedule.patientId,
            medicamento: schedule.medicamento,
            dose: schedule.dose,
            via: schedule.via,
            horarios: schedule.horarios,
            criadoPor: schedule.criadoPor,
            criadoEm: schedule.createdAt.toISOString()
        };
    }

    /**
     * Get schedules for a patient
     */
    async getSchedulesByPatient(patientId) {
        const schedules = await prisma.medicationSchedule.findMany({
            where: { patientId },
            orderBy: { id: 'asc' }
        });

        return schedules.map(s => ({
            id: s.id,
            prescriptionId: s.prescriptionId,
            patientId: s.patientId,
            medicamento: s.medicamento,
            dose: s.dose,
            via: s.via,
            horarios: s.horarios,
            criadoPor: s.criadoPor,
            criadoEm: s.createdAt.toISOString()
        }));
    }

    /**
     * Get all schedules
     */
    async getAllSchedules() {
        const schedules = await prisma.medicationSchedule.findMany({
            orderBy: { id: 'asc' }
        });

        return schedules.map(s => ({
            id: s.id,
            prescriptionId: s.prescriptionId,
            patientId: s.patientId,
            medicamento: s.medicamento,
            dose: s.dose,
            via: s.via,
            horarios: s.horarios,
            criadoPor: s.criadoPor,
            criadoEm: s.createdAt.toISOString()
        }));
    }

    /**
     * Record a medication administration (checagem)
     */
    async checkMedication({ scheduleId, prescriptionId, patientId, medicamento, dose, via, horarioPrevisto, horarioReal, data, responsavel, observacoes }) {
        const checkId = await nextCheckId();

        const check = await prisma.medicationCheck.create({
            data: {
                id: checkId,
                scheduleId,
                prescriptionId,
                patientId,
                medicamento,
                dose,
                via,
                horarioPrevisto,
                horarioReal: horarioReal || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                data: data || new Date().toISOString().split('T')[0],
                status: 'administrado',
                responsavel: responsavel || 'Enfermeiro(a)',
                observacoes: observacoes || ''
            }
        });

        return {
            id: check.id,
            scheduleId: check.scheduleId,
            prescriptionId: check.prescriptionId,
            patientId: check.patientId,
            medicamento: check.medicamento,
            dose: check.dose,
            via: check.via,
            horarioPrevisto: check.horarioPrevisto,
            horarioReal: check.horarioReal,
            data: check.data,
            status: check.status,
            responsavel: check.responsavel,
            observacoes: check.observacoes
        };
    }

    /**
     * Get checks for a patient (or all checks if no patientId)
     */
    async getChecks(patientId) {
        const where = {};
        if (patientId) {
            where.patientId = patientId;
        }

        const checks = await prisma.medicationCheck.findMany({
            where,
            orderBy: { id: 'asc' }
        });

        return checks.map(c => ({
            id: c.id,
            scheduleId: c.scheduleId,
            prescriptionId: c.prescriptionId,
            patientId: c.patientId,
            medicamento: c.medicamento,
            dose: c.dose,
            via: c.via,
            horarioPrevisto: c.horarioPrevisto,
            horarioReal: c.horarioReal,
            data: c.data,
            status: c.status,
            responsavel: c.responsavel,
            observacoes: c.observacoes
        }));
    }

    /**
     * Get pending medications - those scheduled but not yet checked for today
     */
    async getPendingMedications() {
        const today = new Date().toISOString().split('T')[0];
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();

        // Fetch all schedules with their patient info
        const schedules = await prisma.medicationSchedule.findMany({
            include: { patient: true }
        });

        // Fetch today's checks in a single query
        const todayChecks = await prisma.medicationCheck.findMany({
            where: { data: today }
        });

        const pending = [];

        for (const schedule of schedules) {
            const patient = schedule.patient;
            if (!patient) continue;

            for (const horario of schedule.horarios) {
                // Check if already administered today at this time
                const alreadyChecked = todayChecks.some(
                    c => c.scheduleId === schedule.id &&
                        c.horarioPrevisto === horario &&
                        c.data === today
                );

                // Determine status
                let status = 'pendente';
                if (alreadyChecked) {
                    status = 'administrado';
                } else {
                    const [schedHour, schedMin] = horario.split(':').map(Number);
                    const schedTotalMin = schedHour * 60 + schedMin;
                    const currentTotalMin = currentHour * 60 + currentMinute;

                    if (currentTotalMin > schedTotalMin + 30) {
                        status = 'atrasado';
                    }
                }

                pending.push({
                    scheduleId: schedule.id,
                    prescriptionId: schedule.prescriptionId,
                    patientId: schedule.patientId,
                    paciente: patient.nome,
                    leito: patient.leito,
                    medicamento: schedule.medicamento,
                    dose: schedule.dose,
                    via: schedule.via,
                    horarioPrevisto: horario,
                    data: today,
                    status
                });
            }
        }

        // Sort by scheduled time
        pending.sort((a, b) => a.horarioPrevisto.localeCompare(b.horarioPrevisto));

        return pending;
    }

    /**
     * Generate suggested times for a given frequency
     */
    suggestTimes(intervalHours, baseHour = 6) {
        return generateTimesFromFrequency(intervalHours, baseHour);
    }
}

export const nursingService = new NursingService();
export default nursingService;
