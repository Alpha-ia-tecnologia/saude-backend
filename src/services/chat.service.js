// Chat Service - Internal Communication
// RF23 - Chat Interno entre profissionais de saúde

// In-memory data store

let nextMessageId = 31;
let nextDirectMessageId = 21;

// System users (healthcare professionals)
const users = [
    { id: 'U001', nome: 'Dr. Carlos Oliveira', cargo: 'Médico Clínico Geral', departamento: 'Médicos', avatar: 'CO', online: true },
    { id: 'U002', nome: 'Dra. Ana Santos', cargo: 'Médica de Família', departamento: 'Médicos', avatar: 'AS', online: true },
    { id: 'U003', nome: 'Dr. Paulo Lima', cargo: 'Cardiologista', departamento: 'Médicos', avatar: 'PL', online: false },
    { id: 'U004', nome: 'Enf. Carla Dias', cargo: 'Enfermeira Chefe', departamento: 'Enfermagem', avatar: 'CD', online: true },
    { id: 'U005', nome: 'Enf. Roberto Alves', cargo: 'Enfermeiro', departamento: 'Enfermagem', avatar: 'RA', online: true },
    { id: 'U006', nome: 'Téc. Luciana Moraes', cargo: 'Técnica de Enfermagem', departamento: 'Enfermagem', avatar: 'LM', online: false },
    { id: 'U007', nome: 'Farm. Juliana Rocha', cargo: 'Farmacêutica', departamento: 'Farmácia', avatar: 'JR', online: true },
    { id: 'U008', nome: 'Farm. Ricardo Mendes', cargo: 'Farmacêutico', departamento: 'Farmácia', avatar: 'RM', online: false },
    { id: 'U009', nome: 'Sandra Oliveira', cargo: 'Recepcionista', departamento: 'Recepção', avatar: 'SO', online: true },
    { id: 'U010', nome: 'Marcos Pereira', cargo: 'Recepcionista', departamento: 'Recepção', avatar: 'MP', online: true },
    { id: 'U011', nome: 'Adriana Costa', cargo: 'Coordenadora', departamento: 'Administração', avatar: 'AC', online: true },
    { id: 'U012', nome: 'Fernando Souza', cargo: 'Diretor Administrativo', departamento: 'Administração', avatar: 'FS', online: false },
];

// Current logged-in user (for demo purposes)
const currentUser = users[0]; // Dr. Carlos Oliveira

// Channels
const channels = [
    {
        id: 'CH001',
        nome: 'Geral',
        descricao: 'Canal geral para comunicação entre todos os profissionais da unidade. Em conformidade com a LGPD - não compartilhe dados sensíveis de pacientes.',
        icone: 'hash',
        departamento: null,
        membros: users.map(u => u.id),
        naoLidas: 3
    },
    {
        id: 'CH002',
        nome: 'Recepção',
        descricao: 'Canal exclusivo para a equipe de recepção. Avisos sobre agendamentos, chegadas e demandas administrativas.',
        icone: 'hash',
        departamento: 'Recepção',
        membros: ['U009', 'U010', 'U011', 'U012'],
        naoLidas: 0
    },
    {
        id: 'CH003',
        nome: 'Enfermagem',
        descricao: 'Canal da equipe de enfermagem. Discussão de protocolos, escalas e atualizações de pacientes.',
        icone: 'hash',
        departamento: 'Enfermagem',
        membros: ['U004', 'U005', 'U006', 'U001', 'U002'],
        naoLidas: 5
    },
    {
        id: 'CH004',
        nome: 'Médicos',
        descricao: 'Canal do corpo médico. Discussão de casos, interconsultas e atualizações clínicas.',
        icone: 'hash',
        departamento: 'Médicos',
        membros: ['U001', 'U002', 'U003'],
        naoLidas: 1
    },
    {
        id: 'CH005',
        nome: 'Farmácia',
        descricao: 'Canal da farmácia. Alertas de estoque, lotes vencendo e solicitações especiais.',
        icone: 'hash',
        departamento: 'Farmácia',
        membros: ['U007', 'U008', 'U001', 'U002', 'U004'],
        naoLidas: 2
    },
    {
        id: 'CH006',
        nome: 'Administração',
        descricao: 'Canal da administração. Comunicados institucionais, RH e planejamento.',
        icone: 'hash',
        departamento: 'Administração',
        membros: ['U011', 'U012', 'U001'],
        naoLidas: 0
    }
];

