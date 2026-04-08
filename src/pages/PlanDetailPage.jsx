import { useEffect, useState } from "react";
import { ArrowLeft, MapPinned, MessageCircleMore, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AuthSwitcher from "../components/AuthSwitcher.jsx";
import DetailMeta from "../components/DetailMeta.jsx";
import StatePanel from "../components/StatePanel.jsx";
import { toneClassMap } from "../constants/ui.js";
import { fetchJson } from "../lib/api.js";
import useAuth from "../hooks/useAuth.js";

function PlanDetailPage() {
  const navigate = useNavigate();
  const { planId } = useParams();
  const auth = useAuth();
  const [plan, setPlan] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setError("");
        setFeedback("");
        const nextPlan = await fetchJson(`/api/plans/${planId}`);
        setPlan(nextPlan);
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
      setFeedback("Réponse enregistrée. Le plan vient d’être mis à jour.");
    } catch (nextError) {
      setFeedback(nextError.message);
    }
  };

  if (error) {
    const label = error.includes("non accessible")
      ? "Tu n’as pas accès à ce plan avec le profil actuellement connecté."
      : `Impossible de charger le plan: ${error}`;

    return <StatePanel label={label} />;
  }

  if (!plan) {
    return <StatePanel label="Chargement du plan..." />;
  }

  const authPrompt = auth.currentUser
    ? `Tu réponds actuellement comme ${auth.currentUser.name}.`
    : "Choisis un profil pour réagir au plan et voir ce que cette personne a réellement le droit de consulter.";

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
            <span className={`momentum-tag ${plan.momentumTone === "hot" ? "hot" : plan.momentumTone === "subtle" ? "subtle" : ""}`}>
              {plan.momentumLabel}
            </span>
          </div>

          <p className="detail-kicker">Plan spontané</p>
          <h2>{plan.title}</h2>
          <p className="detail-summary">{plan.summary}</p>

          <div className="detail-meta-grid">
            <DetailMeta
              icon={<Sparkles size={16} />}
              label="Quand"
              value={plan.timeLabel}
              copy={`Fenêtre souple de ${plan.durationLabel}. On bouge dès que 2 à 3 personnes sont vraiment partantes.`}
            />
            <DetailMeta
              icon={<MapPinned size={16} />}
              label="Où"
              value={plan.locationDetail}
              copy={plan.addressRule}
            />
            <DetailMeta
              icon={<Users size={16} />}
              label="Qui a répondu"
              value={`${plan.confirmedCount} confirmés • ${plan.interestedCount} intéressés`}
              copy={`${plan.circle} voit le contexte de ce plan.`}
            />
            <DetailMeta
              icon={<ShieldCheck size={16} />}
              label="Visibilité"
              value={plan.visibility}
              copy="Les détails sensibles restent masqués tant que la présence n'est pas confirmée."
            />
          </div>
        </section>

        <section className="panel detail-response-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Répondre</p>
              <h3>Est-ce que tu embarques ?</h3>
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

        <section className="panel participants-card">
          <div className="participants-header">
            <div>
              <p className="eyebrow">Participants</p>
              <h3>Qui est déjà dans la boucle</h3>
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

        <section className="panel visibility-card-large">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Visibilité</p>
              <h3>Qui voit quoi</h3>
            </div>
          </div>

          <div className="visibility-stack">
            {plan.visibilityLines.map((line) => (
              <article className={`visibility-line ${line.tone}`} key={line.title}>
                <strong>{line.title}</strong>
                <p>{line.body}</p>
              </article>
            ))}
          </div>
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
      </main>
    </div>
  );
}

export default PlanDetailPage;
