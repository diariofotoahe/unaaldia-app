// ═══════════════════════════════════════════════════════════
// ai.js — Cliente DeepSeek
// ═══════════════════════════════════════════════════════════

window.aiModule = {
    async callDeepSeek(apiKey, prompt, systemPrompt = '', onRetry) {
        if (!apiKey) throw new Error('DeepSeek API Key no configurada. Ve a Configuración.');

        const messages = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: prompt });

        let delay = 1000;
        for (let i = 0; i < 3; i++) {
            try {
                const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({ model: 'deepseek-chat', messages, max_tokens: 2048, temperature: 0.75 })
                });
                if (!res.ok) {
                    const errorText = await res.text();
                    let detail = '';
                    try {
                        const parsed = JSON.parse(errorText);
                        detail = parsed.error?.message || '';
                    } catch {}
                    throw new Error(detail ? `DeepSeek: ${res.status} - ${detail}` : `DeepSeek: ${res.status}`);
                }
                const data = await res.json();
                return data.choices?.[0]?.message?.content || 'Sin respuesta.';
            } catch (err) {
                if (i === 2) throw err;
                if (onRetry) onRetry(i + 2);
                await new Promise(r => setTimeout(r, delay));
                delay *= 2;
            }
        }
    },

    async callGoogleGemini(apiKey, prompt, systemPrompt = '', onRetry) {
        if (!apiKey) throw new Error('API Key de Google Gemini no configurada. Ve a Configuración.');

        const text = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
        let delay = 1000;
        for (let i = 0; i < 3; i++) {
            try {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text }] }],
                        generationConfig: { temperature: 0.75, maxOutputTokens: 2048 }
                    })
                });
                const bodyText = await res.text();
                if (!res.ok) {
                    let detail = '';
                    try {
                        const parsed = JSON.parse(bodyText);
                        detail = parsed.error?.message || parsed.error?.details?.[0]?.message || '';
                    } catch {}
                    throw new Error(detail ? `Google Gemini: ${res.status} - ${detail}` : `Google Gemini: ${res.status}`);
                }
                let data = {};
                try {
                    data = JSON.parse(bodyText);
                } catch {
                    throw new Error('Google Gemini devolvió una respuesta inválida.');
                }
                const reply = data.candidates?.[0]?.content?.parts?.map(part => part.text).filter(Boolean).join('') || '';
                return reply || 'Sin respuesta.';
            } catch (err) {
                if (i === 2) throw err;
                if (onRetry) onRetry(i + 2);
                await new Promise(r => setTimeout(r, delay));
                delay *= 2;
            }
        }
    },

    async callQwen(apiKey, prompt, systemPrompt = '', onRetry) {
        if (!apiKey) throw new Error('API Key de Alibaba Qwen no configurada. Ve a Configuración.');

        const messages = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: prompt });

        let delay = 1000;
        for (let i = 0; i < 3; i++) {
            try {
                const res = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({ model: 'qwen-plus', messages, max_tokens: 2048, temperature: 0.75 })
                });
                const bodyText = await res.text();
                if (!res.ok) {
                    let detail = '';
                    try {
                        const parsed = JSON.parse(bodyText);
                        detail = parsed.error?.message || parsed.message || '';
                    } catch {}
                    throw new Error(detail ? `Qwen: ${res.status} - ${detail}` : `Qwen: ${res.status}`);
                }
                const data = JSON.parse(bodyText);
                return data.choices?.[0]?.message?.content || 'Sin respuesta.';
            } catch (err) {
                if (i === 2) throw err;
                if (onRetry) onRetry(i + 2);
                await new Promise(r => setTimeout(r, delay));
                delay *= 2;
            }
        }
    },

    async callWithFallback({ googleApiKey, deepSeekApiKey, qwenApiKey, prompt, systemPrompt = '', onRetry }) {
        const errors = [];
        const providers = [
            { name: 'Gemini', key: googleApiKey, call: this.callGoogleGemini },
            { name: 'DeepSeek', key: deepSeekApiKey, call: this.callDeepSeek },
            { name: 'Qwen', key: qwenApiKey, call: this.callQwen }
        ];

        for (const provider of providers) {
            if (!provider.key) continue;
            try {
                return await provider.call.call(this, provider.key, prompt, systemPrompt, onRetry);
            } catch (err) {
                errors.push(`${provider.name}: ${err?.message || String(err)}`);
            }
        }

        if (errors.length) throw new Error(errors.join(' | '));
        throw new Error('No hay API Key configurada para ningún proveedor de IA.');
    }
};
