import type { Politician, Issuer, Trade, DemoItem } from './types';
import { subDays, format } from 'date-fns';
export const MOCK_ITEMS: DemoItem[] = [
  { id: '1', name: 'Demo Item A', value: 42 },
  { id: '2', name: 'Demo Item B', value: 73 }
];
export const MOCK_POLITICIANS: Politician[] = [
  { id: 'p1', name: 'Nancy Pelosi', party: 'Democrat', state: 'CA', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nancy' },
  { id: 'p2', name: 'Markwayne Mullin', party: 'Republican', state: 'OK', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark' },
  { id: 'p3', name: 'Ro Khanna', party: 'Democrat', state: 'CA', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ro' },
  { id: 'p4', name: 'Tommy Tuberville', party: 'Republican', state: 'AL', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tommy' },
  { id: 'p5', name: 'Josh Gottheimer', party: 'Democrat', state: 'NJ', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Josh' },
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
  const amounts = ['$1,001 - $15,000', '$15,001 - $50,000', '$50,001 - $100,000', '$100,001 - $250,000'];
  for (let i = 0; i < 50; i++) {
    const politician = MOCK_POLITICIANS[Math.floor(Math.random() * MOCK_POLITICIANS.length)];
    const issuer = MOCK_ISSUERS[Math.floor(Math.random() * MOCK_ISSUERS.length)];
    const date = subDays(new Date(), Math.floor(Math.random() * 30));
    trades.push({
      id: `t-${i}`,
      date: format(date, 'yyyy-MM-dd'),
      politicianId: politician.id,
      issuerId: issuer.symbol,
      type: Math.random() > 0.4 ? 'Buy' : 'Sell',
      amount: amounts[Math.floor(Math.random() * amounts.length)],
      price: Math.floor(Math.random() * 500) + 50,
    });
  }
  return trades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
export const MOCK_TRADES = generateTrades();