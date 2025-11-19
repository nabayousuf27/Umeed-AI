const statusVariants = {
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Pending Review": "bg-amber-50 text-amber-700 ring-amber-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  default: "bg-gray-50 text-gray-700 ring-gray-200",
};

const StatusBadge = ({ status }) => {
  const variant = statusVariants[status] || statusVariants.default;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${variant}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;



