'use client';

import { useState, useEffect, useRef } from 'react';

const TARGET_BRAND_ID = '9fd8c2f8-cc19-4869-8ea0-f1df2e314a13';

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
  const [brand, setBrand] = useState<BrandInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ดึงข้อมูลร้านค้าทดสอบ
  const fetchBrandData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/brands/test-plan?brandId=${TARGET_BRAND_ID}`);
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
    fetchBrandData();
  }, []);

  // นับถอยหลังแบบเรียลไทม์
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            // เมื่อหมดเวลา ให้ดึงสถานะใหม่เพื่ออัปเดตเป็น Free
            fetchBrandData();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [secondsLeft]);

  // สลับแพลน
  const handleSwitchPlan = async (targetPlan: 'free' | 'go' | 'basic' | 'pro' | 'ultimate') => {
    setActionLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/brands/test-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: TARGET_BRAND_ID,
          plan: targetPlan,
          durationMinutes: 5,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg({
          type: 'success',
          text: targetPlan === 'free'
            ? `✅ รีเซ็ตกลับเป็น Free สำเร็จ! (ลบแพลนเก่าทั้งหมดเรียบร้อย)`
            : `🎉 เปลี่ยนเป็น ${targetPlan.toUpperCase()} สำเร็จ! (มีอายุใช้งาน 5 นาที)`,
        });
        // โหลดข้อมูลใหม่เพื่อเริ่มนับถอยหลัง 5 นาที
        await fetchBrandData();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'เปลี่ยนแพลนไม่สำเร็จ' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' });
    } finally {
      setActionLoading(false);
    }
  };

  // แปลงวินาทีเป็น MM:SS
  const formatCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
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
      badge: '5 นาที',
      desc: '1,000 บิล/ด., เมนูไม่จำกัด, โต๊ะไม่จำกัด, 1 พนักงาน',
      btnText: '⚡ เปลี่ยนเป็น Go Plan (5 นาที)',
      borderColor: 'border-teal-300 hover:border-teal-500',
      activeBorder: 'border-teal-600 bg-teal-50/60',
      btnColor: 'bg-teal-600 hover:bg-teal-700',
      tagColor: 'bg-teal-100 text-teal-800',
    },
    {
      key: 'basic' as const,
      name: 'Basic Plan',
      badge: '5 นาที',
      desc: 'บิลไม่จำกัด, เมนูไม่จำกัด, โต๊ะไม่จำกัด, 1 พนักงาน',
      btnText: '💼 เปลี่ยนเป็น Basic Plan (5 นาที)',
      borderColor: 'border-blue-300 hover:border-blue-500',
      activeBorder: 'border-blue-600 bg-blue-50/60',
      btnColor: 'bg-blue-600 hover:bg-blue-700',
      tagColor: 'bg-blue-100 text-blue-800',
    },
    {
      key: 'pro' as const,
      name: 'Pro Plan',
      badge: '5 นาที (แนะนำ)',
      desc: 'บิลไม่จำกัด, พนักงาน 3 คน, Dashboard ขั้นสูง, Excel Export',
      btnText: '👑 เปลี่ยนเป็น Pro Plan (5 นาที)',
      borderColor: 'border-purple-300 hover:border-purple-500',
      activeBorder: 'border-purple-600 bg-purple-50/60',
      btnColor: 'bg-purple-600 hover:bg-purple-700',
      tagColor: 'bg-purple-100 text-purple-800',
    },
    {
      key: 'ultimate' as const,
      name: 'Ultimate Plan',
      badge: '5 นาที (สูงสุด)',
      desc: 'ปลดล็อกทุกสิทธิ์ 100%, พนักงานไม่จำกัด, 55 ธีมพรีเมียม',
      btnText: '💎 เปลี่ยนเป็น Ultimate Plan (5 นาที)',
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
                จำลองเปลี่ยนแพลนร้านค้าทดสอบ โดยแพลนจะมีอายุเพียง 5 นาที เพื่อทดสอบระบบ
              </p>
            </div>
          </div>

          <button
            onClick={fetchBrandData}
            disabled={loading || actionLoading}
            className="px-4 py-2.5 bg-[#E2ECE2] hover:bg-[#2C4A34] hover:text-white text-[#2C4A34] rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            title="รีเฟรชข้อมูลล่าสุด"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>รีเฟรชสถานะ</span>
          </button>
        </div>

        {/* 🛡️ Safety Warning: Locked Store Only */}
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4.5 flex items-start gap-3 text-xs leading-relaxed text-emerald-950">
          <span className="text-xl">🛡️</span>
          <div>
            <h4 className="font-black text-emerald-900 text-sm mb-0.5">
              โหมดความปลอดภัยสูงสุด: ล็อคเฉพาะร้านทดสอบนี้ร้านเดียวเท่านั้น
            </h4>
            <p className="text-emerald-800 font-medium">
              หน้านี้ถูกตั้งค่าให้ควบคุมเฉพาะร้านค้า ID: <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-emerald-900 border border-emerald-200">{TARGET_BRAND_ID}</code> เพื่อป้องกันความผิดพลาด ไม่สามารถกดโดนร้านค้าจริงของลูกค้าได้ 100% ครับนาย
            </p>
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
                ร้านค้าที่กำลังทดสอบ (Target Store)
              </span>
              <h2 className="text-2xl font-black text-[#2C4A34] flex items-center gap-2 mt-0.5">
                <span>🍽️</span>
                <span>{brand?.name || 'ร้านทดสอบ'}</span>
                <span className="text-xs font-mono font-normal text-[#8FAF96]">
                  (slug: {brand?.slug || 'shop'})
                </span>
              </h2>
              <p className="text-xs font-mono text-[#608367] mt-1">
                ID: {TARGET_BRAND_ID}
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
                เมื่อกดเลือกแพลน ระบบจะ<strong>ลบวันหมดอายุแพลนเก่าออกทั้งหมด</strong> แล้วเริ่มนับเวลาแพลนใหม่ <strong>5 นาที</strong> ทันที
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

        {/* 🎛️ Plan Switching Cards (5 Options) */}
        <div>
          <h3 className="text-sm font-black text-[#2C4A34] uppercase tracking-wider mb-3">
            เลือกแพลนที่ต้องการสลับ (อายุ 5 นาที):
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
            <span>วิธีตรวจสอบความถูกต้องบนแอป POS (iPhone / Android)</span>
          </h3>
          <div className="text-xs text-[#608367] leading-relaxed space-y-2">
            <p>
              1. <strong>กดปุ่มเปลี่ยนแพลน</strong> ที่การ์ดด้านบน (เช่น กดเปลี่ยนเป็น Pro Plan หรือ Free Plan)
            </p>
            <p>
              2. <strong>เปิดแอป POS</strong> ที่รันอยู่ในเครื่องหรือ Terminal แล้วกดแป้นพิมพ์ <strong>`r`</strong> (Hot Reload) หรือ <strong>`R`</strong> (Hot Restart)
            </p>
            <p>
              3. เข้าไปที่เมนู <strong>ตั้งค่าร้านค้า 👉 แพ็กเกจ (Package)</strong>
            </p>
            <p>
              4. จะเห็นว่าหัวการ์ดแพลนเปลี่ยนเป็นแพลนใหม่ทันที และช่องโควต้า 6 รายการจะปรับเปลี่ยนตามสิทธิ์ของแพลนนั้นๆ อย่างแม่นยำ
            </p>
            <p>
              5. เมื่อเวลาผ่านไปครบ <strong>5 นาที</strong> ระบบจะตัดวันหมดอายุและกลับเป็น <strong>Free Plan</strong> โดยอัตโนมัติครับนาย
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
