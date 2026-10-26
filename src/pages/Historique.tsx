import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { StatusBadge } from "../components/StatusBadge";
import { PageHead, SearchField, SelectField, Tabs } from "../components/ui";
import { RequestList } from "../components/RequestList";
import { useUI } from "../components/Layout";
import { useApp, useClosedRequests } from "../store/AppStore";
import { period, shortDateTime, time } from "../lib/format";
import type { Request } from "../data/types";

const ALL_PERIODS = "Toute la période";
const ALL_STATUSES = "Tous les statuts";

const PERIODS: Record<string, number | null> = {
  [ALL_PERIODS]: null,
  "7 derniers jours": 7,
  "30 derniers jours": 30,
  "3 derniers mois": 90,
};

/** Deuxième ligne de la colonne « Période et clôture ». */
function closureLabel(request: Request): string {
  switch (request.status) {
    case "Restitué":
      return request.closedAt
        ? `Restitué le ${shortDateTime(request.closedAt)}`
        : "Restitué";
    case "Terminée":
      return `${time(request.start)} – ${time(request.end)} · Créneau terminé`;
    case "Annulée":
      return request.closedAt
        ? `Annulée le ${shortDateTime(request.closedAt)}`
        : "Annulée";
    case "Refusée":
      return request.closedAt
        ? `Refusée le ${shortDateTime(request.closedAt)}`
        : "Refusée";
    default:
      return "";
  }
}

export function Historique() {
  const { now } = useApp();
  const { openNewRequest, openDetail } = useUI();
  const closed = useClosedRequests();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");

  const tab = params.get("onglet") ?? "tout";
  const periodFilter = params.get("periode") ?? ALL_PERIODS;
  const statusFilter = params.get("statut") ?? ALL_STATUSES;

  const setParam = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const byType = useMemo(
    () => ({
      tout: closed,
      emprunts: closed.filter((r) => r.type === "Emprunt"),
      reservations: closed.filter((r) => r.type === "Réservation"),
    }),
    [closed],
  );

  const statuses = useMemo(
    () => [ALL_STATUSES, ...Array.from(new Set(closed.map((r) => r.status)))],
    [closed],
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const days = PERIODS[periodFilter] ?? null;
    const floor =
      days === null ? null : now.getTime() - days * 24 * 60 * 60 * 1000;
    const source = byType[tab as keyof typeof byType] ?? byType.tout;

    return source.filter((r) => {
      if (statusFilter !== ALL_STATUSES && r.status !== statusFilter) return false;
      if (floor !== null) {
        const ref = new Date(r.closedAt ?? r.end).getTime();
        if (ref < floor) return false;
      }
      if (!needle) return true;
      return [r.label, r.descriptor, r.purpose, r.number, r.type]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [byType, tab, statusFilter, periodFilter, query, now]);

  return (
    <>
      <div className="page__inner">
        <PageHead
          title="Mon historique"
          subtitle="Tous vos emprunts et réservations passés, réunis au même endroit."
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
            { id: "tout", label: "Tout", count: byType.tout.length },
            { id: "emprunts", label: "Emprunts", count: byType.emprunts.length },
            {
              id: "reservations",
              label: "Réservations",
              count: byType.reservations.length,
            },
          ]}
          value={tab}
          onChange={(id) => setParam("onglet", id, "tout")}
        />

        <div className="filters">
          <SearchField
            label="Rechercher dans l’historique"
            placeholder="Rechercher une ressource ou une demande…"
            value={query}
            onChange={setQuery}
          />
          <SelectField
            label="Période"
            value={periodFilter}
            options={Object.keys(PERIODS)}
            onChange={(value) => setParam("periode", value, ALL_PERIODS)}
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
          title="Mes opérations passées"
          meta={`${rows.length} opération${rows.length > 1 ? "s" : ""} · Les plus récentes en premier`}
          columns={[
            "Ressource",
            "Période et clôture",
            "Type de demande",
            "Statut",
          ]}
          rows={rows.map((request) => ({
            request,
            cells: [
              { primary: request.label, secondary: request.descriptor },
              {
                primary: period(request.start, request.end),
                secondary: closureLabel(request),
              },
              {
                primary: request.type,
                secondary: `${request.number} · ${request.purpose}`,
              },
            ],
            status: <StatusBadge status={request.status} />,
          }))}
          emptyLabel="Aucune opération ne correspond à ces filtres."
          onOpen={openDetail}
        />
      </div>

      <p className="list-footnote">
        Les retours et l’état du matériel sont confirmés par l’équipe du campus.
      </p>
    </>
  );
}
