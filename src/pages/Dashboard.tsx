import { useNavigate } from "react-router-dom";
import { Icon, type IconName } from "../components/Icon";
import { StatusBadge } from "../components/StatusBadge";
import { PageHead } from "../components/ui";
import { useUI } from "../components/Layout";
import { useApp, useOpenRequests, useStats } from "../store/AppStore";
import { shortDateTime } from "../lib/format";

function StatCard({
  label,
  value,
  icon,
  tint,
  hint,
  onClick,
}: {
  label: string;
  value: number;
  icon: IconName;
  tint: string;
  /** Ce que compte le chiffre : des ressources, des exemplaires, des demandes. */
  hint: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="stat-card" onClick={onClick}>
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        <span className={`icon-pill ${tint}`} aria-hidden="true">
          <Icon name={icon} />
        </span>
      </div>
      {/* La maquette affiche les compteurs sur deux chiffres : 05, 02, 01. */}
      <span className="stat-card__value">{String(value).padStart(2, "0")}</span>
      <span className="resource-card__units">{hint}</span>
    </button>
  );
}

const QUICK_LINKS: {
  label: string;
  detail: string;
  icon: IconName;
  to: string;
}[] = [
  {
    label: "Emprunter du matériel",
    detail: "Pour donner vie à vos idées",
    icon: "laptop",
    to: "/catalogue?onglet=emprunt",
  },
  {
    label: "Réserver un espace",
    detail: "Un lieu pour vos projets",
    icon: "calendar",
    to: "/catalogue?onglet=reservation",
  },
  {
    label: "Consulter l’historique",
    detail: "Chaque mouvement, une trace",
    icon: "history",
    to: "/historique",
  },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { state } = useApp();
  const { openNewRequest, openDetail } = useUI();
  const { available, activeLoans, pending } = useStats();
  const openRequests = useOpenRequests();

  // Le tableau de bord ne montre que les mouvements les plus récents.
  const recent = openRequests.slice(0, 4);

  return (
    <>
      <div className="page__inner page__inner--flush">
        <PageHead
          title="Bonjour Sophie"
          subtitle="Voici ce qui se passe sur votre campus aujourd’hui."
          textWidth={330}
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
      </div>

      <div className="page__body">
        <div className="dashboard-grid">
          <div className="dashboard-col">
            <div className="stat-row">
              <StatCard
                label="Disponibles maintenant"
                hint={`ressources sur ${state.resources.length} au catalogue`}
                value={available}
                icon="check"
                tint="icon-pill--available"
                onClick={() => navigate("/catalogue?etat=Disponible")}
              />
              <StatCard
                label="Emprunts en cours"
                hint="que vous devez rendre"
                value={activeLoans}
                icon="clock"
                tint="icon-pill--loans"
                onClick={() => navigate("/demandes?onglet=cours")}
              />
              <StatCard
                label="Demandes en attente"
                hint="en attente de validation"
                value={pending}
                icon="calendar"
                tint="icon-pill--pending"
                onClick={() => navigate("/demandes?onglet=attente")}
              />
            </div>

            <section>
              <div className="section-head">
                <div>
                  <h2 className="section-head__title">Demandes récentes</h2>
                  <p className="section-head__subtitle">
                    Gardez un œil sur les derniers mouvements.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => navigate("/demandes")}
                >
                  Tout voir →
                </button>
              </div>

              <div className="table-card">
                <table className="table">
                  <colgroup>
                    <col style={{ width: "38.4%" }} />
                    <col style={{ width: "28.3%" }} />
                    <col style={{ width: "19.5%" }} />
                    <col style={{ width: "13.8%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col">Ressource / demande</th>
                      <th scope="col">Retour / fin prévue</th>
                      <th scope="col">Statut</th>
                      <th scope="col">
                        <span className="visually-hidden">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.length === 0 ? (
                      <tr className="table__empty">
                        <td colSpan={4}>
                          Aucune demande en cours. Tout est à jour.
                        </td>
                      </tr>
                    ) : (
                      recent.map((request) => (
                        <tr key={request.id}>
                          <td>
                            <div className="resource-cell">
                              <span
                                className="resource-cell__icon"
                                aria-hidden="true"
                              >
                                <Icon name={request.icon} />
                              </span>
                              <div>
                                <p className="resource-cell__name">
                                  {request.label}
                                </p>
                                <p className="resource-cell__ref">
                                  {request.number} · {request.type}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td data-label="Retour / fin prévue">
                            {shortDateTime(request.end)}
                          </td>
                          <td data-label="Statut">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="table__action-cell">
                            <button
                              type="button"
                              className="table__action"
                              onClick={() => openDetail(request)}
                              aria-label={`Voir la demande ${request.number}`}
                            >
                              <Icon name="arrowRight" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="dashboard-col">
            <section className="panel">
              <div className="panel__head">
                <h2 className="panel__title">Accès rapides</h2>
              </div>
              {QUICK_LINKS.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  className="quick-link"
                  onClick={() => navigate(link.to)}
                >
                  <span className="quick-link__icon" aria-hidden="true">
                    <Icon name={link.icon} />
                  </span>
                  <span className="quick-link__body">
                    <span className="quick-link__label" style={{ display: "block" }}>
                      {link.label}
                    </span>
                    <span className="quick-link__detail">{link.detail}</span>
                  </span>
                  <span className="quick-link__chev" aria-hidden="true">
                    <Icon name="arrowRight" />
                  </span>
                </button>
              ))}
            </section>

            <section className="panel">
              <div className="panel__head" style={{ borderBottom: 0 }}>
                <h2 className="panel__title">Activité récente</h2>
              </div>
              <div className="activity">
                {state.activities.length === 0 ? (
                  <p className="activity__empty">Rien à signaler pour l’instant.</p>
                ) : (
                  state.activities.slice(0, 5).map((item) => (
                    <div key={item.id} className="activity__item">
                      <span className="activity__dot" aria-hidden="true">
                        <Icon name="check" size={14} />
                      </span>
                      <div>
                        <p className="activity__label">{item.label}</p>
                        <p className="activity__time">{shortDateTime(item.at)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
