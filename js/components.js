        const SectionPanel = ({ dm, children, className = '', ...props }) => (
            <div className={`border rounded-[1.5rem] backdrop-blur-sm ${window.getPanelClasses(dm, className)}`} {...props}>
                {children}
            </div>
        );

        const ActionButton = ({ dm, variant = 'primary', className = '', children, ...props }) => (
            <button
                className={`transition-all btn-ripple disabled:opacity-50 ${window.getButtonClass(dm, variant, className)}`}
                {...props}
            >
                {children}
            </button>
        );

        const EmptyState = ({ dm, emoji, title, description }) => (
            <div className="text-center py-20 flex flex-col items-center gap-3">
                <span className="text-5xl">{emoji}</span>
                <p className={`text-sm ${window.getMutedTextClass(dm)}`}>{title}</p>
                {description && <p className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{description}</p>}
            </div>
        );

        const AppTabs = ({ tabs, activeView, dm, onChange }) => (
            <nav className={`app-tabs absolute bottom-0 left-0 right-0 safe-bottom backdrop-blur-2xl border-t flex justify-around items-center px-4 py-2 z-40 ${dm ? 'bg-black/70 border-white/10' : 'bg-white/90 border-slate-200'}`}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => onChange(tab.id)}
                        className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all btn-ripple ${activeView === tab.id ? (dm ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-900') : (dm ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')}`}>
                        <span className="text-xl leading-none">{tab.icon}</span>
                        <span className={`text-[8px] font-medium leading-none ${activeView === tab.id ? '' : 'opacity-60'}`}>{tab.label}</span>
                    </button>
                ))}
            </nav>
        );

        // ─── Componente Toast ──────────────────────────────────────
        const TOAST_ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️', loading: '⏳' };
        const TOAST_COLORS = {
            success: 'border-emerald-500/40 bg-emerald-950/90',
            error:   'border-rose-500/40 bg-rose-950/90',
            info:    'border-sky-500/40 bg-sky-950/90',
            warning: 'border-amber-500/40 bg-amber-950/90',
            loading: 'border-slate-500/40 bg-slate-900/95'
        };

        const ToastContainer = ({ toasts }) => (
            <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={`rounded-2xl border p-3 shadow-2xl backdrop-blur-xl flex items-start gap-3 pointer-events-auto animate-fade-in-down ${TOAST_COLORS[t.type] || TOAST_COLORS.info}`}>
                        <span className="text-lg leading-none mt-0.5">{TOAST_ICONS[t.type]}</span>
                        <p className="text-xs text-white flex-1 leading-relaxed">{t.message}</p>
                        <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full overflow-hidden">
                            <div className="h-full bg-white/30 toast-progress rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );

        // ─── Splash Screen ─────────────────────────────────────────
        const SplashScreen = () => (
            <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center z-[200]">
                <div className="splash-pulse flex flex-col items-center gap-6">
                    <img src="./static/icon-192.png" className="w-24 h-24 rounded-3xl shadow-2xl" alt="UnaAlDia" />
                    <div>
                        <h1 className="text-2xl font-semibold text-white text-center">UnaAlDia</h1>
                        <p className="text-xs text-slate-400 text-center mt-1">Legado Digital</p>
                    </div>
                </div>
                <div className="absolute bottom-16 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" style={{animationDelay:'0ms'}} />
                    <div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" style={{animationDelay:'200ms'}} />
                    <div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" style={{animationDelay:'400ms'}} />
                </div>
            </div>
        );

        // ─── Componente Marquee ────────────────────────────────────
        const WelcomeBanner = ({ dm }) => {
            const text = "Bienvenido a tu día a día · coloca aquí tus vivencias de hoy que serán tus recuerdos de mañana ·";
            return (
                <div className={`border rounded-2xl py-3 mb-3 marquee-container ${dm ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white/70'}`}>
                    <div className={`marquee-content text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span>{text}</span>
                        <span aria-hidden="true">{text}</span>
                    </div>
                </div>
            );
        };

        const MediaPreview = ({ media, className = '', alt = '', videoProps = {}, imgProps = {} }) => {
            const url = window.getMediaUrl(media);
            const mime = media?.mimeType;
            if (window.isVideo(url, mime)) {
                return <video src={url} className={className} {...videoProps} />;
            }
            return <img src={url} className={className} alt={alt} {...imgProps} />;
        };

        // ─── Modales ───────────────────────────────────────────────

        const FullscreenModal = ({ media, onClose, onPrevious, onNext, hasPrevious, hasNext }) => {
            const touchStartX = React.useRef(null);

            const handleTouchEnd = (event) => {
                if (touchStartX.current === null) return;
                const distance = event.changedTouches[0].clientX - touchStartX.current;
                touchStartX.current = null;
                if (Math.abs(distance) < 50) return;
                if (distance > 0 && hasPrevious) onPrevious();
                if (distance < 0 && hasNext) onNext();
            };

            return (
                <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
                    <div className="relative max-w-full max-h-full flex items-center" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={onPrevious}
                            disabled={!hasPrevious}
                            aria-label="Foto anterior"
                            className="absolute left-2 z-10 rounded-full bg-black/60 px-3 py-2 text-2xl text-white disabled:opacity-25"
                        >‹</button>
                        <div
                            onTouchStart={event => { touchStartX.current = event.touches[0].clientX; }}
                            onTouchEnd={handleTouchEnd}
                            className="flex max-h-[90vh] max-w-[95vw] flex-col items-center"
                        >
                            <MediaPreview
                                media={media}
                                className="max-w-[95vw] max-h-[72vh] object-contain rounded-2xl"
                                alt="Pantalla completa"
                                videoProps={{ controls: true, autoPlay: true }}
                            />
                            <p className="mt-3 max-h-28 w-full overflow-y-auto px-2 text-center text-xs font-light leading-relaxed text-white whitespace-pre-line custom-scroll">
                                <span className="font-medium">{media.date}</span> - {media.comment || 'Sin comentarios registrados.'}
                            </p>
                        </div>
                        <button
                            onClick={onNext}
                            disabled={!hasNext}
                            aria-label="Foto siguiente"
                            className="absolute right-2 z-10 rounded-full bg-black/60 px-3 py-2 text-2xl text-white disabled:opacity-25"
                        >›</button>
                        <button onClick={onClose} className="absolute -top-8 right-0 text-white text-3xl font-bold" aria-label="Cerrar visor">&times;</button>
                    </div>
                </div>
            );
        };

        const MoviePlayerModal = ({ dm, movieUrl, onClose }) => (
            <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                <div className={`border rounded-[2rem] p-5 w-full max-w-lg space-y-4 shadow-2xl ${dm ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold uppercase tracking-wider">🎬 Tu Película</h3>
                        <button onClick={onClose}
                            className={`text-xs px-2.5 py-1 rounded-full ${dm ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}>
                            ✕ Cerrar
                        </button>
                    </div>
                    <video src={movieUrl} className="w-full aspect-video object-contain rounded-xl bg-black" controls autoPlay playsInline />
                    <div className="flex gap-2">
                        <button onClick={() => { const a = document.createElement('a'); a.href = movieUrl; a.download = 'mi_pelicula_unaaldia.webm'; a.click(); }}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold py-2.5 rounded-xl transition-all btn-ripple">
                            ⬇️ Descargar
                        </button>
                        <button onClick={onClose}
                            className={`flex-1 border text-xs font-semibold py-2.5 rounded-xl transition-all ${dm ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-300 text-slate-800'}`}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );

        const ConfigModal = ({ configForm, actions }) => {
            const { onClose, onChange, onToggleDark, onSave } = actions;
            const dm = configForm.modo_oscuro;
            const inputCls = `w-full border rounded-xl px-3 py-2 text-[10px] outline-none ${dm ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`;
            return (
                <div className="fixed inset-0 bg-black/85 z-50 flex items-end justify-center backdrop-blur-sm">
                    <div className={`border rounded-t-[2.5rem] p-6 w-full max-w-md space-y-5 max-h-[90vh] overflow-y-auto custom-scroll shadow-2xl animate-fade-in ${dm ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold uppercase tracking-wider">⚙️ Configuración</h3>
                            <button onClick={onClose} className="text-xs px-2.5 py-1 rounded-full bg-slate-500/10 hover:bg-slate-500/20">Cerrar</button>
                        </div>
                        <div className="space-y-5">
                            <div className={`flex items-center justify-between py-3 border-b ${dm ? 'border-white/10' : 'border-slate-100'}`}>
                                <div>
                                    <span className="text-xs font-medium">🌙 Modo Oscuro</span>
                                    <p className="text-[9px] text-slate-400 mt-0.5">Alternar tema visual</p>
                                </div>
                                <button onClick={onToggleDark}
                                    className={`w-11 h-6 rounded-full transition-all relative ${dm ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow ${dm ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                            <div>
                                <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3">☁️ Google Drive (opcional)</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[9px] uppercase text-slate-400 font-bold mb-1 block">Client ID de Google</label>
                                        <input type="text" value={configForm.gdrive_client_id}
                                            onChange={e => onChange('gdrive_client_id', e.target.value)}
                                            placeholder="xxx.apps.googleusercontent.com" className={inputCls} />
                                        <p className="text-[8px] text-slate-400 mt-1 leading-relaxed">Crea un cliente OAuth de tipo <strong>Aplicación web</strong> y registra el origen exacto de esta app. Para Laragon usa <code>http://localhost</code> (o <code>http://localhost:puerto</code>); los dominios HTTP como <code>*.test</code> requieren HTTPS.</p>
                                    </div>
                                    <div>
                                        <label className="text-[9px] uppercase text-slate-400 font-bold mb-1 block">Carpeta de Drive</label>
                                        <input type="text" value={configForm.gdrive_folder}
                                            onChange={e => onChange('gdrive_folder', e.target.value)}
                                            placeholder="Nombre o ID de carpeta (vacío = UnaAlDia)" className={inputCls} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3">🤖 IA para Biógrafo (opcional)</h4>
                                <label className="text-[9px] uppercase text-slate-400 font-bold mb-1 block">API Key de Google Gemini</label>
                                <input type="password" value={configForm.google_api_key}
                                    onChange={e => onChange('google_api_key', e.target.value)}
                                    placeholder="AIza..." className={`${inputCls} text-xs`} />
                                <p className="text-[8px] text-slate-400 mt-1">Se usa para el Biógrafo y la redacción automática. Si falla, la app intentará usar DeepSeek y después Qwen.</p>
                                <label className="text-[9px] uppercase text-slate-400 font-bold mb-1 block mt-3">API Key de DeepSeek (fallback)</label>
                                <input type="password" value={configForm.deepseek_key}
                                    onChange={e => onChange('deepseek_key', e.target.value)}
                                    placeholder="sk-..." className={`${inputCls} text-xs`} />
                                <label className="text-[9px] uppercase text-slate-400 font-bold mb-1 block mt-3">API Key de Alibaba Qwen (fallback)</label>
                                <input type="password" value={configForm.qwen_api_key}
                                    onChange={e => onChange('qwen_api_key', e.target.value)}
                                    placeholder="sk-..." className={`${inputCls} text-xs`} />
                                <p className="text-[8px] text-slate-400 mt-1">Usa una clave creada para el protocolo OpenAI-compatible de Alibaba Model Studio.</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">📊 Link Externo</h4>
                                <input type="url" value={configForm.calc_link}
                                    onChange={e => onChange('calc_link', e.target.value)}
                                    placeholder="https://docs.google.com/spreadsheets/..." className={inputCls} />
                                {configForm.calc_link && (
                                    <button onClick={() => window.open(configForm.calc_link, '_blank')}
                                        className="mt-2 text-[10px] bg-sky-500 text-white px-3 py-1.5 rounded-xl">
                                        Abrir enlace
                                    </button>
                                )}
                            </div>
                        </div>
                        <button onClick={onSave} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold py-3.5 rounded-2xl transition-all shadow-lg btn-ripple">
                            ✅ Guardar Configuración
                        </button>
                    </div>
                </div>
            );
        };

        window.SectionPanel = SectionPanel;
        window.ActionButton = ActionButton;
        window.EmptyState = EmptyState;
        window.AppTabs = AppTabs;
        window.ToastContainer = ToastContainer;
        window.SplashScreen = SplashScreen;
        window.WelcomeBanner = WelcomeBanner;
        window.MediaPreview = MediaPreview;
        window.FullscreenModal = FullscreenModal;
        window.MoviePlayerModal = MoviePlayerModal;
        window.ConfigModal = ConfigModal;
      
