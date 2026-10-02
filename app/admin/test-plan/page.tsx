'use client';

import { useState, useEffect, useRef } from 'react';

// รายการร้านทดสอบที่ปลอดภัย (ป้องกันกดโดนร้านจริงของลูกค้า)
const TEST_STORES = [
  {
    id: 'ef5af840-e267-42e3-a965-ff931e617df0',
    name: 'นอนน',
    desc: 'เครื่อง iPhone 17 Simulator กำลังเปิดร้านนี้อยู่',
    icon: '📱',
    badge: 'กำลังเปิดในแอป Simulator',
    isCurrentApp: true,
  },
  {
    id: '9fd8c2f8-cc19-4869-8ea0-f1df2e314a13',
    name: 'h',
    desc: 'ร้านทดสอบที่นายส่ง ID มา',
    icon: '🍽️',
    badge: 'ร้านทดสอบ h',
    isCurrentApp: false,
  },
];

const DURATION_OPTIONS = [
  { label: '5 นาที (ตามที่นายขอ)', minutes: 5 },
  { label: '15 นาที', minutes: 15 },
  { label: '1 ชั่วโมง', minutes: 60 },
  { label: '1 วัน (24 ชม.)', minutes: 1440 },
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

export default function AdminTestPlanPage() {
  const [selectedBrandId, setSelectedBrandId] = useState<string>(TEST_STORES[0].id);
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [brand, setBrand] = useState<BrandInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ดึงข้อมูลร้านค้าทดสอบ
  const fetchBrandData = async (brandId = selectedBrandId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/brands/test-plan?brandId=${brandId}`);
      const data = await res.json();
      if (data.success && data.brand) {
        setBrand(data.brand);
        setSecondsLeft(data.brand.remainingSeconds || 0);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'ไม่สามารถโหลดข้อมูลร้านค้าทดสอบได้' });
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

  // นับถอยหลังแบบเรียลไทม์
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            fetchBrandData(selectedBrandId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [secondsLeft, selectedBrandId]);

  // สลับแพลน
  const handleSwitchPlan = async (targetPlan: 'free' | 'go' | 'basic' | 'pro' | 'ultimate') => {
    setActionLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/brands/test-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: selectedBrandId,
          plan: targetPlan,
          durationMinutes: durationMinutes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const durationText = durationMinutes >= 60 ? `${durationMinutes / 60} ชั่วโมง` : `${durationMinutes} นาที`;
        setStatusMsg({
          type: 'success',
          text: targetPlan === 'free'
            ? `✅ รีเซ็ตกลับเป็น Free สำเร็จ! (ลบแพลนเก่าทั้งหมดเรียบร้อย)`
            : `🎉 เปลี่ยนร้าน "${brand?.name}" เป็น ${targetPlan.toUpperCase()} สำเร็จ! (มีอายุใช้งาน ${durationText})`,
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

  // แปลงวินาทีเป็น HH:MM:SS หรือ MM:SS
  const formatCountdown = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const planCards = [
    {
      key: 'free' as const,
      name: 'Free Plan',
      badge: 'ฟรีตลอดชีพ',
      desc: '300 บิล/ด., 50 เมนู, 10 โต๊ะ, 1 พนักงาน',
      btnText: '🔄 รีเซ็ตกลับเป็น Free',
      borderColor: 'border-gray-300 hover:border-gray-500',
      activeBorder: 'border-gray-800 bg-gray-50',
      btnColor: 'bg-gray-800 hover:bg-gray-900',
      tagColor: 'bg-gray-100 text-gray-700',
    },
    {
      key: 'go' as const,
      name: 'Go Plan',
      badge: 'จำลองสิทธิ์',
      desc: '1,000 บิล/ด., เมนูไม่จำกัด, โต๊ะไม่จำกัด, 1 พนักงาน',
      btnText: `⚡ เปลี่ยนเป็น Go (${durationMinutes >= 60 ? `${durationMinutes/60} ชม.` : `${durationMinutes} นาที`})`,
      borderColor: 'border-teal-300 hover:border-teal-500',
      activeBorder: 'border-teal-600 bg-teal-50/60',
      btnColor: 'bg-teal-600 hover:bg-teal-700',
      tagColor: 'bg-teal-100 text-teal-800',
    },
    {
      key: 'basic' as const,
      name: 'Basic Plan',
      badge: 'จำลองสิทธิ์',
      desc: 'บิลไม่จำกัด, เมนูไม่จำกัด, โต๊ะไม่จำกัด, 1 พนักงาน',
      btnText: `💼 เปลี่ยนเป็น Basic (${durationMinutes >= 60 ? `${durationMinutes/60} ชม.` : `${durationMinutes} นาที`})`,
      borderColor: 'border-blue-300 hover:border-blue-500',
      activeBorder: 'border-blue-600 bg-blue-50/60',
      btnColor: 'bg-blue-600 hover:bg-blue-700',
      tagColor: 'bg-blue-100 text-blue-800',
    },
    {
      key: 'pro' as const,
      name: 'Pro Plan',
      badge: 'ยอดนิยม',
      desc: 'บิลไม่จำกัด, พนักงาน 3 คน, Dashboard ขั้นสูง, Excel Export',
      btnText: `👑 เปลี่ยนเป็น Pro (${durationMinutes >= 60 ? `${durationMinutes/60} ชม.` : `${durationMinutes} นาที`})`,
      borderColor: 'border-purple-300 hover:border-purple-500',
      activeBorder: 'border-purple-600 bg-purple-50/60',
      btnColor: 'bg-purple-600 hover:bg-purple-700',
      tagColor: 'bg-purple-100 text-purple-800',
    },
    {
      key: 'ultimate' as const,
      name: 'Ultimate Plan',
      badge: 'สูงสุด 100%',
      desc: 'ปลดล็อกทุกสิทธิ์ 100%, พนักงานไม่จำกัด, 55 ธีมพรีเมียม',
      btnText: `💎 เปลี่ยนเป็น Ultimate (${durationMinutes >= 60 ? `${durationMinutes/60} ชม.` : `${durationMinutes} นาที`})`,
      borderColor: 'border-amber-300 hover:border-amber-500',
      activeBorder: 'border-amber-600 bg-amber-50/60',
      btnColor: 'bg-amber-600 hover:bg-amber-700',
      tagColor: 'bg-amber-100 text-amber-900',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F4] p-4 md:p-8 font-sans text-[#1E3A27] pb-32">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 🌟 Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#D0DDD0] shadow-xs">
          <div className="flex items-center gap-3.5">
            <span className="p-3 bg-amber-500 text-white rounded-2xl shadow-md text-2xl">
              ⚡
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#2C4A34] tracking-tight">
                ห้องทดลองเปลี่ยนแพลน (Test Plan Simulator)
              </h1>
              <p className="text-[#608367] text-xs font-semibold mt-0.5">
                จำลองเปลี่ยนแพลนร้านค้าทดสอบ โดยแพลนจะหมดอายุและถอยกลับเป็น Free อัตโนมัติ
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

        {/* 🏬 Step 1: เลือกร้านค้าทดสอบ (Store Selector) */}
        <div className="bg-white rounded-3xl p-6 border border-[#D0DDD0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#2C4A34] uppercase tracking-wider flex items-center gap-2">
              <span>🏪</span>
              <span>ขั้นตอนที่ 1: เลือกร้านค้าทดสอบ</span>
            </h3>
            <span className="text-[11px] font-bold text-[#8FAF96]">
              ล็อคความปลอดภัย ป้องกันโดนร้านจริง
            </span>
          </div>

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
                          {s.isCurrentApp && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs animate-pulse">
                              🔥 เปิดในแอป Simulator ตอนนี้
                            </span>
                          )}
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
        </div>

        {/* ⏱️ Step 2: เลือกระยะเวลาการทดสอบ (Duration Selector) */}
        <div className="bg-white rounded-3xl p-6 border border-[#D0DDD0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#2C4A34] uppercase tracking-wider flex items-center gap-2">
              <span>⏱️</span>
              <span>ขั้นตอนที่ 2: เลือกระยะเวลาที่ต้องการทดสอบ</span>
            </h3>
            <span className="text-[11px] text-[#608367] font-semibold">
              เมื่อครบเวลาจะถอยกลับเป็น Free อัตโนมัติ
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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

        {/* 📢 Status Message Alert */}
        {statusMsg && (
          <div
            className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-3 animate-in fade-in ${
              statusMsg.type === 'success'
                ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                : 'bg-rose-100 border-rose-400 text-rose-950'
            }`}
          >
            <span className="text-xl">{statusMsg.type === 'success' ? '✅' : '❌'}</span>
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* 🏪 Current Store Status Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#D0DDD0] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E2ECE2]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8FAF96]">
                ร้านค้าที่ถูกเลือก (Selected Store)
              </span>
              <h2 className="text-2xl font-black text-[#2C4A34] flex items-center gap-2 mt-0.5">
                <span>🍽️</span>
                <span>{brand?.name || 'กำลังโหลด...'}</span>
                {selectedBrandId === TEST_STORES[0].id && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
                    📱 ใน iPhone Simulator
                  </span>
                )}
              </h2>
              <p className="text-xs font-mono text-[#608367] mt-1">
                ID: {selectedBrandId}
              </p>
            </div>

            {/* Current Active Plan Badge & Countdown */}
            <div className="flex flex-col sm:items-end gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8FAF96]">
                สถานะแพลนปัจจุบัน
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-xl text-sm font-black uppercase tracking-wide border shadow-xs ${
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

                {/* Countdown Badge if active plan */}
                {brand?.effectivePlan !== 'free' && secondsLeft > 0 && (
                  <span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-500 text-white shadow-xs animate-pulse flex items-center gap-1">
                    <span>⏱️</span>
                    <span>เหลือเวลา {formatCountdown(secondsLeft)}</span>
                  </span>
                )}
              </div>

              {brand?.activeExpiry && brand.effectivePlan !== 'free' && (
                <p className="text-[11px] text-[#608367] font-medium">
                  หมดอายุเวลา: {new Date(brand.activeExpiry).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} น.
                </p>
              )}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-3.5 bg-[#FAF9F5] rounded-2xl border border-[#EFECE6] text-xs text-[#608367] flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <span>💡</span>
              <span>
                เมื่อกดเลือกแพลน ระบบจะ<strong>ลบวันหมดอายุแพลนเก่าออกทั้งหมด</strong> แล้วเริ่มนับเวลาแพลนใหม่ <strong>{durationMinutes >= 60 ? `${durationMinutes/60} ชั่วโมง` : `${durationMinutes} นาที`}</strong> ทันที
              </span>
            </div>
            {actionLoading && (
              <span className="font-bold text-amber-600 animate-pulse flex items-center gap-1">
                <span>⏳</span>
                <span>กำลังบันทึกข้อมูล...</span>
              </span>
            )}
          </div>
        </div>

        {/* 🎛️ Step 3: Plan Switching Cards (5 Options) */}
        <div>
          <h3 className="text-sm font-black text-[#2C4A34] uppercase tracking-wider mb-3">
            ขั้นตอนที่ 3: กดเปลี่ยนแพลนตามที่ต้องการทดสอบ:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <div className="absolute top-0 right-0 bg-[#2C4A34] text-white px-3 py-1 rounded-bl-xl text-[10px] font-black tracking-wider uppercase shadow-xs">
                      ✓ แพลนปัจจุบัน
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-lg font-black text-[#2C4A34]">{p.name}</h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${p.tagColor}`}>
                        {p.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#608367] leading-relaxed font-medium">
                      {p.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSwitchPlan(p.key)}
                    disabled={actionLoading}
                    className={`w-full py-3 px-4 rounded-xl text-white font-black text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${p.btnColor}`}
                  >
                    {actionLoading ? (
                      <span>กำลังเปลี่ยนแพลน...</span>
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
            <span>วิธีตรวจสอบความถูกต้องบนแอป POS</span>
          </h3>
          <div className="text-xs text-[#608367] leading-relaxed space-y-2">
            <p>
              1. <strong>สังเกตชื่อร้านที่กำลังเปิดใน Simulator</strong> — ปัจจุบันคือ <strong>ร้าน &ldquo;นอนน&rdquo;</strong> (หรือสามารถกดสลับร้านด้านบนได้)
            </p>
            <p>
              2. <strong>กดปุ่มเปลี่ยนแพลนที่ต้องการ</strong> (เช่น Pro Plan หรือ Go Plan)
            </p>
            <p>
              3. <strong>ในแอป POS</strong> ให้เข้าไปที่เมนู <strong>ตั้งค่าร้านค้า 👉 แพ็กเกจ (Package)</strong> (หรือกดดึงหน้าจอลงเพื่อรีเฟรช)
            </p>
            <p>
              4. จะเห็นว่าหัวการ์ดแพลนเปลี่ยนเป็นแพลนใหม่ทันที และโควต้า 6 รายการจะปรับเปลี่ยนตามสิทธิ์ของแพลนนั้นๆ อย่างแม่นยำ
            </p>
            <p>
              5. เมื่อเวลาผ่านไปครบกำหนด ระบบจะตัดวันหมดอายุและกลับเป็น <strong>Free Plan</strong> โดยอัตโนมัติครับนาย
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
