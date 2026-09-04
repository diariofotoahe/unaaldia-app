# Arquitectura del Proyecto

## Un Día Una Foto

Versión: V2

---

# Filosofía del proyecto

Este proyecto nació como una aplicación personal para registrar la historia fotográfica diaria.

La prioridad del proyecto es:

- Simplicidad.
- Facilidad de mantenimiento.
- Código claro.
- Evolución gradual.

No se pretende utilizar tecnologías complejas si no aportan un beneficio real.

---

# Organización general

```
index.html
        │
        ▼
React App
        │
        ├── Base de datos
        ├── Interfaz
        ├── Google Drive
        ├── Inteligencia Artificial
        ├── Generador de Video
        └── Configuración
```

---

# Estructura de carpetas

```
UnDiaUnaFoto_v2

index.html

README.md
CHANGELOG.md
ARQUITECTURA.md

manifest.json
sw.js

css/
    estilos.css

js/

data/
    memories.json
    settings.json

img/
```

---

# Responsabilidad de cada carpeta

## css

Contiene únicamente hojas de estilo.

No debe contener JavaScript.

---

## js

Contendrá toda la lógica de la aplicación.

Se dividirá en módulos independientes.

---

## data

Archivos JSON utilizados por la aplicación.

---

## img

Logotipos e imágenes utilizadas por la aplicación.

---

# Módulos previstos

En las siguientes fases se crearán los siguientes módulos:

bootstrap.js

Inicialización general.

---

database.js

Acceso a IndexedDB.

---

drive.js

Sincronización con Google Drive.

---

ai.js

Funciones relacionadas con IA.

---

movie.js

Generación de videos.

---

components.jsx

Componentes React reutilizables.

---

helpers.js

Funciones auxiliares.

---

app.jsx

Aplicación principal.

---

# Reglas del proyecto

1. Un archivo debe tener una única responsabilidad.

2. No duplicar código.

3. Mantener nombres descriptivos.

4. Toda modificación deberá mantener la funcionalidad existente.

5. Antes de iniciar una nueva fase, verificar que la aplicación continúe funcionando.

6. Documentar los cambios importantes.

---

# Estado actual

Fase 2A

Documentación del proyecto.

La aplicación mantiene la misma funcionalidad que la versión original.

## Reglas de modularización

Durante la migración de la V2 se establece la siguiente regla:

- Los archivos que contienen únicamente JavaScript se cargan con:

```html
<script src="js/archivo.js"></script>

Esa será una **regla permanente de la arquitectura** de la V2.