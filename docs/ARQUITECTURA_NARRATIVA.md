# 📖 Propuesta de Mejora: Arquitectura de Objetos Narrativos, Feedback Loop & Agente de Persistencia

Este documento detalla la propuesta técnica para enriquecer el motor narrativo de **Tudex Book Builder**, estructurando los datos y prompts mediante Objetos Narrativos, Métricas de Relación, Rastreo de Subtramas y un **Agente Autónomo de Persistencia de Estado**.

---

## 🏛️ 1. Objetos Narrativos Principales

### 1.1. Objeto Entidad (Personajes) con Métricas de Polaridad
Permite que el modelo mantenga coherencia conductual y evolución emocional entre capítulos.
- **Propiedades**:
  - `id`: Identificador único del personaje.
  - `name`: Nombre completo.
  - `archetype`: Arquetipo o rol dramático (ej: *Héroe renuente*, *Mentor enigmático*).
  - `emotionalState`: Estado emocional actual en la escena (ej: *Acorralado*, *Eufórico*, *Melancólico*).
  - `knownSecrets`: Lista de información o secretos clave que posee.
  - `activeRelationships`: Vínculos con métricas cuantitativas:
    - `targetCharacterId`: ID del personaje destino.
    - `relationType`: Tipo de relación (ej: *Rivalidad silenciada*).
    - `trustLevel`: Nivel de confianza cuantitativo (`0 - 100`).
    - `tensionLevel`: Tensión dramática (`baja` | `media` | `alta` | `extrema`).
    - `polarity`: Nivel de simpatía o conflicto (`-100` hostil a `+100` aliado).

### 1.2. Objeto Ítem / Artefacto (Elementos Clave)
Introduce objetos físicos con peso simbólico que desencadenan o resuelven subtramas.
- **Propiedades**:
  - `id`: Identificador único del objeto.
  - `name`: Nombre del ítem o artefacto.
  - `physicalDescription`: Aspecto sensorial e inspeccionable.
  - `symbolism`: Significado alegórico o narrativo.
  - `currentOwnerId`: ID del personaje poseedor (o `null` si está en el entorno).
  - `status`: Estado actual (`intacto`, `roto`, `oculto`, `encantado`, `robado`).

### 1.3. Objeto Escena / Contexto & Rastreador de Subtramas
Fija el escenario físico y rastrea hilos narrativos globales para evitar la "ceguera" a largo plazo:
- `location`: Ubicación espacial precisa.
- `weather`: Clima, iluminación y condiciones ambientales.
- `dramaticTension`: Intensidad dramática de la escena (escala de 1 a 10).
- `activeWorldRules`: Reglas del universo activas.
- `globalSubplots`: Rastreador de promesas narrativas e hilos secundarios abiertos:
  - `id`: ID único del hilo.
  - `description`: Promesa o misterio a resolver.
  - `status`: `abierto` | `intensificado` | `resuelto`.
  - `introducedInChapter`: Capítulo donde surgió.

---

## ⚡ 2. Estrategia de Parámetros Literarios & Agente de Persistencia

### 2.1. Vector de Estado Acotado (*Bounded State Vector*)
Inyecta únicamente los objetos relevantes en escena + el vector de subtramas activas para prevenir desbordamientos de contexto y mantener coherencia total.

### 2.2. Parámetro de Ritmo (*Pacing*)
- `exposition`: Ritmo pausado y contemplativo.
- `conflict`: Ritmo dinámico y diálogos cortantes.
- `climax`: Máxima aceleración y urgencia.
- `resolution`: Cierre y consolidación de arcos.

### 2.3. Directriz *Show, Don't Tell* (Muestra, no cuentes)
Transmite estados emocionales mediante microexpresiones físicas, tensión muscular e interacción con objetos.

### 2.4. 🔄 Agente Autónomo de Persistencia de Estado (*State Persistence Agent*)
Al finalizar la redacción de cada capítulo:
1. Un proceso secundario en `/api/generate/chapter` analiza el texto narrativo generado.
2. Identifica mutaciones automáticas de estado (ej: el personaje pasa de *Confundido* a *Decidido*, el ítem pasa a *roto*, o surge una nueva promesa narrativa).
3. Actualiza y persiste automáticamente los objetos JSON en disco (`novela_base.json` / `novela_completa.json`), alimentando al capítulo posterior con el estado actualizado.
