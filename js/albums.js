const AlbumsView = ({ dm, folders, memories, onCreateFolder, onMovePhotos }) => {
    const [openFolder, setOpenFolder] = React.useState(null);
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [targetFolder, setTargetFolder] = React.useState('');

    const folderMemories = memories.filter(memory => memory.folder === openFolder);
    const toggleSelection = (id) => {
        setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    };
    const closeFolder = () => {
        setOpenFolder(null);
        setSelectedIds([]);
        setTargetFolder('');
    };
    const moveSelected = async () => {
        if (!targetFolder || selectedIds.length === 0 || targetFolder === openFolder) return;
        await onMovePhotos(selectedIds, targetFolder);
        closeFolder();
    };

    return (
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
                    const cover = memories.find(m => m.folder === folder && window.getMediaUrl(m));
                    return (
                        <button key={folder} type="button" onClick={() => { setOpenFolder(folder); setSelectedIds([]); }} className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all cursor-pointer ${dm ? 'bg-white/10 border-white/10 text-white hover:bg-white/15' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm'}`}>
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
                                {cover ? <window.MediaPreview media={cover} className="w-full h-full object-cover" alt="" /> : <span className="text-2xl">📂</span>}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium">{folder}</h3>
                                <p className={`text-[10px] uppercase tracking-tighter mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{count} elemento{count !== 1 ? 's' : ''}</p>
                            </div>
                            <span className={`text-[10px] ${dm ? 'text-slate-500' : 'text-slate-400'}`}>›</span>
                        </button>
                    );
                })}
            </div>
            {openFolder && (
                <div className={`space-y-4 border-t pt-5 ${dm ? 'border-white/10' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`text-sm font-semibold ${dm ? 'text-white' : 'text-slate-900'}`}>{openFolder}</h3>
                            <p className={`text-[10px] ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{folderMemories.length} elemento{folderMemories.length !== 1 ? 's' : ''}</p>
                        </div>
                        <button type="button" onClick={closeFolder} className="text-xs text-slate-400">Cerrar</button>
                    </div>
                    {selectedIds.length > 0 && (
                        <div className={`flex items-center gap-2 rounded-xl border p-2 ${dm ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                            <span className="text-[10px] flex-1">{selectedIds.length} seleccionada{selectedIds.length !== 1 ? 's' : ''}</span>
                            <select value={targetFolder} onChange={e => setTargetFolder(e.target.value)} className={`rounded-lg border px-2 py-1 text-[10px] ${dm ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'}`}>
                                <option value="">Mover a...</option>
                                {folders.filter(folder => folder !== openFolder).map(folder => <option key={folder} value={folder}>{folder}</option>)}
                            </select>
                            <button type="button" onClick={moveSelected} disabled={!targetFolder} className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold text-slate-950 disabled:opacity-50">Mover</button>
                        </div>
                    )}
                    {folderMemories.length === 0 ? (
                        <p className="py-8 text-center text-xs text-slate-400">Este álbum está vacío.</p>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {folderMemories.map(memory => {
                                const selected = selectedIds.includes(memory.id);
                                return (
                                    <button key={memory.id} type="button" onClick={() => toggleSelection(memory.id)} className={`relative aspect-square overflow-hidden rounded-xl border-2 ${selected ? 'border-emerald-400' : dm ? 'border-white/10' : 'border-slate-200'}`}>
                                        <window.MediaPreview media={memory} className="h-full w-full object-cover" videoProps={{ muted: true }} />
                                        {selected && <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-xs text-slate-950">✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

window.AlbumsView = AlbumsView;
