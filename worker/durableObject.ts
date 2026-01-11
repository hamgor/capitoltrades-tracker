import { DurableObject } from "cloudflare:workers";
import type { Trade, DashboardStats, Politician, Issuer } from '@shared/types';
import { MOCK_TRADES, MOCK_POLITICIANS, MOCK_ISSUERS } from '@shared/mock-data';

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
export class GlobalDurableObject extends DurableObject {
  async fetchExternalTrades(): Promise<{ trades: Trade[]; politicians: Politician[]; issuers: Issuer[]; source: string }> {
    try {
      const releaseResponse = await fetch('https://api.github.com/repos/flemm0/capitol-trades/releases/latest', {
        headers: { 'User-Agent': 'CapitolPulse/1.0' }
      });
      if (!releaseResponse.ok) throw new Error('GitHub release fetch failed');
      const release = await releaseResponse.json() as any;
      const parquetAsset = release.assets.find((asset: any) => asset.name === 'trades.parquet');
      if (!parquetAsset) throw new Error('Parquet asset not found');
      
      const response = await fetch(parquetAsset.browser_download_url);
      if (!response.ok) throw new Error('Parquet fetch failed');
      const buf = await response.arrayBuffer();

      const parquetWasm = await import('parquet-wasm');
      await parquetWasm.ParquetTable.initializeWasm();
      const table = await parquetWasm.ParquetTable.read(new Uint8Array(buf));
      const data = table.full.slice(-1000) as any[];
      
      const trades: Trade[] = [];
      const politiciansMap = new Map<string, Politician>();
      const issuersMap = new Map<string, Issuer>();
      
      data.forEach((row) => {
        const polKey = `${row.politician_first_name || ''}-${row.politician_last_name || ''}-${row.state || ''}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (!politiciansMap.has(polKey)) {
          politiciansMap.set(polKey, {
            id: `p-${polKey}`,
            firstName: row.politician_first_name || '',
            lastName: row.politician_last_name || 'Unknown',
            name: `${row.politician_first_name || ''} ${row.politician_last_name || 'Unknown'}`.trim(),
            party: row.party_affiliation || 'Independent',
            state: row.state || 'US',
            chamber: row.chamber === 'senate' ? 'Senate' : 'House',
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row.politician_last_name || 'default')}`
          });
        }
        const polId = politiciansMap.get(polKey)!.id;
        const issKey = row.issuer_symbol || '';
        if (!issuersMap.has(issKey)) {
          issuersMap.set(issKey, {
            symbol: issKey,
            name: row.issuer_name || `${issKey} Corp`,
            sector: row.issuer_sector || 'Miscellaneous'
          });
        }
        trades.push({
          id: row.id || `t-${Math.random().toString(36).slice(2, 8)}`,
          txDate: row.txDate,
          pubDate: row.pubDate,
          politicianId: polId,
          issuerId: issKey,
          type: row.type?.toLowerCase() === 'buy' ? 'Buy' : 'Sell',
          amount: row.value_range || '$1,001 - $15,000',
          sizeLow: Number(row.size_low) || 0,
          sizeHigh: Number(row.size_high) || 0,
          chamber: row.chamber === 'senate' ? 'Senate' : 'House'
        });
      });
      
      return {
        trades: trades.slice(0, 200),
        politicians: Array.from(politiciansMap.values()),
        issuers: Array.from(issuersMap.values()),
        source: 'live'
      };
    } catch (e) {
      console.error('Real data fetch/parse failed:', e);
      return { trades: MOCK_TRADES, politicians: MOCK_POLITICIANS, issuers: MOCK_ISSUERS, source: 'mock' };
    }
  }
  async getStoredData(): Promise<{ trades: Trade[]; politicians: Politician[]; issuers: Issuer[] }> {
    const lastUpdate = (await this.ctx.storage.get<number>("last_update")) || 0;
    const now = Date.now();
    if (now - lastUpdate > CACHE_TTL) {
      const fresh = await this.fetchExternalTrades();
      await Promise.all([
        this.ctx.storage.put('trades', fresh.trades),
        this.ctx.storage.put('politicians', fresh.politicians),
        this.ctx.storage.put('issuers', fresh.issuers),
        this.ctx.storage.put('data_source', fresh.source!),
        this.ctx.storage.put('last_update', now)
      ]);
      return { trades: fresh.trades, politicians: fresh.politicians, issuers: fresh.issuers };
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
    const dataSource = await this.ctx.storage.get<string>('data_source') || 'mock';
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
      : `${totalLow}+`;
    return {
      totalVolume: formattedVol,
      activeTraders: politicians.length,
      topSector,
      volumeTrend,
      recentTrades,
      isLiveData: dataSource === 'live'
    };
  }
  async forceRefresh(): Promise<void> {
    const fresh = await this.fetchExternalTrades();
    await Promise.all([
      this.ctx.storage.put('trades', fresh.trades),
      this.ctx.storage.put('politicians', fresh.politicians),
      this.ctx.storage.put('issuers', fresh.issuers),
      this.ctx.storage.put('data_source', fresh.source!),
      this.ctx.storage.put('last_update', Date.now())
    ]);
  }
  async getPoliticians(): Promise<Politician[]> {
    const { politicians } = await this.getStoredData();
    return politicians;
  }
}