// ═══════════════════════════════════════════════════════════
// movie.js — Compilación de recuerdos en video (canvas + MediaRecorder)
// ═══════════════════════════════════════════════════════════

async function loadImage(url) {
    if (!url || url.startsWith('data:video/')) return null;
    try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
        return img;
    } catch {
        return null;
    }
}

function wrapText(ctx, text, maxWidth) {
    const words = (text || '').split(' ');
    let line = '';
    const lines = [];
    for (const w of words) {
        const test = line + w + ' ';
        if (ctx.measureText(test).width > maxWidth) {
            lines.push(line.trim());
            line = w + ' ';
        } else {
            line = test;
        }
    }
    if (line.trim()) lines.push(line.trim());
    return lines;
}

function drawFrame(ctx, canvas, mem, img, idx, total, frame, totalFrames) {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e2d45');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (img) {
        const alpha = frame < 15 ? frame / 15 : frame > totalFrames - 15 ? (totalFrames - frame) / 15 : 1;
        ctx.globalAlpha = alpha;
        const ar = img.width / img.height;
        const cr = canvas.width / canvas.height;
        let dw, dh;
        if (ar > cr) { dw = canvas.width * 0.8; dh = dw / ar; }
        else { dh = canvas.height * 0.7; dw = dh * ar; }
        const dx = (canvas.width - dw) / 2;
        const dy = 60;
        ctx.shadowColor = 'rgba(255,255,255,0.1)';
        ctx.shadowBlur = 20;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(dx, dy, dw, dh);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(mem.date, canvas.width / 2, 40);

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, 55);
    ctx.lineTo(canvas.width - 80, 55);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Inter, sans-serif';
    wrapText(ctx, mem.comment, canvas.width - 120).slice(0, 3)
        .forEach((l, li) => ctx.fillText(l, canvas.width / 2, canvas.height - 60 + li * 20));

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`${idx + 1} / ${total}`, canvas.width / 2, canvas.height - 10);
}

window.movieModule = {
    async compileMemories(memories, onProgress) {
        const canvas = document.createElement('canvas');
        canvas.width = 720;
        canvas.height = 540;
        const ctx = canvas.getContext('2d');
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm';
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks = [];

        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

        const videoPromise = new Promise(resolve => {
            recorder.onstop = () => resolve(URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })));
        });

        recorder.start();

        const mems = [...memories].reverse();
        const SPM = 4;
        const FPS = 30;
        const totalFramesAll = mems.length * SPM * FPS;

        for (let idx = 0; idx < mems.length; idx++) {
            const mem = mems[idx];
            const totalFrames = SPM * FPS;
            const img = await loadImage(mem.url);

            for (let f = 0; f < totalFrames; f++) {
                const done = idx * totalFrames + f;
                if (onProgress) onProgress(Math.round((done / totalFramesAll) * 100));
                drawFrame(ctx, canvas, mem, img, idx, mems.length, f, totalFrames);
                await new Promise(r => setTimeout(r, 1000 / FPS));
            }
        }

        if (onProgress) onProgress(100);
        recorder.stop();
        return videoPromise;
    }
};
