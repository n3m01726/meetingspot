import { useEffect, useState } from "react";
import { ArrowLeft, LockKeyhole, MapPinned, MessageCircleMore, PencilLine, ShieldCheck, Sparkles, Trash, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AuthSwitcher from "../components/AuthSwitcher.jsx";
import DetailMeta from "../components/DetailMeta.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { responseLabelMap, toneClassMap, availabilityMap, visibilityModeOptions, VISIBILITY_MODES } from "../constants/ui.js";
import useAuth from "../hooks/useAuth.js";
import { fetchJson } from "../lib/api.js";

function buildEditForm(plan) {
  return {
    title: plan.title || "",
    visibilityModeId: Number(plan.visibilityModeId ?? visibilityModeOptions[0].key),
    targetCircleId: Number(plan.targetCircleId ?? 2),
    timeLabel: plan.timeLabel || "",
    area: plan.area || "",
    locationDetail: plan.locationDetail || "",
    summary: plan.summary || ""
  };
}

function PlanDetailPage() {
  const navigate = useNavigate();
  const { planId } = useParams();
  const auth = useAuth();
  const [plan, setPlan] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    visibilityModeId: visibilityModeOptions[0].key,
    targetCircleId: 2,
    timeLabel: "",
    area: "",
    locationDetail: "",
    summary: ""
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setError("");
        setFeedback("");
        const nextPlan = await fetchJson(`/api/plans/${planId}`);
        setPlan(nextPlan);
        setEditForm(buildEditForm(nextPlan));
      } catch (nextError) {
        setError(nextError.message);
      }
    };

    loadData();
  }, [planId, auth.currentUser?.id]);

  const handleRsvp = async (response) => {
    if (!auth.currentUser) {
      setFeedback("Connecte-toi pour repondre a ce plan.");
      return;
    }

    try {
      const updatedPlan = await fetchJson(`/api/plans/${planId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response })
      });
      setPlan(updatedPlan);
      setEditForm(buildEditForm(updatedPlan));

      if (response === "pass") {
        setFeedback("Tu ne fais plus partie de ce plan.");
        return;
      }

      setFeedback(
        updatedPlan.detailAccess === "locked"
          ? "Reponse enregistree. L'hote doit encore approuver l'acces complet."
          : "Reponse enregistree. Le plan vient d'etre mis a jour."
      );
    } catch (nextError) {
      setFeedback(nextError.message);
    }
  };

  const handleApprove = async (participantUserId) => {
    try {
      const updatedPlan = await fetchJson(`/api/plans/${planId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantUserId })
      });
      setPlan(updatedPlan);
      setEditForm(buildEditForm(updatedPlan));
      setFeedback("Acces approuve. Cette personne peut maintenant voir les details exacts.");
    } catch (nextError) {
      setFeedback(nextError.message);
    }
  };

  const handleUpdatePlan = async (event) => {
    event.preventDefault();

    try {
      const updatedPlan = await fetchJson(`/api/plans/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      setPlan(updatedPlan);
      setEditForm(buildEditForm(updatedPlan));
      setIsEditing(false);
      setFeedback("Plan mis a jour.");
    } catch (nextError) {
      setFeedback(nextError.message);
    }
  };

  const handleDeletePlan = async () => {
    const confirmed = window.confirm("Supprimer ce plan ? Cette action est definitive.");
    if (!confirmed) {
      return;
    }

    try {
      await fetchJson(`/api/plans/${planId}`, { method: "DELETE" });
      navigate("/");
    } catch (nextError) {
      setFeedback(nextError.message);
    }
  };

  if (error) {
    const label = error.includes("non accessible")
      ? "Tu n'as pas acces a ce plan avec le profil actuellement connecte."
      : `Impossible de charger le plan : ${error}`;

    return <StatePanel label={label} />;
  }

  if (!plan) {
    return <StatePanel label="Chargement du plan..." />;
  }

  const visibilityModeId = Number(plan.visibilityModeId ?? plan.visibilityMode);
  const isLocked = plan.detailAccess === "locked";
  const showCircleTag = visibilityModeId !== VISIBILITY_MODES.PUBLIC_VIBE;
  const authPrompt = auth.currentUser
    ? `Tu reponds actuellement comme ${auth.currentUser.name}.`
    : "Choisis un profil pour reagir au plan et voir ce que cette personne a reellement le droit de consulter.";

  return (
    <div className="plan-detail">
      <header className="plan-detail__topbar">
        <button className="plan-detail__back-link" type="button" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          <span>Retour aux plans</span>
        </button>
      </header>

      <main className="plan-detail__page">
        <section className="panel plan-detail__hero">
          <div className="plan-detail__hero-top">
            {showCircleTag ? <span className={`badge badge--circle ${plan.circleTone}`}>{plan.circleLabel}</span> : null}
            <span className="badge badge--visibility">
              <span>{plan.visibilityModeIcon}</span>
              <span>{plan.visibilityModeLabel}</span>
            </span>
          </div>

          <div className="plan-detail__title-row">
            <h2>{plan.title}</h2>
            {plan.isEditable ? (
              <div className="plan-detail__title-actions">
                <button
                  className="btn btn--ghost btn--strong plan-detail__title-action"
                  type="button"
                  onClick={() => {
                    setEditForm(buildEditForm(plan));
                    setIsEditing((current) => !current);
                  }}
                >
                  <PencilLine size={16} />
                  <span>{isEditing ? "Fermer l'edition" : "Modifier ce plan"}</span>
                </button>
                <button className="btn btn--ghost btn--strong plan-detail__title-action plan-detail__title-action--danger" type="button" onClick={handleDeletePlan}>
                  <span><Trash size={16} /> Supprimer ce plan</span>
                </button>
              </div>
            ) : null}
          </div>

          <p className="plan-detail__summary">{plan.summary}</p>
          {plan.creatorName ? <p className="plan-detail__creator">Cree par {plan.creatorName}</p> : null}

          {isLocked ? (
            <div className="lock-note">
              <span className="lock-note__icon">
                <LockKeyhole size={18} />
              </span>
              <div className="lock-note__copy">
                <strong>Details exacts verrouilles pour le moment</strong>
                <p>{plan.lockedReason || "Reponds d'abord au plan pour demander l'acces complet."}</p>
              </div>
            </div>
          ) : null}

          <div className="plan-detail__meta-grid">
            <DetailMeta
              icon={<Sparkles size={16} />}
              label="Quand"
              value={isLocked ? "Visible apres approbation" : plan.timeLabel}
              copy={isLocked ? "La fenetre precise se debloque une fois l'acces complet accorde." : `Fenetre souple de ${plan.durationLabel}. On bouge des que 2 a 3 personnes sont vraiment partantes.`}
            />
            <DetailMeta
              icon={<MapPinned size={16} />}
              label="Ou"
              value={isLocked ? "Lieu exact masque" : plan.locationDetail}
              copy={isLocked ? "Tu vois le contexte du plan, pas l'adresse exacte pour l'instant." : plan.addressRule}
            />
            <DetailMeta
              icon={<Users size={16} />}
              label="Reponses"
              value={`${plan.confirmedCount} confirmes - ${plan.interestedCount} interesses`}
              copy={isLocked ? "La liste complete des participants se debloque apres approbation." : `${plan.circleLabel} voit le contexte de ce plan.`}
            />
            <DetailMeta
              icon={<ShieldCheck size={16} />}
              label="Visibilite"
              value={plan.visibilityModeLabel}
              copy={plan.visibilityModeDescription}
            />
          </div>
        </section>

        {plan.isEditable && isEditing ? (
          <section className="panel plan-detail__edit-card">
            <div className="section-header section-header--compact">
              <div>
                <h3>Mettre a jour ce plan</h3>
              </div>
            </div>

            <form className="edit-form" onSubmit={handleUpdatePlan}>
              <label>
                <span>Titre</span>
                <input type="text" value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} />
              </label>

              <label>
                <span>Mode de visibilite</span>
                <select value={editForm.visibilityModeId} onChange={(event) => setEditForm({ ...editForm, visibilityModeId: Number(event.target.value) })}>
                  {visibilityModeOptions.map((option) => (
                    <option key={option.key} value={option.key}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Quand</span>
                <input type="text" value={editForm.timeLabel} onChange={(event) => setEditForm({ ...editForm, timeLabel: event.target.value })} />
              </label>

              <label>
                <span>Quartier</span>
                <input type="text" value={editForm.area} onChange={(event) => setEditForm({ ...editForm, area: event.target.value })} />
              </label>

              <label>
                <span>Lieu approximatif</span>
                <input type="text" value={editForm.locationDetail} onChange={(event) => setEditForm({ ...editForm, locationDetail: event.target.value })} />
              </label>

              <label className="edit-form__full">
                <span>Resume</span>
                <textarea rows="4" value={editForm.summary} onChange={(event) => setEditForm({ ...editForm, summary: event.target.value })}></textarea>
              </label>

              <div className="edit-form__actions">
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => {
                    setEditForm(buildEditForm(plan));
                    setIsEditing(false);
                  }}
                >
                  Annuler
                </button>
                <button className="btn btn--primary" type="submit">Enregistrer</button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="panel plan-detail__response-card">
          <div className="section-header section-header--compact">
            <div>
              <h3>{isLocked ? "Debloquer l'acces complet" : "Est-ce que tu embarques ?"}</h3>
            </div>
          </div>

          <p className="plan-detail__copy">{authPrompt}</p>

          <AuthSwitcher
            currentUser={auth.currentUser || null}
            users={auth.users}
            onLogin={async (userId) => {
              await auth.login(userId);
              setFeedback("Profil connecte.");
            }}
            onLogout={async () => {
              await auth.logout();
              setFeedback("Profil deconnecte.");
            }}
          />
<div className="plan-detail__actions">
  {Object.entries(availabilityMap).map(([key, option]) => {
    const Icon = option.icon;

    return (
      <button
        key={key}
        className={`btn ${option.className}`}
        type="button"
        onClick={() => handleRsvp(key)}
      >
        <Icon size={16} />
        {option.label}
      </button>
    );
  })}
</div>

          {feedback ? <p className="plan-detail__feedback">{feedback}</p> : null}
        </section>

        {plan.canApproveRsvps && plan.pendingApprovals.length > 0 ? (
          <section className="panel plan-detail__approvals-card">
            <div className="section-header section-header--compact">
              <div>
                <p className="u-eyebrow">Demandes en attente</p>
              </div>
            </div>

            <div className="approvals__list">
              {plan.pendingApprovals.map((participant) => (
                <article className="approval-row" key={participant.id}>
                  <div className="approval-row__identity">
                    <img className="avatar__photo avatar__photo--md" src={participant.imagePath} alt={participant.name} />
                    <div>
                      <strong>{participant.name}</strong>
                      <p>{responseLabelMap[participant.response] || participant.response}</p>
                    </div>
                  </div>
                  <button className="btn btn--soft" type="button" onClick={() => handleApprove(participant.id)}>
                    Approuver
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {!isLocked ? (
          <>
            <section className="panel plan-detail__participants-card">
              <div className="participants__header">
                <div>
                  <h3>Qui est deja dans la boucle</h3>
                </div>
              </div>

              {plan.participants.length > 0 ? (
                <div className="participants__list">
                  {plan.participants.map((participant) => (
                    <article className="participant-row" key={participant.id}>
                      <img className="avatar__photo avatar__photo--md" src={participant.imagePath} alt={participant.name} />
                      <div>
                        <strong>{participant.name}</strong>
                      </div>
                      <span className={`participant-row__state participant-row__state--${participant.response}`}>{responseLabelMap[participant.response] || participant.response}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="plan-detail__empty">Aucune reponse pour l'instant.</p>
              )}
            </section>

            <section className="panel plan-detail__checkins-card">
              <div className="checkins__header">
                <div>
                  <h3>Derniers signaux du plan</h3>
                </div>
              </div>

              {plan.checkins.length > 0 ? (
                <div className="checkins__list">
                  {plan.checkins.map((checkin) => (
                    <article className="checkin-item" key={checkin.id}>
                      <span className={`checkin-item__dot ${toneClassMap[checkin.tone] || ""}`}></span>
                      <div>
                        <span className="checkin-item__meta">
                          <MessageCircleMore size={16} />
                          <span>{checkin.name} - il y a {checkin.minutesAgo} min</span>
                        </span>
                        <p>{checkin.message}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="plan-detail__empty">Pas encore de check-in sur ce plan.</p>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default PlanDetailPage;
