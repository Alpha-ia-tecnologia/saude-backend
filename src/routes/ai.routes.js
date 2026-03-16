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

const SYSTEM_PROMPT = `Você é o Assistente de IA do PEC (Prontuário Eletrônico do Cidadão), um sistema de saúde pública do Brasil integrado ao SUS.

Seu papel é auxiliar profissionais de saúde (médicos, enfermeiros, farmacêuticos, ACS) com:

1. **Apoio à Decisão Clínica**: Análise de sintomas, diagnósticos diferenciais baseados em evidências, escores clínicos (Manchester, NEWS, SOFA).
2. **Farmacologia**: Interações medicamentosas, posologia, medicamentos da RENAME/REMUME, contraindicações, ajuste renal/hepático.
3. **Protocolos do SUS**: Linhas de cuidado, protocolos do Ministério da Saúde, fluxos de encaminhamento, PCDT (Protocolos Clínicos e Diretrizes Terapêuticas).
4. **Exames**: Interpretação de resultados laboratoriais, indicação de exames conforme protocolo, valores de referência.
5. **Epidemiologia**: Doenças de notificação compulsória, vigilância epidemiológica, sazonalidade de doenças.
6. **Atenção Primária**: Estratégia Saúde da Família, territorialização, visitas domiciliares, grupos prioritários (gestantes, idosos, crianças, crônicos).

Diretrizes:
- Responda sempre em português brasileiro
- Use terminologia médica adequada mas acessível
- Cite protocolos e referências quando aplicável (ex: "Conforme protocolo do MS para HAS...")
- Inclua alertas de segurança quando relevante (alergias, interações, contraindicações)
- Sempre inclua o aviso: decisão final é do profissional de saúde
- Formate respostas com markdown para melhor legibilidade
- Seja objetivo e estruturado nas respostas`;

// Respostas simuladas para modo demo
const simulateResponse = (messages, provider) => {
    const lastMessage = messages[messages.length - 1]?.content || '';

    const responses = {
        default: `Esta é uma resposta simulada do ${provider}. Em ambiente de produção, você receberá respostas reais da API de IA.\n\nSua pergunta foi: "${lastMessage.substring(0, 100)}..."`,
        greeting: `Olá! Sou o assistente de IA do **PEC (Prontuário Eletrônico do Cidadão)**, sistema de saúde pública do Brasil.

**Minhas habilidades incluem:**
- Apoio à decisão clínica baseada em evidências
- Análise de sintomas e sugestão de diagnósticos diferenciais
- Recomendação de exames laboratoriais e de imagem
- Identificação de alertas de segurança e interações medicamentosas
- Orientações sobre protocolos do Ministério da Saúde e SUS
- Sugestão de medicamentos da RENAME

Como posso ajudar você hoje?`,
        clinical: `**Análise Clínica - PEC**

Baseado nos sintomas descritos, recomendo:

1. Avaliação clínica completa do paciente
2. Verificação de sinais vitais e exame físico
3. Exames laboratoriais conforme protocolo
4. Acompanhamento conforme orientação do profissional

⚠️ *Lembre-se: estas são sugestões de apoio à decisão clínica. A decisão final é sempre do profissional de saúde.*`
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
        const { provider = 'deepseek', messages, model } = req.body;

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

            // Prepara mensagens com system prompt
        const chatMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content }))
        ];

        // Chamada real à API OpenAI
        if (provider === 'openai') {
            const response = await axios.post(
                `${providerConfig.baseUrl}/chat/completions`,
                {
                    model: model || providerConfig.defaultModel,
                    messages: chatMessages,
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

        // Chamada real à API DeepSeek (compatível com OpenAI API)
        if (provider === 'deepseek') {
            const response = await axios.post(
                `${providerConfig.baseUrl}/chat/completions`,
                {
                    model: model || providerConfig.defaultModel,
                    messages: chatMessages,
                    max_tokens: 4000,
                    temperature: 0.7
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
                    model: response.data.model,
                    usage: response.data.usage
                }
            });
        }

        // Chamada real à API Gemini
        if (provider === 'gemini') {
            const geminiMessages = [
                { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
                { role: 'model', parts: [{ text: 'Entendido. Estou pronto para auxiliar como assistente médico do PEC.' }] },
                ...messages.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }))
            ];

            const response = await axios.post(
                `${providerConfig.baseUrl}/models/${model || providerConfig.defaultModel}:generateContent?key=${apiKey}`,
                {
                    contents: geminiMessages,
                    generationConfig: {
                        maxOutputTokens: 4000
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta';

            return res.json({
                success: true,
                mode: 'production',
                provider,
                response: {
                    content,
                    model: model || providerConfig.defaultModel
                }
            });
        }

        // Fallback para modo demo
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
        console.error('Erro na API de IA:', error.response?.status, error.response?.data || error.message);
        
        // Se for erro de autenticação (401/403), retornar modo demo ao invés de 500
        if (error.response?.status === 401 || error.response?.status === 403) {
            const { provider = 'deepseek', messages, model } = req.body;
            const providerConfig = AI_PROVIDERS[provider] || AI_PROVIDERS.deepseek;
            const simulatedContent = simulateResponse(messages || [], provider);
            return res.json({
                success: true,
                mode: 'demo',
                provider,
                response: {
                    content: simulatedContent,
                    model: model || providerConfig.defaultModel
                },
                notice: 'API key inválida ou expirada. Usando modo demonstração.'
            });
        }
        
        res.status(500).json({
            error: 'Erro ao processar requisição de IA',
            details: error.message,
            stack: error.stack?.split('\n').slice(0, 3)
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
