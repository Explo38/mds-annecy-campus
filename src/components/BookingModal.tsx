import { useMemo, useState } from "react";
import { Modal, Field } from "./ui";
import { Icon } from "./Icon";
import { StatusBadge } from "./StatusBadge";
import { useApp } from "../store/AppStore";
import type { Resource } from "../data/types";
import { fromInputValue, longDate, slot, toInputValue } from "../lib/format";
import { conflictMessage, findConflict, freeUnitsOver, validateSlot } from "../lib/rules";
import { stockLabel, stockOf } from "../lib/stock";

/** Créneau proposé : demain 9 h → 12 h pour un espace, 9 h → J+3 18 h pour un prêt. */
function defaultSlot(now: Date, resource: Resource) {
  const start = new Date(now);
  start.setDate(start.getDate() + 1);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start);
  if (resource.workflow === "Réservation") {
    end.setHours(12, 0, 0, 0);
  } else {
    end.setDate(end.getDate() + 3);
    end.setHours(18, 0, 0, 0);
  }
  return { start: toInputValue(start), end: toInputValue(end) };
}

export function BookingModal({
  resource,
  slot: creneau,
  onClose,
}: {
  resource: Resource;
  /** Créneau pré-rempli, quand on arrive depuis la grille des disponibilités. */
  slot?: { start: string; end: string };
  onClose: () => void;
}) {
  const { state, now, addToCart } = useApp();
  const initial = creneau ?? defaultSlot(now, resource);
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [purpose, setPurpose] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const stock = stockOf(resource, state.requests);

  /** Exemplaires réellement libres sur la période choisie. */
  const libres = useMemo(
    () =>
      freeUnitsOver(
        state.requests,
        resource,
        fromInputValue(start),
        fromInputValue(end),
      ),
    [state.requests, resource, start, end],
  );

  const error = useMemo(() => {
    const slotError = validateSlot(start, end);
    if (slotError) return slotError;
    const conflict = findConflict(
      state.requests,
      resource,
      fromInputValue(start),
      fromInputValue(end),
    );
    if (conflict) return conflictMessage(conflict, resource);
    if (quantity > libres) {
      return `Il ne reste que ${libres} exemplaire${libres > 1 ? "s" : ""} sur cette période.`;
    }
    return undefined;
  }, [start, end, state.requests, resource, quantity, libres]);

  /** Créneaux déjà pris sur cette ressource : on les montre pour éviter l'aller-retour. */
  const booked = useMemo(
    () =>
      state.requests
        .filter(
          (r) =>
            r.resourceId === resource.id &&
            !["Refusée", "Annulée", "Restitué", "Terminée"].includes(r.status),
        )
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [state.requests, resource.id],
  );

  const submit = () => {
    setSubmitted(true);
    if (error) return;
    addToCart({
      resourceId: resource.id,
      quantity,
      start: fromInputValue(start),
      end: fromInputValue(end),
      purpose,
    });
    onClose();
  };

  const unavailable =
    resource.state === "En maintenance" || resource.state === "Indisponible";

  return (
    <Modal
      title={resource.workflow === "Emprunt" ? "Emprunter" : "Réserver un créneau"}
      subtitle={resource.name}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={submit}
            disabled={unavailable || libres === 0}
          >
            <Icon name="plus" />
            Ajouter au panier
          </button>
        </>
      }
    >
      <div className="detail-hero">
        <span className="detail-hero__icon" aria-hidden="true">
          <Icon name={resource.icon} size={26} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="resource-card__category">{resource.category}</p>
          <p className="cell-primary">{resource.name}</p>
          <p className="cell-secondary">
            {resource.location} · {resource.ref}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <StatusBadge status={resource.state} />
          <p className="cell-secondary">{stockLabel(stock)}</p>
        </div>
      </div>

      {unavailable ? (
        <p className="form-field__error">
          Cette ressource est indisponible : {resource.state.toLowerCase()}.
        </p>
      ) : null}

      <div className="form-grid">
        <Field label="Début">
          <input
            type="datetime-local"
            className="control"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </Field>
        <Field label="Fin">
          <input
            type="datetime-local"
            className="control"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </Field>
      </div>

      {/* Choisir une quantité n'a de sens que pour du matériel en plusieurs
          exemplaires : un espace se réserve à l'unité. */}
      {stock.tracked && stock.total > 1 ? (
        <Field
          label="Nombre d’exemplaires"
          hint={`${libres} disponible${libres > 1 ? "s" : ""} sur la période choisie.`}
        >
          <div className="stepper">
            <button
              type="button"
              className="stepper__btn"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Retirer un exemplaire"
            >
              −
            </button>
            <span className="stepper__value" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className="stepper__btn"
              onClick={() => setQuantity((q) => Math.min(libres, q + 1))}
              disabled={quantity >= libres}
              aria-label="Ajouter un exemplaire"
            >
              +
            </button>
          </div>
        </Field>
      ) : null}

      <Field
        label="Motif"
        hint={
          resource.access === "Validation requise"
            ? "Validation requise : l’équipe du campus étudie chaque demande sur cette ressource."
            : "La demande part en attente de validation par l’équipe du campus."
        }
        error={submitted ? error : undefined}
      >
        <input
          className="control"
          value={purpose}
          placeholder="Projet de création, tournage, atelier…"
          onChange={(e) => setPurpose(e.target.value)}
        />
      </Field>

      {booked.length > 0 ? (
        <div>
          <p className="detail-item__label" style={{ marginBottom: 8 }}>
            {stock.tracked ? "Exemplaires déjà engagés" : "Créneaux déjà occupés"}
          </p>
          <ul>
            {booked.map((r) => (
              <li key={r.id} className="cell-secondary" style={{ marginTop: 4 }}>
                {longDate(r.start)} · {slot(r.start, r.end)} — {r.number}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Modal>
  );
}
