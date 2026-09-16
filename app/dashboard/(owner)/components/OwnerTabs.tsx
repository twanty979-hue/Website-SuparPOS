'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

// --- Icons ---
const IconFood = ({ size = 20 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/>
  </svg>
);
const IconCategory = ({ size = 20 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z"/><path d="M12 10v6"/><path d="M9 13h6"/>
  </svg>
);
const IconTable = ({ size = 20 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="13" width="20" height="2" rx="1" /><path d="M5 15v6" /><path d="M19 15v6" /><path d="M12 4v6" /><path d="M9 7h6" />
  </svg>
);
const IconBanner = ({ size = 20 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/><path d="M18 6h3" /><path d="M19.5 4.5v3" />
  </svg>
);
const IconDiscount = ({ size = 20 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);

export default function OwnerTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // กำหนด active tab จาก URL หรือ searchParams
  const getInitialTab = () => {
    const tabParam = searchParams?.get('tab');
    if (tabParam) return tabParam;
    if (pathname.includes('/product_master')) return 'product_master';
    if (pathname.includes('/tables')) return 'tables';
    if (pathname.includes('/banners')) return 'banners';
    if (pathname.includes('/discounts')) return 'discounts';
    return 'menu';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleExternalSwitch = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };
    window.addEventListener('owner-tab-switch', handleExternalSwitch);
    return () => window.removeEventListener('owner-tab-switch', handleExternalSwitch);
  }, []);

  const tabs = [
    { id: 'menu', name: 'เมนูอาหาร', href: '/dashboard/products?tab=menu', icon: IconFood },
    { id: 'product_master', name: 'สินค้าหลัก', href: '/dashboard/products?tab=product_master', icon: IconCategory },
    { id: 'tables', name: 'จัดการโต๊ะ', href: '/dashboard/products?tab=tables', icon: IconTable },
    { id: 'banners', name: 'แบนเนอร์', href: '/dashboard/products?tab=banners', icon: IconBanner },
    { id: 'discounts', name: 'ส่วนลด', href: '/dashboard/products?tab=discounts', icon: IconDiscount },
  ];

  const handleTabClick = (tab: (typeof tabs)[0]) => {
    setActiveTab(tab.id);

    // 1. ส่งสัญญาณสลับแท็บในหน้าเดียว (SPA Style ไร้รอยต่อแบบในแอป)
    window.dispatchEvent(
      new CustomEvent('owner-tab-switch', {
        detail: { tab: tab.id },
      })
    );

    // 2. อัปเดต URL โดยไม่รีโหลดหน้าเว็บ
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', tab.href);
    }
  };

  return (
    <div className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="relative flex items-center py-2.5 w-full">
          
          {/* 🍔 ปุ่มแฮมเบอร์เกอร์เต็มๆ แน่นๆ สวยหรู (Absolute ซ้ายสุด) */}
          <div className="flex items-center pr-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('toggle-sidebar'));
                window.dispatchEvent(new CustomEvent('open-sidebar'));
                const layoutMenuBtn = document.getElementById('layout-open-sidebar-btn') || document.querySelector('header button');
                if (layoutMenuBtn instanceof HTMLElement) {
                  layoutMenuBtn.click();
                }
              }}
              className="group flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-sm hover:shadow-md active:scale-95 transition-all border border-slate-700/60 cursor-pointer"
              title="เปิดเมนูนำทางระบบ (Sidebar)"
            >
              <div className="flex flex-col justify-center items-center w-4 h-4 gap-1">
                <span className="w-4 h-0.5 bg-white rounded-full transition-all group-hover:w-3"></span>
                <span className="w-4 h-0.5 bg-emerald-400 rounded-full transition-all"></span>
                <span className="w-4 h-0.5 bg-white rounded-full transition-all group-hover:w-3.5"></span>
              </div>
              <span className="text-xs font-black tracking-wide hidden sm:inline">
                เมนูระบบ
              </span>
            </button>
          </div>

          {/* 📑 แท็บทั้ง 5 ตัว (สลับลื่นไหลแบบในแอป 0ms ไม่โหลดหน้าใหม่) */}
          <div className="flex-1 w-full flex overflow-x-auto hide-scrollbar justify-start md:justify-center items-center">
            <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/70 shadow-inner">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabClick(tab)}
                    className={`
                      relative flex items-center justify-center gap-2 h-10 px-3 md:px-5 rounded-xl transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer
                      ${isActive ? 'text-white font-black shadow-sm scale-[1.02]' : 'text-slate-600 hover:text-slate-900 font-bold hover:bg-white/60'}
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-owner-pill"
                        className="absolute inset-0 bg-blue-600 shadow-md shadow-blue-600/20"
                        style={{ borderRadius: '12px' }}
                        transition={{
                          type: 'spring',
                          stiffness: 450,
                          damping: 32,
                        }}
                      />
                    )}

                    <span className="relative z-10 flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm">
                      <tab.icon size={17} />
                      <span>{tab.name}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ซ่อน Scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
