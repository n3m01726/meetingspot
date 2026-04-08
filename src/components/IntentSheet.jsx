import { availabilityLabelMap, intentOptions, visibilityModeOptions } from "../constants/ui.js";

function IntentSheet({
  isOpen,
  selectedAvatar,
  intentStep,
  form,
  formError,
  onClose,
  onChooseIntent,
  onFormChange,
  onBack,
  onSubmit
}) {
  return (
    <section className={`intent-sheet-overlay ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
      <button className="intent-sheet-backdrop" type="button" aria-label="Fermer la feuille" onClick={onClose}></button>
      <section className="intent-sheet" aria-labelledby="intent-sheet-title" aria-modal="true" role="dialog">
        <div className="intent-sheet-handle" aria-hidden="true"></div>
        <div className="intent-sheet-header">
          <div className="intent-selected-avatar">
            {selectedAvatar ? (
              <div className="intent-selected-ring">
                <img
                  className="intent-selected-image avatar-photo avatar-photo--md"
                  src={selectedAvatar.imagePath}
                  alt={selectedAvatar.name}
                />
              </div>
            ) : null}
            <div className="intent-selected-copy">
              <span className="intent-sheet-title">
                {selectedAvatar ? "Créer un plan avec" : "Créer un plan"}
              </span>
              {selectedAvatar ? <strong id="intent-sheet-title">{selectedAvatar.name}</strong> : <strong id="intent-sheet-title">Nouveau moment spontané</strong>}
              {selectedAvatar ? (
                <span className="intent-selected-meta">
                  {`${selectedAvatar.availabilityLabel || availabilityLabelMap[selectedAvatar.availability]} • ${selectedAvatar.circle}`}
                </span>
              ) : (
                <span className="intent-selected-meta">Choisis une activité, un mode d’ouverture et un contexte simple.</span>
              )}
            </div>
          </div>
        </div>

        <div className={`intent-sheet-step ${intentStep === "intent" ? "intent-sheet-step-active" : ""}`}>
          <div className="intent-sheet-copy">
            <p className="eyebrow">Qu’est-ce que vous pourriez faire ?</p>
          </div>
          <div className="intent-grid">
            {intentOptions.map(({ key, label, Icon }) => (
              <button className="intent-option" type="button" key={key} onClick={() => onChooseIntent(key)}>
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <form className={`intent-sheet-step intent-form ${intentStep === "form" ? "intent-sheet-step-active" : ""}`} onSubmit={onSubmit}>
          <div className="intent-field">
            <label>Titre du plan</label>
            <input className="intent-title-input" type="text" value={form.title} onChange={(event) => onFormChange({ ...form, title: event.target.value })} />
            <span className="intent-error" aria-live="polite"></span>
          </div>

          {selectedAvatar ? (
            <div className="intent-field intent-person-row">
              <div className="intent-participant-pill">
                <img className="avatar-photo avatar-photo--md" src={selectedAvatar.imagePath} alt={selectedAvatar.name} />
                <span className="intent-participant-name">{selectedAvatar.name}</span>
              </div>
            </div>
          ) : null}

          <fieldset className="intent-fieldset">
            <legend>Mode de visibilité</legend>
            <div className="visibility-grid">
              {visibilityModeOptions.map((option) => (
                <label className="visibility-card" key={option.key}>
                  <input
                    type="radio"
                    name="visibility-mode"
                    value={option.key}
                    checked={form.visibilityMode === option.key}
                    onChange={(event) => onFormChange({ ...form, visibilityMode: event.target.value })}
                  />
                  <div className="visibility-card__body">
                    <strong>{option.label}</strong>
                    <p>{option.helper}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="intent-fieldset">
            <legend>Quand ?</legend>
            <div className="intent-time-options">
              {[
                ["now", "Maintenant"],
                ["in-30", "Dans 30 min"],
                ["tonight", "Ce soir"],
                ["custom", "Plus tard"]
              ].map(([value, label]) => (
                <label className="intent-radio-chip" key={value}>
                  <input type="radio" name="intent-time-range" value={value} checked={form.timeRange === value} onChange={(event) => onFormChange({ ...form, timeRange: event.target.value })} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <span className="intent-error" aria-live="polite"></span>
          </fieldset>

          <div className="intent-field">
            <label>Quartier</label>
            <input type="text" placeholder="Plateau / Mile End / Centre-ville" value={form.area} onChange={(event) => onFormChange({ ...form, area: event.target.value })} />
            <span className="intent-error" aria-live="polite"></span>
          </div>

          <div className="intent-field">
            <label>Lieu approximatif</label>
            <input type="text" placeholder="Olympico / parc / Discord" value={form.venue} onChange={(event) => onFormChange({ ...form, venue: event.target.value })} />
            <span className="intent-error" aria-live="polite"></span>
          </div>

          {formError ? <p className="eyebrow">{formError}</p> : null}

          <div className="intent-form-actions">
            <button className="ghost intent-back-button" type="button" onClick={onBack}>Retour</button>
            <button className="primary-action" type="submit">Créer le plan</button>
          </div>
        </form>
      </section>
    </section>
  );
}

export default IntentSheet;
