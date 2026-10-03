'use client';

import { useState, useEffect, useRef } from 'react';

// รายการร้านทดสอบที่ปลอดภัย
const TEST_STORES = [
  {
    id: '9fd8c2f8-cc19-4869-8ea0-f1df2e314a13',
    name: 'h',
    desc: 'ร้านทดสอบหลักที่นายใช้เทสกดซื้อ GO / In-App Purchase',
    icon: '🍽️',
    badge: 'ร้านทดสอบหลัก (h)',
    isDefault: true,
  },
  {
    id: 'ef5af840-e267-42e3-a965-ff931e617df0',
    name: 'นอนน',
    desc: 'ร้านที่ใช้เปิดใน iPhone Simulator ก่อนหน้านี้',
    icon: '📱',
    badge: 'ร้านสำรอง (นอนน)',
    isDefault: false,
  },
];

const DURATION_OPTIONS = [
  { label: '5 นาที (เทสด่วน)', minutes: 5 },
  { label: '15 นาที', minutes: 15 },
  { label: '1 ชั่วโมง', minutes: 60 },
  { label: '1 วัน (24 ชม.)', minutes: 1440 },
  { label: '30 วัน (1 เดือน)', minutes: 43200 },
];

type BrandInfo = {
  id: string;
  name: string;
  slug?: string;
  plan: string;
  effectivePlan: string;
  activeExpiry: string | null;
  remainingSeconds: number;
  expiry_go?: string | null;
  expiry_basic?: string | null;
  expiry_pro?: string | null;
  expiry_ultimate?: string | null;
  updated_at?: string;
};

type RevenueCatInfo = {
  status: 'found' | 'not_found' | 'error' | 'no_key';
  message?: string;
  entitlements: Array<{
    key: string;
    isActive: boolean;
    expiresDate: string | null;
    purchaseDate: string | null;
    productId: string | null;
  }>;
  subscriptions: Array<{
    productId: string;
    isActive: boolean;
    expiresDate: string | null;
    purchaseDate: string | null;
    store: string | null;
    periodType: string | null;
  }>;
  activeEntitlementsCount: number;
  lastSeen?: string;
};

