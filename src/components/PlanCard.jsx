import { getAccessStateCopy, getVisibilityModeHelper, getVisibilityModeShortLabel, visibilityProductCopy } from "../ui/visibilityCopy.js";

function PlanCard({ plan, onOpen }) {
  const toneModifier =
    plan.momentumTone === "hot" ? " plan-card__momentum--hot" : plan.momentumTone === "subtle" ? " plan-card__momentum--subtle" : "";

  const visibilityModifier = plan.detailAccess === "locked" ? " plan-card__visibility-tag--locked" : "";
  const accessStateCopy = getAccessStateCopy({
    detailAccess: plan.detailAccess,
    approvalStatus: plan.currentUserApprovalStatus
  });

  return (
    <article className={`plan-card${plan.featured ? " plan-card--featured" : ""}${plan.muted ? " plan-card--muted" : ""}${plan.detailAccess === "locked" ? " plan-card--locked" : ""}`}>
      <header className="plan-card__header">
        <span className={`circle-tag ${plan.circleTone}`}>{plan.circle}</span>
        <span className={`plan-card__visibility-tag${visibilityModifier}`}>
          <span>{plan.visibilityModeIcon}</span>
          <span>{getVisibilityModeShortLabel(plan.visibilityMode)}</span>
        </span>
        <span className={`plan-card__momentum${toneModifier}`}>{plan.momentumLabel}</span>
      </header>

      <div className="plan-card__content">
        <h3 className="plan-card__title">{plan.title}</h3>
        <p className="plan-card__access-note">
          {plan.detailAccess === "locked" ? getVisibilityModeHelper(plan.visibilityMode, "feedHelper") : getVisibilityModeHelper(plan.visibilityMode, "detailHelper")}
        </p>
        {plan.creatorName ? <p className="plan-card__creator">{`${visibilityProductCopy.feed.creatorPrefix} ${plan.creatorName}`}</p> : null}
      </div>

      <footer className="plan-card__footer">
        {plan.detailAccess === "full" && plan.participants.length > 0 ? (
          <div className="plan-card__participants" aria-label="Participants">
            <span className="plan-card__participants-label">{visibilityProductCopy.feed.participantsLabel}</span>
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
            <strong>{accessStateCopy.title}</strong>
            <span>{accessStateCopy.body}</span>
          </div>
        ) : null}

        <button className="plan-card__cta" type="button" onClick={onOpen}>
          <span>{plan.detailAccess === "locked" ? visibilityProductCopy.feed.unlockDetailsCta : visibilityProductCopy.feed.openDetailsCta}</span>
        </button>
      </footer>
    </article>
  );
}

export default PlanCard;
