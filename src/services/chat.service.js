// Chat Service - Internal Communication
// RF23 - Chat Interno entre profissionais de saude
// Refactored to use Prisma instead of in-memory arrays

import prisma from '../lib/prisma.js';

/**
 * Generate a channel-message ID like MSG031, MSG032, ...
 * Queries the max existing ID to derive the next sequential number.
 */
async function nextChannelMessageId() {
    const last = await prisma.channelMessage.findFirst({
        where: { id: { startsWith: 'MSG' } },
        orderBy: { id: 'desc' }
    });

    let nextNum = 1;
    if (last) {
        const numPart = parseInt(last.id.replace('MSG', ''), 10);
        if (!isNaN(numPart)) nextNum = numPart + 1;
    }

    return `MSG${String(nextNum).padStart(3, '0')}`;
}

/**
 * Generate a direct-message ID like DM021, DM022, ...
 */
async function nextDirectMessageId() {
    const last = await prisma.directMessage.findFirst({
        where: { id: { startsWith: 'DM' } },
        orderBy: { id: 'desc' }
    });

    let nextNum = 1;
    if (last) {
        const numPart = parseInt(last.id.replace('DM', ''), 10);
        if (!isNaN(numPart)) nextNum = numPart + 1;
    }

    return `DM${String(nextNum).padStart(3, '0')}`;
}

class ChatService {
    /**
     * Get current user (demo) - first user in the DB
     */
    async getCurrentUser() {
        const user = await prisma.chatUser.findFirst({
            orderBy: { id: 'asc' }
        });
        if (!user) return null;
        return {
            id: user.id,
            nome: user.nome,
            cargo: user.cargo,
            departamento: user.departamento,
            avatar: user.avatar,
            online: user.online
        };
    }

    /**
     * Get all channels with last message and unread count for the current user
     */
    async getChannels() {
        const channels = await prisma.channel.findMany({
            include: {
                members: {
                    include: { user: true }
                },
                messages: {
                    orderBy: { timestamp: 'desc' },
                    take: 1
                }
            },
            orderBy: { id: 'asc' }
        });

        return channels.map(ch => {
            const lastMsg = ch.messages[0] || null;

            return {
                id: ch.id,
                nome: ch.nome,
                descricao: ch.descricao,
                icone: ch.icone,
                departamento: ch.departamento,
                membros: ch.members.map(m => m.userId),
                naoLidas: ch.members.reduce((sum, m) => sum + m.naoLidas, 0),
                ultimaMensagem: lastMsg ? lastMsg.text : '',
                ultimaAtividade: lastMsg ? lastMsg.timestamp.toISOString() : null
            };
        });
    }

    /**
     * Get messages for a channel
     */
    async getMessages(channelId) {
        const messages = await prisma.channelMessage.findMany({
            where: { channelId },
            orderBy: { timestamp: 'asc' }
        });

        return messages.map(m => ({
            id: m.id,
            channelId: m.channelId,
            fromId: m.fromId,
            from: m.from,
            text: m.text,
            timestamp: m.timestamp.toISOString(),
            read: m.read
        }));
    }

    /**
     * Send message to a channel
     */
    async sendMessage(channelId, fromId, text) {
        const user = await prisma.chatUser.findUnique({ where: { id: fromId } });
        if (!user) {
            // Fallback to first user (demo current user)
            const fallback = await prisma.chatUser.findFirst({ orderBy: { id: 'asc' } });
            if (!fallback) throw new Error('Nenhum usuario encontrado');
            return this.sendMessage(channelId, fallback.id, text);
        }

        const channel = await prisma.channel.findUnique({ where: { id: channelId } });
        if (!channel) throw new Error('Canal nao encontrado');

        const msgId = await nextChannelMessageId();

        const message = await prisma.channelMessage.create({
            data: {
                id: msgId,
                channelId,
                fromId: user.id,
                from: user.nome,
                text,
                read: false
            }
        });

        return {
            id: message.id,
            channelId: message.channelId,
            fromId: message.fromId,
            from: message.from,
            text: message.text,
            timestamp: message.timestamp.toISOString(),
            read: message.read
        };
    }

