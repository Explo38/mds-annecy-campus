import type { IconName } from "../components/Icon";

/** Une ressource du catalogue campus. */
export type Resource = {
  id: string;
  name: string;
  category: string;
  location: string;
  ref: string;
  icon: IconName;
  /** Ce que l'on peut faire de la ressource : l'emprunter ou réserver un créneau. */
  workflow: "Emprunt" | "Réservation";
  state: ResourceState;
  /** « Accès direct » ou « Validation requise » (bas de la carte catalogue). */
  access: "Accès direct" | "Validation requise";
  /** Descripteur court repris dans les listes (« Salle · 24 places »). */
  descriptor: string;
  /** Note interne du service campus, visible seulement en administration. */
  note?: string;
  /**
   * Nombre d'exemplaires identiques sous cette référence. Un espace ou un
   * véhicule en a un seul ; un parc d'ordinateurs peut en compter plusieurs.
   */
  total: number;
  /** Exemplaires immobilisés (atelier, panne, perte). */
  maintenance: number;
};

export type ResourceState =
  | "Disponible"
  | "Emprunté"
  | "Réservé"
  | "En maintenance"
  | "Indisponible";

/**
 * Les 14 statuts du kit UI Figma. Un emprunt et une réservation partagent le
 * même cycle de vie : on demande, l'équipe valide, la ressource circule, on clôture.
 */
export type RequestStatus =
  | "En attente"
  | "Validée"
  | "En cours"
  | "En retard"
  | "Refusée"
  | "Annulée"
  | "Restitué"
  | "Terminée";

export type RequestType = "Emprunt" | "Réservation";

/**
 * Une demande : c'est l'objet métier central. Le tableau de bord, la page
 * « Les demandes », « Réservations » et « Historique » sont quatre vues de cette
 * même collection.
 */
export type Request = {
  id: string;
  /** Numéro affiché (« #1004 »). */
  number: string;
  type: RequestType;
  status: RequestStatus;
  /** Ressource du catalogue, quand la demande en vise une. */
  resourceId?: string;
  /** Libellé affiché ; repris de la maquette pour les demandes de démonstration. */
  label: string;
  /** Deuxième ligne dans les listes (« Salle · 24 places », « MDS-PC-001 »). */
  descriptor: string;
  icon: IconName;
  /** Début et fin du créneau / de la période d'emprunt (ISO). */
  start: string;
  end: string;
  /** Membre à l'origine de la demande. */
  requesterId: string;
  requester: string;
  requesterNote: string;
  /** Motif (« Projet de création »). */
  purpose: string;
  /** Date de clôture : restitution, annulation ou refus (ISO). */
  closedAt?: string;
  createdAt: string;
};

export type Activity = {
  id: string;
  label: string;
  at: string;
};

export type Role = "Étudiant" | "Professeur" | "Gestionnaire";

export type CartItem = {
  resourceId: string;
  /** Nombre d'exemplaires souhaités. */
  quantity: number;
  /** Créneau souhaité, saisi au moment de l'ajout au panier. */
  start: string;
  end: string;
  purpose: string;
};

/** Statuts considérés comme clos : ils alimentent l'historique. */
export const CLOSED_STATUSES: RequestStatus[] = [
  "Refusée",
  "Annulée",
  "Restitué",
  "Terminée",
];

export function isClosed(request: Request): boolean {
  return CLOSED_STATUSES.includes(request.status);
}

/** Un compte du campus. La vue d'administration travaille sur ces personnes. */
export type Member = {
  id: string;
  name: string;
  initials: string;
  role: Role;
  /** Filière, département ou service. */
  affiliation: string;
  email: string;
};

/** Identifiant du compte connecté dans la démonstration. */
export const CURRENT_MEMBER_ID = "m-sophie";

/** Une demande en cours immobilise la ressource ; une demande close la libère. */
export const ACTIVE_STATUSES: RequestStatus[] = [
  "En attente",
  "Validée",
  "En cours",
  "En retard",
];
