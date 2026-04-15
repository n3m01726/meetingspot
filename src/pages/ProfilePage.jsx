import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Check, CircleDot, Pencil, Settings, Sparkles, Users, X
} from "lucide-react";
import useAuth from "../hooks/useAuth.js";
import useProfile from "../hooks/useProfile.js";
import StatePanel from "../components/StatePanel.jsx";
import { CIRCLES, availabilityMap, visibilityModeOptions } from "../constants/ui.js";

// ---------------------------------------------------------------------------
// Sous-composants locaux
// ---------------------------------------------------------------------------

function AvailabilityPicker({ value, onChange }) {
  return (
    <div className="profile-avail-picker">
      {Object.entries(availabilityMap).filter(([k]) => k !== "not-here").map(([key, opt]) => {
        const Icon = opt.icon;
        return (
          <label key={key} className={`profile-avail-option ${value === key ? "profile-avail-option--active" : ""}`}>
            <input
              type="radio"
              name="availability"
              value={key}
              checked={value === key}
              onChange={() => onChange(key)}
              className="sr-only"
            />
            <Icon size={15} />
            <span>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

function CircleSection({ circles }) {
  const inner      = circles.filter((c) => c.circleId === CIRCLES.INNER);
  const connexions = circles.filter((c) => c.circleId === CIRCLES.CONNEXIONS);

  const renderGroup = (label, tone, items) => (
    items.length > 0 && (
      <div className="profile-circle-group" key={label}>
        <p className={`profile-circle-group__label badge badge--circle ${tone}`}>{label}</p>
        <div className="profile-circle-group__list">
          {items.map((member) => (
            <article key={member.id} className="profile-circle-member">
              <img
                className="avatar__photo avatar__photo--sm"
                src={member.imagePath}
                alt={member.name}
              />
              <div>
                <strong>{member.name}</strong>
                <p>{member.statusText}</p>
              </div>
              <span className={`profile-circle-member__avail profile-circle-member__avail--${member.availability}`}>
                {member.availabilityLabel}
              </span>
            </article>
          ))}
        </div>
      </div>
    )
  );

  return (
    <div className="profile-circles">
      {renderGroup("Inner Circle", "inner", inner)}
      {renderGroup("Connexions", "connections", connexions)}
      {circles.length === 0 && (
        <p className="u-eyebrow">Aucun contact dans tes cercles.</p>
      )}
    </div>
  );
}

function HostedPlanRow({ plan, onClick }) {
  return (
    <button className="profile-plan-row" type="button" onClick={onClick}>
      <div className="profile-plan-row__info">
        <strong>{plan.title}</strong>
        <span>{plan.timeLabel} · {plan.area}</span>
      </div>
      <div className="profile-plan-row__badges">
        {plan.participantCount > 0 && (
          <span className="profile-plan-row__badge profile-plan-row__badge--green">
            {plan.participantCount} confirmé{plan.participantCount > 1 ? "s" : ""}
          </span>
        )}
        {plan.pendingCount > 0 && (
          <span className="profile-plan-row__badge profile-plan-row__badge--yellow">
            {plan.pendingCount} en attente
          </span>
        )}
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

function ProfilePage() {
  const navigate           = useNavigate();
  const { userId }         = useParams();
  const { currentUser }    = useAuth();
  const targetId           = Number(userId);
  const { profile, loading, error, saving, saveError, updateSettings } =
    useProfile(targetId, currentUser);

  const isSelf = currentUser?.id === targetId;

  // Settings form (self only)
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsForm, setSettingsForm]       = useState(null);

  const openSettings = () => {
    setSettingsForm({
      statusText:   profile.statusText   ?? "",
      availability: profile.availability ?? "maybe",
    });
    setEditingSettings(true);
  };

  const cancelSettings = () => {
    setEditingSettings(false);
    setSettingsForm(null);
  };

  const saveSettings = async () => {
    try {
      await updateSettings(settingsForm);
      setEditingSettings(false);
    } catch {
      // saveError est géré dans le hook
    }
  };

  // Active tab
  const [tab, setTab] = useState("plans");

  // ---------------------------------------------------------------------------

  if (loading) return <StatePanel label="Chargement du profil..." />;
  if (error)   return <StatePanel label={`Impossible de charger ce profil : ${error}`} />;
  if (!profile) return <StatePanel label="Profil introuvable." />;

  const availChip = availabilityMap[profile.availability] || availabilityMap["not-here"];
  const AvailIcon = availChip.icon;

  return (
    <div className="profile-page">
      <header className="profile-page__topbar">
        <button className="plan-detail__back-link" type="button" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span>Retour</span>
        </button>

        {isSelf && (
          <button
            className="btn btn--ghost btn--strong"
            type="button"
            onClick={editingSettings ? cancelSettings : openSettings}
          >
            {editingSettings ? <><X size={15} /><span>Annuler</span></> : <><Settings size={15} /><span>Modifier</span></>}
          </button>
        )}
      </header>

      <div className="profile-page__content">
        {/* Hero card */}
        <section className="panel profile-hero">
          <div className={`profile-hero__banner profile-hero__banner--${profile.availability}`} />

          <div className="profile-hero__inner">
            <div className={`profile-hero__ring avatar-strip__ring--${
              profile.availability === "down" ? "green" :
              profile.availability === "probable" ? "yellow" : "gray"
            }`}>
              <img
                className="avatar__photo avatar__photo--xl"
                src={profile.imagePath}
                alt={profile.name}
              />
            </div>

            <div className="profile-hero__info">
              <h2 className="profile-hero__name">{profile.name}</h2>

              {!editingSettings && (
                <>
                  <p className="profile-hero__status">{profile.statusText}</p>
                  <div className="profile-hero__chips">
                    <span className={`badge ${availChip.className || ""} profile-hero__avail`}>
                      <AvailIcon size={13} />
                      {profile.availabilityLabel}
                    </span>
                    {!isSelf && profile.relationshipCircleLabel && (
                      <span className="badge badge--circle">
                        {profile.relationshipCircleLabel}
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* Settings inline form */}
              {editingSettings && settingsForm && (
                <div className="profile-settings-form">
                  <label className="profile-settings-form__label">
                    <span>Statut</span>
                    <input
                      type="text"
                      maxLength={120}
                      value={settingsForm.statusText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, statusText: e.target.value })}
                      placeholder="Dis quelque chose…"
                    />
                  </label>

                  <label className="profile-settings-form__label">
                    <span>Disponibilité</span>
                    <AvailabilityPicker
                      value={settingsForm.availability}
                      onChange={(v) => setSettingsForm({ ...settingsForm, availability: v })}
                    />
                  </label>

                  {saveError && <p className="form__error">{saveError}</p>}

                  <button
                    className="btn btn--primary"
                    type="button"
                    disabled={saving}
                    onClick={saveSettings}
                  >
                    {saving ? "Enregistrement…" : <><Check size={15} /><span>Enregistrer</span></>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${tab === "plans" ? "profile-tab--active" : ""}`}
            type="button"
            onClick={() => setTab("plans")}
          >
            <Sparkles size={15} />
            <span>{isSelf ? "Mes plans" : "Plans actifs"}</span>
            {isSelf && profile.hostedPlans?.length > 0 && (
              <span className="profile-tab__count">{profile.hostedPlans.length}</span>
            )}
            {!isSelf && profile.activePlans?.length > 0 && (
              <span className="profile-tab__count">{profile.activePlans.length}</span>
            )}
          </button>

          {isSelf && (
            <button
              className={`profile-tab ${tab === "circles" ? "profile-tab--active" : ""}`}
              type="button"
              onClick={() => setTab("circles")}
            >
              <Users size={15} />
              <span>Mes cercles</span>
              {profile.circles?.length > 0 && (
                <span className="profile-tab__count">{profile.circles.length}</span>
              )}
            </button>
          )}
        </div>

        {/* Tab content */}
        {tab === "plans" && (
          <section className="panel profile-section">
            <div className="section-header section-header--compact">
              <h3>{isSelf ? "Plans que tu organises" : `Plans de ${profile.name}`}</h3>
            </div>

            {(() => {
              const plans = isSelf ? profile.hostedPlans : profile.activePlans;
              if (!plans || plans.length === 0) {
                return <p className="u-eyebrow">Aucun plan actif pour l'instant.</p>;
              }
              return (
                <div className="profile-plans-list">
                  {plans.map((plan) => (
                    <HostedPlanRow
                      key={plan.id}
                      plan={plan}
                      onClick={() => navigate(`/plans/${plan.id}`)}
                    />
                  ))}
                </div>
              );
            })()}
          </section>
        )}

        {tab === "circles" && isSelf && (
          <section className="panel profile-section">
            <div className="section-header section-header--compact">
              <h3>Tes cercles</h3>
            </div>
            <CircleSection circles={profile.circles ?? []} />
          </section>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;