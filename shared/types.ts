export type TransactionType = 'Buy' | 'Sell';
export interface Politician {
  id: string;
  name: string;
  party: 'Democrat' | 'Republican' | 'Independent';
  state: string;
  avatarUrl: string;
}
export interface Issuer {
  symbol: string;
  name: string;
  sector: string;
}
export interface Trade {
  id: string;
  date: string;
  politicianId: string;
  issuerId: string;
  type: TransactionType;
  amount: string;
  price: number;
}
export interface DashboardStats {
  totalVolume: string;
  activeTraders: number;
  topSector: string;
  volumeTrend: { date: string; volume: number }[];
  recentTrades: (Trade & { politician: Politician; issuer: Issuer })[];
}
export interface DemoItem {
  id: string;
  name: string;
  value: number;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}