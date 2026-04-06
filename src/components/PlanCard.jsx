function PlanCard({ plan, onOpen }) {
  return (
    <article className={`event-card ${plan.featured ? "featured" : ""} ${plan.muted ? "muted" : ""}`}>
      <div className="card-topline">
        <span className={`circle-tag ${plan.circleTone}`}>{plan.circle}</span>
        <span className={`momentum-tag ${plan.momentumTone === "hot" ? "hot" : plan.momentumTone === "subtle" ? "subtle" : ""}`}>{plan.momentumLabel}</span>
      </div>

      <h3>{plan.title}</h3>
      <div className="event-card-footer">
        <div className="participant-stack" aria-label="Participants">
          <div className="participant-stack text"> Ils ont réagit à ce plan : </div>
          {plan.participants.slice(0, 4).map((participant) => (
            <img className="participant-avatar" src={participant.imagePath} alt={participant.name} key={participant.id} />
          ))}
        </div>

        <button className="detail-link detail-link-button plan-card-cta" type="button" onClick={onOpen}>
          <span>Voir les détails</span>
        </button>
      </div>
    </article>
  );
}

export default PlanCard;
