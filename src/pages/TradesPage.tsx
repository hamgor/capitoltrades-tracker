import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import type { Trade, ApiResponse } from '@shared/types';
import { MOCK_POLITICIANS, MOCK_ISSUERS } from '@shared/mock-data';
import { format } from 'date-fns';
export function TradesPage() {
  const [search, setSearch] = useState('');
  const { data: tradesResponse, isLoading } = useQuery<ApiResponse<Trade[]>>({
    queryKey: ['trades'],
    queryFn: () => fetch('/api/trades').then(res => res.json()),
  });
  const trades = tradesResponse?.data || [];
  const filteredTrades = trades.filter(t => {
    const p = MOCK_POLITICIANS.find(p => p.id === t.politicianId);
    return (
      p?.name.toLowerCase().includes(search.toLowerCase()) ||
      t.issuerId.toLowerCase().includes(search.toLowerCase())
    );
  });
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Trades Explorer</h1>
          <p className="text-slate-500 mt-1">Historical log of all disclosed congressional transactions.</p>
        </div>
        <div className="flex items-center gap-4 py-4 bg-white px-4 rounded-xl shadow-sm border border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input 
              placeholder="Search by politician or ticker..." 
              className="pl-10 border-none bg-slate-50/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="h-10 px-4 rounded-md border-slate-200 text-slate-500 flex items-center gap-2 cursor-pointer hover:bg-slate-50">
            <Filter className="size-3.5" />
            <span>Filters</span>
          </Badge>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Politician</TableHead>
                <TableHead>Issuer</TableHead>
                <TableHead>Transaction</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <TableRow key={i}>
                    {[1, 2, 3, 4, 5].map(j => (
                      <TableCell key={j}><div className="h-4 bg-slate-100 animate-pulse rounded" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredTrades.map((trade) => {
                const politician = MOCK_POLITICIANS.find(p => p.id === trade.politicianId);
                const issuer = MOCK_ISSUERS.find(i => i.symbol === trade.issuerId);
                return (
                  <TableRow key={trade.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-500 text-xs">
                      {format(new Date(trade.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={politician?.avatarUrl} className="size-8 rounded-full bg-slate-100 border border-slate-200" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{politician?.name}</p>
                          <p className={`text-[10px] font-bold ${politician?.party === 'Democrat' ? 'text-blue-600' : 'text-red-600'}`}>
                            {politician?.party} ({politician?.state})
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="outline" className="font-mono text-[10px] mb-1">{trade.issuerId}</Badge>
                        <p className="text-xs text-slate-500 truncate max-w-[150px]">{issuer?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-sm px-2 py-0 text-[10px] uppercase font-bold tracking-wider ${
                        trade.type === 'Buy' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}>
                        {trade.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono text-slate-600">
                      {trade.amount}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!isLoading && filteredTrades.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              No transactions found matching your search.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}