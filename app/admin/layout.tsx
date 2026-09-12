'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch (_) {}
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('admin_sidebar_collapsed', String(next));
      } catch (_) {}
      return next;
    });
  };

  const menuItems = [
    {
      name: 'สินค้ากลาง (Products)',
      href: '/admin/products',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      name: 'ร้านค้า / สาขา (Brands)',
      href: '/admin/brands',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      name: 'ควบคุมแอป (App Settings)',
      href: '/admin/app-settings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <circle cx="12" cy="12" r="3" strokeWidth="2" />
        </svg>
      )
    },
    {
      name: 'ธีมร้านค้า (Themes)',
      href: '/admin/marketplace-themes',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4 7 7 0 017-7h4a7 7 0 017 7 4 4 0 01-4 4 4 4 0 01-4-4v-1a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a4 4 0 01-4 4z" />
        </svg>
      )
    },
    {
      name: 'หมวดหมู่ (Categories)',
      href: '/admin/marketplace-categories',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      name: 'แบนเนอร์โฆษณา (Ad Photo)',
      href: '/admin/adphoto',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'คำขอลบบัญชี (Deletion)',
      href: '/admin/account-deletion-requests',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      name: 'ล้างข้อมูลทดสอบ (Clear Data)',
      href: '/admin',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    },
  ];

  const currentMenu = menuItems.find(m => m.href === pathname) || { name: 'Admin Portal' };

  return (
    <div className="flex min-h-screen bg-[#F4F7F4] text-[#1E3A27] font-sans antialiased">
      
      {/* Sidebar - สามารถปิด/ซ่อนได้ตามใจชอบ */}
      <aside
        className={`transition-all duration-300 ease-in-out border-r border-[#D0DDD0] bg-[#E2ECE2] flex flex-col justify-between shrink-0 z-30 ${
          isCollapsed ? 'w-0 -translate-x-full opacity-0 pointer-events-none' : 'w-64 translate-x-0 opacity-100'
        }`}
      >
        <div className="p-5 flex flex-col h-full overflow-y-auto">
          {/* Header & Close Button */}
          <div className="flex items-center justify-between gap-2 pb-5 mb-4 border-b border-[#D0DDD0]/80">
            <Link href="/admin/products" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#2C4A34] text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
                AP
              </div>
              <div>
                <span className="text-base font-black tracking-wide text-[#2C4A34] block leading-tight">
                  Admin Portal
                </span>
                <span className="text-[10px] text-[#608367] font-semibold">SuparPOS Management</span>
              </div>
            </Link>

            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-[#D5E4D5] text-[#4A7255] hover:text-[#1E3A27] transition-all"
              title="ซ่อนแถบเมนูข้าง"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#608367] mb-2 px-2.5 flex items-center justify-between">
              <span>เมนูผู้ดูแลระบบ</span>
              <span className="text-[10px] bg-[#D5E4D5] text-[#2C4A34] px-1.5 py-0.5 rounded font-mono">ADMIN</span>
            </div>
            
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-xs ${
                        isActive
                          ? 'bg-[#2C4A34] text-white font-bold shadow-sm shadow-[#2C4A34]/20'
                          : 'text-[#3B5E44] hover:bg-[#D5E4D5] hover:text-[#1E3A27]'
                      }`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-[#D0DDD0] bg-[#DBE6DB] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-[#2C4A34] flex items-center justify-center text-white text-xs font-bold shrink-0">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#2C4A34] truncate">Super Admin</p>
              <p className="text-[10px] text-[#608367] truncate">admin@suparpos.com</p>
            </div>
          </div>

          <button
            onClick={toggleSidebar}
            className="px-2 py-1 text-xs text-[#4A7255] hover:text-[#1E3A27] hover:bg-[#CADBCB] rounded-lg transition-colors font-medium"
            title="ซ่อนแถบเมนู"
          >
            ปิด
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAF9F5] transition-all">
        {/* Top Navbar with Toggle Sidebar Button */}
        <header className="h-16 border-b border-[#EFECE6] bg-white flex items-center justify-between px-4 md:px-8 shadow-xs sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95 ${
                isCollapsed
                  ? 'bg-[#2C4A34] text-white hover:bg-[#1E3A27] ring-2 ring-emerald-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={isCollapsed ? 'คลิกเพื่อเปิดแถบเมนู' : 'คลิกเพื่อซ่อนแถบเมนู'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>{isCollapsed ? 'เปิดแถบเมนู' : 'ซ่อนแถบเมนู'}</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-[#2C4A34]">
              <span>{currentMenu.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Admin Control Mode
            </span>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
