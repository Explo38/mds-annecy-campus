import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { StatusBadge } from "../../components/StatusBadge";
import { PageHead, SearchField, SelectField, Tabs } from "../../components/ui";
import { ResourceFormModal } from "../../components/ResourceFormModal";
import { useAdminStats, useApp } from "../../store/AppStore";
import { ACTIVE_STATUSES, type Request, type Resource } from "../../data/types";
import { shortDateTime } from "../../lib/format";
import { stockBreakdown, stockOf } from "../../lib/stock";
import { blockingRequest } from "../../lib/rules";

const ALL_CATEGORIES = "Toutes les catégories";
const ALL_STATES = "Tous les états";

export function AdminStock() {
  const { state, updateResource, removeResource } = useApp();
  const stats = useAdminStats();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Resource | null>(null);
  const [creating, setCreating] = useState(false);

  const tab = params.get("onglet") ?? "tout";
  const category = params.get("categorie") ?? ALL_CATEGORIES;
  const stateFilter = params.get("etat") ?? ALL_STATES;

  const setParam = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  /**
   * Pour chaque ressource : la demande qui la détient réellement, le prochain
   * créneau réservé, et le nombre de demandes qui attendent une décision.
   */
  const movementOf = useMemo(() => {
    const map = new Map<
      string,
      { holder?: Request; next?: Request; waiting: number }
    >();
    for (const request of state.requests) {
      const id = request.resourceId;
      if (!id || !ACTIVE_STATUSES.includes(request.status)) continue;
      const entry = map.get(id) ?? { waiting: 0 };
      if (request.status === "En cours" || request.status === "En retard") {
        entry.holder = request;
      } else if (request.status === "En attente") {
        entry.waiting += 1;
      } else if (
        !entry.next ||
        new Date(request.start) < new Date(entry.next.start)
      ) {
        entry.next = request;
      }
      map.set(id, entry);
    }
    return map;
  }, [state.requests]);

  /*
   * Les onglets reprennent mot pour mot les badges de la colonne « État » et
   * se partagent exactement les dix références : un onglet « Sorti » qui
   * regroupait empruntés et réservés contredisait la colonne voisine, où ces
   * deux mots ne veulent pas dire la même chose.
   */
  const byTab = useMemo(
    () => ({
      tout: state.resources,
      disponible: state.resources.filter((r) => r.state === "Disponible"),
      emprunte: state.resources.filter((r) => r.state === "Emprunté"),
      reserve: state.resources.filter((r) => r.state === "Réservé"),
      maintenance: state.resources.filter(
        (r) => r.state === "En maintenance" || r.state === "Indisponible",
      ),
    }),
    [state.resources],
  );

  /** Références dont il ne reste qu'un exemplaire : à réapprovisionner. */
  const aReapprovisionner = useMemo(
    () =>
      state.resources.filter((r) => {
        const st = stockOf(r, state.requests);
        return st.tracked && st.total > 1 && st.available === 1;
      }),
    [state.resources, state.requests],
  );

  const categories = useMemo(
    () => [
      ALL_CATEGORIES,
      ...Array.from(new Set(state.resources.map((r) => r.category))).sort(),
    ],
    [state.resources],
  );

  const states = useMemo(
    () => [
      ALL_STATES,
      ...Array.from(new Set(state.resources.map((r) => r.state))).sort(),
    ],
    [state.resources],
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const source = byTab[tab as keyof typeof byTab] ?? byTab.tout;
    return source.filter((r) => {
      if (category !== ALL_CATEGORIES && r.category !== category) return false;
      if (stateFilter !== ALL_STATES && r.state !== stateFilter) return false;
      if (!needle) return true;
      return [r.name, r.ref, r.category, r.location, r.note ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [byTab, tab, category, stateFilter, query]);

  const toggleMaintenance = (resource: Resource) => {
    updateResource(resource.id, {
      state: resource.state === "En maintenance" ? "Disponible" : "En maintenance",
    });
  };

  const remove = (resource: Resource) => {
    const blocking = blockingRequest(state.requests, resource.id);
    if (blocking) {
      window.alert(
        `Impossible de retirer ${resource.name} : la demande ${blocking.number} la mobilise encore.`,
      );
      return;
    }
    if (
      window.confirm(
        `Retirer ${resource.name} (${resource.ref}) du stock ? Cette fiche disparaîtra du catalogue.`,
      )
    ) {
      removeResource(resource.id);
    }
  };

  return (
    <>
      <div className="page__inner">
        <PageHead
          title="Stock"
          subtitle="L’inventaire du campus : ce qui est disponible, ce qui est sorti, ce qui est immobilisé."
          textWidth={470}
          action={
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setCreating(true)}
            >
              <Icon name="plus" />
              Ajouter une ressource
            </button>
          }
        />

        <Tabs
          items={[
            { id: "tout", label: "Tout le stock", count: byTab.tout.length },
            {
              id: "disponible",
              label: "Disponible",
              count: byTab.disponible.length,
            },
            { id: "emprunte", label: "Emprunté", count: byTab.emprunte.length },
            { id: "reserve", label: "Réservé", count: byTab.reserve.length },
            {
              id: "maintenance",
              label: "En maintenance",
              count: byTab.maintenance.length,
            },
          ]}
          value={tab}
          onChange={(id) => setParam("onglet", id, "tout")}
        />

        <div className="filters">
          <SearchField
            label="Rechercher dans le stock"
            placeholder="Rechercher un nom, une référence, un emplacement…"
            value={query}
            onChange={setQuery}
          />
          <SelectField
            label="Catégorie"
            value={category}
            options={categories}
            onChange={(value) => setParam("categorie", value, ALL_CATEGORIES)}
          />
          <SelectField
            label="État"
            value={stateFilter}
            options={states}
            onChange={(value) => setParam("etat", value, ALL_STATES)}
          />
        </div>
      </div>

      <div className="page__body">
        {/* Une référence sur son dernier exemplaire mérite d'être vue, pas
            cachée derrière un onglet dont le nom n'évoquait rien. */}
        {aReapprovisionner.length > 0 ? (
          <div className="callout" style={{ marginBottom: 16 }}>
            <span className="callout__icon" aria-hidden="true">
              <Icon name="box" size={16} />
            </span>
            <div>
              <strong>
                {aReapprovisionner.length} référence
                {aReapprovisionner.length > 1 ? "s" : ""} à réapprovisionner
              </strong>{" "}
              — {aReapprovisionner.map((r) => r.name).join(", ")}. Il n’en reste
              qu’un exemplaire empruntable.
            </div>
          </div>
        ) : null}

        <p className="catalog-count" style={{ marginBottom: 12 }}>
          {rows.length} référence{rows.length > 1 ? "s" : ""} sur{" "}
          {state.resources.length} · {stats.exemplairesLibres} exemplaires
          disponibles sur {stats.exemplaires}
        </p>

        <div className="table-card" style={{ marginTop: 0 }}>
          <table className="table">
            <colgroup>
              <col style={{ width: "24%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "17%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "19%" }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Ressource</th>
                <th scope="col">Catégorie</th>
                <th scope="col">Exemplaires</th>
                <th scope="col">En ce moment</th>
                <th scope="col">État</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr className="table__empty">
                  <td colSpan={6}>Aucune référence ne correspond à ces filtres.</td>
                </tr>
              ) : (
                rows.map((resource) => {
                  const movement = movementOf.get(resource.id);
                  const stock = stockOf(resource, state.requests);
                  const bas = stock.tracked && stock.total > 1 && stock.available === 1;
                  return (
                    <tr key={resource.id}>
                      <td>
                        <div className="resource-cell">
                          <span
                            className="resource-cell__icon"
                            aria-hidden="true"
                          >
                            <Icon name={resource.icon} />
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <p className="resource-cell__name">{resource.name}</p>
                            <p className="resource-cell__ref">
                              {resource.ref} · {resource.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="tag">{resource.category}</span>
                        <p className="resource-cell__ref" style={{ marginTop: 6 }}>
                          {resource.workflow} · {resource.access}
                        </p>
                      </td>
                      <td>
                        {stock.tracked ? (
                          <>
                            <p className="resource-cell__name">
                              {stock.available} sur {stock.total} disponible
                              {stock.total > 1 ? "s" : ""}
                            </p>
                            {/* Le détail s'additionne jusqu'au total : c'est ce
                                qui rend le chiffre vérifiable. */}
                            <p className="resource-cell__ref">
                              {stockBreakdown(stock).join(" · ") || "rien d’engagé"}
                            </p>
                            {bas ? (
                              <p className="tag tag--alerte" style={{ marginTop: 6 }}>
                                À réapprovisionner
                              </p>
                            ) : null}
                          </>
                        ) : (
                          <>
                            <p className="resource-cell__name">
                              {stock.total} unité{stock.total > 1 ? "s" : ""}
                            </p>
                            <p className="resource-cell__ref">
                              disponibilité au créneau
                            </p>
                          </>
                        )}
                      </td>
                      <td>
                        {movement?.holder ? (
                          <>
                            <p className="resource-cell__name">
                              {movement.holder.requester}
                            </p>
                            <p className="resource-cell__ref">
                              Retour le {shortDateTime(movement.holder.end)}
                            </p>
                          </>
                        ) : movement?.next ? (
                          <>
                            <p className="resource-cell__name">
                              Réservé · {movement.next.requester}
                            </p>
                            <p className="resource-cell__ref">
                              À partir du {shortDateTime(movement.next.start)}
                            </p>
                          </>
                        ) : (
                          <span className="resource-cell__ref">
                            {resource.note ?? "Libre"}
                          </span>
                        )}
                        {movement?.waiting ? (
                          <p className="resource-cell__ref">
                            {movement.waiting} demande
                            {movement.waiting > 1 ? "s" : ""} en attente
                          </p>
                        ) : null}
                      </td>
                      <td>
                        <StatusBadge status={resource.state} />
                      </td>
                      <td>
                        <div className="inline-actions">
                          <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            onClick={() => setEditing(resource)}
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            onClick={() => toggleMaintenance(resource)}
                          >
                            {resource.state === "En maintenance"
                              ? "Remettre en service"
                              : "Maintenance"}
                          </button>
                          <button
                            type="button"
                            className="table__action"
                            onClick={() => remove(resource)}
                            aria-label={`Retirer ${resource.name} du stock`}
                            title="Retirer du stock"
                          >
                            <Icon name="close" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="list-footnote">
        <b>Sorti</b> : l’exemplaire a quitté le campus. <b>Réservé</b> : il est
        promis à une demande mais encore au placard. Les deux comptent comme
        indisponibles, et une référence encore engagée ne peut pas être retirée
        du stock.
      </p>

      {creating ? <ResourceFormModal onClose={() => setCreating(false)} /> : null}
      {editing ? (
        <ResourceFormModal
          resource={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </>
  );
}
