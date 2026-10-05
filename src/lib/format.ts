/** US dollars: whole amounts without cents ($100,000), others with two decimals ($9,492.47, $9,492.50). */
export const usd = (n: number) => {
  const cents = Math.round(n * 100) % 100 !== 0;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 })}`;
};
