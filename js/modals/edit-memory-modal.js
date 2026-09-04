(function () {
    const EditMemoryModal = ({ dm, memory, folders, actions }) => {
        const { onClose, onUpdate, onReplaceFile, onSave } = actions;
        return (
            <div className="fixed inset-0 bg-black/85 z-50 flex items-end justify-center backdrop-blur-sm">
                <div className={`border rounded-t-[2.5rem] p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto custom-scroll shadow-2xl animate-fade-in ${dm ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold uppercase tracking-widest">Editar Recuerdo</h3>
                        <button onClick={onClose} className="text-xs px-2.5 py-1 rounded-full bg-slate-500/10 hover:bg-slate-500/20">Cerrar</button>
                    </div>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black cursor-pointer group">
                        <window.MediaPreview media={memory} className="w-full h-full object-contain" videoProps={{ muted: true, autoPlay: true, loop: true }} />
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-full text-[10px] font-semibold">Reemplazar</span>
                            <input type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={onReplaceFile} />
                        </label>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[9px] uppercase text-slate-400 font-bold mb-1 block">Fecha</label>
                            <input type="date" value={memory.date} onChange={e => onUpdate({ date: e.target.value })}
                                className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${dm ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
                        </div>
                        <div>
                            <label className="text-[9px] uppercase text-slate-400 font-bold mb-1 block">Carpeta</label>
                            <select value={memory.folder} onChange={e => onUpdate({ folder: e.target.value })}
                                className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${dm ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                                {folders.map(f => <option key={f} value={f} className="bg-slate-900 text-white">{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] uppercase text-slate-400 font-bold mb-1 block">Comentario</label>
                            <textarea value={memory.comment} onChange={e => onUpdate({ comment: e.target.value })}
                                className={`w-full h-24 border rounded-xl p-3 text-xs resize-none outline-none focus:ring-1 focus:ring-slate-500 ${dm ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose}
                            className={`flex-1 border text-xs font-semibold py-2.5 rounded-xl transition-all ${dm ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-300 text-slate-800'}`}>
                            Cancelar
                        </button>
                        <button onClick={onSave} className="flex-1 bg-emerald-500 text-slate-950 text-xs font-semibold py-2.5 rounded-xl hover:bg-emerald-400 transition-all btn-ripple">
                            ✅ Guardar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    window.EditMemoryModal = EditMemoryModal;
})();
