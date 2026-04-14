import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "../lib/api.js";

/**
 * useProfile(userId, currentUser)
 *
 * - Si userId === currentUser.id  → GET /api/me/profile  (profil complet)
 * - Sinon                         → GET /api/users/:id/profile (profil public)
 *
 * Expose aussi `updateSettings` pour le self-profile.
 */
function useProfile(userId, currentUser) {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState("");

  const isSelf = currentUser?.id === userId;

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError("");
      const url    = isSelf ? "/api/me/profile" : `/api/users/${userId}/profile`;
      const data   = await fetchJson(url);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, isSelf]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateSettings = async (fields) => {
    if (!isSelf) return;
    try {
      setSaving(true);
      setSaveError("");
      const updated = await fetchJson("/api/me/settings", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(fields),
      });
      // Fusionne les champs mis à jour sans recharger tout le profil
      setProfile((prev) => prev ? { ...prev, ...updated } : prev);
      return updated;
    } catch (err) {
      setSaveError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    error,
    saving,
    saveError,
    reloadProfile: loadProfile,
    updateSettings,
  };
}

export default useProfile;