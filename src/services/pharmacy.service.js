// Pharmacy Service - Lot Tracking & Prescription Explosion
// RF14 - Controle de Lotes e Validades
// RF15 - Explosão de Prescrição (pick list para separação)

// In-memory data store

let nextLotId = 61;
let nextPrescriptionId = 6;
let nextDispensationId = 11;

// Medication catalog
const medications = [
    { id: 'MED001', nome: 'Losartana Potássica', concentracao: '50mg', forma: 'Comprimido', categoria: 'Anti-hipertensivo' },
    { id: 'MED002', nome: 'Metformina', concentracao: '850mg', forma: 'Comprimido', categoria: 'Antidiabético' },
    { id: 'MED003', nome: 'Omeprazol', concentracao: '20mg', forma: 'Cápsula', categoria: 'Antiulceroso' },
    { id: 'MED004', nome: 'Amoxicilina', concentracao: '500mg', forma: 'Cápsula', categoria: 'Antibiótico' },
    { id: 'MED005', nome: 'Dipirona Sódica', concentracao: '500mg', forma: 'Comprimido', categoria: 'Analgésico' },
    { id: 'MED006', nome: 'Salbutamol', concentracao: '100mcg', forma: 'Aerosol', categoria: 'Broncodilatador' },
    { id: 'MED007', nome: 'Atenolol', concentracao: '25mg', forma: 'Comprimido', categoria: 'Anti-hipertensivo' },
    { id: 'MED008', nome: 'Insulina NPH', concentracao: '100UI/ml', forma: 'Frasco', categoria: 'Antidiabético' },
    { id: 'MED009', nome: 'Ceftriaxona', concentracao: '1g', forma: 'Injetável', categoria: 'Antibiótico' },
    { id: 'MED010', nome: 'Enoxaparina', concentracao: '40mg', forma: 'Injetável', categoria: 'Anticoagulante' },
    { id: 'MED011', nome: 'Furosemida', concentracao: '40mg', forma: 'Comprimido', categoria: 'Diurético' },
    { id: 'MED012', nome: 'Paracetamol', concentracao: '750mg', forma: 'Comprimido', categoria: 'Analgésico' },
    { id: 'MED013', nome: 'Azitromicina', concentracao: '500mg', forma: 'Comprimido', categoria: 'Antibiótico' },
    { id: 'MED014', nome: 'Prednisona', concentracao: '20mg', forma: 'Comprimido', categoria: 'Anti-inflamatório' },
    { id: 'MED015', nome: 'Sinvastatina', concentracao: '20mg', forma: 'Comprimido', categoria: 'Hipolipemiante' },
    { id: 'MED016', nome: 'Captopril', concentracao: '25mg', forma: 'Comprimido', categoria: 'Anti-hipertensivo' },
    { id: 'MED017', nome: 'Ibuprofeno', concentracao: '600mg', forma: 'Comprimido', categoria: 'Anti-inflamatório' },
    { id: 'MED018', nome: 'Ciprofloxacino', concentracao: '500mg', forma: 'Comprimido', categoria: 'Antibiótico' },
    { id: 'MED019', nome: 'Dexametasona', concentracao: '4mg', forma: 'Comprimido', categoria: 'Anti-inflamatório' },
    { id: 'MED020', nome: 'Ranitidina', concentracao: '150mg', forma: 'Comprimido', categoria: 'Antiulceroso' },
    { id: 'MED021', nome: 'Metoclopramida', concentracao: '10mg', forma: 'Comprimido', categoria: 'Antiemético' },
    { id: 'MED022', nome: 'Hidroclorotiazida', concentracao: '25mg', forma: 'Comprimido', categoria: 'Diurético' },
];

