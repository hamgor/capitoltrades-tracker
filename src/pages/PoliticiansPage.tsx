import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, DollarSign, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Trade, Politician, ApiResponse } from '@shared/types';
export function PoliticiansPage() {
  const [search, setSearch] = React.useState('');
  const { data: tradesRes } = useQuery<ApiResponse<Trade[]>>({
    queryKey: ['trades'],
    queryFn: () => fetch('/api/trades').then(res => res.json()),
  });
  const { data: polyRes, isLoading } = useQuery<ApiResponse<Politician[]>>({
    queryKey: ['politicians'],
    queryFn: () => fetch('/api/politicians').then(res => res.json()),
  });
  const rankings = useMemo(() => {
    if (!tradesRes?.data || !polyRes?.data) return [];
    const polyStats = new Map<string, { count: number; totalMin: number }>();
    tradesRes.data.forEach(t => {
      const stats = polyStats.get(t.politicianId) || { count: 0, totalMin: 0 };
      stats.count += 1;
      stats.totalMin += t.sizeLow;
      polyStats.set(t.politicianId, stats);
    });
    return polyRes.data
      .map(p => ({
        ...p,
        stats: polyStats.get(p.id) || { count: 0, totalMin: 0 }
      }))
      .sort((a, b) => b.stats.totalMin - a.stats.totalMin);
  }, [tradesRes, polyRes]);
  const filteredRankings = rankings.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Politician Leaderboard</h1>
            <p className="text-slate-500 mt-1">Ranking members of Congress by aggregate trading volume and disclosure frequency.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Filter politicians..."
              className="pl-10 h-10 bg-white border-slate-200 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRankings.map((politician, index) => (
              <Card key={politician.id} className="group relative hover:shadow-xl transition-all border-none shadow-sm overflow-hidden bg-white rounded-2xl">
                <div className={`h-1.5 w-full ${politician.party === 'Democrat' ? 'bg-blue-500' : 'bg-red-500'}`} />
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <div className="relative">
                    <img src={politician.avatarUrl} className="size-16 rounded-2xl bg-slate-50 border border-slate-100 object-cover" />
                    <div className="absolute -top-2 -left-2 size-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-black border-2 border-white shadow-md">
                      #{index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg truncate group-hover:text-indigo-600 transition-colors">{politician.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`rounded-full px-2 py-0 text-[10px] font-black uppercase tracking-widest border-none ${
                        politician.party === 'Democrat' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {politician.party}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{politician.chamber} • {politician.state}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <DollarSign className="size-3 text-emerald-500" /> Agg Volume
                      </p>
                      <p className="text-base font-bold text-slate-900 font-mono">
                        ${(politician.stats.totalMin / 1000000).toFixed(2)}M+
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <TrendingUp className="size-3 text-indigo-500" /> Activity
                      </p>
                      <p className="text-base font-bold text-slate-900 font-mono">
                        {politician.stats.count} Trades
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Award className="size-3 text-amber-500" /> Status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] font-bold py-0.5 rounded-md hover:bg-slate-200 border-none transition-colors">
                        Active Filer
                      </Badge>
                      {politician.stats.totalMin > 1000000 && (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 text-[10px] font-bold py-0.5 rounded-md border-none">
                          High Volume
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}