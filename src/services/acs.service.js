/**
 * ACS (Agente Comunitário de Saúde) Service
 * Módulo de gestão territorial conforme diretrizes PlanificaSUS
 * RF25-RF31
 */

import prisma from '../lib/prisma.js';

// ── Linhas de Cuidado (MACC) — kept as static data (computed view) ──
const careLines = [
  {
    id: 'saude_mulher',
    nome: 'Saúde da Mulher',
    descricao: 'Acompanhamento gestacional, puerpério e saúde reprodutiva',
    totalPacientes: 5,
    controladoPercent: 40,
    ultimaAtualizacao: '2026-03-14',
    pacientes: [
      { id: 1, nome: 'Maria da Silva', idade: 28, status: 'Atenção', detalhes: 'Gestante alto risco - 7 meses, faltou ao pré-natal', ultimaVisita: '2026-02-28' },
      { id: 8, nome: 'Fernanda Almeida', idade: 25, status: 'Crítico', detalhes: 'Gestante com TB - alto risco, sem USG 2o trimestre', ultimaVisita: '2026-02-20' },
      { id: 12, nome: 'Clara Nascimento', idade: 30, status: 'Crítico', detalhes: 'Gestante diabética - faltou ao pré-natal', ultimaVisita: '2026-03-01' },
      { id: 17, nome: 'Amanda Teixeira', idade: 22, status: 'Atenção', detalhes: 'Puérpera com depressão pós-parto', ultimaVisita: '2026-02-25' },
      { id: 16, nome: 'Tereza Mendes', idade: 70, status: 'Em dia', detalhes: 'Preventivo em dia, mamografia solicitada', ultimaVisita: '2026-03-10' },
    ]
  },
  {
    id: 'saude_crianca',
    nome: 'Saúde da Criança',
    descricao: 'Puericultura, vacinação e desenvolvimento infantil',
    totalPacientes: 4,
    controladoPercent: 25,
    ultimaAtualizacao: '2026-03-14',
    pacientes: [
      { id: 3, nome: 'Pedro da Silva', idade: 1, status: 'Em dia', detalhes: 'Puericultura em dia, vacinação completa', ultimaVisita: '2026-03-05' },
      { id: 9, nome: 'Lucas Almeida', idade: 1, status: 'Crítico', detalhes: 'Vacina Pentavalente 3a dose atrasada 25 dias', ultimaVisita: '2026-02-15' },
      { id: 18, nome: 'Bebê Teixeira', idade: 0, status: 'Crítico', detalhes: 'BCG e Hepatite B pendentes - 30 dias', ultimaVisita: '2026-02-12' },
      { id: 15, nome: 'Sofia Araújo', idade: 3, status: 'Atenção', detalhes: 'Reforço tríplice viral pendente', ultimaVisita: '2026-02-28' },
    ]
  },
  {
    id: 'hipertensos_diabeticos',
    nome: 'Hipertensos e Diabéticos',
    descricao: 'Monitoramento e controle de HAS e DM conforme MACC',
    totalPacientes: 7,
    controladoPercent: 43,
    ultimaAtualizacao: '2026-03-14',
    pacientes: [
      { id: 4, nome: 'José Santos', idade: 78, status: 'Crítico', detalhes: 'HAS + DM2 descompensados, acamado, sem aferir PA há 3 meses', ultimaVisita: '2025-12-14' },
      { id: 5, nome: 'Ana Santos', idade: 72, status: 'Atenção', detalhes: 'HAS controlada, DM em ajuste', ultimaVisita: '2026-02-20' },
      { id: 6, nome: 'Lúcia Pereira', idade: 55, status: 'Em dia', detalhes: 'HAS controlada, medicação em dia', ultimaVisita: '2026-03-08' },
      { id: 7, nome: 'Roberto Costa', idade: 60, status: 'Crítico', detalhes: 'DM2 descompensado, sem consulta há 6 meses', ultimaVisita: '2025-09-14' },
      { id: 11, nome: 'Dona Marta Ferreira', idade: 62, status: 'Crítico', detalhes: 'HAS descompensada - PA 190/110 última aferição', ultimaVisita: '2026-01-28' },
      { id: 16, nome: 'Tereza Mendes', idade: 70, status: 'Em dia', detalhes: 'HAS controlada, acompanhamento regular', ultimaVisita: '2026-03-10' },
      { id: 25, nome: 'Ricardo Pereira', idade: 58, status: 'Em dia', detalhes: 'HAS + DM controlados, exames em dia', ultimaVisita: '2026-03-05' },
    ]
  },
  {
    id: 'saude_mental',
    nome: 'Saúde Mental',
    descricao: 'Acompanhamento de transtornos mentais e dependência',
    totalPacientes: 3,
    controladoPercent: 33,
    ultimaAtualizacao: '2026-03-14',
    pacientes: [
      { id: 11, nome: 'Dona Marta Ferreira', idade: 62, status: 'Atenção', detalhes: 'Tratamento psiquiátrico em curso, medicação ajustada', ultimaVisita: '2026-02-28' },
      { id: 17, nome: 'Amanda Teixeira', idade: 22, status: 'Crítico', detalhes: 'Depressão pós-parto - sem acompanhamento há 15 dias', ultimaVisita: '2026-02-25' },
      { id: 4, nome: 'José Santos', idade: 78, status: 'Em dia', detalhes: 'Sintomas leves de ansiedade, acompanhamento com equipe', ultimaVisita: '2026-03-02' },
    ]
  }
];

