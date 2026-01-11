import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_POLITICIANS } from '@shared/mock-data';
import { Award, TrendingUp, DollarSign } from 'lucide-react';
export function PoliticiansPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Politician Leaderboard</h1>
          <p className="text-slate-500 mt-1">Ranking congress members by estimated trading volume and frequency.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_POLITICIANS.map((politician, index) => (
            <Card key={politician.id} className="group hover:shadow-md transition-all border-none shadow-sm overflow-hidden bg-white">
              <div className="h-2 bg-slate-900 w-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="relative">
                  <img src={politician.avatarUrl} className="size-16 rounded-2xl bg-slate-100 border border-slate-100" />
                  <div className="absolute -top-2 -left-2 size-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
                    #{index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-lg truncate">{politician.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`rounded-full px-2 py-0 text-[10px] font-bold ${
                      politician.party === 'Democrat' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}>
                      {politician.party}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">{politician.state}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                      <DollarSign className="size-2.5" /> Total Traded
                    </p>
                    <p className="text-sm font-bold text-slate-900 font-mono">
                      ${(Math.random() * 5 + 1).toFixed(1)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                      <TrendingUp className="size-2.5" /> Freq
                    </p>
                    <p className="text-sm font-bold text-slate-900 font-mono">
                      {Math.floor(Math.random() * 40 + 10)} / mo
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Award className="size-2.5" /> Top Sector
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Technology', 'Energy', 'Healthcare'].slice(0, 1).map(s => (
                      <Badge key={s} variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] hover:bg-slate-200 border-none">{s}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}