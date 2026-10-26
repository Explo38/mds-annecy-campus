import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { StatusBadge, reservationStatus } from "../components/StatusBadge";
import { PageHead, SearchField, SelectField, Tabs } from "../components/ui";
import { RequestList } from "../components/RequestList";
import { AvailabilityGrid } from "../components/AvailabilityGrid";
import { BookingModal } from "../components/BookingModal";
import type { Resource } from "../data/types";
import { toInputValue } from "../lib/format";
import { useUI } from "../components/Layout";
import { reservationPhase, useApp, useMyRequests } from "../store/AppStore";
import { longDate, slot } from "../lib/format";

const ALL_RESOURCES = "Toutes les ressources";
const ALL_STATUSES = "Tous les statuts";

export function Reservations() {
  const { now, state } = useApp();
  const mine = useMyRequests();
  // Réservation lancée depuis la grille : ressource + créneau cliqué.
  const [booking, setBooking] = useState<{
    resource: Resource;
    slot: { start: string; end: string };
  } | null>(null);
  const { openNewRequest, openDetail } = useUI();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");

  const tab = params.get("onglet") ?? "dispo";
  const resourceFilter = params.get("ressource") ?? ALL_RESOURCES;
  const statusFilter = params.get("statut") ?? ALL_STATUSES;

  const setParam = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const reservations = useMemo(
    () => mine.filter((r) => r.type === "Réservation"),
    [mine],
  );

  const byPhase = useMemo(
    () => ({
      avenir: reservations.filter((r) => reservationPhase(r, now) === "à venir"),
      cours: reservations.filter((r) => reservationPhase(r, now) === "en cours"),
      passees: reservations.filter((r) => reservationPhase(r, now) === "passée"),
    }),
    [reservations, now],
  );

  const resourceNames = useMemo(
    () => [
      ALL_RESOURCES,
      ...Array.from(new Set(reservations.map((r) => r.label))).sort(),
    ],
    [reservations],
  );

  const statuses = useMemo(
    () => [
      ALL_STATUSES,
      ...Array.from(
        new Set(reservations.map((r) => reservationStatus(r.status))),
      ).sort(),
    ],
    [reservations],
  );

  const espaces = useMemo(
    () =>
      state.resources.filter(
        (r) =>
          r.workflow === "Réservation" &&
          (resourceFilter === ALL_RESOURCES || r.name === resourceFilter),
      ),
    [state.resources, resourceFilter],
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const source = byPhase[tab as keyof typeof byPhase] ?? byPhase.avenir;
    return source
      .filter((r) => {
        if (resourceFilter !== ALL_RESOURCES && r.label !== resourceFilter)
          return false;
        if (
          statusFilter !== ALL_STATUSES &&
          reservationStatus(r.status) !== statusFilter
        )
          return false;
        if (!needle) return true;
        return [r.label, r.descriptor, r.requester, r.purpose, r.number]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [byPhase, tab, resourceFilter, statusFilter, query]);

  return (
    <>
      <div className="page__inner">
        <PageHead
          title="Les réservations"
          subtitle={
            tab === "dispo"
              ? "Les salles et véhicules du campus, et leurs créneaux encore libres."
              : "Retrouvez vos créneaux réservés pour les espaces et véhicules du campus."
          }
          action={
            /* Sur l'onglet des salles libres, la grille est déjà le moyen de
               réserver : un bouton de plus n'ajoutait qu'un écran de défilement. */
            tab === "dispo" ? undefined : (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => openNewRequest()}
              >
                <Icon name="plus" />
                Réserver un créneau
              </button>
            )
          }
        />

        <Tabs
          items={[
            { id: "dispo", label: "Salles libres" },
            { id: "avenir", label: "À venir", count: byPhase.avenir.length },
            { id: "cours", label: "En cours", count: byPhase.cours.length },
            { id: "passees", label: "Passées", count: byPhase.passees.length },
          ]}
          value={tab}
          onChange={(id) => setParam("onglet", id, "dispo")}
        />

        <div className="filters">
          {tab === "dispo" ? null : (
            <SearchField
              label="Rechercher une réservation"
              placeholder="Rechercher une réservation, une personne…"
              value={query}
              onChange={setQuery}
            />
          )}
          <SelectField
            label="Ressource"
            value={resourceFilter}
            options={resourceNames}
            onChange={(value) => setParam("ressource", value, ALL_RESOURCES)}
          />
          {tab === "dispo" ? null : (
            <SelectField
              label="Statut"
              value={statusFilter}
              options={statuses}
              onChange={(value) => setParam("statut", value, ALL_STATUSES)}
            />
          )}
        </div>
      </div>

      <div className="page__body">
        {tab === "dispo" ? (
          <AvailabilityGrid
            resources={espaces}
            onReserve={(resource, debut, fin) =>
              setBooking({
                resource,
                slot: { start: toInputValue(debut), end: toInputValue(fin) },
              })
            }
          />
        ) : (
        <RequestList
          title={
            tab === "cours"
              ? "Réservations en cours"
              : tab === "passees"
                ? "Réservations passées"
                : "Réservations à venir"
          }
          meta={`${rows.length} réservation${rows.length > 1 ? "s" : ""} · Triées par date`}
          columns={["Ressource", "Date et créneau", "Réservé par", "Statut"]}
          rows={rows.map((request) => ({
            request,
            cells: [
              { primary: request.label, secondary: request.descriptor },
              {
                primary: longDate(request.start),
                secondary: slot(request.start, request.end),
              },
              { primary: request.requester, secondary: request.requesterNote },
            ],
            status: <StatusBadge status={reservationStatus(request.status)} />,
          }))}
          emptyLabel="Aucune réservation dans cette vue."
          onOpen={openDetail}
        />
        )}
      </div>

      <p className="list-footnote">
        Les créneaux qui se chevauchent sont bloqués automatiquement.
      </p>

      {booking ? (
        <BookingModal
          resource={booking.resource}
          slot={booking.slot}
          onClose={() => setBooking(null)}
        />
      ) : null}
    </>
  );
}
