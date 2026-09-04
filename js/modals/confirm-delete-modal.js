(function () {
    const ConfirmDeleteModal = ({ dm, confirmObj, onCancel, onConfirm }) => (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-end justify-center backdrop-blur-sm">
            <div className={`border rounded-t-[2.5rem] p-6 w-full max-w-md space-y-4 text-center shadow-2xl animate-fade-in ${dm ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                <div className="text-4xl">⚠️</div>
                <h3 className="text-sm font-bold uppercase tracking-widest">¿Estás seguro?</h3>
                <p className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                    {confirmObj.type === 'day'
                        ? `Se eliminarán permanentemente todos los recuerdos del ${window.fmtDate(confirmObj.payload)}.`
                        : 'Esta acción eliminará el recuerdo de forma definitiva e irreversible.'}
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel}
                        className={`flex-1 border text-sm py-3 rounded-2xl ${dm ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-300 text-slate-800'}`}>
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className="flex-1 bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold py-3 rounded-2xl btn-ripple">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        </div>
    );

    window.ConfirmDeleteModal = ConfirmDeleteModal;
})();
