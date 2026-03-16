// Panel Service - Painel de Chamadas de Pacientes (PEC/SUS)
// Sistema de gerenciamento de senhas e chamadas para unidades de saude

import prisma from '../lib/prisma.js';

class PanelService {
    /**
     * Listar todos os guiches/salas de atendimento
     */
    async getGuiches() {
        return prisma.guiche.findMany();
    }

    /**
     * Listar senhas, com filtro opcional por status
     */
    async getSenhas(status = null) {
        const where = status ? { status } : {};
        return prisma.senha.findMany({ where, orderBy: { criadoEm: 'asc' } });
    }

    /**
     * Obter a senha atual sendo chamada e as ultimas 5 chamadas
     */
    async getSenhaAtual() {
        const senhaAtual = await prisma.senha.findFirst({
            where: { status: 'chamando' },
            include: { guiche: true }
        });

        const chamadaAtual = senhaAtual ? {
            ...senhaAtual,
            guiche: senhaAtual.guiche,
            profissional: senhaAtual.guiche?.profissional || null
        } : null;

        // Ultimas 5 chamadas do historico (mais recentes primeiro)
        const ultimasChamadas = await prisma.historicoChamada.findMany({
            orderBy: { chamadoEm: 'desc' },
            take: 5
        });

        // Aguardando info
        const aguardandoList = await prisma.senha.findMany({
            where: { status: 'aguardando' },
            orderBy: [
                { tipo: 'asc' }, // 'normal' > 'preferencial' alphabetically, so preferencial comes first when desc
                { criadoEm: 'asc' }
            ]
        });

        // Re-sort: preferencial first, then by criadoEm
        aguardandoList.sort((a, b) => {
            if (a.tipo === 'preferencial' && b.tipo !== 'preferencial') return -1;
            if (a.tipo !== 'preferencial' && b.tipo === 'preferencial') return 1;
            return new Date(a.criadoEm) - new Date(b.criadoEm);
        });

        return {
            chamadaAtual,
            ultimasChamadas,
            aguardando: {
                total: aguardandoList.length,
                proximas: aguardandoList.slice(0, 3)
            }
        };
    }

    /**
     * Criar nova senha
     * Computes next number from DB (query max P/N number)
     */
    async criarSenha({ paciente, cpf, tipo, prioridade }) {
        const isPreferencial = tipo === 'preferencial';
        const prefixo = isPreferencial ? 'P' : 'N';

        // Find the max number for this type from DB
        const maxSenha = await prisma.senha.findFirst({
            where: { tipo: tipo || 'normal' },
            orderBy: { numero: 'desc' },
            select: { numero: true }
        });

        let contador = 0;
        if (maxSenha) {
            // Extract numeric part, e.g. "P008" -> 8
            const numPart = maxSenha.numero.replace(/^[PN]/, '');
            contador = parseInt(numPart, 10) || 0;
        }
        contador++;
        const numero = `${prefixo}${String(contador).padStart(3, '0')}`;

        // Generate SEN-XXX id
        const senhaCount = await prisma.senha.count();
        const senhaId = `SEN-${String(senhaCount + 1).padStart(3, '0')}`;

        const novaSenha = await prisma.senha.create({
            data: {
                id: senhaId,
                numero,
                paciente,
                cpf: cpf || null,
                tipo: tipo || 'normal',
                status: 'aguardando',
                guicheId: null,
                prioridade: prioridade || 'normal',
                chamadoEm: null,
                atendidoEm: null
            }
        });

        return novaSenha;
    }

    /**
     * Chamar proxima senha (preferencial primeiro, depois por ordem de criacao)
     * Uses transaction for atomicity
     */
    async chamarProxima(guicheId) {
        const guiche = await prisma.guiche.findUnique({ where: { id: guicheId } });
        if (!guiche) {
            throw new Error('Guiche nao encontrado');
        }

        return prisma.$transaction(async (tx) => {
            // Desmarcar qualquer senha "chamando" neste guiche
            await tx.senha.updateMany({
                where: { status: 'chamando', guicheId },
                data: { status: 'aguardando', guicheId: null, chamadoEm: null }
            });

            // Find waiting tickets
            const aguardando = await tx.senha.findMany({
                where: { status: 'aguardando' },
                orderBy: { criadoEm: 'asc' }
            });

            if (aguardando.length === 0) {
                return null;
            }

            // Sort: preferencial first, then by criadoEm
            aguardando.sort((a, b) => {
                if (a.tipo === 'preferencial' && b.tipo !== 'preferencial') return -1;
                if (a.tipo !== 'preferencial' && b.tipo === 'preferencial') return 1;
                return new Date(a.criadoEm) - new Date(b.criadoEm);
            });

            const proxima = aguardando[0];
            const agora = new Date();

            const updatedSenha = await tx.senha.update({
                where: { id: proxima.id },
                data: {
                    status: 'chamando',
                    guicheId,
                    chamadoEm: agora
                }
            });

            // Generate HC-XXX id
            const hcCount = await tx.historicoChamada.count();
            const hcId = `HC-${String(hcCount + 1).padStart(3, '0')}`;

            const registro = await tx.historicoChamada.create({
                data: {
                    id: hcId,
                    senhaId: proxima.id,
                    numero: proxima.numero,
                    paciente: proxima.paciente,
                    guicheNome: guiche.nome,
                    profissional: guiche.profissional || '',
                    chamadoEm: agora
                }
            });

            return {
                senha: updatedSenha,
                guiche,
                chamada: registro
            };
        });
    }