// Lots with expiry dates (some near expiry for alerts)
let lots = [
    // Losartana - 3 lots
    { id: 'LOT001', medicationId: 'MED001', lote: 'LOS-2025-A01', validade: '2026-12-15', quantidade: 1200, fabricante: 'EMS', dataRecebimento: '2025-06-10' },
    { id: 'LOT002', medicationId: 'MED001', lote: 'LOS-2025-B02', validade: '2026-04-20', quantidade: 800, fabricante: 'EMS', dataRecebimento: '2025-09-15' },
    { id: 'LOT003', medicationId: 'MED001', lote: 'LOS-2026-A01', validade: '2027-08-30', quantidade: 500, fabricante: 'Medley', dataRecebimento: '2026-01-20' },
    // Metformina - 2 lots
    { id: 'LOT004', medicationId: 'MED002', lote: 'MET-2025-C01', validade: '2026-05-10', quantidade: 900, fabricante: 'Merck', dataRecebimento: '2025-07-01' },
    { id: 'LOT005', medicationId: 'MED002', lote: 'MET-2026-A01', validade: '2027-03-25', quantidade: 600, fabricante: 'Merck', dataRecebimento: '2026-02-10' },
    // Omeprazol - 3 lots (one expiring soon!)
    { id: 'LOT006', medicationId: 'MED003', lote: 'OME-2024-D02', validade: '2026-04-01', quantidade: 150, fabricante: 'Medley', dataRecebimento: '2024-12-01' },
    { id: 'LOT007', medicationId: 'MED003', lote: 'OME-2025-A01', validade: '2026-09-15', quantidade: 400, fabricante: 'Medley', dataRecebimento: '2025-05-20' },
    { id: 'LOT008', medicationId: 'MED003', lote: 'OME-2026-A01', validade: '2027-06-30', quantidade: 300, fabricante: 'EMS', dataRecebimento: '2026-01-15' },
    // Amoxicilina - 2 lots (one already expired!)
    { id: 'LOT009', medicationId: 'MED004', lote: 'AMO-2024-B01', validade: '2026-03-15', quantidade: 80, fabricante: 'Eurofarma', dataRecebimento: '2024-10-10' },
    { id: 'LOT010', medicationId: 'MED004', lote: 'AMO-2025-A01', validade: '2026-11-20', quantidade: 600, fabricante: 'Eurofarma', dataRecebimento: '2025-08-15' },
    // Dipirona - 3 lots
    { id: 'LOT011', medicationId: 'MED005', lote: 'DIP-2025-A01', validade: '2027-01-15', quantidade: 1500, fabricante: 'Neo Química', dataRecebimento: '2025-06-01' },
    { id: 'LOT012', medicationId: 'MED005', lote: 'DIP-2025-B01', validade: '2027-05-30', quantidade: 1000, fabricante: 'Neo Química', dataRecebimento: '2025-10-20' },
    { id: 'LOT013', medicationId: 'MED005', lote: 'DIP-2026-A01', validade: '2028-02-28', quantidade: 700, fabricante: 'EMS', dataRecebimento: '2026-02-01' },
    // Salbutamol - 2 lots (low stock)
    { id: 'LOT014', medicationId: 'MED006', lote: 'SAL-2025-A01', validade: '2026-06-30', quantidade: 25, fabricante: 'GSK', dataRecebimento: '2025-04-15' },
    { id: 'LOT015', medicationId: 'MED006', lote: 'SAL-2025-B01', validade: '2026-12-15', quantidade: 20, fabricante: 'GSK', dataRecebimento: '2025-11-01' },
    // Atenolol - 2 lots
    { id: 'LOT016', medicationId: 'MED007', lote: 'ATE-2025-A01', validade: '2026-09-20', quantidade: 700, fabricante: 'Biolab', dataRecebimento: '2025-05-10' },
    { id: 'LOT017', medicationId: 'MED007', lote: 'ATE-2026-A01', validade: '2027-06-15', quantidade: 500, fabricante: 'Biolab', dataRecebimento: '2026-01-25' },
    // Insulina NPH - 2 lots (temperature-sensitive)
    { id: 'LOT018', medicationId: 'MED008', lote: 'INS-2025-A01', validade: '2026-04-10', quantidade: 30, fabricante: 'Lilly', dataRecebimento: '2025-08-20' },
    { id: 'LOT019', medicationId: 'MED008', lote: 'INS-2026-A01', validade: '2027-02-28', quantidade: 50, fabricante: 'Lilly', dataRecebimento: '2026-02-15' },
    // Ceftriaxona - 2 lots
    { id: 'LOT020', medicationId: 'MED009', lote: 'CEF-2025-A01', validade: '2026-07-20', quantidade: 200, fabricante: 'Eurofarma', dataRecebimento: '2025-06-15' },
    { id: 'LOT021', medicationId: 'MED009', lote: 'CEF-2026-A01', validade: '2027-05-10', quantidade: 150, fabricante: 'EMS', dataRecebimento: '2026-01-10' },
    // Enoxaparina - 2 lots
    { id: 'LOT022', medicationId: 'MED010', lote: 'ENO-2025-B01', validade: '2026-08-15', quantidade: 100, fabricante: 'Sanofi', dataRecebimento: '2025-07-20' },
    { id: 'LOT023', medicationId: 'MED010', lote: 'ENO-2026-A01', validade: '2027-04-30', quantidade: 80, fabricante: 'Sanofi', dataRecebimento: '2026-02-01' },
    // Furosemida - 2 lots
    { id: 'LOT024', medicationId: 'MED011', lote: 'FUR-2025-A01', validade: '2026-10-10', quantidade: 500, fabricante: 'Neo Química', dataRecebimento: '2025-05-25' },
    { id: 'LOT025', medicationId: 'MED011', lote: 'FUR-2026-A01', validade: '2027-07-20', quantidade: 400, fabricante: 'EMS', dataRecebimento: '2026-01-30' },
    // Paracetamol - 3 lots
    { id: 'LOT026', medicationId: 'MED012', lote: 'PAR-2025-A01', validade: '2026-05-01', quantidade: 800, fabricante: 'Medley', dataRecebimento: '2025-04-10' },
    { id: 'LOT027', medicationId: 'MED012', lote: 'PAR-2025-B01', validade: '2026-11-30', quantidade: 1200, fabricante: 'Medley', dataRecebimento: '2025-09-15' },
    { id: 'LOT028', medicationId: 'MED012', lote: 'PAR-2026-A01', validade: '2027-08-15', quantidade: 600, fabricante: 'EMS', dataRecebimento: '2026-02-20' },
    // Azitromicina - 2 lots
    { id: 'LOT029', medicationId: 'MED013', lote: 'AZI-2025-A01', validade: '2026-06-15', quantidade: 300, fabricante: 'Eurofarma', dataRecebimento: '2025-06-01' },
    { id: 'LOT030', medicationId: 'MED013', lote: 'AZI-2026-A01', validade: '2027-03-20', quantidade: 200, fabricante: 'EMS', dataRecebimento: '2026-01-05' },
    // Prednisona - 2 lots
    { id: 'LOT031', medicationId: 'MED014', lote: 'PRE-2025-A01', validade: '2026-04-25', quantidade: 400, fabricante: 'EMS', dataRecebimento: '2025-05-15' },
    { id: 'LOT032', medicationId: 'MED014', lote: 'PRE-2026-A01', validade: '2027-01-10', quantidade: 350, fabricante: 'Medley', dataRecebimento: '2026-02-10' },
    // Sinvastatina - 2 lots
    { id: 'LOT033', medicationId: 'MED015', lote: 'SIN-2025-A01', validade: '2026-08-20', quantidade: 600, fabricante: 'Biolab', dataRecebimento: '2025-07-10' },
    { id: 'LOT034', medicationId: 'MED015', lote: 'SIN-2026-A01', validade: '2027-05-15', quantidade: 450, fabricante: 'EMS', dataRecebimento: '2026-01-20' },
    // Captopril - 2 lots (one expiring very soon)
    { id: 'LOT035', medicationId: 'MED016', lote: 'CAP-2024-C01', validade: '2026-03-20', quantidade: 60, fabricante: 'Biolab', dataRecebimento: '2024-11-15' },
    { id: 'LOT036', medicationId: 'MED016', lote: 'CAP-2025-A01', validade: '2026-10-30', quantidade: 500, fabricante: 'EMS', dataRecebimento: '2025-08-01' },
    // Ibuprofeno - 2 lots
    { id: 'LOT037', medicationId: 'MED017', lote: 'IBU-2025-A01', validade: '2026-07-10', quantidade: 700, fabricante: 'Neo Química', dataRecebimento: '2025-06-20' },
    { id: 'LOT038', medicationId: 'MED017', lote: 'IBU-2026-A01', validade: '2027-04-25', quantidade: 500, fabricante: 'Medley', dataRecebimento: '2026-02-05' },
    // Ciprofloxacino - 2 lots
    { id: 'LOT039', medicationId: 'MED018', lote: 'CIP-2025-A01', validade: '2026-09-05', quantidade: 250, fabricante: 'Eurofarma', dataRecebimento: '2025-07-15' },
    { id: 'LOT040', medicationId: 'MED018', lote: 'CIP-2026-A01', validade: '2027-06-20', quantidade: 200, fabricante: 'EMS', dataRecebimento: '2026-01-28' },
    // Dexametasona - 2 lots
    { id: 'LOT041', medicationId: 'MED019', lote: 'DEX-2025-B01', validade: '2026-05-18', quantidade: 350, fabricante: 'EMS', dataRecebimento: '2025-08-10' },
    { id: 'LOT042', medicationId: 'MED019', lote: 'DEX-2026-A01', validade: '2027-02-14', quantidade: 300, fabricante: 'Medley', dataRecebimento: '2026-02-12' },
    // Ranitidina - 2 lots
    { id: 'LOT043', medicationId: 'MED020', lote: 'RAN-2025-A01', validade: '2026-06-28', quantidade: 450, fabricante: 'Medley', dataRecebimento: '2025-05-05' },
    { id: 'LOT044', medicationId: 'MED020', lote: 'RAN-2026-A01', validade: '2027-03-10', quantidade: 300, fabricante: 'EMS', dataRecebimento: '2026-01-15' },
    // Metoclopramida - 2 lots
    { id: 'LOT045', medicationId: 'MED021', lote: 'MTC-2025-A01', validade: '2026-04-05', quantidade: 200, fabricante: 'Neo Química', dataRecebimento: '2025-04-20' },
    { id: 'LOT046', medicationId: 'MED021', lote: 'MTC-2026-A01', validade: '2027-01-25', quantidade: 250, fabricante: 'EMS', dataRecebimento: '2026-02-08' },
    // Hidroclorotiazida - 2 lots
    { id: 'LOT047', medicationId: 'MED022', lote: 'HCT-2025-A01', validade: '2026-08-12', quantidade: 550, fabricante: 'EMS', dataRecebimento: '2025-06-25' },
    { id: 'LOT048', medicationId: 'MED022', lote: 'HCT-2026-A01', validade: '2027-05-05', quantidade: 400, fabricante: 'Biolab', dataRecebimento: '2026-01-18' },
];

