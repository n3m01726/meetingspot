function DetailMeta({ icon, label, value, copy }) {
  return (
    <article className="meta-card">
      <span className="meta-card__label">
        {icon}
        <span>{label}</span>
      </span>
      <strong>{value}</strong>
      <p>{copy}</p>
    </article>
  );
}

export default DetailMeta;
