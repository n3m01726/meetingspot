function PlanCard({ plan, onOpen }) {
  const toneModifier =
    plan.momentumTone === "hot" ? " plan-card__momentum--hot" : plan.momentumTone === "subtle" ? " plan-card__momentum--subtle" : "";

  return (
    <article className={`plan-card${plan.featured ? " plan-card--featured" : ""}${plan.muted ? " plan-card--muted" : ""}`}>
      <header className="plan-card__header">
        <span className={`circle-tag ${plan.circleTone}`}>{plan.circle}</span>
        <span className={`plan-card__momentum${toneModifier}`}>{plan.momentumLabel}</span>
      </header>

      <div className="plan-card__content">
        <h3 className="plan-card__title">{plan.title}</h3>
      </div>

      <footer className="plan-card__footer">
        <div className="plan-card__participants" aria-label="Participants">
          <span className="plan-card__participants-label">Ils ont réagi à ce plan :</span>
          {plan.participants.slice(0, 4).map((participant) => (
            <img className="plan-card__avatar" src={participant.imagePath} alt={participant.name} key={participant.id} />
          ))}
        </div>

        <button className="plan-card__cta" type="button" onClick={onOpen}>
          <span>Voir les details</span>
        </button>
      </footer>
    </article>
  );
}

export default PlanCard;
