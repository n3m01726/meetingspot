// ---------------------------------------------------------------------------
// GET /api/users/:id/profile
// Profil public d'un utilisateur, vu par le currentUser.
// ---------------------------------------------------------------------------
app.get("/api/users/:id/profile", (request, response) => {
    const targetId = Number.parseInt(request.params.id, 10);
    if (!Number.isInteger(targetId) || targetId <= 0) {
      response.status(400).json({ error: "Utilisateur invalide." });
      return;
    }
   
    const profile = getPublicProfile(targetId, request.currentUser);
    if (!profile) {
      response.status(404).json({ error: "Utilisateur introuvable." });
      return;
    }
   
    response.json(profile);
  });
   
  // ---------------------------------------------------------------------------
  // GET /api/me/profile
  // Profil complet du currentUser (hostedPlans + circles).
  // ---------------------------------------------------------------------------
  app.get("/api/me/profile", (request, response) => {
    if (!request.currentUser) {
      response.status(401).json({ error: "Connexion requise." });
      return;
    }
   
    const profile = getSelfProfile(request.currentUser.id);
    if (!profile) {
      response.status(404).json({ error: "Profil introuvable." });
      return;
    }
   
    response.json(profile);
  });
   
  // ---------------------------------------------------------------------------
  // PATCH /api/me/settings
  // Mise à jour partielle : statusText et/ou availability.
  // ---------------------------------------------------------------------------
  app.patch("/api/me/settings", (request, response) => {
    if (!request.currentUser) {
      response.status(401).json({ error: "Connexion requise." });
      return;
    }
   
    const updated = updateUserSettings(request.currentUser.id, request.body || {});
    if (!updated) {
      response.status(400).json({ error: "Aucun champ valide à mettre à jour." });
      return;
    }
   
    response.json(updated);
  });