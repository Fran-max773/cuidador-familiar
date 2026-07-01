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
│   │   ├── Header.tsx                  # Cabecera: ← atrás en sub-páginas, "? Ayuda" en home
│   │   ├── BottomNav.tsx               # Nav inferior 5 pestañas + badge perfil (emojis)
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
│   ├── useTareas.ts                    # Supabase + localStorage; expone tareas (hoy) y tareasRecientes (3 días)
│   ├── useCitas.ts                     # Supabase + localStorage; últimos 7 días + futuro
│   ├── useGrupo.ts                     # Gestión de sesión grupal
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

---

## Comandos

```bash
npm run dev      # desarrollo en localhost:3000
npm run build    # build de producción (verifica TypeScript)
npm run lint     # ESLint
git push         # despliega automáticamente a Vercel
```

---

## Trabajo completado

- [x] Hero banner full-width en página principal
- [x] Navegación: Header con ← atrás y botón "? Ayuda" en home, BottomNav 5 pestañas, badge perfil
- [x] Botón SOS flotante (oculto en /emergencias)
- [x] Impresión A4 landscape del historial (vista lista y calendario)
- [x] Reconocimiento de voz (Web Speech API) en consulta de situación
- [x] Rutas API de IA con try/catch completo
- [x] Fix focus perdido en inputs de Perfil
- [x] Citas realizadas: círculo-check + opacity + line-through
- [x] Urgencia en tareas: botón ⚠ toggle + badge rojo
- [x] Panel corrección de tomas: 7 días automáticos + selector de fecha libre (60 días atrás)
- [x] Panel corrección de tareas de días anteriores (3 días)
- [x] Aviso en Citas con citas pasadas sin confirmar
- [x] Separación visual de secciones en Hoy con bandas de color y IDs de anclaje
- [x] Enlace al historial al pie de cada sección → pestaña correcta (`?tab=`)
- [x] Página `/guia` con emojis estilo footer, textos grandes, chat IA especializado
- [x] `TarjetaGuia` descartable (solo sesión) en página Hoy
- [x] Historial muestra rango de fechas activo bajo los botones de período
- [x] Fix puntuación de bienestar: preguntas positivas usaban la escala invertida

## Tareas pendientes

- [ ] Ampliar corrección de tareas más allá de 3 días en Supabase (actualmente limitado por el hook)
- [ ] Considerar persistencia del perfil en Supabase para grupos familiares
- [ ] Revisar comportamiento del Realtime de Supabase en conexión intermitente
