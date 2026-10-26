import { NavLink } from "react-router-dom";
import { Icon, type IconName } from "./Icon";
import { useStats } from "../store/AppStore";

type Onglet = { to: string; label: string; icon: IconName; end?: boolean };

/**
 * Barre d'onglets du bas, affichée sur petit écran. Elle ne porte que l'espace
 * de travail : ce sont les gestes quotidiens d'un étudiant, et le pouce les
 * atteint sans effort. L'administration reste dans le tiroir latéral.
 */
const ONGLETS: Onglet[] = [
  { to: "/", label: "Accueil", icon: "grid", end: true },
  { to: "/catalogue", label: "Catalogue", icon: "box" },
  { to: "/demandes", label: "Demandes", icon: "bag" },
  { to: "/reservations", label: "Créneaux", icon: "calendar" },
  { to: "/historique", label: "Historique", icon: "history" },
];

export function MobileTabBar() {
  const { pendingAll } = useStats();

  return (
    <nav className="tabbar" aria-label="Navigation rapide">
      {ONGLETS.map((o) => (
        <NavLink
          key={o.to}
          to={o.to}
          end={o.end}
          className={({ isActive }) => `tabbar__item${isActive ? " is-active" : ""}`}
        >
          <span className="tabbar__icon">
            <Icon name={o.icon} size={21} />
            {o.to === "/demandes" && pendingAll > 0 ? (
              <span className="tabbar__dot" aria-hidden="true" />
            ) : null}
          </span>
          <span className="tabbar__label">{o.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
