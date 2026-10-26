import { useState } from "react";
import { Modal, Field } from "./ui";
import { Icon } from "./Icon";
import { useApp, type ResourceDraft } from "../store/AppStore";
import type { Resource, ResourceState } from "../data/types";

const STATES: ResourceState[] = [
  "Disponible",
  "Emprunté",
  "Réservé",
  "En maintenance",
  "Indisponible",
];

const EMPTY: ResourceDraft = {
  name: "",
  category: "",
  location: "",
  ref: "",
  descriptor: "",
  workflow: "Emprunt",
  access: "Accès direct",
  state: "Disponible",
  note: "",
  total: 1,
  maintenance: 0,
};

/** Création et édition d'une fiche de stock. */
export function ResourceFormModal({
  resource,
  onClose,
}: {
  /** Absent : on crée une nouvelle ressource. */
  resource?: Resource;
  onClose: () => void;
}) {
  const { state, createResource, updateResource } = useApp();
  const [draft, setDraft] = useState<ResourceDraft>(
    resource
      ? {
          name: resource.name,
          category: resource.category,
          location: resource.location,
          ref: resource.ref,
          descriptor: resource.descriptor,
          workflow: resource.workflow,
          access: resource.access,
          state: resource.state,
          note: resource.note ?? "",
          total: resource.total,
          maintenance: resource.maintenance,
        }
      : EMPTY,
  );
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof ResourceDraft>(key: K, value: ResourceDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const refTaken = state.resources.some(
    (r) => r.ref.trim().toLowerCase() === draft.ref.trim().toLowerCase() &&
      r.id !== resource?.id,
  );

  const sorties = resource
    ? state.requests.filter(
        (r) =>
          r.resourceId === resource.id &&
          r.type === "Emprunt" &&
          ["En attente", "Validée", "En cours", "En retard"].includes(r.status),
      ).length
    : 0;

  const error = !draft.name.trim()
    ? "Donnez un nom à la ressource."
    : !draft.ref.trim()
      ? "La référence est obligatoire : c’est elle qui identifie l’exemplaire."
      : refTaken
        ? `La référence ${draft.ref} est déjà utilisée.`
        : !draft.category.trim()
          ? "Choisissez une catégorie."
          : draft.total < 1
            ? "Une référence compte au moins un exemplaire."
            : draft.maintenance > draft.total
              ? "Plus d’exemplaires immobilisés que le parc n’en compte."
              : draft.total - draft.maintenance < sorties
                ? `${sorties} exemplaire${sorties > 1 ? "s sont" : " est"} actuellement en circulation : le parc utilisable ne peut pas descendre en dessous.`
                : undefined;

  const submit = () => {
    setSubmitted(true);
    if (error) return;
    const payload: ResourceDraft = {
      ...draft,
      name: draft.name.trim(),
      ref: draft.ref.trim().toUpperCase(),
      category: draft.category.trim(),
      location: draft.location.trim() || "Emplacement à préciser",
      descriptor: draft.descriptor.trim() || draft.category.trim(),
      note: draft.note?.trim() || undefined,
      total: Math.max(1, Math.round(draft.total)),
      maintenance: Math.max(0, Math.round(draft.maintenance)),
    };
    if (resource) updateResource(resource.id, payload);
    else createResource(payload);
    onClose();
  };

  const categories = Array.from(
    new Set(state.resources.map((r) => r.category)),
  ).sort();

  return (
    <Modal
      title={resource ? "Modifier la fiche" : "Ajouter au stock"}
      subtitle={
        resource
          ? resource.ref
          : "Une fiche par référence, avec son nombre d’exemplaires."
      }
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="btn btn--primary" onClick={submit}>
            <Icon name={resource ? "check" : "plus"} />
            {resource ? "Enregistrer" : "Ajouter au stock"}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Nom">
          <input
            className="control"
            value={draft.name}
            placeholder="MacBook Pro 14″"
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label="Référence">
          <input
            className="control"
            value={draft.ref}
            placeholder="MDS-PC-011"
            onChange={(e) => set("ref", e.target.value)}
          />
        </Field>
      </div>

      <div className="form-grid">
        <Field label="Catégorie">
          <input
            className="control"
            list="categories-stock"
            value={draft.category}
            placeholder="Informatique"
            onChange={(e) => set("category", e.target.value)}
          />
          <datalist id="categories-stock">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Emplacement">
          <input
            className="control"
            value={draft.location}
            placeholder="Accueil · Bâtiment A"
            onChange={(e) => set("location", e.target.value)}
          />
        </Field>
      </div>

      <div className="form-grid">
        <Field
          label="Circulation"
          hint="Un matériel s’emprunte, un espace ou un véhicule se réserve."
        >
          <select
            className="control control--select"
            value={draft.workflow}
            onChange={(e) =>
              set("workflow", e.target.value as ResourceDraft["workflow"])
            }
          >
            <option value="Emprunt">Emprunt</option>
            <option value="Réservation">Réservation</option>
          </select>
        </Field>
        <Field label="État">
          <select
            className="control control--select"
            value={draft.state}
            onChange={(e) => set("state", e.target.value as ResourceState)}
          >
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="form-grid">
        <Field label="Accès">
          <select
            className="control control--select"
            value={draft.access}
            onChange={(e) =>
              set("access", e.target.value as ResourceDraft["access"])
            }
          >
            <option value="Accès direct">Accès direct</option>
            <option value="Validation requise">Validation requise</option>
          </select>
        </Field>
        <Field
          label="Descripteur"
          hint="Deuxième ligne dans les listes."
        >
          <input
            className="control"
            value={draft.descriptor}
            placeholder="Salle · 24 places"
            onChange={(e) => set("descriptor", e.target.value)}
          />
        </Field>
      </div>

      <div className="form-grid">
        <Field
          label="Exemplaires"
          hint="Combien d’unités identiques sous cette référence."
        >
          <input
            type="number"
            min={1}
            className="control"
            value={draft.total}
            onChange={(e) => set("total", Number(e.target.value) || 1)}
          />
        </Field>
        <Field
          label="Immobilisés"
          hint={
            sorties
              ? `${sorties} en circulation actuellement.`
              : "Atelier, panne, perte."
          }
        >
          <input
            type="number"
            min={0}
            max={draft.total}
            className="control"
            value={draft.maintenance}
            onChange={(e) => set("maintenance", Number(e.target.value) || 0)}
          />
        </Field>
      </div>

      <Field
        label="Note interne"
        hint="Visible uniquement en administration."
        error={submitted ? error : undefined}
      >
        <textarea
          className="control control--area"
          value={draft.note ?? ""}
          placeholder="Clavier à remplacer, retour atelier prévu…"
          onChange={(e) => set("note", e.target.value)}
        />
      </Field>
    </Modal>
  );
}
