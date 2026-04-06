import { useState } from "react";
import { fetchJson } from "../lib/api.js";

const initialForm = {
  title: "",
  visibility: "",
  timeRange: "now",
  area: "",
  venue: ""
};

function useIntentSheet(onPlanCreated) {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [intentStep, setIntentStep] = useState("intent");
  const [intent, setIntent] = useState("");
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  const closeIntentSheet = () => {
    setSelectedAvatar(null);
    setIntentStep("intent");
    setIntent("");
    setForm(initialForm);
    setFormError("");
  };

  const openIntentSheet = (person) => {
    setSelectedAvatar(person);
    setIntentStep("intent");
    setIntent("");
    setForm(initialForm);
    setFormError("");
  };

  const chooseIntent = (nextIntent) => {
    if (!selectedAvatar) {
      return;
    }

    setIntent(nextIntent);
    setIntentStep("form");
    setForm((current) => ({
      ...current,
      title: `${nextIntent} with ${selectedAvatar.name}`
    }));
  };

  const submitPlan = async (event) => {
    event.preventDefault();

    if (!selectedAvatar || !form.visibility || !form.area.trim() || !form.venue.trim()) {
      setFormError("Complète les champs requis avant de créer le plan.");
      return;
    }

    const timeLabelMap = {
      now: "Dans la prochaine heure",
      "in-30": "Dans 30 min",
      tonight: "Ce soir",
      custom: "Plus tard"
    };

    try {
      await fetchJson("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendName: selectedAvatar.name,
          activity: intent || "Custom",
          title: form.title,
          visibility: form.visibility,
          area: form.area,
          venue: form.venue,
          timeLabel: timeLabelMap[form.timeRange] || "Plus tard"
        })
      });

      closeIntentSheet();
      if (onPlanCreated) {
        await onPlanCreated();
      }
    } catch (error) {
      setFormError(error.message);
    }
  };

  return {
    selectedAvatar,
    intentStep,
    form,
    formError,
    openIntentSheet,
    closeIntentSheet,
    chooseIntent,
    setForm,
    setIntentStep,
    submitPlan
  };
}

export default useIntentSheet;
