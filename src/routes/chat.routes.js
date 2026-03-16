import express from 'express';
import { chatService } from '../services/chat.service.js';

const router = express.Router();

router.get('/channels', async (req, res) => {
    try {
        const channels = await chatService.getChannels();
        res.json({ success: true, data: channels });
    } catch (error) {
        console.error('Erro ao buscar canais:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar canais' });
    }
});

router.get('/channels/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await chatService.getMessages(id);
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Erro ao buscar mensagens do canal:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar mensagens do canal' });
    }
});

router.post('/channels/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { fromId, text } = req.body;
        if (!text) {
            return res.status(400).json({ success: false, error: 'Texto da mensagem é obrigatório' });
        }
        const message = await chatService.sendMessage(id, fromId || 'U001', text);
        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao enviar mensagem' });
    }
});

router.get('/direct/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.query.currentUserId || 'U001';
        const messages = await chatService.getDirectMessages(userId, currentUserId);
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Erro ao buscar mensagens diretas:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar mensagens diretas' });
    }
});

router.post('/direct/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { fromId, text } = req.body;
        if (!text) {
            return res.status(400).json({ success: false, error: 'Texto da mensagem é obrigatório' });
        }
        const message = await chatService.sendDirectMessage(userId, fromId || 'U001', text);
        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Erro ao enviar mensagem direta:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao enviar mensagem direta' });
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await chatService.getUsers();
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar usuários' });
    }
});

router.get('/users/online', async (req, res) => {
    try {
        const online = await chatService.getOnlineUsers();
        res.json({ success: true, data: online });
    } catch (error) {
        console.error('Erro ao buscar usuários online:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar usuários online' });
    }
});

router.get('/contacts', async (req, res) => {
    try {
        const currentUserId = req.query.currentUserId || 'U001';
        const contacts = await chatService.getDirectMessageContacts(currentUserId);
        res.json({ success: true, data: contacts });
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar contatos' });
    }
});

router.get('/me', async (req, res) => {
    try {
        const user = await chatService.getCurrentUser();
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Erro ao buscar usuário atual:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar usuário atual' });
    }
});

export default router;
