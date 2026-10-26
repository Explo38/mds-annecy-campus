import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ACTIVITIES,
  DEMO_NOW,
  MEMBERS,
  REQUESTS,
  RESOURCES,
  demoNowIso,
} from "../data/seed";
import type {
  Activity,
  CartItem,
  Member,
  Request,
  RequestStatus,
  RequestType,
  Resource,
  ResourceState,
  Role,
} from "../data/types";
import { ACTIVE_STATUSES, CURRENT_MEMBER_ID, isClosed } from "../data/types";
import { deriveResourceState, stockOf } from "../lib/stock";

// v3 : les références portent un nombre d'exemplaires et le panier une quantité.
const STORAGE_KEY = "campus.state.v3";

type State = {
  resources: Resource[];
  requests: Request[];
  members: Member[];
  activities: Activity[];
  cart: CartItem[];
  role: Role;
  /** Prochain numéro de demande attribué. */
  counter: number;
};

const initialState: State = {
  resources: RESOURCES,
  requests: REQUESTS,
  members: MEMBERS,
  activities: ACTIVITIES,
  cart: [],
  role: "Étudiant",
  counter: 1011,
};

/** Champs modifiables d'une ressource depuis l'écran Stock. */
export type ResourceDraft = {
  name: string;
  category: string;
  location: string;
  ref: string;
  descriptor: string;
  workflow: "Emprunt" | "Réservation";
  access: "Accès direct" | "Validation requise";
  state: ResourceState;
  note?: string;
  total: number;
  maintenance: number;
};

type NewRequest = {
  resourceId: string;
  type: RequestType;
  start: string;
  end: string;
  purpose: string;
  /** Nombre d'exemplaires demandés (matériel en plusieurs unités). */
  quantity?: number;
};

type Action =
  | { type: "role/set"; role: Role }
  | { type: "cart/add"; item: CartItem }
  | { type: "cart/remove"; resourceId: string }
  | { type: "cart/quantity"; resourceId: string; quantity: number }
  | { type: "cart/clear" }
  | { type: "request/create"; payload: NewRequest[] }
  | { type: "request/cancel"; id: string }
  | { type: "request/approve"; id: string }
  | { type: "request/reject"; id: string }
  | { type: "request/close"; id: string }
  | { type: "resource/create"; draft: ResourceDraft }
  | { type: "resource/update"; id: string; draft: Partial<ResourceDraft> }
  | { type: "resource/remove"; id: string }
  | { type: "state/reset" };

function activity(label: string): Activity {
  return {
    id: `act-${Math.random().toString(36).slice(2, 10)}`,
    label,
    at: demoNowIso(),
  };
}

/**
 * L'état affiché d'une référence découle de ses exemplaires et des demandes qui
 * la mobilisent. On le recalcule après chaque mutation plutôt que de le suivre
 * à la main.
 */
function refreshResource(
  resources: Resource[],
  requests: Request[],
  resourceId?: string,
): Resource[] {
  if (!resourceId) return resources;
  return resources.map((r) =>
    r.id === resourceId ? { ...r, state: deriveResourceState(r, requests) } : r,
  );
}

