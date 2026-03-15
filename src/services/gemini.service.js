import { config } from '../config/index.js';

export class GeminiService {
    constructor() {
        this.apiKey = config.ai.gemini.apiKey;
        this.baseUrl = config.ai.gemini.baseUrl;
        this.defaultModel = config.ai.gemini.defaultModel;
    }

    isConfigured() {
        return !!this.apiKey;
    }

    async chat(messages, model = this.defaultModel) {
        if (!this.isConfigured()) {
            return this.simulateResponse(messages);
        }

        // Gemini API implementation
        const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: messages.map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }]
                }))
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        return {
            content: data.candidates[0].content.parts[0].text,
            model,
            usage: null
        };
    }

    simulateResponse(messages) {
        const lastMessage = messages[messages.length - 1]?.content || '';

        return {
            content: `[Gemini Demo] Resposta simulada do Google Gemini.\n\nSua pergunta: "${lastMessage.substring(0, 100)}..."`,
            model: `${this.defaultModel} (demo)`,
            usage: null
        };
    }
}

export default new GeminiService();
