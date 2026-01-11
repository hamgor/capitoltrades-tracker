import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AlertCircle } from "lucide-react";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = true, className, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-slate-50/30">
        <AppSidebar />
        <SidebarInset className={`flex-1 flex flex-col min-w-0 ${className ?? ''}`}>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex-1" />
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
              <AlertCircle className="size-3.5 text-amber-600" />
              <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Simulated Data</span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            {container ? (
              <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 ${contentClassName ?? ''}`}>
                {children}
              </div>
            ) : (
              children
            )}
            <footer className="mt-auto border-t py-6 px-4 sm:px-6 lg:px-8 bg-white/50">
              <p className="text-xs text-center text-slate-400 max-w-2xl mx-auto">
                Congress Trade Pulse is a demonstration tool. The financial data, politician trades, and market movements shown are simulated and generated for educational purposes only.
              </p>
            </footer>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}