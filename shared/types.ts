export type TransactionType = 'Buy' | 'Sell';
export type Chamber = 'House' | 'Senate';
export interface Politician {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Full name for display
  party: 'Democrat' | 'Republican' | 'Independent' | string;
  state: string;
  chamber: Chamber;
  avatarUrl: string;
}
export interface Issuer {
  symbol: string;
  name: string;
  sector: string;
}
export interface Trade {
  id: string;
  txDate: string; // Date of transaction
  pubDate: string; // Date of publication/filing
  politicianId: string;
  issuerId: string;
  type: TransactionType;
  amount: string; // Formatted range like "$1,001 - $15,000"
  sizeLow: number;
  sizeHigh: number;
  chamber: Chamber;
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