// Pending prescriptions (from doctors) waiting to be separated by pharmacy
let prescriptions = [
    {
        id: 'PRESC001',
        paciente: 'Maria Silva Santos',
        prontuario: 'PRONT-2025-0012',
        medico: 'Dr. Carlos Oliveira',
        dataHora: '2026-03-14T08:30:00',
        status: 'recebida',
        itens: [
            { medicationId: 'MED001', nome: 'Losartana Potássica 50mg', quantidade: 30, separado: false },
            { medicationId: 'MED005', nome: 'Dipirona Sódica 500mg', quantidade: 20, separado: false },
            { medicationId: 'MED008', nome: 'Insulina NPH 100UI/ml', quantidade: 2, separado: false }
        ]
    },
    {
        id: 'PRESC002',
        paciente: 'José Carlos Oliveira',
        prontuario: 'PRONT-2025-0034',
        medico: 'Dra. Ana Santos',
        dataHora: '2026-03-14T09:15:00',
        status: 'recebida',
        itens: [
            { medicationId: 'MED009', nome: 'Ceftriaxona 1g', quantidade: 14, separado: false },
            { medicationId: 'MED003', nome: 'Omeprazol 20mg', quantidade: 7, separado: false }
        ]
    },
    {
        id: 'PRESC003',
        paciente: 'Ana Paula Ferreira',
        prontuario: 'PRONT-2025-0056',
        medico: 'Dr. Paulo Lima',
        dataHora: '2026-03-14T07:45:00',
        status: 'em_separacao',
        itens: [
            { medicationId: 'MED010', nome: 'Enoxaparina 40mg', quantidade: 7, separado: true },
            { medicationId: 'MED005', nome: 'Dipirona Sódica 500mg', quantidade: 28, separado: true },
            { medicationId: 'MED019', nome: 'Dexametasona 4mg', quantidade: 5, separado: false }
        ]
    },
    {
        id: 'PRESC004',
        paciente: 'Pedro Henrique Lima',
        prontuario: 'PRONT-2025-0078',
        medico: 'Dr. Carlos Oliveira',
        dataHora: '2026-03-13T14:20:00',
        status: 'separada',
        itens: [
            { medicationId: 'MED007', nome: 'Atenolol 25mg', quantidade: 14, separado: true },
            { medicationId: 'MED002', nome: 'Metformina 850mg', quantidade: 42, separado: true },
            { medicationId: 'MED011', nome: 'Furosemida 40mg', quantidade: 28, separado: true }
        ]
    },
    {
        id: 'PRESC005',
        paciente: 'Luísa Mendes Costa',
        prontuario: 'PRONT-2025-0090',
        medico: 'Dra. Ana Santos',
        dataHora: '2026-03-13T10:00:00',
        status: 'dispensada',
        itens: [
            { medicationId: 'MED015', nome: 'Sinvastatina 20mg', quantidade: 30, separado: true },
            { medicationId: 'MED016', nome: 'Captopril 25mg', quantidade: 60, separado: true },
            { medicationId: 'MED012', nome: 'Paracetamol 750mg', quantidade: 10, separado: true }
        ]
    }
];

