import { DurableObject } from "cloudflare:workers";
import type { Trade, DashboardStats, DemoItem } from '@shared/types';
import { MOCK_ITEMS, MOCK_TRADES, MOCK_POLITICIANS, MOCK_ISSUERS } from '@shared/mock-data';
export class GlobalDurableObject extends DurableObject {
    async getTrades(): Promise<Trade[]> {
      const trades = await this.ctx.storage.get("trades");
      if (trades) return trades as Trade[];
      await this.ctx.storage.put("trades", MOCK_TRADES);
      return MOCK_TRADES;
    }
    async getDashboardStats(): Promise<DashboardStats> {
      const trades = await this.getTrades();
      // Calculate trend (last 7 days)
      const trendMap = new Map<string, number>();
      trades.forEach(t => {
        trendMap.set(t.date, (trendMap.get(t.date) || 0) + 1);
      });
      const volumeTrend = Array.from(trendMap.entries())
        .map(([date, volume]) => ({ date, volume }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-10);
      const recentTrades = trades.slice(0, 5).map(t => ({
        ...t,
        politician: MOCK_POLITICIANS.find(p => p.id === t.politicianId)!,
        issuer: MOCK_ISSUERS.find(i => i.symbol === t.issuerId)!
      }));
      return {
        totalVolume: "$12.4M",
        activeTraders: MOCK_POLITICIANS.length,
        topSector: "Technology",
        volumeTrend,
        recentTrades
      };
    }
    // Boilerplate for demo items (maintained for template compatibility)
    async getCounterValue(): Promise<number> {
      return (await this.ctx.storage.get("counter_value")) || 0;
    }
    async increment(amount = 1): Promise<number> {
      let value: number = (await this.ctx.storage.get("counter_value")) || 0;
      value += amount;
      await this.ctx.storage.put("counter_value", value);
      return value;
    }
    async getDemoItems(): Promise<DemoItem[]> {
      const items = await this.ctx.storage.get("demo_items");
      if (items) return items as DemoItem[];
      await this.ctx.storage.put("demo_items", MOCK_ITEMS);
      return MOCK_ITEMS;
    }
}