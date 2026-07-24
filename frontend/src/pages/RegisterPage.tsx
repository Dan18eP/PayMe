import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await register(email, password);
      navigate("/login", { state: { registered: true } });
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
    }
  };

  return (
    <main className="relative z-10 w-full max-w-[1100px] flex flex-col md:flex-row items-stretch justify-center bg-surface-container-lowest rounded-xl shadow-modal overflow-hidden border border-outline-variant">
      <div className="hidden md:flex flex-col justify-between p-2xl w-1/2 bg-primary text-on-primary">
        <div>
          <div className="flex items-center gap-base mb-xl">
            <div className="w-10 h-10 bg-primary-fixed rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
            <span className="font-bold text-headline-md tracking-tight">PayMe!</span>
          </div>
          <h1 className="text-[48px] font-bold leading-[56px] tracking-[-0.02em] mb-lg">
            Únete a PayMe! hoy.
          </h1>
          <p className="text-body-lg text-on-primary-container/80 max-w-sm">
            Crea tu cuenta gratis y empieza a gestionar tus deudas de forma inteligente.
          </p>
        </div>
        <div className="space-y-lg">
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-fixed bg-primary-fixed/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-fixed">shield</span>
            </div>
            <div>
              <p className="text-title-md italic text-on-primary">"Tus datos están seguros con nosotros."</p>
              <p className="text-label-md text-primary-fixed-dim">— Equipo PayMe!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 p-xl md:p-2xl flex flex-col justify-center bg-surface-container-lowest">
        <div className="md:hidden flex items-center justify-center gap-base mb-xl">
          <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          <span className="font-bold text-headline-md text-primary">PayMe!</span>
        </div>

        <div className="mb-xl">
          <h2 className="text-headline-lg text-on-surface mb-xs">Crear cuenta</h2>
          <p className="text-body-md text-on-surface-variant">Empieza a gestionar tus deudas en segundos.</p>
        </div>

        {error && (
          <div className="mb-md p-md bg-error-container text-on-error-container rounded-lg text-body-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-lg">
          <div className="space-y-xs">
            <label className="text-label-md text-on-surface-variant ml-xs" htmlFor="reg-email">Correo electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-[48px] pr-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="ejemplo@payme.com"
                required
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label className="text-label-md text-on-surface-variant ml-xs" htmlFor="reg-password">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-[48px] pr-[48px] py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-md flex items-center text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-xs">
            <label className="text-label-md text-on-surface-variant ml-xs" htmlFor="reg-confirm">Confirmar contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <input
                id="reg-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-[48px] pr-md py-3 bg-surface border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Repite la contraseña"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary text-title-md py-4 rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-base disabled:opacity-50"
          >
            <span>{isLoading ? "Creando cuenta..." : "Crear cuenta gratis"}</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </form>

        <div className="mt-2xl text-center">
          <p className="text-body-sm text-on-surface-variant">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