// Dispensation records
let dispensations = [
    { id: 'DISP001', prescriptionId: 'PRESC005', paciente: 'Luísa Mendes Costa', medicamento: 'Sinvastatina 20mg', lote: 'SIN-2025-A01', quantidade: 30, responsavel: 'Farm. Juliana Rocha', dataHora: '2026-03-13T11:30:00' },
    { id: 'DISP002', prescriptionId: 'PRESC005', paciente: 'Luísa Mendes Costa', medicamento: 'Captopril 25mg', lote: 'CAP-2024-C01', quantidade: 60, responsavel: 'Farm. Juliana Rocha', dataHora: '2026-03-13T11:30:00' },
    { id: 'DISP003', prescriptionId: 'PRESC005', paciente: 'Luísa Mendes Costa', medicamento: 'Paracetamol 750mg', lote: 'PAR-2025-A01', quantidade: 10, responsavel: 'Farm. Juliana Rocha', dataHora: '2026-03-13T11:30:00' },
    { id: 'DISP004', prescriptionId: null, paciente: 'Carlos Alberto Souza', medicamento: 'Losartana Potássica 50mg', lote: 'LOS-2025-A01', quantidade: 30, responsavel: 'Farm. Ricardo Mendes', dataHora: '2026-03-13T14:00:00' },
    { id: 'DISP005', prescriptionId: null, paciente: 'Fernanda Lima', medicamento: 'Ibuprofeno 600mg', lote: 'IBU-2025-A01', quantidade: 12, responsavel: 'Farm. Juliana Rocha', dataHora: '2026-03-13T15:20:00' },
    { id: 'DISP006', prescriptionId: null, paciente: 'Roberto Nascimento', medicamento: 'Azitromicina 500mg', lote: 'AZI-2025-A01', quantidade: 3, responsavel: 'Farm. Ricardo Mendes', dataHora: '2026-03-14T08:00:00' },
    { id: 'DISP007', prescriptionId: null, paciente: 'Patrícia Gomes', medicamento: 'Omeprazol 20mg', lote: 'OME-2024-D02', quantidade: 30, responsavel: 'Farm. Juliana Rocha', dataHora: '2026-03-14T08:45:00' },
    { id: 'DISP008', prescriptionId: null, paciente: 'Marcos Almeida', medicamento: 'Atenolol 25mg', lote: 'ATE-2025-A01', quantidade: 30, responsavel: 'Farm. Ricardo Mendes', dataHora: '2026-03-14T09:10:00' },
    { id: 'DISP009', prescriptionId: null, paciente: 'Juliana Ferreira', medicamento: 'Metformina 850mg', lote: 'MET-2025-C01', quantidade: 60, responsavel: 'Farm. Juliana Rocha', dataHora: '2026-03-14T09:30:00' },
    { id: 'DISP010', prescriptionId: null, paciente: 'Eduardo Santos', medicamento: 'Dipirona Sódica 500mg', lote: 'DIP-2025-A01', quantidade: 10, responsavel: 'Farm. Ricardo Mendes', dataHora: '2026-03-14T10:15:00' },
];

