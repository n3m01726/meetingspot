import { CIRCLES, availabilityLabelMap } from "../constants/ui.js";

const initialValues = {
  name: "",
  availability: "maybe",
  relationshipCircleId: CIRCLES.CONNEXIONS
};

function AddContactModal({
  isOpen,
  form = initialValues,
  error = "",
  onClose,
  onFormChange,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <section className="add-contact-modal intent-sheet-layer intent-sheet-layer--open" aria-hidden={!isOpen}>
      <button className="intent-sheet-layer__backdrop" type="button" aria-label="Fermer la fenetre" onClick={onClose}></button>
      <section className="intent-sheet add-contact-modal__sheet" aria-modal="true" role="dialog" aria-labelledby="add-contact-title">
        <header className="intent-sheet__header">
          <div>
            <h3 id="add-contact-title">Ajouter un contact</h3>
            <p className="u-eyebrow">Ce contact est ajoute localement pour cette session.</p>
          </div>
          <button className="drawer__close" type="button" onClick={onClose}>Fermer</button>
        </header>

        <form className="form form--intent add-contact-modal__form" onSubmit={onSubmit}>
          <label className="add-contact-modal__field">
            <span>Nom</span>
            <input
              type="text"
              value={form.name}
              placeholder="Ex: Alex"
              onChange={(event) => onFormChange({ ...form, name: event.target.value })}
            />
          </label>

          <label className="add-contact-modal__field">
            <span>Cercle</span>
            <select
              value={String(form.relationshipCircleId)}
              onChange={(event) => onFormChange({ ...form, relationshipCircleId: Number(event.target.value) })}
            >
              <option value={String(CIRCLES.INNER)}>Inner Circle</option>
              <option value={String(CIRCLES.CONNEXIONS)}>Connexions</option>
            </select>
          </label>

          {error ? <p className="u-eyebrow">{error}</p> : null}

          <div className="add-contact-modal__actions">
            <button className="btn btn--ghost" type="button" onClick={onClose}>Annuler</button>
            <button className="btn btn--primary" type="submit">Ajouter</button>
          </div>
        </form>
      </section>
    </section>
  );
}

export default AddContactModal;
