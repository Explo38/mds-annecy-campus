import { createContext, useContext, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CartDrawer } from "./CartDrawer";
import { NewRequestModal } from "./NewRequestModal";
import { RequestDetailModal } from "./RequestDetailModal";
import { Toasts } from "./Toasts";
import { MobileTabBar } from "./MobileTabBar";
import type { Request } from "../data/types";

/** Titre repris dans le fil d'Ariane et l'onglet du navigateur. */
const PAGE_TITLES: Record<string, string> = {
  "/": "Vue d’ensemble",
  "/catalogue": "Catalogue",
  "/demandes": "Les demandes",
  "/reservations": "Les réservations",
  "/historique": "Historique",
  "/admin": "Pilotage",
  "/admin/stock": "Stock",
  "/admin/validations": "Validations",
  "/admin/planning": "Planning",
  "/admin/membres": "Membres",
};

type UIContextValue = {
  openCart: () => void;
  openNewRequest: (resourceId?: string) => void;
  openDetail: (request: Request) => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI doit être utilisé dans <Layout>");
  return ctx;
}

export function Layout() {
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [newRequest, setNewRequest] = useState<{ resourceId?: string } | null>(
    null,
  );
  const [detail, setDetail] = useState<Request | null>(null);
  // En dessous de 980 px la barre latérale devient un tiroir. Il se referme
  // depuis les gestes qui l'ouvrent ou le quittent : un lien de navigation, la
  // croix, ou le voile — pas besoin d'un effet sur la route.
  const [menuOpen, setMenuOpen] = useState(false);

  const page = PAGE_TITLES[location.pathname] ?? "Espace de travail";
  // Le fil d'Ariane nomme l'espace dans lequel on se trouve.
  const space = location.pathname.startsWith("/admin")
    ? "Administration"
    : "Espace de travail";

  const ui = useMemo<UIContextValue>(
    () => ({
      openCart: () => setCartOpen(true),
      openNewRequest: (resourceId) => setNewRequest({ resourceId }),
      openDetail: (request) => setDetail(request),
    }),
    [],
  );

  return (
    <UIContext.Provider value={ui}>
      <div className={`app${menuOpen ? " app--menu-open" : ""}`}>
        <Sidebar onNavigate={() => setMenuOpen(false)} />
        {/* Voile tactile : refermer d'un geste hors du tiroir. */}
        <button
          type="button"
          className="menu-scrim"
          aria-label="Fermer le menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />
        <div className="workspace">
          <Topbar
            space={space}
            page={page}
            onOpenCart={ui.openCart}
            onOpenMenu={() => setMenuOpen(true)}
          />
          <main className="page">
            <Outlet />
          </main>
          <MobileTabBar />
        </div>
      </div>

      {cartOpen ? <CartDrawer onClose={() => setCartOpen(false)} /> : null}

      {newRequest ? (
        <NewRequestModal
          resourceId={newRequest.resourceId}
          onClose={() => setNewRequest(null)}
        />
      ) : null}

      {detail ? (
        <RequestDetailModal request={detail} onClose={() => setDetail(null)} />
      ) : null}

      <Toasts />
    </UIContext.Provider>
  );
}
