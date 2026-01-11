import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, CalendarDays, Building2 } from 'lucide-react';
import type { Trade, ApiResponse, Politician } from '@shared/types';
import { format } from 'date-fns';
export function TradesPage() {
  const [search, setSearch] = useState('');
  const { data: tradesResponse, isLoading: tradesLoading } = useQuery<ApiResponse<Trade[]>>({
    queryKey: ['trades'],
    queryFn: () => fetch('/api/trades').then(res => res.json()),
  });
  const { data: polyResponse } = useQuery<ApiResponse<Politician[]>>({
    queryKey: ['politicians'],
    queryFn: () => fetch('/api/politicians').then(res => res.json()),
  });
  const trades = tradesResponse?.data || [];
  const politicians = polyResponse?.data || [];
  const filteredTrades = trades.filter(t => {
    const p = politicians.find(p => p.id === t.politicianId);
    return (
      p?.name.toLowerCase().includes(search.toLowerCase()) ||
      t.issuerId.toLowerCase().includes(search.toLowerCase())
    );
  });
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Trade Explorer</h1>
            <p className="text-slate-500 mt-1">Real-time repository of congressional stock transaction disclosures.</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full">
            <CalendarDays className="size-3" />
            <span>Updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 py-3 bg-white dark:bg-slate-900 px-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Search by politician name or ticker symbol..."
              className="pl-10 border-none bg-slate-50/50 dark:bg-slate-800/50 h-11 focus-visible:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="h-11 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-slate-500 flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Filter className="size-3.5" />
              <span>Filters</span>
            </Badge>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800">
                  <TableHead className="w-[140px] text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Transaction Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Politician</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Asset</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Action</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">Value Range</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tradesLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredTrades.map((trade) => {
                  const politician = politicians.find(p => p.id === trade.politicianId);
                  return (
                    <TableRow key={trade.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-50 dark:border-slate-800">
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                            {format(new Date(trade.txDate), 'MMM d, yyyy')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Published {format(new Date(trade.pubDate), 'MMM d')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <img src={politician?.avatarUrl} className="size-9 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 transition-colors">
                              {politician?.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[9px] font-black uppercase px-1 rounded-sm ${
                                politician?.party === 'Democrat' 
                                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                  : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {politician?.party?.charAt(0)}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400">{politician?.chamber} • {politician?.state}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit font-mono text-[10px] px-1.5 py-0 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                            {trade.issuerId}
                          </Badge>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium max-w-[140px] truncate">
                            <Building2 className="size-2.5 flex-shrink-0" />
                            <span>Equity Transaction</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={`rounded-sm px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border-none shadow-none ${
                          trade.type === 'Buy' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                          {trade.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                        {trade.amount}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {!tradesLoading && filteredTrades.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-slate-400 font-medium">No transactions found matching your search.</p>
              <button onClick={() => setSearch('')} className="text-indigo-500 text-xs font-bold mt-2 hover:underline">Clear Search</button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}