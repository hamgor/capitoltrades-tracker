import type { Politician, Issuer, Trade, DemoItem } from './types';
import { subDays, format } from 'date-fns';
export const MOCK_ITEMS: DemoItem[] = [
  { id: '1', name: 'Demo Item A', value: 42 },
  { id: '2', name: 'Demo Item B', value: 73 }
];
export const MOCK_POLITICIANS: Politician[] = [
  { id: 'p1', firstName: 'Nancy', lastName: 'Pelosi', name: 'Nancy Pelosi', party: 'Democrat', state: 'CA', chamber: 'House', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nancy' },
  { id: 'p2', firstName: 'Markwayne', lastName: 'Mullin', name: 'Markwayne Mullin', party: 'Republican', state: 'OK', chamber: 'Senate', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark' },
  { id: 'p3', firstName: 'Ro', lastName: 'Khanna', name: 'Ro Khanna', party: 'Democrat', state: 'CA', chamber: 'House', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ro' },
  { id: 'p4', firstName: 'Tommy', lastName: 'Tuberville', name: 'Tommy Tuberville', party: 'Republican', state: 'AL', chamber: 'Senate', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tommy' },
  { id: 'p5', firstName: 'Josh', lastName: 'Gottheimer', name: 'Josh Gottheimer', party: 'Democrat', state: 'NJ', chamber: 'House', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Josh' },
];
export const MOCK_ISSUERS: Issuer[] = [
  { symbol: 'NVDA', name: 'Nvidia Corp', sector: 'Technology' },
  { symbol: 'AAPL', name: 'Apple Inc', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp', sector: 'Technology' },
  { symbol: 'XOM', name: 'Exxon Mobil Corp', sector: 'Energy' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co', sector: 'Financial Services' },
  { symbol: 'LLY', name: 'Eli Lilly and Co', sector: 'Healthcare' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Consumer Cyclical' },
];
const generateTrades = (): Trade[] => {
  const trades: Trade[] = [];
  const amounts = [
    { label: '$1,001 - $15,000', low: 1001, high: 15000 },
    { label: '$15,001 - $50,000', low: 15001, high: 50000 },
    { label: '$50,001 - $100,000', low: 50001, high: 100000 },
    { label: '$100,001 - $250,000', low: 100001, high: 250000 }
  ];
  for (let i = 0; i < 50; i++) {
    const politician = MOCK_POLITICIANS[Math.floor(Math.random() * MOCK_POLITICIANS.length)];
    const issuer = MOCK_ISSUERS[Math.floor(Math.random() * MOCK_ISSUERS.length)];
    const txDate = subDays(new Date(), Math.floor(Math.random() * 30));
    const pubDate = subDays(txDate, -Math.floor(Math.random() * 5));
    const amountObj = amounts[Math.floor(Math.random() * amounts.length)];
    trades.push({
      id: `t-${i}`,
      txDate: format(txDate, 'yyyy-MM-dd'),
      pubDate: format(pubDate, 'yyyy-MM-dd'),
      politicianId: politician.id,
      issuerId: issuer.symbol,
      type: Math.random() > 0.4 ? 'Buy' : 'Sell',
      amount: amountObj.label,
      sizeLow: amountObj.low,
      sizeHigh: amountObj.high,
      chamber: politician.chamber as any
    });
  }
  return trades.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
};
export const MOCK_TRADES = generateTrades();