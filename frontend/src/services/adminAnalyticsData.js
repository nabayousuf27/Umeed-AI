/**
 * Mock analytics data service for Admin Dashboard
 * TODO: Replace with actual API calls to FastAPI backend
 */

export const getTotalClients = () => {
  return {
    total_clients: 142,
    active_clients: 98,
    new_this_month: 12,
  };
};

export const getLoanStats = () => {
  return {
    total_loans: 156,
    active_loans: 45,
    completed_loans: 98,
    defaulted_loans: 13,
    total_disbursed: 3120000, // PKR
    total_recovered: 2850000, // PKR
  };
};

export const getRiskDistribution = () => {
  return {
    low_risk: 65,
    medium_risk: 52,
    high_risk: 25,
    total: 142,
  };
};

export const getClientOverview = () => {
  const riskDist = getRiskDistribution();
  const loanStats = getLoanStats();
  
  return {
    total_clients: riskDist.total,
    low_risk_percentage: Math.round((riskDist.low_risk / riskDist.total) * 100),
    medium_risk_percentage: Math.round((riskDist.medium_risk / riskDist.total) * 100),
    high_risk_percentage: Math.round((riskDist.high_risk / riskDist.total) * 100),
    average_loan_size: Math.round(loanStats.total_disbursed / loanStats.total_loans),
  };
};

export const getAllAnalytics = () => {
  return {
    clients: getTotalClients(),
    loans: getLoanStats(),
    risk: getRiskDistribution(),
    overview: getClientOverview(),
  };
};


