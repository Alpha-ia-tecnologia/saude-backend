import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Configurações dos provedores
const AI_PROVIDERS = {
    openai: {
        baseUrl: 'https://api.openai.com/v1',
        defaultModel: 'gpt-4o',
        visionModel: 'gpt-4-vision-preview'
    },
    gemini: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        defaultModel: 'gemini-pro',
        visionModel: 'gemini-pro-vision'
    },
    deepseek: {
        baseUrl: 'https://api.deepseek.com/v1',
        defaultModel: 'deepseek-chat',
        visionModel: 'deepseek-vision'
    }
};

// Respostas simuladas para modo demo
const simulateResponse = (messages, provider) => {
    const lastMessage = messages[messages.length - 1]?.content || '';

    const responses = {
        default: `Esta é uma resposta simulada do ${provider}. Em ambiente de produção, você receberá respostas reais da API de IA.\n\nSua pergunta foi: "${lastMessage.substring(0, 100)}..."`,
        greeting: 'Olá! Sou o assistente de IA do PEC. Como posso ajudar você hoje?',
        clinical: `**Análise Clínica Simulada**\n\nBaseado nos sintomas descritos, recomendo:\n\n1. Avaliação completa do paciente\n2. Exames laboratoriais básicos\n3. Acompanhamento em 7 dias\n\n⚠️ *Esta é uma resposta simulada para demonstração.*`
    };

    if (lastMessage.toLowerCase().includes('olá') || lastMessage.toLowerCase().includes('oi')) {
        return responses.greeting;
    }
    if (lastMessage.toLowerCase().includes('sintoma') || lastMessage.toLowerCase().includes('paciente')) {
        return responses.clinical;
    }
    return responses.default;
};

// Rota principal de chat
router.post('/chat', async (req, res) => {
    try {
        const { provider = 'openai', messages, model } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Mensagens são obrigatórias' });
        }

        const providerConfig = AI_PROVIDERS[provider];
        if (!providerConfig) {
            return res.status(400).json({ error: `Provedor ${provider} não suportado` });
        }

        // Verificar API key
        const apiKeyEnvVar = `${provider.toUpperCase()}_API_KEY`;
        const apiKey = process.env[apiKeyEnvVar];

        // Se não tem API key, usar modo demo
        if (!apiKey) {
            const simulatedContent = simulateResponse(messages, provider);
            return res.json({
                success: true,
                mode: 'demo',
                provider,
                response: {
                    content: simulatedContent,
                    model: model || providerConfig.defaultModel
                }
            });
        }

        // Chamada real à API (OpenAI como exemplo)
        if (provider === 'openai') {
            const response = await axios.post(
                `${providerConfig.baseUrl}/chat/completions`,
                {
                    model: model || providerConfig.defaultModel,
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    max_tokens: 2000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return res.json({
                success: true,
                mode: 'production',
                provider,
                response: {
                    content: response.data.choices[0].message.content,
                    model: response.data.model
                }
            });
        }

        // Para outros provedores, retornar modo demo por enquanto
        return res.json({
            success: true,
            mode: 'demo',
            provider,
            response: {
                content: simulateResponse(messages, provider),
                model: model || providerConfig.defaultModel
            }
        });

    } catch (error) {
        console.error('Erro na API de IA:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Erro ao processar requisição de IA',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Listar provedores disponíveis
router.get('/providers', (req, res) => {
    const providers = Object.entries(AI_PROVIDERS).map(([key, value]) => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        models: [value.defaultModel, value.visionModel]
    }));

    res.json({ providers });
});

export default router;
