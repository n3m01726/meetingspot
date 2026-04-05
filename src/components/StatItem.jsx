function StatItem({ value, label, compact = false }) {
  return (
    <div className={compact ? "mobile-stat" : "inline-stat"}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default StatItem;
