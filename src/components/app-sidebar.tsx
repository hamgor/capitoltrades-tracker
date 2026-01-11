import React from "react";
import { LayoutDashboard, ArrowRightLeft, Users, ShieldCheck, Info } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Trades Explorer", icon: ArrowRightLeft, path: "/trades" },
    { name: "Politicians", icon: Users, path: "/politicians" },
  ];
  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-100 py-6">
        <div className="flex items-center gap-3 px-4">
          <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-900 uppercase">Trade Pulse</span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Congressional Watch</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Analysis
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === item.path}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <Link to={item.path} className="flex items-center gap-3 py-2">
                    <item.icon className="size-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <Info className="size-3" />
          <span>V1.0.0 Alpha</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}