export default function AdminTestPlanPage() {
  const [selectedBrandId, setSelectedBrandId] = useState<string>(TEST_STORES[0].id);
  const [customBrandId, setCustomBrandId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [brand, setBrand] = useState<BrandInfo | null>(null);
  const [rcInfo, setRcInfo] = useState<RevenueCatInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ดึงข้อมูลร้านค้าทดสอบและ RevenueCat
  const fetchBrandData = async (brandId = selectedBrandId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/brands/test-plan?brandId=${encodeURIComponent(brandId)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success && data.brand) {
        setBrand(data.brand);
        setSecondsLeft(data.brand.remainingSeconds || 0);
        setRcInfo(data.revenueCat || null);
        setNowTimestamp(Date.now());
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'ไม่สามารถโหลดข้อมูลร้านค้านี้ได้' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandData(selectedBrandId);
  }, [selectedBrandId]);

  // นับถอยหลังแบบเรียลไทม์ทุก 1 วินาที (ทั้ง Cloud และ RevenueCat)
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setNowTimestamp(Date.now());
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // จัดการการรีเซ็ตหรือล้างข้อมูล
  const handleResetAction = async (action: 'reset_all' | 'reset_revenuecat' | 'reset_cloud') => {
    const confirmText =
      action === 'reset_all'
        ? `ต้องการ "ล้างทั้ง RevenueCat และ Cloud" ของร้าน "${brand?.name || selectedBrandId}" หรือไม่?\n\nข้อมูลใน RevenueCat จะถูกลบ และแพลนใน Cloud จะถูกปรับเป็น Free ทันที เพื่อให้พร้อมเทสกดซื้อใหม่`
        : action === 'reset_revenuecat'
        ? `ต้องการลบ Subscriber ใน RevenueCat ของร้านนี้หรือไม่?`
        : `ต้องการรีเซ็ตสถานะร้านใน Cloud Database เป็น Free หรือไม่?`;

    if (!window.confirm(confirmText)) return;

    setActionLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/brands/test-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: selectedBrandId,
          action,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg({
          type: 'success',
          text: data.message || 'ดำเนินการสำเร็จเรียบร้อยแล้ว!',
        });
        await fetchBrandData(selectedBrandId);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'การดำเนินการไม่สำเร็จ' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' });
    } finally {
      setActionLoading(false);
    }
  };

  // สลับแพลนจำลอง (Simulator)
  const handleSwitchPlan = async (targetPlan: 'free' | 'go' | 'basic' | 'pro' | 'ultimate') => {
    setActionLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/brands/test-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: selectedBrandId,
          action: 'switch_plan',
          plan: targetPlan,
          durationMinutes: durationMinutes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg({
          type: 'success',
          text: data.message || 'เปลี่ยนแพลนเรียบร้อยแล้ว!',
        });
        await fetchBrandData(selectedBrandId);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'เปลี่ยนแพลนไม่สำเร็จ' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' });
    } finally {
      setActionLoading(false);
    }
  };

  // นำทางไปยัง Custom Brand ID
  const handleApplyCustomBrand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customBrandId.trim();
    if (!trimmed) return;
    setSelectedBrandId(trimmed);
  };

  // แปลงวินาทีเป็น วัน ชม. นาที วินาที แบบละเอียด
  const formatCountdown = (totalSecs: number) => {
    if (totalSecs <= 0) return 'หมดอายุแล้ว (0 วินาที)';
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (days > 0) {
      return `${days} วัน ${hours} ชม. ${mins} นาที ${secs} วินาที`;
    }
    if (hours > 0) {
      return `${hours} ชม. ${mins} นาที ${secs} วินาที (${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')})`;
    }
    return `${mins} นาที ${secs} วินาที (${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')})`;
  };

  const getEntitlementCountdown = (expiresDateStr: string | null) => {
    if (!expiresDateStr) return null;
    const expiryTime = new Date(expiresDateStr).getTime();
    const diffSecs = Math.max(0, Math.floor((expiryTime - nowTimestamp) / 1000));
    return {
      diffSecs,
      isExpired: diffSecs <= 0,
      text: formatCountdown(diffSecs),
      timeString: new Date(expiresDateStr).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      dateString: new Date(expiresDateStr).toLocaleDateString('th-TH'),
    };
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'null';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('th-TH')} ${d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} น.`;
  };

  const planCards = [
    {
      key: 'free' as const,
      name: 'Free Plan',
      badge: 'ฟรีตลอดชีพ',
      desc: '300 บิล/ด., 50 เมนู, 10 โต๊ะ, 1 พนักงาน',
      btnText: '🔄 ปรับเป็น Free',
      borderColor: 'border-gray-300 hover:border-gray-500',
      activeBorder: 'border-gray-800 bg-gray-50 ring-2 ring-gray-400/20',
      btnColor: 'bg-gray-800 hover:bg-gray-900',
      tagColor: 'bg-gray-100 text-gray-700',
    },
    {
      key: 'go' as const,
      name: 'Go Plan',
      badge: '99 บ./ด.',
      desc: '1,000 บิล/ด., เมนูไม่จำกัด, โต๊ะไม่จำกัด, 1 พนักงาน',
      btnText: `⚡ เปลี่ยนเป็น Go (${durationMinutes >= 1440 ? `${durationMinutes/1440} วัน` : durationMinutes >= 60 ? `${durationMinutes/60} ชม.` : `${durationMinutes} นาที`})`,
      borderColor: 'border-teal-300 hover:border-teal-500',
      activeBorder: 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20',
      btnColor: 'bg-teal-600 hover:bg-teal-700',
      tagColor: 'bg-teal-100 text-teal-800',
    },
    {
      key: 'basic' as const,
      name: 'Basic Plan',
      badge: '199 บ./ด.',
      desc: 'บิลไม่จำกัด, เมนูไม่จำกัด, โต๊ะไม่จำกัด, 1 พนักงาน',
      btnText: `💼 เปลี่ยนเป็น Basic (${durationMinutes >= 1440 ? `${durationMinutes/1440} วัน` : durationMinutes >= 60 ? `${durationMinutes/60} ชม.` : `${durationMinutes} นาที`})`,
      borderColor: 'border-blue-300 hover:border-blue-500',
      activeBorder: 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20',
      btnColor: 'bg-blue-600 hover:bg-blue-700',
      tagColor: 'bg-blue-100 text-blue-800',
    },
    {
      key: 'pro' as const,
      name: 'Pro Plan',
      badge: '399 บ./ด.',
      desc: 'บิลไม่จำกัด, พนักงาน 3 คน, Dashboard ขั้นสูง, Excel Export',
      btnText: `👑 เปลี่ยนเป็น Pro (${durationMinutes >= 1440 ? `${durationMinutes/1440} วัน` : durationMinutes >= 60 ? `${durationMinutes/60} ชม.` : `${durationMinutes} นาที`})`,
      borderColor: 'border-purple-300 hover:border-purple-500',
      activeBorder: 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20',
      btnColor: 'bg-purple-600 hover:bg-purple-700',
      tagColor: 'bg-purple-100 text-purple-800',
    },
    {
      key: 'ultimate' as const,
      name: 'Ultimate Plan',
      badge: 'สูงสุด 100%',
      desc: 'ปลดล็อกทุกสิทธิ์ 100%, พนักงานไม่จำกัด, ธีมพรีเมียม',
      btnText: `💎 เปลี่ยนเป็น Ultimate (${durationMinutes >= 1440 ? `${durationMinutes/1440} วัน` : durationMinutes >= 60 ? `${durationMinutes/60} ชม.` : `${durationMinutes} นาที`})`,
      borderColor: 'border-amber-300 hover:border-amber-500',
      activeBorder: 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20',
      btnColor: 'bg-amber-600 hover:bg-amber-700',
      tagColor: 'bg-amber-100 text-amber-900',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F4] p-4 md:p-8 font-sans text-[#1E3A27] pb-32">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 🌟 Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#D0DDD0] shadow-xs">
          <div className="flex items-center gap-3.5">
            <span className="p-3 bg-gradient-to-br from-amber-500 to-rose-500 text-white rounded-2xl shadow-md text-2xl">
              🧹
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#2C4A34] tracking-tight">
                ศูนย์จัดการแพลน & รีเซ็ตทดสอบ (Plan & RevenueCat Manager)
              </h1>
              <p className="text-[#608367] text-xs font-semibold mt-0.5">
                ตรวจสอบสถานะสด ล้างข้อมูล RevenueCat + Cloud เป็น 0 เพื่อเทสกดซื้อใหม่ และจำลองสลับแพลน
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchBrandData()}
            disabled={loading || actionLoading}
            className="px-4 py-2.5 bg-[#E2ECE2] hover:bg-[#2C4A34] hover:text-white text-[#2C4A34] rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            title="รีเฟรชข้อมูลล่าสุด"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>รีเฟรชสถานะ</span>
          </button>
        </div>

        {/* 📢 Status Message Alert */}
        {statusMsg && (
          <div
            className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between gap-3 shadow-xs animate-in fade-in ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : statusMsg.type === 'warning'
                ? 'bg-amber-50 border-amber-400 text-amber-950'
                : 'bg-rose-50 border-rose-400 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">
                {statusMsg.type === 'success' ? '✅' : statusMsg.type === 'warning' ? '⚠️' : '❌'}
              </span>
              <span>{statusMsg.text}</span>
            </div>
            <button
              onClick={() => setStatusMsg(null)}
              className="text-xs px-2 py-1 rounded-md opacity-60 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* 🏬 Step 1: เลือกร้านค้าทดสอบ (Store Selector) */}
        <div className="bg-white rounded-3xl p-6 border border-[#D0DDD0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#2C4A34] uppercase tracking-wider flex items-center gap-2">
              <span>🏪</span>
              <span>ขั้นตอนที่ 1: เลือกร้านค้าที่ต้องการจัดการ / ทดสอบ</span>
            </h3>
            <span className="text-[11px] font-bold text-[#8FAF96]">
              เลือกร้านด่วน หรือ ระบุ Brand ID
            </span>
          </div>

          {/* Quick Select Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {TEST_STORES.map((s) => {
              const isSelected = selectedBrandId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedBrandId(s.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-[#2C4A34] bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-[#E2ECE2] bg-[#FAF9F5] hover:border-[#8FAF96]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <h4 className="font-black text-sm text-[#2C4A34] flex items-center gap-2">
                          <span>ร้าน &ldquo;{s.name}&rdquo;</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-[#E2ECE2] text-[#2C4A34]'
                          }`}>
                            {s.badge}
                          </span>
                        </h4>
                        <p className="text-[11px] text-[#608367] mt-0.5">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => setSelectedBrandId(s.id)}
                      className="mt-1 h-4 w-4 text-[#2C4A34] accent-[#2C4A34] cursor-pointer"
                    />
                  </div>

                  <div className="text-[10px] font-mono text-[#8FAF96] truncate bg-white px-2.5 py-1 rounded-lg border border-[#E2ECE2]">
                    ID: {s.id}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Brand ID Input */}
          <form onSubmit={handleApplyCustomBrand} className="pt-2 border-t border-[#EFECE6] flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              placeholder="หรือพิมพ์ Brand ID อื่นๆ ที่ต้องการทดสอบ (UUID)..."
              value={customBrandId}
              onChange={(e) => setCustomBrandId(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#D0DDD0] text-xs font-mono text-[#2C4A34] focus:outline-hidden focus:ring-2 focus:ring-[#2C4A34] bg-[#FAF9F5]"
            />
            <button
              type="submit"
              disabled={!customBrandId.trim() || loading}
              className="px-5 py-2.5 bg-[#2C4A34] text-white rounded-xl text-xs font-bold hover:bg-[#1E3A27] transition-all cursor-pointer disabled:opacity-50"
            >
              🔍 โหลดข้อมูลร้านนี้
            </button>
          </form>
        </div>

        {/* 📊 Status Overview Grid (2 Columns: Cloud vs RevenueCat) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* ☁️ Column 1: Cloud Database (Supabase) */}
          <div className="bg-white rounded-3xl p-6 border border-[#D0DDD0] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE2]">
              <div className="flex items-center gap-2">
                <span className="text-xl">☁️</span>
                <div>
                  <h3 className="text-sm font-black text-[#2C4A34]">
                    สถานะใน Cloud Database (Supabase)
                  </h3>
                  <p className="text-[11px] text-[#8FAF96]">
                    ข้อมูลสิทธิ์และโควต้าที่แอป POS ใช้อ้างอิงจริง
                  </p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide border shadow-xs ${
                brand?.effectivePlan === 'free'
                  ? 'bg-gray-100 text-gray-800 border-gray-300'
                  : brand?.effectivePlan === 'go'
                  ? 'bg-teal-100 text-teal-900 border-teal-300'
                  : brand?.effectivePlan === 'basic'
                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                  : brand?.effectivePlan === 'pro'
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                {brand?.effectivePlan ? brand.effectivePlan.toUpperCase() : 'FREE'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#608367] font-semibold">ชื่อร้านค้า:</span>
                <span className="font-bold text-[#2C4A34]">{brand?.name || 'กำลังโหลด...'}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-[#608367] font-semibold">แพลนใน DB (brands.plan):</span>
                <span className="font-mono font-bold text-[#2C4A34] uppercase">{brand?.plan || 'free'}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-[#608367] font-semibold">เวลาคงเหลือ:</span>
                {brand?.effectivePlan !== 'free' && secondsLeft > 0 ? (
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 animate-pulse">
                    ⏱️ {formatCountdown(secondsLeft)}
                  </span>
                ) : (
                  <span className="text-gray-500 font-semibold">ไม่มี (Free 0 วัน)</span>
                )}
              </div>

              {brand?.activeExpiry && brand.effectivePlan !== 'free' && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#608367] font-semibold">วันหมดอายุ:</span>
                  <span className="font-medium text-[#2C4A34]">
                    {new Date(brand.activeExpiry).toLocaleString('th-TH')}
                  </span>
                </div>
              )}

              {/* Database Expiry Columns Breakdown */}
              <div className="pt-3 border-t border-[#EFECE6] space-y-1.5">
                <span className="text-[10px] font-black uppercase text-[#8FAF96]">
                  คอลัมน์วันหมดอายุใน Database:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className={`p-2 rounded-lg border ${brand?.expiry_go ? 'bg-teal-50 border-teal-300 text-teal-900' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <div className="font-bold">expiry_go:</div>
                    <div className="truncate text-[10px]">{formatDateTime(brand?.expiry_go)}</div>
                  </div>
                  <div className={`p-2 rounded-lg border ${brand?.expiry_basic ? 'bg-blue-50 border-blue-300 text-blue-900' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <div className="font-bold">expiry_basic:</div>
                    <div className="truncate text-[10px]">{formatDateTime(brand?.expiry_basic)}</div>
                  </div>
                  <div className={`p-2 rounded-lg border ${brand?.expiry_pro ? 'bg-purple-50 border-purple-300 text-purple-900' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <div className="font-bold">expiry_pro:</div>
                    <div className="truncate text-[10px]">{formatDateTime(brand?.expiry_pro)}</div>
                  </div>
                  <div className={`p-2 rounded-lg border ${brand?.expiry_ultimate ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <div className="font-bold">expiry_ultimate:</div>
                    <div className="truncate text-[10px]">{formatDateTime(brand?.expiry_ultimate)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🐱 Column 2: RevenueCat (App Store / Google Play Sandbox) */}
          <div className="bg-white rounded-3xl p-6 border border-[#D0DDD0] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE2]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐱</span>
                <div>
                  <h3 className="text-sm font-black text-[#2C4A34]">
                    สถานะใน RevenueCat (Store Sandbox)
                  </h3>
                  <p className="text-[11px] text-[#8FAF96]">
                    ประวัติการซื้อใน App Store / Google Play
                  </p>
                </div>
              </div>

              {rcInfo?.status === 'not_found' ? (
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✨ สะอาด (0 รายการ)
                </span>
              ) : (rcInfo?.activeEntitlementsCount || 0) > 0 ? (
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                  ⚠️ Active {rcInfo?.activeEntitlementsCount} รายการ
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-300">
                  หมดอายุแล้ว
                </span>
              )}
            </div>

            <div className="space-y-3">
              {rcInfo?.status === 'not_found' ? (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <span>✅</span>
                    <span>ไม่พบประวัติ Subscriber ใน RevenueCat</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    ร้านค้านี้ไม่มีข้อมูลการซื้อค้างอยู่ใน RevenueCat เลย สะอาด 100% พร้อมสำหรับเปิดแอปแล้วเทสกดซื้อใหม่ได้ทันทีครับนาย!
                  </p>
                </div>
              ) : rcInfo?.status === 'error' ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900">
                  <div className="font-bold">⚠️ RevenueCat แจ้งเตือน:</div>
                  <p className="text-[11px] mt-1">{rcInfo.message}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Entitlements List */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#8FAF96]">
                      Entitlements ใน RevenueCat (นับถอยหลังสด):
                    </span>
                    {rcInfo?.entitlements && rcInfo.entitlements.length > 0 ? (
                      <div className="mt-1 space-y-2">
                        {rcInfo.entitlements.map((e) => {
                          const countdown = getEntitlementCountdown(e.expiresDate);
                          const isCurrentlyActive = countdown ? !countdown.isExpired : e.isActive;

                          return (
                            <div
                              key={e.key}
                              className={`p-3 rounded-2xl border text-xs transition-all ${
                                isCurrentlyActive
                                  ? 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-xs'
                                  : 'bg-gray-50 border-gray-200 text-gray-500'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${isCurrentlyActive ? 'bg-rose-500 animate-pulse' : 'bg-gray-400'}`} />
                                  <span className="font-black uppercase font-mono text-sm">{e.key}</span>
                                  <span className="text-[11px] opacity-75 font-mono">({e.productId})</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isCurrentlyActive ? 'bg-rose-200 text-rose-900' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {isCurrentlyActive ? 'Active (ใช้งานอยู่)' : 'Expired (หมดอายุแล้ว)'}
                                </span>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] pt-1.5 border-t border-rose-200/50">
                                {isCurrentlyActive && countdown ? (
                                  <>
                                    <div className="font-bold text-rose-700 flex items-center gap-1.5">
                                      <span>⏱️ เหลือเวลา:</span>
                                      <span className="font-mono text-xs bg-white text-rose-600 px-2 py-0.5 rounded-md border border-rose-300 shadow-2xs font-black">
                                        {countdown.text}
                                      </span>
                                    </div>
                                    <div className="text-[#608367] text-[10px]">
                                      หมดอายุ: {countdown.dateString} เวลา {countdown.timeString} น.
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-gray-500 text-[11px]">
                                    หมดอายุแล้วเมื่อ: {countdown ? `${countdown.dateString} เวลา ${countdown.timeString} น.` : '-'}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">ไม่มี Entitlements</p>
                    )}
                  </div>

                  {/* Subscriptions List */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#8FAF96]">
                      Subscriptions ที่ซื้อไว้:
                    </span>
                    {rcInfo?.subscriptions && rcInfo.subscriptions.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {rcInfo.subscriptions.map((s) => (
                          <span
                            key={s.productId}
                            className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#D0DDD0] text-[11px] font-mono text-[#2C4A34]"
                          >
                            {s.productId} ({s.store || 'store'})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">ไม่มีประวัติการซื้อ</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🧹 SPECIAL SECTION: ปุ่มล้างข้อมูลสำหรับเทสกดซื้อ (Reset & Purge Actions) */}
        <div className="bg-gradient-to-br from-rose-50/80 via-white to-amber-50/80 rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-200/60">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧹</span>
              <div>
                <h3 className="text-lg font-black text-[#2C4A34]">
                  ล้างข้อมูลแพลนเพื่อเทสกดซื้อ (Purge / Reset)
                </h3>
                <p className="text-xs text-[#608367] font-medium mt-0.5">
                  เมื่อกดล้างแล้ว ทั้งใน RevenueCat และ Database จะกลายเป็น 0 สะอาดหมดจด พร้อมสำหรับเทสกดซื้อใหม่ในแอปทันที
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">

            {/* 🔴 Button 1: ล้างทั้ง RevenueCat และ Cloud (All-in-One Reset) */}
            <div className="p-4 rounded-2xl bg-white border-2 border-rose-300 shadow-xs flex flex-col justify-between gap-3 md:col-span-1">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-black text-sm text-rose-900 flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>ล้างทั้งหมด (แนะนำ)</span>
                  </h4>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                    RevenueCat + Cloud
                  </span>
                </div>
                <p className="text-[11px] text-[#608367] leading-relaxed">
                  ลบ Subscriber ใน RevenueCat ทันที + ปรับแพลนใน DB เป็น Free (เคลียร์วันหมดอายุทั้งหมด)
                </p>
              </div>

              <button
                onClick={() => handleResetAction('reset_all')}
                disabled={actionLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <span>กำลังล้างข้อมูล...</span>
                ) : (
                  <>
                    <span>🧹</span>
                    <span>ล้างทั้ง RevenueCat & Cloud</span>
                  </>
                )}
              </button>
            </div>

            {/* 🔵 Button 2: ลบเฉพาะ RevenueCat */}
            <div className="p-4 rounded-2xl bg-white border border-[#D0DDD0] hover:border-blue-400 shadow-xs flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-black text-sm text-[#2C4A34] flex items-center gap-1.5">
                    <span>🐱</span>
                    <span>ล้างเฉพาะ RevenueCat</span>
                  </h4>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    App Store Sandbox
                  </span>
                </div>
                <p className="text-[11px] text-[#608367] leading-relaxed">
                  ลบเฉพาะประวัติ Subscriber ใน RevenueCat ให้กลายเป็นผู้ใช้ใหม่ (ไม่แตะต้อง Database)
                </p>
              </div>

              <button
                onClick={() => handleResetAction('reset_revenuecat')}
                disabled={actionLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>🗑️</span>
                <span>ล้างประวัติ RevenueCat</span>
              </button>
            </div>

            {/* 🟢 Button 3: ล้างเฉพาะ Cloud Database */}
            <div className="p-4 rounded-2xl bg-white border border-[#D0DDD0] hover:border-emerald-400 shadow-xs flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-black text-sm text-[#2C4A34] flex items-center gap-1.5">
                    <span>☁️</span>
                    <span>ล้างเฉพาะ Cloud</span>
                  </h4>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Database Only
                  </span>
                </div>
                <p className="text-[11px] text-[#608367] leading-relaxed">
                  รีเซ็ตแพลนใน Supabase ให้เป็น Free และเคลียร์วันหมดอายุทั้งหมดเป็น 0 (ไม่แตะต้อง RevenueCat)
                </p>
              </div>

              <button
                onClick={() => handleResetAction('reset_cloud')}
                disabled={actionLoading}
                className="w-2.5/2.5 w-full py-2.5 px-4 bg-[#2C4A34] hover:bg-[#1E3A27] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                <span>รีเซ็ต Cloud เป็น Free</span>
              </button>
            </div>

          </div>
        </div>

        {/* ⏱️ Step 2: เลือกระยะเวลาการทดสอบสำหรับจำลองเปลี่ยนแพลน (Duration Selector) */}
        <div className="bg-white rounded-3xl p-6 border border-[#D0DDD0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#2C4A34] uppercase tracking-wider flex items-center gap-2">
              <span>⏱️</span>
              <span>ขั้นตอนที่ 2: เลือกระยะเวลาที่ต้องการทดสอบ (กรณีจำลองเปลี่ยนแพลน)</span>
            </h3>
            <span className="text-[11px] text-[#608367] font-semibold">
              เมื่อครบเวลาจะถอยกลับเป็น Free อัตโนมัติ
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {DURATION_OPTIONS.map((d) => {
              const isSelected = durationMinutes === d.minutes;
              return (
                <button
                  key={d.minutes}
                  type="button"
                  onClick={() => setDurationMinutes(d.minutes)}
                  className={`py-3 px-3 rounded-2xl font-bold text-xs transition-all border cursor-pointer text-center ${
                    isSelected
                      ? 'bg-[#2C4A34] text-white border-[#2C4A34] shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-[#FAF9F5] text-[#2C4A34] border-[#D0DDD0] hover:border-[#8FAF96]'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 🎛️ Step 3: Plan Switching Cards (5 Options) */}
        <div>
          <h3 className="text-sm font-black text-[#2C4A34] uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>🎛️</span>
            <span>ขั้นตอนที่ 3: หรือจำลองเปลี่ยนแพลนในระบบทันที (ไม่ต้องกดซื้อจริง):</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {planCards.map((p) => {
              const isCurrent = brand?.effectivePlan === p.key;

              return (
                <div
                  key={p.key}
                  className={`bg-white rounded-3xl p-5 border-2 transition-all flex flex-col justify-between gap-4 shadow-xs relative overflow-hidden ${
                    isCurrent ? p.activeBorder : p.borderColor
                  }`}
                >
                  {/* Active Indicator Top Tag */}
                  {isCurrent && (
                    <div className="absolute top-0 right-0 bg-[#2C4A34] text-white px-3 py-0.5 rounded-bl-xl text-[9px] font-black tracking-wider uppercase shadow-xs">
                      ✓ ปัจจุบัน
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <h4 className="text-base font-black text-[#2C4A34]">{p.name}</h4>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${p.tagColor}`}>
                        {p.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#608367] leading-relaxed font-medium">
                      {p.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSwitchPlan(p.key)}
                    disabled={actionLoading}
                    className={`w-full py-2.5 px-3 rounded-xl text-white font-black text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${p.btnColor}`}
                  >
                    {actionLoading ? (
                      <span>กำลังเปลี่ยน...</span>
                    ) : (
                      <span>{p.btnText}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 📱 How to Test POS App Instructions */}
        <div className="bg-white rounded-3xl p-6 border border-[#D0DDD0] shadow-sm space-y-3">
          <h3 className="text-sm font-black text-[#2C4A34] flex items-center gap-2">
            <span>📱</span>
            <span>ขั้นตอนการทดสอบกดซื้อในแอป POS ให้ได้ผลแม่นยำ 100%</span>
          </h3>
          <div className="text-xs text-[#608367] leading-relaxed space-y-2">
            <p>
              1. <strong>กดปุ่มสีแดง &ldquo;🧹 ล้างทั้ง RevenueCat &amp; Cloud&rdquo;</strong> ในหน้านี้ — ระบบจะลบประวัติใน RevenueCat และปรับ Cloud เป็น Free
            </p>
            <p>
              2. <strong>เข้าแอป SuparPOS</strong> ด้วยร้านค้าที่เลือกไว้ (เช่น ร้าน <strong>h</strong>)
            </p>
            <p>
              3. เข้าไปที่เมนู <strong>ตั้งค่าร้านค้า 👉 แพ็กเกจ (Package)</strong> (กดเลื่อนลงเพื่อดึงรีเฟรช 1 ครั้ง) จะเห็นว่าเป็น <strong>Free Plan</strong>
            </p>
            <p>
              4. <strong>กดเลือกแพ็กเกจที่ต้องการทดสอบ</strong> (เช่น GO Plan หรือ Basic Plan) แล้วกดยืนยันชำระเงินผ่าน Apple Sandbox
            </p>
            <p>
              5. เมื่อชำระเงินสำเร็จ ให้กลับมากดปุ่ม <strong>&ldquo;รีเฟรชสถานะ&rdquo;</strong> ในหน้านี้ จะเห็นว่าทั้ง Cloud และ RevenueCat ได้รับแพ็กเกจตรงกันเป๊ะทันทีครับนาย!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
