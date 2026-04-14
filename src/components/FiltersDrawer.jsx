import { quickFilters, visibilityFilters } from "../constants/ui.js";

function FiltersDrawer({ filters, onFiltersChange }) {
  return (
    <section className="drawer" id="plans-controls">
      <a className="drawer__backdrop" href="#plans" aria-label="Fermer"></a>
      <aside className="drawer__card" aria-label="Filtres et visibilite">
        <div className="drawer__header">
          <div>
            <h3>Filtres et visibilite</h3>
          </div>
          <a className="drawer__close" href="#plans" aria-label="Fermer le panneau">
            Fermer
          </a>
        </div>

        <section className="drawer__section">
          <p className="drawer__label">Filtres rapides</p>
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
          <p className="drawer__label">Plans uniquement visibles par ces cercles</p>
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

        <section className="drawer__section">
          <p className="drawer__label">Cercles par defaut</p>
          <div className="visibility-grid">
            <article className="visibility-card visibility-card--inner">
              <strong>Inner Circle</strong>
              <p>Voient tout immediatement. Peuvent drop-in directement. RSVP flexible, absence = OK.</p>
            </article>
            <article className="visibility-card visibility-card--connections">
              <strong>Connexions / connaissances</strong>
              <p>Voient intention + quartier approximatif. Peuvent demander les details si interesses.</p>
            </article>
            <article className="visibility-card visibility-card--passive">
              <strong>Vu une fois / social passif</strong>
              <p>Invitation anonymisee. Details reveles seulement si confirmes.</p>
            </article>
            <article className="visibility-card visibility-card--private">
              <strong>Ohhh, une date en vue!</strong>
              <p>Invitation totalement privee. Details reveles uniquement aux participants.</p>
            </article>
            <article className="visibility-card visibility-card--ghosted">
              <strong>Ghosteurs recurrents</strong>
              <p>Voient l'intention mais pas les details sensibles.</p>
            </article>
            <article className="visibility-card visibility-card--blocked">
              <strong>Watch out / block list</strong>
              <p>Aucun acces. Bloque automatiquement.</p>
            </article>
          </div>
        </section>
      </aside>
    </section>
  );
}

export default FiltersDrawer;
