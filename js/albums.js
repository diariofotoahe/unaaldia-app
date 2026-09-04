const AlbumsView = ({ dm, folders, memories, onCreateFolder }) => (
    <div className="space-y-5">
        <div className="flex justify-between items-center">
            <h2 className={`text-lg font-light tracking-tight ${dm ? 'text-white' : 'text-slate-800'}`}>Tus Álbumes</h2>
            <button
                onClick={onCreateFolder}
                className={`text-xs border px-3 py-1.5 rounded-full transition-all btn-ripple ${dm ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'}`}
            >
                + Carpeta
            </button>
        </div>
        <div className="grid grid-cols-1 gap-3">
            {folders.map(folder => {
                const count = memories.filter(m => m.folder === folder).length;
                const cover = memories.find(m => m.folder === folder && m.url);
                return (
                    <div key={folder} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all cursor-pointer ${dm ? 'bg-white/10 border-white/10 text-white hover:bg-white/15' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm'}`}>
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
                            {cover ? <img src={cover.url} className="w-full h-full object-cover" alt="" /> : <span className="text-2xl">📂</span>}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium">{folder}</h3>
                            <p className={`text-[10px] uppercase tracking-tighter mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{count} elemento{count !== 1 ? 's' : ''}</p>
                        </div>
                        <span className={`text-[10px] ${dm ? 'text-slate-500' : 'text-slate-400'}`}>›</span>
                    </div>
                );
            })}
        </div>
    </div>
);

window.AlbumsView = AlbumsView;
