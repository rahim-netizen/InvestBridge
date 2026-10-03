export function formatInvestmentAmount(amount) {
  const value = Number(amount);
  const safeValue = Number.isFinite(value) ? value : 0;
  return `$${safeValue.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function getInvestorCount(opportunity) {
  const count =
    opportunity.investors_count ??
    opportunity.investor_count ??
    opportunity.connections_count ??
    opportunity.transactions_count;

  if (count !== undefined && count !== null && Number.isFinite(Number(count))) {
    return Math.max(0, Number(count));
  }

  if (Array.isArray(opportunity.investors)) {
    const investorIds = opportunity.investors
      .map((investor) => investor.user_id ?? investor.investor_id ?? investor.id)
      .filter((id) => id !== undefined && id !== null);
    return new Set(investorIds).size;
  }

  return null;
}