/** Recalcule tout le parc — utilisé après une modification de stock. */
function refreshAll(resources: Resource[], requests: Request[]): Resource[] {
  return resources.map((r) => ({ ...r, state: deriveResourceState(r, requests) }));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "role/set":
      return { ...state, role: action.role };

    case "cart/add": {
      const rest = state.cart.filter(
        (i) => i.resourceId !== action.item.resourceId,
      );
      return { ...state, cart: [...rest, action.item] };
    }

    case "cart/quantity": {
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.resourceId === action.resourceId
            ? { ...i, quantity: Math.max(1, action.quantity) }
            : i,
        ),
      };
    }

    case "cart/remove":
      return {
        ...state,
        cart: state.cart.filter((i) => i.resourceId !== action.resourceId),
      };

    case "cart/clear":
      return { ...state, cart: [] };

    case "request/create": {
      let counter = state.counter;
      let resources = state.resources;
      const created: Request[] = [];

      for (const payload of action.payload) {
        const resource = state.resources.find((r) => r.id === payload.resourceId);
        if (!resource) continue;
        // Une demande porte un exemplaire : en demander trois en crée trois,
        // chacune suivie et restituée séparément.
        const exemplaires = Math.max(1, payload.quantity ?? 1);
        for (let n = 0; n < exemplaires; n++) {
        const number = `#${counter}`;
        counter += 1;
        // Toute demande déposée attend la validation de l'équipe du campus :
        // c'est le point d'entrée du cycle de vie, quel que soit le mode d'accès.
        const status: RequestStatus = "En attente";
        created.push({
          id: `req-${counter}-${Math.random().toString(36).slice(2, 7)}`,
          number,
          type: payload.type,
          status,
          resourceId: resource.id,
          label: resource.name,
          descriptor:
            payload.type === "Réservation" ? resource.descriptor : resource.ref,
          icon: resource.icon,
          start: payload.start,
          end: payload.end,
          requesterId: CURRENT_MEMBER_ID,
          requester: "Sophie Dubois",
          requesterNote:
            payload.type === "Réservation"
              ? "Réservation personnelle"
              : "Emprunt personnel",
          purpose: payload.purpose || "Projet étudiant",
          createdAt: demoNowIso(),
        });
        }
      }

      if (!created.length) return state;

      const note =
        created.length === 1
          ? `Demande ${created[0].number} déposée · ${created[0].label}`
          : `${created.length} demandes déposées`;

      const requetes = [...created, ...state.requests];
      const ids = Array.from(new Set(created.map((c) => c.resourceId)));
      for (const rid of ids) resources = refreshResource(resources, requetes, rid);

      return {
        ...state,
        counter,
        resources,
        requests: requetes,
        activities: [activity(note), ...state.activities],
      };
    }

    case "request/cancel": {
      const target = state.requests.find((r) => r.id === action.id);
      if (!target || isClosed(target)) return state;
      const nextRequests = state.requests.map((r): Request =>
        r.id === action.id
          ? { ...r, status: "Annulée", closedAt: demoNowIso() }
          : r,
      );
      return {
        ...state,
        resources: refreshResource(state.resources, nextRequests, target.resourceId),
        requests: nextRequests,
        activities: [
          activity(`${target.label} · demande ${target.number} annulée`),
          ...state.activities,
        ],
      };
    }

    case "request/approve": {
      const target = state.requests.find((r) => r.id === action.id);
      if (!target || target.status !== "En attente") return state;
      return {
        ...state,
        resources: refreshResource(
          state.resources,
          state.requests.map((r) =>
            r.id === action.id ? { ...r, status: "Validée" as const } : r,
          ),
          target.resourceId,
        ),
        requests: state.requests.map((r) =>
          r.id === action.id ? { ...r, status: "Validée" } : r,
        ),
        activities: [
          activity(`${target.label} · demande ${target.number} validée`),
          ...state.activities,
        ],
      };
    }

    case "request/reject": {
      const target = state.requests.find((r) => r.id === action.id);
      if (!target || target.status !== "En attente") return state;
      const nextRequests = state.requests.map((r): Request =>
        r.id === action.id
          ? { ...r, status: "Refusée", closedAt: demoNowIso() }
          : r,
      );
      return {
        ...state,
        resources: refreshResource(state.resources, nextRequests, target.resourceId),
        requests: nextRequests,
        activities: [
          activity(`${target.label} · demande ${target.number} refusée`),
          ...state.activities,
        ],
      };
    }

    case "request/close": {
      const target = state.requests.find((r) => r.id === action.id);
      if (!target || isClosed(target)) return state;
      const status: RequestStatus =
        target.type === "Emprunt" ? "Restitué" : "Terminée";
      const nextRequests = state.requests.map((r): Request =>
        r.id === action.id ? { ...r, status, closedAt: demoNowIso() } : r,
      );
      return {
        ...state,
        resources: refreshResource(state.resources, nextRequests, target.resourceId),
        requests: nextRequests,
        activities: [
          activity(
            target.type === "Emprunt"
              ? `${target.label} restitué`
              : `${target.label} · créneau terminé`,
          ),
          ...state.activities,
        ],
      };
    }

    case "resource/create": {
      const resource: Resource = {
        id: `res-${Math.random().toString(36).slice(2, 9)}`,
        icon: action.draft.workflow === "Réservation" ? "door" : "box",
        ...action.draft,
      };
      return {
        ...state,
        resources: refreshAll([resource, ...state.resources], state.requests),
        activities: [
          activity(`${resource.name} ajouté au stock`),
          ...state.activities,
        ],
      };
    }

    case "resource/update": {
      const target = state.resources.find((r) => r.id === action.id);
      if (!target) return state;
      const updated = { ...target, ...action.draft };
      const changedState =
        action.draft.state !== undefined && action.draft.state !== target.state;
      const parc = state.resources.map((r) => (r.id === action.id ? updated : r));
      return {
        ...state,
        resources: refreshAll(parc, state.requests),
        activities: changedState
          ? [
              activity(`${updated.name} · ${updated.state.toLowerCase()}`),
              ...state.activities,
            ]
          : state.activities,
      };
    }

    case "resource/remove": {
      const target = state.resources.find((r) => r.id === action.id);
      if (!target) return state;
      return {
        ...state,
        resources: state.resources.filter((r) => r.id !== action.id),
        cart: state.cart.filter((i) => i.resourceId !== action.id),
        activities: [
          activity(`${target.name} retiré du stock`),
          ...state.activities,
        ],
      };
    }

    case "state/reset":
      return initialState;

    default:
      return state;
  }
}

