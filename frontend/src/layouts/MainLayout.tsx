import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const navItems = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/debtors", icon: "group", label: "Deudores" },
  { to: "/debts", icon: "account_balance_wallet", label: "Deudas" },
  { to: "/reminders", icon: "notifications_active", label: "Recordatorios" },
  { to: "/history", icon: "history", label: "Historial" },
  { to: "/agreements", icon: "description", label: "Acuerdos" },
];

export function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full flex-col py-lg pr-md bg-surface-bright border-r border-outline-variant w-64 z-[60]">
        <div className="px-md mb-xl">
          <h1 className="text-primary font-bold text-headline-md tracking-tight">PayMe!</h1>
          <div className="mt-lg flex items-center gap-md">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <p className="font-semibold text-body-md text-on-surface">{user?.email || "Usuario"}</p>
              <p className="text-label-md text-on-surface-variant">Plan Premium</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-xs">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-md px-md py-sm rounded-r-full transition-colors ${
                  isActive
                    ? "bg-primary-container text-on-primary-container font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-body-md">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-md pt-md border-t border-outline-variant space-y-sm">
          <NavLink
            to="/settings"
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-r-full transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-body-md">Configuración</span>
          </NavLink>
          <button
            onClick={logout}
            className="flex items-center gap-md px-md py-sm text-error hover:bg-error-container rounded-r-full transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-body-md">Cerrar sesión</span>
          </button>
          <p className="text-label-md text-on-surface-variant pt-xs">v1.0.4</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-0 flex flex-col">
        {/* Top Bar */}
        <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface z-50 flex items-center justify-between px-md border-b border-outline-variant">
          <div className="flex items-center gap-md">
            <button
              className="md:hidden p-sm text-primary active:scale-95 transition-transform"
              onClick={() => setDrawerOpen(!drawerOpen)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-title-lg text-primary">PayMe!</h2>
          </div>
          <div className="flex items-center gap-md">
            <button className="p-sm hover:bg-surface-container-high rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="pt-20 px-md md:px-lg max-w-container-max w-full mx-auto flex-1">
          <Outlet />
        </div>
      </main>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/30 z-[60]"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 h-full flex flex-col py-lg pr-md bg-surface-bright border-r border-outline-variant w-64 z-[70] animate-slide-in">
            <div className="px-md mb-xl flex justify-between items-center">
              <h1 className="text-primary font-bold text-headline-md">PayMe!</h1>
              <button onClick={() => setDrawerOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex-1 space-y-xs">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-md px-md py-sm rounded-r-full transition-colors ${
                      isActive
                        ? "bg-primary-container text-on-primary-container font-semibold"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    }`
                  }
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="text-body-md">{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="px-md pt-md border-t border-outline-variant">
              <button
                onClick={() => { logout(); setDrawerOpen(false); }}
                className="flex items-center gap-md px-md py-sm text-error hover:bg-error-container rounded-r-full transition-colors w-full text-left"
              >
                <span className="material-symbols-outlined">logout</span>
                <span className="text-body-md">Cerrar sesión</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-sm py-xs bg-surface border-t border-outline-variant shadow-lg">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center px-4 py-1 active:scale-90 transition-transform ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container rounded-full"
                  : "text-on-surface-variant"
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-label-md">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-md">
      <Outlet />
    </div>
  );
}
