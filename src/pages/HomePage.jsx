import { Menu, Plus, SlidersHorizontal, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { availabilityLabelMap, availabilityToneMap, quickFilters } from "../constants/ui.js";
import AuthSwitcher from "../components/AuthSwitcher.jsx";
import FiltersDrawer from "../components/FiltersDrawer.jsx";
import IntentSheet from "../components/IntentSheet.jsx";
import PlanCard from "../components/PlanCard.jsx";
import StatePanel from "../components/StatePanel.jsx";
import StatItem from "../components/StatItem.jsx";
import useAuth from "../hooks/useAuth.js";
import useIntentSheet from "../hooks/useIntentSheet.js";
import useOverview from "../hooks/useOverview.js";

function HomePage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const overviewState = useOverview(auth.currentUser);
  const intentSheet = useIntentSheet(() => overviewState.reloadOverview(overviewState.filters));

  if (!overviewState.overview && (overviewState.error || auth.error)) {
    return <StatePanel label={`Impossible de charger l'app: ${overviewState.error || auth.error}`} />;
  }

  if (!overviewState.overview || auth.currentUser === undefined) {
    return <StatePanel label="Chargement de meetingspot..." />;
  }

  const { overview, filters } = overviewState;

  return (
    <>
      <div className="page-shell">
        <header className="hero">
          <nav className="topbar">
            <div className="brand">
              <span className="brand-mark">MS</span>
              <div>
                <h1>meetingspot</h1>
                <p className="eyebrow-title">Spontaneite sociale</p>
              </div>
            </div>
            <div className="topbar-meta">
              <div className="inline-stats" aria-label="Statistiques globales">
                <StatItem value={overview.stats.availableNow} label="personnes dispo dans l'heure" />
                <StatItem value={overview.stats.activePlans} label="plans actifs autour de toi" />
                <StatItem value={overview.stats.averageRadius} label="rayon moyen des plans spontanes" />
              </div>
              <AuthSwitcher
                currentUser={auth.currentUser}
                users={auth.users}
                onLogin={async (userId) => {
                  await auth.login(userId);
                  await overviewState.reloadOverview(overviewState.filters);
                }}
                onLogout={async () => {
                  await auth.logout();
                  await overviewState.reloadOverview(overviewState.filters);
                }}
              />
            </div>
            <div className="mobile-actions">
              <details className="mobile-menu">
                <summary aria-label="Ouvrir le menu">
                  <Menu size={18} />
                </summary>
                <div className="mobile-menu-sheet">
                  <button type="button" onClick={() => overview.presence[0] && intentSheet.openIntentSheet(overview.presence[0])}>
                    <Plus size={16} />
                    <span>Creer un plan</span>
                  </button>
                  <a href="#presence"><Users size={16} /><span>Qui est la</span></a>
                  <a href="#plans"><Sparkles size={16} /><span>Plans spontanes</span></a>
                </div>
              </details>
            </div>
          </nav>
          <div className="mobile-stats" aria-label="Statistiques globales">
            <StatItem compact value={overview.stats.availableNow} label="dispo dans l'heure" />
            <StatItem compact value={overview.stats.activePlans} label="plans autour de toi" />
            <StatItem compact value={overview.stats.averageRadius} label="rayon moyen" />
          </div>
        </header>

        <main className="content-grid">
          <section className="panel presence-panel" id="presence">
            <div className="section-heading compact">
              <div>
                <h4 className="eyebrow">Qui est la</h4>
              </div>
            </div>

            <div className="avatar-strip">
              {overview.presence.map((person) => (
                <article
                  key={person.id}
                  className={`avatar-chip is-${person.availability} is-${person.seenState}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => intentSheet.openIntentSheet(person)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      intentSheet.openIntentSheet(person);
                    }
                  }}
                >
                  <div className={`avatar-ring ${availabilityToneMap[person.availability] || "ring-blue"}`}>
                    <img className="avatar-photo" src={person.imagePath} alt={person.name} />
                  </div>
                  <strong>{person.name}</strong>
                  <span>{person.availabilityLabel || availabilityLabelMap[person.availability]}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel plans-panel" id="plans">
            <div className="section-heading">
              <div>
                <h4 className="eyebrow">Plans spontanes</h4>
              </div>
              <div className="plans-heading-actions">
                <a className="filter-drawer-trigger" href="#plans-controls" aria-label="Ouvrir les filtres">
                  <SlidersHorizontal size={18} />
                </a>
              </div>
            </div>

            <div className="audience-filters" aria-label="Filtres rapides">
              {quickFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  className={`filter-chip ${filters.quick === filter.key ? "active" : ""}`}
                  onClick={() => overviewState.setFilters({ ...filters, quick: filter.key })}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {auth.currentUser ? null : <p className="eyebrow">Connecte-toi pour creer un plan ou repondre.</p>}
            {overviewState.error ? <p className="eyebrow">{overviewState.error}</p> : null}
            {overview.plans.length === 0 ? <p className="eyebrow">Aucun plan pour ce filtre.</p> : null}

            <div className="card-grid">
              {overview.plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onOpen={() => navigate(`/plans/${plan.id}`)}
                  onRsvp={async (planId, response) => {
                    try {
                      await overviewState.handleRsvp(planId, response);
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                />
              ))}
            </div>
          </section>
        </main>
      </div>

      <FiltersDrawer filters={filters} onFiltersChange={overviewState.setFilters} />

      <IntentSheet
        selectedAvatar={intentSheet.selectedAvatar}
        intentStep={intentSheet.intentStep}
        form={intentSheet.form}
        formError={intentSheet.formError}
        onClose={intentSheet.closeIntentSheet}
        onChooseIntent={intentSheet.chooseIntent}
        onFormChange={intentSheet.setForm}
        onBack={() => intentSheet.setIntentStep("intent")}
        onSubmit={intentSheet.submitPlan}
      />
    </>
  );
}

export default HomePage;
