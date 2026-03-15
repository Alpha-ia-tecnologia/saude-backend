// Admin Service - User and Permission Management
// Predefined roles with module-level permissions

const modules = [
    'Dashboard',
    'Pacientes',
    'Agendamento',
    'Atendimento',
    'Farmacia',
    'Financeiro',
    'Estoque',
    'Relatorios',
    'NPS',
    'Administracao',
    'Comunicacao',
    'Enfermagem',
    'Analise de Dados',
    'Gestao Clinica'
];

const roles = [
    {
        id: 1,
        nome: 'Administrador',
        descricao: 'Acesso completo a todos os modulos do sistema',
        cor: '#dc2626',
        permissions: modules.reduce((acc, mod) => {
            acc[mod] = { read: true, write: true };
            return acc;
        }, {})
    },
    {
        id: 2,
        nome: 'Medico',
        descricao: 'Acesso a modulos clinicos e atendimento',
        cor: '#2563eb',
        permissions: {
            'Dashboard': { read: true, write: false },
            'Pacientes': { read: true, write: true },
            'Agendamento': { read: true, write: true },
            'Atendimento': { read: true, write: true },
            'Farmacia': { read: true, write: true },
            'Financeiro': { read: false, write: false },
            'Estoque': { read: true, write: false },
            'Relatorios': { read: true, write: false },
            'NPS': { read: true, write: false },
            'Administracao': { read: false, write: false },
            'Comunicacao': { read: true, write: true },
            'Enfermagem': { read: true, write: false },
            'Analise de Dados': { read: true, write: false },
            'Gestao Clinica': { read: true, write: true }
        }
    },
    {
        id: 3,
        nome: 'Enfermeiro',
        descricao: 'Acesso a enfermagem, triagem e pacientes',
        cor: '#059669',
        permissions: {
            'Dashboard': { read: true, write: false },
            'Pacientes': { read: true, write: true },
            'Agendamento': { read: true, write: false },
            'Atendimento': { read: true, write: true },
            'Farmacia': { read: true, write: false },
            'Financeiro': { read: false, write: false },
            'Estoque': { read: true, write: false },
            'Relatorios': { read: true, write: false },
            'NPS': { read: true, write: false },
            'Administracao': { read: false, write: false },
            'Comunicacao': { read: true, write: true },
            'Enfermagem': { read: true, write: true },
            'Analise de Dados': { read: false, write: false },
            'Gestao Clinica': { read: true, write: false }
        }
    },
    {
        id: 4,
        nome: 'Tecnico de Enfermagem',
        descricao: 'Acesso basico a enfermagem e triagem',
        cor: '#0891b2',
        permissions: {
            'Dashboard': { read: true, write: false },
            'Pacientes': { read: true, write: false },
            'Agendamento': { read: true, write: false },
            'Atendimento': { read: true, write: false },
            'Farmacia': { read: true, write: false },
            'Financeiro': { read: false, write: false },
            'Estoque': { read: true, write: false },
            'Relatorios': { read: false, write: false },
            'NPS': { read: false, write: false },
            'Administracao': { read: false, write: false },
            'Comunicacao': { read: true, write: false },
            'Enfermagem': { read: true, write: true },
            'Analise de Dados': { read: false, write: false },
            'Gestao Clinica': { read: false, write: false }
        }
    },
    {
        id: 5,
        nome: 'Recepcionista',
        descricao: 'Acesso a agendamento e recepcao de pacientes',
        cor: '#7c3aed',
        permissions: {
            'Dashboard': { read: true, write: false },
            'Pacientes': { read: true, write: true },
            'Agendamento': { read: true, write: true },
            'Atendimento': { read: true, write: false },
            'Farmacia': { read: false, write: false },
            'Financeiro': { read: false, write: false },
            'Estoque': { read: false, write: false },
            'Relatorios': { read: false, write: false },
            'NPS': { read: false, write: false },
            'Administracao': { read: false, write: false },
            'Comunicacao': { read: true, write: true },
            'Enfermagem': { read: false, write: false },
            'Analise de Dados': { read: false, write: false },
            'Gestao Clinica': { read: false, write: false }
        }
    },
    {
        id: 6,
        nome: 'Farmaceutico',
        descricao: 'Acesso a farmacia, estoque e dispensacao',
        cor: '#d97706',
        permissions: {
            'Dashboard': { read: true, write: false },
            'Pacientes': { read: true, write: false },
            'Agendamento': { read: false, write: false },
            'Atendimento': { read: true, write: false },
            'Farmacia': { read: true, write: true },
            'Financeiro': { read: false, write: false },
            'Estoque': { read: true, write: true },
            'Relatorios': { read: true, write: false },
            'NPS': { read: false, write: false },
            'Administracao': { read: false, write: false },
            'Comunicacao': { read: true, write: false },
            'Enfermagem': { read: false, write: false },
            'Analise de Dados': { read: false, write: false },
            'Gestao Clinica': { read: false, write: false }
        }
    },
    {
        id: 7,
        nome: 'Gestor',
        descricao: 'Acesso gerencial a relatorios e indicadores',
        cor: '#be185d',
        permissions: {
            'Dashboard': { read: true, write: true },
            'Pacientes': { read: true, write: false },
            'Agendamento': { read: true, write: false },
            'Atendimento': { read: true, write: false },
            'Farmacia': { read: true, write: false },
            'Financeiro': { read: true, write: true },
            'Estoque': { read: true, write: true },
            'Relatorios': { read: true, write: true },
            'NPS': { read: true, write: true },
            'Administracao': { read: true, write: false },
            'Comunicacao': { read: true, write: true },
            'Enfermagem': { read: true, write: false },
            'Analise de Dados': { read: true, write: true },
            'Gestao Clinica': { read: true, write: true }
        }
    },
    {
        id: 8,
        nome: 'ACS',
        descricao: 'Agente Comunitario de Saude - visitas domiciliares',
        cor: '#16a34a',
        permissions: {
            'Dashboard': { read: true, write: false },
            'Pacientes': { read: true, write: true },
            'Agendamento': { read: true, write: true },
            'Atendimento': { read: true, write: false },
            'Farmacia': { read: false, write: false },
            'Financeiro': { read: false, write: false },
            'Estoque': { read: false, write: false },
            'Relatorios': { read: true, write: false },
            'NPS': { read: false, write: false },
            'Administracao': { read: false, write: false },
            'Comunicacao': { read: true, write: true },
            'Enfermagem': { read: false, write: false },
            'Analise de Dados': { read: false, write: false },
            'Gestao Clinica': { read: false, write: false }
        }
    }
];