    /**
     * Chamar uma senha especifica
     */
    async chamarSenha(senhaId, guicheId) {
        const senha = await prisma.senha.findUnique({ where: { id: senhaId } });
        if (!senha) {
            throw new Error('Senha nao encontrada');
        }

        const guiche = await prisma.guiche.findUnique({ where: { id: guicheId } });
        if (!guiche) {
            throw new Error('Guiche nao encontrado');
        }

        if (senha.status !== 'aguardando' && senha.status !== 'ausente') {
            throw new Error(`Senha com status "${senha.status}" nao pode ser chamada`);
        }

        return prisma.$transaction(async (tx) => {
            // Desmarcar qualquer senha "chamando" neste guiche
            await tx.senha.updateMany({
                where: { status: 'chamando', guicheId },
                data: { status: 'aguardando', guicheId: null, chamadoEm: null }
            });

            const agora = new Date();

            const updatedSenha = await tx.senha.update({
                where: { id: senhaId },
                data: {
                    status: 'chamando',
                    guicheId,
                    chamadoEm: agora
                }
            });

            const hcCount = await tx.historicoChamada.count();
            const hcId = `HC-${String(hcCount + 1).padStart(3, '0')}`;

            const registro = await tx.historicoChamada.create({
                data: {
                    id: hcId,
                    senhaId: senha.id,
                    numero: senha.numero,
                    paciente: senha.paciente,
                    guicheNome: guiche.nome,
                    profissional: guiche.profissional || '',
                    chamadoEm: agora
                }
            });

            return {
                senha: updatedSenha,
                guiche,
                chamada: registro
            };
        });
    }

    /**
     * Rechamar a mesma senha (registra nova entrada no historico)
     */
    async rechamar(senhaId) {
        const senha = await prisma.senha.findUnique({
            where: { id: senhaId },
            include: { guiche: true }
        });
        if (!senha) {
            throw new Error('Senha nao encontrada');
        }

        if (senha.status !== 'chamando') {
            throw new Error('Apenas senhas com status "chamando" podem ser rechamadas');
        }

        const agora = new Date();

        const updatedSenha = await prisma.senha.update({
            where: { id: senhaId },
            data: { chamadoEm: agora }
        });

        const hcCount = await prisma.historicoChamada.count();
        const hcId = `HC-${String(hcCount + 1).padStart(3, '0')}`;

        const registro = await prisma.historicoChamada.create({
            data: {
                id: hcId,
                senhaId: senha.id,
                numero: senha.numero,
                paciente: senha.paciente,
                guicheNome: senha.guiche ? senha.guiche.nome : 'Desconhecido',
                profissional: senha.guiche ? senha.guiche.profissional || '' : 'Desconhecido',
                chamadoEm: agora
            }
        });

        return {
            senha: updatedSenha,
            guiche: senha.guiche,
            chamada: registro
        };
    }

    /**
     * Iniciar atendimento (muda status para em_atendimento)
     */
    async iniciarAtendimento(senhaId) {
        const senha = await prisma.senha.findUnique({ where: { id: senhaId } });
        if (!senha) {
            throw new Error('Senha nao encontrada');
        }

        if (senha.status !== 'chamando') {
            throw new Error('Apenas senhas com status "chamando" podem iniciar atendimento');
        }

        return prisma.senha.update({
            where: { id: senhaId },
            data: { status: 'em_atendimento' }
        });
    }

    /**
     * Finalizar atendimento (muda status para atendido)
     */
    async finalizarAtendimento(senhaId) {
        const senha = await prisma.senha.findUnique({ where: { id: senhaId } });
        if (!senha) {
            throw new Error('Senha nao encontrada');
        }

        if (senha.status !== 'em_atendimento') {
            throw new Error('Apenas senhas com status "em_atendimento" podem ser finalizadas');
        }

        return prisma.senha.update({
            where: { id: senhaId },
            data: { status: 'atendido', atendidoEm: new Date() }
        });
    }

