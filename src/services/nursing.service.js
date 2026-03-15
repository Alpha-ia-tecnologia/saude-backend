// Nursing Service - Aprazamento (medication scheduling) and Checagem (medication checking)
// RF12 - Aprazamento de Medicamentos
// RF13 - Checagem de Medicamentos

// In-memory data store

// Patients with active prescriptions
const patients = [
    {
        id: 'P001',
        nome: 'Maria Silva Santos',
        leito: 'Enf. A - Leito 12',
        idade: 68,
        prontuario: 'PRONT-2025-0012'
    },
    {
        id: 'P002',
        nome: 'José Carlos Oliveira',
        leito: 'Enf. B - Leito 04',
        idade: 55,
        prontuario: 'PRONT-2025-0034'
    },
    {
        id: 'P003',
        nome: 'Ana Paula Ferreira',
        leito: 'UTI - Leito 02',
        idade: 42,
        prontuario: 'PRONT-2025-0056'
    },
    {
        id: 'P004',
        nome: 'Pedro Henrique Lima',
        leito: 'Enf. A - Leito 08',
        idade: 73,
        prontuario: 'PRONT-2025-0078'
    }
];

// Active prescriptions
const prescriptions = [
    {
        id: 'RX001',
        patientId: 'P001',
        medicamento: 'Dipirona 500mg',
        dose: '1 comprimido',
        via: 'VO',
        frequencia: '6/6h',
        intervalHours: 6,
        prescritor: 'Dr. Carlos Oliveira',
        dataInicio: '2026-03-12',
        dataFim: '2026-03-19',
        status: 'ativa'
    },
    {
        id: 'RX002',
        patientId: 'P001',
        medicamento: 'Losartana 50mg',
        dose: '1 comprimido',
        via: 'VO',
        frequencia: '12/12h',
        intervalHours: 12,
        prescritor: 'Dr. Carlos Oliveira',
        dataInicio: '2026-03-10',
        dataFim: '2026-03-24',
        status: 'ativa'
    },
    {
        id: 'RX003',
        patientId: 'P001',
        medicamento: 'Insulina NPH 10UI',
        dose: '10 unidades',
        via: 'SC',
        frequencia: '12/12h',
        intervalHours: 12,
        prescritor: 'Dr. Carlos Oliveira',
        dataInicio: '2026-03-10',
        dataFim: '2026-03-24',
        status: 'ativa'
    },
    {
        id: 'RX004',
        patientId: 'P002',
        medicamento: 'Ceftriaxona 1g',
        dose: '1g diluído em 100ml SF',
        via: 'EV',
        frequencia: '12/12h',
        intervalHours: 12,
        prescritor: 'Dra. Ana Santos',
        dataInicio: '2026-03-11',
        dataFim: '2026-03-18',
        status: 'ativa'
    },
    {
        id: 'RX005',
        patientId: 'P002',
        medicamento: 'Omeprazol 40mg',
        dose: '1 comprimido',
        via: 'VO',
        frequencia: '1x/dia',
        intervalHours: 24,
        prescritor: 'Dra. Ana Santos',
        dataInicio: '2026-03-11',
        dataFim: '2026-03-18',
        status: 'ativa'
    },
    {
        id: 'RX006',
        patientId: 'P003',
        medicamento: 'Noradrenalina 8mg/4ml',
        dose: '0,1 mcg/kg/min',
        via: 'EV BIC',
        frequencia: 'contínuo',
        intervalHours: 0,
        prescritor: 'Dr. Paulo Lima',
        dataInicio: '2026-03-13',
        dataFim: '2026-03-16',
        status: 'ativa'
    },
    {
        id: 'RX007',
        patientId: 'P003',
        medicamento: 'Enoxaparina 40mg',
        dose: '40mg',
        via: 'SC',
        frequencia: '1x/dia',
        intervalHours: 24,
        prescritor: 'Dr. Paulo Lima',
        dataInicio: '2026-03-13',
        dataFim: '2026-03-20',
        status: 'ativa'
    },
    {
        id: 'RX008',
        patientId: 'P003',
        medicamento: 'Dipirona 1g EV',
        dose: '2ml diluído em 18ml AD',
        via: 'EV',
        frequencia: '6/6h',
        intervalHours: 6,
        prescritor: 'Dr. Paulo Lima',
        dataInicio: '2026-03-13',
        dataFim: '2026-03-16',
        status: 'ativa'
    },
    {
        id: 'RX009',
        patientId: 'P004',
        medicamento: 'Atenolol 50mg',
        dose: '1 comprimido',
        via: 'VO',
        frequencia: '1x/dia',
        intervalHours: 24,
        prescritor: 'Dr. Carlos Oliveira',
        dataInicio: '2026-03-12',
        dataFim: '2026-03-26',
        status: 'ativa'
    },
    {
        id: 'RX010',
        patientId: 'P004',
        medicamento: 'Metformina 850mg',
        dose: '1 comprimido',
        via: 'VO',
        frequencia: '8/8h',
        intervalHours: 8,
        prescritor: 'Dr. Carlos Oliveira',
        dataInicio: '2026-03-12',
        dataFim: '2026-03-26',
        status: 'ativa'
    },
    {
        id: 'RX011',
        patientId: 'P004',
        medicamento: 'Furosemida 40mg',
        dose: '1 comprimido',
        via: 'VO',
        frequencia: '12/12h',
        intervalHours: 12,
        prescritor: 'Dr. Carlos Oliveira',
        dataInicio: '2026-03-12',
        dataFim: '2026-03-26',
        status: 'ativa'
    }
];