const users = [
    {
        id: 1,
        nome: 'Carlos Administrador',
        email: 'carlos.admin@saude.gov.br',
        cpf: '111.222.333-44',
        roleId: 1,
        status: 'ativo',
        ultimoLogin: '2026-03-14T08:30:00',
        criadoEm: '2024-01-15T10:00:00'
    },
    {
        id: 2,
        nome: 'Dr. Joao Silva',
        email: 'joao.silva@saude.gov.br',
        cpf: '222.333.444-55',
        roleId: 2,
        status: 'ativo',
        ultimoLogin: '2026-03-14T07:45:00',
        criadoEm: '2024-02-10T09:00:00'
    },
    {
        id: 3,
        nome: 'Dra. Ana Oliveira',
        email: 'ana.oliveira@saude.gov.br',
        cpf: '333.444.555-66',
        roleId: 2,
        status: 'ativo',
        ultimoLogin: '2026-03-13T16:20:00',
        criadoEm: '2024-02-15T11:00:00'
    },
    {
        id: 4,
        nome: 'Maria Santos',
        email: 'maria.santos@saude.gov.br',
        cpf: '444.555.666-77',
        roleId: 3,
        status: 'ativo',
        ultimoLogin: '2026-03-14T06:50:00',
        criadoEm: '2024-03-01T08:00:00'
    },
    {
        id: 5,
        nome: 'Pedro Ferreira',
        email: 'pedro.ferreira@saude.gov.br',
        cpf: '555.666.777-88',
        roleId: 4,
        status: 'ativo',
        ultimoLogin: '2026-03-13T14:30:00',
        criadoEm: '2024-03-10T09:30:00'
    },
    {
        id: 6,
        nome: 'Juliana Lima',
        email: 'juliana.lima@saude.gov.br',
        cpf: '666.777.888-99',
        roleId: 5,
        status: 'ativo',
        ultimoLogin: '2026-03-14T08:00:00',
        criadoEm: '2024-04-05T10:00:00'
    },
    {
        id: 7,
        nome: 'Dr. Rafael Costa',
        email: 'rafael.costa@saude.gov.br',
        cpf: '777.888.999-00',
        roleId: 6,
        status: 'inativo',
        ultimoLogin: '2026-02-28T11:00:00',
        criadoEm: '2024-04-20T14:00:00'
    },
    {
        id: 8,
        nome: 'Fernanda Almeida',
        email: 'fernanda.almeida@saude.gov.br',
        cpf: '888.999.000-11',
        roleId: 7,
        status: 'ativo',
        ultimoLogin: '2026-03-14T09:15:00',
        criadoEm: '2024-05-01T08:00:00'
    },
    {
        id: 9,
        nome: 'Lucas Rodrigues',
        email: 'lucas.rodrigues@saude.gov.br',
        cpf: '999.000.111-22',
        roleId: 8,
        status: 'ativo',
        ultimoLogin: '2026-03-13T17:00:00',
        criadoEm: '2024-06-15T09:00:00'
    },
    {
        id: 10,
        nome: 'Beatriz Martins',
        email: 'beatriz.martins@saude.gov.br',
        cpf: '000.111.222-33',
        roleId: 3,
        status: 'inativo',
        ultimoLogin: '2026-01-20T10:45:00',
        criadoEm: '2024-07-01T11:00:00'
    }
];

