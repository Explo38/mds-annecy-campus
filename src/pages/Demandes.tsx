import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { StatusBadge } from "../components/StatusBadge";
import { PageHead, SearchField, SelectField, Tabs } from "../components/ui";
import { RequestList } from "../components/RequestList";
import { useUI } from "../components/Layout";
import { byNumberDesc, useApp, useMyRequests } from "../store/AppStore";
import { isClosed } from "../data/types";
import { period, shortDateTime } from "../lib/format";

/**
 * Écran « Les demandes » : présent dans la navigation de la maquette mais non
 * dessiné. Il est construit avec les mêmes composants que « Réservations » et
 * « Historique », et sert de poste de pilotage pour la vue Gestionnaire.
 */

const ALL_TYPES = "Tous les types";
const ALL_STATUSES = "Tous les statuts";

export function Demandes() {
  const { state } = useApp();
  const { openNewRequest, openDetail } = useUI();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");

  const tab = params.get("onglet") ?? "toutes";
  const typeFilter = params.get("type") ?? ALL_TYPES;
  const statusFilter = params.get("statut") ?? ALL_STATUSES;

  const setParam = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const mine = useMyRequests();
  const all = useMemo(() => [...mine].sort(byNumberDesc), [mine]);

  const byTab = useMemo(
    () => ({
      toutes: all,
      attente: all.filter((r) => r.status === "En attente"),
      validees: all.filter((r) => r.status === "Validée"),
      cours: all.filter(
        (r) => r.status === "En cours" || r.status === "En retard",
      ),
      closes: all.filter(isClosed),
    }),
    [all],
  );

  const statuses = useMemo(
    () => [ALL_STATUSES, ...Array.from(new Set(all.map((r) => r.status)))],
    [all],
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const source = byTab[tab as keyof typeof byTab] ?? byTab.toutes;
    return source.filter((r) => {
      if (typeFilter !== ALL_TYPES && r.type !== typeFilter) return false;
      if (statusFilter !== ALL_STATUSES && r.status !== statusFilter) return false;
      if (!needle) return true;
      return [r.label, r.descriptor, r.number, r.purpose, r.requester]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [byTab, tab, typeFilter, statusFilter, query]);

  const pendingCount = byTab.attente.length;

  return (
    <>
      <div className="page__inner">
        <PageHead
          title="Les demandes"
          subtitle={
            state.role === "Gestionnaire"
              ? `${pendingCount} demande${pendingCount > 1 ? "s" : ""} attend${
                  pendingCount > 1 ? "ent" : ""
                } votre validation.`
              : "Suivez l’avancement de chaque emprunt et de chaque réservation."
          }
          action={
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => openNewRequest()}
            >
              <Icon name="plus" />
              Nouvelle demande
            </button>
          }
        />

        <Tabs
          items={[
            { id: "toutes", label: "Toutes", count: byTab.toutes.length },
            { id: "attente", label: "En attente", count: byTab.attente.length },
            { id: "validees", label: "Validées", count: byTab.validees.length },
            { id: "cours", label: "En cours", count: byTab.cours.length },
            { id: "closes", label: "Clôturées", count: byTab.closes.length },
          ]}
          value={tab}
          onChange={(id) => setParam("onglet", id, "toutes")}
        />

        <div className="filters">
          <SearchField
            label="Rechercher une demande"
            placeholder="Rechercher une demande, une ressource, un numéro…"
            value={query}
            onChange={setQuery}
          />
          <SelectField
            label="Type"
            value={typeFilter}
            options={[ALL_TYPES, "Emprunt", "Réservation"]}
            onChange={(value) => setParam("type", value, ALL_TYPES)}
          />
          <SelectField
            label="Statut"
            value={statusFilter}
            options={statuses}
            onChange={(value) => setParam("statut", value, ALL_STATUSES)}
          />
        </div>
      </div>

      <div className="page__body">
        <RequestList
          title="Toutes mes demandes"
          meta={`${rows.length} demande${rows.length > 1 ? "s" : ""} · Les plus récentes en premier`}
          columns={["Ressource", "Période", "Type de demande", "Statut"]}
          rows={rows.map((request) => ({
            request,
            cells: [
              { primary: request.label, secondary: request.descriptor },
              {
                primary: period(request.start, request.end),
                secondary: `Échéance : ${shortDateTime(request.end)}`,
              },
              {
                primary: request.type,
                secondary: `${request.number} · ${request.purpose}`,
              },
            ],
            status: <StatusBadge status={request.status} />,
          }))}
          emptyLabel="Aucune demande ne correspond à ces filtres."
          onOpen={openDetail}
        />
      </div>

      <p className="list-footnote">
        {state.role === "Gestionnaire"
          ? "Ouvrez une demande pour la valider, la refuser ou la clôturer."
          : "Ouvrez une demande pour consulter le détail ou l’annuler."}
      </p>
    </>
  );
}
