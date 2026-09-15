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

## Sesión 2026-08-18 (desde el proyecto Tograndparents)

- **Supabase pausado de nuevo** (mismo problema que el 2026-07-20, free tier por inactividad) — Fran lo detectó ella misma en el dashboard de Supabase (`https://supabase.com/dashboard/project/geqxighknaxsastdqepk`) y se reactivó con el botón "Resume project". **Ojo**: en la interfaz en español ese botón aparece mal traducido como **"Proyecto de currículum"** (traducción literal errónea de "Resume project", no tiene nada que ver con un CV) — fácil de pasarlo por alto. El proyecto se puede reanudar desde el dashboard hasta el 21 de septiembre de 2027; después de esa fecha ya no sería recuperable (aunque los datos seguirían disponibles para descargar).
- Como esto ya es la segunda vez, si vuelve a pasar merece la pena valorar con Fran o bien entrar en la app cuidador-familiar.vercel.app de vez en cuando (evita la pausa por inactividad) o actualizar a Supabase Pro.
- **Confirmado que las otras 2 apps personales de Fran no usan Supabase** (por si alguna vez se confunden): `Planificador_menus` no tiene ninguna variable de entorno configurada en Vercel; `que-plantar-y-cuando` usa OpenAI + Redis/Upstash (KV). Solo `Cuidador_Familiar` depende de Supabase, así que es la única de las tres con este riesgo de pausa.

---

## Sesión 2026-09-01 (desde el proyecto Adsense) — fin del riesgo de pausa de Supabase + arranque de plan de marketing de contenidos

**Contexto**: esta sesión empezó investigando un gasto sorpresa de OpenAI (ver `../Adsense/CLAUDE.md`), y de ahí Fran preguntó por el estado de Supabase (había recibido 2 avisos de pausa por inactividad de `ant.wilson@supabase.com`, 10 jul y 16 ago).

- **Proyecto confirmado sano** (`Fran-max773's Project`, org `cuidador-familiar`, `https://supabase.com/dashboard/project/geqxighknaxsastdqepk`) — status "Healthy" al comprobarlo, 0 total requests (tráfico real muy bajo, por eso se pausa tan fácil).
- **Solución permanente al problema recurrente** (esto ya había pasado dos veces, 20-jul y 18-ago, ver arriba): se creó un **GitHub Action programado** en el repo `Fran-max773/cuidador-familiar` → `.github/workflows/keep-supabase-alive.yml`. Corre solo cada 3 días (`0 6 */3 * *`, UTC) y hace un `curl` sin credenciales a `https://geqxighknaxsastdqepk.supabase.co/auth/v1/health` y `/rest/v1/` — el 401 es esperado y no importa, lo que cuenta es que la petición llega al proyecto y resetea el contador de inactividad. Verificado con una ejecución manual (`gh workflow run`) que respondió 401/401, confirmando que sí llega tráfico real. **Con esto no debería volver a pausarse sin que nadie se entere** — ya no hace falta la solución manual de "entrar de vez en cuando a la app" ni plantearse pasar a Supabase Pro solo por esto.
- Repo por defecto usa rama `master` (no `main`) — importante si se vuelve a tocar vía API de contenidos de GitHub (`gh api -X PUT repos/.../contents/...` necesita `-X PUT`, con solo `-f` por defecto hace POST y da 404 engañoso).

### Nueva iniciativa: dar visibilidad a la app — Instagram + reforzar tograndparents.com

Fran quiere crear una cuenta de Instagram (aún no creada — requiere que él la cree, Claude no puede registrar cuentas) para publicar contenido de cuidado familiar, en parte basado en `public/ebook-cuidador-familiar.pdf` y en parte contenido más amplio del nicho. En vez de montar un blog nuevo, se apoya en **tograndparents.com** (ya tiene tráfico, categoría "Familia y Relaciones", y un artículo insignia: *"Cómo cuidar a un padre con deterioro cognitivo sin acabar agotado: guía práctica para cuidadores familiares"*, más un CTA de la app ya en la home).

**Investigación de keywords hecha en Ubersuggest** (cuenta de Fran, proyecto trackeado ahí sigue siendo mygardenlive.com — para tograndparents.com se usó la herramienta suelta "Keyword Ideas" sin necesitar añadirlo como proyecto): volumen bajo en España para el nicho puro "cuidador familiar" (mejores: "paga cuidador familiar" 40/mes, "ayuda cuidador familiar" 40/mes), pero con dificultad SEO baja (KD 5-9) en ángulos legales/fiscales sin cubrir todavía en el sitio: *"cuánto se cobra por cuidar a un familiar dependiente"*, *"derechos cuidador familiar ley dependencia"*, *"deducciones de Hacienda por cuidar a un familiar mayor"*. Ojo: Ubersuggest mezcla ruido de Brasil ("bolsa cuidador familiar...", programa social brasileño, filtrar al analizar).

**Hueco de contenido identificado**: la categoría "Dinero y Finanzas" de tograndparents.com ya tiene pensiones/declaración de la renta para jubilados, pero nada específico sobre ayudas/derechos de quien cuida a un familiar — es el punto intermedio sin cubrir entre el directorio de "Centros de día" (para quien delega el cuidado) y el contenido de la app (para quien cuida en casa).

**Plan acordado con Fran** — **avanzado, detalle completo en `../Tograndparents/CLAUDE.md`** (sección "Reforzar contenido de 'cuidador familiar' + Instagram", no duplicado aquí para no desincronizar). Estado según la última actualización de ese archivo (sesión 2026-09-11):
1. ✅ Cuenta de Instagram creada y configurada (`@soycuidadorfamiliar`) — Claude no puede crear cuentas (regla fija), Fran la registró y Claude configuró el resto (foto, bio, enlace, cuenta profesional).
2. ✅ Los 3 artículos de tograndparents.com sobre ayudas/derechos/deducciones del cuidador publicados, enlazados entre sí y con la app (CTA con UTM `utm_source=tograndparents&utm_medium=blog&utm_campaign=<slug>`). Frente cerrado.
3. ✅ 18 ideas de post extraídas del ebook y aprobadas por Fran, repartidas en los 3 pilares (libro / nicho legal-fiscal / la app).
4. ✅ Pipeline de publicación automatizado (Telegram + scripts + Graph API de Instagram) construido y probado de principio a fin; **8 carruseles publicados** en la cuenta a fecha 2026-09-11. Enlace Instagram ↔ tograndparents.com ya añadido (pie de página del sitio + 5 artículos afines).
5. ⏳ Automatización "sin depender del PC encendido" (vía Make, con Instagram publicando sin sesión activa) bloqueada por un bug conocido y sin resolver de la API de Instagram al pedir el token de larga duración — de momento cada tanda sigue publicándose corriendo los scripts en una sesión activa. Cadencia acordada: lunes/miércoles/viernes.

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
