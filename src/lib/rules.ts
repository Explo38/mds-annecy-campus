import type { Request, Resource } from "../data/types";
import { ACTIVE_STATUSES, isClosed } from "../data/types";
import { longDate, slot } from "./format";
import { stockOf } from "./stock";

/** Demandes actives sur cette ressource dont le créneau recoupe [start, end[. */
function overlapping(
  requests: Request[],
  resourceId: string,
  start: string,
  end: string,
  ignoreId?: string,
): Request[] {
  const from = new Date(start).getTime();
  const to = new Date(end).getTime();
  return requests.filter((r) => {
    if (r.id === ignoreId) return false;
    if (r.resourceId !== resourceId) return false;
    if (isClosed(r)) return false;
    const rStart = new Date(r.start).getTime();
    const rEnd = new Date(r.end).getTime();
    return from < rEnd && to > rStart;
  });
}

export type Conflict =
  | { kind: "créneau"; request: Request }
  | { kind: "épuisé"; pris: number; utilisables: number };

/**
 * « Les créneaux qui se chevauchent sont bloqués automatiquement » — la note de
 * bas de page de l'écran Réservations.
 *
 * Un espace ne peut accueillir qu'une réservation à la fois. Du matériel en
 * plusieurs exemplaires accepte autant de demandes simultanées qu'il en reste :
 * le chevauchement ne bloque que lorsque le dernier exemplaire est pris.
 */
export function findConflict(
  requests: Request[],
  resource: Resource,
  start: string,
  end: string,
  ignoreId?: string,
): Conflict | undefined {
  const chevauchements = overlapping(requests, resource.id, start, end, ignoreId);
  const stock = stockOf(resource, requests);
  const utilisables = Math.max(0, stock.total - stock.maintenance);

  if (resource.workflow === "Réservation") {
    return chevauchements.length >= utilisables
      ? { kind: "créneau", request: chevauchements[0] }
      : undefined;
  }

  // Pour le matériel, on compte les exemplaires déjà promis sur la période.
  const pris = chevauchements.filter((r) => r.type === "Emprunt").length;
  return pris >= utilisables ? { kind: "épuisé", pris, utilisables } : undefined;
}

export function conflictMessage(conflict: Conflict, resource: Resource): string {
  if (conflict.kind === "créneau") {
    const c = conflict.request;
    return `Créneau déjà pris : ${c.number} le ${longDate(c.start)} (${slot(
      c.start,
      c.end,
    )}).`;
  }
  if (conflict.utilisables === 0) {
    return `Aucun exemplaire disponible : les ${resource.total} sont immobilisés.`;
  }
  return `Plus d’exemplaire libre sur cette période : ${conflict.pris} sur ${conflict.utilisables} déjà demandés.`;
}

/** Contrôles communs à la création d'une demande. */
export function validateSlot(start: string, end: string): string | undefined {
  if (!start || !end) return "Renseignez un début et une fin.";
  if (new Date(end).getTime() <= new Date(start).getTime()) {
    return "La fin doit être postérieure au début.";
  }
  return undefined;
}

/**
 * Combien d'exemplaires restent réellement empruntables sur une période — ce
 * qui plafonne la quantité qu'on peut mettre au panier.
 */
export function freeUnitsOver(
  requests: Request[],
  resource: Resource,
  start: string,
  end: string,
): number {
  const stock = stockOf(resource, requests);
  const utilisables = Math.max(0, stock.total - stock.maintenance);
  const pris = overlapping(requests, resource.id, start, end).length;
  return Math.max(0, utilisables - pris);
}

/** Une référence encore engagée ne peut pas quitter le stock. */
export function blockingRequest(
  requests: Request[],
  resourceId: string,
): Request | undefined {
  return requests.find(
    (r) => r.resourceId === resourceId && ACTIVE_STATUSES.includes(r.status),
  );
}
