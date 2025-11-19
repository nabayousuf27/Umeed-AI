import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import SectionCard from "../components/SectionCard";
import AlertCard from "../components/AlertCard";
import {
  fetchDashboardSummary,
  fetchRecentActivity,
} from "../services/dashboardService";

const fallbackSummary = {
  totalClients: 2847,
  totalLoansDisbursed: 45.2,
  activeLoans: 1234,
  completedLoans: 980,
};

const fallbackRiskProfile = {
  low: 60,
  medium: 25,
  high: 15,
};

const fallbackAlerts = [
  {
    title: "Fatima Bibi",
    description: "High Default Prediction – 78% risk score",
    variant: "danger",
  },
  {
    title: "Muhammad Aslam",
    description: "Payment overdue by 15 days – Rs 25,000",
    variant: "warning",
  },
  {
    title: "Ayesha Malik",
    description: "Risk score increased from Low to Medium",
    variant: "info",
  },
];

const navLinks = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "clients", label: "Clients", icon: "👥" },
  { key: "loans", label: "Loans", icon: "💳" },
  { key: "repayments", label: "Repayments", icon: "💸" },
  { key: "analytics", label: "Analytics", icon: "📊" },
];

const RiskDonut = ({ profile }) => {
  const total = useMemo(
    () => profile.reduce((sum, seg) => sum + seg.value, 0),
    [profile]
  );

  const segments = profile.reduce((acc, seg) => {
    const start = acc.length ? acc[acc.length - 1].end : 0;
    const percentage = total ? (seg.value / total) * 100 : 0;
    acc.push({
      ...seg,
      start,
      end: start + percentage,
    });
    return acc;
  }, []);

  const gradient = segments
    .map((seg) => `${seg.color} ${seg.start}% ${seg.end}%`)
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row">
      <div className="relative h-56 w-56">
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        />
        <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
          <p className="text-3xl font-semibold text-slate-900">100%</p>
          <p className="text-xs font-medium text-slate-500">Portfolio</p>
        </div>
      </div>
      <div className="space-y-4">
        {profile.map((seg) => (
          <div key={seg.label} className="flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {seg.label}
              </p>
              <p className="text-xs text-slate-500">
                {seg.value}% of portfolio
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [summary, setSummary] = useState(fallbackSummary);
  const [riskProfile, setRiskProfile] = useState(fallbackRiskProfile);
  const [alerts, setAlerts] = useState(fallbackAlerts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [summaryRes, activityRes] = await Promise.all([
          fetchDashboardSummary(),
          fetchRecentActivity(),
        ]);

        const data = summaryRes.data || {};
        setSummary({
          totalClients: data.total_clients ?? fallbackSummary.totalClients,
          totalLoansDisbursed:
            data.total_loans_disbursed ?? fallbackSummary.totalLoansDisbursed,
          activeLoans: data.active_loans ?? fallbackSummary.activeLoans,
          completedLoans: data.completed_loans ?? fallbackSummary.completedLoans,
        });

        setRiskProfile({
          low: data.risk_profile?.low ?? fallbackRiskProfile.low,
          medium: data.risk_profile?.medium ?? fallbackRiskProfile.medium,
          high: data.risk_profile?.high ?? fallbackRiskProfile.high,
        });

        setAlerts(
          activityRes.data?.alerts?.length
            ? activityRes.data.alerts
            : fallbackAlerts
        );
        setError(null);
      } catch (err) {
        setError("Live dashboard data unavailable. Showing sample view.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const riskSegments = useMemo(
    () => [
      { label: "Low Risk", value: riskProfile.low, color: "#22C55E" },
      { label: "Medium Risk", value: riskProfile.medium, color: "#F97316" },
      { label: "High Risk", value: riskProfile.high, color: "#EF4444" },
    ],
    [riskProfile]
  );

  const statCards = [
    {
      label: "Total Clients",
      value: summary.totalClients.toLocaleString(),
      change: "+12.5% from last month",
      icon: "👥",
      accent: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Loans",
      value: `${summary.totalLoansDisbursed.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}M`,
      change: "+8.3% from last month",
      icon: "💰",
      accent: "bg-emerald-100 text-emerald-600",
      currency: "Rs",
    },
    {
      label: "Active Loans",
      value: summary.activeLoans.toLocaleString(),
      change: "+5.7% from last month",
      icon: "📈",
      accent: "bg-violet-100 text-violet-600",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <Sidebar
        links={navLinks}
        activeKey="home"
        user={{ name: "Ahmad Khan", role: "Loan Officer", initials: "AK" }}
      />

      <div className="flex flex-1 flex-col px-6 py-10 lg:px-12">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Welcome back, Ahmad.
          </h1>
          <p className="text-sm text-slate-500">
            Here&apos;s your portfolio overview.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Portfolio Risk Distribution"
            subtitle="Updated 5 mins ago"
          >
            <RiskDonut profile={riskSegments} />
          </SectionCard>

          <SectionCard title="Critical Alerts" subtitle="Most recent flags">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertCard key={alert.title} {...alert} />
              ))}
            </div>
          </SectionCard>
        </div>

        {loading && (
          <div className="mt-6 text-center text-sm font-medium text-slate-500">
            Fetching the latest numbers...
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

