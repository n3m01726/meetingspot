function StatePanel({ label }) {
  return (
    <div className="app-shell">
      <main className="app-shell__content">
        <section className="panel">
          <p className="u-eyebrow">{label}</p>
        </section>
      </main>
    </div>
  );
}

export default StatePanel;
