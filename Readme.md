# UnaAlDia — Legado Digital ahe

Aplicación web progresiva (PWA) para construir un diario visual: permite guardar fotografías o videos, acompañarlos con una nota y consultar los recuerdos en orden cronológico.

Los datos se guardan primero en el dispositivo y pueden sincronizarse de forma opcional con Google Drive.

## Objetivos

- Registrar recuerdos diarios con una o varias fotografías o videos.
- Organizar y consultar los recuerdos por fecha y álbum.
- Redactar comentarios y conversar sobre los recuerdos con asistencia de IA.
- Generar videos a partir de un rango de recuerdos.
- Mantener la aplicación disponible sin conexión y sincronizar archivos pendientes al recuperar la conexión.
- Permitir la instalación como aplicación en computadoras y dispositivos móviles compatibles.

## Tecnologías

- HTML5, CSS3 y JavaScript ES6+.
- React 18 y ReactDOM, cargados mediante CDN.
- Babel Standalone para transformar JSX en el navegador.
- Tailwind CSS, cargado mediante CDN, y estilos propios en `css/estilos.css`.
- IndexedDB para recuerdos, configuración, álbumes y elementos pendientes de sincronización.
- PWA: `manifest.json`, Service Worker y caché offline-first.
- Google Identity Services y Google Drive API para autorización y respaldo opcional.
- APIs de IA compatibles con Google Gemini, DeepSeek y Alibaba Qwen, con fallback entre proveedores configurados.

No requiere un proceso de compilación ni un gestor de paquetes para ejecutarse: los scripts se cargan directamente desde `index.html`.

## Estructura

```text
/
├── index.html                 # Punto de entrada y carga de dependencias/módulos
├── manifest.json              # Metadatos de la PWA
├── sw.js                      # Service Worker, caché y sincronización diferida
├── css/
│   └── estilos.css            # Estilos propios
├── js/
│   ├── app.js                 # Estado, navegación y coordinación de la aplicación
│   ├── database.js            # Acceso a IndexedDB
│   ├── drive.js               # OAuth, carga y sincronización con Google Drive
│   ├── ai.js                  # Integración con proveedores de IA
│   ├── settings.js            # Valores y normalización de configuración
│   ├── movie.js               # Utilidades de generación de video
│   ├── helpers.js             # Funciones compartidas
│   ├── components.js          # Componentes de interfaz reutilizables
│   ├── capture.js             # Vista de captura de recuerdos
│   ├── history.js             # Vista de historial
│   ├── albums.js              # Vista de álbumes
│   ├── biographer.js          # Vista del Biógrafo IA
│   ├── video.js               # Vista de creación de videos
│   └── modals/                # Diálogos de edición, perfil y eliminación
├── static/                    # Iconos de la PWA
├── img/                       # Recursos gráficos
├── data/                      # Datos JSON de referencia
└── tests/
    └── ai.test.js             # Pruebas del módulo de IA
```

## Configuración opcional

Desde la sección **Configuración** de la aplicación se pueden indicar:

- Un Client ID de OAuth 2.0 de Google y una carpeta de Google Drive para la sincronización.
- Una o más API keys para Gemini, DeepSeek o Qwen.

Para utilizar Google Drive fuera de `localhost`, la aplicación debe servirse por HTTPS y su origen debe estar registrado en las credenciales OAuth de Google Cloud.

## Estado del proyecto

La aplicación se encuentra en una versión funcional de la línea V3, con Service Worker v4.

Están implementados el registro local de recuerdos, historial, álbumes, perfil y configuración, generación de video, funciones de IA, instalación PWA, uso offline y sincronización pendiente con Google Drive. La integración con Drive y los proveedores de IA depende de que cada usuario configure sus propias credenciales.

## Instalación como PWA

Abra la aplicación desde una URL HTTPS en Chrome o Edge y use la opción **Instalar aplicación** o **Agregar a la pantalla principal** del navegador. La disponibilidad de la instalación depende del navegador y del dispositivo.

## Autor

Alejandro Hernández
