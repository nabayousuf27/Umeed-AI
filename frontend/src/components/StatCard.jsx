const StatCard = ({
  label,
  value,
  change,
  icon,
  accent = "bg-blue-100 text-blue-600",
  currency,
}) => (
  <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-card">
    <div className={`rounded-2xl p-3 text-xl ${accent}`}>{icon}</div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-3xl font-semibold text-slate-900">
        {currency ? `${currency} ${value}` : value}
      </p>
      {change && <p className="text-xs font-semibold text-emerald-600">{change}</p>}
    </div>
  </div>
);

export default StatCard;

