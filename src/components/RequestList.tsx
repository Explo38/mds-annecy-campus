import type { ReactNode } from "react";
import { Icon } from "./Icon";
import type { Request } from "../data/types";

export type Cell = { primary: ReactNode; secondary?: ReactNode };

/**
 * Liste partagée par « Les demandes », « Réservations » et « Historique » :
 * même gabarit Figma (en-tête de colonnes ambré, lignes de 81 px, chevron à droite).
 */
export function RequestList({
  title,
  meta,
  columns,
  rows,
  emptyLabel,
  onOpen,
}: {
  title: string;
  meta: string;
  columns: [string, string, string, string];
  rows: { request: Request; cells: [Cell, Cell, Cell]; status: ReactNode }[];
  emptyLabel: string;
  onOpen: (request: Request) => void;
}) {
  return (
    <section className="panel">
      <div className="panel__head" style={{ borderBottom: 0 }}>
        <h2 className="panel__title" style={{ fontSize: 15 }}>
          {title}
        </h2>
        <span className="panel__meta">{meta}</span>
      </div>

      <div className="list-head list-cols" role="row">
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
        <span />
      </div>

      {rows.length === 0 ? (
        <p className="list-empty">{emptyLabel}</p>
      ) : (
        rows.map(({ request, cells, status }) => (
          <button
            key={request.id}
            type="button"
            className="list-row list-cols"
            onClick={() => onOpen(request)}
            aria-label={`Ouvrir la demande ${request.number}`}
          >
            <span className="list-row__resource">
              <span className="list-row__icon" aria-hidden="true">
                <Icon name={request.icon} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span className="cell-primary" style={{ display: "block" }}>
                  {cells[0].primary}
                </span>
                <span className="cell-secondary" style={{ display: "block" }}>
                  {cells[0].secondary}
                </span>
              </span>
            </span>

            <span data-label={columns[1]}>
              <span className="cell-primary" style={{ display: "block" }}>
                {cells[1].primary}
              </span>
              <span className="cell-secondary" style={{ display: "block" }}>
                {cells[1].secondary}
              </span>
            </span>

            <span data-label={columns[2]}>
              <span className="cell-primary" style={{ display: "block" }}>
                {cells[2].primary}
              </span>
              <span className="cell-secondary" style={{ display: "block" }}>
                {cells[2].secondary}
              </span>
            </span>

            <span data-label={columns[3]}>{status}</span>

            <span className="list-row__chev" aria-hidden="true">
              <Icon name="arrowRight" />
            </span>
          </button>
        ))
      )}
    </section>
  );
}
