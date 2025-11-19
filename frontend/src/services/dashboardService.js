import API from "./api";

export const fetchDashboardSummary = () => API.get("/dashboard/summary");

export const fetchRecentActivity = () =>
  API.get("/dashboard/recent-activity");

