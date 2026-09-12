'use client';

import { useState, useEffect } from 'react';

const IconMaintenance = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);
const IconUpdate = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);
const IconBell = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconMarketplace = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10h18l-1.1-5H4.1L3 10Z" />
    <path d="M5 10v9h14v-9" />
    <path d="M9 19v-5h6v5" />
    <path d="M3 10c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2" />
  </svg>
);
const IconChart = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);
const IconCheck = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconCopy = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

interface PlanDashboardPerm {
  max_days: number;
  allow_advanced: boolean;
  receipt_max_days?: number;
  max_food_items?: number;
  max_products?: number;
  max_tables?: number;
}

interface DashboardPermissions {
  free: PlanDashboardPerm;
  basic: PlanDashboardPerm;
  pro: PlanDashboardPerm;
  ultimate: PlanDashboardPerm;
}

const DEFAULT_DASHBOARD_PERMISSIONS: DashboardPermissions = {
  free: { max_days: 30, allow_advanced: false, receipt_max_days: 7, max_food_items: 50, max_products: 50, max_tables: 10 },
  basic: { max_days: 0, allow_advanced: false, receipt_max_days: 0, max_food_items: 0, max_products: 0, max_tables: 0 },
  pro: { max_days: 0, allow_advanced: true, receipt_max_days: 0, max_food_items: 0, max_products: 0, max_tables: 0 },
  ultimate: { max_days: 0, allow_advanced: true, receipt_max_days: 0, max_food_items: 0, max_products: 0, max_tables: 0 },
};

