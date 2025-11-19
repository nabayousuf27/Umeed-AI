const variants = {
  warning: "bg-amber-50 border-amber-100 text-amber-900",
  danger: "bg-rose-50 border-rose-100 text-rose-900",
  info: "bg-blue-50 border-blue-100 text-blue-900",
};

const AlertCard = ({ title, description, variant = "warning" }) => {
  const variantClass = variants[variant] || variants.warning;

  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-sm ${variantClass}`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm">{description}</p>
    </div>
  );
};

export default AlertCard;



