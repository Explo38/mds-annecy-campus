import { useMemo, useState } from "react";
import { Icon } from "./Icon";
import { useApp } from "../store/AppStore";
import { ACTIVE_STATUSES, CURRENT_MEMBER_ID, type Request, type Resource } from "../data/types";
import { isSameDay, longDate, shortDate } from "../lib/format";

/** Amplitude d'ouverture du campus, et repère de lecture des barres. */
const OUVERTURE = 8;
const FERMETURE = 20;
const AMPLITUDE = FERMETURE - OUVERTURE;

const JOURS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];

/** Le lundi de la semaine qui contient `ref`. */
function lundiDe(ref: Date): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

type Segment = { debut: number; fin: number; enAttente: boolean; aMoi: boolean };

/** Les créneaux déjà pris ce jour-là, ramenés à des heures décimales. */
function segmentsDuJour(reservations: Request[], jour: Date): Segment[] {
  return reservations
    .filter((r) => isSameDay(r.start, jour))
    .map((r) => {
      const s = new Date(r.start);
      const e = new Date(r.end);
      return {
        debut: Math.max(OUVERTURE, s.getHours() + s.getMinutes() / 60),
        fin: Math.min(FERMETURE, e.getHours() + e.getMinutes() / 60),
        enAttente: r.status === "En attente",
        aMoi: r.requesterId === CURRENT_MEMBER_ID,
      };
    })
    .filter((s) => s.fin > s.debut)
    .sort((a, b) => a.debut - b.debut);
}

/**
 * Le premier trou d'au moins une heure, ou rien si la journée est pleine.
 * `plancher` évite de proposer un créneau déjà entamé quand on regarde
 * la journée en cours.
 */
function premierCreneauLibre(
  segments: Segment[],
  plancher = OUVERTURE,
): [number, number] | null {
  let curseur = Math.max(OUVERTURE, plancher);
  for (const s of segments) {
    if (s.fin <= curseur) continue;
    if (s.debut - curseur >= 1) return [curseur, s.debut];
    curseur = Math.max(curseur, s.fin);
  }
  return FERMETURE - curseur >= 1 ? [curseur, FERMETURE] : null;
}

/** Heure à partir de laquelle on peut encore réserver ce jour-là. */
function plancherDu(jour: Date, now: Date): number {
  if (!isSameDay(jour, now)) return OUVERTURE;
  // On arrondit à la demi-heure suivante : réserver « tout de suite » n'a
  // pas de sens pour une salle.
  const h = now.getHours() + now.getMinutes() / 60;
  return Math.ceil(h * 2) / 2;
}