export default function AppSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [needsColumnMigration, setNeedsColumnMigration] = useState(false);
  const [migrationSql, setMigrationSql] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const [settings, setSettings] = useState({
    maintenance_mode: false,
    maintenance_message: 'ระบบปิดปรับปรุงชั่วคราวเพื่อพัฒนาการบริการ คาดว่าจะเปิดให้บริการได้ปกติเร็วๆ นี้',
    force_update: false,
    latest_version: '1.0.0',
    android_min_version: '1.0.0',
    ios_min_version: '1.0.0',
    update_url: '',
    marketplace_enabled: true,
  });

  const [dashboardPermissions, setDashboardPermissions] = useState<DashboardPermissions>(DEFAULT_DASHBOARD_PERMISSIONS);
  const [notif, setNotif] = useState({ title: '', body: '' });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/app-settings');
      const data = await res.json();
      if (res.status === 404 && data.needsMigration) {
        setNeedsMigration(true);
      } else if (data.success && data.settings) {
        const s = data.settings;
        setSettings({
          maintenance_mode: s.maintenance_mode ?? false,
          maintenance_message: s.maintenance_message ?? '',
          force_update: s.force_update ?? false,
          latest_version: s.latest_version ?? '1.0.0',
          android_min_version: s.android_min_version ?? '1.0.0',
          ios_min_version: s.ios_min_version ?? '1.0.0',
          update_url: s.update_url ?? '',
          marketplace_enabled: s.marketplace_enabled ?? true,
        });

        if (s.dashboard_permissions) {
          setDashboardPermissions({
            free: { ...DEFAULT_DASHBOARD_PERMISSIONS.free, ...s.dashboard_permissions.free },
            basic: { ...DEFAULT_DASHBOARD_PERMISSIONS.basic, ...s.dashboard_permissions.basic },
            pro: { ...DEFAULT_DASHBOARD_PERMISSIONS.pro, ...s.dashboard_permissions.pro },
            ultimate: { ...DEFAULT_DASHBOARD_PERMISSIONS.ultimate, ...s.dashboard_permissions.ultimate },
          });
        }
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'โหลดข้อมูลตั้งค่าล้มเหลว' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMsg(null);
      const res = await fetch('/api/admin/app-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          dashboard_permissions: dashboardPermissions,
        })
      });
      const data = await res.json();
      if (data.needsColumnMigration) {
        setNeedsColumnMigration(true);
        setMigrationSql(data.migrationSql || '');
        setStatusMsg({
          type: 'warning',
          text: 'บันทึกการตั้งค่าทั่วไปแล้ว แต่ต้องรัน SQL ใน Supabase เพื่อให้การตั้งค่าสิทธิ์แดชบอร์ดมีผล'
        });
      } else if (data.success) {
        setNeedsColumnMigration(false);
        setStatusMsg({ type: 'success', text: 'บันทึกการตั้งค่าทั้งหมดเรียบร้อยแล้ว' });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'บันทึกข้อมูลล้มเหลว' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึก' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!notif.title.trim() || !notif.body.trim()) {
      setStatusMsg({ type: 'error', text: 'กรุณากรอกหัวข้อและข้อความ' });
      return;
    }
    try {
      setSending(true);
      setStatusMsg(null);
      const res = await fetch('/api/admin/broadcast-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notif)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message || `ส่งสำเร็จ ${data.successCount} เครื่อง` });
        setNotif({ title: '', body: '' });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'ส่งแจ้งเตือนล้มเหลว' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'เกิดข้อผิดพลาดในการส่ง' });
    } finally {
      setSending(false);
    }
  };

  const copySql = (sqlText: string) => {
    navigator.clipboard.writeText(sqlText);
    alert('คัดลอก SQL แล้ว');
  };

  const updatePlanPerm = (plan: keyof DashboardPermissions, field: keyof PlanDashboardPerm, value: any) => {
    setDashboardPermissions(prev => ({
      ...prev,
      [plan]: {
        ...prev[plan],
        [field]: value
      }
    }));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5F8565]"></div>
    </div>
  );

  if (needsMigration) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-[#7F1D1D]">
      <h2 className="font-bold text-base mb-2">ต้องสร้างตาราง system_settings ก่อน</h2>
      <p className="text-sm mb-4">เปิด Supabase SQL Editor แล้วรันคำสั่งด้านล่าง:</p>
      <div className="relative">
        <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono overflow-x-auto">
{`CREATE TABLE IF NOT EXISTS public.system_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT DEFAULT '...',
  force_update BOOLEAN DEFAULT FALSE,
  latest_version TEXT DEFAULT '1.0.0',
  android_min_version TEXT DEFAULT '1.0.0',
  ios_min_version TEXT DEFAULT '1.0.0',
  update_url TEXT DEFAULT '',
  marketplace_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  dashboard_permissions JSONB DEFAULT '{"free":{"max_days":30,"allow_advanced":false},"basic":{"max_days":0,"allow_advanced":false},"pro":{"max_days":0,"allow_advanced":true},"ultimate":{"max_days":0,"allow_advanced":true}}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.system_settings (id)
VALUES ('global') ON CONFLICT (id) DO NOTHING;`}
        </pre>
        <button onClick={() => copySql(`CREATE TABLE IF NOT EXISTS public.system_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT DEFAULT '...',
  force_update BOOLEAN DEFAULT FALSE,
  latest_version TEXT DEFAULT '1.0.0',
  android_min_version TEXT DEFAULT '1.0.0',
  ios_min_version TEXT DEFAULT '1.0.0',
  update_url TEXT DEFAULT '',
  marketplace_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  dashboard_permissions JSONB DEFAULT '{"free":{"max_days":30,"allow_advanced":false},"basic":{"max_days":0,"allow_advanced":false},"pro":{"max_days":0,"allow_advanced":true},"ultimate":{"max_days":0,"allow_advanced":true}}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.system_settings (id)
VALUES ('global') ON CONFLICT (id) DO NOTHING;`)}
          className="absolute top-3 right-3 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
          <IconCopy /> คัดลอก SQL
        </button>
      </div>
      <button onClick={fetchSettings}
        className="mt-5 bg-[#2c4a34] text-white px-6 py-2.5 rounded-xl font-bold text-sm">
        ลองเชื่อมต่ออีกครั้ง
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#2C4A34]">ตั้งค่าและควบคุมแอปมือถือ</h2>
        <p className="text-xs text-[#608367] mt-1">จัดการโหมดปิดปรับปรุง, สิทธิ์หน้าแดชบอร์ด, เวอร์ชันแอป และส่งข้อความบรอดแคสต์</p>
      </div>

      {statusMsg && (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium ${
          statusMsg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : statusMsg.type === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {statusMsg.type === 'success' ? <IconCheck /> : <span className="font-bold text-base">!</span>}
          {statusMsg.text}
        </div>
      )}

      {needsColumnMigration && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">แจ้งเตือน: ตาราง system_settings ยังไม่มีคอลัมน์ dashboard_permissions</span>
            <button
              type="button"
              onClick={() => copySql(migrationSql || `ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS dashboard_permissions JSONB DEFAULT '{"free":{"max_days":30,"allow_advanced":false},"basic":{"max_days":0,"allow_advanced":false},"pro":{"max_days":0,"allow_advanced":true},"ultimate":{"max_days":0,"allow_advanced":true}}'::jsonb;`)}
              className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <IconCopy size={13} /> คัดลอก SQL ไปรันใน Supabase
            </button>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-xl p-3 text-[11px] font-mono overflow-x-auto">
            {migrationSql || `ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS dashboard_permissions JSONB DEFAULT '{"free":{"max_days":30,"allow_advanced":false},"basic":{"max_days":0,"allow_advanced":false},"pro":{"max_days":0,"allow_advanced":true},"ultimate":{"max_days":0,"allow_advanced":true}}'::jsonb;`}
          </pre>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">

        {/* ── Dashboard & Reports Access Control ── */}
        <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 bg-[#FAF9F5] border-b border-[#EFECE6]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <IconChart size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#2C4A34]">สิทธิ์หน้าแดชบอร์ดและรายงาน (Dashboard & Reports)</p>
                <p className="text-[10px] text-[#869E8D]">กำหนดจำนวนวันที่ดูย้อนหลังได้ และสิทธิ์เข้าถึงรายงานขั้นสูงด้านล่างแยกตามแผน</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Free Plan */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-[#FAFAFA] space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span className="text-sm font-extrabold text-slate-800">แผน Free</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">ฟรี</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">ดูข้อมูลย้อนหลังได้ (วัน)</label>
                    <span className="text-[11px] text-slate-500 font-medium">{dashboardPermissions.free.max_days === 0 ? 'ตลอดไป' : `${dashboardPermissions.free.max_days} วัน`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.free.max_days}
                      onChange={e => updatePlanPerm('free', 'max_days', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#5F8565] font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ดูได้ตลอดไป)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">รายงานขั้นสูง (ส่วนล่าง)</p>
                    <p className="text-[10px] text-slate-500">ยอดขายรายชั่วโมง, วิธีชำระเงิน, โต๊ะ, ยอดขายพนักงาน</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dashboardPermissions.free.allow_advanced}
                      onChange={e => updatePlanPerm('free', 'allow_advanced', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#5F8565] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">ประวัติการขายดูย้อนหลังได้ (วัน)</label>
                    <span className="text-[11px] text-slate-500 font-medium">{(dashboardPermissions.free.receipt_max_days ?? 7) === 0 ? 'ตลอดไป' : `${dashboardPermissions.free.receipt_max_days ?? 7} วัน`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.free.receipt_max_days ?? 7}
                      onChange={e => updatePlanPerm('free', 'receipt_max_days', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#5F8565] font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ดูได้ตลอดไป)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">จำนวนอาหาร / เมนู สูงสุด (รายการ)</label>
                    <span className="text-[11px] text-slate-500 font-medium">{(dashboardPermissions.free.max_food_items ?? 50) === 0 ? 'ไม่จำกัด' : `${dashboardPermissions.free.max_food_items ?? 50} รายการ`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.free.max_food_items ?? 50}
                      onChange={e => updatePlanPerm('free', 'max_food_items', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#5F8565] font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ไม่จำกัด)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">จำนวนสินค้าทั่วไป สูงสุด (รายการ)</label>
                    <span className="text-[11px] text-slate-500 font-medium">{(dashboardPermissions.free.max_products ?? 50) === 0 ? 'ไม่จำกัด' : `${dashboardPermissions.free.max_products ?? 50} รายการ`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.free.max_products ?? 50}
                      onChange={e => updatePlanPerm('free', 'max_products', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#5F8565] font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ไม่จำกัด)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">จำนวนโต๊ะสูงสุด (โต๊ะ)</label>
                    <span className="text-[11px] text-slate-500 font-medium">{(dashboardPermissions.free.max_tables ?? 10) === 0 ? 'ไม่จำกัด' : `${dashboardPermissions.free.max_tables ?? 10} โต๊ะ`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.free.max_tables ?? 10}
                      onChange={e => updatePlanPerm('free', 'max_tables', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#5F8565] font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ไม่จำกัด)</span>
                  </div>
                </div>
              </div>

              {/* Basic Plan */}
              <div className="border-2 border-blue-200 rounded-2xl p-4 bg-blue-50/40 space-y-3.5">
                <div className="flex items-center justify-between border-b border-blue-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-sm font-extrabold text-blue-950">แผน Basic</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">เบสิก</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">ดูข้อมูลย้อนหลังได้ (วัน)</label>
                    <span className="text-[11px] text-blue-700 font-bold">{dashboardPermissions.basic.max_days === 0 ? 'ตลอดไป (ไม่จำกัด)' : `${dashboardPermissions.basic.max_days} วัน`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.basic.max_days}
                      onChange={e => updatePlanPerm('basic', 'max_days', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(ค่าเริ่มต้น 0 = ตลอดไป)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-950">รายงานขั้นสูง (ส่วนล่าง)</p>
                    <p className="text-[10px] text-blue-700/80">เปิดสิทธิ์ให้ Basic ดูสถิติรายชั่วโมง, โต๊ะ และพนักงานได้</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dashboardPermissions.basic.allow_advanced}
                      onChange={e => updatePlanPerm('basic', 'allow_advanced', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>

                <div className="pt-2 border-t border-blue-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">ประวัติการขายดูย้อนหลังได้ (วัน)</label>
                    <span className="text-[11px] text-blue-700 font-bold">{(dashboardPermissions.basic.receipt_max_days ?? 0) === 0 ? 'ตลอดไป (ไม่จำกัด)' : `${dashboardPermissions.basic.receipt_max_days} วัน`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.basic.receipt_max_days ?? 0}
                      onChange={e => updatePlanPerm('basic', 'receipt_max_days', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(ค่าเริ่มต้น 0 = ตลอดไป)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">จำนวนอาหาร / เมนู สูงสุด (รายการ)</label>
                    <span className="text-[11px] text-blue-700 font-bold">{(dashboardPermissions.basic.max_food_items ?? 0) === 0 ? 'ไม่จำกัด' : `${dashboardPermissions.basic.max_food_items} รายการ`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.basic.max_food_items ?? 0}
                      onChange={e => updatePlanPerm('basic', 'max_food_items', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ไม่จำกัด)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">จำนวนสินค้าทั่วไป สูงสุด (รายการ)</label>
                    <span className="text-[11px] text-blue-700 font-bold">{(dashboardPermissions.basic.max_products ?? 0) === 0 ? 'ไม่จำกัด' : `${dashboardPermissions.basic.max_products} รายการ`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.basic.max_products ?? 0}
                      onChange={e => updatePlanPerm('basic', 'max_products', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ไม่จำกัด)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">จำนวนโต๊ะสูงสุด (โต๊ะ)</label>
                    <span className="text-[11px] text-blue-700 font-bold">{(dashboardPermissions.basic.max_tables ?? 0) === 0 ? 'ไม่จำกัด' : `${dashboardPermissions.basic.max_tables} โต๊ะ`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.basic.max_tables ?? 0}
                      onChange={e => updatePlanPerm('basic', 'max_tables', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ไม่จำกัด)</span>
                  </div>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="border border-emerald-200 rounded-2xl p-4 bg-emerald-50/40 space-y-3.5">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="text-sm font-extrabold text-emerald-950">แผน PRO</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">โปร</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">ดูข้อมูลย้อนหลังได้ (วัน)</label>
                    <span className="text-[11px] text-emerald-700 font-bold">{dashboardPermissions.pro.max_days === 0 ? 'ตลอดไป' : `${dashboardPermissions.pro.max_days} วัน`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.pro.max_days}
                      onChange={e => updatePlanPerm('pro', 'max_days', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ดูได้ตลอดไป)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-950">รายงานขั้นสูง (ส่วนล่าง)</p>
                    <p className="text-[10px] text-emerald-700/80">ยอดขายรายชั่วโมง, วิธีชำระเงิน, โต๊ะ, ยอดขายพนักงาน</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dashboardPermissions.pro.allow_advanced}
                      onChange={e => updatePlanPerm('pro', 'allow_advanced', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>

                <div className="pt-2 border-t border-emerald-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">ประวัติการขายดูย้อนหลังได้ (วัน)</label>
                    <span className="text-[11px] text-emerald-700 font-bold">{(dashboardPermissions.pro.receipt_max_days ?? 0) === 0 ? 'ตลอดไป' : `${dashboardPermissions.pro.receipt_max_days} วัน`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.pro.receipt_max_days ?? 0}
                      onChange={e => updatePlanPerm('pro', 'receipt_max_days', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ดูได้ตลอดไป)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">จำนวนอาหาร / เมนู สูงสุด (รายการ)</label>
                    <span className="text-[11px] text-emerald-700 font-bold">{(dashboardPermissions.pro.max_food_items ?? 0) === 0 ? 'ไม่จำกัด' : `${dashboardPermissions.pro.max_food_items} รายการ`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.pro.max_food_items ?? 0}
                      onChange={e => updatePlanPerm('pro', 'max_food_items', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ไม่จำกัด)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">จำนวนสินค้าทั่วไป สูงสุด (รายการ)</label>
                    <span className="text-[11px] text-emerald-700 font-bold">{(dashboardPermissions.pro.max_products ?? 0) === 0 ? 'ไม่จำกัด' : `${dashboardPermissions.pro.max_products} รายการ`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.pro.max_products ?? 0}
                      onChange={e => updatePlanPerm('pro', 'max_products', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ไม่จำกัด)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">จำนวนโต๊ะสูงสุด (โต๊ะ)</label>
                    <span className="text-[11px] text-emerald-700 font-bold">{(dashboardPermissions.pro.max_tables ?? 0) === 0 ? 'ไม่จำกัด' : `${dashboardPermissions.pro.max_tables} โต๊ะ`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.pro.max_tables ?? 0}
                      onChange={e => updatePlanPerm('pro', 'max_tables', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ไม่จำกัด)</span>
                  </div>
                </div>
              </div>

              {/* Ultimate Plan */}
              <div className="border border-purple-200 rounded-2xl p-4 bg-purple-50/40 space-y-3.5">
                <div className="flex items-center justify-between border-b border-purple-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <span className="text-sm font-extrabold text-purple-950">แผน Ultimate</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">อัลติเมท</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">ดูข้อมูลย้อนหลังได้ (วัน)</label>
                    <span className="text-[11px] text-purple-700 font-bold">{dashboardPermissions.ultimate.max_days === 0 ? 'ตลอดไป' : `${dashboardPermissions.ultimate.max_days} วัน`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.ultimate.max_days}
                      onChange={e => updatePlanPerm('ultimate', 'max_days', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-purple-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ดูได้ตลอดไป)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-purple-950">รายงานขั้นสูง (ส่วนล่าง)</p>
                    <p className="text-[10px] text-purple-700/80">ยอดขายรายชั่วโมง, วิธีชำระเงิน, โต๊ะ, ยอดขายพนักงาน</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dashboardPermissions.ultimate.allow_advanced}
                      onChange={e => updatePlanPerm('ultimate', 'allow_advanced', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>

                <div className="pt-2 border-t border-purple-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">ประวัติการขายดูย้อนหลังได้ (วัน)</label>
                    <span className="text-[11px] text-purple-700 font-bold">{(dashboardPermissions.ultimate.receipt_max_days ?? 0) === 0 ? 'ตลอดไป' : `${dashboardPermissions.ultimate.receipt_max_days} วัน`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.ultimate.receipt_max_days ?? 0}
                      onChange={e => updatePlanPerm('ultimate', 'receipt_max_days', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-purple-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ดูได้ตลอดไป)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">จำนวนอาหาร / เมนู สูงสุด (รายการ)</label>
                    <span className="text-[11px] text-purple-700 font-bold">{(dashboardPermissions.ultimate.max_food_items ?? 0) === 0 ? 'ไม่จำกัด' : `${dashboardPermissions.ultimate.max_food_items} รายการ`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.ultimate.max_food_items ?? 0}
                      onChange={e => updatePlanPerm('ultimate', 'max_food_items', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-purple-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ไม่จำกัด)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">จำนวนสินค้าทั่วไป สูงสุด (รายการ)</label>
                    <span className="text-[11px] text-purple-700 font-bold">{(dashboardPermissions.ultimate.max_products ?? 0) === 0 ? 'ไม่จำกัด' : `${dashboardPermissions.ultimate.max_products} รายการ`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.ultimate.max_products ?? 0}
                      onChange={e => updatePlanPerm('ultimate', 'max_products', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-purple-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ไม่จำกัด)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">จำนวนโต๊ะสูงสุด (โต๊ะ)</label>
                    <span className="text-[11px] text-purple-700 font-bold">{(dashboardPermissions.ultimate.max_tables ?? 0) === 0 ? 'ไม่จำกัด' : `${dashboardPermissions.ultimate.max_tables} โต๊ะ`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={dashboardPermissions.ultimate.max_tables ?? 0}
                      onChange={e => updatePlanPerm('ultimate', 'max_tables', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-purple-500 font-semibold"
                    />
                    <span className="text-[11px] text-slate-500">(0 = ไม่จำกัด)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Maintenance ── */}
        <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-[#FAF9F5] border-b border-[#EFECE6]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <IconMaintenance size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#2C4A34]">ปิดปรับปรุงระบบชั่วคราว</p>
                <p className="text-[10px] text-[#869E8D]">บล็อกการใช้งานแอปทุกร้านชั่วคราว</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.maintenance_mode}
                onChange={e => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
          <div className="p-5">
            <label className="block text-xs font-semibold text-[#5F8565] mb-2">ข้อความที่แสดงในแอป</label>
            <textarea
              value={settings.maintenance_message}
              onChange={e => setSettings({ ...settings, maintenance_message: e.target.value })}
              disabled={!settings.maintenance_mode}
              rows={2}
              placeholder="ระบบปิดปรับปรุง..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#5F8565] disabled:bg-slate-50 disabled:text-slate-400 transition-colors resize-none"
            />
          </div>
        </div>

        {/* ── Marketplace visibility ── */}
        <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-[#FAF9F5] border-b border-[#EFECE6]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <IconMarketplace size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#2C4A34]">Marketplace</p>
                <p className="text-[10px] text-[#869E8D]">แสดงหรือซ่อนปุ่ม Marketplace ในแอปของทุกร้าน</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.marketplace_enabled}
                onChange={e => setSettings({ ...settings, marketplace_enabled: e.target.checked })}
                className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#5F8565] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>

        {/* ── Version Control ── */}
        <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-[#FAF9F5] border-b border-[#EFECE6]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <IconUpdate size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#2C4A34]">ควบคุมเวอร์ชันแอป</p>
                <p className="text-[10px] text-[#869E8D]">บังคับอัปเดตหรือแจ้งเตือนเวอร์ชันใหม่</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#869E8D] font-semibold">Force Update</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.force_update}
                  onChange={e => setSettings({ ...settings, force_update: e.target.checked })}
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#5F8565] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'เวอร์ชันล่าสุด', key: 'latest_version', ph: '1.0.5' },
                { label: 'ขั้นต่ำ Android', key: 'android_min_version', ph: '1.0.0' },
                { label: 'ขั้นต่ำ iOS', key: 'ios_min_version', ph: '1.0.0' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10.5px] font-semibold text-[#5F8565] mb-1.5">{f.label}</label>
                  <input type="text" value={(settings as any)[f.key]} placeholder={f.ph}
                    onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#5F8565]" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-[10.5px] font-semibold text-[#5F8565] mb-1.5">ลิงก์ดาวน์โหลด (Play Store / App Store)</label>
              <input type="text" value={settings.update_url}
                onChange={e => setSettings({ ...settings, update_url: e.target.value })}
                placeholder="https://play.google.com/store/apps/details?id=..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#5F8565]" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="bg-[#2c4a34] hover:bg-[#203626] text-white px-8 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50">
            {saving ? <><div className="animate-spin h-4 w-4 rounded-full border-b-2 border-white" />กำลังบันทึก...</> : 'บันทึกการตั้งค่า'}
          </button>
        </div>
      </form>

      {/* ── Broadcast ── */}
      <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 bg-[#FAF9F5] border-b border-[#EFECE6]">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center">
            <IconBell size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-[#2C4A34]">ส่งข้อความบรอดแคสต์</p>
            <p className="text-[10px] text-[#869E8D]">ยิงแจ้งเตือนถึงทุกอุปกรณ์ที่ติดตั้งแอป</p>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-[10.5px] font-semibold text-[#5F8565] mb-1.5">หัวข้อ</label>
            <input type="text" value={notif.title}
              onChange={e => setNotif({ ...notif, title: e.target.value })}
              placeholder="เช่น ประกาศสำคัญ!"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#5F8565]" />
          </div>
          <div>
            <label className="block text-[10.5px] font-semibold text-[#5F8565] mb-1.5">ข้อความ</label>
            <textarea value={notif.body}
              onChange={e => setNotif({ ...notif, body: e.target.value })}
              rows={3} placeholder="รายละเอียดข่าวสาร..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#5F8565] resize-none" />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={handleSendBroadcast}
              disabled={sending || !notif.title.trim() || !notif.body.trim()}
              className="bg-[#5F8565] hover:bg-[#4E6F53] text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 disabled:opacity-50">
              {sending ? <><div className="animate-spin h-3.5 w-3.5 rounded-full border-b-2 border-white" />กำลังส่ง...</> : 'ส่งบรอดแคสต์'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
