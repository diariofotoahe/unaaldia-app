# MAPA DEL CÓDIGO — UnaAlDia

Mapa actualizado de los módulos que se cargan desde `index.html`. La aplicación usa JavaScript global y JSX transformado en el navegador con Babel; no utiliza un empaquetador ni módulos ES.

```text
index.html
│
├── Inicialización PWA
│   ├── Registra sw.js
│   ├── Recibe avisos de actualización y sincronización diferida
│   └── Expone registerDriveSync()
│
├── helpers.js                  # Utilidades compartidas
│   ├── isVideo(url, mime)
│   ├── getMediaUrl(memory)
│   ├── generateId()
│   ├── fmtTime() / fmtDate(date)
│   ├── fileToBase64(file)
│   ├── getViewBg(view, darkMode)
│   └── Clases visuales: panel, texto, input y botón
│
├── database.js                 # Persistencia local (IndexedDB)
│   ├── local_memories          # Recuerdos
│   ├── pending_uploads         # Archivos pendientes de Drive
│   ├── app_config              # Perfil y configuración
│   └── user_folders            # Álbumes/carpetas
│
├── drive.js                    # Google Drive
│   └── window.driveModule
│       ├── init() / connect() / disconnect()
│       ├── setFolderSetting() / ensureFolder()
│       ├── uploadFile()
│       └── syncPending()
│
├── ai.js                       # Proveedores de IA
│   └── window.aiModule
│       ├── callGoogleGemini()
│       ├── callDeepSeek()
│       ├── callQwen()
│       └── callWithFallback()  # Gemini → DeepSeek → Qwen
│
├── settings.js                 # Perfil, configuración y tema
│   └── window.settingsModule
│       ├── createDefaultSettings()
│       ├── createUserForm() / createConfigForm()
│       ├── normalizeSettings()
│       ├── buildProfilePayload() / buildConfigPayload()
│       └── getThemeMode()
│
├── movie.js                    # Compilación de video en el navegador
│   └── window.movieModule.compileMemories()
│       └── Canvas + MediaRecorder → archivo WebM
│
├── components.js               # Componentes reutilizables y modales generales
│   ├── SectionPanel / ActionButton / EmptyState
│   ├── AppTabs / ToastContainer / SplashScreen / WelcomeBanner
│   ├── MediaPreview            # Selecciona img o video
│   ├── FullscreenModal / MoviePlayerModal
│   └── ConfigModal
│
├── modals/
│   ├── edit-memory-modal.js    # EditMemoryModal
│   ├── profile-modal.js        # ProfileModal
│   └── confirm-delete-modal.js # ConfirmDeleteModal
│
├── Vistas React (JSX)
│   ├── capture.js              # CaptureView
│   ├── history.js              # HistoryView
│   ├── albums.js               # AlbumsView
│   ├── biographer.js           # BiographerView
│   └── video.js                # VideoView
│
└── app.js                      # App: estado global y orquestación
    ├── Carga datos desde IndexedDB e inicializa Drive
    ├── Guarda, edita y elimina recuerdos
    ├── Gestiona conexión, cola de sincronización y PWA
    ├── Coordina IA, Biógrafo y generación de película
    ├── Gestiona perfil, configuración y modales
    └── Renderiza encabezado, navegación y las 5 vistas
```

## Flujo principal

```text
Usuario
  → CaptureView
  → App.handleSaveDay()
  → IndexedDB (recuerdo local)
  → Google Drive, si está conectado y hay red
  → pending_uploads, si el envío no puede completarse
  → driveModule.syncPending() al recuperar conexión
```

## Vistas y contratos de props

```text
CaptureView({ dm, folders, capture, actions })
  capture: { date, folder, comment, photos, isSaving, isAiTyping }
  actions: { setDate, setFolder, setComment, removePhoto, uploadFiles,
             saveDay, aiEnhance }

HistoryView({ dm, memories, actions })
  actions: { onFullscreen, onEdit, onDeleteDay, onDeleteSingle }

AlbumsView({ dm, folders, memories, onCreateFolder })

BiographerView({ dm, hasApiKey, chat, actions })
  chat:    { messages, userInput, isTyping }
  actions: { setUserInput, sendMessage, chatEndRef }

VideoView({ dm, movie, actions })
  movie:   { dateFrom, dateTo, script, isGenScript, isCreating, progress }
  actions: { setDateFrom, setDateTo, generateScript, createMovie }
```

## Dependencias y orden de carga

`index.html` debe conservar este orden: utilidades → almacenamiento → integraciones (`drive`, `ai`, `settings`, `movie`) → componentes/modales → vistas → `app.js`.

Los archivos con JSX se cargan con `type="text/babel"` y el preset `custom-preset`. Los módulos sin JSX se cargan como scripts normales. Todos exponen sus funciones o componentes en `window`, por lo que el orden de carga es significativo.

## Service Worker

`sw.js` implementa una estrategia offline-first:

- Precarga el shell de la aplicación y recursos CDN.
- Sirve el shell y los recursos estáticos desde caché cuando están disponibles.
- Excluye OAuth, Google APIs y DeepSeek de la caché.
- Conserva medios remotos en una caché separada.
- Notifica a la aplicación para sincronizar elementos pendientes mediante Background Sync cuando el navegador lo permite.

## Estado actual

La separación de vistas, utilidades, almacenamiento, integración de IA, configuración, Drive y generación de video ya está realizada. `app.js` mantiene intencionalmente la coordinación del estado global y los handlers transversales; no está pendiente de extraerse desde `index.html`.
