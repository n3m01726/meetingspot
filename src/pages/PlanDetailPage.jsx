import { useEffect, useState } from "react";
import { ArrowLeft, LockKeyhole, MapPinned, MessageCircleMore, PencilLine, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AuthSwitcher from "../components/AuthSwitcher.jsx";
import DetailMeta from "../components/DetailMeta.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { toneClassMap, VISIBILITY_MODES } from "../constants/ui.js";
import { fetchJson } from "../lib/api.js";
import { getAccessStateCopy, getVisibilityModeHelper, getVisibilityModeShortLabel, visibilityProductCopy } from "../ui/visibilityCopy.js";
import useAuth from "../hooks/useAuth.js";

function buildEditForm(plan) {
  return {
    title: plan.title || "",
    visibilityMode: plan.visibilityMode || VISIBILITY_MODES.RSVP_FIRST,
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
    visibilityMode: VISIBILITY_MODES.RSVP_FIRST,
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
      setFeedback("Connecte-toi pour répondre à ce plan.");
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
      setFeedback(
        updatedPlan.detailAccess === "locked"
          ? "Réponse enregistrée. L’accès complet reste en attente d’approbation."
          : "Réponse enregistrée. Le plan vient d’être mis à jour."
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
      setFeedback("Accès complet accordé.");
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
      setFeedback("Plan mis à jour.");
    } catch (nextError) {
      setFeedback(nextError.message);
    }
  };

  if (error) {
    const label = error.includes("non accessible")
      ? "Tu n’as pas accès à ce plan avec le profil actuellement connecté."
      : `Impossible de charger le plan : ${error}`;

    return <StatePanel label={label} />;
  }

  if (!plan) {
    return <StatePanel label="Chargement du plan..." />;
  }

  const isLocked = plan.detailAccess === "locked";
  const accessStateCopy = getAccessStateCopy({
    detailAccess: plan.detailAccess,
    approvalStatus: plan.currentUserApprovalStatus
  });
  const authPrompt = auth.currentUser
    ? `Tu réponds actuellement comme ${auth.currentUser.name}.`
    : "Choisis un profil pour réagir au plan et comprendre quel niveau d’accès cette personne obtient.";

  return (
    <div className="detail-shell">
      <header className="detail-topbar">
        <button className="back-link" type="button" onClick={() => navigate("/")}>
          <ArrowLeft size={18} />
          <span>Retour aux plans</span>
        </button>
      </header>

      <main className="detail-page">
        <section className="panel detail-hero">
          <div className="detail-hero-top">
            <span className={`circle-tag ${plan.circleTone}`}>{plan.circle}</span>
            <span className="plan-card__visibility-tag">
              <span>{plan.visibilityModeIcon}</span>
              <span>{getVisibilityModeShortLabel(plan.visibilityMode)}</span>
            </span>
            <span className={`momentum-tag ${plan.momentumTone === "hot" ? "hot" : plan.momentumTone === "subtle" ? "subtle" : ""}`}>
              {plan.momentumLabel}
            </span>
          </div>

          <p className="detail-kicker">Plan spontané</p>
          <div className="detail-title-row">
            <h2>{plan.title}</h2>
            {plan.isEditable ? (
              <button className="ghost-button strong detail-title-action" type="button" onClick={() => {
                setEditForm(buildEditForm(plan));
                setIsEditing((current) => !current);
              }}>
                <PencilLine size={16} />
                <span>{isEditing ? "Fermer l’édition" : "Modifier ce plan"}</span>
              </button>
            ) : null}
          </div>
          <p className="detail-summary">{plan.summary}</p>
          {plan.creatorName ? <p className="detail-creator">Créé par {plan.creatorName}</p> : null}

          {isLocked ? (
            <div className="detail-locked-card">
              <span className="detail-locked-card__icon">
                <LockKeyhole size={18} />
              </span>
              <div className="detail-locked-card__copy">
                <strong>{visibilityProductCopy.detail.accessLockedTitle}</strong>
                <p>{plan.lockedReason || accessStateCopy.body || visibilityProductCopy.detail.accessLockedDefault}</p>
              </div>
            </div>
          ) : null}

          <div className="detail-meta-grid">
            <DetailMeta
              icon={<Sparkles size={16} />}
              label="Quand"
              value={isLocked ? "Accès complet après approbation" : plan.timeLabel}
              copy={isLocked ? "L’heure précise apparaît dès que l’accès complet est accordé." : `Fenêtre souple de ${plan.durationLabel}. On bouge dès que 2 à 3 personnes sont vraiment partantes.`}
            />
            <DetailMeta
              icon={<MapPinned size={16} />}
              label={visibilityProductCopy.detail.accessWhereLabel}
              value={isLocked ? "Masqué pour le moment" : plan.locationDetail}
              copy={isLocked ? "Tu vois le contexte du plan, pas le lieu exact pour l’instant." : plan.addressRule}
            />
            <DetailMeta
              icon={<Users size={16} />}
              label={visibilityProductCopy.detail.accessResponsesLabel}
              value={`${plan.confirmedCount} confirmés • ${plan.interestedCount} intéressés`}
              copy={isLocked ? "La liste complète se débloque avec l’accès complet." : `${plan.circle} voit le contexte de ce plan.`}
            />
            <DetailMeta
              icon={<ShieldCheck size={16} />}
              label={visibilityProductCopy.detail.visibilitySectionTitle}
              value={getVisibilityModeShortLabel(plan.visibilityMode)}
              copy={getVisibilityModeHelper(plan.visibilityMode, "detailHelper")}
            />
          </div>
        </section>

        {plan.isEditable && isEditing ? (
          <section className="panel detail-edit-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Édition</p>
                <h3>Mettre à jour ce plan</h3>
              </div>
            </div>

            <form className="detail-edit-form" onSubmit={handleUpdatePlan}>
              <label>
                <span>Titre</span>
                <input type="text" value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} />
              </label>

              <label>
                <span>{visibilityProductCopy.detail.visibilitySectionTitle}</span>
                <select value={editForm.visibilityMode} onChange={(event) => setEditForm({ ...editForm, visibilityMode: event.target.value })}>
                  {Object.values(VISIBILITY_MODES).map((mode) => (
                    <option key={mode} value={mode}>{getVisibilityModeShortLabel(mode)}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Quand</span>
                <input type="text" value={editForm.timeLabel} onChange={(event) => setEditForm({ ...editForm, timeLabel: event.target.value })} />
              </label>

              <label>
                <span>Cercle</span>
                <input type="text" value={plan.circle} disabled />
              </label>

              <label>
                <span>Quartier</span>
                <input type="text" value={editForm.area} onChange={(event) => setEditForm({ ...editForm, area: event.target.value })} />
              </label>

              <label>
                <span>Lieu approximatif</span>
                <input type="text" value={editForm.locationDetail} onChange={(event) => setEditForm({ ...editForm, locationDetail: event.target.value })} />
              </label>

              <label className="detail-edit-form__full">
                <span>Résumé</span>
                <textarea rows="4" value={editForm.summary} onChange={(event) => setEditForm({ ...editForm, summary: event.target.value })}></textarea>
              </label>

              <div className="detail-edit-form__actions">
                <button className="ghost" type="button" onClick={() => {
                  setEditForm(buildEditForm(plan));
                  setIsEditing(false);
                }}>
                  Annuler
                </button>
                <button className="primary-action" type="submit">Enregistrer</button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="panel detail-response-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">{visibilityProductCopy.detail.responseSection}</p>
              <h3>{isLocked ? visibilityProductCopy.detail.unlockHeading : visibilityProductCopy.detail.joinHeading}</h3>
            </div>
          </div>

          <p className="detail-section-copy">{authPrompt}</p>

          <AuthSwitcher
            currentUser={auth.currentUser || null}
            users={auth.users}
            onLogin={async (userId) => {
              await auth.login(userId);
              setFeedback("Profil connecté.");
            }}
            onLogout={async () => {
              await auth.logout();
              setFeedback("Profil déconnecté.");
            }}
          />

          <div className="detail-actions">
            <button className="primary-action" type="button" onClick={() => handleRsvp("down")}>Je suis dispo</button>
            <button className="secondary" type="button" onClick={() => handleRsvp("maybe")}>Peut-être</button>
            <button className="ghost" type="button" onClick={() => handleRsvp("probable")}>Je passe</button>
          </div>

          {feedback ? <p className="detail-feedback">{feedback}</p> : null}
        </section>

        {plan.canApproveRsvps && plan.pendingApprovals.length > 0 ? (
          <section className="panel approvals-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Accès complet</p>
                <h3>Demandes en attente</h3>
              </div>
            </div>

            <div className="approvals-list">
              {plan.pendingApprovals.map((participant) => (
                <article className="approval-row" key={participant.id}>
                  <div className="approval-row__identity">
                    <img className="avatar-photo avatar-photo--md" src={participant.imagePath} alt={participant.name} />
                    <div>
                      <strong>{participant.name}</strong>
                      <p>{participant.responseLabel}</p>
                    </div>
                  </div>
                  <button className="plan-card__cta" type="button" onClick={() => handleApprove(participant.id)}>
                    Accorder l’accès complet
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {!isLocked ? (
          <>
            <section className="panel participants-card">
              <div className="participants-header">
                <div>
                  <p className="eyebrow">Participants</p>
                  <h3>Qui a déjà l’accès complet</h3>
                </div>
              </div>

              {plan.participants.length > 0 ? (
                <div className="participants-inline">
                  {plan.participants.map((participant) => (
                    <article className="participant-row" key={participant.id}>
                      <img className="avatar-photo avatar-photo--md" src={participant.imagePath} alt={participant.name} />
                      <div>
                        <strong>{participant.name}</strong>
                        <p>{participant.note || participant.responseLabel}</p>
                      </div>
                      <span className={`participant-state ${participant.response}`}>{participant.responseLabel}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="detail-empty">Aucune réponse pour l’instant.</p>
              )}
            </section>

            <section className="panel checkins-card">
              <div className="checkins-header">
                <div>
                  <p className="eyebrow">Le loop</p>
                  <h3>Derniers signaux du plan</h3>
                </div>
              </div>

              {plan.checkins.length > 0 ? (
                <div className="checkins-list">
                  {plan.checkins.map((checkin) => (
                    <article className="checkin-item" key={checkin.id}>
                      <span className={`checkin-dot ${toneClassMap[checkin.tone] || ""}`}></span>
                      <div>
                        <span className="checkin-meta">
                          <MessageCircleMore size={16} />
                          <span>{checkin.name} • il y a {checkin.minutesAgo} min</span>
                        </span>
                        <p>{checkin.message}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="detail-empty">Pas encore de check-in sur ce plan.</p>
              )}
            </section>
          </>
        ) : null}

        <section className="panel visibility-card-large">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">{visibilityProductCopy.detail.visibilitySectionTitle}</p>
              <h3>{visibilityProductCopy.detail.accessSectionTitle}</h3>
            </div>
          </div>

          <div className="visibility-stack">
            <article className="visibility-line vc-connections">
              <strong>Cercle</strong>
              <p>{`${plan.circle} décrit le contexte social de ce plan.`}</p>
            </article>
            <article className="visibility-line vc-inner">
              <strong>{visibilityProductCopy.detail.visibilitySectionTitle}</strong>
              <p>{getVisibilityModeHelper(plan.visibilityMode, "detailHelper")}</p>
            </article>
            <article className="visibility-line vc-private">
              <strong>{visibilityProductCopy.detail.accessSectionTitle}</strong>
              <p>{isLocked ? (plan.lockedReason || accessStateCopy.body || visibilityProductCopy.detail.accessLockedDefault) : "Les détails exacts sont visibles pour toi maintenant."}</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default PlanDetailPage;
