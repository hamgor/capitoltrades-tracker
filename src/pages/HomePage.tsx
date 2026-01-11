import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardStats, ApiResponse } from '@shared/types';
import { format } from 'date-fns';
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};
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
          <div className="h-48 bg-slate-200/50 dark:bg-slate-800/50 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
          </div>
          <div className="h-80 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white shadow-2xl"
        >
          <div className="relative z-10 max-w-2xl">
            <Badge variant="outline" className="mb-4 border-emerald-500/50 text-emerald-400 font-mono uppercase tracking-widest text-[10px]">Market Intelligence</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Capitol Market Pulse</h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Monitoring active stock market disclosures from the U.S. House and Senate. Tracking the flow of capital from Pennsylvania Avenue to Wall Street.
            </p>
          </div>
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-20 bg-gradient-to-l from-emerald-500 to-transparent" />
        </motion.div>
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Est. Traded Volume</CardTitle>
              <DollarSign className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.totalVolume}</div>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center mt-2 uppercase tracking-tighter">
                <ArrowUpRight className="size-3 mr-1" /> Aggregate Low Estimate
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Disclosures</CardTitle>
              <Users className="size-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.activeTraders}</div>
              <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-tighter">
                Members with recent filings
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hottest Sector</CardTitle>
              <Activity className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 truncate">{stats.topSector}</div>
              <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-tighter">
                Most frequent sector in trades
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="pb-0 sm:pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">Filing Volume Trend</CardTitle>
                    <CardDescription>Frequency of trade publications over time</CardDescription>
                  </div>
                  <TrendingUp className="size-5 text-slate-300" />
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="h-[350px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.volumeTrend}>
                      <defs>
                        <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickFormatter={(str) => {
                          try { return format(new Date(str), 'MMM d'); } catch { return str; }
                        }}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                          backgroundColor: '#0f172a',
                          color: '#fff'
                        }}
                        labelFormatter={(label) => {
                          try { return format(new Date(label), 'PPP'); } catch { return label; }
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorVol)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="h-full border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Latest Disclosures</CardTitle>
                <CardDescription>Real-time publication feed</CardDescription>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="space-y-6">
                  {stats.recentTrades.map((trade) => (
                    <div key={trade.id} className="flex items-center gap-4 px-4 sm:px-0">
                      <div className="relative flex-shrink-0">
                        <img src={trade.politician.avatarUrl} className="size-11 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800" />
                        <div className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white dark:border-slate-900 ${trade.type === 'Buy' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{trade.politician.name}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${trade.type === 'Buy' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                            {trade.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-mono rounded-sm border-slate-200 dark:border-slate-800 text-slate-500">{trade.issuerId}</Badge>
                          <span className="text-[11px] text-slate-400 font-medium">{trade.amount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
}