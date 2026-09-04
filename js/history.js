const HistoryView = ({ dm, memories, actions }) => {
    const { onFullscreen, onEdit, onDeleteDay, onDeleteSingle } = actions;
    const { SectionPanel, ActionButton, EmptyState } = window;

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <h2 className={`text-lg font-light tracking-tight ${dm ? 'text-white' : 'text-slate-800'}`}>
                    Muro de Recuerdos
                </h2>
                <span className={`text-[10px] uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                    {memories.length} recuerdos
                </span>
            </div>

            {memories.length === 0 ? (
                <EmptyState
                    dm={dm}
                    emoji="📸"
                    title="Aún no hay recuerdos."
                    description="Ve a Inicio y captura tu primer momento."
                />
            ) : (
                <div className="space-y-5">
                    {memories.map(m => {
                        const paragraphs = (m.comment || '').split(/\n\s*\n/).filter(Boolean);
                        const textParagraphs = paragraphs.length > 0 ? paragraphs : ['Sin comentarios registrados.'];

                        return (
                            <SectionPanel key={m.id} dm={dm} className="p-4 space-y-3 shadow-lg">
                                <div className="flex justify-between items-center">
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${dm ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'}`}>{m.date}</span>
                                    <div className="flex items-center gap-2">
                                        {m.pendingSync && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/30">⏳ Pendiente</span>}
                                        {m.driveId && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30">☁️ Drive</span>}
                                        <span className={`text-[10px] ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{m.timestamp}</span>
                                    </div>
                                </div>
                                <div
                                    className="relative mx-auto aspect-video w-[92%] rounded-xl overflow-hidden border bg-black/40 cursor-pointer"
                                    style={{ borderColor: dm ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                                    onClick={() => onFullscreen(m)}
                                >
                                    <MediaPreview media={m} className="w-full h-full object-cover" alt={`Recuerdo ${m.date}`} />
                                    <div className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1"><span className="text-xs">⛶</span></div>
                                </div>
                                <div className={`space-y-2 ${dm ? 'text-slate-200' : 'text-slate-700'}`}>
                                    {textParagraphs.map((paragraph, index) => (
                                        <p key={`${m.id}-paragraph-${index}`} className="text-xs font-light leading-relaxed text-center">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full ${dm ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>📂 {m.folder}</span>
                                <div className={`flex gap-2 pt-2 border-t text-[11px] justify-between ${dm ? 'border-white/10' : 'border-slate-100'}`}>
                                    <ActionButton
                                        dm={dm}
                                        variant="ghost"
                                        onClick={() => onEdit(m)}
                                        className="px-3 py-1.5 rounded-lg"
                                    >
                                        ✏️ Editar
                                    </ActionButton>
                                    <div className="flex gap-1.5">
                                        <ActionButton
                                            dm={dm}
                                            variant="secondary"
                                            onClick={() => onDeleteDay(m.date)}
                                            className="px-3 py-1.5 rounded-lg"
                                        >
                                            📅 Todo el día
                                        </ActionButton>
                                        <ActionButton
                                            dm={dm}
                                            variant="danger"
                                            onClick={() => onDeleteSingle(m.id)}
                                            className="px-3 py-1.5 rounded-lg"
                                        >
                                            🗑️
                                        </ActionButton>
                                    </div>
                                </div>
                            </SectionPanel>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

window.HistoryView = HistoryView;
