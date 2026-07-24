import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-surface-container-lowest rounded-xl shadow-modal border border-outline-variant overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-lg py-md flex items-center gap-sm">
          <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          <span className="text-title-md font-bold text-on-primary">PayMe!</span>
        </div>

        <div className="px-lg py-lg">
          <h1 className="text-title-lg text-on-surface mb-xs">Iniciar sesión</h1>
          <p className="text-body-sm text-on-surface-variant mb-lg">Ingresa tus credenciales para acceder.</p>

          {error && (
            <div className="mb-md p-sm bg-error-container text-on-error-container rounded-lg text-body-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            <div>
              <label className="text-label-md text-on-surface-variant mb-xs block" htmlFor="email">Correo</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">mail</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-[36px] pr-sm py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-label-md text-on-surface-variant mb-xs block" htmlFor="password">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">lock</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-[36px] pr-[36px] py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="••••••••"
                  required
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-primary text-on-primary rounded-lg text-title-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="mt-lg text-center text-body-sm text-on-surface-variant">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
