import { useState } from "react";
import { VISIBILITY_MODES } from "../constants/ui.js";
import { fetchJson } from "../lib/api.js";

const initialForm = {
  title: "",
  visibilityMode: VISIBILITY_MODES.RSVP_FIRST,
  timeRange: "now",
  area: "",
  venue: ""
};

function useIntentSheet(onPlanCreated, currentUser) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [intentStep, setIntentStep] = useState("intent");
  const [intent, setIntent] = useState("");
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  const resetSheet = () => {
    setIntentStep("intent");
    setIntent("");
    setForm(initialForm);
    setFormError("");
  };

  const closeIntentSheet = () => {
    setIsOpen(false);
    setSelectedAvatar(null);
    resetSheet();
  };

  const openIntentSheet = (person = null) => {
    setIsOpen(true);
    setSelectedAvatar(person);
    resetSheet();
  };

  const chooseIntent = (nextIntent) => {
    setIntent(nextIntent);
    setIntentStep("form");
    setForm((current) => ({
      ...current,
      title: selectedAvatar ? `${nextIntent} avec ${selectedAvatar.name}` : nextIntent
    }));
  };

  const submitPlan = async (event) => {
    event.preventDefault();

    if (!form.visibilityMode || !form.area.trim() || !form.venue.trim()) {
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
          friendName: selectedAvatar?.name || "",
          activity: intent || "Custom",
          title: form.title,
          visibilityMode: form.visibilityMode,
          circle: selectedAvatar?.relationshipCircle || selectedAvatar?.circle || currentUser?.circle || "Connexions",
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
    isOpen,
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
