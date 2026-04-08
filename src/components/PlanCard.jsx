function PlanCard({ plan, onOpen }) {
  const toneModifier =
    plan.momentumTone === "hot" ? " plan-card__momentum--hot" : plan.momentumTone === "subtle" ? " plan-card__momentum--subtle" : "";

  const visibilityModifier = plan.detailAccess === "locked" ? " plan-card__visibility-tag--locked" : "";

  return (
    <article className={`plan-card${plan.featured ? " plan-card--featured" : ""}${plan.muted ? " plan-card--muted" : ""}${plan.detailAccess === "locked" ? " plan-card--locked" : ""}`}>
      <header className="plan-card__header">
        <span className={`circle-tag ${plan.circleTone}`}>{plan.circle}</span>
        <span className={`plan-card__visibility-tag${visibilityModifier}`}>
          <span>{plan.visibilityModeIcon}</span>
          <span>{plan.visibilityModeLabel}</span>
        </span>
        <span className={`plan-card__momentum${toneModifier}`}>{plan.momentumLabel}</span>
      </header>

      <div className="plan-card__content">
        <h3 className="plan-card__title">{plan.title}</h3>
        <p className="plan-card__access-note">{plan.accessNote || plan.visibilityModeDescription}</p>
        {plan.creatorName ? <p className="plan-card__creator">Créé par {plan.creatorName}</p> : null}
      </div>

      <footer className="plan-card__footer">
        {plan.detailAccess === "full" && plan.participants.length > 0 ? (
          <div className="plan-card__participants" aria-label="Participants">
            <span className="plan-card__participants-label">Réactions</span>
            <div className="plan-card__participants-avatars">
              {plan.participants.slice(0, 4).map((participant) => (
                <img
                  className="plan-card__avatar avatar-photo avatar-photo--sm"
                  src={participant.imagePath}
                  alt={participant.name}
                  key={participant.id}
                />
              ))}
            </div>
          </div>
        ) : plan.detailAccess === "locked" ? (
          <div className="plan-card__locked-copy">
            <strong>Détails exacts masqués</strong>
            <span>{plan.currentUserApprovalStatus === "pending" ? "Ton RSVP est en attente d’approbation." : "Réponds pour demander l’accès complet."}</span>
          </div>
        ) : null}

        <button className="plan-card__cta" type="button" onClick={onOpen}>
          <span>{plan.ctaLabel || "Voir les détails"}</span>
        </button>
      </footer>
    </article>
  );
}

export default PlanCard;
