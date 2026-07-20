-- Grupos familiares
CREATE TABLE grupos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo     text UNIQUE NOT NULL,
  creado_en  timestamptz DEFAULT now()
);

-- Miembros del grupo
CREATE TABLE miembros (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id     uuid REFERENCES grupos(id) ON DELETE CASCADE,
  nombre       text NOT NULL,
  es_principal boolean DEFAULT false,
  unido_en     timestamptz DEFAULT now()
);

-- Perfil del familiar (uno por grupo, guardado como JSON)
CREATE TABLE perfil (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id  uuid REFERENCES grupos(id) ON DELETE CASCADE UNIQUE,
  datos     jsonb NOT NULL DEFAULT '{}'
);

-- Medicaciones
CREATE TABLE medicaciones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id        uuid REFERENCES grupos(id) ON DELETE CASCADE,
  nombre          text NOT NULL,
  horas           text[] NOT NULL DEFAULT '{}',
  dosis           text DEFAULT '',
  fecha_inicio    date NOT NULL,
  fecha_fin       date NOT NULL,
  completadas_en  text[] NOT NULL DEFAULT '{}',
  creado_en       timestamptz DEFAULT now()
);

-- Tareas
CREATE TABLE tareas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id        uuid REFERENCES grupos(id) ON DELETE CASCADE,
  texto           text NOT NULL,
  completada      boolean DEFAULT false,
  fecha           date NOT NULL,
  prioridad       text DEFAULT 'normal',
  completada_por  text DEFAULT '',
  asignada_a      text DEFAULT '',
  creado_en       timestamptz DEFAULT now()
);

-- Citas
CREATE TABLE citas (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id  uuid REFERENCES grupos(id) ON DELETE CASCADE,
  tipo      text NOT NULL,
  titulo    text NOT NULL,
  fecha     date NOT NULL,
  hora      text NOT NULL,
  lugar     text DEFAULT '',
  notas     text DEFAULT '',
  realizada boolean DEFAULT false,
  creado_en timestamptz DEFAULT now()
);

-- Migración: añadir columna realizada si la tabla ya existe
ALTER TABLE citas ADD COLUMN IF NOT EXISTS realizada boolean DEFAULT false;

-- Migración: quién solicitó la tarea
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS creada_por text DEFAULT '';

-- Permitir acceso público (la seguridad la da el código del grupo)
ALTER TABLE grupos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros   ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil     ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acceso_publico" ON grupos      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_publico" ON miembros    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_publico" ON perfil      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_publico" ON medicaciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_publico" ON tareas      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_publico" ON citas       FOR ALL USING (true) WITH CHECK (true);

-- Activar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE medicaciones, tareas, citas, perfil;

