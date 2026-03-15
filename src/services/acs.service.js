/**
 * ACS (Agente Comunitário de Saúde) Service
 * Módulo de gestão territorial conforme diretrizes PlanificaSUS
 * RF25-RF31
 */

// ── Microáreas com ACS designados ──────────────────────────────────
const microareas = [
  {
    id: 1,
    nome: 'Microárea 01 - Vila Esperança',
    codigo: 'MA-001',
    acs: { id: 1, nome: 'Ana Paula Souza', avatar: 'APS', telefone: '(11) 98765-4321' },
    bairro: 'Vila Esperança',
    totalFamilias: 0,
    totalIndividuos: 0,
    vulnerabilidade: { alta: 0, media: 0, baixa: 0 }
  },
  {
    id: 2,
    nome: 'Microárea 02 - Jardim das Flores',
    codigo: 'MA-002',
    acs: { id: 2, nome: 'Carlos Eduardo Lima', avatar: 'CEL', telefone: '(11) 98765-4322' },
    bairro: 'Jardim das Flores',
    totalFamilias: 0,
    totalIndividuos: 0,
    vulnerabilidade: { alta: 0, media: 0, baixa: 0 }
  },
  {
    id: 3,
    nome: 'Microárea 03 - Parque Industrial',
    codigo: 'MA-003',
    acs: { id: 3, nome: 'Maria Fernanda Oliveira', avatar: 'MFO', telefone: '(11) 98765-4323' },
    bairro: 'Parque Industrial',
    totalFamilias: 0,
    totalIndividuos: 0,
    vulnerabilidade: { alta: 0, media: 0, baixa: 0 }
  },
  {
    id: 4,
    nome: 'Microárea 04 - Centro',
    codigo: 'MA-004',
    acs: { id: 4, nome: 'José Roberto Santos', avatar: 'JRS', telefone: '(11) 98765-4324' },
    bairro: 'Centro',
    totalFamilias: 0,
    totalIndividuos: 0,
    vulnerabilidade: { alta: 0, media: 0, baixa: 0 }
  }
];

