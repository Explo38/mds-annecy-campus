import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { StatusBadge } from "../components/StatusBadge";
import { PageHead, SearchField, SelectField, Tabs } from "../components/ui";
import { BookingModal } from "../components/BookingModal";
import { useUI } from "../components/Layout";
import { useApp } from "../store/AppStore";
import type { Request, Resource } from "../data/types";
import { stockLabel, stockOf } from "../lib/stock";

const TABS = [
  { id: "all", label: "Toutes les ressources" },
  { id: "emprunt", label: "À emprunter" },
  { id: "reservation", label: "À réserver" },
];

const ALL_CATEGORIES = "Toutes les catégories";
const ALL_STATES = "Tous les états";

function ResourceCard({
  resource,
  requests,
  onBook,
}: {
  resource: Resource;
  requests: Request[];
  onBook: (resource: Resource) => void;
}) {
  const stock = stockOf(resource, requests);
  const unavailable =
    resource.state === "En maintenance" ||
    resource.state === "Indisponible" ||
    stock.available === 0;

  return (
    <article className="resource-card">
      <div className="resource-card__media">
        <Icon name={resource.icon} size={47} />
        {/* L'étudiant doit voir d'un coup d'œil ce qu'il reste. */}
        <span className="resource-card__stock">
          <StatusBadge status={resource.state} />
          {/* Le compteur figure sur toutes les fiches : son absence sur les
              références à un exemplaire laissait croire à une incohérence. */}
          <span className="resource-card__units">{stockLabel(stock)}</span>
        </span>
      </div>
      <div className="resource-card__body">
        <p className="resource-card__category">{resource.category}</p>
        <h3 className="resource-card__name">{resource.name}</h3>
        <p className="resource-card__meta">
          <span>{resource.location}</span>
          <span>{resource.ref}</span>
        </p>
        <div className="resource-card__footer">
          <span className="resource-card__note">{resource.access}</span>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => onBook(resource)}
            disabled={unavailable}
          >
            <Icon name="plus" />
            {resource.workflow === "Emprunt" ? "Emprunter" : "Réserver"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function Catalogue() {
  const { state } = useApp();
  const { openCart } = useUI();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [booking, setBooking] = useState<Resource | null>(null);

  // Les filtres vivent dans l'URL : un accès rapide du tableau de bord peut
  // ouvrir le catalogue déjà filtré.
  const tab = params.get("onglet") ?? "all";
  const category = params.get("categorie") ?? ALL_CATEGORIES;
  const stateFilter = params.get("etat") ?? ALL_STATES;

  const setParam = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const categories = useMemo(
    () => [
      ALL_CATEGORIES,
      ...Array.from(new Set(state.resources.map((r) => r.category))).sort(),
    ],
    [state.resources],
  );

  const states = useMemo(
    () => [
      ALL_STATES,
      ...Array.from(new Set(state.resources.map((r) => r.state))).sort(),
    ],
    [state.resources],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.resources.filter((r) => {
      if (tab === "emprunt" && r.workflow !== "Emprunt") return false;
      if (tab === "reservation" && r.workflow !== "Réservation") return false;
      if (category !== ALL_CATEGORIES && r.category !== category) return false;
      if (stateFilter !== ALL_STATES && r.state !== stateFilter) return false;
      if (!needle) return true;
      return [r.name, r.ref, r.category, r.location, r.descriptor]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [state.resources, tab, category, stateFilter, query]);

  const cartCount = state.cart.length;

  return (
    <>
      <div className="page__inner">
        <PageHead
          title="À chaque projet, sa ressource"
          subtitle="Explorez, sélectionnez, et donnez vie à vos projets."
          action={
            <button type="button" className="btn btn--primary" onClick={openCart}>
              <Icon name="bag" />
              Mon panier ({cartCount})
            </button>
          }
        />

        <Tabs
          items={TABS}
          value={tab}
          onChange={(id) => setParam("onglet", id, "all")}
        />

        <div className="filters">
          <SearchField
            label="Rechercher une ressource"
            placeholder="Rechercher une ressource, une référence…"
            value={query}
            onChange={setQuery}
          />
          <SelectField
            label="Catégorie"
            value={category}
            options={categories}
            onChange={(value) => setParam("categorie", value, ALL_CATEGORIES)}
          />
          <SelectField
            label="État"
            value={stateFilter}
            options={states}
            onChange={(value) => setParam("etat", value, ALL_STATES)}
          />
        </div>
      </div>

      <div className="page__body">
        <p className="catalog-count" style={{ marginBottom: 17 }}>
          {results.length} ressource{results.length > 1 ? "s" : ""}
        </p>

        {results.length === 0 ? (
          <div className="panel">
            <p className="list-empty">
              Aucune ressource ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          <div className="catalog-grid">
            {results.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                requests={state.requests}
                onBook={setBooking}
              />
            ))}
          </div>
        )}
      </div>

      {booking ? (
        <BookingModal resource={booking} onClose={() => setBooking(null)} />
      ) : null}
    </>
  );
}
