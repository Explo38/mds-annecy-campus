import { Modal } from "./ui";
import { Icon } from "./Icon";
import { StatusBadge } from "./StatusBadge";
import { useApp } from "../store/AppStore";
import type { Request } from "../data/types";
import { isClosed } from "../data/types";
import {
  isSameDay,
  longDate,
  period,
  shortDateTime,
  slot,
} from "../lib/format";

function Detail({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  /** Deuxième ligne discrète : filière, précision, rappel. */
  hint?: string;
}) {
  return (
    <div>
      <p className="detail-item__label">{label}</p>
      <p className="detail-item__value">{value}</p>
      {hint ? <p className="cell-secondary">{hint}</p> : null}
    </div>
  );
}

export function RequestDetailModal({
  request,
  onClose,
}: {
  request: Request;
  onClose: () => void;
}) {
  const {
    state,
    resourceById,
    memberById,
    cancelRequest,
    approveRequest,
    rejectRequest,
    closeRequest,
  } = useApp();

  // On relit la demande dans le magasin : son statut peut changer sous nos yeux.
  const current = state.requests.find((r) => r.id === request.id) ?? request;
  const resource = resourceById(current.resourceId);
  const member = memberById(current.requesterId);
  const closed = isClosed(current);
  const isManager = state.role === "Gestionnaire";

  const act = (fn: (id: string) => void) => {
    fn(current.id);
    onClose();
  };

  return (
    <Modal
      title={`${current.type} ${current.number}`}
      subtitle={current.label}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Fermer
          </button>

          {!closed && isManager && current.status === "En attente" ? (
            <>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => act(rejectRequest)}
              >
                Refuser
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => act(approveRequest)}
              >
                <Icon name="check" />
                Valider
              </button>
            </>
          ) : null}

          {!closed && isManager && current.status !== "En attente" ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => act(closeRequest)}
            >
              <Icon name="check" />
              {current.type === "Emprunt" ? "Marquer restitué" : "Clôturer"}
            </button>
          ) : null}

          {!closed && !isManager ? (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => act(cancelRequest)}
            >
              Annuler la demande
            </button>
          ) : null}
        </>
      }
    >
      <div className="detail-hero">
        <span className="detail-hero__icon" aria-hidden="true">
          <Icon name={current.icon} size={26} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {resource ? (
            <p className="resource-card__category">{resource.category}</p>
          ) : null}
          <p className="cell-primary">{current.label}</p>
          <p className="cell-secondary">{current.descriptor}</p>
        </div>
        <StatusBadge status={current.status} />
      </div>

      <div className="detail-grid">
        <Detail label="Type" value={current.type} />
        <Detail label="Motif" value={current.purpose} />
        <Detail
          label={current.type === "Emprunt" ? "Période" : "Date"}
          value={
            current.type === "Emprunt"
              ? period(current.start, current.end)
              : longDate(current.start)
          }
        />
        <Detail
          label="Créneau"
          value={
            isSameDay(current.start, current.end)
              ? slot(current.start, current.end)
              : `Du ${shortDateTime(current.start)} au ${shortDateTime(current.end)}`
          }
        />
        <Detail
          label="Demandé par"
          value={current.requester}
          hint={member ? `${member.affiliation} · ${member.email}` : undefined}
        />
        <Detail label="Nature" value={current.requesterNote} />
        <Detail label="Déposée le" value={shortDateTime(current.createdAt)} />
        <Detail
          label="Clôture"
          value={current.closedAt ? shortDateTime(current.closedAt) : "—"}
        />
        {resource ? (
          <>
            <Detail label="Référence" value={resource.ref} />
            <Detail label="Localisation" value={resource.location} />
          </>
        ) : null}
      </div>

      {!isManager && !closed ? (
        <p className="form-field__hint">
          Passez en vue « Gestionnaire » dans l’en-tête pour valider, refuser ou
          clôturer cette demande.
        </p>
      ) : null}
    </Modal>
  );
}
