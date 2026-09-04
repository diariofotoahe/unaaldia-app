const CaptureView = ({ dm, folders, capture, actions }) => {
    const { date, folder, comment, photos, isSaving, isAiTyping } = capture;
    const { setDate, setFolder, setComment, removePhoto, uploadFiles, saveDay, aiEnhance } = actions;
    const { SectionPanel, ActionButton } = window;
    const [sourceMenuOpen, setSourceMenuOpen] = React.useState(false);
    const [cameraOpen, setCameraOpen] = React.useState(false);
    const [cameraError, setCameraError] = React.useState('');
    const fileInputRef = React.useRef(null);
    const videoRef = React.useRef(null);
    const streamRef = React.useRef(null);

    const closeCamera = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setCameraOpen(false);
    };

    React.useEffect(() => {
        if (!cameraOpen) return undefined;

        let active = true;
        const startCamera = async () => {
            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error('Este navegador no permite acceder a la cámara.');
                }
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: 'environment' } },
                    audio: false
                });
                if (!active) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
            } catch (error) {
                setCameraError(error?.message || 'No fue posible abrir la cámara.');
            }
        };

        setCameraError('');
        startCamera();
        return () => {
            active = false;
            streamRef.current?.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        };
    }, [cameraOpen]);

    const openFiles = () => {
        setSourceMenuOpen(false);
        if (cameraOpen) closeCamera();
        fileInputRef.current?.click();
    };

    const openCamera = () => {
        setSourceMenuOpen(false);
        setCameraOpen(true);
    };

    const takePhoto = () => {
        const video = videoRef.current;
        if (!video || !video.videoWidth || !video.videoHeight) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
            if (!blob) return;
            uploadFiles([new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' })]);
            closeCamera();
        }, 'image/jpeg', 0.92);
    };

    return (
        <div className="space-y-5">
            <SectionPanel dm={dm} className={`p-5 ${dm ? 'bg-white/10 shadow-md' : 'bg-white/80 shadow-md'}`}>
                <div className="flex justify-between items-center mb-5">
                    <div>
                        <label className={`text-[9px] uppercase tracking-widest font-bold block mb-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Fecha</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className={`bg-transparent text-xs border-none outline-none cursor-pointer font-semibold ${dm ? 'text-white' : 'text-slate-900'}`}
                        />
                    </div>
                    <div>
                        <label className={`text-[9px] uppercase tracking-widest font-bold block mb-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Carpeta</label>
                        <select
                            value={folder}
                            onChange={e => setFolder(e.target.value)}
                            className={`bg-transparent text-xs outline-none cursor-pointer font-medium ${dm ? 'text-white' : 'text-slate-900'}`}
                        >
                            {folders.map(f => (
                                <option key={f} value={f} className="bg-slate-900 text-white">{f}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="relative group mb-4">
                    <button
                        type="button"
                        onClick={() => setSourceMenuOpen(true)}
                        className={`w-full h-28 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${dm ? 'bg-white/[0.04] border-white/20 hover:bg-white/[0.08]' : 'bg-slate-50 border-slate-300 hover:bg-slate-100'}`}
                    >
                        <span className="text-3xl mb-1">📷</span>
                        <p className={`text-[11px] font-medium ${dm ? 'text-slate-200' : 'text-slate-700'}`}>Tomar foto / Cargar archivo</p>
                        <p className={`text-[9px] mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Cámara, dispositivo o Fotos de Google</p>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={uploadFiles}
                        className="hidden"
                    />

                    {sourceMenuOpen && (
                        <div className={`absolute inset-x-3 top-3 z-20 rounded-2xl border p-3 shadow-2xl ${dm ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider">Añadir recuerdo desde</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={openCamera} className={`rounded-xl px-3 py-3 text-xs font-medium ${dm ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}>📷 Cámara</button>
                                <button type="button" onClick={openFiles} className={`rounded-xl px-3 py-3 text-xs font-medium ${dm ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}>🖼️ Archivos o Fotos</button>
                            </div>
                            <button type="button" onClick={() => setSourceMenuOpen(false)} className="mt-2 w-full text-[10px] text-slate-400">Cancelar</button>
                        </div>
                    )}
                </div>

                {cameraOpen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4">
                        <div className={`w-full max-w-md rounded-3xl p-4 ${dm ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-semibold">Tomar foto</h3>
                                <button type="button" onClick={closeCamera} className="rounded-full px-3 py-1 text-xs bg-slate-500/20">Cerrar</button>
                            </div>
                            {cameraError ? (
                                <div className="rounded-2xl bg-rose-500/10 p-4 text-center text-xs text-rose-400">
                                    <p>{cameraError}</p>
                                    <button type="button" onClick={openFiles} className="mt-3 rounded-xl bg-slate-500/20 px-3 py-2 text-slate-200">Seleccionar archivo</button>
                                </div>
                            ) : (
                                <video ref={videoRef} className="aspect-[3/4] w-full rounded-2xl bg-black object-cover" playsInline muted />
                            )}
                            {!cameraError && <button type="button" onClick={takePhoto} className="mt-3 w-full rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950">● Tomar foto</button>}
                        </div>
                    </div>
                )}

                {photos.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mb-4">
                        {photos.map(p => (
                            <div key={p.id} className={`relative aspect-square rounded-xl overflow-hidden border ${dm ? 'border-white/20' : 'border-slate-300'}`}>
                                <MediaPreview media={p} className="w-full h-full object-cover" videoProps={{ muted: true }} />
                                <button
                                    onClick={() => removePhoto(p.id)}
                                    className="absolute top-0.5 right-0.5 bg-black/80 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center leading-none"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-3">
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="¿Qué viviste hoy? Escríbelo o deja que la IA redacte por ti..."
                        className={`w-full h-20 border rounded-xl p-3 text-xs outline-none resize-none focus:ring-1 focus:ring-slate-400 transition-all ${window.getInputClass(dm)}`}
                    />
                    <div className="flex gap-2">
                        <ActionButton
                            dm={dm}
                            variant="secondary"
                            onClick={aiEnhance}
                            disabled={isAiTyping || isSaving}
                            className="flex-1 border py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
                        >
                            {isAiTyping ? (<><div className="typing-indicator"><span/><span/><span/></div> Redactando...</>) : '✨ IA Redactar'}
                        </ActionButton>
                        <ActionButton
                            dm={dm}
                            variant="primary"
                            onClick={saveDay}
                            disabled={isSaving || photos.length === 0}
                            className="flex-1 py-2.5 rounded-xl font-semibold text-xs shadow-md"
                        >
                            {isSaving ? '⏳ Guardando...' : '💾 Guardar Día'}
                        </ActionButton>
                    </div>
                </div>
            </SectionPanel>
        </div>
    );
};

window.CaptureView = CaptureView;
