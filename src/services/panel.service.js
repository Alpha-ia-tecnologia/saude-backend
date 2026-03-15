// Panel Service - Painel de Chamadas de Pacientes (PEC/SUS)
// Sistema de gerenciamento de senhas e chamadas para unidades de saude

// Guiches/Salas de atendimento
const guiches = [
    { id: 'GUI-001', nome: 'Consultorio 01', tipo: 'consultorio', profissional: 'Dr. Carlos Oliveira', especialidade: 'Clinico Geral' },
    { id: 'GUI-002', nome: 'Consultorio 02', tipo: 'consultorio', profissional: 'Dra. Ana Santos', especialidade: 'Pediatria' },
    { id: 'GUI-003', nome: 'Consultorio 03', tipo: 'consultorio', profissional: 'Dr. Paulo Lima', especialidade: 'Ginecologia' },
    { id: 'GUI-004', nome: 'Sala de Vacina', tipo: 'sala', profissional: 'Enf. Maria Souza', especialidade: 'Imunizacao' },
    { id: 'GUI-005', nome: 'Sala de Procedimentos', tipo: 'sala', profissional: 'Enf. Carlos Lima', especialidade: 'Procedimentos' },
    { id: 'GUI-006', nome: 'Guiche 01 - Recepcao', tipo: 'guiche', profissional: 'Joana Ferreira', especialidade: 'Recepcao' },
    { id: 'GUI-007', nome: 'Guiche 02 - Farmacia', tipo: 'guiche', profissional: 'Farm. Juliana Rocha', especialidade: 'Farmacia' },
    { id: 'GUI-008', nome: 'Sala de Triagem', tipo: 'sala', profissional: 'Enf. Ana Paula', especialidade: 'Triagem' },
    { id: 'GUI-009', nome: 'Sala de Coleta', tipo: 'sala', profissional: 'Tec. Roberto Alves', especialidade: 'Laboratorio' },
    { id: 'GUI-010', nome: 'Sala de Curativo', tipo: 'sala', profissional: 'Enf. Patricia Gomes', especialidade: 'Curativos' },
];

// Contadores para geracao de senhas
let contadorNormal = 15;
let contadorPreferencial = 8;
let nextSenhaId = 16;
let nextHistoricoId = 9;

