import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ─── 1. Modules ───────────────────────────────────────────────
  const moduleNames = [
    'Dashboard', 'Pacientes', 'Prontuario', 'Triagem', 'Enfermagem',
    'Farmacia', 'Reconciliacao', 'NPS', 'Agendamento', 'Chat',
    'ACS', 'Painel', 'Administracao', 'Decisao Clinica', 'Assistente IA',
    'Gestores', 'Analise de Dados', 'Comunicacao', 'Financeiro',
    'Integracao', 'Atendimento WhatsApp',
  ];

  const modules = {};
  for (const nome of moduleNames) {
    const m = await prisma.module.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
    modules[nome] = m;
  }
  console.log(`  ✔ ${moduleNames.length} modules`);

  // ─── 2. Roles ─────────────────────────────────────────────────
  const rolesData = [
    { nome: 'Administrador', descricao: 'Acesso total ao sistema', cor: '#EF4444' },
    { nome: 'Medico', descricao: 'Atendimento clinico e prescricoes', cor: '#3B82F6' },
    { nome: 'Enfermeiro', descricao: 'Triagem, enfermagem e procedimentos', cor: '#10B981' },
    { nome: 'Farmaceutico', descricao: 'Dispensacao e controle de estoque', cor: '#F59E0B' },
    { nome: 'Recepcionista', descricao: 'Agendamento e recepcao de pacientes', cor: '#8B5CF6' },
    { nome: 'ACS', descricao: 'Agente Comunitario de Saude - visitas domiciliares', cor: '#EC4899' },
    { nome: 'Gestor', descricao: 'Gestao e indicadores da unidade', cor: '#6366F1' },
  ];

  const roles = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { nome: r.nome },
      update: { descricao: r.descricao, cor: r.cor },
      create: r,
    });
    roles[r.nome] = role;
  }
  console.log(`  ✔ ${rolesData.length} roles`);

  // ─── 3. Permissions ───────────────────────────────────────────
  // Permission matrix: role -> modules with [read, write]
  const allModuleIds = Object.values(modules).map((m) => m.id);

  const permissionMatrix = {
    Administrador: { all: [true, true] },
    Medico: {
      Dashboard: [true, false], Pacientes: [true, true], Prontuario: [true, true],
      Triagem: [true, false], Enfermagem: [true, false], Farmacia: [true, false],
      Reconciliacao: [true, true], Agendamento: [true, true], Chat: [true, true],
      'Decisao Clinica': [true, true], 'Assistente IA': [true, true],
      'Atendimento WhatsApp': [true, true],
    },
    Enfermeiro: {
      Dashboard: [true, false], Pacientes: [true, true], Triagem: [true, true],
      Enfermagem: [true, true], Farmacia: [true, false], Agendamento: [true, true],
      Chat: [true, true], 'Assistente IA': [true, false],
    },
    Farmaceutico: {
      Dashboard: [true, false], Farmacia: [true, true], Reconciliacao: [true, true],
      Chat: [true, true], Pacientes: [true, false],
    },
    Recepcionista: {
      Dashboard: [true, false], Pacientes: [true, true], Agendamento: [true, true],
      Painel: [true, true], Chat: [true, true], NPS: [true, false],
    },
    ACS: {
      Dashboard: [true, false], ACS: [true, true], Pacientes: [true, true],
      Chat: [true, true], Agendamento: [true, true],
    },
    Gestor: {
      Dashboard: [true, true], Pacientes: [true, false], NPS: [true, true],
      Gestores: [true, true], 'Analise de Dados': [true, true],
      Comunicacao: [true, true], Financeiro: [true, true], Chat: [true, true],
      Administracao: [true, false],
    },
  };

  let permCount = 0;
  for (const [roleName, perms] of Object.entries(permissionMatrix)) {
    const role = roles[roleName];
    if (perms.all) {
      for (const moduleId of allModuleIds) {
        await prisma.permission.upsert({
          where: { roleId_moduleId: { roleId: role.id, moduleId } },
          update: { read: perms.all[0], write: perms.all[1] },
          create: { roleId: role.id, moduleId, read: perms.all[0], write: perms.all[1] },
        });
        permCount++;
      }
    } else {
      for (const [modName, [read, write]] of Object.entries(perms)) {
        const mod = modules[modName];
        if (!mod) continue;
        await prisma.permission.upsert({
          where: { roleId_moduleId: { roleId: role.id, moduleId: mod.id } },
          update: { read, write },
          create: { roleId: role.id, moduleId: mod.id, read, write },
        });
        permCount++;
      }
    }
  }
  console.log(`  ✔ ${permCount} permissions`);

  // ─── 4. Users ─────────────────────────────────────────────────
  const usersData = [
    { nome: 'Administrador Sistema', email: 'admin@pec.saude.gov.br', cpf: '000.000.000-00', role: 'Administrador' },
    { nome: 'Dr. Joao Silva', email: 'joao.silva@pec.saude.gov.br', cpf: '111.111.111-11', role: 'Medico' },
    { nome: 'Maria Santos', email: 'maria.santos@pec.saude.gov.br', cpf: '222.222.222-22', role: 'Enfermeiro' },
    { nome: 'Carlos Oliveira', email: 'carlos.oliveira@pec.saude.gov.br', cpf: '333.333.333-33', role: 'Farmaceutico' },
    { nome: 'Ana Recepcao', email: 'ana.recepcao@pec.saude.gov.br', cpf: '444.444.444-44', role: 'Recepcionista' },
    { nome: 'Pedro ACS', email: 'pedro.acs@pec.saude.gov.br', cpf: '555.555.555-55', role: 'ACS' },
    { nome: 'Fernanda Gestora', email: 'fernanda.gestora@pec.saude.gov.br', cpf: '666.666.666-66', role: 'Gestor' },
  ];

  const users = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { nome: u.nome, cpf: u.cpf, roleId: roles[u.role].id },
      create: { nome: u.nome, email: u.email, cpf: u.cpf, roleId: roles[u.role].id },
    });
    users[u.email] = user;
  }
  console.log(`  ✔ ${usersData.length} users`);

  // ─── 5. Chat Users + Channels + Members ──────────────────────
  const chatUsersData = [
    { id: 'chat-admin', nome: 'Administrador Sistema', cargo: 'Administrador', departamento: 'TI' },
    { id: 'chat-joao', nome: 'Dr. Joao Silva', cargo: 'Medico', departamento: 'Clinica Geral' },
    { id: 'chat-maria', nome: 'Maria Santos', cargo: 'Enfermeira', departamento: 'Enfermagem' },
    { id: 'chat-carlos', nome: 'Carlos Oliveira', cargo: 'Farmaceutico', departamento: 'Farmacia' },
    { id: 'chat-ana', nome: 'Ana Recepcao', cargo: 'Recepcionista', departamento: 'Recepcao' },
    { id: 'chat-pedro', nome: 'Pedro ACS', cargo: 'ACS', departamento: 'ACS' },
    { id: 'chat-fernanda', nome: 'Fernanda Gestora', cargo: 'Gestora', departamento: 'Gestao' },
  ];

  for (const cu of chatUsersData) {
    await prisma.chatUser.upsert({
      where: { id: cu.id },
      update: { nome: cu.nome, cargo: cu.cargo, departamento: cu.departamento },
      create: cu,
    });
  }
  console.log(`  ✔ ${chatUsersData.length} chat users`);

  const channelsData = [
    { id: 'ch-geral', nome: '#geral', descricao: 'Canal geral da unidade', departamento: 'Todos' },
    { id: 'ch-urgencias', nome: '#urgencias', descricao: 'Alertas e casos urgentes', departamento: 'Clinica' },
    { id: 'ch-enfermagem', nome: '#enfermagem', descricao: 'Equipe de enfermagem', departamento: 'Enfermagem' },
    { id: 'ch-farmacia', nome: '#farmacia', descricao: 'Equipe de farmacia', departamento: 'Farmacia' },
    { id: 'ch-administracao', nome: '#administracao', descricao: 'Equipe administrativa', departamento: 'Administracao' },
  ];

  for (const ch of channelsData) {
    await prisma.channel.upsert({
      where: { id: ch.id },
      update: { nome: ch.nome, descricao: ch.descricao, departamento: ch.departamento },
      create: ch,
    });
  }
  console.log(`  ✔ ${channelsData.length} channels`);

  // All users in #geral, specific users in other channels
  const channelMemberships = {
    'ch-geral': chatUsersData.map((u) => u.id),
    'ch-urgencias': ['chat-joao', 'chat-maria', 'chat-admin'],
    'ch-enfermagem': ['chat-maria', 'chat-joao', 'chat-admin'],
    'ch-farmacia': ['chat-carlos', 'chat-joao', 'chat-admin'],
    'ch-administracao': ['chat-admin', 'chat-fernanda', 'chat-ana'],
  };

  let memberCount = 0;
  for (const [channelId, userIds] of Object.entries(channelMemberships)) {
    for (const userId of userIds) {
      await prisma.channelMember.upsert({
        where: { channelId_userId: { channelId, userId } },
        update: {},
        create: { channelId, userId },
      });
      memberCount++;
    }
  }
  console.log(`  ✔ ${memberCount} channel memberships`);

  // ─── 6. Pharmacy: Medications + Lots ──────────────────────────
  const medsData = [
    { id: 'med-1', nome: 'Paracetamol', concentracao: '500mg', forma: 'Comprimido', categoria: 'Analgesico' },
    { id: 'med-2', nome: 'Ibuprofeno', concentracao: '600mg', forma: 'Comprimido', categoria: 'Anti-inflamatorio' },
    { id: 'med-3', nome: 'Amoxicilina', concentracao: '500mg', forma: 'Capsula', categoria: 'Antibiotico' },
    { id: 'med-4', nome: 'Losartana', concentracao: '50mg', forma: 'Comprimido', categoria: 'Anti-hipertensivo' },
    { id: 'med-5', nome: 'Metformina', concentracao: '850mg', forma: 'Comprimido', categoria: 'Antidiabetico' },
    { id: 'med-6', nome: 'Omeprazol', concentracao: '20mg', forma: 'Capsula', categoria: 'Antiulceroso' },
    { id: 'med-7', nome: 'Sinvastatina', concentracao: '20mg', forma: 'Comprimido', categoria: 'Hipolipemiante' },
    { id: 'med-8', nome: 'Enalapril', concentracao: '10mg', forma: 'Comprimido', categoria: 'Anti-hipertensivo' },
    { id: 'med-9', nome: 'Dipirona', concentracao: '500mg', forma: 'Comprimido', categoria: 'Analgesico' },
    { id: 'med-10', nome: 'Hidroclorotiazida', concentracao: '25mg', forma: 'Comprimido', categoria: 'Diuretico' },
    { id: 'med-11', nome: 'Captopril', concentracao: '25mg', forma: 'Comprimido', categoria: 'Anti-hipertensivo' },
    { id: 'med-12', nome: 'Salbutamol', concentracao: '100mcg', forma: 'Aerossol', categoria: 'Broncodilatador' },
  ];

  for (const med of medsData) {
    await prisma.medication.upsert({
      where: { id: med.id },
      update: { nome: med.nome, concentracao: med.concentracao, forma: med.forma, categoria: med.categoria },
      create: med,
    });
  }
  console.log(`  ✔ ${medsData.length} medications`);

  const lotsData = [
    { id: 'lot-1', medicationId: 'med-1', lote: 'LT2025-001', validade: '2026-06-30', quantidade: 500, fabricante: 'EMS', dataRecebimento: '2025-01-15' },
    { id: 'lot-2', medicationId: 'med-1', lote: 'LT2025-002', validade: '2026-03-15', quantidade: 200, fabricante: 'Medley', dataRecebimento: '2025-02-10' },
    { id: 'lot-3', medicationId: 'med-2', lote: 'LT2025-003', validade: '2026-08-20', quantidade: 300, fabricante: 'Eurofarma', dataRecebimento: '2025-01-20' },
    { id: 'lot-4', medicationId: 'med-3', lote: 'LT2025-004', validade: '2026-05-10', quantidade: 150, fabricante: 'Neo Quimica', dataRecebimento: '2025-02-01' },
    { id: 'lot-5', medicationId: 'med-4', lote: 'LT2025-005', validade: '2026-12-31', quantidade: 400, fabricante: 'EMS', dataRecebimento: '2025-01-10' },
    { id: 'lot-6', medicationId: 'med-5', lote: 'LT2025-006', validade: '2026-09-15', quantidade: 350, fabricante: 'Merck', dataRecebimento: '2025-02-05' },
    { id: 'lot-7', medicationId: 'med-6', lote: 'LT2025-007', validade: '2026-07-20', quantidade: 250, fabricante: 'Medley', dataRecebimento: '2025-01-25' },
    { id: 'lot-8', medicationId: 'med-7', lote: 'LT2025-008', validade: '2026-11-30', quantidade: 180, fabricante: 'EMS', dataRecebimento: '2025-02-15' },
    { id: 'lot-9', medicationId: 'med-8', lote: 'LT2025-009', validade: '2026-04-10', quantidade: 220, fabricante: 'Eurofarma', dataRecebimento: '2025-01-30' },
    { id: 'lot-10', medicationId: 'med-9', lote: 'LT2025-010', validade: '2026-10-25', quantidade: 600, fabricante: 'Sanofi', dataRecebimento: '2025-02-20' },
    { id: 'lot-11', medicationId: 'med-10', lote: 'LT2025-011', validade: '2026-08-15', quantidade: 280, fabricante: 'EMS', dataRecebimento: '2025-01-18' },
    { id: 'lot-12', medicationId: 'med-11', lote: 'LT2025-012', validade: '2025-06-30', quantidade: 50, fabricante: 'Neo Quimica', dataRecebimento: '2024-08-10' },
    { id: 'lot-13', medicationId: 'med-12', lote: 'LT2025-013', validade: '2026-02-28', quantidade: 80, fabricante: 'GSK', dataRecebimento: '2025-01-05' },
    { id: 'lot-14', medicationId: 'med-3', lote: 'LT2025-014', validade: '2025-04-15', quantidade: 30, fabricante: 'EMS', dataRecebimento: '2024-06-20' },
  ];

  for (const lot of lotsData) {
    await prisma.lot.upsert({
      where: { id: lot.id },
      update: { lote: lot.lote, validade: lot.validade, quantidade: lot.quantidade, fabricante: lot.fabricante },
      create: lot,
    });
  }
  console.log(`  ✔ ${lotsData.length} lots`);

  // ─── 7. ACS: Microareas + Families + Individuals + Alerts ────
  const microareasData = [
    { codigo: 'MA-001', nome: 'Microarea 1 - Centro', bairro: 'Centro', acsId: users['pedro.acs@pec.saude.gov.br'].id, acsNome: 'Pedro ACS', acsTelefone: '(11) 99999-0001' },
    { codigo: 'MA-002', nome: 'Microarea 2 - Vila Nova', bairro: 'Vila Nova', acsId: users['pedro.acs@pec.saude.gov.br'].id, acsNome: 'Pedro ACS', acsTelefone: '(11) 99999-0001' },
    { codigo: 'MA-003', nome: 'Microarea 3 - Jardim Esperanca', bairro: 'Jardim Esperanca', acsId: null, acsNome: null, acsTelefone: null },
  ];

  const microareas = {};
  for (const ma of microareasData) {
    const created = await prisma.microarea.upsert({
      where: { codigo: ma.codigo },
      update: { nome: ma.nome, bairro: ma.bairro, acsNome: ma.acsNome },
      create: ma,
    });
    microareas[ma.codigo] = created;
  }
  console.log(`  ✔ ${microareasData.length} microareas`);

  // Families - skip if already seeded (no unique field for upsert)
  const existingFamilies = await prisma.family.count();
  if (existingFamilies > 0) {
    console.log(`  ✔ Families already exist (${existingFamilies}), skipping families/individuals/alerts`);
  } else {

  const familiesData = [
    { microarea: 'MA-001', sobrenome: 'Silva', responsavel: 'Jose da Silva', endereco: 'Rua das Flores, 123', membros: 4, renda: '1-2 SM', moradia: 'Propria', agua: 'Rede publica', esgoto: 'Rede publica', vulnerabilidade: 'Baixa', fatoresRisco: ['Idoso acamado'], observacoes: null },
    { microarea: 'MA-001', sobrenome: 'Oliveira', responsavel: 'Maria Oliveira', endereco: 'Rua das Flores, 456', membros: 5, renda: 'Menos de 1 SM', moradia: 'Alugada', agua: 'Rede publica', esgoto: 'Fossa', vulnerabilidade: 'Alta', fatoresRisco: ['Gestante', 'Crianca < 2 anos', 'Bolsa Familia'], observacoes: 'Familia acompanhada pelo CRAS' },
    { microarea: 'MA-001', sobrenome: 'Santos', responsavel: 'Antonio Santos', endereco: 'Av Principal, 789', membros: 3, renda: '2-3 SM', moradia: 'Propria', agua: 'Rede publica', esgoto: 'Rede publica', vulnerabilidade: 'Baixa', fatoresRisco: [], observacoes: null },
    { microarea: 'MA-002', sobrenome: 'Pereira', responsavel: 'Francisca Pereira', endereco: 'Trav. da Paz, 55', membros: 6, renda: 'Menos de 1 SM', moradia: 'Cedida', agua: 'Poco', esgoto: 'Ceu aberto', vulnerabilidade: 'Muito Alta', fatoresRisco: ['Crianca < 2 anos', 'Desnutricao', 'Condicoes precarias'], observacoes: 'Prioritaria para visita semanal' },
    { microarea: 'MA-002', sobrenome: 'Costa', responsavel: 'Luiz Costa', endereco: 'Rua Nova, 200', membros: 2, renda: '1-2 SM', moradia: 'Propria', agua: 'Rede publica', esgoto: 'Rede publica', vulnerabilidade: 'Media', fatoresRisco: ['Hipertensao', 'Diabetes'], observacoes: null },
    { microarea: 'MA-003', sobrenome: 'Almeida', responsavel: 'Rosa Almeida', endereco: 'Rua Esperanca, 300', membros: 4, renda: '1-2 SM', moradia: 'Alugada', agua: 'Rede publica', esgoto: 'Fossa', vulnerabilidade: 'Media', fatoresRisco: ['Idoso'], observacoes: null },
    { microarea: 'MA-003', sobrenome: 'Ferreira', responsavel: 'Carlos Ferreira', endereco: 'Rua Esperanca, 450', membros: 3, renda: '2-3 SM', moradia: 'Propria', agua: 'Rede publica', esgoto: 'Rede publica', vulnerabilidade: 'Baixa', fatoresRisco: [], observacoes: null },
  ];

  const families = [];
  for (const f of familiesData) {
    const fam = await prisma.family.create({
      data: {
        microareaId: microareas[f.microarea].id,
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
      },
    });
    families.push(fam);
  }
  console.log(`  ✔ ${families.length} families`);

  // Individuals
  const individualsData = [
    // Familia Silva
    { familyIdx: 0, nome: 'Jose da Silva', idade: 72, sexo: 'M', riscos: { acamado: true, hipertensao: true, medicacaoContinua: true } },
    { familyIdx: 0, nome: 'Ana da Silva', idade: 68, sexo: 'F', riscos: { diabetes: true, hipertensao: true } },
    { familyIdx: 0, nome: 'Lucas Silva', idade: 35, sexo: 'M', riscos: {} },
    { familyIdx: 0, nome: 'Beatriz Silva', idade: 8, sexo: 'F', riscos: { vacinacaoEmDia: true } },
    // Familia Oliveira
    { familyIdx: 1, nome: 'Maria Oliveira', idade: 28, sexo: 'F', riscos: { gestante: true, preNatal: true, igSemanas: 32 } },
    { familyIdx: 1, nome: 'Pedro Oliveira', idade: 30, sexo: 'M', riscos: {} },
    { familyIdx: 1, nome: 'Sofia Oliveira', idade: 1, sexo: 'F', riscos: { menorDe2: true, aleitamentoMaterno: true } },
    // Familia Pereira
    { familyIdx: 3, nome: 'Francisca Pereira', idade: 42, sexo: 'F', riscos: {} },
    { familyIdx: 3, nome: 'Miguel Pereira', idade: 3, sexo: 'M', riscos: { desnutricao: true, pesoAbaixo: true } },
    { familyIdx: 3, nome: 'Helena Pereira', idade: 1, sexo: 'F', riscos: { menorDe2: true, vacinacaoAtrasada: true } },
    // Familia Costa
    { familyIdx: 4, nome: 'Luiz Costa', idade: 65, sexo: 'M', riscos: { hipertensao: true, diabetes: true, medicacaoContinua: true } },
    { familyIdx: 4, nome: 'Teresa Costa', idade: 62, sexo: 'F', riscos: { hipertensao: true } },
  ];

  for (const ind of individualsData) {
    await prisma.individual.create({
      data: {
        familiaId: families[ind.familyIdx].id,
        nome: ind.nome,
        idade: ind.idade,
        sexo: ind.sexo,
        riscos: ind.riscos,
      },
    });
  }
  console.log(`  ✔ ${individualsData.length} individuals`);

  // ACS Alerts
  const alertsData = [
    { tipo: 'Visita atrasada', urgencia: 'alta', pacienteNome: 'Jose da Silva', familyIdx: 0, microarea: 'MA-001', motivo: 'Idoso acamado sem visita ha 15 dias', diasPendentes: 15, status: 'pending', dataCriacao: '2026-03-01' },
    { tipo: 'Vacina atrasada', urgencia: 'media', pacienteNome: 'Helena Pereira', familyIdx: 3, microarea: 'MA-002', motivo: 'Vacina pentavalente atrasada', diasPendentes: 30, status: 'pending', dataCriacao: '2026-02-14' },
    { tipo: 'Pre-natal', urgencia: 'alta', pacienteNome: 'Maria Oliveira', familyIdx: 1, microarea: 'MA-001', motivo: 'Gestante 32 semanas - consulta pre-natal pendente', diasPendentes: 7, status: 'pending', dataCriacao: '2026-03-09' },
    { tipo: 'Desnutricao infantil', urgencia: 'alta', pacienteNome: 'Miguel Pereira', familyIdx: 3, microarea: 'MA-002', motivo: 'Crianca com peso abaixo do percentil 3', diasPendentes: 5, status: 'pending', dataCriacao: '2026-03-11' },
    { tipo: 'Medicacao', urgencia: 'baixa', pacienteNome: 'Luiz Costa', familyIdx: 4, microarea: 'MA-002', motivo: 'Renovacao de receita de anti-hipertensivo', diasPendentes: 10, status: 'resolved', dataCriacao: '2026-02-20', dataResolucao: '2026-03-02' },
  ];

  for (const a of alertsData) {
    await prisma.acsAlert.create({
      data: {
        tipo: a.tipo,
        urgencia: a.urgencia,
        pacienteNome: a.pacienteNome,
        familiaId: families[a.familyIdx].id,
        microareaId: microareas[a.microarea].id,
        motivo: a.motivo,
        diasPendentes: a.diasPendentes,
        status: a.status,
        dataCriacao: a.dataCriacao,
        dataResolucao: a.dataResolucao || null,
      },
    });
  }
  console.log(`  ✔ ${alertsData.length} ACS alerts`);

  } // end if existingFamilies === 0

  // ─── 8. Reconciliation: Drug Interactions + Drug Aliases ──────
  const interactionsData = [
    { drug1: 'Losartana', drug2: 'Captopril', severity: 'alta', type: 'Farmacodinamica', description: 'Duplo bloqueio do SRAA aumenta risco de hipercalemia e insuficiencia renal', recommendation: 'Evitar uso concomitante. Escolher apenas um inibidor do SRAA' },
    { drug1: 'Metformina', drug2: 'Enalapril', severity: 'baixa', type: 'Farmacocinetica', description: 'IECA pode potencializar efeito hipoglicemiante da metformina', recommendation: 'Monitorar glicemia. Ajuste geralmente nao necessario' },
    { drug1: 'Sinvastatina', drug2: 'Amoxicilina', severity: 'baixa', type: 'Farmacocinetica', description: 'Interacao clinicamente pouco significativa', recommendation: 'Uso concomitante seguro na maioria dos casos' },
    { drug1: 'Ibuprofeno', drug2: 'Losartana', severity: 'media', type: 'Farmacodinamica', description: 'AINEs reduzem efeito anti-hipertensivo e aumentam risco renal', recommendation: 'Evitar uso prolongado. Monitorar PA e funcao renal' },
    { drug1: 'Ibuprofeno', drug2: 'Enalapril', severity: 'media', type: 'Farmacodinamica', description: 'AINEs reduzem efeito anti-hipertensivo dos IECA', recommendation: 'Usar menor dose pelo menor tempo. Monitorar PA' },
    { drug1: 'Omeprazol', drug2: 'Captopril', severity: 'baixa', type: 'Farmacocinetica', description: 'Omeprazol pode reduzir absorcao do captopril', recommendation: 'Administrar com intervalo de 2 horas' },
    { drug1: 'Dipirona', drug2: 'Captopril', severity: 'media', type: 'Farmacodinamica', description: 'Dipirona pode reduzir efeito anti-hipertensivo', recommendation: 'Monitorar PA. Preferir paracetamol como alternativa' },
    { drug1: 'Hidroclorotiazida', drug2: 'Metformina', severity: 'media', type: 'Farmacodinamica', description: 'Tiazidicos podem aumentar glicemia', recommendation: 'Monitorar glicemia. Ajustar dose de metformina se necessario' },
    { drug1: 'Losartana', drug2: 'Hidroclorotiazida', severity: 'baixa', type: 'Farmacodinamica', description: 'Combinacao terapeutica comum e bem tolerada', recommendation: 'Associacao benefica. Monitorar potassio e funcao renal' },
    { drug1: 'Enalapril', drug2: 'Hidroclorotiazida', severity: 'baixa', type: 'Farmacodinamica', description: 'Combinacao terapeutica sinergica', recommendation: 'Associacao benefica. Monitorar potassio e funcao renal' },
    { drug1: 'Salbutamol', drug2: 'Enalapril', severity: 'baixa', type: 'Farmacocinetica', description: 'Interacao clinicamente insignificante', recommendation: 'Uso concomitante seguro' },
    { drug1: 'Paracetamol', drug2: 'Sinvastatina', severity: 'media', type: 'Farmacocinetica', description: 'Uso cronico de paracetamol pode aumentar risco hepatotoxico com estatinas', recommendation: 'Evitar uso cronico concomitante. Monitorar funcao hepatica' },
  ];

  // Idempotent: check if interactions already exist
  const existingInteractions = await prisma.drugInteraction.count();
  if (existingInteractions === 0) {
    for (const di of interactionsData) {
      await prisma.drugInteraction.create({ data: di });
    }
  }
  console.log(`  ✔ ${interactionsData.length} drug interactions`);

  const aliasesData = [
    { canonicalName: 'Paracetamol', alias: 'Tylenol' },
    { canonicalName: 'Paracetamol', alias: 'Dorflex' },
    { canonicalName: 'Ibuprofeno', alias: 'Advil' },
    { canonicalName: 'Ibuprofeno', alias: 'Alivium' },
    { canonicalName: 'Amoxicilina', alias: 'Amoxil' },
    { canonicalName: 'Amoxicilina', alias: 'Novocilin' },
    { canonicalName: 'Losartana', alias: 'Cozaar' },
    { canonicalName: 'Losartana', alias: 'Losartana Potassica' },
    { canonicalName: 'Metformina', alias: 'Glifage' },
    { canonicalName: 'Metformina', alias: 'Glucoformin' },
    { canonicalName: 'Omeprazol', alias: 'Losec' },
    { canonicalName: 'Omeprazol', alias: 'Peprazol' },
    { canonicalName: 'Sinvastatina', alias: 'Zocor' },
    { canonicalName: 'Enalapril', alias: 'Renitec' },
    { canonicalName: 'Enalapril', alias: 'Vasopril' },
    { canonicalName: 'Dipirona', alias: 'Novalgina' },
    { canonicalName: 'Dipirona', alias: 'Anador' },
    { canonicalName: 'Hidroclorotiazida', alias: 'HCTZ' },
    { canonicalName: 'Hidroclorotiazida', alias: 'Clorana' },
    { canonicalName: 'Captopril', alias: 'Capoten' },
    { canonicalName: 'Captopril', alias: 'Captomed' },
    { canonicalName: 'Salbutamol', alias: 'Aerolin' },
    { canonicalName: 'Salbutamol', alias: 'Aerojet' },
  ];

  for (const da of aliasesData) {
    await prisma.drugAlias.upsert({
      where: { alias: da.alias },
      update: { canonicalName: da.canonicalName },
      create: da,
    });
  }
  console.log(`  ✔ ${aliasesData.length} drug aliases`);

  // ─── 9. Panel: Guiches ────────────────────────────────────────
  const guichesData = [
    { id: 'guiche-1', nome: 'Recepcao 1', tipo: 'recepcao', profissional: 'Ana Recepcao', especialidade: 'Acolhimento' },
    { id: 'guiche-2', nome: 'Recepcao 2', tipo: 'recepcao', profissional: null, especialidade: 'Acolhimento' },
    { id: 'guiche-3', nome: 'Consultorio 1', tipo: 'consultorio', profissional: 'Dr. Joao Silva', especialidade: 'Clinica Geral' },
    { id: 'guiche-4', nome: 'Consultorio 2', tipo: 'consultorio', profissional: null, especialidade: 'Clinica Geral' },
    { id: 'guiche-5', nome: 'Enfermagem 1', tipo: 'enfermagem', profissional: 'Maria Santos', especialidade: 'Enfermagem' },
    { id: 'guiche-6', nome: 'Farmacia 1', tipo: 'farmacia', profissional: 'Carlos Oliveira', especialidade: 'Dispensacao' },
  ];

  for (const g of guichesData) {
    await prisma.guiche.upsert({
      where: { id: g.id },
      update: { nome: g.nome, tipo: g.tipo, profissional: g.profissional, especialidade: g.especialidade },
      create: g,
    });
  }
  console.log(`  ✔ ${guichesData.length} guiches`);

  // ─── 10. NPS Surveys ──────────────────────────────────────────
  const existingNps = await prisma.npsSurvey.count();
  if (existingNps === 0) {
    const categories = ['Atendimento Medico', 'Recepcao', 'Enfermagem', 'Farmacia', 'Tempo de Espera', 'Infraestrutura'];
    const names = [
      'Ana Paula', 'Roberto Carlos', 'Mariana Lima', 'Fernando Alves', 'Claudia Ramos',
      'Paulo Henrique', 'Beatriz Souza', 'Ricardo Nunes', 'Juliana Castro', 'Marcos Vieira',
      'Patricia Gomes', 'Eduardo Lopes', 'Camila Dias', 'Thiago Moreira', 'Larissa Barbosa',
      'Gustavo Araujo', 'Daniela Pinto', 'Lucas Cardoso',
    ];
    const comments = {
      high: [
        'Excelente atendimento! Equipe muito atenciosa.',
        'Muito satisfeita com o servico prestado.',
        'Atendimento rapido e eficiente.',
        'Profissionais muito competentes.',
        'Otima experiencia, recomendo.',
      ],
      mid: [
        'Atendimento razoavel, mas poderia melhorar o tempo de espera.',
        'Bom atendimento, porem a estrutura precisa de melhorias.',
        'Satisfeito, mas a fila estava grande.',
      ],
      low: [
        'Tempo de espera muito longo.',
        'Precisa melhorar a organizacao.',
        'Falta de medicamentos na farmacia.',
        'Infraestrutura precaria.',
      ],
    };

    const surveys = [];
    for (let i = 0; i < 18; i++) {
      // Mix: ~55% promoters (9-10), ~25% passives (7-8), ~20% detractors (0-6)
      let score;
      const rand = Math.random();
      if (rand < 0.55) score = 9 + Math.floor(Math.random() * 2);        // 9-10
      else if (rand < 0.80) score = 7 + Math.floor(Math.random() * 2);   // 7-8
      else score = Math.floor(Math.random() * 7);                         // 0-6

      let comment;
      if (score >= 9) comment = comments.high[i % comments.high.length];
      else if (score >= 7) comment = comments.mid[i % comments.mid.length];
      else comment = comments.low[i % comments.low.length];

      // Spread over last 3 months
      const month = 1 + (i % 3); // Jan, Feb, Mar 2026
      const day = 1 + Math.floor(Math.random() * 28);
      const date = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      surveys.push({
        pacienteNome: names[i],
        score,
        category: categories[i % categories.length],
        comment,
        date,
      });
    }

    for (const s of surveys) {
      await prisma.npsSurvey.create({ data: s });
    }
    console.log(`  ✔ ${surveys.length} NPS surveys`);
  } else {
    console.log(`  ✔ NPS surveys already exist (${existingNps}), skipping`);
  }

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
