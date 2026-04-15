import { VISIBILITY_MODES } from "../constants/ui.js";

function PlanCard({ plan, onOpen }) {
  const visibilityModifier = plan.detailAccess === "locked" ? " plan-card__visibility-tag--locked" : "";
  const visibilityModeId = Number(plan.visibilityModeId ?? plan.visibilityMode);
  const showCircleTag = visibilityModeId !== VISIBILITY_MODES.PUBLIC_VIBE;
  const showMomentumTag = !(visibilityModeId === VISIBILITY_MODES.PUBLIC_VIBE && String(plan.momentumLabel).toLowerCase() === "public");
  const momentumModifier = showMomentumTag
    ? plan.momentumTone === "hot"
      ? " plan-card--momentum-hot"
      : plan.momentumTone === "cold"
        ? " plan-card--momentum-cold"
        : " plan-card--momentum-normal"
    : "";

  return (
    <article className={`plan-card${plan.featured ? " plan-card--featured" : ""}${plan.muted ? " plan-card--muted" : ""}${plan.detailAccess === "locked" ? " plan-card--locked" : ""}${momentumModifier}`}>
      <header className="plan-card__header">
        <span className={`plan-card__visibility-tag${visibilityModifier}`}>
          <span>{plan.visibilityModeIcon}</span>
          <span>{plan.visibilityModeLabel}</span>
        </span>

        {showCircleTag ? <span className={`badge badge--circle ${plan.circleTone}`}>{plan.circleLabel || plan.circle}</span> : null}
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
                  className="plan-card__avatar avatar__photo avatar__photo--sm"
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
