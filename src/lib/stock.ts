import type { Request, Resource } from "../data/types";
import { ACTIVE_STATUSES } from "../data/types";

export type Stock = {
  total: number;
  maintenance: number;
  /** Exemplaires réellement dehors : la demande est en cours ou en retard. */
  out: number;
  /** Exemplaires promis mais encore au placard : demande en attente ou validée. */
  reserved: number;
  /** Ce qu'il reste à emprunter tout de suite. */
  available: number;
  /**
   * Vrai pour le matériel, dont on suit les exemplaires. Un espace ou un
   * véhicule se réserve au créneau : sa disponibilité se lit dans le planning,
   * pas dans un compteur.
   */
  tracked: boolean;
};

/** Demandes qui immobilisent un exemplaire de cette référence. */
export function holdsOn(requests: Request[], resourceId: string): Request[] {
  return requests.filter(
    (r) =>
      r.resourceId === resourceId &&
      r.type === "Emprunt" &&
      ACTIVE_STATUSES.includes(r.status),
  );
}

export function stockOf(resource: Resource, requests: Request[]): Stock {
  const total = resource.total ?? 1;
  const maintenance = Math.min(resource.maintenance ?? 0, total);
  const tracked = resource.workflow === "Emprunt";

  if (!tracked) {
    // Pour un espace, « disponible » veut dire : proposable à la réservation.
    return {
      total,
      maintenance,
      out: 0,
      reserved: 0,
      available: resource.state === "Disponible" ? total - maintenance : 0,
      tracked: false,
    };
  }

  const holds = holdsOn(requests, resource.id);
  // Sortir et réserver ne sont pas la même chose : un exemplaire promis à une
  // demande en attente n'a pas quitté le campus. Les confondre faussait les
  // compteurs et contredisait la colonne « Mouvement ».
  const out = holds.filter(
    (r) => r.status === "En cours" || r.status === "En retard",
  ).length;
  const reserved = holds.length - out;

  return {
    total,
    maintenance,
    out,
    reserved,
    available: Math.max(0, total - maintenance - out - reserved),
    tracked: true,
  };
}

/**
 * L'état affiché d'une référence de matériel découle de ses exemplaires :
 * tant qu'il en reste un, elle est disponible.
 */
export function deriveResourceState(
  resource: Resource,
  requests: Request[],
): Resource["state"] {
  const stock = stockOf(resource, requests);
  if (stock.maintenance >= stock.total && stock.total > 0) return "En maintenance";
  if (resource.state === "Indisponible") return "Indisponible";

  if (!stock.tracked) {
    // Un espace occupé à cet instant est réservé ; sinon son état reste celui
    // que le service campus lui a donné.
    const occupe = requests.some(
      (r) =>
        r.resourceId === resource.id &&
        (r.status === "En cours" || r.status === "En retard"),
    );
    if (occupe) return "Réservé";
    return resource.state === "En maintenance" ? "Disponible" : resource.state;
  }

  if (stock.available > 0) return "Disponible";
  return stock.out > 0 ? "Emprunté" : "Réservé";
}

/**
 * « 5 sur 8 disponibles ». Le pluriel suit le total : on compare toujours au
 * parc, pour que le chiffre reste vérifiable même à zéro.
 */
export function stockLabel(stock: Stock): string {
  if (!stock.tracked) {
    return stock.total > 1 ? `${stock.total} unités` : "Réservation au créneau";
  }
  return `${stock.available} sur ${stock.total} disponible${
    stock.total > 1 ? "s" : ""
  }`;
}

/**
 * Décomposition du parc, dans l'ordre où on la lit : ce qui reste, ce qui est
 * dehors, ce qui est promis, ce qui est immobilisé. Les nombres s'additionnent
 * jusqu'au total — c'est ce qui rend la colonne vérifiable d'un coup d'œil.
 */
export function stockBreakdown(stock: Stock): string[] {
  const parts: string[] = [];
  if (stock.out) parts.push(`${stock.out} sorti${stock.out > 1 ? "s" : ""}`);
  if (stock.reserved) parts.push(`${stock.reserved} réservé${stock.reserved > 1 ? "s" : ""}`);
  if (stock.maintenance) {
    parts.push(`${stock.maintenance} en maintenance`);
  }
  return parts;
}