// Fila de senhas (pre-populada com diversas situacoes)
let senhas = [
    // Senhas ja atendidas
    {
        id: 'SEN-001', numero: 'P001', paciente: 'Maria da Conceicao Silva', cpf: '123.456.789-01',
        tipo: 'preferencial', status: 'atendido', guicheId: 'GUI-001', prioridade: 'idoso',
        criadoEm: new Date(Date.now() - 180 * 60000).toISOString(),
        chamadoEm: new Date(Date.now() - 170 * 60000).toISOString(),
        atendidoEm: new Date(Date.now() - 140 * 60000).toISOString()
    },
    {
        id: 'SEN-002', numero: 'N001', paciente: 'Jose Carlos Oliveira', cpf: '234.567.890-12',
        tipo: 'normal', status: 'atendido', guicheId: 'GUI-006', prioridade: 'normal',
        criadoEm: new Date(Date.now() - 175 * 60000).toISOString(),
        chamadoEm: new Date(Date.now() - 160 * 60000).toISOString(),
        atendidoEm: new Date(Date.now() - 150 * 60000).toISOString()
    },
    {
        id: 'SEN-003', numero: 'P002', paciente: 'Francisca Alves Mendes', cpf: '345.678.901-23',
        tipo: 'preferencial', status: 'atendido', guicheId: 'GUI-002', prioridade: 'gestante',
        criadoEm: new Date(Date.now() - 160 * 60000).toISOString(),
        chamadoEm: new Date(Date.now() - 145 * 60000).toISOString(),
        atendidoEm: new Date(Date.now() - 115 * 60000).toISOString()
    },
    {
        id: 'SEN-004', numero: 'N002', paciente: 'Antonio Pereira Lima', cpf: '456.789.012-34',
        tipo: 'normal', status: 'atendido', guicheId: 'GUI-004', prioridade: 'normal',
        criadoEm: new Date(Date.now() - 155 * 60000).toISOString(),
        chamadoEm: new Date(Date.now() - 130 * 60000).toISOString(),
        atendidoEm: new Date(Date.now() - 110 * 60000).toISOString()
    },
    // Senha marcada como ausente
    {
        id: 'SEN-005', numero: 'N003', paciente: 'Pedro Henrique Costa', cpf: '567.890.123-45',
        tipo: 'normal', status: 'ausente', guicheId: 'GUI-001', prioridade: 'normal',
        criadoEm: new Date(Date.now() - 140 * 60000).toISOString(),
        chamadoEm: new Date(Date.now() - 110 * 60000).toISOString(),
        atendidoEm: null
    },
    // Senhas em atendimento
    {
        id: 'SEN-006', numero: 'P003', paciente: 'Luiza Fernanda Rocha', cpf: '678.901.234-56',
        tipo: 'preferencial', status: 'em_atendimento', guicheId: 'GUI-001', prioridade: 'deficiente',
        criadoEm: new Date(Date.now() - 120 * 60000).toISOString(),
        chamadoEm: new Date(Date.now() - 90 * 60000).toISOString(),
        atendidoEm: null
    },
    {
        id: 'SEN-007', numero: 'N004', paciente: 'Roberto Santos Nascimento', cpf: '789.012.345-67',
        tipo: 'normal', status: 'em_atendimento', guicheId: 'GUI-006', prioridade: 'normal',
        criadoEm: new Date(Date.now() - 110 * 60000).toISOString(),
        chamadoEm: new Date(Date.now() - 80 * 60000).toISOString(),
        atendidoEm: null
    },
    // Senha sendo chamada agora
    {
        id: 'SEN-008', numero: 'P004', paciente: 'Ana Beatriz Souza', cpf: '890.123.456-78',
        tipo: 'preferencial', status: 'chamando', guicheId: 'GUI-002', prioridade: 'idoso',
        criadoEm: new Date(Date.now() - 100 * 60000).toISOString(),
        chamadoEm: new Date(Date.now() - 2 * 60000).toISOString(),
        atendidoEm: null
    },
    // Senhas aguardando
    {
        id: 'SEN-009', numero: 'P005', paciente: 'Raimunda Goncalves Ferreira', cpf: '901.234.567-89',
        tipo: 'preferencial', status: 'aguardando', guicheId: null, prioridade: 'idoso',
        criadoEm: new Date(Date.now() - 90 * 60000).toISOString(),
        chamadoEm: null, atendidoEm: null
    },
    {
        id: 'SEN-010', numero: 'N005', paciente: 'Fernando Augusto Dias', cpf: '012.345.678-90',
        tipo: 'normal', status: 'aguardando', guicheId: null, prioridade: 'normal',
        criadoEm: new Date(Date.now() - 85 * 60000).toISOString(),
        chamadoEm: null, atendidoEm: null
    },
    {
        id: 'SEN-011', numero: 'P006', paciente: 'Claudia Regina Martins', cpf: '111.222.333-44',
        tipo: 'preferencial', status: 'aguardando', guicheId: null, prioridade: 'lactante',
        criadoEm: new Date(Date.now() - 75 * 60000).toISOString(),
        chamadoEm: null, atendidoEm: null
    },
    {
        id: 'SEN-012', numero: 'N006', paciente: 'Marcos Vinicius Almeida', cpf: '222.333.444-55',
        tipo: 'normal', status: 'aguardando', guicheId: null, prioridade: 'normal',
        criadoEm: new Date(Date.now() - 60 * 60000).toISOString(),
        chamadoEm: null, atendidoEm: null
    },
    {
        id: 'SEN-013', numero: 'P007', paciente: 'Sebastiao Ribeiro Neto', cpf: '333.444.555-66',
        tipo: 'preferencial', status: 'aguardando', guicheId: null, prioridade: 'idoso',
        criadoEm: new Date(Date.now() - 45 * 60000).toISOString(),
        chamadoEm: null, atendidoEm: null
    },
    {
        id: 'SEN-014', numero: 'N007', paciente: 'Juliana Aparecida Freitas', cpf: '444.555.666-77',
        tipo: 'normal', status: 'aguardando', guicheId: null, prioridade: 'normal',
        criadoEm: new Date(Date.now() - 30 * 60000).toISOString(),
        chamadoEm: null, atendidoEm: null
    },
    {
        id: 'SEN-015', numero: 'N008', paciente: 'Eduardo Carvalho Santos', cpf: '555.666.777-88',
        tipo: 'normal', status: 'aguardando', guicheId: null, prioridade: 'normal',
        criadoEm: new Date(Date.now() - 15 * 60000).toISOString(),
        chamadoEm: null, atendidoEm: null
    },
];

