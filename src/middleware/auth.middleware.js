// Auth Middleware
// Em produção, verificar JWT token
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Demo mode: aceitar tokens que começam com 'demo-token-'
    if (token.startsWith('demo-token-')) {
        const parts = token.split('-');
        req.user = {
            username: parts[2],
            role: 'demo'
        };
        return next();
    }

    // Em produção, verificar JWT
    // try {
    //   const decoded = jwt.verify(token, config.jwt.secret);
    //   req.user = decoded;
    //   next();
    // } catch (error) {
    //   return res.status(401).json({ error: 'Token inválido' });
    // }

    return res.status(401).json({ error: 'Token inválido' });
}

// Role-based access control
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        if (!roles.includes(req.user.role) && !roles.includes('demo')) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        next();
    };
}

export default authMiddleware;
