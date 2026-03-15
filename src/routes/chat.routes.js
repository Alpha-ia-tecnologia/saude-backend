import express from 'express';
import { chatService } from '../services/chat.service.js';

const router = express.Router();

/**
 * GET /api/chat/channels
 * List all channels
 */
router.get('/channels', (req, res) => {
    try {
        const channels = chatService.getChannels();
        res.json({ success: true, data: channels });
    } catch (error) {
        console.error('Erro ao buscar canais:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar canais' });
    }
});

/**
 * GET /api/chat/channels/:id/messages
 * Get messages for a channel
 */
router.get('/channels/:id/messages', (req, res) => {
    try {
        const { id } = req.params;
        const messages = chatService.getMessages(id);
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Erro ao buscar mensagens do canal:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar mensagens do canal' });
    }
});

/**
 * POST /api/chat/channels/:id/messages
 * Send message to a channel
 */
router.post('/channels/:id/messages', (req, res) => {
    try {
        const { id } = req.params;
        const { fromId, text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Texto da mensagem é obrigatório'
            });
        }

        const message = chatService.sendMessage(id, fromId || 'U001', text);
        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao enviar mensagem' });
    }
});

/**
 * GET /api/chat/direct/:userId
 * Get direct messages with a user
 */
router.get('/direct/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.query.currentUserId || 'U001';
        const messages = chatService.getDirectMessages(userId, currentUserId);
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Erro ao buscar mensagens diretas:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar mensagens diretas' });
    }
});

/**
 * POST /api/chat/direct/:userId
 * Send direct message to a user
 */
router.post('/direct/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const { fromId, text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Texto da mensagem é obrigatório'
            });
        }

        const message = chatService.sendDirectMessage(userId, fromId || 'U001', text);
        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Erro ao enviar mensagem direta:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao enviar mensagem direta' });
    }
});

/**
 * GET /api/chat/users
 * Get available users/contacts
 */
router.get('/users', (req, res) => {
    try {
        const users = chatService.getUsers();
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar usuários' });
    }
});

/**
 * GET /api/chat/users/online
 * Get online users
 */
router.get('/users/online', (req, res) => {
    try {
        const online = chatService.getOnlineUsers();
        res.json({ success: true, data: online });
    } catch (error) {
        console.error('Erro ao buscar usuários online:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar usuários online' });
    }
});

/**
 * GET /api/chat/contacts
 * Get direct message contacts with last message and unread
 */
router.get('/contacts', (req, res) => {
    try {
        const currentUserId = req.query.currentUserId || 'U001';
        const contacts = chatService.getDirectMessageContacts(currentUserId);
        res.json({ success: true, data: contacts });
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar contatos' });
    }
});

/**
 * GET /api/chat/me
 * Get current user info
 */
router.get('/me', (req, res) => {
    try {
        const user = chatService.getCurrentUser();
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Erro ao buscar usuário atual:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar usuário atual' });
    }
});

export default router;