// Channel messages
let channelMessages = [
    // Geral
    { id: 'MSG001', channelId: 'CH001', fromId: 'U011', from: 'Adriana Costa', text: 'Bom dia a todos! Lembrete: reunião de equipe amanhã às 14h na sala de conferências.', timestamp: '2026-03-14T07:30:00', read: true },
    { id: 'MSG002', channelId: 'CH001', fromId: 'U001', from: 'Dr. Carlos Oliveira', text: 'Bom dia! Confirmado. Vou preparar a pauta sobre os novos protocolos.', timestamp: '2026-03-14T07:35:00', read: true },
    { id: 'MSG003', channelId: 'CH001', fromId: 'U004', from: 'Enf. Carla Dias', text: 'Bom dia! Posso incluir na pauta a atualização do protocolo de administração de insulina?', timestamp: '2026-03-14T07:40:00', read: true },
    { id: 'MSG004', channelId: 'CH001', fromId: 'U011', from: 'Adriana Costa', text: 'Claro, Carla! Já adicionei. Alguém mais tem pautas?', timestamp: '2026-03-14T07:45:00', read: true },
    { id: 'MSG005', channelId: 'CH001', fromId: 'U007', from: 'Farm. Juliana Rocha', text: 'Gostaria de apresentar o relatório de medicamentos próximos ao vencimento. Temos 8 lotes que vencem nos próximos 30 dias.', timestamp: '2026-03-14T08:00:00', read: false },
    { id: 'MSG006', channelId: 'CH001', fromId: 'U009', from: 'Sandra Oliveira', text: 'Informo que a agenda de hoje está cheia. 42 pacientes agendados. Reforço para os médicos manterem o horário.', timestamp: '2026-03-14T08:15:00', read: false },
    { id: 'MSG007', channelId: 'CH001', fromId: 'U012', from: 'Fernando Souza', text: 'Atenção: manutenção do sistema será realizada no domingo das 2h às 6h. Não haverá indisponibilidade em horário comercial.', timestamp: '2026-03-14T08:30:00', read: false },

    // Enfermagem
    { id: 'MSG008', channelId: 'CH003', fromId: 'U004', from: 'Enf. Carla Dias', text: 'Equipe, a paciente Maria Silva (Leito 12) teve pico de PA às 6h: 180x110. Medicação SOS administrada.', timestamp: '2026-03-14T06:30:00', read: true },
    { id: 'MSG009', channelId: 'CH003', fromId: 'U005', from: 'Enf. Roberto Alves', text: 'Entendido. Vou fazer a checagem das 8h e monitorar. Alguma orientação médica adicional?', timestamp: '2026-03-14T06:35:00', read: true },
    { id: 'MSG010', channelId: 'CH003', fromId: 'U001', from: 'Dr. Carlos Oliveira', text: 'Obrigado pelo aviso, Carla. Se PA não baixar para < 150x90 em 2h, me avisem para ajustar prescrição.', timestamp: '2026-03-14T06:45:00', read: true },
    { id: 'MSG011', channelId: 'CH003', fromId: 'U006', from: 'Téc. Luciana Moraes', text: 'Plantão noturno tranquilo. Todas as medicações das 0h e 6h administradas conforme aprazamento.', timestamp: '2026-03-14T07:00:00', read: true },
    { id: 'MSG012', channelId: 'CH003', fromId: 'U004', from: 'Enf. Carla Dias', text: 'Atualização: PA da paciente Maria Silva às 8h: 145x88. Melhorando.', timestamp: '2026-03-14T08:10:00', read: false },
    { id: 'MSG013', channelId: 'CH003', fromId: 'U005', from: 'Enf. Roberto Alves', text: 'Paciente José Carlos (Leito 04) completou ciclo de Ceftriaxona. Avisar Dra. Ana para reavaliação.', timestamp: '2026-03-14T09:00:00', read: false },
    { id: 'MSG014', channelId: 'CH003', fromId: 'U004', from: 'Enf. Carla Dias', text: 'Lembrem-se: inventário de material descartável hoje à tarde. Precisamos contar tudo até 17h.', timestamp: '2026-03-14T09:15:00', read: false },
    { id: 'MSG015', channelId: 'CH003', fromId: 'U002', from: 'Dra. Ana Santos', text: 'Roberto, obrigada. Vou passar no leito até 10h para reavaliar o José Carlos.', timestamp: '2026-03-14T09:20:00', read: false },
    { id: 'MSG016', channelId: 'CH003', fromId: 'U006', from: 'Téc. Luciana Moraes', text: 'Preciso de ajuda no banho do Sr. Pedro (Leito 08). Ele está com dificuldade de mobilidade hoje.', timestamp: '2026-03-14T09:30:00', read: false },

    // Médicos
    { id: 'MSG017', channelId: 'CH004', fromId: 'U001', from: 'Dr. Carlos Oliveira', text: 'Colegas, resultado da biópsia do paciente PRONT-2025-0045 saiu. Sugiro discussão do caso.', timestamp: '2026-03-14T08:00:00', read: true },
    { id: 'MSG018', channelId: 'CH004', fromId: 'U002', from: 'Dra. Ana Santos', text: 'Posso ver às 11h. Pode compartilhar o laudo no prontuário?', timestamp: '2026-03-14T08:20:00', read: true },
    { id: 'MSG019', channelId: 'CH004', fromId: 'U003', from: 'Dr. Paulo Lima', text: 'Estou no consultório externo hoje, mas posso participar por videochamada se for urgente.', timestamp: '2026-03-14T08:45:00', read: false },

    // Farmácia
    { id: 'MSG020', channelId: 'CH005', fromId: 'U007', from: 'Farm. Juliana Rocha', text: 'ALERTA: Lote de Captopril 25mg (CAP-2024-C01) vence em 6 dias. Restam 60 unidades. Priorizar dispensação deste lote.', timestamp: '2026-03-14T07:15:00', read: true },
    { id: 'MSG021', channelId: 'CH005', fromId: 'U008', from: 'Farm. Ricardo Mendes', text: 'Entendido. Vou separar e etiquetar como prioridade. Já temos o lote novo (CAP-2025-A01) disponível.', timestamp: '2026-03-14T07:25:00', read: true },
    { id: 'MSG022', channelId: 'CH005', fromId: 'U007', from: 'Farm. Juliana Rocha', text: 'Prescrição do Dr. Carlos para Maria Silva já foi recebida. Iniciando separação.', timestamp: '2026-03-14T08:35:00', read: true },
    { id: 'MSG023', channelId: 'CH005', fromId: 'U004', from: 'Enf. Carla Dias', text: 'Farmácia, precisamos de mais Dipirona EV no carrinho de emergência da Enf. A. Acabou no plantão noturno.', timestamp: '2026-03-14T09:00:00', read: false },
    { id: 'MSG024', channelId: 'CH005', fromId: 'U007', from: 'Farm. Juliana Rocha', text: 'Carla, já separei 20 ampolas. Ricardo vai levar em 15 minutos.', timestamp: '2026-03-14T09:10:00', read: false },

    // Administração
    { id: 'MSG025', channelId: 'CH006', fromId: 'U012', from: 'Fernando Souza', text: 'Relatório mensal de indicadores disponível na pasta compartilhada. Destaque: taxa de ocupação em 87%.', timestamp: '2026-03-14T08:00:00', read: true },
    { id: 'MSG026', channelId: 'CH006', fromId: 'U011', from: 'Adriana Costa', text: 'Obrigada, Fernando. Vou incluir na apresentação da reunião mensal.', timestamp: '2026-03-14T08:15:00', read: true },

    // Recepção
    { id: 'MSG027', channelId: 'CH002', fromId: 'U009', from: 'Sandra Oliveira', text: 'Marcos, o paciente das 10h ligou pedindo para remarcar. Pode verificar horário disponível?', timestamp: '2026-03-14T08:45:00', read: true },
    { id: 'MSG028', channelId: 'CH002', fromId: 'U010', from: 'Marcos Pereira', text: 'Verificando... Tem vaga dia 18 às 14h ou dia 19 às 9h.', timestamp: '2026-03-14T08:50:00', read: true },
    { id: 'MSG029', channelId: 'CH002', fromId: 'U009', from: 'Sandra Oliveira', text: 'Perfeito, vou ligar de volta e oferecer as opções. Obrigada!', timestamp: '2026-03-14T08:55:00', read: true },
    { id: 'MSG030', channelId: 'CH002', fromId: 'U010', from: 'Marcos Pereira', text: 'Aviso: paciente José Carlos Oliveira teve alta médica. Preparar documentação de saída.', timestamp: '2026-03-14T09:30:00', read: true },
];