let nextUserId = users.length + 1;

const adminService = {
    getUsers(filters = {}) {
        let result = users.map(u => ({
            ...u,
            role: roles.find(r => r.id === u.roleId)
        }));

        if (filters.roleId) {
            result = result.filter(u => u.roleId === parseInt(filters.roleId));
        }
        if (filters.status) {
            result = result.filter(u => u.status === filters.status);
        }
        if (filters.search) {
            const term = filters.search.toLowerCase();
            result = result.filter(u =>
                u.nome.toLowerCase().includes(term) ||
                u.email.toLowerCase().includes(term)
            );
        }

        return result;
    },

    getUserById(id) {
        const user = users.find(u => u.id === parseInt(id));
        if (!user) return null;
        return {
            ...user,
            role: roles.find(r => r.id === user.roleId)
        };
    },

    createUser(data) {
        const existing = users.find(u => u.email === data.email);
        if (existing) {
            throw new Error('Email ja cadastrado no sistema');
        }

        const user = {
            id: nextUserId++,
            nome: data.nome,
            email: data.email,
            cpf: data.cpf || '',
            roleId: parseInt(data.roleId),
            status: 'ativo',
            ultimoLogin: null,
            criadoEm: new Date().toISOString()
        };

        users.push(user);
        return {
            ...user,
            role: roles.find(r => r.id === user.roleId)
        };
    },

    updateUser(id, data) {
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index === -1) {
            throw new Error('Usuario nao encontrado');
        }

        if (data.nome) users[index].nome = data.nome;
        if (data.email) users[index].email = data.email;
        if (data.cpf) users[index].cpf = data.cpf;
        if (data.roleId) users[index].roleId = parseInt(data.roleId);
        if (data.status) users[index].status = data.status;

        return {
            ...users[index],
            role: roles.find(r => r.id === users[index].roleId)
        };
    },

    deactivateUser(id) {
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index === -1) {
            throw new Error('Usuario nao encontrado');
        }

        users[index].status = 'inativo';
        return {
            ...users[index],
            role: roles.find(r => r.id === users[index].roleId)
        };
    },

    getRoles() {
        return roles;
    },

    getRoleById(id) {
        return roles.find(r => r.id === parseInt(id)) || null;
    },

    getPermissions(roleId) {
        const role = roles.find(r => r.id === parseInt(roleId));
        if (!role) return null;
        return {
            roleId: role.id,
            roleName: role.nome,
            permissions: role.permissions
        };
    },

    updatePermissions(roleId, permissions) {
        const index = roles.findIndex(r => r.id === parseInt(roleId));
        if (index === -1) {
            throw new Error('Perfil nao encontrado');
        }

        roles[index].permissions = {
            ...roles[index].permissions,
            ...permissions
        };

        return roles[index];
    },

    getModules() {
        return modules;
    }
};

export default adminService;
