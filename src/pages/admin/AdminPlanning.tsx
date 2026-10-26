import { useMemo, useState } from "react";
import { Icon } from "../../components/Icon";
import { PageHead, SelectField } from "../../components/ui";
import { useUI } from "../../components/Layout";
import { useApp } from "../../store/AppStore";
import { ACTIVE_STATUSES, type Request } from "../../data/types";
import { isSameDay, longDate, shortDate, time } from "../../lib/format";

const DAY_NAMES = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const ALL_CATEGORIES = "Toutes les catégories";

/** Le lundi de la semaine qui contient `ref`. */
function startOfWeek(ref: Date): Date {
  const date = new Date(ref);
  date.setHours(0, 0, 0, 0);
  const shift = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - shift);
  return date;
}

export function AdminPlanning() {
  const { state, now } = useApp();
  const { openDetail } = useUI();
  const [weekOffset, setWeekOffset] = useState(0);
  const [category, setCategory] = useState(ALL_CATEGORIES);

  const days = useMemo(() => {
    const first = startOfWeek(now);
    first.setDate(first.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(first);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [now, weekOffset]);

  // Le planning ne concerne que ce qui se réserve par créneau.
  const bookable = useMemo(
    () =>
      state.resources.filter(
        (r) =>
          r.workflow === "Réservation" &&
          (category === ALL_CATEGORIES || r.category === category),
      ),
    [state.resources, category],
  );

  const categories = useMemo(
    () => [
      ALL_CATEGORIES,
      ...Array.from(
        new Set(
          state.resources
            .filter((r) => r.workflow === "Réservation")
            .map((r) => r.category),
        ),
      ).sort(),
    ],
    [state.resources],
  );

  const bookings = useMemo(
    () =>
      state.requests.filter(
        (r) =>
          r.type === "Réservation" &&
          r.resourceId &&
          ACTIVE_STATUSES.includes(r.status),
      ),
    [state.requests],
  );

  const slotsFor = (resourceId: string, day: Date): Request[] =>
    bookings
      .filter((r) => r.resourceId === resourceId && isSameDay(r.start, day))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const weekLabel = `${shortDate(days[0])} – ${longDate(days[6])}`;
  const occupied = bookings.filter((r) =>
    days.some((d) => isSameDay(r.start, d)),
  ).length;

  return (
    <>
      <div className="page__inner">
        <PageHead
          title="Planning"
          subtitle="L’occupation des espaces et des véhicules, semaine par semaine."
          textWidth={430}
          action={
            <div className="inline-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setWeekOffset((w) => w - 1)}
              >
                ← Semaine précédente
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setWeekOffset(0)}
                disabled={weekOffset === 0}
              >
                Aujourd’hui
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setWeekOffset((w) => w + 1)}
              >
                Semaine suivante →
              </button>
            </div>
          }
        />

        <div className="filters">
          <SelectField
            label="Catégorie"
            value={category}
            options={categories}
            onChange={setCategory}
          />
        </div>
      </div>

      <div className="page__body">
        <section className="panel">
          <div className="panel__head" style={{ borderBottom: 0 }}>
            <h2 className="panel__title" style={{ fontSize: 15 }}>
              {weekLabel}
            </h2>
            <span className="panel__meta">
              {occupied} créneau{occupied > 1 ? "x" : ""} sur {bookable.length}{" "}
              espace{bookable.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="planning">
            <div className="planning__grid">
              <div className="planning__corner">Espace</div>
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`planning__day${
                    isSameDay(day, now) ? " planning__day--today" : ""
                  }`}
                >
                  {DAY_NAMES[day.getDay()]} {day.getDate()}
                </div>
              ))}

              {bookable.map((resource) => (
                <div key={resource.id} style={{ display: "contents" }}>
                  <div className="planning__resource">
                    <span className="resource-cell__icon" aria-hidden="true">
                      <Icon name={resource.icon} />
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span
                        className="resource-cell__name"
                        style={{ display: "block" }}
                      >
                        {resource.name}
                      </span>
                      <span className="resource-cell__ref">
                        {resource.descriptor}
                      </span>
                    </span>
                  </div>

                  {days.map((day) => {
                    const slots = slotsFor(resource.id, day);
                    return (
                      <div key={day.toISOString()} className="planning__cell">
                        {slots.map((request) => (
                          <button
                            key={request.id}
                            type="button"
                            className={`planning__slot${
                              request.status === "En attente"
                                ? " planning__slot--pending"
                                : ""
                            }`}
                            onClick={() => openDetail(request)}
                            title={`${request.requester} · ${request.purpose}`}
                          >
                            <strong>
                              {time(request.start)} – {time(request.end)}
                            </strong>
                            {request.requester}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {bookable.length === 0 ? (
            <p className="list-empty">
              Aucun espace réservable dans cette catégorie.
            </p>
          ) : null}
        </section>
      </div>

      <p className="list-footnote">
        Les créneaux ambrés attendent une validation. Les créneaux qui se
        chevauchent sont refusés à la saisie.
      </p>
    </>
  );
}