// Medication schedules (aprazamento)
let schedules = [
    // Patient P001 - Maria Silva Santos
    { id: 'S001', prescriptionId: 'RX001', patientId: 'P001', medicamento: 'Dipirona 500mg', dose: '1 comprimido', via: 'VO', horarios: ['00:00', '06:00', '12:00', '18:00'], criadoPor: 'Enf. Carla Dias', criadoEm: '2026-03-12T08:00:00' },
    { id: 'S002', prescriptionId: 'RX002', patientId: 'P001', medicamento: 'Losartana 50mg', dose: '1 comprimido', via: 'VO', horarios: ['08:00', '20:00'], criadoPor: 'Enf. Carla Dias', criadoEm: '2026-03-12T08:00:00' },
    { id: 'S003', prescriptionId: 'RX003', patientId: 'P001', medicamento: 'Insulina NPH 10UI', dose: '10 unidades', via: 'SC', horarios: ['07:00', '19:00'], criadoPor: 'Enf. Carla Dias', criadoEm: '2026-03-12T08:00:00' },
    // Patient P002 - José Carlos Oliveira
    { id: 'S004', prescriptionId: 'RX004', patientId: 'P002', medicamento: 'Ceftriaxona 1g', dose: '1g diluído em 100ml SF', via: 'EV', horarios: ['06:00', '18:00'], criadoPor: 'Enf. Roberto Alves', criadoEm: '2026-03-11T14:00:00' },
    { id: 'S005', prescriptionId: 'RX005', patientId: 'P002', medicamento: 'Omeprazol 40mg', dose: '1 comprimido', via: 'VO', horarios: ['06:00'], criadoPor: 'Enf. Roberto Alves', criadoEm: '2026-03-11T14:00:00' },
    // Patient P004 - Pedro Henrique Lima
    { id: 'S006', prescriptionId: 'RX009', patientId: 'P004', medicamento: 'Atenolol 50mg', dose: '1 comprimido', via: 'VO', horarios: ['08:00'], criadoPor: 'Enf. Carla Dias', criadoEm: '2026-03-12T08:00:00' },
    { id: 'S007', prescriptionId: 'RX010', patientId: 'P004', medicamento: 'Metformina 850mg', dose: '1 comprimido', via: 'VO', horarios: ['06:00', '14:00', '22:00'], criadoPor: 'Enf. Carla Dias', criadoEm: '2026-03-12T08:00:00' },
    { id: 'S008', prescriptionId: 'RX011', patientId: 'P004', medicamento: 'Furosemida 40mg', dose: '1 comprimido', via: 'VO', horarios: ['08:00', '20:00'], criadoPor: 'Enf. Carla Dias', criadoEm: '2026-03-12T08:00:00' }
];

