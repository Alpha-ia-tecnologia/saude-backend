// Pharmacy Service - Lot Tracking & Prescription Explosion
// RF14 - Controle de Lotes e Validades
// RF15 - Explosão de Prescrição (pick list para separação)

import prisma from '../lib/prisma.js';

class PharmacyService {
    /**
     * Get full inventory with lot details per medication
     */
    async getInventory() {
        const medications = await prisma.medication.findMany({
            include: {
                lots: {
                    orderBy: { validade: 'asc' } // FIFO order
                }
            },
            orderBy: { nome: 'asc' }
        });

        const now = new Date();

        return medications.map(med => {
            const medLots = med.lots;
            const quantidadeTotal = medLots.reduce((sum, l) => sum + l.quantidade, 0);

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
                id: med.id,
                nome: med.nome,
                concentracao: med.concentracao,
                forma: med.forma,
                categoria: med.categoria,
                lotes: medLots,
                quantidadeTotal,
                status
            };
        });
    }

    /**
     * Add a new lot to inventory
     */
    async addLot({ medicationId, lote, validade, quantidade, fabricante }) {
        const medication = await prisma.medication.findUnique({ where: { id: medicationId } });
        if (!medication) {
            throw new Error('Medicamento não encontrado');
        }

        // Generate LOT-XXX id by counting existing lots
        const lotCount = await prisma.lot.count();
        const newId = `LOT${String(lotCount + 1).padStart(3, '0')}`;

        const newLot = await prisma.lot.create({
            data: {
                id: newId,
                medicationId,
                lote,
                validade,
                quantidade: parseInt(quantidade, 10),
                fabricante: fabricante || 'Não informado',
                dataRecebimento: new Date().toISOString().split('T')[0]
            }
        });

        return newLot;
    }

    /**
     * Get lots for a specific medication
     */
    async getLotsByMedication(medicationId) {
        return prisma.lot.findMany({
            where: { medicationId },
            orderBy: { validade: 'asc' }
        });
    }

    /**
     * Get medications expiring within a given number of days (default 90)
     */
    async getExpiringMedications(days = 90) {
        const now = new Date();
        const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        const lots = await prisma.lot.findMany({
            where: {
                quantidade: { gt: 0 }
            },
            include: {
                medication: true
            },
            orderBy: { validade: 'asc' }
        });

        const expiring = [];

        lots.forEach(lot => {
            const expiryDate = new Date(lot.validade);
            if (expiryDate <= threshold) {
                const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

                let urgencia = 'verde';
                if (daysUntilExpiry <= 0) urgencia = 'vencido';
                else if (daysUntilExpiry <= 30) urgencia = 'vermelho';
                else if (daysUntilExpiry <= 60) urgencia = 'amarelo';
                else if (daysUntilExpiry <= 90) urgencia = 'laranja';

                expiring.push({
                    id: lot.id,
                    medicationId: lot.medicationId,
                    lote: lot.lote,
                    validade: lot.validade,
                    quantidade: lot.quantidade,
                    fabricante: lot.fabricante,
                    dataRecebimento: lot.dataRecebimento,
                    medicamento: lot.medication
                        ? `${lot.medication.nome} ${lot.medication.concentracao}`
                        : 'Desconhecido',
                    forma: lot.medication?.forma,
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
     * Uses Prisma transaction for atomicity
     */
    async dispenseMedication({ medicationId, quantidade, paciente, responsavel }) {
        const medication = await prisma.medication.findUnique({ where: { id: medicationId } });
        if (!medication) throw new Error('Medicamento não encontrado');

        let remaining = parseInt(quantidade, 10);

        const medLots = await prisma.lot.findMany({
            where: { medicationId, quantidade: { gt: 0 } },
            orderBy: { validade: 'asc' } // FIFO
        });

        if (medLots.length === 0) throw new Error('Sem estoque disponível');

        const totalAvailable = medLots.reduce((sum, l) => sum + l.quantidade, 0);
        if (totalAvailable < remaining) throw new Error(`Estoque insuficiente. Disponível: ${totalAvailable}`);

        // Build the operations for the transaction
        const dispensedLots = [];
        const operations = [];

        for (const lot of medLots) {
            if (remaining <= 0) break;

            const dispensed = Math.min(lot.quantidade, remaining);
            remaining -= dispensed;

            // Generate dispensation ID
            const dispCount = await prisma.dispensation.count();
            const dispId = `DISP${String(dispCount + 1 + dispensedLots.length).padStart(3, '0')}`;

            const record = {
                id: dispId,
                prescriptionId: null,
                paciente: paciente || 'Não informado',
                medicamento: `${medication.nome} ${medication.concentracao}`,
                lote: lot.lote,
                quantidade: dispensed,
                responsavel: responsavel || 'Farmacêutico(a)',
                dataHora: new Date().toISOString()
            };

            operations.push(
                prisma.lot.update({
                    where: { id: lot.id },
                    data: { quantidade: lot.quantidade - dispensed }
                })
            );
            operations.push(
                prisma.dispensation.create({ data: record })
            );

            dispensedLots.push(record);
        }

        await prisma.$transaction(operations);

        return dispensedLots;
    }

    /**
     * Receive a prescription (prescription explosion)
     * Creates a pick list for the pharmacy technician
     */
    async receivePrescription({ paciente, prontuario, medico, itens }) {
        // Generate PRESC-XXX id
        const prescCount = await prisma.pharmacyPrescription.count();
        const prescId = `PRESC${String(prescCount + 1).padStart(3, '0')}`;

        const prescription = await prisma.pharmacyPrescription.create({
            data: {
                id: prescId,
                paciente,
                prontuario: prontuario || '',
                medico,
                dataHora: new Date().toISOString(),
                status: 'recebida',
                itens: {
                    create: itens.map(item => ({
                        medicationId: item.medicationId,
                        nome: item.nome,
                        quantidade: parseInt(item.quantidade, 10),
                        separado: false
                    }))
                }
            },
            include: { itens: true }
        });

        return {
            id: prescription.id,
            paciente: prescription.paciente,
            prontuario: prescription.prontuario,
            medico: prescription.medico,
            dataHora: prescription.dataHora,
            status: prescription.status,
            itens: prescription.itens.map(item => ({
                medicationId: item.medicationId,
                nome: item.nome,
                quantidade: item.quantidade,
                separado: item.separado
            }))
        };
    }

    /**
     * Get pending prescriptions (not yet fully dispensed)
     */
    async getPendingPrescriptions() {
        return prisma.pharmacyPrescription.findMany({
            where: {
                status: { in: ['recebida', 'em_separacao', 'separada'] }
            },
            include: { itens: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get all prescriptions
     */
    async getAllPrescriptions() {
        return prisma.pharmacyPrescription.findMany({
            include: { itens: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Mark items as separated in a prescription
     * Updates individual PrescriptionItems
     */
    async separateItems(prescriptionId, separatedItemIndexes) {
        const prescription = await prisma.pharmacyPrescription.findUnique({
            where: { id: prescriptionId },
            include: { itens: true }
        });
        if (!prescription) throw new Error('Prescrição não encontrada');

        const operations = [];

        if (separatedItemIndexes && separatedItemIndexes.length > 0) {
            separatedItemIndexes.forEach(idx => {
                if (prescription.itens[idx]) {
                    operations.push(
                        prisma.prescriptionItem.update({
                            where: { id: prescription.itens[idx].id },
                            data: { separado: true }
                        })
                    );
                }
            });
        } else {
            // Mark all items as separated
            prescription.itens.forEach(item => {
                operations.push(
                    prisma.prescriptionItem.update({
                        where: { id: item.id },
                        data: { separado: true }
                    })
                );
            });
        }

        if (operations.length > 0) {
            await prisma.$transaction(operations);
        }

        // Re-fetch to get updated state
        const updated = await prisma.pharmacyPrescription.findUnique({
            where: { id: prescriptionId },
            include: { itens: true }
        });

        // Update status based on separation progress
        const allSeparated = updated.itens.every(item => item.separado);
        const someSeparated = updated.itens.some(item => item.separado);

        let newStatus = updated.status;
        if (allSeparated) {
            newStatus = 'separada';
        } else if (someSeparated) {
            newStatus = 'em_separacao';
        }

        if (newStatus !== updated.status) {
            await prisma.pharmacyPrescription.update({
                where: { id: prescriptionId },
                data: { status: newStatus }
            });
        }

        return {
            ...updated,
            status: newStatus
        };
    }

    /**
     * Mark prescription as dispensed
     * Atomically updates prescription + creates dispensations + decrements lots (FIFO)
     */
    async dispensePrescription(prescriptionId, responsavel) {
        const prescription = await prisma.pharmacyPrescription.findUnique({
            where: { id: prescriptionId },
            include: { itens: true }
        });
        if (!prescription) throw new Error('Prescrição não encontrada');

        const dispCount = await prisma.dispensation.count();
        let dispIdx = 0;

        await prisma.$transaction(async (tx) => {
            // Update prescription status
            await tx.pharmacyPrescription.update({
                where: { id: prescriptionId },
                data: { status: 'dispensada' }
            });

            // For each item, dispense via FIFO
            for (const item of prescription.itens) {
                const medLots = await tx.lot.findMany({
                    where: { medicationId: item.medicationId, quantidade: { gt: 0 } },
                    orderBy: { validade: 'asc' }
                });

                let remaining = item.quantidade;

                for (const lot of medLots) {
                    if (remaining <= 0) break;
                    const dispensed = Math.min(lot.quantidade, remaining);

                    await tx.lot.update({
                        where: { id: lot.id },
                        data: { quantidade: lot.quantidade - dispensed }
                    });

                    remaining -= dispensed;

                    const dispId = `DISP${String(dispCount + 1 + dispIdx).padStart(3, '0')}`;
                    dispIdx++;

                    await tx.dispensation.create({
                        data: {
                            id: dispId,
                            prescriptionId,
                            paciente: prescription.paciente,
                            medicamento: item.nome,
                            lote: lot.lote,
                            quantidade: dispensed,
                            responsavel: responsavel || 'Farmacêutico(a)',
                            dataHora: new Date().toISOString()
                        }
                    });
                }
            }
        });

        // Return updated prescription
        return prisma.pharmacyPrescription.findUnique({
            where: { id: prescriptionId },
            include: { itens: true }
        });
    }

    /**
     * Get dispensation history
     */
    async getDispensations() {
        return prisma.dispensation.findMany({
            orderBy: { dataHora: 'desc' }
        });
    }

    /**
     * Get medications catalog (for selectors)
     */
    async getMedications() {
        return prisma.medication.findMany({
            orderBy: { nome: 'asc' }
        });
    }
}

export const pharmacyService = new PharmacyService();
export default pharmacyService;
