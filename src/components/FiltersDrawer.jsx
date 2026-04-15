import { quickFilters, visibilityFilters } from "../constants/ui.js";

function FiltersDrawer({ filters, onFiltersChange }) {
  return (
    <section className="drawer" id="plans-controls">
      <a className="drawer__backdrop" href="#plans" aria-label="Fermer"></a>
      <aside className="drawer__card" aria-label="Filtres et visibilite">
        <div className="drawer__header">
          <div>
            <h3>Filters et circles</h3>
          </div>
          <a className="drawer__close" href="#plans" aria-label="Fermer le panneau">
            Close
          </a>
        </div>

        <section className="drawer__section">
          <p className="drawer__label">fast circles</p>
          <div className="chip-group" aria-label="Filtres rapides">
            {quickFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`chip chip--filter ${filters.quick === filter.key ? "chip--active" : ""}`}
                onClick={() => onFiltersChange({ ...filters, quick: filter.key })}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <section className="drawer__section">
          <p className="drawer__label">Circles</p>
          <div className="chip-group" aria-label="Filtres de visibilite des plans">
            {visibilityFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`chip chip--audience ${filter.tone ? `chip--${filter.tone}` : ""} ${filters.visibility === filter.key ? "chip--active" : ""}`}
                onClick={() => onFiltersChange({ ...filters, visibility: filter.key })}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

       
      </aside>
    </section>
  );
}

export default FiltersDrawer;
