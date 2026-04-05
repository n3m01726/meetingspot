function StatePanel({ label }) {
  return (
    <div className="page-shell">
      <main className="content-grid">
        <section className="panel">
          <p className="eyebrow">{label}</p>
        </section>
      </main>
    </div>
  );
}

export default StatePanel;