    /**
     * Marcar paciente como ausente
     */
    async marcarAusente(senhaId) {
        const senha = await prisma.senha.findUnique({ where: { id: senhaId } });
        if (!senha) {
            throw new Error('Senha nao encontrada');
        }

        if (senha.status !== 'chamando') {
            throw new Error('Apenas senhas com status "chamando" podem ser marcadas como ausente');
        }

        return prisma.senha.update({
            where: { id: senhaId },
            data: { status: 'ausente' }
        });
    }

    /**
     * Obter estatisticas do painel
     * Uses groupBy/count queries
     */
    async getEstatisticas() {
        const agora = new Date();

        const [
            totalSenhas,
            statusGroups,
            tipoGroups,
            prioridadeGroups,
            senhasComChamada,
            allSenhas
        ] = await Promise.all([
            prisma.senha.count(),
            prisma.senha.groupBy({
                by: ['status'],
                _count: { id: true }
            }),
            prisma.senha.groupBy({
                by: ['tipo'],
                _count: { id: true }
            }),
            prisma.senha.groupBy({
                by: ['prioridade'],
                _count: { id: true }
            }),
            prisma.senha.findMany({
                where: {
                    chamadoEm: { not: null }
                },
                select: { criadoEm: true, chamadoEm: true }
            }),
            prisma.senha.findMany({
                select: { criadoEm: true, status: true }
            })
        ]);

        // Build porStatus
        const porStatus = { aguardando: 0, chamando: 0, em_atendimento: 0, atendido: 0, ausente: 0 };
        statusGroups.forEach(g => {
            if (porStatus.hasOwnProperty(g.status)) {
                porStatus[g.status] = g._count.id;
            }
        });

        // Tempo medio de espera
        let tempoMedioEsperaMinutos = 0;
        if (senhasComChamada.length > 0) {
            const totalEspera = senhasComChamada.reduce((acc, s) => {
                return acc + (new Date(s.chamadoEm) - new Date(s.criadoEm));
            }, 0);
            tempoMedioEsperaMinutos = Math.round(totalEspera / senhasComChamada.length / 60000);
        }

        // Senhas por hora
        const senhasAtendidas = allSenhas.filter(s => s.status === 'atendido');
        let senhasPorHora = 0;
        if (senhasAtendidas.length > 0 && allSenhas.length > 0) {
            const primeiraSenha = allSenhas.reduce((min, s) => {
                const t = new Date(s.criadoEm);
                return t < min ? t : min;
            }, new Date());
            const horasDecorridas = Math.max(1, (agora - primeiraSenha) / 3600000);
            senhasPorHora = Math.round((senhasAtendidas.length / horasDecorridas) * 10) / 10;
        }

        // Build porTipo
        const porTipo = { normal: 0, preferencial: 0 };
        tipoGroups.forEach(g => {
            if (porTipo.hasOwnProperty(g.tipo)) {
                porTipo[g.tipo] = g._count.id;
            }
        });

        // Build porPrioridade
        const porPrioridade = { normal: 0, idoso: 0, gestante: 0, deficiente: 0, lactante: 0 };
        prioridadeGroups.forEach(g => {
            if (porPrioridade.hasOwnProperty(g.prioridade)) {
                porPrioridade[g.prioridade] = g._count.id;
            }
        });

        return {
            totalSenhas,
            aguardando: porStatus.aguardando,
            chamando: porStatus.chamando,
            em_atendimento: porStatus.em_atendimento,
            atendidos: porStatus.atendido,
            ausentes: porStatus.ausente,
            tempo_medio_espera: tempoMedioEsperaMinutos,
            porStatus,
            porTipo,
            porPrioridade,
            tempoMedioEsperaMinutos,
            senhasPorHora
        };
    }

    /**
     * Obter historico de chamadas (ultimas N)
     */
    async getHistoricoChamadas(limit = 20) {
        return prisma.historicoChamada.findMany({
            orderBy: { chamadoEm: 'desc' },
            take: limit
        });
    }

    /**
     * Resetar painel (limpar todas as senhas para novo dia)
     * Uses deleteMany
     */
    async resetarPainel() {
        const totalAnterior = await prisma.senha.count();

        // Delete in correct order to respect FK constraints
        await prisma.$transaction([
            prisma.historicoChamada.deleteMany(),
            prisma.senha.deleteMany()
        ]);

        return {
            mensagem: 'Painel resetado com sucesso',
            senhasRemovidas: totalAnterior,
            resetadoEm: new Date().toISOString()
        };
    }
}

export const panelService = new PanelService();
export default panelService;
