'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

// --- 🎨 Custom Icons ---
const IconBuilding = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
    <path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/>
  </svg>
);
const IconPlus = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconSearch = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconCopy = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IconEdit = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);
const IconCalendar = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconActivity = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconReceipt = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>
  </svg>
);
const IconUser = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconPhone = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconMail = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconCheck = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconClose = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconRefresh = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const IconBox = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

// 🛡️ Safe Product Image with Error Fallback
function SafeProductImage({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <div className={'w-full h-full bg-[#EAEFEA] flex flex-col items-center justify-center text-[#8FAF96] p-1 ' + (className || '')}>
        <IconBox size={22} />
        <span className="text-[9px] font-bold text-[#8FAF96] text-center line-clamp-1 mt-0.5 max-w-[90%]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={'w-full h-full object-cover transition-opacity duration-200 ' + (className || '')}
      loading="lazy"
    />
  );
}

// Type definitions
type OwnerInfo = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  avatar_url?: string | null;
  role: string;
  created_at?: string;
  last_sign_in_at?: string | null;
};

type MemberInfo = {
  id: string;
  full_name: string;
  phone: string;
  avatar_url?: string | null;
  role: string;
  email: string;
};

type StoreProduct = {
  id: string;
  name: string;
  price: number;
  price_special?: number | null;
  price_jumbo?: number | null;
  image_name?: string | null;
  image_url?: string | null;
  category_id?: string | null;
  category_name?: string;
  is_available?: boolean;
  is_recommended?: boolean;
  stock?: number | null;
  options?: any[];
};

type StoreCategory = {
  id: string;
  name: string;
  sort_order?: number;
};

type BrandReport = {
  id: string;
  name: string;
  status: 'trial' | 'active' | 'expired';
  plan: 'free' | 'basic' | 'pro' | 'ultimate';
  created_at: string;
  updated_at: string;
  logo_url?: string;
  slug?: string;
  phone?: string;
  total_coins: number;
  current_theme: string;
  total_banners: number;
  total_categories: number;
  total_tables: number;
  total_discounts: number;
  total_products: number;
  total_orders: number;
  today_orders: number;
  owner?: OwnerInfo | null;
  members_count?: number;
  members?: MemberInfo[];
};

