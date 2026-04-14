import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, UserRound } from "lucide-react";
import { fetchJson } from "../lib/api.js";
import { availabilityToneMap } from "../constants/ui.js";

/**
 * AvatarPopover
 *
 * Wrapper autour d'un avatar qui affiche une popover mini-profil au clic.
 * Les données sont chargées à la demande (lazy) pour ne pas surcharger
 * le chargement initial de la page.
 *
 * Props :
 *   person        — objet présence de base (id, name, imagePath, availability…)
 *   currentUser   — utilisateur connecté (peut être null)
 *   onCreatePlan  — callback (person) → ouvre l'IntentSheet avec cette personne
 *   children      — le trigger (l'avatar lui-même)
 */
function AvatarPopover({ person, currentUser, onCreatePlan, children }) {
  const navigate          = useNavigate();
  const [open, setOpen]   = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const containerRef      = useRef(null);

  // Ferme la popover si on clique dehors
  useEffect(() => {
    if (!open) return;
    const handler = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Ferme sur Escape
  useEffect(() => {
    if (!open) return;
    const handler = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleClick = async (event) => {
    event.stopPropagation();
    if (open) { setOpen(false); return; }

    setOpen(true);

    if (!profile && !loading) {
      setLoading(true);
      try {
        const isSelf = currentUser?.id === person.id;
        const url    = isSelf ? "/api/me/profile" : `/api/users/${person.id}/profile`;
        const data   = await fetchJson(url);
        setProfile(data);
      } catch {
        // Garde les données de base si le fetch échoue
      } finally {
        setLoading(false);
      }
    }
  };

  const isSelf = currentUser?.id === person.id;
  const displayProfile = profile ?? person;
  const ringClass = availabilityToneMap[person.availability] || "avatar-strip__ring--gray";

  return (
    <div className="avatar-popover-wrapper" ref={containerRef}>
      {/* Trigger */}
      <div
        className="avatar-popover-trigger"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-haspopup="dialog"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(e); } }}
      >
        {children}
      </div>

      {/* Popover */}
      {open && (
        <div
          className="avatar-popover"
          role="dialog"
          aria-label={`Profil de ${person.name}`}
          aria-modal="false"
        >
          {/* Banner de couleur selon disponibilité */}
          <div className={`avatar-popover__banner avatar-popover__banner--${person.availability}`} />

          <div className="avatar-popover__body">
            {/* Avatar large */}
            <div className={`avatar-popover__ring ${ringClass}`}>
              <img
                className="avatar__photo avatar__photo--lg"
                src={displayProfile.imagePath || "/images/Nora.jpeg"}
                alt={displayProfile.name}
              />
            </div>

            {/* Infos */}
            <div className="avatar-popover__info">
              <strong className="avatar-popover__name">{displayProfile.name}</strong>

              {displayProfile.statusText && (
                <p className="avatar-popover__status">{displayProfile.statusText}</p>
              )}

              <div className="avatar-popover__meta-row">
                {/* Disponibilité */}
                <span className={`avatar-popover__avail-chip avatar-popover__avail-chip--${person.availability}`}>
                  {displayProfile.availabilityLabel || person.availabilityLabel}
                </span>

                {/* Cercle de relation (si viewer a une relation) */}
                {!isSelf && displayProfile.relationshipCircleLabel && (
                  <span className="avatar-popover__circle-chip">
                    {displayProfile.relationshipCircleLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Plans actifs (si chargés) */}
            {loading && (
              <p className="avatar-popover__loading">Chargement...</p>
            )}

            {!loading && profile?.activePlans?.length > 0 && (
              <div className="avatar-popover__plans">
                <p className="avatar-popover__plans-label">Plans actifs</p>
                {profile.activePlans.slice(0, 2).map((plan) => (
                  <button
                    key={plan.id}
                    className="avatar-popover__plan-row"
                    type="button"
                    onClick={() => { setOpen(false); navigate(`/plans/${plan.id}`); }}
                  >
                    <span className="avatar-popover__plan-title">{plan.title}</span>
                    <span className="avatar-popover__plan-time">{plan.timeLabel}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="avatar-popover__actions">
              {!isSelf && (
                <button
                  className="btn btn--primary avatar-popover__cta"
                  type="button"
                  onClick={() => { setOpen(false); onCreatePlan?.(person); }}
                >
                  <Plus size={14} />
                  <span>Créer un plan</span>
                </button>
              )}

              <button
                className="btn btn--ghost avatar-popover__profile-link"
                type="button"
                onClick={() => { setOpen(false); navigate(`/profile/${person.id}`); }}
              >
                <UserRound size={14} />
                <span>{isSelf ? "Mon profil" : "Voir le profil"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvatarPopover;