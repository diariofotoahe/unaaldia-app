# Historial de Cambios

## V2

### Etapa 1

- CSS separado del archivo principal.
- Creado css/estilos.css

---

### Etapa 2A

- Creado README.md
- Creado CHANGELOG.md
- Definida arquitectura del proyecto

---

### Próximas etapas

- Separación del JavaScript
- Separación de componentes React
- Organización de IndexedDB
- Organización de Google Drive
- Organización de IA


## V2 - Fase 2C

- Se extrajo el módulo Google Drive a js/drive.js.
- Se eliminó el código correspondiente de index.html.
- Se verificó el funcionamiento sin cambios en la lógica.

## V2 - Fase 2D

- Se extrajeron los componentes visuales (Toast, SplashScreen y WelcomeBanner) a js/components.js.
- Se identificó que los archivos con JSX deben cargarse mediante type="text/babel".
- Se verificó el funcionamiento correcto de la aplicación.

## v3 - Refactorización de vistas y helpers

- `getMediaUrl` y `getViewBg` movidos a `helpers.js`
- `CaptureView`: props agrupadas en `capture` + `actions` (17 → 4)
- `HistoryView`: props agrupadas en `actions` (7 → 3); JSX corregido; acciones reconectadas
- Nuevo `MediaPreview` en `components.js` (elimina duplicación img/video)
- Extraídas vistas: `albums.js`, `biographer.js`, `video.js`
- `ai.js` reescrito como módulo `aiModule.callDeepSeek`
- Eliminados scripts rotos: `app.js` (JSX inválido), referencias a `movie.js`/`settings.js` inexistentes
- Actualizado `MAPA_DEL_CÓDIGO.md`

## v3 - Refactorización visual y de arquitectura

- Se consolidaron helpers reutilizables en `helpers.js` para estilos, clases de panel, entradas y botones.
- Se separaron componentes de UI reutilizables en `components.js` (`SectionPanel`, `ActionButton`, `EmptyState`).
- `CaptureView` y `HistoryView` ahora consumen esos componentes para reducir JSX repetido y simplificar el árbol.
- Se actualizó el mapa de código para reflejar la estructura real del proyecto.

## v3 - Plan de trabajo (completado parcialmente)

revisar el proyecto completo y elaborar un mapa como este:

index.html
│
├── helpers.js
│   ├── isVideo()
│   ├── getMediaUrl()
│   ├── generateId()
│   ├── fmtDate()
│   └── ...
│
├── capture.js
│   └── CaptureView
│
├── history.js
│   └── HistoryView
│
├── albums.js
│   └── AlbumsView
│
├── biographer.js
│   └── BiographerView
│
├── video.js
│   └── VideoView
│
└── App
    ├── estados (useState)
    ├── useEffect
    ├── navegación
    └── render

    detectar
código duplicado
funciones que ya no se usan
props innecesarias
funciones que pertenecen a helpers.js
funciones que deben quedarse en App
componentes que conviene separar

corregir:

CaptureView recibe demasiadas props.
HistoryView también recibe demasiadas.
getMediaUrl no debería vivir dentro de App.
Hay varias funciones repetidas.
Hay JSX que puede simplificarse bastante.