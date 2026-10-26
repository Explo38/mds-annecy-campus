/** Mise en forme des dates à la française, telle qu'elle apparaît dans la maquette. */

const MONTHS_LONG = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const MONTHS_SHORT = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

const d = (value: string | Date) =>
  value instanceof Date ? value : new Date(value);

const pad = (n: number) => String(n).padStart(2, "0");

/** « 14:00 » */
export function time(value: string | Date): string {
  const date = d(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** « 17 septembre 2026 » */
export function longDate(value: string | Date): string {
  const date = d(value);
  return `${date.getDate()} ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

/** « 15 sept. » */
export function shortDate(value: string | Date): string {
  const date = d(value);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** « 15 sept. à 18:00 » — colonne « Retour / fin prévue » du tableau de bord. */
export function shortDateTime(value: string | Date): string {
  return `${shortDate(value)} à ${time(value)}`;
}

/** « 3 h » ou « 4 h 30 » */
export function duration(start: string | Date, end: string | Date): string {
  const minutes = Math.max(
    0,
    Math.round((d(end).getTime() - d(start).getTime()) / 60000),
  );
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${pad(rest)}`;
}

/** « 14:00 – 17:00 · 3 h » — colonne « Date et créneau ». */
export function slot(start: string | Date, end: string | Date): string {
  return `${time(start)} – ${time(end)} · ${duration(start, end)}`;
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  const x = d(a);
  const y = d(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
}

/**
 * « 12 – 15 septembre 2026 » pour une période, « 14 septembre 2026 » pour une
 * journée unique — colonne « Période et clôture » de l'historique.
 */
export function period(start: string | Date, end: string | Date): string {
  const from = d(start);
  const to = d(end);
  if (isSameDay(from, to)) return longDate(from);
  if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
    return `${from.getDate()} – ${to.getDate()} ${MONTHS_LONG[to.getMonth()]} ${to.getFullYear()}`;
  }
  return `${from.getDate()} ${MONTHS_SHORT[from.getMonth()]} – ${longDate(to)}`;
}

/** Valeur d'un <input type="datetime-local">. */
export function toInputValue(value: string | Date): string {
  const date = d(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromInputValue(value: string): string {
  return `${value}:00`;
}

/** Horodatage local « YYYY-MM-DDTHH:mm:ss », au format des données de démonstration. */
export function toIso(value: string | Date): string {
  const date = d(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