// ── Famílias cadastradas ───────────────────────────────────────────
let nextFamilyId = 16;
const families = [
  // Microárea 1
  { id: 1, microareaId: 1, sobrenome: 'Silva', responsavel: 'Maria da Silva', endereco: 'Rua das Acácias, 150', membros: 5, renda: '1-2 SM', moradia: 'Alvenaria', agua: 'Rede pública', esgoto: 'Rede pública', vulnerabilidade: 'Alta', fatoresRisco: ['Gestante', 'Criança < 2 anos'], observacoes: 'Gestante de alto risco, 7 meses.' },
  { id: 2, microareaId: 1, sobrenome: 'Oliveira', responsavel: 'José Oliveira', endereco: 'Rua das Acácias, 220', membros: 3, renda: '2-3 SM', moradia: 'Alvenaria', agua: 'Rede pública', esgoto: 'Rede pública', vulnerabilidade: 'Baixa', fatoresRisco: [], observacoes: '' },
  { id: 3, microareaId: 1, sobrenome: 'Santos', responsavel: 'Ana Santos', endereco: 'Rua dos Ipês, 45', membros: 6, renda: '< 1 SM', moradia: 'Madeira', agua: 'Poço', esgoto: 'Fossa', vulnerabilidade: 'Alta', fatoresRisco: ['Hipertenso', 'Diabético', 'Idoso acamado'], observacoes: 'Idoso acamado necessita visita semanal.' },
  { id: 4, microareaId: 1, sobrenome: 'Pereira', responsavel: 'Lúcia Pereira', endereco: 'Rua dos Ipês, 112', membros: 4, renda: '1-2 SM', moradia: 'Alvenaria', agua: 'Rede pública', esgoto: 'Rede pública', vulnerabilidade: 'Média', fatoresRisco: ['Hipertenso'], observacoes: '' },
  // Microárea 2
  { id: 5, microareaId: 2, sobrenome: 'Costa', responsavel: 'Roberto Costa', endereco: 'Av. Brasil, 500', membros: 4, renda: '2-3 SM', moradia: 'Alvenaria', agua: 'Rede pública', esgoto: 'Rede pública', vulnerabilidade: 'Média', fatoresRisco: ['Diabético'], observacoes: '' },
  { id: 6, microareaId: 2, sobrenome: 'Almeida', responsavel: 'Fernanda Almeida', endereco: 'Av. Brasil, 780', membros: 7, renda: '< 1 SM', moradia: 'Mista', agua: 'Rede pública', esgoto: 'Fossa', vulnerabilidade: 'Alta', fatoresRisco: ['Gestante', 'Criança < 2 anos', 'Tuberculose'], observacoes: 'Gestante + criança com vacina atrasada.' },
  { id: 7, microareaId: 2, sobrenome: 'Rodrigues', responsavel: 'Marcos Rodrigues', endereco: 'Rua Paraná, 33', membros: 2, renda: '3-5 SM', moradia: 'Alvenaria', agua: 'Rede pública', esgoto: 'Rede pública', vulnerabilidade: 'Baixa', fatoresRisco: [], observacoes: '' },
  { id: 8, microareaId: 2, sobrenome: 'Ferreira', responsavel: 'Dona Marta Ferreira', endereco: 'Rua Paraná, 88', membros: 3, renda: '1-2 SM', moradia: 'Alvenaria', agua: 'Rede pública', esgoto: 'Rede pública', vulnerabilidade: 'Média', fatoresRisco: ['Saúde Mental', 'Hipertenso'], observacoes: 'Paciente em tratamento psiquiátrico.' },
  // Microárea 3
  { id: 9, microareaId: 3, sobrenome: 'Nascimento', responsavel: 'Clara Nascimento', endereco: 'Rua Industrial, 200', membros: 5, renda: '1-2 SM', moradia: 'Alvenaria', agua: 'Rede pública', esgoto: 'Rede pública', vulnerabilidade: 'Alta', fatoresRisco: ['Gestante alto risco', 'Diabético'], observacoes: 'Gestante diabética, pré-natal de alto risco.' },
  { id: 10, microareaId: 3, sobrenome: 'Lima', responsavel: 'Pedro Lima', endereco: 'Rua Industrial, 315', membros: 4, renda: '2-3 SM', moradia: 'Alvenaria', agua: 'Rede pública', esgoto: 'Rede pública', vulnerabilidade: 'Baixa', fatoresRisco: [], observacoes: '' },
  { id: 11, microareaId: 3, sobrenome: 'Barbosa', responsavel: 'Sebastião Barbosa', endereco: 'Trav. das Mangueiras, 22', membros: 3, renda: '< 1 SM', moradia: 'Madeira', agua: 'Poço', esgoto: 'Céu aberto', vulnerabilidade: 'Alta', fatoresRisco: ['Idoso', 'Hipertenso', 'DPOC'], observacoes: 'Condições precárias de moradia.' },
  { id: 12, microareaId: 3, sobrenome: 'Araújo', responsavel: 'Juliana Araújo', endereco: 'Rua Industrial, 410', membros: 4, renda: '1-2 SM', moradia: 'Alvenaria', agua: 'Rede pública', esgoto: 'Rede pública', vulnerabilidade: 'Média', fatoresRisco: ['Criança < 5 anos'], observacoes: '' },
  // Microárea 4
  { id: 13, microareaId: 4, sobrenome: 'Cardoso', responsavel: 'Paulo Cardoso', endereco: 'Rua XV de Novembro, 100', membros: 3, renda: '3-5 SM', moradia: 'Alvenaria', agua: 'Rede pública', esgoto: 'Rede pública', vulnerabilidade: 'Baixa', fatoresRisco: [], observacoes: '' },
  { id: 14, microareaId: 4, sobrenome: 'Mendes', responsavel: 'Tereza Mendes', endereco: 'Rua XV de Novembro, 250', membros: 2, renda: '1-2 SM', moradia: 'Alvenaria', agua: 'Rede pública', esgoto: 'Rede pública', vulnerabilidade: 'Média', fatoresRisco: ['Idosa', 'Hipertensa'], observacoes: 'Mora sozinha, viúva.' },
  { id: 15, microareaId: 4, sobrenome: 'Teixeira', responsavel: 'Amanda Teixeira', endereco: 'Rua da Paz, 55', membros: 5, renda: '< 1 SM', moradia: 'Mista', agua: 'Rede pública', esgoto: 'Fossa', vulnerabilidade: 'Alta', fatoresRisco: ['Gestante', 'Criança < 2 anos', 'Saúde Mental'], observacoes: 'Puérpera com depressão pós-parto.' }
];

