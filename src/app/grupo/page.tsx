"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, LogIn, Copy, Check, LogOut, Crown } from "lucide-react";
import { useGrupo } from "@/hooks/useGrupo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function GrupoPage() {
  const router = useRouter();
  const { sesion, cargando, error, crearGrupo, unirseAGrupo, salirDelGrupo } = useGrupo();

  const [modo, setModo] = useState<"menu" | "crear" | "unirse">("menu");
  const [miNombre, setMiNombre] = useState("");
  const [codigoInput, setCodigoInput] = useState("");
  const [copiado, setCopiado] = useState(false);

  const copiarCodigo = () => {
    if (!sesion) return;
    navigator.clipboard.writeText(sesion.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleCrear = async () => {
    const ok = await crearGrupo(miNombre);
    if (ok) setModo("menu");
  };

  const handleUnirse = async () => {
    const ok = await unirseAGrupo(codigoInput, miNombre);
    if (ok) { setModo("menu"); router.refresh(); }
  };

  // ── Ya en un grupo ──────────────────────────────────────────────────────────
  if (sesion) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl px-5 py-4 bg-gradient-to-br from-sky-50 to-sage-50 border border-sky-100">
          <p className="text-sky-700 font-semibold mb-0.5">Grupo familiar activo</p>
          <p className="text-gray-600 text-sm">Los datos se sincronizan con todos los miembros.</p>
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-sage-500" />
            <h2 className="font-semibold text-gray-800 text-lg">Tu grupo</h2>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Código del grupo</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-widest text-sage-700 font-mono">
                  {sesion.codigo}
                </span>
                <button
                  onClick={copiarCodigo}
                  className="p-2 rounded-lg text-sage-500 hover:bg-sage-50 transition-colors"
                  title="Copiar código"
                >
                  {copiado ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Comparte este código con tus familiares para que se unan.
              </p>
            </div>

            <div className="border-t border-beige-200 pt-3">
              <p className="text-sm text-gray-500 mb-1">Tu nombre en el grupo</p>
              <div className="flex items-center gap-2">
                {sesion.esPrincipal && <Crown size={14} className="text-warm-500" />}
                <p className="font-medium text-gray-800">{sesion.miNombre}</p>
                {sesion.esPrincipal && (
                  <span className="text-xs bg-warm-100 text-warm-600 px-2 py-0.5 rounded-full font-medium">
                    Cuidador principal
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-warm-50 border-warm-200">
          <p className="text-sm text-warm-800 leading-relaxed">
            <span className="font-semibold">¿Cómo invitar a alguien?</span> Comparte el código{" "}
            <span className="font-bold">{sesion.codigo}</span> por WhatsApp o mensaje.
            La otra persona abre la app, va a <em>Grupo familiar</em> y pulsa "Unirme a un grupo".
          </p>
        </Card>

        <button
          onClick={() => {
            if (confirm("¿Seguro que quieres salir del grupo? Solo se borra la conexión de este dispositivo, los datos del grupo se mantienen.")) {
              salirDelGrupo();
            }
          }}
          className="flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm font-medium transition-colors mx-auto"
        >
          <LogOut size={16} /> Salir del grupo
        </button>
      </div>
    );
  }

  // ── Menú inicial ────────────────────────────────────────────────────────────
  if (modo === "menu") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl px-5 py-4 bg-gradient-to-br from-sky-50 to-sage-50 border border-sky-100">
          <p className="text-sky-700 font-semibold mb-0.5">Grupo familiar</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Comparte los cuidados con otros familiares. Todos veréis la misma información en tiempo real.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setModo("crear")}
            className="w-full flex items-center gap-4 bg-white border-2 border-sage-200 hover:border-sage-400 rounded-2xl px-5 py-5 text-left transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-sage-100 group-hover:bg-sage-200 flex items-center justify-center flex-shrink-0 transition-colors">
              <Plus size={22} className="text-sage-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-base">Crear un grupo nuevo</p>
              <p className="text-sm text-gray-500">Soy el cuidador principal y quiero invitar a familiares</p>
            </div>
          </button>

          <button
            onClick={() => setModo("unirse")}
            className="w-full flex items-center gap-4 bg-white border-2 border-sky-200 hover:border-sky-400 rounded-2xl px-5 py-5 text-left transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-sky-100 group-hover:bg-sky-200 flex items-center justify-center flex-shrink-0 transition-colors">
              <LogIn size={22} className="text-sky-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-base">Unirme a un grupo</p>
              <p className="text-sm text-gray-500">Tengo el código que me compartió un familiar</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ── Formulario Crear ────────────────────────────────────────────────────────
  if (modo === "crear") {
    return (
      <div className="space-y-6">
        <button onClick={() => setModo("menu")} className="text-sm text-gray-400 hover:text-gray-600">
          ← Volver
        </button>
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Plus size={18} className="text-sage-500" />
            <h2 className="font-semibold text-gray-800 text-lg">Crear grupo familiar</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Cómo te llamas tú? (así te verán los demás)
              </label>
              <input
                type="text"
                value={miNombre}
                onChange={(e) => setMiNombre(e.target.value)}
                placeholder="Ej: Hijo Juan, Hija María…"
                className="w-full px-4 py-3 rounded-xl border border-beige-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3">
              <Button variante="secundario" className="flex-1" onClick={() => setModo("menu")}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleCrear} disabled={cargando}>
                {cargando ? "Creando…" : "Crear grupo"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Formulario Unirse ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <button onClick={() => setModo("menu")} className="text-sm text-gray-400 hover:text-gray-600">
        ← Volver
      </button>
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <LogIn size={18} className="text-sky-500" />
          <h2 className="font-semibold text-gray-800 text-lg">Unirme a un grupo</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código del grupo
            </label>
            <input
              type="text"
              value={codigoInput}
              onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
              placeholder="Ej: LUNA-4829"
              className="w-full px-4 py-3 rounded-xl border border-beige-200 text-gray-800 font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-300"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ¿Cómo te llamas tú?
            </label>
            <input
              type="text"
              value={miNombre}
              onChange={(e) => setMiNombre(e.target.value)}
              placeholder="Ej: Hija Ana, Vecina Rosa…"
              className="w-full px-4 py-3 rounded-xl border border-beige-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3">
            <Button variante="secundario" className="flex-1" onClick={() => setModo("menu")}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleUnirse} disabled={cargando}>
              {cargando ? "Uniéndome…" : "Unirme"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
