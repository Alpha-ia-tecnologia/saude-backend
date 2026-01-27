import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';
import clinicalDecisionRoutes from './routes/clinical-decision.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS configurado para múltiplas origens
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://smarthealth.alphatechai.com.br',
    'https://projeto-saude-saude-frontend.gkgtsp.easypanel.host',
    'http://localhost:5173',
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
