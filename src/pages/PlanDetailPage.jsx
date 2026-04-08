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
      setFeedback("Réponse enregistrée.");
    } catch (nextError) {
      setFeedback(nextError.message);
    }
  };

  if (error) {
    return <StatePanel label={`Impossible de charger le plan: ${error}`} />;
  }

  if (!plan) {
    return <StatePanel label="Chargement du plan..." />;
  }

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
            <span className={`momentum-tag ${plan.momentumTone === "hot" ? "hot" : plan.momentumTone === "subtle" ? "subtle" : ""}`}>{plan.momentumLabel}</span>
          </div>

          <h2>{plan.title}</h2>
          <p className="detail-summary">{plan.summary}</p>

          <div className="detail-meta-grid">
            <DetailMeta
              icon={<Sparkles size={16} />}
              label="Heure approximative"
              value={plan.timeLabel}
              copy={`Fenêtre souple de ${plan.durationLabel}. On part dès que 2-3 personnes sont là.`}
            />
            <DetailMeta
              icon={<MapPinned size={16} />}
              label="Lieu"
              value={plan.locationDetail}
              copy={plan.addressRule}
            />
            <DetailMeta
              icon={<Users size={16} />}
              label="Participants"
              value={`${plan.confirmedCount} confirmés • ${plan.interestedCount} intéressés`}
              copy={`${plan.circle} voit le contexte du plan.`}
            />
            <DetailMeta
              icon={<ShieldCheck size={16} />}
              label="Visibilité"
              value={plan.visibility}
              copy="Les détails sensibles restent cachés tant que la présence n'est pas confirmée."
            />
          </div>
        </section>

        <section className="panel">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Répondre au plan</p>
            </div>
          </div>

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
          {feedback ? <p className="eyebrow">{feedback}</p> : null}
        </section>

        <section className="panel participants-card">
          <div className="participants-header">
            <div>
              <p className="eyebrow">Participants</p>
              <h3>Qui est déjà dedans</h3>
            </div>
          </div>

          <div className="participants-inline">
            {plan.participants.map((participant) => (
              <article className="participant-row" key={participant.id}>
                <img className="avatar-photo" src={participant.imagePath} alt={participant.name} />
                <div>
                  <strong>{participant.name}</strong>
                  <p>{participant.note || participant.responseLabel}</p>
                </div>
                <span className={`participant-state ${participant.response}`}>{participant.responseLabel}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="panel visibility-card-large">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Qui voit quoi</p>
              <h3></h3>
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
              <p className="eyebrow">Le Loop</p>
            </div>
          </div>

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
        </section>
      </main>
    </div>
  );
}

export default PlanDetailPage;
