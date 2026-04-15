import { Menu, Plus, SlidersHorizontal, Sparkles, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CIRCLES, availabilityLabelMap, availabilityToneMap, quickFilters } from "../constants/ui.js";
import AddContactModal from "../components/AddContactModal.jsx";
import AuthSwitcher from "../components/AuthSwitcher.jsx";
import FiltersDrawer from "../components/FiltersDrawer.jsx";
import IntentSheet from "../components/IntentSheet.jsx";
import PlanCard from "../components/PlanCard.jsx";
import StatePanel from "../components/StatePanel.jsx";
import StatItem from "../components/StatItem.jsx";
import useAuth from "../hooks/useAuth.js";
import useIntentSheet from "../hooks/useIntentSheet.js";
import useOverview from "../hooks/useOverview.js";
import AvatarPopover from "../components/AvatarPopover.jsx";

function HomePage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const overviewState = useOverview(auth.currentUser);
  const intentSheet = useIntentSheet(() => overviewState.reloadOverview(overviewState.filters), auth.currentUser);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    availability: "maybe",
    relationshipCircleId: CIRCLES.CONNEXIONS
  });
  const [contactError, setContactError] = useState("");
  const [customContacts, setCustomContacts] = useState([]);

  if (!overviewState.overview && (overviewState.error || auth.error)) {
    return <StatePanel label={`Impossible de charger l'app : ${overviewState.error || auth.error}`} />;
  }

  if (!overviewState.overview || auth.currentUser === undefined) {
    return <StatePanel label="Chargement de meetingspot..." />;
  }

  const { overview, filters } = overviewState;
  const presenceRows = [...customContacts, ...overview.presence];

  const openAddContactModal = () => {
    setIsAddContactOpen(true);
    setContactError("");
  };

  const closeAddContactModal = () => {
    setIsAddContactOpen(false);
    setContactError("");
    setContactForm({
      name: "",
      availability: "maybe",
      relationshipCircleId: CIRCLES.CONNEXIONS
    });
  };

  const addContact = (event) => {
    event.preventDefault();
    const name = String(contactForm.name || "").trim();
    if (!name) {
      setContactError("Le nom est requis.");
      return;
    }

    const circleLabel = contactForm.relationshipCircleId === CIRCLES.INNER ? "Inner Circle" : "Connexions";
    setCustomContacts((current) => ([
      {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        availability: contactForm.availability,
        availabilityLabel: availabilityLabelMap[contactForm.availability],
        relationshipCircleId: contactForm.relationshipCircleId,
        relationshipCircleLabel: circleLabel,
        imagePath: "/images/Nora.jpeg",
        statusText: "Nouveau contact"
      },
      ...current
    ]));

    closeAddContactModal();
  };

  return (
    <>
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
      <div className="app-shell">
        <header className="home-hero">
          <nav className="topbar">
            <div className="brand">
              <span className="brand__mark">MS</span>
              <div>
                <h1>meetingspot</h1>
                <p>spontaneously social</p>
              </div>
            </div>
            <div className="topbar__meta">
              <div className="stats-list" aria-label="Statistiques globales">
                <StatItem value={overview.stats.availableNow} label="available (1 hour)" />
                <StatItem value={overview.stats.activePlans} label="active plans around you" />
                <StatItem value={overview.stats.averageRadius} label="distance from you" />
              </div>
            </div>
            <div className="topbar__mobile-actions">
              <details className="mobile-menu">
                <summary aria-label="Ouvrir le menu">
                  <Menu size={18} />
                </summary>
                <div className="mobile-menu__sheet">
                  <button type="button" onClick={() => intentSheet.openIntentSheet()}>
                    <Plus size={16} />
                    <span>Make a plan</span>
                  </button>
                  <a href="#presence"><Users size={16} /><span>Who's there?</span></a>
                  <a href="#plans"><Sparkles size={16} /><span>Spontaneous plans</span></a>
                </div>
              </details>
            </div>
          </nav>
          <div className="stats-list stats-list--mobile" aria-label="Statistiques globales">
            <StatItem compact value={overview.stats.availableNow} label="available now" />
            <StatItem compact value={overview.stats.activePlans} label="active plans around you" />
            <StatItem compact value={overview.stats.averageRadius} label="average distance from you" />
          </div>
        </header>

        <main className="app-shell__content">
          <section className="panel panel--presence" id="presence">
            <div className="section-header section-header--compact">
              <div>
                <h3>who's there?</h3>
              </div>
            </div>

            <div className="avatar-strip">
            {presenceRows.map((person) => (
  <AvatarPopover
    key={person.id}
    person={person}
    currentUser={auth.currentUser}
    onCreatePlan={(p) => intentSheet.openIntentSheet(p)}
  >
    <article
      className={`avatar-strip__chip avatar-strip__chip--${person.availability} avatar-strip__chip--${person.seenState || "fresh"}`}
      role="button"
      tabIndex={-1} // le focus est géré par AvatarPopover
    >
      <div className={`avatar-strip__ring ${availabilityToneMap[person.availability] || "avatar-strip__ring--blue"}`}>
        <img className="avatar__photo" src={person.imagePath || "/images/Nora.jpeg"} alt={person.name} />
      </div>
      <strong>{person.name}</strong>
      <span>{person.availabilityLabel || availabilityLabelMap[person.availability]}</span>
    </article>
  </AvatarPopover>
))}

              <article
                className="avatar-strip__chip avatar-strip__chip--add-contact"
                role="button"
                tabIndex={0}
                onClick={openAddContactModal}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openAddContactModal();
                  }
                }}
              >
                <div className="avatar-strip__ring avatar-strip__ring--blue avatar-strip__ring--add-contact">
                  <span className="avatar-strip__add-icon" aria-hidden="true"><UserPlus size={30} color="#fff" /></span>
                </div>
                <small>add contact</small>
              </article>
            </div>
          </section>

          <section className="panel panel--plans" id="plans">
            <div className="section-header">
              <div>
                <h3>spontaneous plans</h3>
              </div>
              <div className="plans-panel__actions">
                <a className="drawer-trigger" href="#plans-controls" aria-label="Ouvrir les filtres">
                  <SlidersHorizontal size={18} />
                </a>
              </div>
            </div>

            <div className="chip-group" aria-label="Filtres rapides">
              {quickFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  className={`chip chip--filter ${filters.quick === filter.key ? "chip--active" : ""}`}
                  onClick={() => overviewState.setFilters({ ...filters, quick: filter.key })}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {overviewState.error ? <p className="u-eyebrow">{overviewState.error}</p> : null}
            {overview.plans.length === 0 ? <p className="u-eyebrow">No plans with that filter.</p> : null}

            <div className="plans-panel__grid">
              {overview.plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onOpen={() => navigate(`/plans/${plan.id}`)}
                />
              ))}
            </div>
          </section>
        </main>
      </div>

      <FiltersDrawer filters={filters} onFiltersChange={overviewState.setFilters} />

      <button
        className="btn btn--primary home__floating-cta"
        type="button"
        onClick={() => intentSheet.openIntentSheet()}
        aria-label="Creer un plan"
      >
        <Plus size={16} />
      </button>

      <IntentSheet
        isOpen={intentSheet.isOpen}
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

      <AddContactModal
        isOpen={isAddContactOpen}
        form={contactForm}
        error={contactError}
        onClose={closeAddContactModal}
        onFormChange={setContactForm}
        onSubmit={addContact}
      />
    </>
  );
}

export default HomePage;