// ── Helpers ─────────────────────────────────────────────────────────
function getMaxRisk(riscos) {
  const vals = Object.values(riscos).filter(v => v !== null);
  if (vals.includes('Alto')) return 'Alto';
  if (vals.includes('Médio')) return 'Médio';
  if (vals.includes('Baixo')) return 'Baixo';
  return null;
}

// ── Service Methods ─────────────────────────────────────────────────
export const acsService = {

  async getMicroareas() {
    const microareas = await prisma.microarea.findMany({
      include: {
        families: {
          include: {
            individuals: true
          }
        }
      }
    });

    return microareas.map(ma => {
      const totalFamilias = ma.families.length;
      const totalIndividuos = ma.families.reduce((sum, f) => sum + f.individuals.length, 0);
      const vulnerabilidade = {
        alta: ma.families.filter(f => f.vulnerabilidade === 'Alta').length,
        media: ma.families.filter(f => f.vulnerabilidade === 'Média').length,
        baixa: ma.families.filter(f => f.vulnerabilidade === 'Baixa').length
      };

      return {
        id: ma.id,
        nome: ma.nome,
        codigo: ma.codigo,
        acs: {
          id: ma.acsId,
          nome: ma.acsNome,
          avatar: ma.acsAvatar,
          telefone: ma.acsTelefone
        },
        bairro: ma.bairro,
        totalFamilias,
        totalIndividuos,
        vulnerabilidade
      };
    });
  },

  async getFamilies(filters = {}) {
    const where = {};
    if (filters.microareaId) {
      where.microareaId = Number(filters.microareaId);
    }
    if (filters.vulnerabilidade) {
      where.vulnerabilidade = filters.vulnerabilidade;
    }
    if (filters.search) {
      const q = filters.search;
      where.OR = [
        { sobrenome: { contains: q, mode: 'insensitive' } },
        { responsavel: { contains: q, mode: 'insensitive' } },
        { endereco: { contains: q, mode: 'insensitive' } }
      ];
    }

    const families = await prisma.family.findMany({
      where,
      include: { individuals: true }
    });

    return families.map(f => ({
      id: f.id,
      microareaId: f.microareaId,
      sobrenome: f.sobrenome,
      responsavel: f.responsavel,
      endereco: f.endereco,
      membros: f.membros,
      renda: f.renda,
      moradia: f.moradia,
      agua: f.agua,
      esgoto: f.esgoto,
      vulnerabilidade: f.vulnerabilidade,
      fatoresRisco: f.fatoresRisco,
      observacoes: f.observacoes,
      individuos: f.individuals
    }));
  },

  async getFamilyById(id) {
    const family = await prisma.family.findUnique({
      where: { id: Number(id) },
      include: {
        individuals: true,
        microarea: true
      }
    });
    if (!family) return null;

    const microarea = family.microarea;

    return {
      id: family.id,
      microareaId: family.microareaId,
      sobrenome: family.sobrenome,
      responsavel: family.responsavel,
      endereco: family.endereco,
      membros: family.membros,
      renda: family.renda,
      moradia: family.moradia,
      agua: family.agua,
      esgoto: family.esgoto,
      vulnerabilidade: family.vulnerabilidade,
      fatoresRisco: family.fatoresRisco,
      observacoes: family.observacoes,
      individuos: family.individuals,
      microarea: microarea ? {
        id: microarea.id,
        nome: microarea.nome,
        codigo: microarea.codigo,
        acs: {
          id: microarea.acsId,
          nome: microarea.acsNome,
          avatar: microarea.acsAvatar,
          telefone: microarea.acsTelefone
        },
        bairro: microarea.bairro
      } : null
    };
  },

  async registerFamily(data) {
    const newFamily = await prisma.family.create({
      data: {
        microareaId: Number(data.microareaId) || 1,
        sobrenome: data.sobrenome,
        responsavel: data.responsavel,
        endereco: data.endereco || '',
        membros: Number(data.membros) || 1,
        renda: data.renda || 'Não informado',
        moradia: data.moradia || 'Não informado',
        agua: data.agua || 'Não informado',
        esgoto: data.esgoto || 'Não informado',
        vulnerabilidade: data.vulnerabilidade || 'Media',
        fatoresRisco: data.fatoresRisco || [],
        observacoes: data.observacoes || ''
      }
    });

    return newFamily;
  },

  async stratifyRisk(filters = {}) {
    const where = {};

    if (filters.familiaId) {
      where.familiaId = Number(filters.familiaId);
    }
    if (filters.microareaId) {
      const maFamilies = await prisma.family.findMany({
        where: { microareaId: Number(filters.microareaId) },
        select: { id: true }
      });
      where.familiaId = { in: maFamilies.map(f => f.id) };
    }

    let result = await prisma.individual.findMany({ where });

    // Filter by categoria (risk category key)
    if (filters.categoria) {
      result = result.filter(ind => {
        const riscos = ind.riscos;
        const val = riscos[filters.categoria];
        return val && val !== null;
      });
    }

    // Filter by nivel (risk level value)
    if (filters.nivel) {
      result = result.filter(ind => {
        const riscos = ind.riscos;
        return Object.values(riscos).some(v => v === filters.nivel);
      });
    }

    // Compute summary
    const summary = { alto: 0, medio: 0, baixo: 0 };
    result.forEach(ind => {
      const maxRisk = getMaxRisk(ind.riscos);
      if (maxRisk === 'Alto') summary.alto++;
      else if (maxRisk === 'Médio') summary.medio++;
      else if (maxRisk === 'Baixo') summary.baixo++;
    });

    return { individuals: result, summary };
  },

  async getAlerts(filters = {}) {
    const where = { status: 'pending' };
    if (filters.tipo) {
      where.tipo = filters.tipo;
    }
    if (filters.urgencia) {
      where.urgencia = filters.urgencia;
    }
    if (filters.microareaId) {
      where.microareaId = Number(filters.microareaId);
    }

    const result = await prisma.acsAlert.findMany({ where });

    // sort by urgency then days pending
    result.sort((a, b) => {
      if (a.urgencia === 'urgent' && b.urgencia !== 'urgent') return -1;
      if (a.urgencia !== 'urgent' && b.urgencia === 'urgent') return 1;
      return (b.diasPendentes || 0) - (a.diasPendentes || 0);
    });

    return result;
  },

  async resolveAlert(id) {
    const alert = await prisma.acsAlert.findUnique({ where: { id: Number(id) } });
    if (!alert) return null;

    const updated = await prisma.acsAlert.update({
      where: { id: Number(id) },
      data: {
        status: 'resolved',
        dataResolucao: new Date().toISOString().split('T')[0]
      }
    });

    return updated;
  },

  async getVisits(filters = {}) {
    const where = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.acsId) {
      where.acsId = Number(filters.acsId);
    }
    if (filters.data) {
      where.data = filters.data;
    }
    if (filters.tipo) {
      where.tipo = filters.tipo;
    }

    const result = await prisma.visit.findMany({
      where,
      orderBy: [
        { data: 'asc' },
        { hora: 'asc' }
      ]
    });

    return result;
  },

  async scheduleVisit(data) {
    const newVisit = await prisma.visit.create({
      data: {
        familiaId: Number(data.familiaId),
        pacienteNome: data.pacienteNome || '',
        endereco: data.endereco || '',
        tipo: data.tipo || 'Rotina',
        data: data.data,
        hora: data.hora || '08:00',
        status: 'agendada',
        acsId: Number(data.acsId) || 1,
        motivo: data.motivo || '',
        observacoes: ''
      }
    });

    return newVisit;
  },

  async recordVisit(id, data) {
    const visit = await prisma.visit.findUnique({ where: { id: Number(id) } });
    if (!visit) return null;

    const updated = await prisma.visit.update({
      where: { id: Number(id) },
      data: {
        status: 'realizada',
        observacoes: data.observacoes || '',
        condicaoPaciente: data.condicaoPaciente || '',
        sinaisVitais: data.sinaisVitais || {},
        encaminhamento: data.encaminhamento || false,
        proximaVisita: data.proximaVisita || null,
        dataRealizacao: new Date().toISOString().split('T')[0]
      }
    });

    return updated;
  },

  getCareLines() {
    return careLines;
  },

  async sendAlert(data) {
    const referral = await prisma.referral.create({
      data: {
        pacienteNome: data.pacienteNome,
        familiaId: Number(data.familiaId) || null,
        microareaId: Number(data.microareaId) || null,
        destinatario: data.destinatario || 'Enfermeiro(a)',
        prioridade: data.prioridade || 'normal',
        motivo: data.motivo || '',
        observacoes: data.observacoes || '',
        status: 'enviado',
        dataCriacao: new Date().toISOString().split('T')[0],
        acsNome: data.acsNome || 'ACS'
      }
    });

    return referral;
  }
};

export default acsService;
