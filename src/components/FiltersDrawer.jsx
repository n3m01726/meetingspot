import { quickFilters, visibilityFilters, VISIBILITY_MODES } from "../constants/ui.js";
import { getVisibilityModeHelper, getVisibilityModeShortLabel, visibilityProductCopy } from "../ui/visibilityCopy.js";

const modeCards = [
  VISIBILITY_MODES.RSVP_FIRST,
  VISIBILITY_MODES.CIRCLE_OPEN,
  VISIBILITY_MODES.PUBLIC_VIBE
];

function FiltersDrawer({ filters, onFiltersChange }) {
  return (
    <section className="drawer-overlay" id="plans-controls">
      <a className="drawer-backdrop" href="#plans" aria-label="Fermer"></a>
      <aside className="drawer-card" aria-label={visibilityProductCopy.filters.title}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Plans spontanés</p>
            <h3>{visibilityProductCopy.filters.title}</h3>
          </div>
          <a className="drawer-close" href="#plans" aria-label="Fermer le panneau">
            Fermer
          </a>
        </div>

        <section className="drawer-section">
          <p className="drawer-label">{visibilityProductCopy.filters.quickFilters}</p>
          <div className="audience-filters" aria-label={visibilityProductCopy.filters.quickFilters}>
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
          <p className="drawer-label">{visibilityProductCopy.filters.circleFilters}</p>
          <div className="audience-filters" aria-label={visibilityProductCopy.filters.circleFilters}>
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
          <p className="drawer-label">{visibilityProductCopy.filters.visibilityModes}</p>
          <div className="visibility-grid" aria-label={visibilityProductCopy.filters.visibilityModes}>
            {modeCards.map((mode) => (
              <article className="visibility-card" key={mode}>
                <div className="visibility-card__body">
                  <strong>{getVisibilityModeShortLabel(mode)}</strong>
                  <p>{getVisibilityModeHelper(mode, "detailHelper")}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </aside>
    </section>
  );
}

export default FiltersDrawer;
