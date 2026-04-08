import { quickFilters, visibilityFilters } from "../constants/ui.js";

function FiltersDrawer({ filters, onFiltersChange }) {
  return (
    <section className="drawer-overlay" id="plans-controls">
      <a className="drawer-backdrop" href="#plans" aria-label="Fermer"></a>
      <aside className="drawer-card" aria-label="Filtres et visibilité">
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Plans spontanés</p>
            <h3>Filtres et visibilité</h3>
          </div>
          <a className="drawer-close" href="#plans" aria-label="Fermer le panneau">
            Fermer
          </a>
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
          <p className="drawer-label">Plans uniquement visibles par ces cercles</p>
          <div className="audience-filters" aria-label="Filtres de visibilité des plans">
            {visibilityFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`audience-chip ${filter.tone || ""} ${filters.visibility === filter.key ? "active" : ""}`}
                onClick={() => onFiltersChange({ ...filters, visibility: filter.key })}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <section className="drawer-section">
          <p className="drawer-label">Visibilité / interaction</p>
          <div className="visibility-grid">
            <article className="visibility-card vc-inner">
              <strong>Inner Circle</strong>
              <p>Voient tout immédiatement. Peuvent drop-in directement. RSVP flexible, absence = OK.</p>
            </article>
            <article className="visibility-card vc-connections">
              <strong>Connexions / connaissances</strong>
              <p>Voient intention + quartier approximatif. Peuvent demander les détails si intéressés.</p>
            </article>
            <article className="visibility-card vc-passive">
              <strong>Vu une fois / social passif</strong>
              <p>Invitation anonymisée. Détails révélés seulement si confirmés.</p>
            </article>
            <article className="visibility-card vc-private">
              <strong>Ohhh, une date en vue!</strong>
              <p>Invitation totalement privée. Détails révélés uniquement aux participants.</p>
            </article>
            <article className="visibility-card vc-ghosted">
              <strong>Ghosteurs récurrents</strong>
              <p>Voient l'intention mais pas les détails sensibles.</p>
            </article>
            <article className="visibility-card vc-blocked">
              <strong>Watch out / block list</strong>
              <p>Aucun accès. Bloqué automatiquement.</p>
            </article>
          </div>
        </section>
      </aside>
    </section>
  );
}

export default FiltersDrawer;
