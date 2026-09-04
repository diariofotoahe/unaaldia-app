const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('ai module exposes Google Gemini request helper', async () => {
  const source = fs.readFileSync('./js/ai.js', 'utf8');
  const context = {
    window: {},
    fetch: async () => ({ ok: true, text: async () => JSON.stringify({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] }), json: async () => ({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] }) })
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source, context);

  assert.equal(typeof context.window.aiModule.callGoogleGemini, 'function');
});

test('ai module uses the current Gemini Flash model', async () => {
  const source = fs.readFileSync('./js/ai.js', 'utf8');
  let requestUrl = '';
  const context = {
    window: {},
    fetch: async (url) => {
      requestUrl = url;
      return {
        ok: true,
        text: async () => JSON.stringify({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] })
      };
    }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source, context);

  await context.window.aiModule.callGoogleGemini('test-key', 'Hola');

  assert.match(requestUrl, /models\/gemini-3\.6-flash:generateContent/);
});

test('ai module calls Qwen through Alibaba OpenAI-compatible endpoint', async () => {
  const source = fs.readFileSync('./js/ai.js', 'utf8');
  let requestUrl = '';
  const context = {
    window: {},
    fetch: async (url) => {
      requestUrl = url;
      return {
        ok: true,
        text: async () => JSON.stringify({ choices: [{ message: { content: 'respuesta de qwen' } }] })
      };
    }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source, context);

  const response = await context.window.aiModule.callQwen('test-key', 'Hola');

  assert.equal(response, 'respuesta de qwen');
  assert.equal(requestUrl, 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions');
});

test('ai module surfaces Google error details', async () => {
  const source = fs.readFileSync('./js/ai.js', 'utf8');
  const context = {
    window: {},
    fetch: async () => ({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ error: { message: 'API key not valid. Please pass a valid API key.' } })
    }),
    setTimeout
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source, context);

  await assert.rejects(
    () => context.window.aiModule.callGoogleGemini('bad-key', 'Hola'),
    /API key not valid/
  );
});

test('ai module falls back from Gemini to DeepSeek when Google key fails', async () => {
  const source = fs.readFileSync('./js/ai.js', 'utf8');
  let calls = [];
  const context = {
    window: {},
    fetch: async (url) => {
      calls.push(url);
      if (url.includes('generativelanguage')) {
        return {
          ok: false,
          status: 400,
          text: async () => JSON.stringify({ error: { message: 'API key not valid. Please pass a valid API key.' } })
        };
      }
      if (url.includes('deepseek')) {
        return {
          ok: true,
          json: async () => ({ choices: [{ message: { content: 'respuesta desde deepseek' } }] })
        };
      }
      return { ok: true, text: async () => '', json: async () => ({}) };
    },
    setTimeout
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source, context);

  const result = await context.window.aiModule.callWithFallback({
    googleApiKey: 'bad-key',
    deepSeekApiKey: 'sk-good',
    prompt: 'Hola',
    systemPrompt: 'Eres un asistente'
  });

  assert.equal(result, 'respuesta desde deepseek');
  assert.ok(calls.some(url => url.includes('generativelanguage')));
  assert.ok(calls.some(url => url.includes('deepseek')));
});
