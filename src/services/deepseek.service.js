import axios from 'axios';
import { config } from '../config/index.js';

export class DeepSeekService {
    constructor() {
        this.apiKey = config.ai.deepseek.apiKey;
        this.baseUrl = config.ai.deepseek.baseUrl;
        this.defaultModel = config.ai.deepseek.defaultModel;
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

        return {
            content: `[DeepSeek Demo] Resposta simulada do DeepSeek.\n\nSua pergunta: "${lastMessage.substring(0, 100)}..."`,
            model: `${this.defaultModel} (demo)`,
            usage: null
        };
    }
}

export default new DeepSeekService();
