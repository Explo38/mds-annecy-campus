import { Icon } from "./Icon";
import { useApp } from "../store/AppStore";
import type { Role } from "../data/types";

const ROLES: Role[] = ["Étudiant", "Professeur", "Gestionnaire"];

export function Topbar({
  space,
  page,
  onOpenCart,
  onOpenMenu,
}: {
  space: string;
  page: string;
  onOpenCart: () => void;
  onOpenMenu: () => void;
}) {
  const { state, setRole } = useApp();
  const cartCount = state.cart.length;

  return (
    <header className="topbar">
      {/* Sur petit écran, la barre latérale est repliée : on la rouvre ici. */}
      <button
        type="button"
        className="topbar__menu"
        onClick={onOpenMenu}
        aria-label="Ouvrir le menu"
        aria-controls="navigation-principale"
      >
        <Icon name="menu" />
      </button>

      <nav className="breadcrumb" aria-label="Fil d’Ariane">
        <span className="breadcrumb__root">{space}</span>
        <span className="breadcrumb__sep" aria-hidden="true">
          /
        </span>
        <span className="breadcrumb__current" aria-current="page">
          {page}
        </span>
      </nav>

      {/* Sur mobile le fil d'Ariane est masqué : le titre prend sa place. */}
      <span className="topbar__title">{page}</span>

      <div className="topbar__right">
        <div className="role-switch">
          <span className="role-switch__label" id="role-label">
            Vue de démonstration
          </span>
          <div className="role-switch__control">
            <span className="role-switch__value">
              {state.role}
              <span className="chev" aria-hidden="true">
                <Icon name="chevronDown" />
              </span>
            </span>
            {/* Le <select> couvre la pastille : apparence Figma, comportement natif. */}
            <select
              aria-labelledby="role-label"
              value={state.role}
              onChange={(e) => setRole(e.target.value as Role)}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: "pointer",
                width: "100%",
              }}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={onOpenCart}
          aria-label={`Ouvrir le panier (${cartCount} ressource${
            cartCount > 1 ? "s" : ""
          })`}
        >
          <Icon name="bag" />
          {cartCount > 0 ? (
            <span className="icon-button__count">{cartCount}</span>
          ) : null}
        </button>

        <span className="avatar" aria-hidden="true">
          SD
        </span>
      </div>
    </header>
  );
}
