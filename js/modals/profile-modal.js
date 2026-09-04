(function () {
    const ProfileModal = ({ dm, userForm, profilePhoto, actions }) => {
        const { onClose, onChange, onPhotoChange, onSave, onDelete } = actions;
        return (
            <div className="fixed inset-0 bg-black/85 z-50 flex items-end justify-center backdrop-blur-sm">
                <div className={`border rounded-t-[2.5rem] p-6 w-full max-w-md space-y-5 max-h-[90vh] overflow-y-auto custom-scroll shadow-2xl animate-fade-in ${dm ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Perfil de Usuario</h3>
                        <button onClick={onClose} className="text-xs px-2.5 py-1 rounded-full bg-slate-500/10 hover:bg-slate-500/20">Cerrar</button>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        {profilePhoto ? (
                            <img src={profilePhoto} className="w-20 h-20 rounded-full object-cover border-2 border-slate-400 shadow-lg" alt="Perfil" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-3xl shadow-inner">👤</div>
                        )}
                        <label className={`text-[10px] font-semibold px-4 py-1.5 rounded-full cursor-pointer transition-all border ${dm ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'}`}>
                            📷 Cambiar Foto
                            <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
                        </label>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: 'Nombre', key: 'nombre', type: 'text', placeholder: 'Tu nombre completo' },
                            { label: 'Usuario', key: 'usuario', type: 'text', placeholder: 'ej. ale_garcia' },
                            { label: 'Email', key: 'email', type: 'email', placeholder: 'correo@ejemplo.com' }
                        ].map(({ label, key, type, placeholder }) => (
                            <div key={key}>
                                <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">{label}</label>
                                <input type={type} value={userForm[key]} placeholder={placeholder}
                                    onChange={e => onChange(key, e.target.value)}
                                    className={`w-full border rounded-xl px-4 py-2.5 text-xs outline-none transition-all ${dm ? 'bg-white/5 border-white/10 text-white focus:border-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-400'}`} />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button onClick={onDelete} className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[11px] font-bold py-2.5 px-4 rounded-xl border border-rose-500/20 btn-ripple">
                            🗑️ Borrar datos
                        </button>
                        <button onClick={onSave} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-semibold py-2.5 rounded-xl shadow-md btn-ripple">
                            ✅ Guardar Perfil
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    window.ProfileModal = ProfileModal;
})();