export default function SuperAdminBrands() {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<BrandReport | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Store Products State
  const [viewingProductsBrand, setViewingProductsBrand] = useState<BrandReport | null>(null);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productSearchTerm, setProductSearchTerm] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/brands');
      const json = await res.json();
      if (json.success && json.data) {
        setBrands(json.data);
      } else {
        const { data, error } = await supabase.from('brand_dashboard_report').select('*').order('created_at', { ascending: false });
        if (data) setBrands(data);
        if (error) console.error("Error fetching views:", error);
      }
    } catch (err) {
      console.error("Error in fetchBrands:", err);
      const { data } = await supabase.from('brand_dashboard_report').select('*').order('created_at', { ascending: false });
      if (data) setBrands(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreProducts = async (brand: BrandReport) => {
    setViewingProductsBrand(brand);
    setProductsLoading(true);
    setProductCategoryFilter('all');
    setProductSearchTerm('');
    try {
      const res = await fetch('/api/admin/brands/products?brandId=' + brand.id);
      const json = await res.json();
      if (json.success) {
        setStoreProducts(json.products || []);
        setStoreCategories(json.categories || []);
        // Sync the product count if there is any difference
        if (typeof json.total_count === 'number' && json.total_count !== brand.total_products) {
          setBrands(prev => prev.map(b => b.id === brand.id ? { ...b, total_products: json.total_count } : b));
        }
      } else {
        setStoreProducts([]);
        setStoreCategories([]);
      }
    } catch (err) {
      console.error("Error fetching store products:", err);
      setStoreProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key?: string) => {
    navigator.clipboard.writeText(text);
    if (key) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } else {
      alert('คัดลอกเรียบร้อยแล้ว!');
    }
  };

  const filteredBrands = brands.filter((b) => {
    const term = searchTerm.toLowerCase();
    const matchName = b.name?.toLowerCase().includes(term);
    const matchId = b.id?.toLowerCase().includes(term);
    const matchOwnerName = b.owner?.full_name?.toLowerCase().includes(term);
    const matchOwnerEmail = b.owner?.email?.toLowerCase().includes(term);
    const matchOwnerPhone = b.owner?.phone?.toLowerCase().includes(term);
    return matchName || matchId || matchOwnerName || matchOwnerEmail || matchOwnerPhone;
  });

  const filteredStoreProducts = storeProducts.filter((p) => {
    const matchCat = productCategoryFilter === 'all' || p.category_id === productCategoryFilter || (!p.category_id && productCategoryFilter === 'uncategorized');
    const matchSearch = !productSearchTerm || p.name?.toLowerCase().includes(productSearchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Stats calculation
  const totalStores = brands.length;
  const activeStores = brands.filter((b) => b.status === 'active').length;
  const grandTotalOrders = brands.reduce((sum, b) => sum + (Number(b.total_orders) || 0), 0);
  const totalOrdersToday = brands.reduce((sum, b) => sum + (Number(b.today_orders) || 0), 0);
  const totalOwnersWithProfile = brands.filter((b) => b.owner && b.owner.full_name && b.owner.full_name !== 'ไม่ระบุชื่อ').length;

  return (
    <div className="min-h-screen bg-[#F4F7F4] p-4 md:p-8 font-sans text-[#1E3A27] pb-32">
      <div className="max-w-[1500px] mx-auto">
        
        {/* 🌟 Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-3 bg-[#2C4A34] text-white rounded-2xl shadow-md">
                <IconBuilding size={26} />
              </span>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#2C4A34] tracking-tight">
                  สรุปภาพรวมร้านค้า & เจ้าของร้าน
                </h1>
                <p className="text-[#608367] font-semibold text-xs md:text-sm mt-0.5">
                  Super Admin Portal • ข้อมูลโปรไฟล์เจ้าของร้าน, รายการสินค้าของร้าน และสถิติ Real-time
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={fetchBrands}
              disabled={loading}
              className="p-3.5 bg-white border border-[#D0DDD0] hover:bg-[#E2ECE2] text-[#2C4A34] rounded-2xl font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95 text-sm"
              title="รีเฟรชข้อมูล"
            >
              <span className={loading ? 'animate-spin' : ''}><IconRefresh size={18} /></span>
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>
            <button className="flex-1 md:flex-initial group bg-[#2C4A34] hover:bg-[#3B5E44] text-white px-5 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-[#2C4A34]/20 transition-all active:scale-95 text-sm">
              <span className="bg-white/20 p-1 rounded-lg"><IconPlus size={16} /></span>
              <span>เพิ่มร้านค้าใหม่</span>
            </button>
          </div>
        </div>

        {/* 📊 Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
          <div className="bg-white p-4.5 rounded-2xl border border-[#D0DDD0] shadow-xs">
            <p className="text-[10px] md:text-xs font-bold text-[#8FAF96] uppercase tracking-wider mb-1">ร้านค้าทั้งหมด</p>
            <p className="text-xl md:text-2xl font-black text-[#2C4A34]">{totalStores} <span className="text-xs font-semibold text-[#608367]">ร้าน</span></p>
          </div>
          <div className="bg-white p-4.5 rounded-2xl border border-[#D0DDD0] shadow-xs">
            <p className="text-[10px] md:text-xs font-bold text-[#8FAF96] uppercase tracking-wider mb-1">สถานะ Active</p>
            <p className="text-xl md:text-2xl font-black text-green-700">{activeStores} <span className="text-xs font-semibold text-[#608367]">ร้าน</span></p>
          </div>
          <div className="bg-white p-4.5 rounded-2xl border border-[#D0DDD0] shadow-xs bg-linear-to-br from-white to-[#F4F7F4]">
            <p className="text-[10px] md:text-xs font-bold text-[#5F8565] uppercase tracking-wider mb-1 flex items-center gap-1">
              <IconReceipt size={14} /> ออเดอร์รวมทั้งหมด
            </p>
            <p className="text-xl md:text-2xl font-black text-[#2C4A34]">{grandTotalOrders.toLocaleString()} <span className="text-xs font-semibold text-[#5F8565]">บิล</span></p>
          </div>
          <div className="bg-white p-4.5 rounded-2xl border border-[#D0DDD0] shadow-xs">
            <p className="text-[10px] md:text-xs font-bold text-[#8FAF96] uppercase tracking-wider mb-1 flex items-center gap-1">
              <IconActivity size={14} /> ออเดอร์วันนี้
            </p>
            <p className="text-xl md:text-2xl font-black text-[#5F8565]">{totalOrdersToday.toLocaleString()} <span className="text-xs font-semibold text-[#608367]">บิล</span></p>
          </div>
          <div className="bg-white p-4.5 rounded-2xl border border-[#D0DDD0] shadow-xs col-span-2 md:col-span-1">
            <p className="text-[10px] md:text-xs font-bold text-[#8FAF96] uppercase tracking-wider mb-1">เจ้าของร้านพร้อมโปรไฟล์</p>
            <p className="text-xl md:text-2xl font-black text-[#2C4A34]">{totalOwnersWithProfile} <span className="text-xs font-semibold text-[#608367]">บัญชี</span></p>
          </div>
        </div>

        {/* 🔍 Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#D0DDD0] mb-6 flex items-center gap-3 max-w-2xl">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FAF96]">
              <IconSearch size={20} />
            </div>
            <input 
              type="text" 
              placeholder="ค้นหาชื่อร้าน, ID, ชื่อเจ้าของ, เบอร์โทร, อีเมล..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#F4F7F4] border border-[#D0DDD0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5F8565]/30 transition-all font-medium text-[#2C4A34] text-sm md:text-base placeholder:text-[#8FAF96]"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-[#8FAF96] hover:text-[#2C4A34] font-bold px-2.5 py-1 bg-[#F4F7F4] rounded-lg"
            >
              ล้าง
            </button>
          )}
        </div>

        {/* 📋 Data Table */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-[#D0DDD0] shadow-xs">
            <div className="w-10 h-10 border-4 border-[#5F8565] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#608367] font-black uppercase tracking-widest text-sm">กำลังโหลดข้อมูลร้านค้าและโปรไฟล์เจ้าของร้าน...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-[#D0DDD0] shadow-xs">
            <p className="text-[#8FAF96] font-bold text-base mb-2">ไม่พบข้อมูลร้านค้าที่ค้นหา</p>
            <p className="text-xs text-[#8FAF96]">ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xs border border-[#D0DDD0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#E2ECE2] border-b border-[#D0DDD0] text-[#3B5E44] text-[11px] uppercase tracking-wider font-black">
                    <th className="p-5">ร้านค้า (Brand)</th>
                    <th className="p-5">เจ้าของร้าน & โปรไฟล์ (Owner)</th>
                    <th className="p-5">สถานะ & แพ็กเกจ</th>
                    <th className="p-5">สถิติระบบ & สินค้า</th>
                    <th className="p-5 bg-[#D5E4D5]">ยอดออเดอร์ (รวม / วันนี้)</th>
                    <th className="p-5">วันที่เปิดร้าน</th>
                    <th className="p-5 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2ECE2]">
                  {filteredBrands.map((brand) => {
                    const owner = brand.owner;
                    const ownerInitial = owner?.full_name ? owner.full_name.charAt(0).toUpperCase() : '?';
                    const hasAvatar = !!owner?.avatar_url;
                    const totalOrders = Number(brand.total_orders) || 0;
                    const todayOrders = Number(brand.today_orders) || 0;

                    return (
                      <tr key={brand.id} className="hover:bg-[#F4F7F4]/80 transition-colors group">
                        
                        {/* 1. ข้อมูลร้านค้า */}
                        <td className="p-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-[#DBE6DB] flex items-center justify-center text-lg font-black text-[#5F8565] shadow-inner overflow-hidden shrink-0 border border-[#D0DDD0]/60">
                              {brand.logo_url ? (
                                <img src={brand.logo_url} className="w-full h-full object-cover" alt={brand.name} />
                              ) : (
                                brand.name ? brand.name.charAt(0).toUpperCase() : 'B'
                              )}
                            </div>
                            <div>
                              <h3 className="text-base font-black text-[#2C4A34] leading-tight mb-1">
                                {brand.name || 'ไม่ระบุชื่อร้าน'}
                              </h3>
                              <div 
                                className="flex items-center gap-1.5 cursor-pointer group/copy" 
                                onClick={() => copyToClipboard(brand.id, 'brand-' + brand.id)}
                                title="คลิกเพื่อคัดลอก Brand ID"
                              >
                                <p className="text-[11px] font-mono font-semibold text-[#8FAF96] truncate max-w-[130px] group-hover/copy:text-[#2C4A34]">
                                  {brand.id}
                                </p>
                                <span className="text-[#8FAF96] group-hover/copy:text-[#2C4A34]">
                                  {copiedKey === 'brand-' + brand.id ? <IconCheck size={12} /> : <IconCopy size={12} />}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. เจ้าของร้าน & โปรไฟล์ (Owner Info) */}
                        <td className="p-5">
                          {owner ? (
                            <div 
                              onClick={() => setSelectedBrand(brand)}
                              className="flex items-center gap-3 p-2 -m-2 rounded-2xl hover:bg-white hover:shadow-xs transition-all cursor-pointer group/owner border border-transparent hover:border-[#D0DDD0]/80"
                              title="คลิกเพื่อดูโปรไฟล์เจ้าของร้านแบบละเอียด"
                            >
                              {/* Avatar */}
                              <div className="relative shrink-0">
                                <div className="w-11 h-11 rounded-full bg-[#5F8565] text-white flex items-center justify-center text-base font-bold overflow-hidden shadow-xs ring-2 ring-[#D5E4D5]">
                                  {hasAvatar ? (
                                    <img src={owner.avatar_url!} className="w-full h-full object-cover" alt={owner.full_name} />
                                  ) : (
                                    ownerInitial
                                  )}
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                              </div>

                              {/* Name & Contact */}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-sm font-black text-[#2C4A34] group-hover/owner:text-emerald-800 truncate max-w-[150px]">
                                    {owner.full_name || 'ไม่ระบุชื่อ'}
                                  </p>
                                  <span className="text-[9px] bg-[#E2ECE2] text-[#3B5E44] px-1.5 py-0.5 rounded font-bold uppercase">
                                    Owner
                                  </span>
                                </div>

                                <div className="flex flex-col gap-0.5 mt-0.5 text-xs text-[#608367]">
                                  {owner.phone && owner.phone !== '-' && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[#8FAF96]"><IconPhone size={11} /></span>
                                      <span className="font-mono text-[11px] font-semibold">{owner.phone}</span>
                                    </div>
                                  )}
                                  {owner.email && owner.email !== '-' && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[#8FAF96]"><IconMail size={11} /></span>
                                      <span className="text-[11px] font-medium truncate max-w-[160px]">{owner.email}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-[#8FAF96] font-medium">
                              <span className="w-8 h-8 rounded-full bg-[#E2ECE2] flex items-center justify-center text-[#8FAF96]">
                                <IconUser size={14} />
                              </span>
                              <span>ยังไม่มีข้อมูลเจ้าของ</span>
                            </div>
                          )}
                        </td>

                        {/* 3. สถานะ & แพ็กเกจ */}
                        <td className="p-5">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className={'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ' + (
                              brand.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                              brand.status === 'trial' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                            )}>
                              <span className={'w-1.5 h-1.5 rounded-full ' + (brand.status === 'active' ? 'bg-green-500' : brand.status === 'trial' ? 'bg-amber-500' : 'bg-red-500')}></span>
                              {brand.status}
                            </span>
                            <span className="text-[10px] font-bold text-[#3B5E44] uppercase tracking-wider bg-[#E2ECE2] px-2 py-0.5 rounded-md">
                              {brand.plan || 'Free'}
                            </span>
                          </div>
                        </td>

                        {/* 4. สถิติระบบ & สินค้า (คลิกดูสินค้าได้) */}
                        <td className="p-5">
                          <div className="space-y-1.5">
                            <button
                              onClick={() => fetchStoreProducts(brand)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all group/btn shadow-2xs cursor-pointer"
                              title="คลิกเพื่อดูรายการสินค้าทั้งหมดของร้านนี้"
                            >
                              <IconBox size={13} />
                              <span>สินค้า: <span className="underline decoration-emerald-500 font-black">{brand.total_products || 0}</span> รายการ</span>
                              <span className="text-[10px] text-emerald-600 group-hover/btn:translate-x-0.5 transition-transform">→</span>
                            </button>

                            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] font-semibold text-[#608367]">
                              <p>🪑 โต๊ะ: <span className="font-bold text-[#2C4A34]">{brand.total_tables || 0}</span></p>
                              <p>🏷️ ส่วนลด: <span className="font-bold text-[#2C4A34]">{brand.total_discounts || 0}</span></p>
                              <p>🪙 คอยน์: <span className="font-bold text-[#2C4A34]">{brand.total_coins || 0}</span></p>
                            </div>
                          </div>
                        </td>

                        {/* 5. ยอดออเดอร์ (รวมทั้งหมด / วันนี้) */}
                        <td className="p-5 bg-[#F4F7F4]/60">
                          <div className="flex items-center gap-3">
                            <div className={'p-2.5 rounded-xl ' + (totalOrders > 0 ? 'bg-[#2C4A34] text-white shadow-xs' : 'bg-[#D0DDD0] text-[#608367]')}>
                              <IconReceipt size={18} />
                            </div>
                            <div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-[10px] font-black text-[#8FAF96] uppercase">รวมทั้งหมด:</span>
                                <span className={'text-base font-black ' + (totalOrders > 0 ? 'text-[#2C4A34]' : 'text-[#8FAF96]')}>
                                  {totalOrders.toLocaleString()} <span className="text-xs font-semibold">บิล</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-bold text-[#5F8565] uppercase">วันนี้:</span>
                                <span className={'text-xs font-bold px-1.5 py-0.2 rounded-md ' + (todayOrders > 0 ? 'bg-emerald-100 text-emerald-800' : 'text-[#8FAF96]')}>
                                  {todayOrders > 0 ? todayOrders + ' บิล' : '0 บิล'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 6. วันที่เปิดร้าน */}
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-[#608367] font-medium text-xs">
                            <span className="text-[#8FAF96]"><IconCalendar size={14} /></span>
                            {formatDate(brand.created_at)}
                          </div>
                        </td>

                        {/* 7. จัดการ (Action) */}
                        <td className="p-5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => fetchStoreProducts(brand)}
                              className="px-2.5 py-2 bg-emerald-50 hover:bg-[#2C4A34] hover:text-white text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                              title="ดูรายการสินค้าของร้าน"
                            >
                              <IconBox size={13} />
                              <span>ดูสินค้า</span>
                            </button>
                            <button 
                              onClick={() => setSelectedBrand(brand)}
                              className="px-2.5 py-2 bg-[#E2ECE2] hover:bg-[#2C4A34] hover:text-white text-[#2C4A34] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                              title="ดูรายละเอียดโปรไฟล์เจ้าของร้าน"
                            >
                              <IconUser size={13} />
                              <span>โปรไฟล์</span>
                            </button>
                            <button className="p-2 bg-[#F4F7F4] text-[#608367] rounded-xl hover:bg-[#2C4A34] hover:text-white transition-all shadow-xs" title="แก้ไขข้อมูล">
                              <IconEdit size={14} />
                            </button>
                            <button className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-xs" title="ลบข้อมูล">
                              <IconTrash size={14} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* 🛍️ Store Products Modal */}
      {viewingProductsBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF9F6] border border-[#D0DDD0] rounded-3xl max-w-4xl w-full p-5 md:p-8 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-[#E2ECE2] shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-[#5F8565] text-white flex items-center justify-center text-xl font-black shadow-md overflow-hidden shrink-0">
                  {viewingProductsBrand.logo_url ? (
                    <img src={viewingProductsBrand.logo_url} className="w-full h-full object-cover" alt={viewingProductsBrand.name} />
                  ) : (
                    viewingProductsBrand.name ? viewingProductsBrand.name.charAt(0).toUpperCase() : 'B'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-black text-[#2C4A34]">
                      {viewingProductsBrand.name}
                    </h2>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">
                      {viewingProductsBrand.plan}
                    </span>
                  </div>
                  <p className="text-xs text-[#608367] font-semibold mt-0.5 flex items-center gap-2">
                    <span>รายการสินค้าในร้าน ({storeProducts.length} รายการ)</span>
                    <span className="text-[#D0DDD0]">•</span>
                    <span className="font-mono text-[11px] text-[#8FAF96]">ID: {viewingProductsBrand.id}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingProductsBrand(null)}
                className="p-2 rounded-xl bg-white border border-[#D0DDD0] text-[#608367] hover:text-[#2C4A34] hover:bg-[#E2ECE2] transition-colors"
              >
                <IconClose size={18} />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="py-4 space-y-3 shrink-0 border-b border-[#E2ECE2]">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FAF96]">
                    <IconSearch size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อสินค้าในร้านนี้..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-[#D0DDD0] rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5F8565]/30 text-[#2C4A34]"
                  />
                </div>

                <div className="text-xs text-[#608367] font-bold self-center">
                  พบ <span className="text-[#2C4A34] font-black">{filteredStoreProducts.length}</span> จาก {storeProducts.length} สินค้า
                </div>
              </div>

              {/* Category Pills */}
              {storeCategories.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  <button
                    onClick={() => setProductCategoryFilter('all')}
                    className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ' + (
                      productCategoryFilter === 'all'
                        ? 'bg-[#2C4A34] text-white shadow-xs'
                        : 'bg-white text-[#608367] border border-[#D0DDD0] hover:bg-[#E2ECE2]'
                    )}
                  >
                    ทั้งหมด ({storeProducts.length})
                  </button>
                  {storeCategories.map((cat) => {
                    const count = storeProducts.filter(p => p.category_id === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setProductCategoryFilter(cat.id)}
                        className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ' + (
                          productCategoryFilter === cat.id
                            ? 'bg-[#2C4A34] text-white shadow-xs'
                            : 'bg-white text-[#608367] border border-[#D0DDD0] hover:bg-[#E2ECE2]'
                        )}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Products List / Grid Container */}
            <div className="flex-1 overflow-y-auto py-4">
              {productsLoading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-3 border-[#5F8565] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs font-bold text-[#608367]">กำลังดึงรายการสินค้าของร้าน {viewingProductsBrand.name}...</p>
                </div>
              ) : filteredStoreProducts.length === 0 ? (
                <div className="py-16 text-center text-[#8FAF96]">
                  <p className="font-bold text-sm">ไม่พบรายการสินค้าในหมวดหมู่นี้</p>
                  <p className="text-xs mt-1">ร้านค้านี้ยังไม่มีสินค้า หรือไม่ตรงกับคำค้นหา</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredStoreProducts.map((p) => {
                    const img = p.image_url || p.image_name;
                    return (
                      <div
                        key={p.id}
                        className="bg-white p-3.5 rounded-2xl border border-[#E2ECE2] shadow-2xs hover:shadow-sm hover:border-[#5F8565]/40 transition-all flex gap-3.5 items-center"
                      >
                        {/* Image Container with Safe Fallback */}
                        <div className="w-16 h-16 rounded-xl bg-[#F4F7F4] overflow-hidden shrink-0 border border-[#E2ECE2]">
                          <SafeProductImage src={img} alt={p.name} />
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black text-[#2C4A34] truncate" title={p.name}>
                            {p.name}
                          </h4>
                          
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] bg-[#F4F7F4] text-[#608367] px-2 py-0.5 rounded-md font-semibold border border-[#D0DDD0]/60 truncate max-w-[130px]">
                              {p.category_name || 'ทั่วไป'}
                            </span>
                            {p.is_recommended && (
                              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded font-bold">
                                แนะนำ
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline justify-between mt-2">
                            <p className="text-base font-black text-[#2C4A34]">
                              ฿{Number(p.price || 0).toLocaleString()}
                            </p>
                            {p.is_available === false ? (
                              <span className="text-[10px] text-red-500 font-bold">หมด/ปิดขาย</span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-bold">พร้อมขาย</span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[#E2ECE2] flex items-center justify-between shrink-0">
              <p className="text-xs text-[#8FAF96] font-medium">
                ร้าน: <span className="font-bold text-[#2C4A34]">{viewingProductsBrand.name}</span> • ทั้งหมด {storeProducts.length} รายการ
              </p>
              <button
                onClick={() => setViewingProductsBrand(null)}
                className="px-5 py-2 rounded-xl bg-[#2C4A34] hover:bg-[#3B5E44] text-white font-bold text-xs transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 👤 Owner Profile Details Modal */}
      {selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF9F6] border border-[#D0DDD0] rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedBrand(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white border border-[#D0DDD0] text-[#608367] hover:text-[#2C4A34] hover:bg-[#E2ECE2] transition-colors"
            >
              <IconClose size={18} />
            </button>

            {/* Header / Profile Hero */}
            <div className="flex items-center gap-5 pb-6 border-b border-[#E2ECE2]">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-[#5F8565] text-white flex items-center justify-center text-3xl font-black shadow-md overflow-hidden ring-4 ring-white">
                  {selectedBrand.owner?.avatar_url ? (
                    <img src={selectedBrand.owner.avatar_url} className="w-full h-full object-cover" alt="owner" />
                  ) : (
                    selectedBrand.owner?.full_name ? selectedBrand.owner.full_name.charAt(0).toUpperCase() : '?'
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-xs">
                  Owner
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black text-[#2C4A34]">
                    {selectedBrand.owner?.full_name || 'ไม่ระบุชื่อเจ้าของร้าน'}
                  </h2>
                </div>
                <p className="text-xs text-[#608367] font-semibold mt-0.5">
                  เจ้าของร้าน: <span className="font-bold text-[#2C4A34]">{selectedBrand.name}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={'text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ' + (
                    selectedBrand.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  )}>
                    {selectedBrand.status}
                  </span>
                  <span className="text-[10px] font-bold bg-[#E2ECE2] text-[#3B5E44] px-2 py-0.5 rounded-md uppercase">
                    Plan: {selectedBrand.plan}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Contact Details */}
            <div className="py-5 space-y-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#8FAF96]">ข้อมูลติดต่อเจ้าของร้าน</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Email */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#E2ECE2] shadow-xs flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-[#8FAF96] uppercase flex items-center gap-1">
                      <IconMail size={12} /> อีเมล (Email)
                    </p>
                    <p className="text-sm font-semibold text-[#2C4A34] truncate mt-0.5">
                      {selectedBrand.owner?.email || '-'}
                    </p>
                  </div>
                  {selectedBrand.owner?.email && selectedBrand.owner.email !== '-' && (
                    <button
                      onClick={() => copyToClipboard(selectedBrand.owner!.email, 'owner-email')}
                      className="p-2 text-[#8FAF96] hover:text-[#2C4A34] bg-[#F4F7F4] rounded-xl hover:bg-[#E2ECE2] transition-colors shrink-0 ml-2"
                      title="คัดลอกอีเมล"
                    >
                      {copiedKey === 'owner-email' ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    </button>
                  )}
                </div>

                {/* Phone */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#E2ECE2] shadow-xs flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-[#8FAF96] uppercase flex items-center gap-1">
                      <IconPhone size={12} /> เบอร์โทรศัพท์ (Phone)
                    </p>
                    <p className="text-sm font-semibold text-[#2C4A34] font-mono mt-0.5">
                      {selectedBrand.owner?.phone || selectedBrand.phone || '-'}
                    </p>
                  </div>
                  {(selectedBrand.owner?.phone || selectedBrand.phone) && (
                    <button
                      onClick={() => copyToClipboard(selectedBrand.owner?.phone || selectedBrand.phone || '', 'owner-phone')}
                      className="p-2 text-[#8FAF96] hover:text-[#2C4A34] bg-[#F4F7F4] rounded-xl hover:bg-[#E2ECE2] transition-colors shrink-0 ml-2"
                      title="คัดลอกเบอร์โทร"
                    >
                      {copiedKey === 'owner-phone' ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    </button>
                  )}
                </div>

              </div>

              {/* User UID & Brand ID */}
              <div className="bg-white p-4 rounded-2xl border border-[#E2ECE2] shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#8FAF96] font-bold uppercase text-[10px] block">User UID (Auth ID)</span>
                    <span className="font-mono text-xs font-semibold text-[#2C4A34]">
                      {selectedBrand.owner?.id || 'ไม่มีข้อมูล ID'}
                    </span>
                  </div>
                  {selectedBrand.owner?.id && (
                    <button
                      onClick={() => copyToClipboard(selectedBrand.owner!.id, 'owner-id')}
                      className="p-1.5 text-[#8FAF96] hover:text-[#2C4A34] bg-[#F4F7F4] rounded-lg hover:bg-[#E2ECE2]"
                      title="คัดลอก User ID"
                    >
                      {copiedKey === 'owner-id' ? <IconCheck size={12} /> : <IconCopy size={12} />}
                    </button>
                  )}
                </div>

                <div className="h-[1px] bg-[#E2ECE2]"></div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#8FAF96] font-bold uppercase text-[10px] block">Brand ID (Store UUID)</span>
                    <span className="font-mono text-xs font-semibold text-[#2C4A34]">
                      {selectedBrand.id}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedBrand.id, 'modal-brand-id')}
                    className="p-1.5 text-[#8FAF96] hover:text-[#2C4A34] bg-[#F4F7F4] rounded-lg hover:bg-[#E2ECE2]"
                    title="คัดลอก Brand ID"
                  >
                    {copiedKey === 'modal-brand-id' ? <IconCheck size={12} /> : <IconCopy size={12} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Shop Overview Stats (รวมออเดอร์ทั้งหมด + วันนี้) */}
            <div className="py-4 border-t border-[#E2ECE2]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#8FAF96]">สรุปข้อมูลร้านค้า & ยอดขาย</h3>
                <button
                  onClick={() => {
                    const b = selectedBrand;
                    setSelectedBrand(null);
                    fetchStoreProducts(b);
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <IconBox size={13} />
                  <span>ดูรายการสินค้าทั้งหมด ({selectedBrand.total_products || 0})</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-center">
                <div className="bg-white p-3 rounded-2xl border border-[#E2ECE2] shadow-xs">
                  <p className="text-[10px] font-bold text-[#8FAF96] uppercase">ออเดอร์รวมทั้งหมด</p>
                  <p className="text-lg font-black text-[#2C4A34] mt-0.5">{(Number(selectedBrand.total_orders) || 0).toLocaleString()} <span className="text-xs font-bold text-[#608367]">บิล</span></p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#E2ECE2] shadow-xs">
                  <p className="text-[10px] font-bold text-[#8FAF96] uppercase">ออเดอร์วันนี้</p>
                  <p className="text-lg font-black text-[#5F8565] mt-0.5">{(Number(selectedBrand.today_orders) || 0).toLocaleString()} <span className="text-xs font-bold text-[#608367]">บิล</span></p>
                </div>
                <div 
                  onClick={() => {
                    const b = selectedBrand;
                    setSelectedBrand(null);
                    fetchStoreProducts(b);
                  }}
                  className="bg-white p-3 rounded-2xl border border-[#E2ECE2] shadow-xs hover:border-emerald-400 cursor-pointer transition-all group/prod"
                  title="คลิกเพื่อเปิดดูสินค้า"
                >
                  <p className="text-[10px] font-bold text-[#8FAF96] uppercase group-hover/prod:text-emerald-700">สินค้าทั้งหมด ↗</p>
                  <p className="text-lg font-black text-[#2C4A34] mt-0.5 group-hover/prod:text-emerald-700">{selectedBrand.total_products || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#E2ECE2] shadow-xs">
                  <p className="text-[10px] font-bold text-[#8FAF96] uppercase">จำนวนโต๊ะ</p>
                  <p className="text-lg font-black text-[#2C4A34] mt-0.5">{selectedBrand.total_tables || 0}</p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-3 border-t border-[#E2ECE2] flex flex-wrap justify-between items-center text-[11px] text-[#8FAF96] font-medium">
              <p>เปิดร้านเมื่อ: <span className="font-semibold text-[#608367]">{formatDate(selectedBrand.created_at)}</span></p>
              {selectedBrand.owner?.last_sign_in_at && (
                <p>เข้าสู่ระบบล่าสุด: <span className="font-semibold text-[#608367]">{formatDateTime(selectedBrand.owner.last_sign_in_at)}</span></p>
              )}
            </div>

            {/* Footer Action */}
            <div className="mt-6 flex justify-between items-center gap-3">
              <button
                onClick={() => {
                  const b = selectedBrand;
                  setSelectedBrand(null);
                  fetchStoreProducts(b);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#2C4A34] hover:bg-[#3B5E44] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <IconBox size={14} />
                <span>เปิดดูสินค้าของร้านนี้</span>
              </button>
              <button
                onClick={() => setSelectedBrand(null)}
                className="px-6 py-2.5 rounded-xl bg-[#E2ECE2] hover:bg-[#D0DDD0] text-[#2C4A34] font-bold text-xs transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
