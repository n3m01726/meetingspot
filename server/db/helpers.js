const { db } = require("./connection");
const { VISIBILITY_MODES, VISIBILITY_MODE_LABELS } = require("./constants");

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

function getAccessLevel(circle) {
  if (circle === "Inner Circle" || circle === "Favori") return 2;
  if (circle === "Connexions" || circle === "Inner Circle + Connexions") return 1;
  return 0;
}

function normalizeCircle(circle) {
  return getAccessLevel(circle) >= 2 ? "Inner Circle" : "Connexions";
}

function normalizeCircleTone(circle) {
  return normalizeCircle(circle) === "Inner Circle" ? "inner" : "connections";
}

function normalizeResponseLabel(value) {
  if (value === "down") return "Down";
  if (value === "probable") return "Fort probable";
  return "Peut-être";
}

// ---------------------------------------------------------------------------
// Visibility mode helpers
// ---------------------------------------------------------------------------

function getPlanVisibilityMode(plan) {
  return plan.visibilityMode || VISIBILITY_MODES.CIRCLE_OPEN;
}

function getVisibilityModeLabel(mode) {
  return VISIBILITY_MODE_LABELS[mode] || VISIBILITY_MODE_LABELS[VISIBILITY_MODES.CIRCLE_OPEN];
}

function getVisibilityModeIcon(mode) {
  if (mode === VISIBILITY_MODES.RSVP_FIRST) return "🔐";
  if (mode === VISIBILITY_MODES.PUBLIC_VIBE) return "🌍";
  return "👥";
}

function getVisibilityModeDescription(mode) {
  if (mode === VISIBILITY_MODES.RSVP_FIRST) {
    return "Les détails exacts se débloquent après approbation de l'hôte.";
  }
  if (mode === VISIBILITY_MODES.PUBLIC_VIBE) {
    return "Ouvert au-delà du cercle. Les détails sont visibles immédiatement.";
  }
  return "Le cercle autorisé voit tous les détails immédiatement.";
}

// ---------------------------------------------------------------------------
// Relationship helpers
// ---------------------------------------------------------------------------

function ownerHasRelationships(ownerUserId) {
  return Boolean(
    db.prepare(`
      SELECT 1
      FROM user_relationships
      WHERE owner_user_id = ?
      LIMIT 1
    `).get(ownerUserId)
  );
}

function getRelationshipCircle(ownerUserId, memberUserId) {
  if (!ownerUserId || !memberUserId || ownerUserId === memberUserId) {
    return "Inner Circle";
  }

  const relationship = db.prepare(`
    SELECT circle
    FROM user_relationships
    WHERE owner_user_id = ? AND member_user_id = ?
  `).get(ownerUserId, memberUserId);

  if (relationship?.circle) {
    return normalizeCircle(relationship.circle);
  }

  if (ownerHasRelationships(ownerUserId)) {
    return "";
  }

  // Lazy import to avoid circular dependency with users.js
  const { getUserById } = require("./users");
  const member = getUserById(memberUserId);
  return member ? normalizeCircle(member.circle) : "";
}

// ---------------------------------------------------------------------------
// Access control
// ---------------------------------------------------------------------------

function canViewerAccessHostCircle(plan, currentUser) {
  if (!currentUser) return false;

  if (!plan.hostUserId) {
    return getAccessLevel(currentUser.circle) >= getAccessLevel(plan.circle);
  }

  const relationshipCircle = getRelationshipCircle(plan.hostUserId, currentUser.id);
  if (!relationshipCircle) return false;

  return getAccessLevel(relationshipCircle) >= getAccessLevel(normalizeCircle(plan.circle));
}

function getParticipantApprovalStatus(planId, userId) {
  if (!userId) return "none";

  const row = db.prepare(`
    SELECT approval_status AS approvalStatus
    FROM plan_participants
    WHERE plan_id = ? AND user_id = ?
  `).get(planId, userId);

  return row?.approvalStatus || "none";
}

function canUserSeePlanSummary(plan, currentUser = null) {
  const mode = getPlanVisibilityMode(plan);

  if (mode === VISIBILITY_MODES.PUBLIC_VIBE) return true;
  if (!currentUser) return false;
  if (currentUser.isAdmin) return true;
  if (plan.hostUserId && plan.hostUserId === currentUser.id) return true;

  return canViewerAccessHostCircle(plan, currentUser);
}

function canUserSeeFullPlanDetail(plan, currentUser = null) {
  const mode = getPlanVisibilityMode(plan);

  if (mode === VISIBILITY_MODES.PUBLIC_VIBE) return true;
  if (!currentUser) return false;
  if (currentUser.isAdmin) return true;
  if (plan.hostUserId && plan.hostUserId === currentUser.id) return true;

  if (mode === VISIBILITY_MODES.CIRCLE_OPEN) {
    return canViewerAccessHostCircle(plan, currentUser);
  }

  return getParticipantApprovalStatus(plan.id, currentUser.id) === "approved";
}

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------

function matchesAudienceFilter(plan, visibility) {
  if (!visibility || visibility === "all") return true;

  if (visibility === "Inner Circle") {
    return normalizeCircle(plan.circle) === "Inner Circle";
  }
  if (visibility === "Connexions") {
    return normalizeCircle(plan.circle) === "Connexions";
  }
  // "Inner Circle + Connexions" and unknown values → show all
  return true;
}

function matchesPlanFilters(plan, filters = {}) {
  const { filter, visibility } = filters;

  if (!matchesAudienceFilter(plan, String(visibility || "all"))) return false;

  const timeLabel = String(plan.timeLabel || "").toLowerCase();

  if (!filter || filter === "all") return true;
  if (filter === "online") return Boolean(plan.isOnline);

  if (filter === "now") {
    return (
      timeLabel.includes("vers") ||
      timeLabel.includes("prochaine heure") ||
      timeLabel.includes("30 min") ||
      timeLabel.includes("maintenant")
    );
  }

  if (filter === "tonight") {
    return (
      timeLabel.includes("soir") ||
      timeLabel.includes("21h") ||
      timeLabel.includes("20h")
    );
  }

  return true;
}

module.exports = {
  getAccessLevel,
  normalizeCircle,
  normalizeCircleTone,
  normalizeResponseLabel,
  getPlanVisibilityMode,
  getVisibilityModeLabel,
  getVisibilityModeIcon,
  getVisibilityModeDescription,
  getRelationshipCircle,
  getParticipantApprovalStatus,
  canUserSeePlanSummary,
  canUserSeeFullPlanDetail,
  matchesPlanFilters
};