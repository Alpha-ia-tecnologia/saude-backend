import { Router } from 'express';
import adminService from '../services/admin.service.js';

const router = Router();

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
    try {
        const { roleId, status, search } = req.query;
        const users = await adminService.getUsers({ roleId, status, search });
        res.json({ success: true, data: users, total: users.length });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar usuarios', message: error.message });
    }
});

// POST /api/admin/users - Create user
router.post('/users', async (req, res) => {
    try {
        const { nome, email, cpf, roleId } = req.body;

        if (!nome || !email || !roleId) {
            return res.status(400).json({ error: 'Nome, email e perfil sao obrigatorios' });
        }

        const user = await adminService.createUser({ nome, email, cpf, roleId });
        res.status(201).json({ success: true, user });
    } catch (error) {
        if (error.message.includes('ja cadastrado')) {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: 'Erro ao criar usuario', message: error.message });
    }
});

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await adminService.updateUser(id, req.body);
        res.json({ success: true, user });
    } catch (error) {
        if (error.message.includes('nao encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Erro ao atualizar usuario', message: error.message });
    }
});

// DELETE /api/admin/users/:id - Deactivate user
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await adminService.deactivateUser(id);
        res.json({ success: true, user, message: 'Usuario desativado com sucesso' });
    } catch (error) {
        if (error.message.includes('nao encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Erro ao desativar usuario', message: error.message });
    }
});

// GET /api/admin/roles - List roles with permissions
router.get('/roles', async (req, res) => {
    try {
        const roles = await adminService.getRoles();
        res.json({ success: true, data: roles });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar perfis', message: error.message });
    }
});

// PUT /api/admin/roles/:id/permissions - Update role permissions
router.put('/roles/:id/permissions', async (req, res) => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;

        if (!permissions) {
            return res.status(400).json({ error: 'Permissoes sao obrigatorias' });
        }

        const role = await adminService.updatePermissions(id, permissions);
        res.json({ success: true, role });
    } catch (error) {
        if (error.message.includes('nao encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Erro ao atualizar permissoes', message: error.message });
    }
});

// GET /api/admin/modules - List available modules
router.get('/modules', async (req, res) => {
    try {
        const modules = await adminService.getModules();
        res.json({ success: true, data: modules });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar modulos', message: error.message });
    }
});

export default router;
