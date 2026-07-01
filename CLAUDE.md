# Cuidador Familiar — CLAUDE.md

App web para hijos/cuidadores de personas mayores con deterioro cognitivo.
Desplegada en **https://cuidador-familiar.vercel.app**

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Estilos | Tailwind CSS 3 con colores custom: `sage`, `beige`, `warm`, `sky`, `rose` |
| Base de datos | Supabase (Postgres + Realtime) |
| IA | OpenAI `gpt-4o-mini` vía SDK `openai` v4 |
| Iconos | lucide-react |
| Gráficos | recharts |
| Deploy | Vercel (push a `master` → deploy automático) |

---

## Estructura de carpetas relevante

```
src/
├── app/
│   ├── page.tsx                  # Página "Hoy" (raíz)
│   ├── historial/page.tsx        # Historial con tabs; acepta ?tab=medicacion|tareas|citas
│   ├── perfil/page.tsx           # Perfil del familiar (localStorage)
│   ├── asistente/page.tsx        # Chat IA
│   ├── que-hago-si/page.tsx      # Consulta por situación + voz
│   ├── bienestar/page.tsx        # Check-in emocional del cuidador
│   ├── emergencias/page.tsx      # Contactos de emergencia + SOS
│   ├── grupo/page.tsx            # Sincronización familiar (Supabase)
│   └── api/
│       ├── chat/route.ts         # POST → OpenAI chat
│       └── consulta-situacion/route.ts  # POST → OpenAI consulta puntual
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Cabecera con botón ← atrás
│   │   ├── BottomNav.tsx         # Nav inferior 5 pestañas + badge perfil
│   │   └── SosButton.tsx         # Botón flotante rojo SOS
│   ├── hoy/
│   │   ├── MedicacionSection.tsx
│   │   ├── TareasSection.tsx
│   │   ├── CitasSection.tsx
│   │   └── MensajeDiario.tsx
│   ├── asistente/
│   │   └── ChatInterface.tsx
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
│   ├── useMedicacion.ts          # Supabase + localStorage, 60 días
│   ├── useTareas.ts              # Supabase + localStorage, 3 días
│   ├── useCitas.ts               # Supabase + localStorage, 7 días
│   ├── useGrupo.ts               # Gestión de sesión grupal
│   ├── useBienestar.ts           # Check-in emocional, solo localStorage
│   └── useLocalStorage.ts        # Helper genérico
├── types/index.ts                # Interfaces TypeScript de todos los modelos
└── lib/
    ├── supabase.ts               # Cliente Supabase (sin auth)
    └── utils.ts                  # cn(), formatearFechaCorta(), diasHasta()
```

---

## Variables de entorno

```env
# .env.local (desarrollo)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

En Vercel: configurar las mismas tres variables en **Settings → Environment Variables → Production**.
Para actualizar `OPENAI_API_KEY` en Vercel: `vercel env rm OPENAI_API_KEY production --yes` y luego `vercel env add OPENAI_API_KEY production`.

---

## APIs de IA

### `POST /api/chat`
Chat multi-turno para el asistente del cuidador.
- Modelo: `gpt-4o-mini`
- `max_tokens: 280`, `temperature: 0.6`
- Historial: últimos 10 mensajes
- Body: `{ mensajes: [{ rol: "usuario"|"asistente", texto: string }] }`
- Response: `{ respuesta: string }` | `{ error: string }`

### `POST /api/consulta-situacion`
Consulta puntual sobre una situación concreta (también usada desde micrófono vía Web Speech API).
- Modelo: `gpt-4o-mini`
- `max_tokens: 350`, `temperature: 0.5`
- Body: `{ situacion: string }`
- Response: `{ respuesta: string }` | `{ error: string }`

Ambas rutas tienen `try/catch` completo: errores de parseo JSON y errores de OpenAI devuelven JSON con `{ error }` en lugar de respuesta vacía.

---

## Persistencia de datos

| Dato | Sin grupo (local) | Con grupo (Supabase) |
|------|------------------|---------------------|
| Medicaciones | `cf_medicaciones` en localStorage | tabla `medicaciones` |
| Tareas | `cf_tareas` en localStorage | tabla `tareas` |
| Citas | `cf_citas` en localStorage | tabla `citas` |
| Perfil | `cf_perfil` en localStorage | solo local (privado) |
| Bienestar | `cf_bienestar` en localStorage | solo local |

Supabase no usa autenticación (`persistSession: false`). El grupo se identifica por `grupo_id` (UUID compartido). Todos los hooks suscriben a Realtime para sincronización instantánea entre miembros del grupo.

### Formato clave de toma de medicación
`completadasEn: string[]` — cada elemento es `"YYYY-MM-DD_HH:mm"` (fecha + hora separadas por `_`).

---

## Patrones importantes

### Componentes dentro de componentes → PROHIBIDO
Definir un componente dentro de otro causa que React lo destruya en cada render (focus perdido en inputs). Todos los sub-componentes deben ir a nivel de módulo. Ver `src/app/perfil/page.tsx` → `Campo` definido fuera de `PerfilPage`.

### Hooks: datos de hoy vs. datos recientes
- `medicaciones` = solo hoy (sección principal sin cambios)
- `medicacionesRecientes` = últimos 60 días (panel de corrección)
- `tareas` = solo hoy; `tareasRecientes` = últimos 3 días (panel de corrección)
- `citas` = últimos 7 días + futuro

### Colores de sección en página Hoy
Cada sección tiene su propio fondo y enlace al historial con pestaña pre-seleccionada:
- Medicación → `sky-50` · `?tab=medicacion`
- Tareas → `sage-50` · `?tab=tareas`
- Citas → `amber-50` · `?tab=citas`

### Actualización optimista
`toggleTomaDia`, `toggleCompletar` y similares actualizan el estado local primero y luego sincronizan con Supabase para UX inmediata sin esperar red.

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
- [x] Navegación: botón ← atrás en Header, BottomNav con 5 pestañas, badge de perfil sin rellenar
- [x] Botón SOS flotante (siempre visible, oculto en /emergencias)
- [x] Impresión A4 landscape del historial (calendario y lista)
- [x] Reconocimiento de voz (Web Speech API) en consulta de situación
- [x] Fix errores JSON en rutas API de IA (try/catch completo)
- [x] Fix OpenAI API key en Vercel (clave caducada reemplazada)
- [x] Fix focus perdido en inputs de Perfil (Campo movido fuera del componente)
- [x] Citas realizadas: círculo-check + opacity + line-through (sin doble marcado)
- [x] Urgencia en tareas: botón ⚠ toggle + badge rojo "Urgente"
- [x] Marcar tomas de medicación de días anteriores (panel colapsable)
- [x] Panel de corrección expandido: 7 días automáticos + selector de fecha libre
- [x] Panel de corrección de tareas de días anteriores (últimos 3 días)
- [x] Aviso en Citas cuando hay citas pasadas sin confirmar
- [x] Separación visual de secciones en página Hoy (bandas sky/sage/amber)
- [x] Enlace al historial al final de cada sección → abre pestaña correcta (`?tab=`)
- [x] Historial lee `?tab=` de la URL para pre-seleccionar pestaña

## Tareas pendientes

- [ ] Evaluar si ampliar corrección de tareas más allá de 3 días (actualmente carga solo 3 días en Supabase)
- [ ] Considerar persistencia del perfil en Supabase para grupos familiares
- [ ] Revisar comportamiento del Realtime de Supabase en dispositivos con conexión intermitente
