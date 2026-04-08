import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "../lib/api.js";

function buildOverviewQuery(filters) {
  const params = new URLSearchParams();

  if (filters.quick && filters.quick !== "all") {
    params.set("filter", filters.quick);
  }

  if (filters.visibility && filters.visibility !== "all") {
    params.set("visibility", filters.visibility);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function useOverview(currentUser) {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    quick: "all",
    visibility: "all"
  });

  const loadOverview = useCallback(async (nextFilters = filters) => {
    try {
      setError("");
      const nextOverview = await fetchJson(`/api/overview${buildOverviewQuery(nextFilters)}`);
      setOverview(nextOverview);
    } catch (nextError) {
      setError(nextError.message);
    }
  }, [filters]);

  useEffect(() => {
    loadOverview(filters);
  }, [filters, currentUser?.id]);

  const handleRsvp = async (planId, response) => {
    if (!currentUser?.id) {
      const message = "Connecte-toi pour répondre à un plan.";
      setError(message);
      throw new Error(message);
    }

    try {
      await fetchJson(`/api/plans/${planId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response })
      });

      await loadOverview(filters);
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    }
  };

  return {
    overview,
    error,
    filters,
    setFilters,
    reloadOverview: loadOverview,
    handleRsvp
  };
}

export default useOverview;
