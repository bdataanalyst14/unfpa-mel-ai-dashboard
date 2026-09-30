'use client';
import { useState } from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import SidebarNav from './sidebar-nav';
import DataFreshnessFooter from '../dashboard/data-freshness-footer';

export default function DashboardShell({ children, dataMode }: { children: React.ReactNode; dataMode: 'bigquery' | 'mock' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const brand = <div className="px-5 py-5 border-b border-white/10"><p className="text-sm font-bold tracking-wide">UNFPA Nepal</p><p className="text-[10px] text-white/70 uppercase tracking-wider">MEL Intelligence</p></div>;
  const footer = <div className="px-4 py-3 border-t border-white/10"><button type="button" className="min-h-11 text-xs text-white/80 hover:text-white" onClick={() => signOut({ callbackUrl: '/auth/signin' })}>Sign out</button>{!collapsed && <p className="text-[10px] text-white/60">{dataMode === 'bigquery' ? 'Production aggregate mode' : 'Demo / mock data'}</p>}</div>;
  return <div className="flex min-h-screen bg-[#F3F4F6]">
    <a href="#dashboard-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:p-3">Skip to dashboard content</a>
    <aside aria-label="Sidebar" className={`fixed inset-y-0 left-0 hidden flex-col bg-[#082A4D] text-white md:flex ${collapsed ? 'w-20' : 'w-64'}`}>
      {!collapsed && brand}
      <button type="button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} aria-expanded={!collapsed} className="flex min-h-11 items-center justify-center gap-2 border-b border-white/10 p-3 text-xs text-white/80 hover:bg-white/10">
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <><PanelLeftClose className="h-4 w-4" />Collapse navigation</>}
      </button>
      <SidebarNav collapsed={collapsed} />{footer}
    </aside>
    <main className={`min-w-0 flex-1 flex flex-col min-h-screen overflow-x-hidden ${collapsed ? 'md:ml-20' : 'md:ml-64'}`}>
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-[#082A4D] px-4 py-2 text-white md:hidden">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild><button type="button" aria-label="Open navigation" className="flex h-11 w-11 items-center justify-center rounded hover:bg-white/10"><Menu className="h-5 w-5" /></button></SheetTrigger>
          <SheetContent side="left" className="w-64 gap-0 bg-[#082A4D] text-white">
            <SheetTitle className="sr-only">Dashboard navigation</SheetTitle><SheetDescription className="sr-only">UNFPA Nepal dashboard pages</SheetDescription>
            {brand}<SidebarNav onNavigate={() => setSidebarOpen(false)} />{footer}
          </SheetContent>
        </Sheet>
        <span className="text-sm font-semibold">UNFPA Nepal MEL</span>
      </div>
      <div id="dashboard-content" tabIndex={-1} className="min-w-0 flex-1 p-4 md:p-6 space-y-6">{children}</div>
      <DataFreshnessFooter dataMode={dataMode} />
    </main>
  </div>;
}
