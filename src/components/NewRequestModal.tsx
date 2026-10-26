import { useMemo, useState } from "react";
import { Modal, Field } from "./ui";
import { Icon } from "./Icon";
import { StatusBadge } from "./StatusBadge";
import { useApp } from "../store/AppStore";
import { fromInputValue, toInputValue } from "../lib/format";
import {
  conflictMessage,
  findConflict,
  freeUnitsOver,
  validateSlot,
} from "../lib/rules";
import { stockLabel, stockOf } from "../lib/stock";

/** Créneau proposé par défaut : le lendemain de la date de référence, 9 h → 12 h. */
function defaultSlot(now: Date) {
  const start = new Date(now);
  start.setDate(start.getDate() + 1);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start);
  end.setHours(12, 0, 0, 0);
  return { start: toInputValue(start), end: toInputValue(end) };
}

export function NewRequestModal({
  resourceId,
  onClose,
}: {
  resourceId?: string;
  onClose: () => void;
}) {
  const { state, now, createRequest } = useApp();

  const selectable = useMemo(
    () =>
      state.resources.filter(
        (r) => r.state !== "En maintenance" && r.state !== "Indisponible",
      ),
    [state.resources],
  );

  const initial = defaultSlot(now);
  const [selected, setSelected] = useState(
    resourceId ?? selectable[0]?.id ?? "",
  );
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [purpose, setPurpose] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const resource = state.resources.find((r) => r.id === selected);
  const stock = resource ? stockOf(resource, state.requests) : null;
  const libres = resource
    ? freeUnitsOver(state.requests, resource, fromInputValue(start), fromInputValue(end))
    : 0;

  const error = (() => {
    const slotError = validateSlot(start, end);
    if (slotError) return slotError;
    if (!resource) return "Choisissez une ressource.";
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
  })();

  const submit = () => {
    setSubmitted(true);
    if (error || !resource) return;
    createRequest({
      resourceId: resource.id,
      type: resource.workflow,
      start: fromInputValue(start),
      end: fromInputValue(end),
      purpose,
      quantity,
    });
    onClose();
  };

  return (
    <Modal
      title="Nouvelle demande"
      subtitle="Choisissez une ressource et le créneau souhaité."
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
            disabled={!resource}
          >
            <Icon name="plus" />
            Déposer la demande
          </button>
        </>
      }
    >
      {resource ? (
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
            {stock ? <p className="cell-secondary">{stockLabel(stock)}</p> : null}
          </div>
        </div>
      ) : null}

      <Field label="Ressource">
        <select
          className="control control--select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {selectable.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.category}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Type de demande"
        hint={
          resource?.access === "Validation requise"
            ? "Validation requise : l’équipe du campus étudie chaque demande sur cette ressource."
            : "La demande part en attente de validation par l’équipe du campus."
        }
      >
        <input className="control" value={resource?.workflow ?? ""} readOnly />
      </Field>

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

      {stock && stock.tracked && stock.total > 1 ? (
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
            <span className="stepper__value" aria-live="polite">{quantity}</span>
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
        hint="Facultatif — utile à l’équipe pour prioriser."
        error={submitted ? error : undefined}
      >
        <textarea
          className="control control--area"
          value={purpose}
          placeholder="Projet de création, tournage, atelier…"
          onChange={(e) => setPurpose(e.target.value)}
        />
      </Field>
    </Modal>
  );
}
