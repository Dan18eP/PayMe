import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { FloatingSymbols } from "../components/FloatingSymbols";

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
      <aside className="hidden md:flex fixed left-0 top-0 h-full flex-col py-md bg-surface-bright border-r border-outline-variant w-56 z-[60]">
        <div className="px-md mb-md">
          <h1 className="text-title-lg font-bold text-primary">PayMe!</h1>
          <div className="mt-md flex items-center gap-sm">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined text-[16px]">person</span>
            </div>
            <div className="truncate">
              <p className="text-body-sm font-semibold text-on-surface truncate">{user?.email || "Usuario"}</p>
              <p className="text-label-md text-on-surface-variant">Premium</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-sm px-md py-1.5 rounded-r-full transition-colors text-body-sm ${
                  isActive
                    ? "bg-primary-container text-on-primary-container font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`
              }
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-md pt-sm border-t border-outline-variant space-y-0.5">
          <button
            onClick={logout}
            className="flex items-center gap-sm px-md py-1.5 text-error hover:bg-error-container rounded-r-full transition-colors w-full text-left text-body-sm"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-56 pb-16 md:pb-0 flex flex-col">
        <header className="fixed top-0 left-0 md:left-56 right-0 h-12 bg-surface z-50 flex items-center justify-between px-md border-b border-outline-variant">
          <div className="flex items-center gap-sm">
            <button
              className="md:hidden p-1 text-primary active:scale-95"
              onClick={() => setDrawerOpen(!drawerOpen)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-title-md text-primary font-bold md:hidden">PayMe!</h2>
          </div>
        </header>

        <div className="pt-14 px-sm md:px-md max-w-container-max w-full mx-auto flex-1">
          <Outlet />
        </div>
      </main>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/30 z-[60]" onClick={() => setDrawerOpen(false)} />
          <aside className="md:hidden fixed left-0 top-0 h-full flex flex-col py-md bg-surface-bright border-r border-outline-variant w-56 z-[70]">
            <div className="px-md mb-md flex items-center justify-between">
              <h1 className="text-title-lg font-bold text-primary">PayMe!</h1>
              <button onClick={() => setDrawerOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex-1 space-y-0.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-sm px-md py-1.5 rounded-r-full text-body-sm transition-colors ${
                      isActive
                        ? "bg-primary-container text-on-primary-container font-semibold"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="px-md pt-sm border-t border-outline-variant">
              <button
                onClick={() => { logout(); setDrawerOpen(false); }}
                className="flex items-center gap-sm px-md py-1.5 text-error hover:bg-error-container rounded-r-full transition-colors w-full text-left text-body-sm"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Cerrar sesión
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface border-t border-outline-variant shadow-lg">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center px-2 py-1 active:scale-90 transition-transform ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-sm relative">
      <FloatingSymbols />
      <Outlet />
    </div>
  );
}