    /**
     * Get direct messages between current user and another user
     */
    async getDirectMessages(userId, currentUserId = 'U001') {
        const messages = await prisma.directMessage.findMany({
            where: {
                OR: [
                    { fromId: currentUserId, toId: userId },
                    { fromId: userId, toId: currentUserId }
                ]
            },
            orderBy: { timestamp: 'asc' }
        });

        return messages.map(m => ({
            id: m.id,
            fromId: m.fromId,
            toId: m.toId,
            text: m.text,
            timestamp: m.timestamp.toISOString(),
            read: m.read
        }));
    }

    /**
     * Send direct message
     */
    async sendDirectMessage(toId, fromId, text) {
        const from = await prisma.chatUser.findUnique({ where: { id: fromId } });
        if (!from) {
            const fallback = await prisma.chatUser.findFirst({ orderBy: { id: 'asc' } });
            if (!fallback) throw new Error('Nenhum usuario encontrado');
            return this.sendDirectMessage(toId, fallback.id, text);
        }

        const to = await prisma.chatUser.findUnique({ where: { id: toId } });
        if (!to) throw new Error('Usuario nao encontrado');

        const dmId = await nextDirectMessageId();

        const message = await prisma.directMessage.create({
            data: {
                id: dmId,
                fromId: from.id,
                toId: to.id,
                text,
                read: false
            }
        });

        return {
            id: message.id,
            fromId: message.fromId,
            toId: message.toId,
            text: message.text,
            timestamp: message.timestamp.toISOString(),
            read: message.read
        };
    }

    /**
     * Get all available users/contacts
     */
    async getUsers() {
        const users = await prisma.chatUser.findMany({
            orderBy: { id: 'asc' }
        });

        return users.map(u => ({
            id: u.id,
            nome: u.nome,
            cargo: u.cargo,
            departamento: u.departamento,
            avatar: u.avatar,
            online: u.online
        }));
    }

    /**
     * Get online users
     */
    async getOnlineUsers() {
        const users = await prisma.chatUser.findMany({
            where: { online: true },
            orderBy: { id: 'asc' }
        });

        return users.map(u => ({
            id: u.id,
            nome: u.nome,
            cargo: u.cargo,
            departamento: u.departamento,
            avatar: u.avatar,
            online: u.online
        }));
    }

    /**
     * Get direct message contacts with last message and unread count
     */
    async getDirectMessageContacts(currentUserId = 'U001') {
        // Fetch all DMs involving the current user, ordered by newest first
        const allDMs = await prisma.directMessage.findMany({
            where: {
                OR: [
                    { fromId: currentUserId },
                    { toId: currentUserId }
                ]
            },
            orderBy: { timestamp: 'desc' }
        });

        const contacts = [];
        const contactIds = new Set();

        for (const m of allDMs) {
            const contactId = m.fromId === currentUserId ? m.toId : m.fromId;

            if (!contactIds.has(contactId)) {
                contactIds.add(contactId);

                const user = await prisma.chatUser.findUnique({ where: { id: contactId } });
                if (user) {
                    // Count unread messages from this contact to current user
                    const unread = await prisma.directMessage.count({
                        where: {
                            fromId: contactId,
                            toId: currentUserId,
                            read: false
                        }
                    });

                    contacts.push({
                        id: user.id,
                        nome: user.nome,
                        cargo: user.cargo,
                        departamento: user.departamento,
                        avatar: user.avatar,
                        online: user.online,
                        ultimaMensagem: m.text,
                        ultimaAtividade: m.timestamp.toISOString(),
                        naoLidas: unread
                    });
                }
            }
        }

        return contacts;
    }
}

export const chatService = new ChatService();
export default chatService;
