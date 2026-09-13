const { useState, useEffect, useRef, useCallback } = React;

const Capture = window.CaptureView;
const History = window.HistoryView;
const Albums = window.AlbumsView;
const Biographer = window.BiographerView;
const Video = window.VideoView;

const {
    SplashScreen, ToastContainer, WelcomeBanner, AppTabs,
    FullscreenModal, EditMemoryModal, MoviePlayerModal,
    ConfirmDeleteModal, ProfileModal, ConfigModal
} = window;

const App = () => {
    const [isLoading,  setIsLoading]  = useState(true);
    const [view,       setView]        = useState('capture');
    const [memories,   setMemories]    = useState([]);
    const [folders,    setFolders]     = useState(['General', 'Viajes', 'Personal', 'Familia']);
    const [toasts,     setToasts]      = useState([]);
    const [isOnline,   setIsOnline]    = useState(() => navigator.onLine);
    const [driveCon,   setDriveCon]    = useState(() => window.driveModule.isConnected);
    const [pendingCnt, setPendingCnt]  = useState(0);
    const [isSyncing,  setIsSyncing]   = useState(false);
    const [syncProg,   setSyncProg]    = useState({ done: 0, total: 0 });
    const [installEvt, setInstallEvt]  = useState(null);
    const [swUpdate,   setSwUpdate]    = useState(false);

    const [currentDate,    setCurrentDate]    = useState(new Date().toISOString().split('T')[0]);
    const [currentComment, setCurrentComment] = useState('');
    const [currentFolder,  setCurrentFolder]  = useState('Familia');
    const [newPhotos,      setNewPhotos]       = useState([]);
    const [isSaving,       setIsSaving]        = useState(false);
    const [isAiTyping,     setIsAiTyping]      = useState(false);

    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', text: '¡Hola! Soy tu Biógrafo IA. Puedo recordar momentos pasados y analizar tus recuerdos. ¿De qué te gustaría hablar hoy?' }
    ]);
    const [userInput, setUserInput]  = useState('');
    const chatEndRef = useRef(null);

    const [dateFrom, setDateFrom] = useState('');
    const [dateTo,   setDateTo]   = useState('');
    const [movieScript, setMovieScript] = useState('');
    const [movieMusicFile, setMovieMusicFile] = useState(null);
    const [isGenScript, setIsGenScript] = useState(false);
    const [movieUrl,    setMovieUrl]    = useState(null);
    const [isCreatingMovie, setIsCreatingMovie] = useState(false);
    const [movieProgress,   setMovieProgress]   = useState(0);
    const [showMovieModal,  setShowMovieModal]  = useState(false);

    const [editingMemory,    setEditingMemory]    = useState(null);
    const [confirmDeleteObj, setConfirmDeleteObj] = useState(null);
    const [fullscreenMedia,  setFullscreenMedia]  = useState(null);
    const [menuOpen,         setMenuOpen]         = useState(false);
    const [viewUserOpen,     setViewUserOpen]     = useState(false);
    const [viewConfigOpen,   setViewConfigOpen]   = useState(false);

    const [settings, setSettings] = useState(() => window.settingsModule.createDefaultSettings());
    const [userForm,   setUserForm]   = useState(() => window.settingsModule.createUserForm());
    const [configForm, setConfigForm] = useState(() => window.settingsModule.createConfigForm());

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }, []);

    useEffect(() => {
        window.driveModule.onStatusChange = (c) => setDriveCon(c);
        window.__onOnlineChange = (o) => {
            setIsOnline(o);
            if (o) showToast('🟢 Conexión restaurada', 'success', 3000);
            else   showToast('🔴 Sin conexión — modo offline activo', 'warning', 5000);
        };
        window.__driveOnSyncStart = (total) => {
            setIsSyncing(true);
            setSyncProg({ done: 0, total });
            showToast(`⏳ Sincronizando ${total} archivo(s) con Drive...`, 'loading', 8000);
        };
        window.__driveOnSyncProgress = (done, total) => setSyncProg({ done, total });
        window.__driveOnSyncComplete = (done, total) => {
            setIsSyncing(false);
            setSyncProg({ done: 0, total: 0 });
            refreshPendingCount();
            reloadMemories();
            if (done > 0) showToast(`✅ ${done} archivo(s) sincronizados con Drive`, 'success');
        };
        window.__driveOnSyncError = (fileName, error) => {
            showToast(`❌ Error sincronizando ${fileName}: ${error}`, 'error');
        };
        window.__onSwUpdate = () => setSwUpdate(true);

        return () => {
            window.driveModule.onStatusChange = null;
            window.__onOnlineChange = null;
            window.__driveOnSyncStart = null;
            window.__driveOnSyncProgress = null;
            window.__driveOnSyncComplete = null;
            window.__driveOnSyncError = null;
        };
    }, []);

    useEffect(() => {
        const handler = (e) => { e.preventDefault(); setInstallEvt(e); };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!installEvt) return;
        installEvt.prompt();
        const { outcome } = await installEvt.userChoice;
        if (outcome === 'accepted') { showToast('✅ App instalada correctamente', 'success'); setInstallEvt(null); }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const savedSettings = await idbGetConfig('app_settings');
                if (savedSettings) {
                    const normalized = window.settingsModule.normalizeSettings(savedSettings);
                    setSettings(normalized);
                    setUserForm({ nombre: normalized.user.nombre || '', usuario: normalized.user.usuario || '', email: normalized.user.email || '', foto_file: null, foto_preview: '' });
                    setConfigForm(prev => ({
                        ...prev,
                        modo_oscuro: normalized.config.modo_oscuro,
                        gdrive_folder: normalized.config.gdrive_folder || '',
                        gdrive_client_id: normalized.config.gdrive_client_id || '',
                        deepseek_key: normalized.config.deepseek_key || '',
                        google_api_key: normalized.config.google_api_key || '',
                        qwen_api_key: normalized.config.qwen_api_key || '',
                        calc_link: normalized.config.calc_link || ''
                    }));
                    if (normalized.config.gdrive_client_id) window.driveModule.init(normalized.config.gdrive_client_id);
                    if (normalized.config.gdrive_folder) window.driveModule.setFolderSetting(normalized.config.gdrive_folder);
                }
                await reloadMemories();
                const savedFolders = await idbGetAllFolders();
                if (savedFolders.length > 0) {
                    setFolders([...new Set([...['General', 'Viajes', 'Personal', 'Familia'], ...savedFolders])]);
                } else {
                    for (const f of ['General', 'Viajes', 'Personal', 'Familia']) await idbSaveFolder(f);
                }
                await refreshPendingCount();
            } catch (e) {
                console.error('Error en init:', e);
                showToast('Error cargando datos locales', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const reloadMemories = async () => {
        const all = await idbGetAllMemories();
        all.sort((a, b) => {
            if (a.date !== b.date) return b.date.localeCompare(a.date);
            return (b.timestamp || '').localeCompare(a.timestamp || '');
        });
        setMemories(all);
    };

    const refreshPendingCount = async () => {
        const p = await idbGetAllPending();
        setPendingCnt(p.length);
    };

    const saveSettingsToDB = async (newSettings) => {
        await idbSetConfig('app_settings', newSettings);
        setSettings(newSettings);
    };

    const handleSaveProfile = async () => {
        showToast('Guardando perfil...', 'loading');
        try {
            let foto_blob = settings.user.foto_blob || null;
            let foto_perfil = settings.user.foto_perfil || '';
            if (userForm.foto_file) {
                foto_blob = await fileToBase64(userForm.foto_file);
                foto_perfil = userForm.foto_file.name;
            }
            await saveSettingsToDB(window.settingsModule.buildProfilePayload(settings, userForm, { foto_perfil, foto_blob }));
            setViewUserOpen(false);
            showToast('✅ Perfil guardado', 'success');
        } catch {
            showToast('Error al guardar perfil', 'error');
        }
    };

    const handleDeleteProfile = async () => {
        if (!confirm('¿Seguro que deseas borrar tus datos de perfil?')) return;
        showToast('Borrando perfil...', 'loading');
        try {
            await saveSettingsToDB(window.settingsModule.buildProfilePayload(settings, { ...userForm, nombre: '', usuario: '', email: '' }, { foto_perfil: '', foto_blob: null }));
            setViewUserOpen(false);
            showToast('✅ Perfil eliminado', 'success');
        } catch {
            showToast('Error al borrar perfil', 'error');
        }
    };

    const handleSaveConfig = async () => {
        showToast('Guardando configuración...', 'loading');
        try {
            const newSettings = window.settingsModule.buildConfigPayload(settings, configForm);
            await saveSettingsToDB(newSettings);
            await idbSetConfig('gdrive_client_id', configForm.gdrive_client_id);
            await idbSetConfig('gdrive_folder', configForm.gdrive_folder);
            if (configForm.gdrive_client_id) window.driveModule.init(configForm.gdrive_client_id);
            if (configForm.gdrive_folder) window.driveModule.setFolderSetting(configForm.gdrive_folder);
            setViewConfigOpen(false);
            showToast('✅ Configuración guardada', 'success');
        } catch {
            showToast('Error al guardar configuración', 'error');
        }
    };

    const handleToggleDrive = async () => {
        if (driveCon) {
            window.driveModule.disconnect();
            setDriveCon(false);
            showToast('Drive desconectado', 'info');
            return;
        }
        if (!settings.config.gdrive_client_id && !configForm.gdrive_client_id) {
            showToast('Configura tu Google Drive Client ID en Configuración', 'warning', 6000);
            return;
        }
        showToast('Conectando a Google Drive...', 'loading');
        try {
            await new Promise((resolve, reject) => window.driveModule.connect(resolve, reject));
            showToast('✅ Google Drive conectado', 'success');
            await refreshPendingCount();
        } catch (err) {
            showToast(`No se pudo conectar a Drive: ${err}`, 'error', 6000);
        }
    };

    const handleSyncPending = async () => {
        if (!isOnline) { showToast('Sin conexión. Intenta cuando vuelvas a estar en línea.', 'warning'); return; }
        if (!driveCon) { showToast('Conecta Drive primero (menú ⋮)', 'warning'); return; }
        await window.driveModule.syncPending();
        await refreshPendingCount();
    };

    const getGoogleApiKey = () => settings.config.google_api_key || configForm.google_api_key;
    const getDeepSeekApiKey = () => settings.config.deepseek_key || configForm.deepseek_key;
    const getQwenApiKey = () => settings.config.qwen_api_key || configForm.qwen_api_key;
    const getApiKey = () => getGoogleApiKey() || getDeepSeekApiKey() || getQwenApiKey();

    const callAi = (prompt, systemPrompt = '') => {
        const googleKey = getGoogleApiKey();
        const deepSeekKey = getDeepSeekApiKey();
        const qwenKey = getQwenApiKey();
        const onRetry = (attempt) => showToast(`Reintentando conexión con IA (${attempt}/3)...`, 'warning', 2000);
        return window.aiModule.callWithFallback({
            googleApiKey: googleKey,
            deepSeekApiKey: deepSeekKey,
            qwenApiKey: qwenKey,
            prompt,
            systemPrompt,
            onRetry
        });
    };

    const handleAiEnhanceDaily = async () => {
        if (newPhotos.length === 0) { showToast('Sube al menos un archivo primero', 'warning'); return; }
        if (!getApiKey()) { showToast('Configura una API Key de Gemini, DeepSeek o Qwen en Configuración', 'warning', 6000); return; }
        setIsAiTyping(true);
        showToast('✨ La IA está redactando tu diario...', 'loading', 8000);
        try {
            const text = await callAi(
                'Por favor escribe el comentario de mi diario basándose en el contexto del día. Hazlo tierno, reflexivo y en primera persona.',
                'Eres un asistente de diario íntimo. Redacta comentarios breves (1-2 párrafos) cálidos e inspiradores para guardar como memoria del día.'
            );
            setCurrentComment(text);
            showToast('✅ Diario redactado por la IA', 'success');
        } catch (err) {
            const message = err?.message || 'No se pudo completar la solicitud.';
            showToast(`Error IA: ${message}`, 'error', 10000);
        } finally {
            setIsAiTyping(false);
        }
    };

    const handleSaveDay = async () => {
        if (newPhotos.length === 0) { showToast('Sube al menos un archivo para guardar el día', 'warning'); return; }
        setIsSaving(true);
        showToast('Guardando recuerdos del día...', 'loading');
        try {
            let savedCount = 0, driveCount = 0, pendingCount_ = 0;

            for (const photo of newPhotos) {
                const timestamp = fmtTime();
                const localMemory = {
                    id: photo.id, url: photo.url, mimeType: photo.mimeType, name: photo.name,
                    date: currentDate, timestamp, folder: currentFolder,
                    comment: currentComment || 'Sin comentarios registrados.',
                    pendingSync: false, driveId: null, driveUrl: null
                };
                await idbSaveMemory(localMemory);
                savedCount++;

                if (driveCon && isOnline) {
                    try {
                        const driveResult = await window.driveModule.uploadFile(photo.file, {
                            id: photo.id, date: currentDate, comment: localMemory.comment
                        });
                        localMemory.driveId = driveResult.driveId;
                        localMemory.driveUrl = driveResult.driveUrl;
                        localMemory.url = driveResult.driveUrl;
                        await idbSaveMemory(localMemory);
                        console.debug('[handleSaveDay] saved Drive memory', localMemory);
                        driveCount++;
                    } catch (err) {
                        console.error('Drive upload failed for memory', photo.id, err);
                        await idbSavePending({
                            id: photo.id, fileBlob: photo.file, fileName: photo.name || `foto_${photo.id}.jpg`,
                            mimeType: photo.mimeType || 'image/jpeg',
                            metadata: { id: photo.id, date: currentDate, comment: localMemory.comment }
                        });
                        localMemory.pendingSync = true;
                        await idbSaveMemory(localMemory);
                        pendingCount_++;
                    }
                } else if (photo.file) {
                    await idbSavePending({
                        id: photo.id, fileBlob: photo.file, fileName: photo.name || `foto_${photo.id}.jpg`,
                        mimeType: photo.mimeType || 'image/jpeg',
                        metadata: { id: photo.id, date: currentDate, comment: localMemory.comment }
                    });
                    localMemory.pendingSync = true;
                    await idbSaveMemory(localMemory);
                    pendingCount_++;
                }
            }

            if (window.registerDriveSync && pendingCount_ > 0) window.registerDriveSync();
            await reloadMemories();
            setNewPhotos([]);
            setCurrentComment('');
            await refreshPendingCount();

            if (driveCount > 0 && pendingCount_ === 0) showToast(`🎉 ${savedCount} recuerdo(s) guardados y subidos a Drive`, 'success');
            else if (pendingCount_ > 0 && driveCount === 0) showToast(`💾 ${savedCount} recuerdo(s) guardados localmente. ${pendingCount_} pendiente(s) para Drive`, 'info', 6000);
            else if (driveCount > 0 && pendingCount_ > 0) showToast(`🎉 ${driveCount} subidos a Drive · ${pendingCount_} pendientes para sincronizar`, 'info', 6000);
            else showToast(`💾 ${savedCount} recuerdo(s) guardados localmente`, 'info');
        } catch (err) {
            console.error('Error guardando:', err);
            showToast('Error al guardar algunos recuerdos', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveChanges = async () => {
        if (!editingMemory) return;
        showToast('Guardando cambios...', 'loading');
        try {
            let updated = { ...editingMemory };
            if (editingMemory.newFile) {
                updated.url = await fileToBase64(editingMemory.newFile);
                updated.mimeType = editingMemory.newFile.type;
                const pending = await idbGetAllPending();
                const pend = pending.find(p => p.id === updated.id);
                if (pend) {
                    pend.fileBlob = editingMemory.newFile;
                    pend.mimeType = editingMemory.newFile.type;
                    pend.fileName = editingMemory.newFile.name;
                    await idbSavePending(pend);
                }
            }
            delete updated.newFile;
            await idbSaveMemory(updated);
            await reloadMemories();
            setEditingMemory(null);
            showToast('✅ Recuerdo actualizado', 'success');
        } catch {
            showToast('Error al guardar cambios', 'error');
        }
    };

    const handleDeleteAction = async () => {
        if (!confirmDeleteObj) return;
        showToast('Eliminando recuerdo(s)...', 'loading');
        try {
            if (confirmDeleteObj.type === 'single') {
                const memory = memories.find(item => item.id === confirmDeleteObj.payload);
                if (memory?.driveId) await window.driveModule.deleteFile(memory.driveId);
                await idbDeleteMemory(confirmDeleteObj.payload);
                await idbDeletePending(confirmDeleteObj.payload);
                showToast('🗑️ Recuerdo eliminado', 'success');
            } else if (confirmDeleteObj.type === 'day') {
                const dayMems = memories.filter(m => m.date === confirmDeleteObj.payload);
                for (const m of dayMems) {
                    if (m.driveId) await window.driveModule.deleteFile(m.driveId);
                    await idbDeleteMemory(m.id);
                    await idbDeletePending(m.id);
                }
                showToast(`🗑️ ${dayMems.length} recuerdo(s) del ${fmtDate(confirmDeleteObj.payload)} eliminados`, 'success');
            }
            await reloadMemories();
            await refreshPendingCount();
        } catch {
            showToast('Error al eliminar', 'error');
        } finally {
            setConfirmDeleteObj(null);
        }
    };

    const handleSendChat = async () => {
        if (!userInput.trim()) return;
        const msg = userInput.trim();
        setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
        setUserInput('');
        setIsAiTyping(true);
        try {
            const ctx = memories.map(m => `- Fecha: ${m.date} | Carpeta: ${m.folder} | "${m.comment}"`).join('\n');
            const reply = await callAi(msg, `Eres un Biógrafo Personal cálido y nostálgico. Tienes acceso al registro de recuerdos del usuario:\n\n${ctx}`);
            setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
        } catch (err) {
            const message = err?.message || 'No se pudo completar la solicitud.';
            setChatMessages(prev => [...prev, { role: 'assistant', text: `Lo siento, tuve un problema: ${message}. Verifica tus API Keys de Gemini, DeepSeek o Qwen en Configuración.` }]);
            showToast(`Error IA: ${message}`, 'error', 10000);
        } finally {
            setIsAiTyping(false);
        }
    };

    useEffect(() => {
        if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, isAiTyping]);

    const filterByDateRange = () => memories.filter(m => m.date >= dateFrom && m.date <= dateTo);

    const handleGenScript = async () => {
        if (!dateFrom || !dateTo) { showToast('Selecciona un rango de fechas', 'warning'); return; }
        const filtered = filterByDateRange();
        if (filtered.length === 0) { showToast('Sin recuerdos en ese rango de fechas', 'warning'); return; }
        setIsGenScript(true);
        setMovieScript('');
        showToast('✨ Generando guion narrativo...', 'loading', 15000);
        try {
            const summary = filtered.map(m => `Día ${m.date}: "${m.comment}"`).join('\n');
            const script = await callAi(
                `Tengo estas vivencias:\n${summary}\n\nEscribe un guion narrativo emotivo y poético en primera persona.`,
                'Eres un director de cine documental íntimo. Escribes guiones emotivos y nostálgicos.'
            );
            setMovieScript(script);
            showToast('✅ Guion generado', 'success');
        } catch (err) {
            const message = err?.message || 'No se pudo completar la solicitud.';
            showToast(`Error IA: ${message}`, 'error', 10000);
        } finally {
            setIsGenScript(false);
        }
    };

    const handleCreateMovie = async () => {
        if (!dateFrom || !dateTo) { showToast('Selecciona un rango de fechas', 'warning'); return; }
        const filtered = filterByDateRange();
        if (filtered.length === 0) { showToast('Sin recuerdos en ese rango', 'warning'); return; }
        setIsCreatingMovie(true);
        setMovieProgress(0);
        showToast(`🎥 Compilando ${filtered.length} recuerdos...`, 'loading', 60000);
        try {
            const url = await window.movieModule.compileMemories(filtered, setMovieProgress, movieMusicFile);
            setMovieUrl(url);
            setShowMovieModal(true);
            showToast(`🎬 Película lista con ${filtered.length} recuerdos`, 'success');
        } catch (err) {
            console.error(err);
            showToast('Error al crear la película', 'error');
        } finally {
            setIsCreatingMovie(false);
            setMovieProgress(0);
        }
    };

    const createFolder = async () => {
        const name = prompt('Nombre de la nueva carpeta:');
        if (!name || !name.trim() || folders.includes(name.trim())) {
            if (name && folders.includes(name.trim())) showToast('Esa carpeta ya existe', 'warning');
            return;
        }
        const n = name.trim();
        await idbSaveFolder(n);
        setFolders(prev => [...prev, n]);
        showToast(`📂 Carpeta "${n}" creada`, 'success');
    };

    const movePhotos = async (photoIds, targetFolder) => {
        try {
            const selected = new Set(photoIds);
            for (const memory of memories) {
                if (selected.has(memory.id)) await idbSaveMemory({ ...memory, folder: targetFolder });
            }
            await reloadMemories();
            showToast(`✅ ${photoIds.length} foto(s) movida(s) a ${targetFolder}`, 'success');
        } catch {
            showToast('Error al mover las fotos', 'error');
        }
    };

    const handleFileUpload = async (source) => {
        const files = Array.from(source?.target?.files || source || []);
        if (!files.length) return;
        const dayCount = newPhotos.length + memories.filter(m => m.date === currentDate).length;
        if (files.length + dayCount > 20) { showToast('Límite de 20 archivos por día', 'warning'); return; }
        showToast(`Procesando ${files.length} archivo(s)...`, 'loading', 3000);
        const processed = await Promise.all(files.map(async file => ({
            id: generateId(), url: await fileToBase64(file), file,
            mimeType: file.type || 'image/jpeg', name: file.name
        })));
        setNewPhotos(prev => [...prev, ...processed]);
        if (source?.target) source.target.value = '';
        showToast(`✅ ${files.length} archivo(s) listos para guardar`, 'success');
    };

    const closeMovieModal = () => { setShowMovieModal(false); setMovieUrl(null); };

    const dm = window.settingsModule.getThemeMode(settings, configForm, viewConfigOpen);
    const tabs = [
        { id: 'capture',    icon: '🏠', label: 'Inicio' },
        { id: 'history',    icon: '📋', label: 'Recuerdos' },
        { id: 'albums',     icon: '📚', label: 'Álbumes' },
        { id: 'biographer', icon: '💬', label: 'Biógrafo' },
        { id: 'video',      icon: '🎬', label: 'Cine' }
    ];

    const renderMainView = () => {
        switch (view) {
            case 'history':
                return (
                    <History dm={dm} memories={memories}
                        actions={{
                            onFullscreen: setFullscreenMedia,
                            onEdit: (m) => setEditingMemory({ ...m }),
                            onDeleteDay: (date) => setConfirmDeleteObj({ type: 'day', payload: date }),
                            onDeleteSingle: (id) => setConfirmDeleteObj({ type: 'single', payload: id })
                        }}
                    />
                );
            case 'albums':
                return <Albums dm={dm} folders={folders} memories={memories} onCreateFolder={createFolder} onMovePhotos={movePhotos} />;
            case 'biographer':
                return (
                    <Biographer dm={dm} hasApiKey={!!(settings.config.google_api_key || configForm.google_api_key || settings.config.deepseek_key || configForm.deepseek_key || settings.config.qwen_api_key || configForm.qwen_api_key)}
                        chat={{ messages: chatMessages, userInput, isTyping: isAiTyping }}
                        actions={{ setUserInput, sendMessage: handleSendChat, chatEndRef }}
                    />
                );
            case 'video':
                return (
                    <Video dm={dm}
                        movie={{ dateFrom, dateTo, script: movieScript, musicFile: movieMusicFile, isGenScript, isCreating: isCreatingMovie, progress: movieProgress }}
                        actions={{ setDateFrom, setDateTo, setMusicFile: setMovieMusicFile, generateScript: handleGenScript, createMovie: handleCreateMovie }}
                    />
                );
            case 'capture':
            default:
                return (
                    <Capture dm={dm} folders={folders}
                        capture={{ date: currentDate, folder: currentFolder, comment: currentComment, photos: newPhotos, isSaving, isAiTyping }}
                        actions={{
                            setDate: setCurrentDate, setFolder: setCurrentFolder, setComment: setCurrentComment,
                            removePhoto: (id) => setNewPhotos(prev => prev.filter(x => x.id !== id)),
                            uploadFiles: handleFileUpload, saveDay: handleSaveDay, aiEnhance: handleAiEnhanceDaily
                        }}
                    />
                );
        }
    };

    const fullscreenIndex = fullscreenMedia
        ? memories.findIndex(memory => memory.id === fullscreenMedia.id)
        : -1;
    const showPreviousMemory = () => {
        if (fullscreenIndex > 0) setFullscreenMedia(memories[fullscreenIndex - 1]);
    };
    const showNextMemory = () => {
        if (fullscreenIndex >= 0 && fullscreenIndex < memories.length - 1) setFullscreenMedia(memories[fullscreenIndex + 1]);
    };

    if (isLoading) return <SplashScreen />;

    return (
        <div className={`app-shell w-full h-screen max-w-md mx-auto relative overflow-hidden flex flex-col view-transition ${getViewBg(view, dm)}`}>
            <ToastContainer toasts={toasts} />

            {swUpdate && (
                <div className="absolute top-20 left-4 right-4 z-[90] bg-sky-900/95 border border-sky-500/40 rounded-2xl p-3 flex items-center gap-3 animate-fade-in-down">
                    <span>🔄</span>
                    <p className="text-xs text-white flex-1">Hay una actualización disponible</p>
                    <button onClick={() => window.location.reload()} className="text-xs bg-sky-500 text-white px-3 py-1 rounded-lg">Actualizar</button>
                </div>
            )}

            {installEvt && (
                <div className="absolute bottom-32 left-4 right-4 z-[90] bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-3 animate-fade-in slide-up shadow-2xl">
                    <img src="./static/icon-192.png" className="w-10 h-10 rounded-xl" alt="icon" />
                    <div className="flex-1">
                        <p className="text-xs text-white font-semibold">Instalar UnaAlDia</p>
                        <p className="text-[10px] text-slate-400">Agregar a pantalla de inicio</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setInstallEvt(null)} className="text-[10px] text-slate-400 px-2 py-1">No</button>
                        <button onClick={handleInstall} className="text-[10px] bg-emerald-500 text-slate-950 font-semibold px-3 py-1.5 rounded-xl">Instalar</button>
                    </div>
                </div>
            )}

            <header className="safe-top pb-2 px-5 flex flex-col relative pt-4">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                        {settings.user.foto_blob ? (
                            <img src={settings.user.foto_blob} className="w-9 h-9 rounded-full object-cover border-2 border-white/20 shadow-md" alt="Avatar" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-base border border-white/10 shadow-md">👤</div>
                        )}
                        <div>
                            <h1 className={`text-sm font-semibold leading-tight ${dm ? 'text-white' : 'text-slate-900'}`}>
                                {settings.user.nombre || 'Mi Diario'}
                            </h1>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] uppercase tracking-wider text-slate-400">
                                    {settings.user.usuario ? `@${settings.user.usuario}` : 'UnaAlDia'}
                                </span>
                                {driveCon && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Drive conectado" />}
                                {!isOnline && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/30">Sin conexión</span>}
                                {pendingCnt > 0 && <span className="text-[8px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded-full border border-sky-500/30">{pendingCnt} pend.</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {pendingCnt > 0 && isOnline && driveCon && (
                            <button onClick={handleSyncPending} disabled={isSyncing}
                                className={`text-[10px] px-2.5 py-1.5 rounded-xl border font-medium transition-all btn-ripple ${dm ? 'bg-sky-900/50 border-sky-500/30 text-sky-300 hover:bg-sky-800/60' : 'bg-sky-100 border-sky-300 text-sky-700'} ${isSyncing ? 'opacity-50' : ''}`}>
                                {isSyncing ? `${syncProg.done}/${syncProg.total}` : '🔄'}
                            </button>
                        )}
                        <div className="relative">
                            <button onClick={() => setMenuOpen(!menuOpen)}
                                className={`p-2 rounded-full transition-all ${dm ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}>
                                <span className="text-xl leading-none">⋮</span>
                            </button>
                            {menuOpen && (
                                <div className={`absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl border z-50 py-2 backdrop-blur-xl animate-fade-in ${dm ? 'bg-slate-900/95 border-white/10 text-white' : 'bg-white/95 border-slate-200 text-slate-900'}`}
                                    onClick={() => setMenuOpen(false)}>
                                    {[
                                        { icon: '👤', label: 'Perfil', action: () => setViewUserOpen(true) },
                                        { icon: '☁️', label: driveCon ? 'Desconectar Drive' : 'Conectar Drive', action: handleToggleDrive },
                                        ...(pendingCnt > 0 ? [{ icon: '🔄', label: `Sync ${pendingCnt} pendientes`, action: handleSyncPending }] : []),
                                        { icon: '⚙️', label: 'Configuración', action: () => setViewConfigOpen(true) },
                                    ].map(item => (
                                        <button key={item.label} onClick={item.action}
                                            className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center gap-2.5 transition-all ${dm ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                                            <span>{item.icon}</span> {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {isSyncing && (
                    <div className={`mt-2 rounded-xl px-3 py-2 text-xs flex items-center gap-2 border ${dm ? 'bg-slate-900/80 border-white/10 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                        <span className="animate-spin">⟳</span>
                        <span>Sincronizando {syncProg.done}/{syncProg.total} archivos con Drive...</span>
                        <div className="flex-1 bg-white/10 rounded-full h-1">
                            <div className="bg-emerald-400 h-1 rounded-full transition-all" style={{ width: `${syncProg.total ? (syncProg.done / syncProg.total) * 100 : 0}%` }} />
                        </div>
                    </div>
                )}
                {view === 'capture' && <WelcomeBanner dm={dm} />}
            </header>

            <main className="flex-1 overflow-y-auto px-5 pb-36 custom-scroll">
                {renderMainView()}
            </main>

            {fullscreenMedia && <FullscreenModal
                media={fullscreenMedia}
                onClose={() => setFullscreenMedia(null)}
                onPrevious={showPreviousMemory}
                onNext={showNextMemory}
                hasPrevious={fullscreenIndex > 0}
                hasNext={fullscreenIndex >= 0 && fullscreenIndex < memories.length - 1}
            />}

            {editingMemory && (
                <EditMemoryModal dm={dm} memory={editingMemory} folders={folders}
                    actions={{
                        onClose: () => setEditingMemory(null),
                        onUpdate: (patch) => setEditingMemory(prev => ({ ...prev, ...patch })),
                        onReplaceFile: async (e) => {
                            const f = e.target.files[0];
                            if (!f) return;
                            const b64 = await fileToBase64(f);
                            setEditingMemory(prev => ({ ...prev, url: b64, mimeType: f.type, newFile: f }));
                            showToast('Archivo reemplazado en el editor', 'info');
                        },
                        onSave: handleSaveChanges
                    }}
                />
            )}

            {showMovieModal && movieUrl && (
                <MoviePlayerModal dm={dm} movieUrl={movieUrl} onClose={closeMovieModal} />
            )}

            {confirmDeleteObj && (
                <ConfirmDeleteModal dm={dm} confirmObj={confirmDeleteObj}
                    onCancel={() => setConfirmDeleteObj(null)} onConfirm={handleDeleteAction}
                />
            )}

            {viewUserOpen && (
                <ProfileModal dm={dm} userForm={userForm}
                    profilePhoto={userForm.foto_preview || settings.user.foto_blob}
                    actions={{
                        onClose: () => setViewUserOpen(false),
                        onChange: (key, val) => setUserForm(prev => ({ ...prev, [key]: val })),
                        onPhotoChange: (e) => {
                            const f = e.target.files[0];
                            if (!f) return;
                            setUserForm(prev => ({ ...prev, foto_file: f, foto_preview: URL.createObjectURL(f) }));
                        },
                        onSave: handleSaveProfile,
                        onDelete: handleDeleteProfile
                    }}
                />
            )}

            {viewConfigOpen && (
                <ConfigModal configForm={configForm}
                    actions={{
                        onClose: () => setViewConfigOpen(false),
                        onChange: (key, val) => setConfigForm(p => ({ ...p, [key]: val })),
                        onToggleDark: () => setConfigForm(p => ({ ...p, modo_oscuro: !p.modo_oscuro })),
                        onSave: handleSaveConfig
                    }}
                />
            )}

            <AppTabs tabs={tabs} activeView={view} dm={dm} onChange={setView} />
        </div>
    );
};

window.App = App;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