class PharmacyService {
    /**
     * Get full inventory with lot details per medication
     */
    getInventory() {
        return medications.map(med => {
            const medLots = lots
                .filter(l => l.medicationId === med.id)
                .sort((a, b) => new Date(a.validade) - new Date(b.validade)); // FIFO order

            const quantidadeTotal = medLots.reduce((sum, l) => sum + l.quantidade, 0);
            const now = new Date();

            // Determine overall status
            let status = 'disponivel';
            const hasExpiringSoon = medLots.some(l => {
                const diff = new Date(l.validade) - now;
                return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
            });
            const hasExpired = medLots.some(l => new Date(l.validade) < now);

            if (quantidadeTotal === 0) {
                status = 'esgotado';
            } else if (hasExpired) {
                status = 'vencido';
            } else if (hasExpiringSoon) {
                status = 'vencendo';
            } else if (quantidadeTotal < 100) {
                status = 'baixo';
            }

            return {
                ...med,
                lotes: medLots,
                quantidadeTotal,
                status
            };
        });
    }

    /**
     * Add a new lot to inventory
     */
    addLot({ medicationId, lote, validade, quantidade, fabricante }) {
        const medication = medications.find(m => m.id === medicationId);
        if (!medication) {
            throw new Error('Medicamento não encontrado');
        }

        const newLot = {
            id: `LOT${String(nextLotId++).padStart(3, '0')}`,
            medicationId,
            lote,
            validade,
            quantidade: parseInt(quantidade, 10),
            fabricante: fabricante || 'Não informado',
            dataRecebimento: new Date().toISOString().split('T')[0]
        };

        lots.push(newLot);
        return newLot;
    }

