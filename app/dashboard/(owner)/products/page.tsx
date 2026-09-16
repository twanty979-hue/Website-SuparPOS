'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MenuView from '../components/MenuView';
import MasterProductView from '../components/MasterProductView';
import TablesView from '../components/TablesView';
import BannersView from '../components/BannersView';
import DiscountsView from '../components/DiscountsView';

interface UnifiedProps {
  defaultTab?: string;
}

function UnifiedStoreManagerContent({ defaultTab }: UnifiedProps) {
  const searchParams = useSearchParams();

  const getInitialTab = () => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && ['menu', 'product_master', 'tables', 'banners', 'discounts'].includes(tabParam)) {
      return tabParam;
    }
    return defaultTab || 'menu';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [searchParams, defaultTab]);

  useEffect(() => {
    const handleTabSwitch = (e: any) => {
      const tab = e.detail?.tab;
      if (tab) setActiveTab(tab);
    };
    window.addEventListener('owner-tab-switch', handleTabSwitch);
    return () => window.removeEventListener('owner-tab-switch', handleTabSwitch);
  }, []);

  return (
    <div className="w-full animate-in fade-in duration-200">
      {activeTab === 'menu' && <MenuView />}
      {activeTab === 'product_master' && <MasterProductView />}
      {activeTab === 'tables' && <TablesView />}
      {activeTab === 'banners' && <BannersView />}
      {activeTab === 'discounts' && <DiscountsView />}
    </div>
  );
}

export default function UnifiedStoreManagerPage({ defaultTab }: UnifiedProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <UnifiedStoreManagerContent defaultTab={defaultTab} />
    </Suspense>
  );
}
