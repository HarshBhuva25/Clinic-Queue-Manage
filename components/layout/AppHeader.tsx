import type { Role } from "@/utils/types";

interface AppHeaderProps {
  onLogout?: () => void;
  role?: Role;
}

export function AppHeader({ onLogout, role }: AppHeaderProps) {
  return (
    <header className="panel topbar">
      <div>
        <p className="eyebrow">Clinic Queue Console</p>
        <h1 className="title-main">Clinic Queue Management</h1>
      </div>

      <div className="topbar-actions">
        {role ? <span className={`role-pill role-${role}`}>{role}</span> : null}
        {onLogout ? (
          <button className="button button-danger" onClick={onLogout} type="button">
            Sign out
          </button>
        ) : null}
     </div>
    </header>
  );
}
