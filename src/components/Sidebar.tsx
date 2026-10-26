import { NavLink } from "react-router-dom";
import { Icon, type IconName } from "./Icon";
import { useAdminStats, useApp, useStats } from "../store/AppStore";

type NavEntry = {
  to: string;
  label: string;
  icon: IconName;
  /** Pastille de comptage : ce qui attend une action se voit depuis la nav. */
  badge?: number;
  end?: boolean;
};

/**
 * La variante « Property 1= admin » du composant Sidebar prévoit deux blocs de
 * navigation — « Espace de travail » et « Administration » — de cinq entrées
 * chacun. Le second bloc n'apparaît qu'en vue Gestionnaire.
 */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { state } = useApp();
  const { pendingAll } = useStats();
  const admin = useAdminStats();
  const isManager = state.role === "Gestionnaire";

  const workspace: NavEntry[] = [
    { to: "/", label: "Vue d’ensemble", icon: "grid", end: true },
    { to: "/catalogue", label: "Catalogue", icon: "box" },
    { to: "/demandes", label: "Les demandes", icon: "bag", badge: pendingAll },
    { to: "/reservations", label: "Réservations", icon: "calendar" },
    { to: "/historique", label: "Historique", icon: "history" },
  ];

  const administration: NavEntry[] = [
    { to: "/admin", label: "Pilotage", icon: "grid", end: true },
    { to: "/admin/stock", label: "Stock", icon: "box" },
    {
      to: "/admin/validations",
      label: "Validations",
      icon: "check",
      badge: admin.toTreat.length,
    },
    { to: "/admin/planning", label: "Planning", icon: "calendar" },
    { to: "/admin/membres", label: "Membres", icon: "user" },
  ];

  const account = state.members.find((m) => m.id === "m-sophie");

  return (
    <aside className="sidebar" id="navigation-principale">
      <div className="sidebar__top">
        <div className="sidebar__logo">
          <span className="brand-mark" aria-hidden="true">
            c
          </span>
          <span className="brand-word">
            campus<span>.</span>
          </span>
          {/* Visible seulement quand la barre latérale est un tiroir. */}
          <button
            type="button"
            className="sidebar__close"
            onClick={onNavigate}
            aria-label="Fermer le menu"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <NavSection
          label="Espace de travail"
          entries={workspace}
          ariaLabel="Navigation principale"
          onNavigate={onNavigate}
        />

        {isManager ? (
          <NavSection
            label="Administration"
            entries={administration}
            ariaLabel="Navigation d’administration"
            onNavigate={onNavigate}
          />
        ) : null}
      </div>

      <div className="sidebar__account">
        <span className="avatar" aria-hidden="true">
          {account?.initials ?? "SD"}
        </span>
        <div>
          <p className="account__name">{account?.name ?? "Sophie Dubois"}</p>
          <p className="account__role">
            {state.role === "Étudiant" ? "Étudiante" : state.role}
          </p>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  label,
  entries,
  ariaLabel,
  onNavigate,
}: {
  label: string;
  entries: NavEntry[];
  ariaLabel: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label={ariaLabel}>
      <p className="sidebar__section-label">{label}</p>
      <ul className="sidebar__nav">
        {entries.map((entry) => (
          <li key={entry.to}>
            <NavLink
              to={entry.to}
              end={entry.end}
              className={({ isActive }) =>
                `nav-item${isActive ? " is-active" : ""}`
              }
              onClick={onNavigate}
            >
              <Icon name={entry.icon} />
              <span>{entry.label}</span>
              {entry.badge ? (
                <span className="nav-item__badge">{entry.badge}</span>
              ) : null}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