// Historico de chamadas
let historicoChamadas = [
    { id: 'HC-001', senhaId: 'SEN-001', numero: 'P001', paciente: 'Maria da Conceicao Silva', guicheNome: 'Consultorio 01', profissional: 'Dr. Carlos Oliveira', chamadoEm: new Date(Date.now() - 170 * 60000).toISOString() },
    { id: 'HC-002', senhaId: 'SEN-002', numero: 'N001', paciente: 'Jose Carlos Oliveira', guicheNome: 'Guiche 01 - Recepcao', profissional: 'Joana Ferreira', chamadoEm: new Date(Date.now() - 160 * 60000).toISOString() },
    { id: 'HC-003', senhaId: 'SEN-003', numero: 'P002', paciente: 'Francisca Alves Mendes', guicheNome: 'Consultorio 02', profissional: 'Dra. Ana Santos', chamadoEm: new Date(Date.now() - 145 * 60000).toISOString() },
    { id: 'HC-004', senhaId: 'SEN-004', numero: 'N002', paciente: 'Antonio Pereira Lima', guicheNome: 'Sala de Vacina', profissional: 'Enf. Maria Souza', chamadoEm: new Date(Date.now() - 130 * 60000).toISOString() },
    { id: 'HC-005', senhaId: 'SEN-005', numero: 'N003', paciente: 'Pedro Henrique Costa', guicheNome: 'Consultorio 01', profissional: 'Dr. Carlos Oliveira', chamadoEm: new Date(Date.now() - 110 * 60000).toISOString() },
    { id: 'HC-006', senhaId: 'SEN-006', numero: 'P003', paciente: 'Luiza Fernanda Rocha', guicheNome: 'Consultorio 01', profissional: 'Dr. Carlos Oliveira', chamadoEm: new Date(Date.now() - 90 * 60000).toISOString() },
    { id: 'HC-007', senhaId: 'SEN-007', numero: 'N004', paciente: 'Roberto Santos Nascimento', guicheNome: 'Guiche 01 - Recepcao', profissional: 'Joana Ferreira', chamadoEm: new Date(Date.now() - 80 * 60000).toISOString() },
    { id: 'HC-008', senhaId: 'SEN-008', numero: 'P004', paciente: 'Ana Beatriz Souza', guicheNome: 'Consultorio 02', profissional: 'Dra. Ana Santos', chamadoEm: new Date(Date.now() - 2 * 60000).toISOString() },
];

class PanelService {
    /**
     * Listar todos os guiches/salas de atendimento
     */
    getGuiches() {
        return guiches;
    }

    /**
     * Listar senhas, com filtro opcional por status
     */
    getSenhas(status = null) {
        if (status) {
            return senhas.filter(s => s.status === status);
        }
        return senhas;
    }