// Direct messages
let directMessages = [
    // Between U001 (Dr. Carlos) and U004 (Enf. Carla)
    { id: 'DM001', fromId: 'U004', toId: 'U001', text: 'Dr. Carlos, a paciente Maria Silva está queixando-se de cefaleia intensa há 2 horas.', timestamp: '2026-03-14T09:00:00', read: true },
    { id: 'DM002', fromId: 'U001', toId: 'U004', text: 'Obrigado, Carla. Pode administrar Dipirona 500mg VO agora e eu passo no leito em 30min.', timestamp: '2026-03-14T09:05:00', read: true },
    { id: 'DM003', fromId: 'U004', toId: 'U001', text: 'Medicação administrada às 09:08. Vou monitorar.', timestamp: '2026-03-14T09:10:00', read: true },
    { id: 'DM004', fromId: 'U001', toId: 'U004', text: 'Perfeito. Se não melhorar em 1h, solicitar TC de crânio.', timestamp: '2026-03-14T09:12:00', read: false },

    // Between U001 (Dr. Carlos) and U007 (Farm. Juliana)
    { id: 'DM005', fromId: 'U007', toId: 'U001', text: 'Dr. Carlos, sobre a prescrição da Maria Silva: a Insulina NPH está com estoque baixo. Temos apenas 2 frascos do lote que vence em abril.', timestamp: '2026-03-14T08:40:00', read: true },
    { id: 'DM006', fromId: 'U001', toId: 'U007', text: 'Juliana, pode dispensar do lote que vence antes. Já solicitei nova compra via sistema.', timestamp: '2026-03-14T08:45:00', read: true },
    { id: 'DM007', fromId: 'U007', toId: 'U001', text: 'Perfeito, vou dispensar do LOT INS-2025-A01. Previsão de entrega do novo lote?', timestamp: '2026-03-14T08:48:00', read: true },
    { id: 'DM008', fromId: 'U001', toId: 'U007', text: 'Administração disse que chega na segunda-feira. Obrigado pela atenção.', timestamp: '2026-03-14T08:50:00', read: true },

    // Between U001 (Dr. Carlos) and U002 (Dra. Ana)
    { id: 'DM009', fromId: 'U002', toId: 'U001', text: 'Carlos, você viu o eco do paciente do leito 04? Achei a FE baixa para a idade dele.', timestamp: '2026-03-14T07:50:00', read: true },
    { id: 'DM010', fromId: 'U001', toId: 'U002', text: 'Vi sim. FE de 42%. Vamos discutir o caso com o Paulo na interconsulta.', timestamp: '2026-03-14T07:55:00', read: true },
    { id: 'DM011', fromId: 'U002', toId: 'U001', text: 'Concordo. Pode ser cardiomiopatia dilatada. Pedi BNP e troponina.', timestamp: '2026-03-14T08:00:00', read: true },
    { id: 'DM012', fromId: 'U001', toId: 'U002', text: 'Boa conduta. Resultado deve sair até amanhã.', timestamp: '2026-03-14T08:05:00', read: true },

    // Between U001 (Dr. Carlos) and U011 (Adriana)
    { id: 'DM013', fromId: 'U011', toId: 'U001', text: 'Dr. Carlos, precisamos da sua assinatura no relatório anual de qualidade. Pode passar na administração hoje?', timestamp: '2026-03-14T08:20:00', read: true },
    { id: 'DM014', fromId: 'U001', toId: 'U011', text: 'Posso passar às 16h, após as consultas. Pode ser?', timestamp: '2026-03-14T08:25:00', read: true },
    { id: 'DM015', fromId: 'U011', toId: 'U001', text: 'Perfeito! Estarei aguardando. Obrigada!', timestamp: '2026-03-14T08:28:00', read: true },

    // Between U001 (Dr. Carlos) and U005 (Enf. Roberto)
    { id: 'DM016', fromId: 'U005', toId: 'U001', text: 'Dr. Carlos, paciente José Carlos relata melhora significativa. Febre cedeu, último registro 36.4°C.', timestamp: '2026-03-14T10:00:00', read: false },
    { id: 'DM017', fromId: 'U005', toId: 'U001', text: 'Exames laboratoriais de hoje já foram colhidos. PCR e hemograma.', timestamp: '2026-03-14T10:05:00', read: false },

    // Between U001 (Dr. Carlos) and U009 (Sandra - Recepção)
    { id: 'DM018', fromId: 'U009', toId: 'U001', text: 'Dr. Carlos, a esposa do Sr. Pedro Lima está na recepção querendo falar sobre a alta dele. Pode atendê-la?', timestamp: '2026-03-14T10:30:00', read: false },

    // Between other users
    { id: 'DM019', fromId: 'U004', toId: 'U007', text: 'Juliana, preciso do lote novo de Enoxaparina para a UTI. Pode separar?', timestamp: '2026-03-14T09:40:00', read: true },
    { id: 'DM020', fromId: 'U007', toId: 'U004', text: 'Já separei, Carla. Ricardo leva em 10 minutos junto com a Dipirona.', timestamp: '2026-03-14T09:45:00', read: true },
];

