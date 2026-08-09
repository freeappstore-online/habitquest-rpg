import type { ReactNode } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface ShellProps {
  children: ReactNode;
  navItems?: NavItem[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  appName?: string;
}

export function Shell({ children, navItems = [], activeTab, onTabChange, appName = "HabitQuest" }: ShellProps) {
  return (
    <>
      {/* Desktop layout */}
      <div className="hidden md:flex h-screen">
        <aside
          className="flex flex-col border-r h-full shrink-0"
          style={{ width: "17rem", borderColor: "var(--line)", background: "var(--panel)" }}
        >
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <span className="text-2xl">⚔️</span>
            <div>
              <div className="font-bold text-lg leading-tight" style={{ fontFamily: "Fraunces, serif" }}>
                {appName}
              </div>
              <div className="text-xs" style={{ color: "var(--muted)", fontFamily: "monospace" }}>
                16-bit habit RPG
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all"
                style={{
                  background: activeTab === item.id ? "var(--accent)" : "transparent",
                  color: activeTab === item.id ? "#fff" : "var(--ink)",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  fontWeight: activeTab === item.id ? "700" : "500",
                  fontSize: "0.875rem",
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 text-xs" style={{ color: "var(--muted)" }}>
            <a
              href="https://freeappstore.online"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--muted)" }}
            >
              Part of FreeAppStore — free forever
            </a>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>

      {/* Mobile layout */}
      <div className="flex flex-col h-screen md:hidden">
        <header
          className="flex items-center px-4 h-14 border-b shrink-0 gap-3"
          style={{ borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <span className="text-xl">⚔️</span>
          <span className="font-bold" style={{ fontFamily: "Fraunces, serif" }}>{appName}</span>
          <span className="text-xs ml-auto" style={{ color: "var(--muted)", fontFamily: "monospace" }}>16-bit RPG</span>
        </header>

        <main className="flex-1 overflow-auto p-4">{children}</main>

        {/* Bottom dock */}
        <nav
          className="flex items-center justify-around h-16 border-t shrink-0"
          style={{ borderColor: "var(--line)", background: "var(--dock)" }}
        >
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: activeTab === item.id ? "var(--accent)" : "var(--muted)",
              }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-bold" style={{
                fontFamily: "monospace",
                fontSize: "0.6rem",
                color: activeTab === item.id ? "var(--accent)" : "var(--muted)",
              }}>
                {item.label.split(" ")[0].toUpperCase()}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
