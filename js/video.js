const VideoView = ({ dm, movie, actions }) => {
    const { dateFrom, dateTo, script, isGenScript, isCreating, progress } = movie;
    const { setDateFrom, setDateTo, generateScript, createMovie } = actions;

    return (
        <div className="space-y-5">
            <h2 className={`text-lg font-light tracking-tight ${dm ? 'text-white' : 'text-slate-800'}`}>Generador de Cine</h2>
            <div className={`p-5 rounded-[2rem] border ${dm ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200 shadow-md'}`}>
                <p className={`text-xs mb-5 leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                    Selecciona un rango de fechas para compilar tus recuerdos y crear un guion emotivo.
                </p>
                <div className="space-y-3 mb-5">
                    {[{ label: 'Desde', val: dateFrom, set: setDateFrom }, { label: 'Hasta', val: dateTo, set: setDateTo }].map(({ label, val, set }) => (
                        <div key={label} className={`p-3 rounded-xl border ${dm ? 'bg-white/[0.05] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                            <label className="text-[9px] uppercase text-slate-400 font-bold mb-1 block">{label}</label>
                            <input
                                type="date"
                                value={val}
                                onChange={e => set(e.target.value)}
                                className={`w-full bg-transparent border-none text-sm outline-none cursor-pointer font-medium ${dm ? 'text-white' : 'text-slate-900'}`}
                            />
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    <button
                        onClick={generateScript}
                        disabled={isGenScript || isCreating}
                        className={`w-full border py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 btn-ripple ${dm ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'} disabled:opacity-50`}
                    >
                        {isGenScript ? (<><div className="typing-indicator"><span/><span/><span/></div> Escribiendo Guion...</>) : '✨ Generar Guion (IA)'}
                    </button>
                    <button
                        onClick={createMovie}
                        disabled={isCreating || isGenScript}
                        className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-md btn-ripple ${dm ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'} disabled:opacity-50`}
                    >
                        {isCreating ? (
                            <span className="flex items-center justify-center gap-2">
                                <span>🎥 Compilando...</span>
                                <span className="text-xs font-normal">{progress}%</span>
                            </span>
                        ) : '🎬 Crear Película'}
                    </button>
                    {isCreating && (
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                    )}
                </div>
            </div>
            {script && (
                <div className={`border p-5 rounded-2xl ${dm ? 'bg-white/[0.04] border-white/10' : 'bg-white border-slate-200'}`}>
                    <h4 className={`text-[10px] uppercase tracking-wider font-bold mb-3 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>📜 Guion del Narrador</h4>
                    <p className={`text-[11px] leading-relaxed font-light italic ${dm ? 'text-slate-200' : 'text-slate-600'}`}>"{script}"</p>
                </div>
            )}
        </div>
    );
};

window.VideoView = VideoView;
