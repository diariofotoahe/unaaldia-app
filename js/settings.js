(function () {
    const createDefaultSettings = () => ({
        user: { nombre: '', usuario: '', email: '', foto_perfil: '', foto_blob: null },
        config: { modo_oscuro: true, gdrive_folder: '', gdrive_client_id: '', deepseek_key: '', google_api_key: '', qwen_api_key: '', calc_link: '' }
    });

    const createUserForm = () => ({ nombre: '', usuario: '', email: '', foto_file: null, foto_preview: '' });
    const createConfigForm = () => ({ modo_oscuro: true, gdrive_folder: '', gdrive_client_id: '', deepseek_key: '', google_api_key: '', qwen_api_key: '', adminToken: '', calc_link: '' });

    const normalizeSettings = (savedSettings) => {
        const base = createDefaultSettings();
        const source = savedSettings || {};
        const userSource = source.user || {};
        const configSource = source.config || {};

        return {
            ...base,
            ...source,
            user: {
                ...base.user,
                nombre: userSource.nombre !== undefined ? userSource.nombre : base.user.nombre,
                usuario: userSource.usuario !== undefined ? userSource.usuario : base.user.usuario,
                email: userSource.email !== undefined ? userSource.email : base.user.email,
                foto_perfil: userSource.foto_perfil !== undefined ? userSource.foto_perfil : base.user.foto_perfil,
                foto_blob: userSource.foto_blob !== undefined ? userSource.foto_blob : base.user.foto_blob
            },
            config: {
                ...base.config,
                modo_oscuro: configSource.modo_oscuro !== undefined ? configSource.modo_oscuro : base.config.modo_oscuro,
                gdrive_folder: configSource.gdrive_folder !== undefined ? configSource.gdrive_folder : base.config.gdrive_folder,
                gdrive_client_id: configSource.gdrive_client_id !== undefined ? configSource.gdrive_client_id : base.config.gdrive_client_id,
                deepseek_key: configSource.deepseek_key !== undefined ? configSource.deepseek_key : base.config.deepseek_key,
                google_api_key: configSource.google_api_key !== undefined ? configSource.google_api_key : base.config.google_api_key,
                qwen_api_key: configSource.qwen_api_key !== undefined ? configSource.qwen_api_key : base.config.qwen_api_key,
                calc_link: configSource.calc_link !== undefined ? configSource.calc_link : base.config.calc_link
            }
        };
    };

    const buildProfilePayload = (settings, userForm, photoData) => {
        const sourceSettings = settings || createDefaultSettings();
        const form = userForm || {};
        const photo = photoData || {};
        const currentUser = sourceSettings.user || {};

        return {
            ...sourceSettings,
            user: {
                nombre: form.nombre || '',
                usuario: form.usuario || '',
                email: form.email || '',
                foto_perfil: photo.foto_perfil !== undefined ? photo.foto_perfil : (currentUser.foto_perfil || ''),
                foto_blob: photo.foto_blob !== undefined ? photo.foto_blob : (currentUser.foto_blob || null)
            }
        };
    };

    const buildConfigPayload = (settings, configForm) => ({
        ...settings,
        config: {
            modo_oscuro: configForm.modo_oscuro,
            gdrive_folder: configForm.gdrive_folder,
            gdrive_client_id: configForm.gdrive_client_id,
            deepseek_key: configForm.deepseek_key,
            google_api_key: configForm.google_api_key,
            qwen_api_key: configForm.qwen_api_key,
            calc_link: configForm.calc_link
        }
    });

    const getThemeMode = (settings, configForm, viewConfigOpen) =>
        (viewConfigOpen ? configForm.modo_oscuro : settings.config.modo_oscuro);

    window.settingsModule = {
        createDefaultSettings,
        createUserForm,
        createConfigForm,
        normalizeSettings,
        buildProfilePayload,
        buildConfigPayload,
        getThemeMode
    };
})();
