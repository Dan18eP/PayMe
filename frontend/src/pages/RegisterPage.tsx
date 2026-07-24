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
    <div className="w-full max-w-md mx-auto">
      <div className="bg-surface-container-lowest rounded-xl shadow-modal border border-outline-variant overflow-hidden">
        <div className="bg-primary px-lg py-md flex items-center gap-sm">
          <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          <span className="text-title-md font-bold text-on-primary">PayMe!</span>
        </div>

        <div className="px-lg py-lg">
          <h1 className="text-title-lg text-on-surface mb-xs">Crear cuenta</h1>
          <p className="text-body-sm text-on-surface-variant mb-lg">Empieza a gestionar tus deudas.</p>

          {error && (
            <div className="mb-md p-sm bg-error-container text-on-error-container rounded-lg text-body-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            <div>
              <label className="text-label-md text-on-surface-variant mb-xs block" htmlFor="reg-email">Correo</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">mail</span>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-[36px] pr-sm py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-label-md text-on-surface-variant mb-xs block" htmlFor="reg-password">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">lock</span>
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-[36px] pr-[36px] py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
                  placeholder="Mín. 6 caracteres"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-sm top-1/2 -translate-y-1/2 text-outline"
                >
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-label-md text-on-surface-variant mb-xs block" htmlFor="reg-confirm">Confirmar contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">lock</span>
                <input
                  id="reg-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-[36px] pr-sm py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary"
                  placeholder="Repite la contraseña"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-primary text-on-primary rounded-lg text-title-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-lg text-center text-body-sm text-on-surface-variant">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
