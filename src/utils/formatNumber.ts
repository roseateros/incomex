export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals).replace('.', ',');
};

export const formatCurrency = (value: number): string => `${formatNumber(value)} €`;
