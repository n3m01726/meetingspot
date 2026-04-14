function StatItem({ value, label, compact = false }) {
  return (
    <div className={`stats-list__item${compact ? " stats-list__item--mobile" : ""}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default StatItem;
