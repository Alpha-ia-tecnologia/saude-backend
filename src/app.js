import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS configurado para múltiplas origens
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://smarthealth.alphatechai.com.br',
    'https://projeto-saude-saude-frontend.gkgtsp.easypanel.host',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:3000'
].filter(Boolean); // Remove undefined/empty values

app.use(cors({
    origin: function (origin, callback) {
        // Permite requisições sem origin (como apps mobile ou curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`⚠️ CORS bloqueado para origin: ${origin}`);
            callback(new Error('Não permitido pela política CORS'));
        }
    },
    credentials: true
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
    console.error(err.stack);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

export default app;