    /**
     * Get lots for a specific medication
     */
    getLotsByMedication(medicationId) {
        return lots
            .filter(l => l.medicationId === medicationId)
            .sort((a, b) => new Date(a.validade) - new Date(b.validade));
    }

    /**
     * Get medications expiring within a given number of days (default 90)
     */
    getExpiringMedications(days = 90) {
        const now = new Date();
        const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        const expiring = [];

        lots.forEach(lot => {
            const expiryDate = new Date(lot.validade);
            if (expiryDate <= threshold && lot.quantidade > 0) {
                const medication = medications.find(m => m.id === lot.medicationId);
                const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

                let urgencia = 'verde';
                if (daysUntilExpiry <= 0) urgencia = 'vencido';
                else if (daysUntilExpiry <= 30) urgencia = 'vermelho';
                else if (daysUntilExpiry <= 60) urgencia = 'amarelo';
                else if (daysUntilExpiry <= 90) urgencia = 'laranja';

                expiring.push({
                    ...lot,
                    medicamento: medication ? `${medication.nome} ${medication.concentracao}` : 'Desconhecido',
                    forma: medication?.forma,
                    diasParaVencer: daysUntilExpiry,
                    urgencia
                });
            }
        });

        // Sort by days until expiry (most urgent first)
        expiring.sort((a, b) => a.diasParaVencer - b.diasParaVencer);

        return expiring;
    }

