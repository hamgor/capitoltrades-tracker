import { DurableObject } from "cloudflare:workers";
import type { Trade, DashboardStats, Politician, Issuer } from '@shared/types';
import { MOCK_TRADES, MOCK_POLITICIANS, MOCK_ISSUERS } from '@shared/mock-data';
const API_BASE = "https://api.capitoltrades.com";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
export class GlobalDurableObject extends DurableObject {
  async fetchExternalTrades(): Promise<{ trades: Trade[]; politicians: Politician[]; issuers: Issuer[] }> {
    try {
      // In development/test environments, DNS issues might occur.
      // We provide a fallback to mock data if the external API is unreachable.
      const response = await fetch(`${API_BASE}/trades?pageSize=100`).catch(() => null);
      if (!response || !response.ok) {
        console.warn("External API unreachable, falling back to mock seed data");
        return {
          trades: MOCK_TRADES,
          politicians: MOCK_POLITICIANS,
          issuers: MOCK_ISSUERS
        };
      }
      const rawData = await response.json() as any;
      const data = rawData.data || [];
      const trades: Trade[] = [];
      const politiciansMap = new Map<string, Politician>();
      const issuersMap = new Map<string, Issuer>();
      data.forEach((item: any) => {
        if (!item.politician || !item.issuer) return;
        const politicianId = item.politician.id || `p-${item.politician.lastName || 'unknown'}-${Math.random().toString(36).slice(2, 5)}`;
        const symbol = item.issuer.symbol || "UNKNOWN";
        if (!politiciansMap.has(politicianId)) {
          politiciansMap.set(politicianId, {
            id: politicianId,
            firstName: item.politician.firstName || "",
            lastName: item.politician.lastName || "Unknown",
            name: `${item.politician.firstName || ''} ${item.politician.lastName || 'Unknown'}`.trim(),
            party: item.politician.party || "Independent",
            state: item.politician.state || "US",
            chamber: item.chamber === 'senate' ? 'Senate' : 'House',
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.politician.lastName || 'default'}`
          });
        }
        if (!issuersMap.has(symbol)) {
          issuersMap.set(symbol, {
            symbol,
            name: item.issuer.name || "Unknown Issuer",
            sector: item.issuer.sector || "Miscellaneous"
          });
        }
        trades.push({
          id: item.id || Math.random().toString(36),
          txDate: item.txDate || new Date().toISOString().split('T')[0],
          pubDate: item.pubDate || new Date().toISOString().split('T')[0],
          politicianId,
          issuerId: symbol,
          type: item.type === 'buy' ? 'Buy' : 'Sell',
          amount: item.valueRange || "$1,001 - $15,000",
          sizeLow: item.sizeLow || 0,
          sizeHigh: item.sizeHigh || 0,
          chamber: item.chamber === 'senate' ? 'Senate' : 'House'
        });
      });
      return {
        trades,
        politicians: Array.from(politiciansMap.values()),
        issuers: Array.from(issuersMap.values())
      };
    } catch (error) {
      console.error("Critical DO Fetch Error:", error);
      return { trades: MOCK_TRADES, politicians: MOCK_POLITICIANS, issuers: MOCK_ISSUERS };
    }
  }
  async getStoredData(): Promise<{ trades: Trade[]; politicians: Politician[]; issuers: Issuer[] }> {
    const lastUpdate = (await this.ctx.storage.get<number>("last_update")) || 0;
    const now = Date.now();
    if (now - lastUpdate > CACHE_TTL) {
      const fresh = await this.fetchExternalTrades();
      await this.ctx.storage.put("trades", fresh.trades);
      await this.ctx.storage.put("politicians", fresh.politicians);
      await this.ctx.storage.put("issuers", fresh.issuers);
      await this.ctx.storage.put("last_update", now);
      return fresh;
    }
    const trades = (await this.ctx.storage.get<Trade[]>("trades")) || MOCK_TRADES;
    const politicians = (await this.ctx.storage.get<Politician[]>("politicians")) || MOCK_POLITICIANS;
    const issuers = (await this.ctx.storage.get<Issuer[]>("issuers")) || MOCK_ISSUERS;
    return { trades, politicians, issuers };
  }
  async getTrades(): Promise<Trade[]> {
    const { trades } = await this.getStoredData();
    return trades;
  }
  async getDashboardStats(): Promise<DashboardStats> {
    const { trades, politicians, issuers } = await this.getStoredData();
    const trendMap = new Map<string, number>();
    let totalLow = 0;
    const sectorCount = new Map<string, number>();
    trades.forEach(t => {
      trendMap.set(t.pubDate, (trendMap.get(t.pubDate) || 0) + 1);
      totalLow += t.sizeLow;
      const issuer = issuers.find(i => i.symbol === t.issuerId);
      if (issuer && issuer.sector) {
        sectorCount.set(issuer.sector, (sectorCount.get(issuer.sector) || 0) + 1);
      }
    });
    const volumeTrend = Array.from(trendMap.entries())
      .map(([date, volume]) => ({ date, volume }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-15);
    let topSector = "N/A";
    let maxSector = -1;
    sectorCount.forEach((val, key) => {
      if (val > maxSector) {
        maxSector = val;
        topSector = key;
      }
    });
    // Defensive filtering: Ensure recent trades have matching politicians and issuers
    const recentTrades = trades
      .map(t => ({
        trade: t,
        politician: politicians.find(p => p.id === t.politicianId),
        issuer: issuers.find(i => i.symbol === t.issuerId)
      }))
      .filter(item => !!item.politician && !!item.issuer)
      .slice(0, 6)
      .map(item => ({
        ...item.trade,
        politician: item.politician!,
        issuer: item.issuer!
      }));
    const formattedVol = totalLow >= 1000000
      ? `${(totalLow / 1000000).toFixed(1)}M+`
      : totalLow >= 1000 
      ? `${(totalLow / 1000).toFixed(0)}K+`
      : `$${totalLow}+`;
    return {
      totalVolume: formattedVol,
      activeTraders: politicians.length,
      topSector,
      volumeTrend,
      recentTrades
    };
  }
  async forceRefresh(): Promise<void> {
    const fresh = await this.fetchExternalTrades();
    await this.ctx.storage.put("trades", fresh.trades);
    await this.ctx.storage.put("politicians", fresh.politicians);
    await this.ctx.storage.put("issuers", fresh.issuers);
    await this.ctx.storage.put("last_update", Date.now());
  }
  async getPoliticians(): Promise<Politician[]> {
    const { politicians } = await this.getStoredData();
    return politicians;
  }
}