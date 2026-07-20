# Cuidador Familiar — CLAUDE.md

App web para hijos/cuidadores de personas mayores con deterioro cognitivo.
Desplegada en **https://cuidador-familiar.vercel.app**

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Estilos | Tailwind CSS 3 — colores custom: `sage`, `beige`, `warm`, `sky`, `rose` |
| Base de datos | Supabase (Postgres + Realtime) |
| IA | OpenAI `gpt-4o-mini` vía SDK `openai` v4 |
| Iconos | lucide-react |
| Gráficos | recharts |
| Deploy | Vercel (push a `master` → deploy automático) |

---

## Estructura de carpetas

```
src/
├── app/
│   ├── page.tsx                        # Página "Hoy" (raíz). IDs: #medicacion, #tareas, #citas
│   ├── historial/page.tsx              # Historial; acepta ?tab=medicacion|tareas|citas
│   ├── guia/page.tsx                   # Guía de uso para nuevos usuarios + chat IA
│   ├── perfil/page.tsx                 # Perfil del familiar (localStorage)
│   ├── asistente/page.tsx              # Chat IA general
│   ├── que-hago-si/page.tsx            # Consulta por situación + voz
│   ├── bienestar/page.tsx              # Check-in emocional del cuidador
│   ├── emergencias/page.tsx            # Contactos de emergencia + SOS
│   ├── grupo/page.tsx                  # Sincronización familiar (Supabase)
│   └── api/
│       ├── chat/route.ts               # POST → OpenAI (asistente general)
│       ├── chat-guia/route.ts          # POST → OpenAI (ayuda sobre la app)
│       └── consulta-situacion/route.ts # POST → OpenAI (consulta puntual + voz)
├── components/
│   ├── layout/
│   │   ├── Header.tsx                  # Cabecera cálida (warm-600→warm-300); en home: icono HeartHandshake + enlaces "Ebook" (PDF directo) y "Ayuda"
│   │   ├── BottomNav.tsx               # Nav inferior 5 pestañas + badges (perfil incompleto, tareas asignadas a ti) — emojis
│   │   └── SosButton.tsx               # Botón flotante rojo SOS (oculto en /emergencias)
│   ├── hoy/
│   │   ├── MedicacionSection.tsx
│   │   ├── TareasSection.tsx
│   │   ├── CitasSection.tsx
│   │   ├── MensajeDiario.tsx
│   │   └── TarjetaGuia.tsx             # Tarjeta "¿Primera vez?" (sesión, no persistida)
│   ├── asistente/
│   │   └── ChatInterface.tsx           # Props: endpoint?, mensajeInicial?
│   ├── bienestar/
│   │   ├── CheckinDiario.tsx
│   │   └── GraficoSemanal.tsx
│   ├── que-hago-si/
│   │   └── OtraSituacion.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useMedicacion.ts                # Supabase + localStorage; expone medicaciones (hoy) y medicacionesRecientes (60 días)
│   ├── useTareas.ts                    # Supabase + localStorage; expone tareas (hoy) y tareasRecientes (3 días). Asignación (asignadaA), quién la pidió (creadaPor) y archivado individual (ocultas, localStorage cf_tareas_ocultas)
│   ├── useCitas.ts                     # Supabase + localStorage; últimos 7 días + futuro
│   ├── useGrupo.ts                     # Gestión de sesión grupal
│   ├── useMiembros.ts                  # Lista de nombres de miembros del grupo (para asignar tareas)
│   ├── useBienestar.ts                 # Check-in emocional, solo localStorage
│   └── useLocalStorage.ts              # Helper genérico
├── data/
│   ├── situaciones.ts                  # Catálogo de situaciones difíciles (qué hago si)
│   └── conocimientos.ts                # Base de conocimiento del asistente IA
├── types/index.ts                      # Interfaces TypeScript de todos los modelos
└── lib/
    ├── supabase.ts                     # Cliente Supabase (sin auth)
    └── utils.ts                        # cn(), formatearFechaCorta(), diasHasta()
```

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

Configurar en Vercel: **Settings → Environment Variables → Production**.
Para rotar `OPENAI_API_KEY`: `vercel env rm OPENAI_API_KEY production --yes` → `vercel env add OPENAI_API_KEY production`.

---

## APIs de IA