    /**
     * Dispense medication using FIFO (oldest lot first)
     */
    dispenseMedication({ medicationId, quantidade, paciente, responsavel }) {
        const medication = medications.find(m => m.id === medicationId);
        if (!medication) throw new Error('Medicamento não encontrado');

        let remaining = parseInt(quantidade, 10);
        const medLots = lots
            .filter(l => l.medicationId === medicationId && l.quantidade > 0)
            .sort((a, b) => new Date(a.validade) - new Date(b.validade)); // FIFO

        if (medLots.length === 0) throw new Error('Sem estoque disponível');

        const totalAvailable = medLots.reduce((sum, l) => sum + l.quantidade, 0);
        if (totalAvailable < remaining) throw new Error(`Estoque insuficiente. Disponível: ${totalAvailable}`);

        const dispensedLots = [];

        for (const lot of medLots) {
            if (remaining <= 0) break;

            const dispensed = Math.min(lot.quantidade, remaining);
            lot.quantidade -= dispensed;
            remaining -= dispensed;

            const record = {
                id: `DISP${String(nextDispensationId++).padStart(3, '0')}`,
                prescriptionId: null,
                paciente: paciente || 'Não informado',
                medicamento: `${medication.nome} ${medication.concentracao}`,
                lote: lot.lote,
                quantidade: dispensed,
                responsavel: responsavel || 'Farmacêutico(a)',
                dataHora: new Date().toISOString()
            };

            dispensations.push(record);
            dispensedLots.push(record);
        }

        return dispensedLots;
    }

    /**
     * Receive a prescription (prescription explosion)
     * Creates a pick list for the pharmacy technician
     */
    receivePrescription({ paciente, prontuario, medico, itens }) {
        const prescription = {
            id: `PRESC${String(nextPrescriptionId++).padStart(3, '0')}`,
            paciente,
            prontuario: prontuario || '',
            medico,
            dataHora: new Date().toISOString(),
            status: 'recebida',
            itens: itens.map(item => ({
                medicationId: item.medicationId,
                nome: item.nome,
                quantidade: parseInt(item.quantidade, 10),
                separado: false
            }))
        };

        prescriptions.push(prescription);
        return prescription;
    }

    /**
     * Get pending prescriptions (not yet fully dispensed)
     */
    getPendingPrescriptions() {
        return prescriptions.filter(p =>
            p.status === 'recebida' || p.status === 'em_separacao' || p.status === 'separada'
        );
    }

    /**
     * Get all prescriptions
     */
    getAllPrescriptions() {
        return prescriptions;
    }

    /**
     * Mark items as separated in a prescription
     */
    separateItems(prescriptionId, separatedItemIndexes) {
        const prescription = prescriptions.find(p => p.id === prescriptionId);
        if (!prescription) throw new Error('Prescrição não encontrada');

        if (separatedItemIndexes && separatedItemIndexes.length > 0) {
            separatedItemIndexes.forEach(idx => {
                if (prescription.itens[idx]) {
                    prescription.itens[idx].separado = true;
                }
            });
        } else {
            // Mark all items as separated
            prescription.itens.forEach(item => { item.separado = true; });
        }

        // Update status based on separation progress
        const allSeparated = prescription.itens.every(item => item.separado);
        const someSeparated = prescription.itens.some(item => item.separado);

        if (allSeparated) {
            prescription.status = 'separada';
        } else if (someSeparated) {
            prescription.status = 'em_separacao';
        }

        return prescription;
    }

    /**
     * Mark prescription as dispensed
     */
    dispensePrescription(prescriptionId, responsavel) {
        const prescription = prescriptions.find(p => p.id === prescriptionId);
        if (!prescription) throw new Error('Prescrição não encontrada');

        prescription.status = 'dispensada';

        // Record dispensation for each item
        prescription.itens.forEach(item => {
            const medLots = lots
                .filter(l => l.medicationId === item.medicationId && l.quantidade > 0)
                .sort((a, b) => new Date(a.validade) - new Date(b.validade));

            let remaining = item.quantidade;

            for (const lot of medLots) {
                if (remaining <= 0) break;
                const dispensed = Math.min(lot.quantidade, remaining);
                lot.quantidade -= dispensed;
                remaining -= dispensed;

                dispensations.push({
                    id: `DISP${String(nextDispensationId++).padStart(3, '0')}`,
                    prescriptionId,
                    paciente: prescription.paciente,
                    medicamento: item.nome,
                    lote: lot.lote,
                    quantidade: dispensed,
                    responsavel: responsavel || 'Farmacêutico(a)',
                    dataHora: new Date().toISOString()
                });
            }
        });

        return prescription;
    }

    /**
     * Get dispensation history
     */
    getDispensations() {
        return dispensations.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
    }

    /**
     * Get medications catalog (for selectors)
     */
    getMedications() {
        return medications;
    }
}

export const pharmacyService = new PharmacyService();
export default pharmacyService;
