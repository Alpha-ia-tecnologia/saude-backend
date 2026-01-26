import { Router } from 'express';

const router = Router();

// Usuários de demonstração
const DEMO_USERS = {
    admin: { password: 'admin123', name: 'Administrador', role: 'admin' },
    medico: { password: 'medico123', name: 'Dr. João Silva', role: 'medico' },
    enfermeiro: { password: 'enfermeiro123', name: 'Maria Santos', role: 'enfermeiro' }
};

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const user = DEMO_USERS[username];

    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    // Em produção, usar JWT
    res.json({
        success: true,
        user: {
            username,
            name: user.name,
            role: user.role
        },
        token: `demo-token-${username}-${Date.now()}`
    });
});

// Verificar sessão
router.get('/me', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !token.startsWith('demo-token-')) {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    const username = token.split('-')[2];
    const user = DEMO_USERS[username];

    if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    res.json({
        username,
        name: user.name,
        role: user.role
    });
});

// Logout
router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logout realizado com sucesso' });
});

export default router;