### `POST /api/chat`
Asistente general multi-turno para el cuidador.
- Modelo: `gpt-4o-mini` · `max_tokens: 280` · `temperature: 0.6`
- Historial: últimos 10 mensajes
- Body: `{ mensajes: [{ rol: "usuario"|"asistente", texto: string }] }`
- Response: `{ respuesta: string }` | `{ error: string }`

### `POST /api/chat-guia`
Chat especializado en explicar la propia app (usado en `/guia`).
- Modelo: `gpt-4o-mini` · `max_tokens: 300` · `temperature: 0.5`
- System prompt: describe todas las secciones, redirige preguntas off-topic, máx. 200 palabras
- Mismo body/response que `/api/chat`

### `POST /api/consulta-situacion`
Consulta puntual por situación concreta (también desde micrófono vía Web Speech API).
- Modelo: `gpt-4o-mini` · `max_tokens: 350` · `temperature: 0.5`
- Body: `{ situacion: string }`
- Response: `{ respuesta: string }` | `{ error: string }`

Todas las rutas tienen `try/catch` completo y devuelven `{ error }` en JSON ante cualquier fallo.

---

## Persistencia de datos

| Dato | Sin grupo (local) | Con grupo (Supabase) |
|------|------------------|---------------------|
| Medicaciones | `cf_medicaciones` | tabla `medicaciones` |
| Tareas | `cf_tareas` | tabla `tareas` |
| Citas | `cf_citas` | tabla `citas` |
| Perfil | `cf_perfil` | solo local (privado) |
| Bienestar | `cf_bienestar` | solo local (privado) |

Supabase sin auth (`persistSession: false`). El grupo se identifica por `grupo_id` (UUID compartido). Los hooks suscriben a Realtime para sincronización instantánea.

**Formato clave de toma:** `completadasEn: string[]` → cada elemento es `"YYYY-MM-DD_HH:mm"`.

**Tabla `tareas`:** además de lo básico tiene `asignada_a` (persona del grupo, o vacío = libre), `completada_por` (quién la marcó hecha) y `creada_por` (quién la pidió — columna añadida vía migración manual en el SQL Editor de Supabase, ver `supabase-schema.sql`).

---

## Patrones críticos

### Componentes dentro de componentes → PROHIBIDO
Causa que React destruya el componente en cada render (focus perdido en inputs). Todos los sub-componentes van a nivel de módulo. Ejemplo: `Campo` en `src/app/perfil/page.tsx`.

### Puntuación de bienestar
`useBienestar.ts`: las preguntas **positivas** usan `6 - valor` en el cálculo del total; solo `tesSientesAgotado` (invertida) suma el valor directo. Total: 4 = mejor, 20 = peor. Umbrales: ≤10 = "bajo", ≤16 = "moderado", >16 = "alto".

### Scroll en ChatInterface
Usa `scrollAreaRef` + `el.scrollTop = el.scrollHeight` sobre el contenedor con overflow. **No usar** `scrollIntoView` (desplaza toda la página).

### Actualización optimista
`toggleTomaDia`, `toggleCompletar` y similares actualizan el estado local antes de sincronizar con Supabase.

### Colores de sección en página Hoy
- Medicación → `bg-sky-50` · `id="medicacion"` · historial `?tab=medicacion`
- Tareas → `bg-sage-50` · `id="tareas"` · historial `?tab=tareas`
- Citas → `bg-amber-50` · `id="citas"` · historial `?tab=citas`

### BottomNav
Usa emojis (no lucide-react). La página `/guia` replica este estilo en sus tarjetas de sección.

### Canales de Supabase Realtime — nombre único por instancia de hook
Si el mismo hook (p.ej. `useTareas`) se monta dos veces a la vez (ej. `TareasSection` en Hoy + `BottomNav` en el layout global), **no** uses `channel-${grupoId}` a secas: Supabase reutiliza el canal si el nombre coincide, y añadir un segundo `.on()` a un canal ya suscrito lanza un error real que rompe la página. Incluir un `useId()` de React en el nombre del canal (ya hecho en `useTareas.ts`).

### Paleta `warm` incompleta — cuidado con los degradados
`tailwind.config.ts` solo define `warm.50/100/200/300/500/600` (**no existe `warm-400`**). Usar una clase con un tono no definido no da error visible: Tailwind simplemente no genera la utilidad y el degradado se desvanece a transparente. Si se usa `warm` en un `bg-gradient-to-*`, verificar visualmente el resultado.

