import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, Trade, DashboardStats } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const getStub = (c: any) => c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
  app.get('/api/trades', async (c) => {
    try {
      const stub = getStub(c);
      const data = await stub.getTrades();
      return c.json({ success: true, data } satisfies ApiResponse<Trade[]>);
    } catch (e) {
      return c.json({ success: false, error: "Failed to fetch trades" }, 500);
    }
  });
  app.get('/api/stats', async (c) => {
    try {
      const stub = getStub(c);
      const data = await stub.getDashboardStats();
      return c.json({ success: true, data } satisfies ApiResponse<DashboardStats>);
    } catch (e) {
      return c.json({ success: false, error: "Failed to fetch dashboard stats" }, 500);
    }
  });
  app.get('/api/politicians', async (c) => {
    try {
      const stub = getStub(c);
      const data = await stub.getPoliticians();
      return c.json({ success: true, data } satisfies ApiResponse);
    } catch (e) {
      return c.json({ success: false, error: "Failed to fetch politicians" }, 500);
    }
  });
  app.post('/api/refresh', async (c) => {
    try {
      const stub = getStub(c);
      await stub.forceRefresh();
      return c.json({ success: true, data: { message: "Cache refreshed" } });
    } catch (e) {
      return c.json({ success: false, error: "Refresh failed" }, 500);
    }
  });
}