class ChatService {
    /**
     * Get current user (demo)
     */
    getCurrentUser() {
        return currentUser;
    }

    /**
     * Get all channels
     */
    getChannels() {
        return channels.map(ch => {
            const lastMsg = channelMessages
                .filter(m => m.channelId === ch.id)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

            return {
                ...ch,
                ultimaMensagem: lastMsg ? lastMsg.text : '',
                ultimaAtividade: lastMsg ? lastMsg.timestamp : null
            };
        });
    }

    /**
     * Get messages for a channel
     */
    getMessages(channelId) {
        return channelMessages
            .filter(m => m.channelId === channelId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    /**
     * Send message to a channel
     */
    sendMessage(channelId, fromId, text) {
        const user = users.find(u => u.id === fromId) || currentUser;
        const channel = channels.find(c => c.id === channelId);
        if (!channel) throw new Error('Canal não encontrado');

        const message = {
            id: `MSG${String(nextMessageId++).padStart(3, '0')}`,
            channelId,
            fromId: user.id,
            from: user.nome,
            text,
            timestamp: new Date().toISOString(),
            read: false
        };

        channelMessages.push(message);
        return message;
    }

    /**
     * Get direct messages between current user and another user
     */
    getDirectMessages(userId, currentUserId = 'U001') {
        return directMessages
            .filter(m =>
                (m.fromId === currentUserId && m.toId === userId) ||
                (m.fromId === userId && m.toId === currentUserId)
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    /**
     * Send direct message
     */
    sendDirectMessage(toId, fromId, text) {
        const from = users.find(u => u.id === fromId) || currentUser;
        const to = users.find(u => u.id === toId);
        if (!to) throw new Error('Usuário não encontrado');

        const message = {
            id: `DM${String(nextDirectMessageId++).padStart(3, '0')}`,
            fromId: from.id,
            toId: to.id,
            text,
            timestamp: new Date().toISOString(),
            read: false
        };

        directMessages.push(message);
        return message;
    }

    /**
     * Get all available users/contacts
     */
    getUsers() {
        return users;
    }

    /**
     * Get online users
     */
    getOnlineUsers() {
        return users.filter(u => u.online);
    }

    /**
     * Get direct message contacts with last message and unread count
     */
    getDirectMessageContacts(currentUserId = 'U001') {
        const contacts = [];
        const contactIds = new Set();

        directMessages
            .filter(m => m.fromId === currentUserId || m.toId === currentUserId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .forEach(m => {
                const contactId = m.fromId === currentUserId ? m.toId : m.fromId;
                if (!contactIds.has(contactId)) {
                    contactIds.add(contactId);
                    const user = users.find(u => u.id === contactId);
                    if (user) {
                        const unread = directMessages.filter(
                            dm => dm.fromId === contactId && dm.toId === currentUserId && !dm.read
                        ).length;

                        contacts.push({
                            ...user,
                            ultimaMensagem: m.text,
                            ultimaAtividade: m.timestamp,
                            naoLidas: unread
                        });
                    }
                }
            });

        return contacts;
    }
}

export const chatService = new ChatService();
export default chatService;
