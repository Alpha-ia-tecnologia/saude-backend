import express from 'express';
import { panelService } from '../services/panel.service.js';

const router = express.Router();

router.get('/guiches', async (req, res) => {
    try {
        const guiches = await panelService.getGuiches();
        res.json({ success: true, data: guiches });
    } catch (error) {
        console.error('Erro ao buscar guiches:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar guiches' });
    }
});

router.get('/senhas', async (req, res) => {
    try {
        const { status } = req.query;
        const senhas = await panelService.getSenhas(status || null);
        res.json({ success: true, data: senhas, total: senhas.length });
    } catch (error) {
        console.error('Erro ao buscar senhas:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar senhas' });
    }
});

router.get('/senha-atual', async (req, res) => {
    try {
        const resultado = await panelService.getSenhaAtual();
        res.json(resultado);
    } catch (error) {
        console.error('Erro ao buscar senha atual:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar senha atual' });
    }
});

router.post('/senhas', async (req, res) => {
    try {
        const { paciente, cpf, tipo, prioridade } = req.body;
        if (!paciente) {
            return res.status(400).json({ success: false, error: 'Nome do paciente e obrigatorio' });
        }
        const novaSenha = await panelService.criarSenha({ paciente, cpf, tipo, prioridade });
        res.status(201).json({ success: true, data: novaSenha });
    } catch (error) {
        console.error('Erro ao criar senha:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao criar senha' });
    }
});

router.post('/chamar-proxima', async (req, res) => {
    try {
        const { guicheId } = req.body;
        if (!guicheId) {
            return res.status(400).json({ success: false, error: 'guicheId e obrigatorio' });
        }
        const resultado = await panelService.chamarProxima(guicheId);
        if (!resultado) {
            return res.json({ success: true, data: null, mensagem: 'Nenhuma senha na fila de espera' });
        }
        res.json({ success: true, data: resultado });
    } catch (error) {
        console.error('Erro ao chamar proxima senha:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao chamar proxima senha' });
    }
});

router.post('/chamar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { guicheId } = req.body;
        if (!guicheId) {
            return res.status(400).json({ success: false, error: 'guicheId e obrigatorio' });
        }
        const resultado = await panelService.chamarSenha(id, guicheId);
        res.json({ success: true, data: resultado });
    } catch (error) {
        console.error('Erro ao chamar senha:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao chamar senha' });
    }
});

router.post('/rechamar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await panelService.rechamar(id);
        res.json({ success: true, data: resultado });
    } catch (error) {
        console.error('Erro ao rechamar senha:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao rechamar senha' });
    }
});

router.post('/iniciar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const senha = await panelService.iniciarAtendimento(id);
        res.json({ success: true, data: senha });
    } catch (error) {
        console.error('Erro ao iniciar atendimento:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao iniciar atendimento' });
    }
});

router.post('/finalizar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const senha = await panelService.finalizarAtendimento(id);
        res.json({ success: true, data: senha });
    } catch (error) {
        console.error('Erro ao finalizar atendimento:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao finalizar atendimento' });
    }
});

router.post('/ausente/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const senha = await panelService.marcarAusente(id);
        res.json({ success: true, data: senha });
    } catch (error) {
        console.error('Erro ao marcar ausente:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao marcar ausente' });
    }
});

router.get('/estatisticas', async (req, res) => {
    try {
        const estatisticas = await panelService.getEstatisticas();
        res.json({ success: true, data: estatisticas });
    } catch (error) {
        console.error('Erro ao buscar estatisticas:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar estatisticas' });
    }
});

router.get('/historico', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 20;
        const historico = await panelService.getHistoricoChamadas(limit);
        res.json({ success: true, data: historico, total: historico.length });
    } catch (error) {
        console.error('Erro ao buscar historico:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar historico' });
    }
});

router.post('/resetar', async (req, res) => {
    try {
        const resultado = await panelService.resetarPainel();
        res.json({ success: true, data: resultado });
    } catch (error) {
        console.error('Erro ao resetar painel:', error);
        res.status(500).json({ success: false, error: 'Erro ao resetar painel' });
    }
});

export default router;
