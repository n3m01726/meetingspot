function PlanCard({ plan, onOpen, onRsvp }) {
  return (
    <article className={`event-card ${plan.featured ? "featured" : ""} ${plan.muted ? "muted" : ""}`}>
      <div className="card-topline">
        <span className={`circle-tag ${plan.circleTone}`}>{plan.circle}</span>
        <span className={`momentum-tag ${plan.momentumTone === "hot" ? "hot" : plan.momentumTone === "subtle" ? "subtle" : ""}`}>{plan.momentumLabel}</span>
      </div>
      <button type="button" className="detail-link detail-link-button" onClick={onOpen}>
        <h4>{plan.title}</h4>
      </button>
      <div className="meta-chips">
        <span className="meta-chip">{plan.timeLabel}</span>
        <span className="meta-chip">{plan.durationLabel}</span>
        <span className="meta-chip">{plan.area}</span>
      </div>
      <p className={`event-detail ${plan.featured ? "featured-copy" : ""}`}>{plan.summary}</p>
      <div className="participants-row">
        <div className="participant-stack" aria-label="Participants">
          {plan.participants.slice(0, 3).map((participant) => (
            <img className="participant-avatar" src={participant.imagePath} alt={participant.name} key={participant.id} />
          ))}
        </div>
        <p className="participant-copy">
          Confirmes: {plan.participantSummary.confirmed.join(", ") || "Personne"} · Interesses: {plan.participantSummary.interested.join(", ") || "Personne"}
        </p>
      </div>
      <div className="action-row">
        <button className="primary-action" type="button" onClick={() => onRsvp(plan.id, "down")}>Je suis dispo</button>
        <button className="secondary" type="button" onClick={() => onRsvp(plan.id, "maybe")}>Peut-etre</button>
        <button className="ghost" type="button" onClick={onOpen}>Voir</button>
      </div>
      <button className="detail-link detail-link-button" type="button" onClick={onOpen}>
        <span>Voir le detail du plan</span>
      </button>
    </article>
  );
}

export default PlanCard;
