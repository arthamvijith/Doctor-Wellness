function SectionHeader({ label, title }) {
  return (
    <div className="section-header">
      <span className="label">{label}</span>
      <h2>{title}</h2>
    </div>
  );
}

export default SectionHeader;
