'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import SidebarNav from './sidebar-nav';
import DataFreshnessFooter from '../dashboard/data-freshness-footer';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — off-canvas on mobile, fixed on md+ */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 w-64 bg-[#082A4D] text-white flex flex-col',
          'transition-transform duration-300 ease-in-out',
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Sidebar"
      >
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF6600] flex items-center justify-center text-white font-bold text-sm">U</div>
            <div>
              <h1 className="text-sm font-bold tracking-wide">UNFPA Nepal</h1>
              <p className="text-[10px] text-white/60 tracking-wider uppercase">MEL Intelligence</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            className="md:hidden text-white/70 hover:text-white p-1 rounded"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarNav onNavigate={() => setSidebarOpen(false)} />
        <div className="px-5 py-3 border-t border-white/10">
          <p className="text-[10px] text-white/40">Prototype v0.1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar with hamburger */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#082A4D] text-white sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
            className="text-white/80 hover:text-white p-1 rounded"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#FF6600] flex items-center justify-center text-white font-bold text-xs">U</div>
            <span className="text-sm font-semibold tracking-wide">UNFPA Nepal MEL</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
          {children}
        </div>
        <DataFreshnessFooter />
      </main>
    </div>
  );
}
