import type { RequestStatus, ResourceState } from "../data/types";

/**
 * Reprise du composant Figma « Statut » et de ses 14 variantes : chacune a sa
 * teinte, sa graisse et son rembourrage propres dans le kit.
 */
export type StatusLabel = RequestStatus | ResourceState | "Confirmée";

type Tone = "success" | "warning" | "info" | "danger" | "neutral";
type Size = "sm" | "md" | "lg";

const STYLES: Record<StatusLabel, { tone: Tone; size: Size }> = {
  Confirmée: { tone: "success", size: "lg" },
  "En attente": { tone: "warning", size: "lg" },
  Disponible: { tone: "success", size: "md" },
  Emprunté: { tone: "info", size: "md" },
  Réservé: { tone: "info", size: "md" },
  "En maintenance": { tone: "warning", size: "md" },
  Indisponible: { tone: "neutral", size: "lg" },
  "En retard": { tone: "danger", size: "sm" },
  Validée: { tone: "info", size: "sm" },
  "En cours": { tone: "info", size: "sm" },
  Annulée: { tone: "neutral", size: "lg" },
  Refusée: { tone: "neutral", size: "lg" },
  Restitué: { tone: "success", size: "lg" },
  Terminée: { tone: "success", size: "lg" },
};

/**
 * Sur l'écran « Les réservations », une demande validée se lit « Confirmée » :
 * c'est le vocabulaire retenu dans la maquette pour ce contexte.
 */
export function reservationStatus(status: RequestStatus): StatusLabel {
  return status === "Validée" ? "Confirmée" : status;
}

export function StatusBadge({ status }: { status: StatusLabel }) {
  const style = STYLES[status] ?? { tone: "neutral" as Tone, size: "lg" as Size };
  return (
    <span className={`status status--${style.size} status--${style.tone}`}>
      {status}
    </span>
  );
}
