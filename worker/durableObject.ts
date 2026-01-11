import { DurableObject } from "cloudflare:workers";
import type { Trade, DashboardStats, Politician, Issuer } from '@shared/types';
const API_BASE = "https://api.capitoltrades.com";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
export class GlobalDurableObject extends DurableObject {
  async fetchExternalTrades(): Promise<{ trades: Trade[]; politicians: Politician[]; issuers: Issuer[] }> {
    try {
      // Note: In a real production scenario, we'd hit official disclosure sites or a reliable provider.
      // We simulate the structure of Capitol Trades API response transformation.
      const response = await fetch(`${API_BASE}/trades?pageSize=100`);
      if (!response.ok) throw new Error("Failed to fetch from Capitol Trades");
      const rawData = await response.json() as any;
      const data = rawData.data || [];
      const trades: Trade[] = [];
      const politiciansMap = new Map<string, Politician>();
      const issuersMap = new Map<string, Issuer>();
      data.forEach((item: any) => {
        const politicianId = item.politician?.id || `p-${item.politician?.lastName}`;
        const symbol = item.issuer?.symbol || "UNKNOWN";
        if (!politiciansMap.has(politicianId)) {
          politiciansMap.set(politicianId, {
            id: politicianId,
            firstName: item.politician?.firstName || "",
            lastName: item.politician?.lastName || "Unknown",
            name: `${item.politician?.firstName} ${item.politician?.lastName}`,
            party: item.politician?.party || "Independent",
            state: item.politician?.state || "US",
            chamber: item.chamber === 'senate' ? 'Senate' : 'House',
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.politician?.lastName}`
          });
        }
        if (!issuersMap.has(symbol)) {
          issuersMap.set(symbol, {
            symbol,
            name: item.issuer?.name || "Unknown Issuer",
            sector: item.issuer?.sector || "Miscellaneous"
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
          sizeLow: item.sizeLow || 1000,
          sizeHigh: item.sizeHigh || 15000,
          chamber: item.chamber === 'senate' ? 'Senate' : 'House'
        });
      });
      return { 
        trades, 
        politicians: Array.from(politiciansMap.values()), 
        issuers: Array.from(issuersMap.values()) 
      };
    } catch (error) {
      console.error("External Fetch Error:", error);
      throw error;
    }
  }
  async getStoredData(): Promise<{ trades: Trade[]; politicians: Politician[]; issuers: Issuer[] }> {
    const lastUpdate = (await this.ctx.storage.get<number>("last_update")) || 0;
    const now = Date.now();
    if (now - lastUpdate > CACHE_TTL) {
      try {
        const { trades, politicians, issuers } = await this.fetchExternalTrades();
        await this.ctx.storage.put("trades", trades);
        await this.ctx.storage.put("politicians", politicians);
        await this.ctx.storage.put("issuers", issuers);
        await this.ctx.storage.put("last_update", now);
        return { trades, politicians, issuers };
      } catch (e) {
        console.warn("Using stale cache due to fetch failure");
      }
    }
    const trades = (await this.ctx.storage.get<Trade[]>("trades")) || [];
    const politicians = (await this.ctx.storage.get<Politician[]>("politicians")) || [];
    const issuers = (await this.ctx.storage.get<Issuer[]>("issuers")) || [];
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
      if (issuer) {
        sectorCount.set(issuer.sector, (sectorCount.get(issuer.sector) || 0) + 1);
      }
    });
    const volumeTrend = Array.from(trendMap.entries())
      .map(([date, volume]) => ({ date, volume }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-15);
    let topSector = "Technology";
    let maxSector = 0;
    sectorCount.forEach((val, key) => {
      if (val > maxSector) {
        maxSector = val;
        topSector = key;
      }
    });
    const recentTrades = trades.slice(0, 6).map(t => ({
      ...t,
      politician: politicians.find(p => p.id === t.politicianId)!,
      issuer: issuers.find(i => i.symbol === t.issuerId)!
    }));
    const formattedVol = totalLow > 1000000 
      ? `$${(totalLow / 1000000).toFixed(1)}M+` 
      : `$${(totalLow / 1000).toFixed(0)}K+`;
    return {
      totalVolume: formattedVol,
      activeTraders: politicians.length,
      topSector,
      volumeTrend,
      recentTrades
    };
  }
  async forceRefresh(): Promise<void> {
    const { trades, politicians, issuers } = await this.fetchExternalTrades();
    await this.ctx.storage.put("trades", trades);
    await this.ctx.storage.put("politicians", politicians);
    await this.ctx.storage.put("issuers", issuers);
    await this.ctx.storage.put("last_update", Date.now());
  }
  async getPoliticians(): Promise<Politician[]> {
    const { politicians } = await this.getStoredData();
    return politicians;
  }
}