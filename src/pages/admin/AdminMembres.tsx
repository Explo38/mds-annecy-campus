import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { StatusBadge } from "../../components/StatusBadge";
import { PageHead, SearchField, SelectField, Tabs } from "../../components/ui";
import { useUI } from "../../components/Layout";
import { useApp } from "../../store/AppStore";
import { ACTIVE_STATUSES, isClosed, type Member } from "../../data/types";
import { shortDateTime } from "../../lib/format";

const ALL_ROLES = "Tous les rôles";

type MemberRow = {
  member: Member;
  active: number;
  pending: number;
  overdue: number;
  closed: number;
  lastActivity?: string;
};

export function AdminMembres() {
  const { state } = useApp();
  const { openDetail } = useUI();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const tab = params.get("onglet") ?? "tous";
  const roleFilter = params.get("role") ?? ALL_ROLES;

  const setParam = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  /** Pour chaque personne, ce qu'elle a en cours et ce qu'elle a rendu. */
  const rows = useMemo<MemberRow[]>(
    () =>
      state.members.map((member) => {
        const theirs = state.requests.filter(
          (r) => r.requesterId === member.id,
        );
        const dates = theirs
          .map((r) => r.createdAt)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        return {
          member,
          active: theirs.filter((r) => ACTIVE_STATUSES.includes(r.status)).length,
          pending: theirs.filter((r) => r.status === "En attente").length,
          overdue: theirs.filter((r) => r.status === "En retard").length,
          closed: theirs.filter(isClosed).length,
          lastActivity: dates[0],
        };
      }),
    [state.members, state.requests],
  );

  const byTab = useMemo(
    () => ({
      tous: rows,
      encours: rows.filter((r) => r.active > 0),
      retards: rows.filter((r) => r.overdue > 0),
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const source = byTab[tab as keyof typeof byTab] ?? byTab.tous;
    return source.filter((row) => {
      if (roleFilter !== ALL_ROLES && row.member.role !== roleFilter)
        return false;
      if (!needle) return true;
      return [row.member.name, row.member.email, row.member.affiliation]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [byTab, tab, roleFilter, query]);

  const requestsOf = (memberId: string) =>
    state.requests
      .filter(
        (r) => r.requesterId === memberId && ACTIVE_STATUSES.includes(r.status),
      )
      .sort((a, b) => new Date(a.end).getTime() - new Date(b.end).getTime());

  return (
    <>
      <div className="page__inner">
        <PageHead
          title="Membres"
          subtitle="Qui emprunte quoi, qui doit rendre, et qui attend une réponse."
          textWidth={420}
        />

        <Tabs
          items={[
            { id: "tous", label: "Tout le campus", count: byTab.tous.length },
            {
              id: "encours",
              label: "Avec un encours",
              count: byTab.encours.length,
            },
            { id: "retards", label: "En retard", count: byTab.retards.length },
          ]}
          value={tab}
          onChange={(id) => setParam("onglet", id, "tous")}
        />

        <div className="filters">
          <SearchField
            label="Rechercher un membre"
            placeholder="Rechercher un nom, une filière, un courriel…"
            value={query}
            onChange={setQuery}
          />
          <SelectField
            label="Rôle"
            value={roleFilter}
            options={[ALL_ROLES, "Étudiant", "Professeur", "Gestionnaire"]}
            onChange={(value) => setParam("role", value, ALL_ROLES)}
          />
        </div>
      </div>

      <div className="page__body">
        <div className="table-card" style={{ marginTop: 0 }}>
          <table className="table">
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "14%" }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Membre</th>
                <th scope="col">Rôle</th>
                <th scope="col">Encours</th>
                <th scope="col">Dernière demande</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="table__empty">
                  <td colSpan={5}>Aucun membre ne correspond à ces filtres.</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.member.id}>
                    <td>
                      <div className="person-cell">
                        <span className="avatar avatar--sm" aria-hidden="true">
                          {row.member.initials}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <p className="resource-cell__name">{row.member.name}</p>
                          <p className="resource-cell__ref">{row.member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`tag${
                          row.member.role === "Gestionnaire" ? " tag--accent" : ""
                        }`}
                      >
                        {row.member.role}
                      </span>
                      <p className="resource-cell__ref" style={{ marginTop: 6 }}>
                        {row.member.affiliation}
                      </p>
                    </td>
                    <td>
                      <p className="resource-cell__name">
                        {row.active} demande{row.active > 1 ? "s" : ""} active
                        {row.active > 1 ? "s" : ""}
                      </p>
                      <p className="resource-cell__ref">
                        {row.pending} en attente · {row.closed} clôturée
                        {row.closed > 1 ? "s" : ""}
                      </p>
                    </td>
                    <td>
                      {row.lastActivity ? (
                        shortDateTime(row.lastActivity)
                      ) : (
                        <span className="resource-cell__ref">Aucune</span>
                      )}
                      {row.overdue > 0 ? (
                        <p style={{ marginTop: 6 }}>
                          <StatusBadge status="En retard" />
                        </p>
                      ) : null}
                    </td>
                    <td>
                      <div className="inline-actions">
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() =>
                            setExpanded(
                              expanded === row.member.id ? null : row.member.id,
                            )
                          }
                          disabled={row.active === 0}
                        >
                          {expanded === row.member.id ? "Masquer" : "Détail"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {/* Détail déplié : ce que la personne détient actuellement. */}
              {expanded
                ? requestsOf(expanded).map((request) => (
                    <tr key={`detail-${request.id}`}>
                      <td colSpan={5} style={{ background: "var(--surface-subtle)" }}>
                        <div className="person-cell">
                          <span
                            className="resource-cell__icon"
                            aria-hidden="true"
                          >
                            <Icon name={request.icon} />
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="resource-cell__name">
                              {request.label}
                            </p>
                            <p className="resource-cell__ref">
                              {request.number} · {request.type} · échéance{" "}
                              {shortDateTime(request.end)}
                            </p>
                          </div>
                          <StatusBadge status={request.status} />
                          <button
                            type="button"
                            className="table__action"
                            onClick={() => openDetail(request)}
                            aria-label={`Ouvrir la demande ${request.number}`}
                          >
                            <Icon name="arrowRight" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </div>

      <p className="list-footnote">
        Les comptes proviennent de l’annuaire du campus : ils se consultent ici,
        ils se modifient dans l’annuaire.
      </p>
    </>
  );
}
