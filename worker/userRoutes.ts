import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, Trade, DashboardStats } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/trades', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getTrades();
        return c.json({ success: true, data } satisfies ApiResponse<Trade[]>);
    });
    app.get('/api/stats', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getDashboardStats();
        return c.json({ success: true, data } satisfies ApiResponse<DashboardStats>);
    });
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'Congress Trade Pulse API' }}));
}