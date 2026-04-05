import { circleFilters, quickFilters, visibilityFilters } from "../constants/ui.js";

function FiltersDrawer({ filters, onFiltersChange }) {
  return (
    <section className="drawer-overlay" id="plans-controls">
      <a className="drawer-backdrop" href="#plans" aria-label="Fermer"></a>
      <aside className="drawer-card" aria-label="Filtres et visibilite">
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Plans spontanes</p>
            <h3>Filtres et visibilite</h3>
          </div>
          <a className="drawer-close" href="#plans" aria-label="Fermer le panneau">Fermer</a>
        </div>

        <section className="drawer-section">
          <p className="drawer-label">Filtres rapides</p>
          <div className="audience-filters" aria-label="Filtres rapides">
            {quickFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`filter-chip ${filters.quick === filter.key ? "active" : ""}`}
                onClick={() => onFiltersChange({ ...filters, quick: filter.key })}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <section className="drawer-section">
          <p className="drawer-label">Cercles</p>
          <div className="audience-filters" aria-label="Filtres de visibilite">
            {circleFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`audience-chip ${filter.key === "Inner Circle" ? "inner" : filter.key === "Connexions" ? "connections" : ""} ${filters.circle === filter.key ? "active" : ""}`}
                onClick={() => onFiltersChange({ ...filters, circle: filter.key })}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <section className="drawer-section">
          <p className="drawer-label">Visibilite des plans</p>
          <div className="audience-filters" aria-label="Filtres de visibilite des plans">
            {visibilityFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`audience-chip ${filters.visibility === filter.key ? "active" : ""}`}
                onClick={() => onFiltersChange({ ...filters, visibility: filter.key })}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <section className="drawer-section">
          <p className="drawer-label">Visibilite / interaction</p>
          <div className="visibility-grid">
            <article className="visibility-card vc-inner">
              <strong>Inner Circle</strong>
              <p>Voient tout immediatement. Peuvent drop-in directement. RSVP flexible, absence = OK.</p>
            </article>
            <article className="visibility-card vc-connections">
              <strong>Connexions / connaissances</strong>
              <p>Voient intention + quartier approximatif. Peuvent demander les details si interesses.</p>
            </article>
            <article className="visibility-card vc-passive">
              <strong>Vu une fois / social passif</strong>
              <p>Invitation anonymisee. Details reveles seulement si confirmes.</p>
            </article>
            <article className="visibility-card vc-private">
              <strong>Ohhh, une date en vue!</strong>
              <p>Invitation totalement privee. Details reveles uniquement aux participants.</p>
            </article>
            <article className="visibility-card vc-ghosted">
              <strong>Ghosteurs recurrents</strong>
              <p>Voient l'intention mais pas les details sensibles.</p>
            </article>
            <article className="visibility-card vc-blocked">
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
