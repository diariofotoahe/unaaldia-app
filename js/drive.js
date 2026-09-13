(function () {
    const DRIVE_FOLDER_NAME = 'UnaAlDia';
    const GDRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
    const DRIVE_FOLDER_PATTERN = /^[a-zA-Z0-9_-]{25,}$/;

    function normalizeDriveFolderInput(value) {
        if (!value) return '';
        const trimmed = value.trim();
        const urlMatch = trimmed.match(/(?:folders\/|id=)([-_A-Za-z0-9]{25,})/);
        if (urlMatch) return urlMatch[1];
        return trimmed;
    }

    function waitForGoogleIdentity() {
        return new Promise((resolve, reject) => {
            const timeoutAt = Date.now() + 15000;
            const check = () => {
                if (window.google?.accounts?.oauth2?.initTokenClient) {
                    resolve();
                    return;
                }
                if (Date.now() > timeoutAt) {
                    reject(new Error('Google Identity Services no cargó. Verifica tu conexión.'));
                    return;
                }
                setTimeout(check, 200);
            };
            check();
        });
    }

    function getOAuthSetupError(clientId) {
        if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test((clientId || '').trim())) {
            return 'Usa un Client ID OAuth 2.0 de Google de tipo “Aplicación web” (termina en .apps.googleusercontent.com).';
        }

        const { protocol, hostname, origin } = window.location;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
        if (protocol !== 'https:' && !isLocalhost) {
            return `Google bloquea OAuth desde ${origin} porque no usa HTTPS. Abre la app con http://localhost o publícala en un dominio HTTPS y registra ese origen en Google Cloud.`;
        }

        return '';
    }

    function readStoredToken() {
        const saved = localStorage.getItem('gdrive_token');
        if (!saved) return null;
        try {
            const parsed = JSON.parse(saved);
            return parsed.expires_at > Date.now() ? parsed : null;
        } catch {
            localStorage.removeItem('gdrive_token');
            return null;
        }
    }

    function persistToken(token, expiresIn) {
        localStorage.setItem('gdrive_token', JSON.stringify({
            access_token: token,
            expires_at: Date.now() + (expiresIn * 1000)
        }));
    }

    function clearStoredToken() {
        localStorage.removeItem('gdrive_token');
    }

    window.driveModule = {
        accessToken: null,
        folderId: null,
        isConnected: false,
        tokenClient: null,
        driveFolderSetting: null,
        onStatusChange: null,
        clientId: '',

        init(clientId) {
            if (clientId) this.clientId = clientId;
            const storedToken = readStoredToken();
            if (storedToken) {
                this.accessToken = storedToken.access_token;
                this.isConnected = true;
                if (this.onStatusChange) this.onStatusChange(true);
            } else {
                clearStoredToken();
            }
        },

        setFolderSetting(value) {
            this.driveFolderSetting = normalizeDriveFolderInput(value || '');
            this.folderId = null;
        },

        async connect(onSuccess, onError) {
            try {
                if (!this.clientId) throw new Error('Google Drive Client ID no configurado. Ve a Configuración.');
                const setupError = getOAuthSetupError(this.clientId);
                if (setupError) throw new Error(setupError);
                if (this.isConnected && this.accessToken) {
                    if (this.onStatusChange) this.onStatusChange(true);
                    if (onSuccess) onSuccess();
                    return;
                }

                await waitForGoogleIdentity();
                this.tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: this.clientId,
                    scope: GDRIVE_SCOPE,
                    include_granted_scopes: true,
                    error_callback: (error) => {
                        if (onError) onError(error?.message || error?.type || 'No se pudo abrir la ventana de autorización de Google.');
                    },
                    callback: async (response) => {
                        try {
                            if (response.error) {
                                if (onError) onError(response.error_description || response.error || 'Error OAuth de Google');
                                return;
                            }

                            this.accessToken = response.access_token;
                            persistToken(response.access_token, response.expires_in || 3600);

                            const folderId = await this.ensureFolder();
                            if (!folderId) throw new Error('No se pudo configurar la carpeta de Drive');

                            this.isConnected = true;
                            if (this.onStatusChange) this.onStatusChange(true);
                            if (navigator.onLine) await this.syncPending();
                            if (onSuccess) onSuccess();
                        } catch (cbErr) {
                            if (onError) onError(cbErr.message || cbErr);
                        }
                    }
                });

                this.tokenClient.requestAccessToken({ prompt: 'select_account' });
            } catch (e) {
                if (onError) onError(e.message || e);
            }
        },

        disconnect() {
            if (this.accessToken && window.google?.accounts?.oauth2?.revoke) {
                google.accounts.oauth2.revoke(this.accessToken, () => {});
            }
            this.accessToken = null;
            this.folderId = null;
            this.isConnected = false;
            clearStoredToken();
            if (this.onStatusChange) this.onStatusChange(false);
        },

        async ensureFolder() {
            if (this.folderId) return this.folderId;

            const folderSetting = this.driveFolderSetting || DRIVE_FOLDER_NAME;
            const isId = DRIVE_FOLDER_PATTERN.test(folderSetting);
            try {
                if (isId) {
                    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${folderSetting}?fields=id,name,mimeType`, {
                        headers: { Authorization: `Bearer ${this.accessToken}` }
                    });
                    const data = await response.json();
                    if (response.ok && data.mimeType === 'application/vnd.google-apps.folder') {
                        this.folderId = data.id;
                        return this.folderId;
                    }
                }

                const folderName = folderSetting || DRIVE_FOLDER_NAME;
                const query = encodeURIComponent(`name='${folderName.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
                const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
                    headers: { Authorization: `Bearer ${this.accessToken}` }
                });
                const searchData = await searchResponse.json();

                if (searchData.files && searchData.files.length > 0) {
                    this.folderId = searchData.files[0].id;
                } else {
                    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: folderName, mimeType: 'application/vnd.google-apps.folder' })
                    });
                    const createData = await createResponse.json();
                    this.folderId = createData.id;
                }

                return this.folderId;
            } catch (e) {
                console.error('[Drive] Error gestionando carpeta:', e);
                return null;
            }
        },

        async uploadFile(file, metadata) {
            if (!this.accessToken || !this.isConnected) throw new Error('No conectado a Google Drive');
            await this.ensureFolder();
            if (!this.folderId) throw new Error('No se pudo establecer la carpeta de Drive');

            const fileNameBase = file.name || `${metadata.id}`;
            const ext = fileNameBase.match(/\.[^.]+$/)?.[0] || '';
            const fileName = `${metadata.date}_${metadata.id}${ext}`;
            const boundary = '----UnaAlDiaBoundary';
            const contentType = file.type || 'application/octet-stream';
            const metaPart = JSON.stringify({ name: fileName, parents: [this.folderId], description: metadata.comment || '' });
            const fileBuffer = await file.arrayBuffer();
            const fileBytes = new Uint8Array(fileBuffer);
            const metaBytes = new TextEncoder().encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metaPart}\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`);
            const endBytes = new TextEncoder().encode(`\r\n--${boundary}--`);
            const body = new Uint8Array(metaBytes.length + fileBytes.length + endBytes.length);
            body.set(metaBytes, 0);
            body.set(fileBytes, metaBytes.length);
            body.set(endBytes, metaBytes.length + fileBytes.length);

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink', {
                method: 'POST',
                headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
                body
            });

            if (!response.ok) {
                const errorPayload = await response.json();
                throw new Error(`Drive: ${errorPayload.error?.message || response.status}`);
            }

            const result = await response.json();
            await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}/permissions`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'reader', type: 'anyone' })
            });

            const driveUrl = result.webContentLink || `https://drive.google.com/uc?export=download&id=${result.id}`;
            return {
                driveId: result.id,
                driveUrl,
                driveViewLink: result.webViewLink
            };
        },

        async deleteFile(fileId) {
            if (!fileId) return;
            if (!this.accessToken || !this.isConnected) throw new Error('Drive no está conectado');
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            if (!response.ok && response.status !== 404) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(`Drive: ${payload.error?.message || response.status}`);
            }
        },

        async getVerifiedMediaUrl(memory) {
            const fallback = memory?.driveUrl || memory?.driveViewLink || memory?.url || '';
            if (!memory?.driveId || !this.accessToken || !this.isConnected) return fallback;
            try {
                const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(memory.driveId)}?alt=media`, {
                    headers: { Authorization: `Bearer ${this.accessToken}` }
                });
                if (!response.ok) return fallback;
                const blob = await response.blob();
                return URL.createObjectURL(blob);
            } catch {
                return fallback;
            }
        },

        async syncPending(onProgress) {
            if (!navigator.onLine || !this.isConnected) return;
            const pending = await idbGetAllPending();
            if (pending.length === 0) {
                if (window.__driveOnSyncComplete) window.__driveOnSyncComplete();
                return;
            }

            if (window.__driveOnSyncStart) window.__driveOnSyncStart(pending.length);
            let done = 0;
            for (const item of pending) {
                try {
                    const file = new File([item.fileBlob], item.fileName, { type: item.mimeType });
                    const driveResult = await this.uploadFile(file, item.metadata);
                    const allMems = await idbGetAllMemories();
                    const mem = allMems.find(m => m.id === item.metadata.id);
                    if (mem) {
                        mem.driveId = driveResult.driveId;
                        mem.driveUrl = driveResult.driveUrl;
                        mem.pendingSync = false;
                        await idbSaveMemory(mem);
                    } else {
                        console.warn('[Drive] No memory found for pending item', item.metadata.id);
                    }
                    await idbDeletePending(item.id);
                    done++;
                    if (onProgress) onProgress(done, pending.length);
                    if (window.__driveOnSyncProgress) window.__driveOnSyncProgress(done, pending.length);
                } catch (e) {
                    console.error('[Drive] Error sincronizando:', item.fileName, e);
                    if (window.__driveOnSyncError) window.__driveOnSyncError(item.fileName, e.message);
                }
            }

            if (window.__driveOnSyncComplete) window.__driveOnSyncComplete(done, pending.length);
        }
    };

    function bootstrapDrive() {
        idbGetConfig('gdrive_client_id').then((clientId) => {
            if (clientId) window.driveModule.init(clientId);
            else window.driveModule.init('');

            idbGetConfig('gdrive_folder').then((folder) => {
                if (folder) window.driveModule.setFolderSetting(folder);
            });

            if (navigator.onLine && window.driveModule.isConnected) {
                window.driveModule.syncPending();
            }
        });
    }

    bootstrapDrive();

    window.addEventListener('online', () => {
        if (window.__onOnlineChange) window.__onOnlineChange(true);
        if (window.driveModule.isConnected) window.driveModule.syncPending();
    });

    window.addEventListener('offline', () => {
        if (window.__onOnlineChange) window.__onOnlineChange(false);
    });
})();
