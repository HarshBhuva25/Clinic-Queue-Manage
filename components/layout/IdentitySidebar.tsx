import { ROLE_RIGHTS } from "@/utils/constants";
import { getInitials } from "@/utils/format";
import type { AuthSession } from "@/utils/types";

export function IdentitySidebar({ session }: { session: AuthSession }) {
  return (
    <aside className="panel sidebar">
      <div className="section-stack">
        <div>
         <h2 className="section-title">Profile</h2>
          <p className="meta-text">
            Access is based on your role and clinic assignment.
          </p>
        </div>

        <div className="identity-card">
          <div className="identity-row">
            <div className="avatar-badge">{getInitials(session.user.name)}</div>
           <div>
              <p className="identity-name">{session.user.name}</p>
              <p className="identity-mail">{session.user.email}</p>
            </div>
          </div>

          <span className={`role-pill role-${session.user.role}`}>
            {session.user.role}
          </span>

          <div>
            <p className="meta-text">
              Clinic: {session.user.clinicName ?? "Your clinic"}
            </p>
            <p className="meta-text mono-text">
              Code: {session.user.clinicCode ?? "Not set"}
            </p>
          </div>
       </div>

        <div className="card-section">
          <h3 className="card-title">What You Can Do</h3>
          <ul className="rights-list">
            {ROLE_RIGHTS[session.user.role].map((right) => (
              <li key={right}>{right}</li>
            ))}
          </ul>
       </div>
      </div>
    </aside>
  );
}