---

## Comandos

```bash
npm run dev      # desarrollo en localhost:3000
npm run build    # build de producción (verifica TypeScript)
npm run lint     # ESLint
git push         # despliega automáticamente a Vercel
```

---

## Última sesión (2026-07-20, sesión larga)

- **Bug de guardado en producción**: el proyecto de Supabase estaba pausado (free tier, inactividad) → DNS no resolvía → nada se guardaba en modo grupo. Se reactivó desde el dashboard de Supabase. De paso se corrigió que `agregar()` en `useMedicacion.ts`/`useCitas.ts`/`useTareas.ts` no actualizaba el estado local (dependía solo de Realtime, poco fiable en móvil) — ahora usan `.select().single()` y actualizan al instante.
- **Asignación de tareas en grupo**: nuevo hook `useMiembros.ts`; `TareasSection.tsx` permite asignar cada tarea a una persona del grupo o dejarla "Libre", con aviso (banner + punto en pestaña Hoy) para quien tiene tareas asignadas.
- **Quién pide/completa/archiva una tarea**: campo `creadaPor` (columna `creada_por`, migración manual ya aplicada), chip sutil "Pedido por X" (oculto si eres tú), y botón para archivar individualmente una tarea completada (`cf_tareas_ocultas` en localStorage, solo afecta a tu dispositivo).
- **Favicon + identidad visual cálida**: `src/app/icon.png` + `apple-icon.png` + `public/icon-*.png` (corazón blanco sobre degradado ámbar). `Header.tsx` y el hero de `page.tsx` pasaron de sage/sky a degradado `warm-600→warm-300`, icono `HeartHandshake`, y el hero ahora usa una foto real (`public/hero-cuidado.jpg`, comprimida a ~155KB) con velo oscuro para legibilidad.
- **Historial**: pestaña activa (Tareas/Medicación/Citas) con borde negro fino; corregido que los botones de período (1/3/6/12 meses) no afectaban a la vista Calendario (usaba un rango `calDesde`/`calHasta` independiente, siempre 12 meses) — ahora ambas vistas quedan coordinadas.
- **Ebook**: enlace "Ebook" en el header (junto a "Ayuda", solo en Hoy) → `public/ebook-cuidador-familiar.pdf`, abre directo en pestaña nueva. El PDF se optimizó de 8.6MB a 5.1MB (dos imágenes se guardaban sin comprimir) y se le añadió una página final (102 en total) con enlaces reales a la app y a un artículo en tograndparents.com.
- **Promoción cruzada con tograndparents.com** (web WordPress externa del usuario, no forma parte de este repo): artículo, bloque en la home y enlace en el PDF — detalles completos en la memoria del proyecto (`tograndparents_promotion_project` / `tograndparents_wordpress_access`), no en este archivo.

> Historial completo de cambios: `git log --oneline`

---

## Tareas pendientes

### Ampliar corrección de tareas más allá de 3 días
**Por qué:** `useTareas.ts` solo expone `tareasRecientes` (3 días) para el panel de corrección. Los usuarios no pueden corregir olvidos de más de 3 días atrás.
**Cómo:** Ampliar la ventana a 60 días igual que `useMedicacion.ts` (que ya expone `medicacionesRecientes`). Actualizar el panel de corrección en `TareasSection.tsx` para mostrar selector de fecha libre igual que el de medicación.

### Persistir perfil en Supabase para grupos
**Por qué:** El perfil (`cf_perfil`) es solo localStorage, invisible para otros miembros del grupo aunque compartan `grupo_id`.
**Cómo:** Añadir tabla `perfiles` en Supabase con columna `grupo_id`. Crear hook `usePerfil.ts` siguiendo el patrón de `useMedicacion.ts`. Decisión pendiente: ¿un perfil por grupo o uno por dispositivo?

### Reconexión de Supabase Realtime
**Por qué:** Los hooks suscriben al canal Realtime pero no gestionan errores ni reconexión. En conexión intermitente (móvil) los cambios de otros miembros no se reciben.
**Cómo:** Añadir handler de error en `channel.subscribe()` con reconexión exponencial. Probar con DevTools → Network → Offline/Online.