// ── Indivíduos com estratificação de risco ─────────────────────────
const individuals = [
  // Família Silva (id 1)
  { id: 1, familiaId: 1, nome: 'Maria da Silva', idade: 28, sexo: 'F', riscos: { cardiovascular: 'Baixo', gestacional: 'Alto', crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  { id: 2, familiaId: 1, nome: 'João da Silva', idade: 32, sexo: 'M', riscos: { cardiovascular: 'Baixo', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  { id: 3, familiaId: 1, nome: 'Pedro da Silva', idade: 1, sexo: 'M', riscos: { cardiovascular: null, gestacional: null, crianca: 'Médio', diabetes: null, saudeMental: null } },
  // Família Santos (id 3)
  { id: 4, familiaId: 3, nome: 'José Santos', idade: 78, sexo: 'M', riscos: { cardiovascular: 'Alto', gestacional: null, crianca: null, diabetes: 'Alto', saudeMental: 'Médio' } },
  { id: 5, familiaId: 3, nome: 'Ana Santos', idade: 72, sexo: 'F', riscos: { cardiovascular: 'Alto', gestacional: null, crianca: null, diabetes: 'Médio', saudeMental: 'Baixo' } },
  // Família Pereira (id 4)
  { id: 6, familiaId: 4, nome: 'Lúcia Pereira', idade: 55, sexo: 'F', riscos: { cardiovascular: 'Médio', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  // Família Costa (id 5)
  { id: 7, familiaId: 5, nome: 'Roberto Costa', idade: 60, sexo: 'M', riscos: { cardiovascular: 'Médio', gestacional: null, crianca: null, diabetes: 'Alto', saudeMental: 'Baixo' } },
  // Família Almeida (id 6)
  { id: 8, familiaId: 6, nome: 'Fernanda Almeida', idade: 25, sexo: 'F', riscos: { cardiovascular: 'Baixo', gestacional: 'Alto', crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  { id: 9, familiaId: 6, nome: 'Lucas Almeida', idade: 1, sexo: 'M', riscos: { cardiovascular: null, gestacional: null, crianca: 'Alto', diabetes: null, saudeMental: null } },
  { id: 10, familiaId: 6, nome: 'Carlos Almeida', idade: 30, sexo: 'M', riscos: { cardiovascular: 'Baixo', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  // Família Ferreira (id 8)
  { id: 11, familiaId: 8, nome: 'Dona Marta Ferreira', idade: 62, sexo: 'F', riscos: { cardiovascular: 'Alto', gestacional: null, crianca: null, diabetes: 'Médio', saudeMental: 'Alto' } },
  // Família Nascimento (id 9)
  { id: 12, familiaId: 9, nome: 'Clara Nascimento', idade: 30, sexo: 'F', riscos: { cardiovascular: 'Baixo', gestacional: 'Alto', crianca: null, diabetes: 'Alto', saudeMental: 'Baixo' } },
  // Família Barbosa (id 11)
  { id: 13, familiaId: 11, nome: 'Sebastião Barbosa', idade: 74, sexo: 'M', riscos: { cardiovascular: 'Alto', gestacional: null, crianca: null, diabetes: 'Médio', saudeMental: 'Médio' } },
  // Família Araújo (id 12)
  { id: 14, familiaId: 12, nome: 'Juliana Araújo', idade: 29, sexo: 'F', riscos: { cardiovascular: 'Baixo', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  { id: 15, familiaId: 12, nome: 'Sofia Araújo', idade: 3, sexo: 'F', riscos: { cardiovascular: null, gestacional: null, crianca: 'Médio', diabetes: null, saudeMental: null } },
  // Família Mendes (id 14)
  { id: 16, familiaId: 14, nome: 'Tereza Mendes', idade: 70, sexo: 'F', riscos: { cardiovascular: 'Alto', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Médio' } },
  // Família Teixeira (id 15)
  { id: 17, familiaId: 15, nome: 'Amanda Teixeira', idade: 22, sexo: 'F', riscos: { cardiovascular: 'Baixo', gestacional: 'Baixo', crianca: null, diabetes: 'Baixo', saudeMental: 'Alto' } },
  { id: 18, familiaId: 15, nome: 'Bebê Teixeira', idade: 0, sexo: 'F', riscos: { cardiovascular: null, gestacional: null, crianca: 'Alto', diabetes: null, saudeMental: null } },
  // Família Oliveira (id 2)
  { id: 19, familiaId: 2, nome: 'José Oliveira', idade: 45, sexo: 'M', riscos: { cardiovascular: 'Baixo', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  { id: 20, familiaId: 2, nome: 'Sandra Oliveira', idade: 42, sexo: 'F', riscos: { cardiovascular: 'Baixo', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  // Família Rodrigues (id 7)
  { id: 21, familiaId: 7, nome: 'Marcos Rodrigues', idade: 38, sexo: 'M', riscos: { cardiovascular: 'Baixo', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  // Família Cardoso (id 13)
  { id: 22, familiaId: 13, nome: 'Paulo Cardoso', idade: 50, sexo: 'M', riscos: { cardiovascular: 'Baixo', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  // Família Lima (id 10)
  { id: 23, familiaId: 10, nome: 'Pedro Lima', idade: 40, sexo: 'M', riscos: { cardiovascular: 'Baixo', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  { id: 24, familiaId: 10, nome: 'Camila Lima', idade: 38, sexo: 'F', riscos: { cardiovascular: 'Baixo', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  // Additional individuals
  { id: 25, familiaId: 4, nome: 'Ricardo Pereira', idade: 58, sexo: 'M', riscos: { cardiovascular: 'Médio', gestacional: null, crianca: null, diabetes: 'Médio', saudeMental: 'Baixo' } },
  { id: 26, familiaId: 5, nome: 'Sandra Costa', idade: 55, sexo: 'F', riscos: { cardiovascular: 'Médio', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  { id: 27, familiaId: 9, nome: 'Marcos Nascimento', idade: 33, sexo: 'M', riscos: { cardiovascular: 'Baixo', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  { id: 28, familiaId: 11, nome: 'Davi Barbosa', idade: 45, sexo: 'M', riscos: { cardiovascular: 'Médio', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  { id: 29, familiaId: 15, nome: 'Carlos Teixeira', idade: 24, sexo: 'M', riscos: { cardiovascular: 'Baixo', gestacional: null, crianca: null, diabetes: 'Baixo', saudeMental: 'Baixo' } },
  { id: 30, familiaId: 6, nome: 'Ana Almeida', idade: 55, sexo: 'F', riscos: { cardiovascular: 'Médio', gestacional: null, crianca: null, diabetes: 'Médio', saudeMental: 'Baixo' } },
  { id: 31, familiaId: 3, nome: 'Marcos Santos', idade: 48, sexo: 'M', riscos: { cardiovascular: 'Médio', gestacional: null, crianca: null, diabetes: 'Médio', saudeMental: 'Baixo' } },
];

// ── Alertas de busca ativa ──────────────────────────────────────────
let nextAlertId = 14;
const alerts = [
  { id: 1, tipo: 'prenatal', urgencia: 'urgent', pacienteNome: 'Maria da Silva', familiaId: 1, microareaId: 1, motivo: 'Gestante faltou ao pré-natal', diasPendentes: 12, status: 'pending', dataCriacao: '2026-03-02' },
  { id: 2, tipo: 'vacina', urgencia: 'urgent', pacienteNome: 'Lucas Almeida', familiaId: 6, microareaId: 2, motivo: 'Criança com vacina em atraso (Pentavalente 3a dose)', diasPendentes: 25, status: 'pending', dataCriacao: '2026-02-17' },
  { id: 3, tipo: 'hipertensao', urgencia: 'moderate', pacienteNome: 'José Santos', familiaId: 3, microareaId: 1, motivo: 'Hipertenso sem aferir PA há 3 meses', diasPendentes: 90, status: 'pending', dataCriacao: '2025-12-14' },
  { id: 4, tipo: 'diabetes', urgencia: 'moderate', pacienteNome: 'Roberto Costa', familiaId: 5, microareaId: 2, motivo: 'Diabético sem consulta há 6 meses', diasPendentes: 180, status: 'pending', dataCriacao: '2025-09-14' },
  { id: 5, tipo: 'prenatal', urgencia: 'urgent', pacienteNome: 'Clara Nascimento', familiaId: 9, microareaId: 3, motivo: 'Gestante diabética faltou ao pré-natal', diasPendentes: 8, status: 'pending', dataCriacao: '2026-03-06' },
  { id: 6, tipo: 'consulta', urgencia: 'moderate', pacienteNome: 'Tereza Mendes', familiaId: 14, microareaId: 4, motivo: 'Idosa hipertensa sem consulta há 4 meses', diasPendentes: 120, status: 'pending', dataCriacao: '2025-11-14' },
  { id: 7, tipo: 'saude_mental', urgencia: 'urgent', pacienteNome: 'Amanda Teixeira', familiaId: 15, microareaId: 4, motivo: 'Puérpera com sinais de depressão pós-parto sem acompanhamento', diasPendentes: 15, status: 'pending', dataCriacao: '2026-02-27' },
  { id: 8, tipo: 'vacina', urgencia: 'urgent', pacienteNome: 'Bebê Teixeira', familiaId: 15, microareaId: 4, motivo: 'RN com vacinas BCG e Hepatite B pendentes', diasPendentes: 30, status: 'pending', dataCriacao: '2026-02-12' },
  { id: 9, tipo: 'tuberculose', urgencia: 'urgent', pacienteNome: 'Carlos Almeida', familiaId: 6, microareaId: 2, motivo: 'Paciente com TB faltou à DOTS', diasPendentes: 5, status: 'pending', dataCriacao: '2026-03-09' },
  { id: 10, tipo: 'hipertensao', urgencia: 'moderate', pacienteNome: 'Dona Marta Ferreira', familiaId: 8, microareaId: 2, motivo: 'Hipertensa com PA descontrolada - última aferição 190/110', diasPendentes: 45, status: 'pending', dataCriacao: '2026-01-28' },
  { id: 11, tipo: 'consulta', urgencia: 'moderate', pacienteNome: 'Sebastião Barbosa', familiaId: 11, microareaId: 3, motivo: 'Idoso com DPOC sem consulta há 5 meses', diasPendentes: 150, status: 'pending', dataCriacao: '2025-10-14' },
  { id: 12, tipo: 'prenatal', urgencia: 'urgent', pacienteNome: 'Fernanda Almeida', familiaId: 6, microareaId: 2, motivo: 'Gestante não realizou ultrassom do 2o trimestre', diasPendentes: 18, status: 'pending', dataCriacao: '2026-02-24' },
  { id: 13, tipo: 'vacina', urgencia: 'moderate', pacienteNome: 'Sofia Araújo', familiaId: 12, microareaId: 3, motivo: 'Criança com reforço da tríplice viral pendente', diasPendentes: 35, status: 'pending', dataCriacao: '2026-02-07' },
];

// ── Visitas domiciliares ────────────────────────────────────────────
let nextVisitId = 11;
const visits = [
  { id: 1, familiaId: 1, pacienteNome: 'Maria da Silva', endereco: 'Rua das Acácias, 150', tipo: 'Pré-natal', data: '2026-03-17', hora: '08:00', status: 'agendada', acsId: 1, motivo: 'Acompanhamento pré-natal 7o mês', observacoes: '' },
  { id: 2, familiaId: 3, pacienteNome: 'José Santos', endereco: 'Rua dos Ipês, 45', tipo: 'Rotina', data: '2026-03-17', hora: '09:30', status: 'agendada', acsId: 1, motivo: 'Visita semanal - idoso acamado', observacoes: '' },
  { id: 3, familiaId: 6, pacienteNome: 'Lucas Almeida', endereco: 'Av. Brasil, 780', tipo: 'Busca ativa', data: '2026-03-17', hora: '10:30', status: 'agendada', acsId: 2, motivo: 'Vacina em atraso', observacoes: '' },
  { id: 4, familiaId: 6, pacienteNome: 'Carlos Almeida', endereco: 'Av. Brasil, 780', tipo: 'Acompanhamento TB', data: '2026-03-18', hora: '08:00', status: 'agendada', acsId: 2, motivo: 'DOTS - medicação supervisionada', observacoes: '' },
  { id: 5, familiaId: 9, pacienteNome: 'Clara Nascimento', endereco: 'Rua Industrial, 200', tipo: 'Pré-natal', data: '2026-03-18', hora: '09:00', status: 'agendada', acsId: 3, motivo: 'Busca ativa gestante alto risco', observacoes: '' },
  { id: 6, familiaId: 11, pacienteNome: 'Sebastião Barbosa', endereco: 'Trav. das Mangueiras, 22', tipo: 'Rotina', data: '2026-03-18', hora: '10:30', status: 'agendada', acsId: 3, motivo: 'Acompanhamento DPOC e condições de moradia', observacoes: '' },
  { id: 7, familiaId: 15, pacienteNome: 'Amanda Teixeira', endereco: 'Rua da Paz, 55', tipo: 'Puérpera', data: '2026-03-19', hora: '08:00', status: 'agendada', acsId: 4, motivo: 'Avaliação puérpera - sinais de depressão', observacoes: '' },
  { id: 8, familiaId: 14, pacienteNome: 'Tereza Mendes', endereco: 'Rua XV de Novembro, 250', tipo: 'Rotina', data: '2026-03-19', hora: '09:30', status: 'agendada', acsId: 4, motivo: 'Aferição de PA e acompanhamento', observacoes: '' },
  { id: 9, familiaId: 5, pacienteNome: 'Roberto Costa', endereco: 'Av. Brasil, 500', tipo: 'Busca ativa', data: '2026-03-20', hora: '08:30', status: 'agendada', acsId: 2, motivo: 'Diabético sem consulta - orientação', observacoes: '' },
  { id: 10, familiaId: 8, pacienteNome: 'Dona Marta Ferreira', endereco: 'Rua Paraná, 88', tipo: 'Acompanhamento', data: '2026-03-20', hora: '10:00', status: 'agendada', acsId: 2, motivo: 'PA descontrolada - monitoramento', observacoes: '' },
];

// ── Linhas de Cuidado (MACC) ────────────────────────────────────────
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

// ── Referrals (encaminhamentos) ─────────────────────────────────────
const referrals = [];
let nextReferralId = 1;

// ── Helpers ─────────────────────────────────────────────────────────
function computeMicroareaStats() {
  microareas.forEach(ma => {
    const maFamilies = families.filter(f => f.microareaId === ma.id);
    ma.totalFamilias = maFamilies.length;
    ma.totalIndividuos = individuals.filter(ind => maFamilies.some(f => f.id === ind.familiaId)).length;
    ma.vulnerabilidade = {
      alta: maFamilies.filter(f => f.vulnerabilidade === 'Alta').length,
      media: maFamilies.filter(f => f.vulnerabilidade === 'Média').length,
      baixa: maFamilies.filter(f => f.vulnerabilidade === 'Baixa').length
    };
  });
}
computeMicroareaStats();

// ── Service Methods ─────────────────────────────────────────────────
export const acsService = {

  getMicroareas() {
    computeMicroareaStats();
    return microareas;
  },

  getFamilies(filters = {}) {
    let result = [...families];
    if (filters.microareaId) {
      result = result.filter(f => f.microareaId === Number(filters.microareaId));
    }
    if (filters.vulnerabilidade) {
      result = result.filter(f => f.vulnerabilidade === filters.vulnerabilidade);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(f =>
        f.sobrenome.toLowerCase().includes(q) ||
        f.responsavel.toLowerCase().includes(q) ||
        f.endereco.toLowerCase().includes(q)
      );
    }
    // attach individuals
    return result.map(f => ({
      ...f,
      individuos: individuals.filter(ind => ind.familiaId === f.id)
    }));
  },

  getFamilyById(id) {
    const family = families.find(f => f.id === Number(id));
    if (!family) return null;
    return {
      ...family,
      individuos: individuals.filter(ind => ind.familiaId === family.id),
      microarea: microareas.find(m => m.id === family.microareaId)
    };
  },

  registerFamily(data) {
    const newFamily = {
      id: nextFamilyId++,
      microareaId: Number(data.microareaId) || 1,
      sobrenome: data.sobrenome,
      responsavel: data.responsavel,
      endereco: data.endereco,
      membros: Number(data.membros) || 1,
      renda: data.renda || 'Não informado',
      moradia: data.moradia || 'Não informado',
      agua: data.agua || 'Não informado',
      esgoto: data.esgoto || 'Não informado',
      vulnerabilidade: data.vulnerabilidade || 'Média',
      fatoresRisco: data.fatoresRisco || [],
      observacoes: data.observacoes || ''
    };
    families.push(newFamily);
    computeMicroareaStats();
    return newFamily;
  },

  stratifyRisk(filters = {}) {
    let result = [...individuals];
    if (filters.familiaId) {
      result = result.filter(ind => ind.familiaId === Number(filters.familiaId));
    }
    if (filters.microareaId) {
      const maFamilyIds = families.filter(f => f.microareaId === Number(filters.microareaId)).map(f => f.id);
      result = result.filter(ind => maFamilyIds.includes(ind.familiaId));
    }
    if (filters.categoria) {
      result = result.filter(ind => {
        const val = ind.riscos[filters.categoria];
        return val && val !== null;
      });
    }
    if (filters.nivel) {
      result = result.filter(ind => {
        return Object.values(ind.riscos).some(v => v === filters.nivel);
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

  getAlerts(filters = {}) {
    let result = alerts.filter(a => a.status === 'pending');
    if (filters.tipo) {
      result = result.filter(a => a.tipo === filters.tipo);
    }
    if (filters.urgencia) {
      result = result.filter(a => a.urgencia === filters.urgencia);
    }
    if (filters.microareaId) {
      result = result.filter(a => a.microareaId === Number(filters.microareaId));
    }
    // sort by urgency then days pending
    result.sort((a, b) => {
      if (a.urgencia === 'urgent' && b.urgencia !== 'urgent') return -1;
      if (a.urgencia !== 'urgent' && b.urgencia === 'urgent') return 1;
      return b.diasPendentes - a.diasPendentes;
    });
    return result;
  },

  resolveAlert(id) {
    const alert = alerts.find(a => a.id === Number(id));
    if (!alert) return null;
    alert.status = 'resolved';
    alert.dataResolucao = new Date().toISOString().split('T')[0];
    return alert;
  },

  getVisits(filters = {}) {
    let result = [...visits];
    if (filters.status) {
      result = result.filter(v => v.status === filters.status);
    }
    if (filters.acsId) {
      result = result.filter(v => v.acsId === Number(filters.acsId));
    }
    if (filters.data) {
      result = result.filter(v => v.data === filters.data);
    }
    if (filters.tipo) {
      result = result.filter(v => v.tipo === filters.tipo);
    }
    result.sort((a, b) => {
      const dateComp = a.data.localeCompare(b.data);
      if (dateComp !== 0) return dateComp;
      return a.hora.localeCompare(b.hora);
    });
    return result;
  },

  scheduleVisit(data) {
    const newVisit = {
      id: nextVisitId++,
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
    };
    visits.push(newVisit);
    return newVisit;
  },

  recordVisit(id, data) {
    const visit = visits.find(v => v.id === Number(id));
    if (!visit) return null;
    visit.status = 'realizada';
    visit.observacoes = data.observacoes || '';
    visit.condicaoPaciente = data.condicaoPaciente || '';
    visit.sinaisVitais = data.sinaisVitais || {};
    visit.encaminhamento = data.encaminhamento || false;
    visit.proximaVisita = data.proximaVisita || null;
    visit.dataRealizacao = new Date().toISOString().split('T')[0];
    return visit;
  },

  getCareLines() {
    return careLines;
  },

  sendAlert(data) {
    const referral = {
      id: nextReferralId++,
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
    };
    referrals.push(referral);
    return referral;
  }
};

function getMaxRisk(riscos) {
  const vals = Object.values(riscos).filter(v => v !== null);
  if (vals.includes('Alto')) return 'Alto';
  if (vals.includes('Médio')) return 'Médio';
  if (vals.includes('Baixo')) return 'Baixo';
  return null;
}

export default acsService;
