import { useNavigate } from "react-router-dom";
import { Icon, type IconName } from "../../components/Icon";
import { StatusBadge } from "../../components/StatusBadge";
import { PageHead } from "../../components/ui";
import { useUI } from "../../components/Layout";
import { useAdminStats, useApp } from "../../store/AppStore";
import { shortDateTime } from "../../lib/format";

function StatCard({
  label,
  value,
  icon,
  tint,
  onClick,
  hint,
  children,
}: {
  label: string;
  value: string;
  icon: IconName;
  tint: string;
  onClick: () => void;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" className="stat-card" onClick={onClick}>
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        <span className={`icon-pill ${tint}`} aria-hidden="true">
          <Icon name={icon} />
        </span>
      </div>
      <span className="stat-card__value">{value}</span>
      {hint ? <span className="resource-card__units">{hint}</span> : null}
      {children}
    </button>
  );
}

export function AdminPilotage() {
  const navigate = useNavigate();
  const { state, memberById } = useApp();
  const { openDetail } = useUI();
  const stats = useAdminStats();

  // Les demandes les plus anciennes sont celles qui font attendre quelqu'un.
  const queue = [...stats.toTreat]
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .slice(0, 4);

  const maintenance = stats.maintenance;

  return (
    <>
      <div className="page__inner">
        <PageHead
          title="Pilotage du campus"
          subtitle="L’état du stock, ce qui attend une décision et ce qui doit rentrer."
          textWidth={430}
          action={
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate("/admin/validations")}
            >
              <Icon name="check" />
              Traiter les demandes
            </button>
          }
        />
      </div>

      <div className="page__body">
        <div className="stat-row" style={{ marginBottom: 22 }}>
          <StatCard
            label="Demandes à traiter"
            value={String(stats.toTreat.length).padStart(2, "0")}
            icon="bag"
            tint="icon-pill--pending"
            onClick={() => navigate("/admin/validations")}
          />
          <StatCard
            label="Sorties en cours"
            value={String(stats.out.length).padStart(2, "0")}
            icon="clock"
            tint="icon-pill--loans"
            onClick={() => navigate("/admin/stock?etat=Emprunté")}
          />
          <StatCard
            label="Retours en retard"
            value={String(stats.overdue.length).padStart(2, "0")}
            icon="history"
            tint="icon-pill--pending"
            onClick={() => navigate("/admin/validations?onglet=retards")}
          />
          <StatCard
            label="Stock disponible"
            value={`${stats.availability} %`}
            hint={`${stats.exemplairesLibres} sur ${stats.exemplaires} exemplaires`}
            icon="check"
            tint="icon-pill--available"
            onClick={() => navigate("/admin/stock")}
          >
            {/* La jauge dit d'un coup d'œil la marge de manœuvre du service. */}
            <span className="meter" aria-hidden="true">
              <span
                className="meter__fill"
                style={{ width: `${stats.availability}%` }}
              />
            </span>
          </StatCard>
        </div>

        {stats.faible.length > 0 ? (
          <div className="callout" style={{ marginBottom: 22 }}>
            <span className="callout__icon" aria-hidden="true">
              <Icon name="box" size={16} />
            </span>
            <div>
              <strong>
                {stats.faible.length} référence
                {stats.faible.length > 1 ? "s" : ""} bientôt épuisée
                {stats.faible.length > 1 ? "s" : ""}
              </strong>{" "}
              — {stats.faible.map((r) => r.name).join(", ")}. Il reste au plus un
              exemplaire à emprunter.
            </div>
          </div>
        ) : null}

        {stats.overdue.length > 0 ? (
          <div className="callout" style={{ marginBottom: 22 }}>
            <span className="callout__icon" aria-hidden="true">
              <Icon name="clock" size={16} />
            </span>
            <div>
              <strong>
                {stats.overdue.length} retour
                {stats.overdue.length > 1 ? "s" : ""} en retard
              </strong>{" "}
              — {stats.overdue.map((r) => r.label).join(", ")}. Relancez les
              emprunteurs depuis l’écran Validations.
            </div>
          </div>
        ) : null}

        <div className="admin-columns">
          <section className="panel">
            <div className="panel__head" style={{ borderBottom: 0 }}>
              <h2 className="panel__title">File de validation</h2>
              <span className="panel__meta">
                {stats.toTreat.length} en attente · les plus anciennes d’abord
              </span>
            </div>
            {queue.length === 0 ? (
              <p className="list-empty">Rien à traiter, tout est à jour.</p>
            ) : (
              queue.map((request) => {
                const member = memberById(request.requesterId);
                return (
                  <button
                    key={request.id}
                    type="button"
                    className="mini-row"
                    onClick={() => openDetail(request)}
                  >
                    <span className="avatar avatar--sm" aria-hidden="true">
                      {member?.initials ?? "?"}
                    </span>
                    <span className="mini-row__body">
                      <span className="cell-primary" style={{ display: "block" }}>
                        {request.label}
                      </span>
                      <span className="cell-secondary">
                        {request.requester} · déposée le{" "}
                        {shortDateTime(request.createdAt)}
                      </span>
                    </span>
                    <StatusBadge status={request.status} />
                  </button>
                );
              })
            )}
            <div className="panel__foot">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => navigate("/admin/validations")}
              >
                Tout traiter →
              </button>
            </div>
          </section>

          <section className="panel">
            <div className="panel__head" style={{ borderBottom: 0 }}>
              <h2 className="panel__title">Stock immobilisé</h2>
              <span className="panel__meta">
                {maintenance.length} en maintenance · {state.resources.length}{" "}
                références
              </span>
            </div>
            {maintenance.length === 0 ? (
              <p className="list-empty">Aucune ressource immobilisée.</p>
            ) : (
              maintenance.map((resource) => (
                <button
                  key={resource.id}
                  type="button"
                  className="mini-row"
                  onClick={() => navigate("/admin/stock?etat=En maintenance")}
                >
                  <span className="resource-cell__icon" aria-hidden="true">
                    <Icon name={resource.icon} />
                  </span>
                  <span className="mini-row__body">
                    <span className="cell-primary" style={{ display: "block" }}>
                      {resource.name}
                    </span>
                    <span className="cell-secondary">
                      {resource.note ?? `${resource.ref} · ${resource.location}`}
                    </span>
                  </span>
                  <StatusBadge status={resource.state} />
                </button>
              ))
            )}
            <div className="panel__foot">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => navigate("/admin/stock")}
              >
                Ouvrir le stock →
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
