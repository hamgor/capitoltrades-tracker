import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { DashboardStats, ApiResponse } from '@shared/types';
import { format } from 'date-fns';
export function HomePage() {
  const { data: statsResponse, isLoading } = useQuery<ApiResponse<DashboardStats>>({
    queryKey: ['dashboard-stats'],
    queryFn: () => fetch('/api/stats').then(res => res.json()),
  });
  const stats = statsResponse?.data;
  if (isLoading || !stats) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-slate-100 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl" />)}
          </div>
          <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <Badge variant="outline" className="mb-4 border-slate-700 text-slate-300 font-mono uppercase tracking-tighter">Market Pulse v1.0</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Congressional Trading Transparency</h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Real-time visualization of stock market activities by members of the U.S. Congress. Monitoring portfolios, sectors, and transaction trends.
            </p>
          </div>
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-gradient-to-l from-indigo-500 to-transparent" />
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">Monthly Volume</CardTitle>
              <DollarSign className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalVolume}</div>
              <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                <ArrowUpRight className="size-3 mr-1" /> +12.5% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">Active Members</CardTitle>
              <Users className="size-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.activeTraders}</div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Representing 12 states
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">Top Sector</CardTitle>
              <Activity className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.topSector}</div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                42% of total transaction count
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Trading Activity Trend</CardTitle>
                  <CardDescription>Daily transaction frequency over time</CardDescription>
                </div>
                <TrendingUp className="size-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.volumeTrend}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8' }} 
                      tickFormatter={(str) => format(new Date(str), 'MMM d')}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      labelFormatter={(label) => format(new Date(label), 'PPP')}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorVolume)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
              <CardDescription>Latest filings from Congress members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats.recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center gap-4">
                    <div className="relative">
                      <img src={trade.politician.avatarUrl} className="size-10 rounded-full bg-slate-100" />
                      <div className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white ${trade.type === 'Buy' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">{trade.politician.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${trade.type === 'Buy' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {trade.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono rounded-sm">{trade.issuer.symbol}</Badge>
                        <span className="text-xs text-slate-400 tabular-nums">{trade.amount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}