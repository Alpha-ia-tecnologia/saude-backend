import express from 'express';
import { panelService } from '../services/panel.service.js';

const router = express.Router();

/**
 * GET /api/panel/guiches
 * Listar todos os guiches/salas de atendimento
 */
router.get('/guiches', (req, res) => {
    try {
        const guiches = panelService.getGuiches();
        res.json({ success: true, data: guiches });
    } catch (error) {
        console.error('Erro ao buscar guiches:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar guiches' });
    }
});

/**
 * GET /api/panel/senhas?status=aguardando
 * Listar senhas com filtro opcional por status
 */
router.get('/senhas', (req, res) => {
    try {
        const { status } = req.query;
        const senhas = panelService.getSenhas(status || null);
        res.json({
            success: true,
            data: senhas,
            total: senhas.length
        });
    } catch (error) {
        console.error('Erro ao buscar senhas:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar senhas' });
    }
});

/**
 * GET /api/panel/senha-atual
 * Obter senha sendo chamada atualmente + ultimas 5 chamadas
 */
router.get('/senha-atual', (req, res) => {
    try {
        const resultado = panelService.getSenhaAtual();
        // Return directly (not wrapped) - TV panel expects chamadaAtual at top level
        res.json(resultado);
    } catch (error) {
        console.error('Erro ao buscar senha atual:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar senha atual' });
    }
});

/**
 * POST /api/panel/senhas
 * Criar nova senha
 */
router.post('/senhas', (req, res) => {
    try {
        const { paciente, cpf, tipo, prioridade } = req.body;

        if (!paciente) {
            return res.status(400).json({
                success: false,
                error: 'Nome do paciente e obrigatorio'
            });
        }

        const novaSenha = panelService.criarSenha({ paciente, cpf, tipo, prioridade });
        res.status(201).json({ success: true, data: novaSenha });
    } catch (error) {
        console.error('Erro ao criar senha:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao criar senha' });
    }
});

/**
 * POST /api/panel/chamar-proxima
 * Chamar proxima senha na fila (preferencial primeiro)
 */
router.post('/chamar-proxima', (req, res) => {
    try {
        const { guicheId } = req.body;

        if (!guicheId) {
            return res.status(400).json({
                success: false,
                error: 'guicheId e obrigatorio'
            });
        }

        const resultado = panelService.chamarProxima(guicheId);

        if (!resultado) {
            return res.json({
                success: true,
                data: null,
                mensagem: 'Nenhuma senha na fila de espera'
            });
        }

        res.json({ success: true, data: resultado });
    } catch (error) {
        console.error('Erro ao chamar proxima senha:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao chamar proxima senha' });
    }
});

/**
 * POST /api/panel/chamar/:id
 * Chamar uma senha especifica
 */
router.post('/chamar/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { guicheId } = req.body;

        if (!guicheId) {
            return res.status(400).json({
                success: false,
                error: 'guicheId e obrigatorio'
            });
        }

        const resultado = panelService.chamarSenha(id, guicheId);
        res.json({ success: true, data: resultado });
    } catch (error) {
        console.error('Erro ao chamar senha:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao chamar senha' });
    }
});

/**
 * POST /api/panel/rechamar/:id
 * Rechamar a mesma senha
 */
router.post('/rechamar/:id', (req, res) => {
    try {
        const { id } = req.params;
        const resultado = panelService.rechamar(id);
        res.json({ success: true, data: resultado });
    } catch (error) {
        console.error('Erro ao rechamar senha:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao rechamar senha' });
    }
});

/**
 * POST /api/panel/iniciar/:id
 * Iniciar atendimento
 */
router.post('/iniciar/:id', (req, res) => {
    try {
        const { id } = req.params;
        const senha = panelService.iniciarAtendimento(id);
        res.json({ success: true, data: senha });
    } catch (error) {
        console.error('Erro ao iniciar atendimento:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao iniciar atendimento' });
    }
});

/**
 * POST /api/panel/finalizar/:id
 * Finalizar atendimento
 */
router.post('/finalizar/:id', (req, res) => {
    try {
        const { id } = req.params;
        const senha = panelService.finalizarAtendimento(id);
        res.json({ success: true, data: senha });
    } catch (error) {
        console.error('Erro ao finalizar atendimento:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao finalizar atendimento' });
    }
});

/**
 * POST /api/panel/ausente/:id
 * Marcar paciente como ausente
 */
router.post('/ausente/:id', (req, res) => {
    try {
        const { id } = req.params;
        const senha = panelService.marcarAusente(id);
        res.json({ success: true, data: senha });
    } catch (error) {
        console.error('Erro ao marcar ausente:', error);
        res.status(500).json({ success: false, error: error.message || 'Erro ao marcar ausente' });
    }
});

/**
 * GET /api/panel/estatisticas
 * Obter estatisticas do painel
 */
router.get('/estatisticas', (req, res) => {
    try {
        const estatisticas = panelService.getEstatisticas();
        res.json({ success: true, data: estatisticas });
    } catch (error) {
        console.error('Erro ao buscar estatisticas:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar estatisticas' });
    }
});

/**
 * GET /api/panel/historico?limit=20
 * Obter historico de chamadas
 */
router.get('/historico', (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 20;
        const historico = panelService.getHistoricoChamadas(limit);
        res.json({
            success: true,
            data: historico,
            total: historico.length
        });
    } catch (error) {
        console.error('Erro ao buscar historico:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar historico' });
    }
});

/**
 * POST /api/panel/resetar
 * Resetar painel (limpar todas as senhas para novo dia)
 */
router.post('/resetar', (req, res) => {
    try {
        const resultado = panelService.resetarPainel();
        res.json({ success: true, data: resultado });
    } catch (error) {
        console.error('Erro ao resetar painel:', error);
        res.status(500).json({ success: false, error: 'Erro ao resetar painel' });
    }
});

export default router;
