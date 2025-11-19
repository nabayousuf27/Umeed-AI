const SectionCard = ({ title, subtitle, action, children, className = "" }) => (
  <section className={`rounded-3xl bg-white p-6 shadow-card ${className}`}>
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

export default SectionCard;

