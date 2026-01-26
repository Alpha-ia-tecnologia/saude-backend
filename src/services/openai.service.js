import axios from 'axios';
import { config } from '../config/index.js';

export class OpenAIService {
    constructor() {
        this.apiKey = config.ai.openai.apiKey;
        this.baseUrl = config.ai.openai.baseUrl;
        this.defaultModel = config.ai.openai.defaultModel;
    }

    isConfigured() {
        return !!this.apiKey;
    }

    async chat(messages, model = this.defaultModel) {
        if (!this.isConfigured()) {
            return this.simulateResponse(messages);
        }

        const response = await axios.post(
            `${this.baseUrl}/chat/completions`,
            {
                model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            content: response.data.choices[0].message.content,
            model: response.data.model,
            usage: response.data.usage
        };
    }

    simulateResponse(messages) {
        const lastMessage = messages[messages.length - 1]?.content || '';

        let content = `[OpenAI Demo] Esta é uma resposta simulada. Em produção, você receberá respostas reais do GPT-4.\n\nSua pergunta foi: "${lastMessage.substring(0, 100)}..."`;

        if (lastMessage.toLowerCase().includes('sintoma')) {
            content = `[OpenAI Demo] **Análise de Sintomas**\n\nBaseado nos sintomas descritos, sugiro:\n\n1. Avaliação clínica completa\n2. Exames laboratoriais básicos\n3. Retorno em 7 dias\n\n*Esta é uma resposta simulada.*`;
        }

        return {
            content,
            model: `${this.defaultModel} (demo)`,
            usage: null
        };
    }
}

export default new OpenAIService();
