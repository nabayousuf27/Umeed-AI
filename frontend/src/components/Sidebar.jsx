const Sidebar = ({ links = [], activeKey, user }) => (
  <aside className="hidden min-h-screen w-64 flex-shrink-0 flex-col rounded-r-[40px] bg-[#0E1E5B] px-6 py-10 text-white shadow-xl lg:flex">
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
        MLMS
      </p>
      <p className="text-lg font-semibold text-white/90">Loan Management</p>
    </div>

    <nav className="mt-10 flex flex-col gap-2">
      {links.map((link) => {
        const isActive = link.key === activeKey;
        return (
          <button
            key={link.key}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
              isActive
                ? "bg-white/10 text-white"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </button>
        );
      })}
    </nav>

    <div className="mt-auto rounded-3xl bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/30 text-lg font-semibold uppercase text-white">
          {user?.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{user?.name}</p>
          <p className="text-xs text-blue-100">{user?.role}</p>
        </div>
      </div>
      <p className="text-xs text-blue-100">
        Stay updated with your latest loan portfolio metrics.
      </p>
    </div>
  </aside>
);

export default Sidebar;



