import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';
import clinicalDecisionRoutes from './routes/clinical-decision.routes.js';
import triageRoutes from './routes/triage.routes.js';
import nursingRoutes from './routes/nursing.routes.js';
import reconciliationRoutes from './routes/reconciliation.routes.js';
import pharmacyRoutes from './routes/pharmacy.routes.js';
import npsRoutes from './routes/nps.routes.js';
import adminRoutes from './routes/admin.routes.js';
import chatRoutes from './routes/chat.routes.js';
import acsRoutes from './routes/acs.routes.js';
import panelRoutes from './routes/panel.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS aberto para todas as origens
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/clinical-decision', clinicalDecisionRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/nursing', nursingRoutes);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/nps', npsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/acs', acsRoutes);
app.use('/api/panel', panelRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', req.method, req.url, err.message, err.stack);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: err.message,
        path: req.url,
        stack: err.stack?.split('\n').slice(0, 5)
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

// Graceful shutdown - desconectar Prisma
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

export default app;
