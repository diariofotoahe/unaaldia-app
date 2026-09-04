const BiographerView = ({ dm, hasApiKey, chat, actions }) => {
    const { messages, userInput, isTyping } = chat;
    const { setUserInput, sendMessage, chatEndRef } = actions;

    return (
        <div className="flex flex-col h-[480px]">
            <div className={`mb-3 text-xs px-3 py-2 rounded-xl ${dm ? 'bg-white/5 text-slate-400 border border-white/10' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                {hasApiKey ? '🤖 Gemini / DeepSeek / Qwen conectado' : '⚠️ Configura una API Key de IA en ⚙️'}
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scroll pr-1 pb-2">
                {messages.map((msg, i) => (
                    <div key={i} className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.role === 'user'
                            ? `ml-auto rounded-tr-none ${dm ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`
                            : `rounded-tl-none ${dm ? 'bg-white/10 text-slate-200 border border-white/10' : 'bg-white text-slate-700 border border-slate-200'}`
                    }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                ))}
                {isTyping && (
                    <div className={`border rounded-2xl rounded-tl-none p-3.5 max-w-[80%] flex items-center gap-2 ${dm ? 'bg-white/10 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                        <span className="text-[10px]">Analizando</span>
                        <div className="typing-indicator"><span/><span/><span/></div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className={`flex gap-2 pt-3 border-t ${dm ? 'border-white/10' : 'border-slate-100'}`}>
                <input
                    type="text"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Pregúntame sobre tus recuerdos..."
                    className={`flex-1 border rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-slate-400 ${dm ? 'bg-white/10 border-white/10 text-white placeholder-slate-300' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'}`}
                />
                <button
                    onClick={sendMessage}
                    disabled={isTyping || !userInput.trim()}
                    className={`rounded-xl px-4 flex items-center justify-center transition-all disabled:opacity-40 btn-ripple ${dm ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                    ➔
                </button>
            </div>
        </div>
    );
};

window.BiographerView = BiographerView;
