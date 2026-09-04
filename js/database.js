// ═══════════════════════════════════════════════════════════
// database.js
// Módulo de acceso a IndexedDB
// ═══════════════════════════════════════════════════════════

const DB_NAME = 'unaaldia_db';
const DB_VERSION = 3;

const PENDING_STORE  = 'pending_uploads';
const MEMORIES_STORE = 'local_memories';
const CONFIG_STORE   = 'app_config';
const FOLDERS_STORE  = 'user_folders';

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
            const db = e.target.result;

            if (!db.objectStoreNames.contains(PENDING_STORE))
                db.createObjectStore(PENDING_STORE, { keyPath: 'id' });

            if (!db.objectStoreNames.contains(MEMORIES_STORE))
                db.createObjectStore(MEMORIES_STORE, { keyPath: 'id' });

            if (!db.objectStoreNames.contains(CONFIG_STORE))
                db.createObjectStore(CONFIG_STORE, { keyPath: 'key' });

            if (!db.objectStoreNames.contains(FOLDERS_STORE))
                db.createObjectStore(FOLDERS_STORE, { keyPath: 'name' });
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// ───────────────── Memories ─────────────────

async function idbGetAllMemories() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const req = db.transaction(MEMORIES_STORE, 'readonly')
            .objectStore(MEMORIES_STORE)
            .getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

async function idbSaveMemory(memory) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(MEMORIES_STORE, 'readwrite');

        tx.objectStore(MEMORIES_STORE).put(memory);

        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

async function idbDeleteMemory(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(MEMORIES_STORE, 'readwrite');

        tx.objectStore(MEMORIES_STORE).delete(id);

        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

// ───────────────── Pending uploads ─────────────────

async function idbSavePending(entry) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(PENDING_STORE, 'readwrite');

        tx.objectStore(PENDING_STORE).put(entry);

        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

async function idbGetAllPending() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const req = db.transaction(PENDING_STORE, 'readonly')
            .objectStore(PENDING_STORE)
            .getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

async function idbDeletePending(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(PENDING_STORE, 'readwrite');

        tx.objectStore(PENDING_STORE).delete(id);

        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

// ───────────────── Config ─────────────────

async function idbGetConfig(key) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const req = db.transaction(CONFIG_STORE, 'readonly')
            .objectStore(CONFIG_STORE)
            .get(key);

        req.onsuccess = () => resolve(req.result ? req.result.value : null);
        req.onerror = () => reject(req.error);
    });
}

async function idbSetConfig(key, value) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(CONFIG_STORE, 'readwrite');

        tx.objectStore(CONFIG_STORE).put({ key, value });

        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

// ───────────────── Folders ─────────────────

async function idbGetAllFolders() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const req = db.transaction(FOLDERS_STORE, 'readonly')
            .objectStore(FOLDERS_STORE)
            .getAll();

        req.onsuccess = () => resolve((req.result || []).map(f => f.name));
        req.onerror = () => reject(req.error);
    });
}

async function idbSaveFolder(name) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(FOLDERS_STORE, 'readwrite');

        tx.objectStore(FOLDERS_STORE).put({ name });

        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

async function idbDeleteFolder(name) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(FOLDERS_STORE, 'readwrite');

        tx.objectStore(FOLDERS_STORE).delete(name);

        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

// ───────────────── Exportar al ámbito global ─────────────────

window.openDB = openDB;

window.idbGetAllMemories = idbGetAllMemories;
window.idbSaveMemory = idbSaveMemory;
window.idbDeleteMemory = idbDeleteMemory;

window.idbSavePending = idbSavePending;
window.idbGetAllPending = idbGetAllPending;
window.idbDeletePending = idbDeletePending;

window.idbGetConfig = idbGetConfig;
window.idbSetConfig = idbSetConfig;

window.idbGetAllFolders = idbGetAllFolders;
window.idbSaveFolder = idbSaveFolder;
window.idbDeleteFolder = idbDeleteFolder;