// Medication checks (checagem)
let checks = [
    { id: 'C001', scheduleId: 'S001', prescriptionId: 'RX001', patientId: 'P001', medicamento: 'Dipirona 500mg', dose: '1 comprimido', via: 'VO', horarioPrevisto: '06:00', horarioReal: '06:12', data: '2026-03-14', status: 'administrado', responsavel: 'Téc. Enf. Luciana Moraes', observacoes: 'Paciente aceitou bem a medicação.' },
    { id: 'C002', scheduleId: 'S002', prescriptionId: 'RX002', patientId: 'P001', medicamento: 'Losartana 50mg', dose: '1 comprimido', via: 'VO', horarioPrevisto: '08:00', horarioReal: '08:05', data: '2026-03-14', status: 'administrado', responsavel: 'Téc. Enf. Luciana Moraes', observacoes: '' },
    { id: 'C003', scheduleId: 'S003', prescriptionId: 'RX003', patientId: 'P001', medicamento: 'Insulina NPH 10UI', dose: '10 unidades', via: 'SC', horarioPrevisto: '07:00', horarioReal: '07:08', data: '2026-03-14', status: 'administrado', responsavel: 'Enf. Carla Dias', observacoes: 'Glicemia capilar pré: 187 mg/dL. Aplicação em região abdominal.' },
    { id: 'C004', scheduleId: 'S004', prescriptionId: 'RX004', patientId: 'P002', medicamento: 'Ceftriaxona 1g', dose: '1g diluído em 100ml SF', via: 'EV', horarioPrevisto: '06:00', horarioReal: '06:20', data: '2026-03-14', status: 'administrado', responsavel: 'Enf. Roberto Alves', observacoes: 'Infusão em 30 minutos. Sem reações adversas.' },
    { id: 'C005', scheduleId: 'S005', prescriptionId: 'RX005', patientId: 'P002', medicamento: 'Omeprazol 40mg', dose: '1 comprimido', via: 'VO', horarioPrevisto: '06:00', horarioReal: '06:05', data: '2026-03-14', status: 'administrado', responsavel: 'Téc. Enf. Luciana Moraes', observacoes: 'Administrado em jejum.' },
    { id: 'C006', scheduleId: 'S006', prescriptionId: 'RX009', patientId: 'P004', medicamento: 'Atenolol 50mg', dose: '1 comprimido', via: 'VO', horarioPrevisto: '08:00', horarioReal: '08:10', data: '2026-03-14', status: 'administrado', responsavel: 'Téc. Enf. Luciana Moraes', observacoes: 'PA pré: 148x92 mmHg. FC: 78 bpm.' },
    { id: 'C007', scheduleId: 'S007', prescriptionId: 'RX010', patientId: 'P004', medicamento: 'Metformina 850mg', dose: '1 comprimido', via: 'VO', horarioPrevisto: '06:00', horarioReal: '06:15', data: '2026-03-14', status: 'administrado', responsavel: 'Téc. Enf. Luciana Moraes', observacoes: '' },
    { id: 'C008', scheduleId: 'S008', prescriptionId: 'RX011', patientId: 'P004', medicamento: 'Furosemida 40mg', dose: '1 comprimido', via: 'VO', horarioPrevisto: '08:00', horarioReal: '08:12', data: '2026-03-14', status: 'administrado', responsavel: 'Téc. Enf. Luciana Moraes', observacoes: '' }
];

let nextScheduleId = 9;
let nextCheckId = 9;

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

class NursingService {
    /**
     * Get all patients
     */
    getPatients() {
        return patients;
    }

    /**
     * Get prescriptions for a patient
     */
    getPrescriptionsByPatient(patientId) {
        return prescriptions.filter(p => p.patientId === patientId && p.status === 'ativa');
    }

    /**
     * Create a medication schedule (aprazamento)
     */
    createSchedule({ prescriptionId, patientId, horarios, criadoPor }) {
        const prescription = prescriptions.find(p => p.id === prescriptionId);
        if (!prescription) {
            throw new Error('Prescrição não encontrada');
        }

        // Remove existing schedule for this prescription if any
        schedules = schedules.filter(s => s.prescriptionId !== prescriptionId);

        const schedule = {
            id: `S${String(nextScheduleId++).padStart(3, '0')}`,
            prescriptionId,
            patientId: patientId || prescription.patientId,
            medicamento: prescription.medicamento,
            dose: prescription.dose,
            via: prescription.via,
            horarios: horarios || generateTimesFromFrequency(prescription.intervalHours),
            criadoPor: criadoPor || 'Enfermeiro(a)',
            criadoEm: new Date().toISOString()
        };

        schedules.push(schedule);
        return schedule;
    }

    /**
     * Get schedules for a patient
     */
    getSchedulesByPatient(patientId) {
        return schedules.filter(s => s.patientId === patientId);
    }

    /**
     * Get all schedules
     */
    getAllSchedules() {
        return schedules;
    }

    /**
     * Record a medication administration (checagem)
     */
    checkMedication({ scheduleId, prescriptionId, patientId, medicamento, dose, via, horarioPrevisto, horarioReal, data, responsavel, observacoes }) {
        const check = {
            id: `C${String(nextCheckId++).padStart(3, '0')}`,
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
        };

        checks.push(check);
        return check;
    }

    /**
     * Get checks for a patient
     */
    getChecks(patientId) {
        if (patientId) {
            return checks.filter(c => c.patientId === patientId);
        }
        return checks;
    }

    /**
     * Get pending medications - those scheduled but not yet checked for today
     */
    getPendingMedications() {
        const today = new Date().toISOString().split('T')[0];
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

        const pending = [];

        schedules.forEach(schedule => {
            const patient = patients.find(p => p.id === schedule.patientId);
            if (!patient) return;

            schedule.horarios.forEach(horario => {
                // Check if already administered today at this time
                const alreadyChecked = checks.some(
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
            });
        });

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