function load(): State {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<State>;
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

export type Toast = { id: number; message: string };

type Store = {
  state: State;
  now: Date;
  /** Ressource par identifiant. */
  resourceById: (id?: string) => Resource | undefined;
  setRole: (role: Role) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (resourceId: string) => void;
  setCartQuantity: (resourceId: string, quantity: number) => void;
  clearCart: () => void;
  submitCart: () => void;
  createRequest: (payload: NewRequest) => void;
  cancelRequest: (id: string) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  closeRequest: (id: string) => void;
  resetDemo: () => void;
  memberById: (id: string) => Member | undefined;
  createResource: (draft: ResourceDraft) => void;
  updateResource: (id: string, draft: Partial<ResourceDraft>) => void;
  removeResource: (id: string) => void;
  toasts: Toast[];
  notify: (message: string) => void;
};

const AppContext = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* stockage indisponible (navigation privée) : on continue sans persistance */
    }
  }, [state]);

  const notify = useCallback((message: string) => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((list) => [...list, { id, message }]);
    window.setTimeout(
      () => setToasts((list) => list.filter((t) => t.id !== id)),
      3200,
    );
  }, []);

  const value = useMemo<Store>(() => {
    const resourceById = (id?: string) =>
      id ? state.resources.find((r) => r.id === id) : undefined;

    return {
      state,
      now: DEMO_NOW,
      resourceById,
      setRole: (role) => dispatch({ type: "role/set", role }),
      addToCart: (item) => {
        dispatch({ type: "cart/add", item });
        const resource = resourceById(item.resourceId);
        notify(`${resource?.name ?? "Ressource"} ajouté à votre panier`);
      },
      removeFromCart: (resourceId) =>
        dispatch({ type: "cart/remove", resourceId }),
      setCartQuantity: (resourceId, quantity) =>
        dispatch({ type: "cart/quantity", resourceId, quantity }),
      clearCart: () => dispatch({ type: "cart/clear" }),
      submitCart: () => {
        const payload: NewRequest[] = state.cart.flatMap((item) => {
          const resource = resourceById(item.resourceId);
          if (!resource) return [];
          return [
            {
              resourceId: item.resourceId,
              type: resource.workflow,
              start: item.start,
              end: item.end,
              purpose: item.purpose,
              quantity: item.quantity,
            },
          ];
        });
        if (!payload.length) return;
        // Une demande par exemplaire : le message compte les exemplaires.
        const exemplaires = payload.reduce((n, p) => n + (p.quantity ?? 1), 0);
        dispatch({ type: "request/create", payload });
        dispatch({ type: "cart/clear" });
        notify(
          exemplaires === 1
            ? "Demande envoyée à l'équipe du campus"
            : `${exemplaires} demandes envoyées à l'équipe du campus`,
        );
      },
      createRequest: (payload) => {
        dispatch({ type: "request/create", payload: [payload] });
        notify("Demande envoyée à l'équipe du campus");
      },
      cancelRequest: (id) => {
        dispatch({ type: "request/cancel", id });
        notify("Demande annulée");
      },
      approveRequest: (id) => {
        dispatch({ type: "request/approve", id });
        notify("Demande validée");
      },
      rejectRequest: (id) => {
        dispatch({ type: "request/reject", id });
        notify("Demande refusée");
      },
      closeRequest: (id) => {
        dispatch({ type: "request/close", id });
        notify("Opération clôturée");
      },
      resetDemo: () => {
        dispatch({ type: "state/reset" });
        notify("Démonstration réinitialisée");
      },
      memberById: (id) => state.members.find((m) => m.id === id),
      createResource: (draft) => {
        dispatch({ type: "resource/create", draft });
        notify(`${draft.name} ajouté au stock`);
      },
      updateResource: (id, draft) => {
        dispatch({ type: "resource/update", id, draft });
        notify("Fiche mise à jour");
      },
      removeResource: (id) => {
        dispatch({ type: "resource/remove", id });
        notify("Ressource retirée du stock");
      },
      toasts,
      notify,
    };
  }, [state, toasts, notify]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Store {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp doit être utilisé dans <AppProvider>");
  return ctx;
}

/* ============================================================
   Sélecteurs
   ============================================================ */

/** Les demandes du compte connecté : c'est la matière de l'espace de travail. */
export function useMyRequests() {
  const { state } = useApp();
  return useMemo(
    () => state.requests.filter((r) => r.requesterId === CURRENT_MEMBER_ID),
    [state.requests],
  );
}

export function useStats() {
  const { state, now } = useApp();
  return useMemo(() => {
    // Les ressources disponibles sont un fait du campus ; les autres compteurs
    // parlent du compte connecté, puisque la carte est sur « mon » tableau de bord.
    const available = state.resources.filter(
      (r) => stockOf(r, state.requests).available > 0,
    ).length;
    const mine = state.requests.filter(
      (r) => r.requesterId === CURRENT_MEMBER_ID,
    );
    const activeLoans = mine.filter(
      (r) =>
        r.type === "Emprunt" &&
        (r.status === "En cours" || r.status === "En retard"),
    ).length;
    const pending = mine.filter(
      (r) => r.type === "Emprunt" && r.status === "En attente",
    ).length;
    const overdue = mine.filter((r) => r.status === "En retard").length;
    const pendingAll = mine.filter((r) => r.status === "En attente").length;
    return { available, activeLoans, pending, overdue, pendingAll, now };
  }, [state, now]);
}

/** Indicateurs de pilotage : ceux-ci portent sur tout le campus. */
export function useAdminStats() {
  const { state, now } = useApp();
  return useMemo(() => {
    const { resources, requests } = state;
    const parc = resources.map((r) => ({ r, s: stockOf(r, requests) }));
    const exemplaires = parc.reduce((n, p) => n + p.s.total, 0);
    const exemplairesLibres = parc.reduce((n, p) => n + p.s.available, 0);
    // Une référence dont il ne reste qu'un exemplaire mérite un réassort.
    const faible = parc
      .filter((p) => p.s.tracked && p.s.total > 1 && p.s.available === 1)
      .map((p) => p.r);
    const toTreat = requests.filter((r) => r.status === "En attente");
    const out = requests.filter(
      (r) =>
        r.type === "Emprunt" &&
        (r.status === "En cours" || r.status === "En retard"),
    );
    const overdue = requests.filter((r) => r.status === "En retard");
    const maintenance = resources.filter((r) => r.state === "En maintenance");
    const available = resources.filter((r) => r.state === "Disponible");
    const upcoming = requests.filter(
      (r) =>
        r.type === "Réservation" &&
        ACTIVE_STATUSES.includes(r.status) &&
        new Date(r.start).getTime() >= now.getTime(),
    );
    return {
      total: resources.length,
      available,
      maintenance,
      toTreat,
      out,
      overdue,
      upcoming,
      exemplaires,
      exemplairesLibres,
      faible,
      /** Part des exemplaires immédiatement empruntables. */
      availability: exemplaires
        ? Math.round((exemplairesLibres / exemplaires) * 100)
        : 0,
      now,
    };
  }, [state, now]);
}

/** Les numéros de demande sont séquentiels : « #1004 » est plus récent que « #0999 ». */
export function byNumberDesc(a: Request, b: Request): number {
  return Number(b.number.slice(1)) - Number(a.number.slice(1));
}

/** Demandes encore vivantes, la plus récente en tête. */
export function useOpenRequests() {
  const mine = useMyRequests();
  return useMemo(() => mine.filter((r) => !isClosed(r)).sort(byNumberDesc), [mine]);
}

/** Opérations closes, la plus récente en premier — alimente l'historique. */
export function useClosedRequests() {
  const mine = useMyRequests();
  return useMemo(
    () =>
      mine
        .filter(isClosed)
        .sort(
          (a, b) =>
            new Date(b.closedAt ?? b.end).getTime() -
            new Date(a.closedAt ?? a.end).getTime(),
        ),
    [mine],
  );
}

export type ReservationPhase = "à venir" | "en cours" | "passée";

export function reservationPhase(request: Request, now: Date): ReservationPhase {
  if (isClosed(request)) return "passée";
  const start = new Date(request.start).getTime();
  const end = new Date(request.end).getTime();
  const ref = now.getTime();
  if (ref < start) return "à venir";
  if (ref > end) return "passée";
  return "en cours";
}