function heure(h: number): string {
  const entier = Math.floor(h);
  const minutes = Math.round((h - entier) * 60);
  return `${String(entier).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function AvailabilityGrid({
  resources,
  onReserve,
}: {
  resources: Resource[];
  /** Ouvre la réservation sur le créneau libre cliqué. */
  onReserve: (resource: Resource, debut: Date, fin: Date) => void;
}) {
  const { state, now } = useApp();
  const [semaine, setSemaine] = useState(0);

  const jours = useMemo(() => {
    const premier = lundiDe(now);
    premier.setDate(premier.getDate() + semaine * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(premier);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [now, semaine]);

  /** Toutes les réservations du campus : c'est ce qui rend une salle occupée. */
  const reservationsPar = useMemo(() => {
    const map = new Map<string, Request[]>();
    for (const r of state.requests) {
      if (r.type !== "Réservation" || !r.resourceId) continue;
      if (!ACTIVE_STATUSES.includes(r.status)) continue;
      const liste = map.get(r.resourceId) ?? [];
      liste.push(r);
      map.set(r.resourceId, liste);
    }
    return map;
  }, [state.requests]);

  const finDeJournee = (jour: Date) => {
    const d = new Date(jour);
    d.setHours(FERMETURE, 0, 0, 0);
    return d;
  };

  return (
    <section className="panel">
      <div className="panel__head">
        <div>
          <h2 className="panel__title" style={{ fontSize: 15 }}>
            {shortDate(jours[0])} – {longDate(jours[6])}
          </h2>
          <p className="panel__meta">
            Cliquez sur une plage libre pour la réserver.
          </p>
        </div>
        <div className="week-nav">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setSemaine((s) => s - 1)}
          >
            ←<span className="week-nav__word"> Semaine</span>
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setSemaine(0)}
            disabled={semaine === 0}
          >
            Cette semaine
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setSemaine((s) => s + 1)}
          >
            <span className="week-nav__word">Semaine </span>→
          </button>
        </div>
      </div>

      <div className="dispo">
        <div className="dispo__head" aria-hidden="true">
          <span>Espace</span>
          {jours.map((j) => (
            <span
              key={j.toISOString()}
              className={isSameDay(j, now) ? "is-today" : undefined}
            >
              {JOURS[(j.getDay() + 6) % 7]} {j.getDate()}
            </span>
          ))}
        </div>

        {resources.length === 0 ? (
          <p className="list-empty">Aucun espace dans cette catégorie.</p>
        ) : (
          resources.map((resource) => {
            const reservations = reservationsPar.get(resource.id) ?? [];
            return (
              <div key={resource.id} className="dispo__row">
                <div className="dispo__space">
                  <span className="resource-cell__icon" aria-hidden="true">
                    <Icon name={resource.icon} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className="resource-cell__name" style={{ display: "block" }}>
                      {resource.name}
                    </span>
                    <span className="resource-cell__ref">{resource.descriptor}</span>
                  </span>
                </div>

                {jours.map((jour) => {
                  const segments = segmentsDuJour(reservations, jour);
                  const plancher = plancherDu(jour, now);
                  const libre = premierCreneauLibre(segments, plancher);
                  const passe = finDeJournee(jour) < now;
                  const indisponible =
                    resource.state === "En maintenance" ||
                    resource.state === "Indisponible";
                  const cliquable = !!libre && !passe && !indisponible;

                  const debut = new Date(jour);
                  if (libre) debut.setHours(Math.floor(libre[0]), (libre[0] % 1) * 60, 0, 0);
                  const fin = new Date(jour);
                  if (libre) fin.setHours(Math.floor(libre[1]), (libre[1] % 1) * 60, 0, 0);

                  return (
                    <button
                      key={jour.toISOString()}
                      type="button"
                      className={`dispo__cell${passe ? " is-past" : ""}`}
                      data-label={`${JOURS[(jour.getDay() + 6) % 7]} ${jour.getDate()}`}
                      disabled={!cliquable}
                      onClick={() => onReserve(resource, debut, fin)}
                      aria-label={
                        cliquable
                          ? `Réserver ${resource.name} le ${longDate(jour)} de ${heure(libre[0])} à ${heure(libre[1])}`
                          : `${resource.name}, ${longDate(jour)} : aucune plage libre`
                      }
                    >
                      <span className="dispo__body">
                        <span className="dispo__bar">
                          {plancher > OUVERTURE && !passe ? (
                            <span
                              className="dispo__seg is-elapsed"
                              style={{
                                left: 0,
                                width: `${((plancher - OUVERTURE) / AMPLITUDE) * 100}%`,
                              }}
                            />
                          ) : null}
                          {segments.map((s, i) => (
                            <span
                              key={i}
                              className={`dispo__seg${s.enAttente ? " is-pending" : ""}${
                                s.aMoi ? " is-mine" : ""
                              }`}
                              style={{
                                left: `${((s.debut - OUVERTURE) / AMPLITUDE) * 100}%`,
                                width: `${((s.fin - s.debut) / AMPLITUDE) * 100}%`,
                              }}
                              title={`${heure(s.debut)} – ${heure(s.fin)}${s.aMoi ? " · vous" : ""}`}
                            />
                          ))}
                        </span>
                        <span className="dispo__text">
                          {indisponible
                            ? "Indisponible"
                            : passe
                              ? "Passé"
                              : libre
                                ? segments.length === 0 && plancher === OUVERTURE
                                  ? "Libre toute la journée"
                                  : `Libre ${heure(libre[0])} – ${heure(libre[1])}`
                                : "Complet"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      <div className="dispo__legend">
        <span>
          <i className="dispo__key" /> Occupé
        </span>
        <span>
          <i className="dispo__key is-pending" /> En attente de validation
        </span>
        <span>
          <i className="dispo__key is-mine" /> Vos créneaux
        </span>
        <span className="dispo__hours">
          Journée affichée de {OUVERTURE}h à {FERMETURE}h
        </span>
      </div>
    </section>
  );
}
