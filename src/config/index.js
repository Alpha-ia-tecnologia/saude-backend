import dotenv from 'dotenv';
dotenv.config();

export const config = {
    server: {
        port: process.env.PORT || 3001,
        nodeEnv: process.env.NODE_ENV || 'development',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'pec-dev-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    ai: {
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            baseUrl: 'https://api.openai.com/v1',
            defaultModel: 'gpt-4o',
            visionModel: 'gpt-4-vision-preview'
        },
        gemini: {
            apiKey: process.env.GEMINI_API_KEY,
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
            defaultModel: 'gemini-pro',
            visionModel: 'gemini-pro-vision'
        },
        deepseek: {
            apiKey: process.env.DEEPSEEK_API_KEY,
            baseUrl: 'https://api.deepseek.com/v1',
            defaultModel: 'deepseek-chat',
            visionModel: 'deepseek-vision'
        }
    }
};

export default config;
