import { UserRound } from "lucide-react";
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
    <section className={`intent-sheet-layer ${isOpen ? "intent-sheet-layer--open" : ""}`} aria-hidden={!isOpen}>
      <button className="intent-sheet-layer__backdrop" type="button" aria-label="Fermer la feuille" onClick={onClose}></button>
      <section className="intent-sheet" aria-labelledby="intent-sheet-title" aria-modal="true" role="dialog">
        <div className="intent-sheet__handle" aria-hidden="true"></div>
        <div className="intent-sheet__header">
          <div className="intent-sheet__selected-avatar">
            {selectedAvatar ? (
              <div className="intent-sheet__selected-ring">
                <img
                  className="intent-sheet__selected-image avatar__photo avatar__photo--md"
                  src={selectedAvatar.imagePath}
                  alt={selectedAvatar.name}
                />
              </div>
            ) : null}
            <div className="intent-sheet__selected-copy">
              <span className="intent-sheet__title">
                {selectedAvatar ? "make a plan with" : "make a plan"}
              </span>
              {selectedAvatar ? <strong id="intent-sheet-title">{selectedAvatar.name}</strong> : <strong id="intent-sheet-title"></strong>}
              {selectedAvatar ? (
                <span className="intent-sheet__selected-meta">
                  {`${selectedAvatar.availabilityLabel || availabilityLabelMap[selectedAvatar.availability]} - ${selectedAvatar.relationshipCircleLabel || selectedAvatar.circle || ""}`}
                </span>
              ) : (
                <span className="intent-sheet__selected-meta">Choose an activity, a method of opening and a simple context.</span>
              )}
            </div>
            <div className="intent-sheet__profile-icon"><UserRound size={32} /></div>
          </div>
        </div>

        <div className={`intent-sheet__step ${intentStep === "intent" ? "intent-sheet__step--active" : ""}`}>
          <div className="intent-sheet__copy">
            <p className="u-eyebrow">What could you do?</p>
          </div>
          <div className="intent-sheet__intent-grid">
            {intentOptions.map(({ key, label, Icon }) => (
              <button className="intent-sheet__intent-option" type="button" key={key} onClick={() => onChooseIntent(key)}>
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <form className={`intent-sheet__step form form--intent ${intentStep === "form" ? "intent-sheet__step--active" : ""}`} onSubmit={onSubmit}>
          <div className="form__field">
            <label>plan title</label>
            <input className="intent-sheet__title-input" type="text" value={form.title} onChange={(event) => onFormChange({ ...form, title: event.target.value })} />
            <span className="form__error" aria-live="polite"></span>
          </div>

          {selectedAvatar ? (
            <div className="form__field intent-sheet__person-row">
              <div className="intent-sheet__participant-pill">
                <img className="avatar__photo avatar__photo--md" src={selectedAvatar.imagePath} alt={selectedAvatar.name} />
                <span className="intent-sheet__participant-name">{selectedAvatar.name}</span>
              </div>
            </div>
          ) : null}

          <fieldset className="form__fieldset">
            <legend>who can see your plan?</legend>
            <div className="visibility-grid">
              {visibilityModeOptions.map((option) => (
                <label className="visibility-card" key={option.key}>
                  <input
                    type="radio"
                    name="visibility-mode"
                    value={option.key}
                    checked={Number(form.visibilityMode) === Number(option.key)}
                    onChange={(event) => onFormChange({ ...form, visibilityMode: Number(event.target.value) })}
                  />
                  <div className="visibility-card__body">
                    <strong>{option.label}</strong>
                    <p>{option.helper}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="form__fieldset">
            <legend>when ?</legend>
            <div className="intent-sheet__time-options">
              {[
                ["now", "now"],
                ["in-30", "in 30 min"],
                ["tonight", "tonight"],
                ["custom", "later"]
              ].map(([value, label]) => (
                <label className="intent-sheet__radio-chip" key={value}>
                  <input type="radio" name="intent-time-range" value={value} checked={form.timeRange === value} onChange={(event) => onFormChange({ ...form, timeRange: event.target.value })} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <span className="form__error" aria-live="polite"></span>
          </fieldset>

          <div className="form__field">
            <label>Neighborhood</label>
            <input type="text" placeholder="Plateau / Mile End / Centre-ville" value={form.area} onChange={(event) => onFormChange({ ...form, area: event.target.value })} />
            <span className="form__error" aria-live="polite"></span>
          </div>

          <div className="form__field">
            <label>Approximate location</label>
            <input type="text" placeholder="Olympico / parc / Discord" value={form.venue} onChange={(event) => onFormChange({ ...form, venue: event.target.value })} />
            <span className="form__error" aria-live="polite"></span>
          </div>

          {formError ? <p className="u-eyebrow">{formError}</p> : null}

          <div className="intent-sheet__actions">
            <button className="btn btn--ghost intent-sheet__back" type="button" onClick={onBack}>Retour</button>
            <button className="btn btn--primary" type="submit">Creer le plan</button>
          </div>
        </form>
      </section>
    </section>
  );
}

export default IntentSheet;
