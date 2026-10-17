// Illustrative monthly agendas, not observations or industry benchmarks.
export const availableMonthlyHours = 20 * 8;
export const monthlyBillingExample = 4000;

export const billableHoursExamples = [
  { name: 'Más captación', administration: 24, sales: 30, learning: 8, reserve: 8 },
  { name: 'Carga intermedia', administration: 20, sales: 18, learning: 6, reserve: 6 },
  { name: 'Más producción', administration: 12, sales: 10, learning: 4, reserve: 4 },
].map((agenda) => {
  const billableHours = availableMonthlyHours - agenda.administration - agenda.sales
    - agenda.learning - agenda.reserve;

  return { ...agenda, billableHours, hourlyRate: monthlyBillingExample / billableHours };
});
