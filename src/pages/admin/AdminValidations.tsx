import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { StatusBadge } from "../../components/StatusBadge";
import { PageHead, SearchField, SelectField, Tabs } from "../../components/ui";
import { useUI } from "../../components/Layout";
import { useApp } from "../../store/AppStore";
import { isClosed } from "../../data/types";
import { isSameDay, longDate, period, shortDateTime, slot } from "../../lib/format";

const ALL_TYPES = "Tous les types";
const ALL_MEMBERS = "Tout le campus";

export function AdminValidations() {
  const { state, memberById, approveRequest, rejectRequest, closeRequest } =
    useApp();
  const { openDetail } = useUI();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");

  const tab = params.get("onglet") ?? "traiter";
  const typeFilter = params.get("type") ?? ALL_TYPES;
  const memberFilter = params.get("membre") ?? ALL_MEMBERS;

  const setParam = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const byTab = useMemo(
    () => ({
      // Les plus anciennes d'abord : ce sont elles qui font attendre.
      traiter: state.requests
        .filter((r) => r.status === "En attente")
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
      retards: state.requests.filter((r) => r.status === "En retard"),
      cours: state.requests.filter(
        (r) => r.status === "En cours" || r.status === "Validée",
      ),
      traitees: state.requests
        .filter(isClosed)
        .sort(
          (a, b) =>
            new Date(b.closedAt ?? b.end).getTime() -
            new Date(a.closedAt ?? a.end).getTime(),
        ),
    }),
    [state.requests],
  );

  const memberNames = useMemo(
    () => [ALL_MEMBERS, ...state.members.map((m) => m.name)],
    [state.members],
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const source = byTab[tab as keyof typeof byTab] ?? byTab.traiter;
    return source.filter((r) => {
      if (typeFilter !== ALL_TYPES && r.type !== typeFilter) return false;
      if (memberFilter !== ALL_MEMBERS && r.requester !== memberFilter)
        return false;
      if (!needle) return true;
      return [r.label, r.descriptor, r.number, r.purpose, r.requester]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [byTab, tab, typeFilter, memberFilter, query]);

  const title =
    tab === "retards"
      ? "Retours en retard"
      : tab === "cours"
        ? "Demandes en circulation"
        : tab === "traitees"
          ? "Demandes traitées"
          : "Demandes à traiter";

  return (
    <>
      <div className="page__inner">
        <PageHead
          title="Validations"
          subtitle="Chaque demande du campus passe ici : on valide, on refuse, on clôture."
          textWidth={460}
        />

        <Tabs
          items={[
            { id: "traiter", label: "À traiter", count: byTab.traiter.length },
            { id: "retards", label: "Retards", count: byTab.retards.length },
            { id: "cours", label: "En circulation", count: byTab.cours.length },
            { id: "traitees", label: "Traitées", count: byTab.traitees.length },
          ]}
          value={tab}
          onChange={(id) => setParam("onglet", id, "traiter")}
        />

        <div className="filters">
          <SearchField
            label="Rechercher une demande"
            placeholder="Rechercher une demande, une ressource, une personne…"
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
            label="Membre"
            value={memberFilter}
            options={memberNames}
            onChange={(value) => setParam("membre", value, ALL_MEMBERS)}
          />
        </div>
      </div>

      <div className="page__body">
        <section className="panel">
          <div className="panel__head" style={{ borderBottom: 0 }}>
            <h2 className="panel__title" style={{ fontSize: 15 }}>
              {title}
            </h2>
            <span className="panel__meta">
              {rows.length} demande{rows.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="list-head list-cols--admin" role="row">
            <span>Demandeur</span>
            <span>Ressource</span>
            <span>Créneau</span>
            <span>Statut</span>
            <span>
              <span className="visually-hidden">Actions</span>
            </span>
          </div>

          {rows.length === 0 ? (
            <p className="list-empty">
              {tab === "traiter"
                ? "Rien à traiter, tout est à jour."
                : "Aucune demande dans cette vue."}
            </p>
          ) : (
            rows.map((request) => {
              const member = memberById(request.requesterId);
              const closed = isClosed(request);
              return (
                <div key={request.id} className="list-row list-cols--admin">
                  <span className="person-cell">
                    <span className="avatar avatar--sm" aria-hidden="true">
                      {member?.initials ?? "?"}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span className="cell-primary" style={{ display: "block" }}>
                        {request.requester}
                      </span>
                      <span className="cell-secondary">
                        {member?.affiliation ?? request.requesterNote}
                      </span>
                    </span>
                  </span>

                  <span style={{ minWidth: 0 }}>
                    <span className="cell-primary" style={{ display: "block" }}>
                      {request.label}
                    </span>
                    <span className="cell-secondary">
                      {request.number} · {request.purpose}
                    </span>
                  </span>

                  <span style={{ minWidth: 0 }}>
                    {/* Un créneau tient dans la journée ; un emprunt court sur
                        plusieurs jours et se lit comme une période. */}
                    <span className="cell-primary" style={{ display: "block" }}>
                      {isSameDay(request.start, request.end)
                        ? longDate(request.start)
                        : period(request.start, request.end)}
                    </span>
                    <span className="cell-secondary">
                      {closed && request.closedAt
                        ? `Clôturée le ${shortDateTime(request.closedAt)}`
                        : isSameDay(request.start, request.end)
                          ? slot(request.start, request.end)
                          : `Retour attendu le ${shortDateTime(request.end)}`}
                    </span>
                  </span>

                  <span>
                    <StatusBadge status={request.status} />
                  </span>

                  <span className="inline-actions">
                    {request.status === "En attente" ? (
                      <>
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() => rejectRequest(request.id)}
                        >
                          Refuser
                        </button>
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => approveRequest(request.id)}
                        >
                          Valider
                        </button>
                      </>
                    ) : !closed ? (
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => closeRequest(request.id)}
                      >
                        {request.type === "Emprunt" ? "Marquer restitué" : "Clôturer"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="table__action"
                      onClick={() => openDetail(request)}
                      aria-label={`Ouvrir la demande ${request.number}`}
                    >
                      <Icon name="arrowRight" />
                    </button>
                  </span>
                </div>
              );
            })
          )}
        </section>
      </div>

      <p className="list-footnote">
        Valider une demande immobilise la ressource ; la refuser ou la clôturer la
        remet en circulation.
      </p>
    </>
  );
}
