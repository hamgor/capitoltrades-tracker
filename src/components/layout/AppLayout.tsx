import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AlertCircle } from "lucide-react";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = true, className, contentClassName }: AppLayoutProps): JSX.Element {
  const [isSimulated, setIsSimulated] = useState(true);

  useEffect(() => {
    fetch('/api/stats').then(res => res.json()).then(({data}) => {
      setIsSimulated(data?.isLiveData !== true);
    }).catch(() => setIsSimulated(true));
  }, []);
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-slate-50/30 dark:bg-slate-950/30">
        <AppSidebar />
        <SidebarInset className={`flex-1 flex flex-col min-w-0 bg-transparent ${className ?? ''}`}>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              {isSimulated && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50 rounded-full">
                  <AlertCircle className="size-3.5 text-amber-600 dark:text-amber-500" />
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-wide">Simulated Data</span>
                </div>
              )}
              <ThemeToggle className="static" />
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
            <footer className="mt-auto border-t py-8 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50">
              <div className="max-w-2xl mx-auto text-center space-y-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Congress Trade Pulse is a demonstration tool.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  The financial data, politician trades, and market movements shown are simulated and generated for educational purposes only and do not reflect real-time financial data or specific actions of any public official.
                </p>
              </div>
            </footer>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}