    /**
     * Obter a senha atual sendo chamada e as ultimas 5 chamadas
     */
    getSenhaAtual() {
        const senhaAtual = senhas.find(s => s.status === 'chamando') || null;
        const guiche = senhaAtual ? guiches.find(g => g.id === senhaAtual.guicheId) || null : null;

        // Build chamadaAtual with guiche info embedded
        const chamadaAtual = senhaAtual ? {
            ...senhaAtual,
            guiche,
            profissional: guiche?.profissional || null
        } : null;

        // Ultimas 5 chamadas do historico (mais recentes primeiro)
        const ultimasChamadas = [...historicoChamadas]
            .sort((a, b) => new Date(b.chamadoEm) - new Date(a.chamadoEm))
            .slice(0, 5);

        // Aguardando info
        const aguardandoList = senhas
            .filter(s => s.status === 'aguardando')
            .sort((a, b) => {
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
     */
    criarSenha({ paciente, cpf, tipo, prioridade }) {
        const isPreferencial = tipo === 'preferencial';
        const prefixo = isPreferencial ? 'P' : 'N';
        const contador = isPreferencial ? ++contadorPreferencial : ++contadorNormal;
        const numero = `${prefixo}${String(contador).padStart(3, '0')}`;

        const novaSenha = {
            id: `SEN-${String(nextSenhaId++).padStart(3, '0')}`,
            numero,
            paciente,
            cpf: cpf || null,
            tipo: tipo || 'normal',
            status: 'aguardando',
            guicheId: null,
            prioridade: prioridade || 'normal',
            criadoEm: new Date().toISOString(),
            chamadoEm: null,
            atendidoEm: null
        };

        senhas.push(novaSenha);
        return novaSenha;
    }

    /**
     * Chamar proxima senha (preferencial primeiro, depois por ordem de criacao)
     */
    chamarProxima(guicheId) {
        const guiche = guiches.find(g => g.id === guicheId);
        if (!guiche) {
            throw new Error('Guiche nao encontrado');
        }

        // Desmarcar qualquer senha "chamando" neste guiche
        senhas.forEach(s => {
            if (s.status === 'chamando' && s.guicheId === guicheId) {
                s.status = 'aguardando';
                s.guicheId = null;
                s.chamadoEm = null;
            }
        });

        const aguardando = senhas.filter(s => s.status === 'aguardando');

        if (aguardando.length === 0) {
            return null;
        }

        // Ordenar: preferenciais primeiro, depois por data de criacao
        aguardando.sort((a, b) => {
            // Preferencial antes de normal
            if (a.tipo === 'preferencial' && b.tipo !== 'preferencial') return -1;
            if (a.tipo !== 'preferencial' && b.tipo === 'preferencial') return 1;
            // Dentro do mesmo tipo, mais antigo primeiro
            return new Date(a.criadoEm) - new Date(b.criadoEm);
        });

        const proxima = aguardando[0];
        const agora = new Date().toISOString();

        proxima.status = 'chamando';
        proxima.guicheId = guicheId;
        proxima.chamadoEm = agora;

        // Registrar no historico
        const registro = {
            id: `HC-${String(nextHistoricoId++).padStart(3, '0')}`,
            senhaId: proxima.id,
            numero: proxima.numero,
            paciente: proxima.paciente,
            guicheNome: guiche.nome,
            profissional: guiche.profissional,
            chamadoEm: agora
        };
        historicoChamadas.push(registro);

        return {
            senha: proxima,
            guiche,
            chamada: registro
        };
    }

    /**
     * Chamar uma senha especifica
     */
    chamarSenha(senhaId, guicheId) {
        const senha = senhas.find(s => s.id === senhaId);
        if (!senha) {
            throw new Error('Senha nao encontrada');
        }

        const guiche = guiches.find(g => g.id === guicheId);
        if (!guiche) {
            throw new Error('Guiche nao encontrado');
        }

        if (senha.status !== 'aguardando' && senha.status !== 'ausente') {
            throw new Error(`Senha com status "${senha.status}" nao pode ser chamada`);
        }

        // Desmarcar qualquer senha "chamando" neste guiche
        senhas.forEach(s => {
            if (s.status === 'chamando' && s.guicheId === guicheId) {
                s.status = 'aguardando';
                s.guicheId = null;
                s.chamadoEm = null;
            }
        });

        const agora = new Date().toISOString();
        senha.status = 'chamando';
        senha.guicheId = guicheId;
        senha.chamadoEm = agora;

        const registro = {
            id: `HC-${String(nextHistoricoId++).padStart(3, '0')}`,
            senhaId: senha.id,
            numero: senha.numero,
            paciente: senha.paciente,
            guicheNome: guiche.nome,
            profissional: guiche.profissional,
            chamadoEm: agora
        };
        historicoChamadas.push(registro);

        return {
            senha,
            guiche,
            chamada: registro
        };
    }

    /**
     * Rechamar a mesma senha (registra nova entrada no historico)
     */
    rechamar(senhaId) {
        const senha = senhas.find(s => s.id === senhaId);
        if (!senha) {
            throw new Error('Senha nao encontrada');
        }

        if (senha.status !== 'chamando') {
            throw new Error('Apenas senhas com status "chamando" podem ser rechamadas');
        }

        const guiche = guiches.find(g => g.id === senha.guicheId);
        const agora = new Date().toISOString();

        senha.chamadoEm = agora;

        const registro = {
            id: `HC-${String(nextHistoricoId++).padStart(3, '0')}`,
            senhaId: senha.id,
            numero: senha.numero,
            paciente: senha.paciente,
            guicheNome: guiche ? guiche.nome : 'Desconhecido',
            profissional: guiche ? guiche.profissional : 'Desconhecido',
            chamadoEm: agora
        };
        historicoChamadas.push(registro);

        return {
            senha,
            guiche,
            chamada: registro
        };
    }

    /**
     * Iniciar atendimento (muda status para em_atendimento)
     */
    iniciarAtendimento(senhaId) {
        const senha = senhas.find(s => s.id === senhaId);
        if (!senha) {
            throw new Error('Senha nao encontrada');
        }

        if (senha.status !== 'chamando') {
            throw new Error('Apenas senhas com status "chamando" podem iniciar atendimento');
        }

        senha.status = 'em_atendimento';
        return senha;
    }

    /**
     * Finalizar atendimento (muda status para atendido)
     */
    finalizarAtendimento(senhaId) {
        const senha = senhas.find(s => s.id === senhaId);
        if (!senha) {
            throw new Error('Senha nao encontrada');
        }

        if (senha.status !== 'em_atendimento') {
            throw new Error('Apenas senhas com status "em_atendimento" podem ser finalizadas');
        }

        senha.status = 'atendido';
        senha.atendidoEm = new Date().toISOString();
        return senha;
    }

    /**
     * Marcar paciente como ausente
     */
    marcarAusente(senhaId) {
        const senha = senhas.find(s => s.id === senhaId);
        if (!senha) {
            throw new Error('Senha nao encontrada');
        }

        if (senha.status !== 'chamando') {
            throw new Error('Apenas senhas com status "chamando" podem ser marcadas como ausente');
        }

        senha.status = 'ausente';
        return senha;
    }

    /**
     * Obter estatisticas do painel
     */
    getEstatisticas() {
        const agora = new Date();
        const totalSenhas = senhas.length;

        // Contagem por status
        const porStatus = {
            aguardando: senhas.filter(s => s.status === 'aguardando').length,
            chamando: senhas.filter(s => s.status === 'chamando').length,
            em_atendimento: senhas.filter(s => s.status === 'em_atendimento').length,
            atendido: senhas.filter(s => s.status === 'atendido').length,
            ausente: senhas.filter(s => s.status === 'ausente').length
        };

        // Tempo medio de espera (para senhas ja chamadas ou atendidas)
        const senhasComChamada = senhas.filter(s => s.chamadoEm && s.criadoEm);
        let tempoMedioEsperaMinutos = 0;
        if (senhasComChamada.length > 0) {
            const totalEspera = senhasComChamada.reduce((acc, s) => {
                return acc + (new Date(s.chamadoEm) - new Date(s.criadoEm));
            }, 0);
            tempoMedioEsperaMinutos = Math.round(totalEspera / senhasComChamada.length / 60000);
        }

        // Senhas por hora (baseado no periodo desde a primeira senha)
        const senhasAtendidas = senhas.filter(s => s.status === 'atendido');
        let senhasPorHora = 0;
        if (senhasAtendidas.length > 0) {
            const primeiraSenha = senhas.reduce((min, s) => {
                const t = new Date(s.criadoEm);
                return t < min ? t : min;
            }, new Date());
            const horasDecorridas = Math.max(1, (agora - primeiraSenha) / 3600000);
            senhasPorHora = Math.round((senhasAtendidas.length / horasDecorridas) * 10) / 10;
        }

        // Contagem por tipo
        const porTipo = {
            normal: senhas.filter(s => s.tipo === 'normal').length,
            preferencial: senhas.filter(s => s.tipo === 'preferencial').length
        };

        // Contagem por prioridade
        const porPrioridade = {
            normal: senhas.filter(s => s.prioridade === 'normal').length,
            idoso: senhas.filter(s => s.prioridade === 'idoso').length,
            gestante: senhas.filter(s => s.prioridade === 'gestante').length,
            deficiente: senhas.filter(s => s.prioridade === 'deficiente').length,
            lactante: senhas.filter(s => s.prioridade === 'lactante').length
        };

        return {
            totalSenhas,
            // Flattened status counts for easy frontend access
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
    getHistoricoChamadas(limit = 20) {
        return [...historicoChamadas]
            .sort((a, b) => new Date(b.chamadoEm) - new Date(a.chamadoEm))
            .slice(0, limit);
    }

    /**
     * Resetar painel (limpar todas as senhas para novo dia)
     */
    resetarPainel() {
        const totalAnterior = senhas.length;
        senhas.length = 0;
        historicoChamadas.length = 0;
        contadorNormal = 0;
        contadorPreferencial = 0;
        nextSenhaId = 1;
        nextHistoricoId = 1;

        return {
            mensagem: 'Painel resetado com sucesso',
            senhasRemovidas: totalAnterior,
            resetadoEm: new Date().toISOString()
        };
    }
}

export const panelService = new PanelService();
export default panelService;
