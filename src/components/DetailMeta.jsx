function DetailMeta({ icon, label, value, copy }) {
  return (
    <article className="detail-meta-card">
      <span className="detail-meta-label">
        {icon}
        <span>{label}</span>
      </span>
      <strong>{value}</strong>
      <p>{copy}</p>
    </article>
  );
}

export default DetailMeta;
