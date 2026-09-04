const isVideo = (url, mime) =>
    (mime && mime.startsWith('video/')) ||
    (url && /\.(mp4|webm|mov)/i.test(url)) ||
    (url && url.startsWith('data:video/'));

const getMediaUrl = (m) => {
    if (!m || typeof m !== 'object') return '';
    if (!m.driveUrl && !m.url && !m.driveViewLink) {
        console.debug('[getMediaUrl] media object missing URL fields:', m);
    }
    if (m.url) return m.url;
    if (m.driveUrl) return m.driveUrl;
    if (m.driveViewLink) return m.driveViewLink;
    return '';
};

const generateId = () =>
    Math.random().toString(36).substr(2, 9);

const fmtTime = () =>
    new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
    });

const fmtDate = (d) =>
    new Date(d + 'T12:00:00').toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });

const VIEW_BACKGROUNDS = {
    capture:    { dark: 'bg-[#1e293b]', light: 'bg-[#f8fafc]' },
    history:    { dark: 'bg-[#1e2330]', light: 'bg-[#f1f5f9]' },
    albums:     { dark: 'bg-[#2e1f4d]', light: 'bg-[#faf5ff]' },
    biographer: { dark: 'bg-[#20353c]', light: 'bg-[#f0fdf4]' },
    video:      { dark: 'bg-[#1b2e21]', light: 'bg-[#f0fdf4]' }
};

const getViewBg = (view, darkMode) =>
    (VIEW_BACKGROUNDS[view] || VIEW_BACKGROUNDS.capture)[darkMode ? 'dark' : 'light'];

const getPanelClasses = (dm, extra = '') => {
    const base = dm
        ? 'border-white/10 bg-white/[0.06] text-white'
        : 'border-slate-200 bg-white text-slate-900';
    return `${base} ${extra}`.trim();
};

const getMutedTextClass = (dm) => dm ? 'text-slate-400' : 'text-slate-500';

const getInputClass = (dm, extra = '') => {
    const base = dm
        ? 'bg-white/[0.04] border-white/10 text-white placeholder-slate-400'
        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';
    return `${base} ${extra}`.trim();
};

const getButtonClass = (dm, variant = 'primary', extra = '') => {
    const variants = {
        primary: dm ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800',
        secondary: dm ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200',
        ghost: dm ? 'text-white bg-white/10 hover:bg-white/20' : 'text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200',
        danger: 'text-rose-300 bg-rose-500/20 hover:bg-rose-500/30'
    };
    return `${variants[variant] || variants.secondary} ${extra}`.trim();
};

window.isVideo = isVideo;
window.getMediaUrl = getMediaUrl;
window.generateId = generateId;
window.fmtTime = fmtTime;
window.fmtDate = fmtDate;
window.fileToBase64 = fileToBase64;
window.getViewBg = getViewBg;
window.getPanelClasses = getPanelClasses;
window.getMutedTextClass = getMutedTextClass;
window.getInputClass = getInputClass;
window.getButtonClass = getButtonClass;
