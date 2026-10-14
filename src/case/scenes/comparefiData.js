// Sample values for the case study. They are NOT any lender's real prices.
// The criteria (year-1 cost, year-2 cost, LTV, regularisation period, MTF cost and margin) and the
// "example calculation" basis (₹1,00,000 position held 12 months, 50% funding) are the ones CompareFi's
// comparison table uses. The lender names and every number below are made up for this page.

export const basis = {
  las: '₹1,00,000 position held for 12 months, ₹2,00,000 of collateral, 50% funding',
  lamf: '₹1,00,000 position held for 12 months, ₹2,00,000 of collateral, 50% funding',
  mtf: '₹5,00,000 position held for 12 months, ₹4,00,000 in approved shares as collateral',
};

const rupees = value => '₹' + Math.round(value).toLocaleString('en-IN');
const percent = value => `${value}%`;
const days = value => `${value} days`;

const loan = (rate, fee, amc, ltv, reg) => ({ rate, fee, amc, ltv, reg, y1: rate * 1000 + fee + amc, y2: rate * 1000 + amc });

export const products = {
  las: {
    name: 'Loan against shares',
    short: 'LAS',
    lenders: [
      { id: 'A', name: 'Sample lender A', ...loan(10.0, 1000, 0, 60, 5) },
      { id: 'B', name: 'Sample lender B', ...loan(9.2, 2500, 500, 70, 7) },
      { id: 'C', name: 'Sample lender C', ...loan(11.5, 0, 0, 50, 3) },
      { id: 'D', name: 'Sample lender D', ...loan(8.8, 3500, 750, 65, 10) },
    ],
  },
  lamf: {
    name: 'Loan against mutual funds',
    short: 'LAMF',
    lenders: [
      { id: 'A', name: 'Sample lender A', ...loan(10.5, 750, 0, 45, 7) },
      { id: 'B', name: 'Sample lender B', ...loan(9.9, 1500, 400, 50, 5) },
      { id: 'C', name: 'Sample lender C', ...loan(12.0, 0, 0, 40, 10) },
      { id: 'D', name: 'Sample lender D', ...loan(9.4, 2000, 500, 55, 3) },
    ],
  },
  mtf: {
    name: 'Margin trading facility',
    short: 'MTF',
    lenders: [
      { id: 'A', name: 'Sample broker A', cost: 47500, margin: 25 },
      { id: 'B', name: 'Sample broker B', cost: 41000, margin: 30 },
      { id: 'C', name: 'Sample broker C', cost: 44200, margin: 20 },
    ],
  },
};

const loanCriteria = [
  { id: 'y1', label: 'Year-1 cost', dir: 'low', get: l => l.y1, fmt: rupees, rule: 'Lowest first' },
  { id: 'y2', label: 'Year-2 cost', dir: 'low', get: l => l.y2, fmt: rupees, rule: 'Lowest first' },
  { id: 'y12', label: 'Two years together', dir: 'low', get: l => l.y1 + l.y2, fmt: rupees, rule: 'Lowest first' },
  { id: 'ltv', label: 'LTV', dir: 'high', get: l => l.ltv, fmt: percent, rule: 'Highest first' },
  { id: 'reg', label: 'Regularisation period', dir: 'high', get: l => l.reg, fmt: days, rule: 'Longest first' },
];

export const criteria = {
  las: loanCriteria,
  lamf: loanCriteria,
  mtf: [
    { id: 'cost', label: 'Cost over 12 months', dir: 'low', get: l => l.cost, fmt: rupees, rule: 'Lowest first' },
    { id: 'margin', label: 'Margin requirement', dir: 'low', get: l => l.margin, fmt: percent, rule: 'Lowest first' },
  ],
};

// Best first, ties keep the original order (Array.sort is stable). Missing values would go to the end.
export function rank(productId, criterionId) {
  const list = criteria[productId];
  const criterion = list.find(item => item.id === criterionId) || list[0];
  const rows = products[productId].lenders.map(lender => ({ lender, value: criterion.get(lender) }));
  rows.sort((a, b) => {
    const worst = criterion.dir === 'low' ? Infinity : -Infinity;
    const x = Number.isFinite(a.value) ? a.value : worst, y = Number.isFinite(b.value) ? b.value : worst;
    if (x === y) return 0;
    return criterion.dir === 'low' ? x - y : y - x;
  });
  return { criterion, rows };
}

// The payload the scene reads: rows best first, plus the value the plane sits at (the best value).
export function scenePayload(productId, criterionId) {
  const { criterion, rows } = rank(productId, criterionId);
  return {
    label: criterion.label, rule: criterion.rule, dir: criterion.dir, plane: rows[0].value,
    items: rows.map(row => ({ key: row.lender.id, label: row.lender.id, value: row.value, text: criterion.fmt(row.value) })),
  };
}
