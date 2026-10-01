'use client';

import { useState, useEffect } from 'react';
import { PlanContent, DEFAULT_PLAN_CONTENTS, PLAN_CONTENTS_MIGRATION_SQL } from '@/lib/planContents';

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
const IconWindows = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.95-1.8" />
  </svg>
);

const IconAndroid = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4147 13.8533 8.09 12 8.09c-1.8533 0-3.5902.3247-5.1367.8597L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3433-4.1021-2.689-7.5743-6.1185-9.4396" />
  </svg>
);

const IconApple = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.91.04-2.02.61-2.67 1.38-.58.67-1.09 1.76-.95 2.82 1.02.08 2.05-.51 2.68-1.27z" />
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
  max_orders?: number;
}

interface DashboardPermissions {
  free: PlanDashboardPerm;
  go: PlanDashboardPerm;
  basic: PlanDashboardPerm;
  pro: PlanDashboardPerm;
  ultimate: PlanDashboardPerm;
}

const DEFAULT_DASHBOARD_PERMISSIONS: DashboardPermissions = {
  free: { max_days: 30, allow_advanced: false, receipt_max_days: 7, max_food_items: 50, max_products: 0, max_tables: 10, max_orders: 300 },
  go: { max_days: 180, allow_advanced: false, receipt_max_days: 30, max_food_items: 0, max_products: 0, max_tables: 0, max_orders: 1000 },
  basic: { max_days: 0, allow_advanced: false, receipt_max_days: 0, max_food_items: 0, max_products: 0, max_tables: 0, max_orders: 0 },
  pro: { max_days: 0, allow_advanced: true, receipt_max_days: 0, max_food_items: 0, max_products: 0, max_tables: 0, max_orders: 0 },
  ultimate: { max_days: 0, allow_advanced: true, receipt_max_days: 0, max_food_items: 0, max_products: 0, max_tables: 0, max_orders: 0 },
};

type PlanKeyType = 'free' | 'go' | 'basic' | 'pro' | 'ultimate';

interface PlanConfig {
  key: PlanKeyType;
  name: string;
  badge: string;
  priceTag: string;
  badgeClass: string;
  tabActiveClass: string;
  accentText: string;
  borderClass: string;
  bgCardClass: string;
  dotColor: string;
  focusBorder: string;
  featuresPlaceholder: string;
}

const PLAN_CONFIGS: PlanConfig[] = [
  {
    key: 'free',
    name: 'Free Plan',
    badge: 'ฟรี',
    priceTag: 'ฟรีตลอดชีพ',
    badgeClass: 'bg-slate-200 text-slate-700',
    tabActiveClass: 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-800',
    accentText: 'text-slate-800',
    borderClass: 'border-slate-300',
    bgCardClass: 'bg-[#FAFAFA]',
    dotColor: 'bg-slate-400',
    focusBorder: 'focus:border-slate-500',
    featuresPlaceholder: 'คิดเงินหน้าร้านไม่จำกัด\nสแกนสั่งอาหาร 300 ออเดอร์/เดือน\nดูรายงาน Dashboard ย้อนหลัง 30 วัน\nจัดการอาหาร / เมนู สูงสุด 50 รายการ\nสินค้าทั่วไป ไม่จำกัด\nรองรับโต๊ะสูงสุด 10 โต๊ะ\nเลือกใช้ธีมร้านค้าได้ฟรี',
  },
  {
    key: 'go',
    name: 'Go Plan',
    badge: 'โก (99฿)',
    priceTag: '99 บาท/เดือน',
    badgeClass: 'bg-teal-100 text-teal-800',
    tabActiveClass: 'bg-teal-700 text-white shadow-sm ring-1 ring-teal-700',
    accentText: 'text-teal-900',
    borderClass: 'border-teal-300',
    bgCardClass: 'bg-teal-50/40',
    dotColor: 'bg-teal-500',
    focusBorder: 'focus:border-teal-500',
    featuresPlaceholder: 'คิดเงินหน้าร้านไม่จำกัด\nสแกนสั่งอาหาร 1,000 ออเดอร์/เดือน\nดูรายงาน Dashboard ย้อนหลัง 60 วัน\nประวัติการขายย้อนหลัง 30 วัน\nไม่จำกัดจำนวนเมนูและสินค้า\nไม่จำกัดจำนวนโต๊ะ\nเลือกใช้ธีมร้านค้าได้ฟรี',
  },
  {
    key: 'basic',
    name: 'Basic Plan',
    badge: 'เบสิก (250฿)',
    priceTag: '250 บาท/เดือน',
    badgeClass: 'bg-blue-100 text-blue-800',
    tabActiveClass: 'bg-blue-700 text-white shadow-sm ring-1 ring-blue-700',
    accentText: 'text-blue-900',
    borderClass: 'border-blue-300',
    bgCardClass: 'bg-blue-50/40',
    dotColor: 'bg-blue-500',
    focusBorder: 'focus:border-blue-500',
    featuresPlaceholder: 'คิดเงินหน้าร้านไม่จำกัด\nออเดอร์ไม่จำกัด (Unlimited Orders)\nดูรายงาน Dashboard ย้อนหลังไม่จำกัด\nประวัติการขายไม่จำกัดย้อนหลัง\nสร้าง QR Code โต๊ะไม่จำกัด\nไม่จำกัดจำนวนเมนู สินค้า และโต๊ะ\nเลือกใช้ธีมร้านค้าได้ฟรี',
  },
  {
    key: 'pro',
    name: 'Pro Plan',
    badge: 'โปร (500฿)',
    priceTag: '500 บาท/เดือน',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    tabActiveClass: 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-700',
    accentText: 'text-emerald-950',
    borderClass: 'border-emerald-300',
    bgCardClass: 'bg-emerald-50/40',
    dotColor: 'bg-emerald-600',
    focusBorder: 'focus:border-emerald-500',
    featuresPlaceholder: 'คิดเงินหน้าร้านและออเดอร์ไม่จำกัด\nดูรายงาน Dashboard ขั้นสูง & วิเคราะห์ยอดขาย\nExport รายงาน Excel (สูงสุดย้อนหลัง 3 เดือน)\nระบบจัดการพนักงานสูงสุด 3 คน\nกำหนดสิทธิ์การเข้าถึงของพนักงาน\nสร้าง QR Code โต๊ะไม่จำกัด\nไม่จำกัดจำนวนเมนู สินค้า และโต๊ะ\nเลือกใช้ธีมร้านค้าได้ฟรี',
  },
  {
    key: 'ultimate',
    name: 'Ultimate Plan',
    badge: 'คุ้มค่าที่สุด',
    priceTag: '1,999 บาท/เดือน',
    badgeClass: 'bg-purple-100 text-purple-800',
    tabActiveClass: 'bg-purple-700 text-white shadow-sm ring-1 ring-purple-700',
    accentText: 'text-purple-950',
    borderClass: 'border-purple-300',
    bgCardClass: 'bg-purple-50/40',
    dotColor: 'bg-purple-600',
    focusBorder: 'focus:border-purple-500',
    featuresPlaceholder: 'ทุกฟังก์ชันของ Pro Plan\nสิทธิ์ใช้งานธีมพรีเมียมทั้งหมด (55+ ธีม)\nDashboard ขั้นสูง & สถิติเชิงลึก\nExport รายงาน Excel (สูงสุดย้อนหลัง 3 เดือน)\nระบบจัดการพนักงานสูงสุด 10 คน\nกำหนดสิทธิ์พนักงานได้ไม่จำกัด',
  },
];

export default function AppSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [needsColumnMigration, setNeedsColumnMigration] = useState(false);
  const [migrationSql, setMigrationSql] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const [activePlanTab, setActivePlanTab] = useState<PlanKeyType | 'compare'>('free');
  const [planViewMode, setPlanViewMode] = useState<'tab' | 'grid'>('tab');

  const [settings, setSettings] = useState({
    maintenance_mode: false,
    maintenance_message: 'ระบบปิดปรับปรุงชั่วคราวเพื่อพัฒนาการบริการ คาดว่าจะเปิดให้บริการได้ปกติเร็วๆ นี้',
    force_update: false,
    latest_version: '1.0.0',
    windows_min_version: '1.0.0',
    android_min_version: '1.0.0',
    ios_min_version: '1.0.0',
    update_url: '',
    windows_update_url: '',
    android_update_url: '',
    ios_update_url: '',
    marketplace_enabled: true,
  });

  const [dashboardPermissions, setDashboardPermissions] = useState<DashboardPermissions>(DEFAULT_DASHBOARD_PERMISSIONS);
  const [planContents, setPlanContents] = useState<Record<'free' | 'go' | 'basic' | 'pro' | 'ultimate', PlanContent>>(DEFAULT_PLAN_CONTENTS);
  const [needsPlanContentsMigration, setNeedsPlanContentsMigration] = useState(false);
  const [planContentsMigrationSql, setPlanContentsMigrationSql] = useState(PLAN_CONTENTS_MIGRATION_SQL);
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
          windows_min_version: s.windows_min_version ?? '1.0.0',
          android_min_version: s.android_min_version ?? '1.0.0',
          ios_min_version: s.ios_min_version ?? '1.0.0',
          update_url: s.update_url ?? '',
          windows_update_url: s.windows_update_url ?? '',
          android_update_url: s.android_update_url ?? '',
          ios_update_url: s.ios_update_url ?? '',
          marketplace_enabled: s.marketplace_enabled ?? true,
        });

        if (s.dashboard_permissions) {
          setDashboardPermissions({
            free: { ...DEFAULT_DASHBOARD_PERMISSIONS.free, ...s.dashboard_permissions.free },
            go: { ...DEFAULT_DASHBOARD_PERMISSIONS.go, ...s.dashboard_permissions.go },
            basic: { ...DEFAULT_DASHBOARD_PERMISSIONS.basic, ...s.dashboard_permissions.basic },
            pro: { ...DEFAULT_DASHBOARD_PERMISSIONS.pro, ...s.dashboard_permissions.pro },
            ultimate: { ...DEFAULT_DASHBOARD_PERMISSIONS.ultimate, ...s.dashboard_permissions.ultimate },
          });
        }

        if (data.plan_contents) {
          setPlanContents(data.plan_contents);
        }
        if (data.needsPlanContentsMigration) {
          setNeedsPlanContentsMigration(true);
        }
        if (data.planContentsMigrationSql) {
          setPlanContentsMigrationSql(data.planContentsMigrationSql);
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
      const sanitizedPlanContents = { ...planContents };
      for (const k of ['free', 'go', 'basic', 'pro', 'ultimate'] as const) {
        if (sanitizedPlanContents[k]) {
          sanitizedPlanContents[k] = {
            ...sanitizedPlanContents[k],
            features: (sanitizedPlanContents[k].features || []).map((f: string) => String(f).trim()).filter(Boolean)
          };
        }
      }
      const res = await fetch('/api/admin/app-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          dashboard_permissions: dashboardPermissions,
          plan_contents: sanitizedPlanContents,
        })
      });
      const data = await res.json();
      if (data.needsPlanContentsMigration !== undefined) {
        setNeedsPlanContentsMigration(data.needsPlanContentsMigration);
      }
      if (data.plan_contents) {
        setPlanContents(data.plan_contents);
      }
      if (data.needsColumnMigration) {
        setNeedsColumnMigration(true);
        setMigrationSql(data.migrationSql || '');
        setStatusMsg({
          type: 'warning',
          text: 'บันทึกการตั้งค่าทั่วไปแล้ว แต่ต้องรัน SQL ใน Supabase เพื่อให้การตั้งค่ามีผลถาวรในฐานข้อมูล'
        });
      } else if (data.needsPlanContentsMigration) {
        setStatusMsg({
          type: 'warning',
          text: 'บันทึกการตั้งค่าทั่วไปแล้ว แต่ต้องรัน SQL สำหรับตาราง plan_contents ใน Supabase เพื่อให้ข้อความแพ็กเกจบันทึกถาวร'
        });
      } else if (data.success) {
        setNeedsColumnMigration(false);
        setNeedsPlanContentsMigration(false);
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

  const updatePlanContent = (plan: 'free' | 'go' | 'basic' | 'pro' | 'ultimate', field: keyof PlanContent, value: any) => {
    setPlanContents(prev => {
      const current = prev[plan] || DEFAULT_PLAN_CONTENTS[plan];
      return {
        ...prev,
        [plan]: {
          ...current,
          [field]: value
        }
      };
    });
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

  const renderPlanForm = (cfg: PlanConfig, isGrid = false) => {
    const content = planContents[cfg.key] || DEFAULT_PLAN_CONTENTS[cfg.key];
    const perm = dashboardPermissions[cfg.key];

    return (
      <div key={cfg.key} className={`border ${cfg.borderClass} rounded-2xl p-4 sm:p-5 ${cfg.bgCardClass} space-y-4 transition-all shadow-xs`}>
        {/* Header of Plan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3 border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${cfg.dotColor} shrink-0`} />
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-base font-black ${cfg.accentText}`}>{content.name || cfg.name}</span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${cfg.badgeClass}`}>
                  {content.badge || cfg.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {content.subtitle || 'กำหนดข้อความและสิทธิ์สำหรับแผนนี้'} • <span className="font-bold text-slate-700">{cfg.priceTag}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-lg font-medium text-slate-700">
              โควต้า: <strong className="text-slate-900">{(perm.max_orders ?? 0) === 0 ? 'ไม่จำกัด' : `${(perm.max_orders ?? 0).toLocaleString()} บิล/ด.`}</strong>
            </span>
            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-lg font-medium text-slate-700">
              Dashboard: <strong className="text-slate-900">{(perm.max_days ?? 0) === 0 ? 'ตลอดไป' : `${perm.max_days} วัน`}</strong>
            </span>
            {perm.allow_advanced && (
              <span className="bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg font-bold text-emerald-800">
                รายงานขั้นสูง
              </span>
            )}
          </div>
        </div>

        {/* 2-column layout in Tab mode, 1-column layout in Grid mode */}
        <div className={`grid ${isGrid ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-4 items-start`}>
          {/* Left Column: Plan Content & Texts */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                ข้อความและการแสดงผลในแอป (Plan Content)
              </span>
              <span className="text-[10px] text-slate-400">แสดงในหน้ารายการแพ็กเกจ</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">ชื่อแพ็กเกจ</label>
                <input
                  type="text"
                  value={content.name || ''}
                  onChange={e => updatePlanContent(cfg.key, 'name', e.target.value)}
                  placeholder={cfg.name}
                  className={`w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none ${cfg.focusBorder}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">ป้ายกำกับ (Badge)</label>
                <input
                  type="text"
                  value={content.badge || ''}
                  onChange={e => updatePlanContent(cfg.key, 'badge', e.target.value)}
                  placeholder={cfg.badge}
                  className={`w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none ${cfg.focusBorder}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">คำโปรยย่อย (Subtitle)</label>
              <input
                type="text"
                value={content.subtitle || ''}
                onChange={e => updatePlanContent(cfg.key, 'subtitle', e.target.value)}
                placeholder="คำโปรยสั้นๆ แนะนำแพ็กเกจ"
                className={`w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none ${cfg.focusBorder}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">เมตริก 1 (หัวข้อ)</label>
                <input
                  type="text"
                  value={content.metric_1_label || ''}
                  onChange={e => updatePlanContent(cfg.key, 'metric_1_label', e.target.value)}
                  placeholder="เช่น ORDERS หรือ THEMES"
                  className={`w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none ${cfg.focusBorder}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">เมตริก 1 (ค่าที่แสดง)</label>
                <input
                  type="text"
                  value={content.metric_1_value || ''}
                  onChange={e => updatePlanContent(cfg.key, 'metric_1_value', e.target.value)}
                  placeholder="เช่น 1,000 /เดือน หรือ ฟรีทุกธีม"
                  className={`w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none ${cfg.focusBorder}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">เมตริก 2 (หัวข้อ)</label>
                <input
                  type="text"
                  value={content.metric_2_label || ''}
                  onChange={e => updatePlanContent(cfg.key, 'metric_2_label', e.target.value)}
                  placeholder="เช่น SPEED หรือ STAFF"
                  className={`w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none ${cfg.focusBorder}`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">เมตริก 2 (ค่าที่แสดง)</label>
                <input
                  type="text"
                  value={content.metric_2_value || ''}
                  onChange={e => updatePlanContent(cfg.key, 'metric_2_value', e.target.value)}
                  placeholder="เช่น รวดเร็ว คล่องตัว"
                  className={`w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none ${cfg.focusBorder}`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-semibold text-slate-600">
                  รายการฟีเจอร์ (Features) • <span className="text-emerald-700 font-bold">{content.features?.length || 0} ข้อ</span>
                </label>
                <span className="text-[9px] text-slate-400">1 บรรทัด = 1 ข้อ</span>
              </div>
              <textarea
                rows={isGrid ? 5 : 6}
                value={(content.features || []).join('\n')}
                onChange={e => updatePlanContent(cfg.key, 'features', e.target.value.split('\n'))}
                placeholder={cfg.featuresPlaceholder}
                className={`w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none ${cfg.focusBorder} font-mono leading-relaxed resize-y`}
              />
            </div>
          </div>

          {/* Right Column: Permissions & Limits */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                สิทธิ์การใช้งานและโควต้า (Permissions & Limits)
              </span>
              <span className="text-[10px] text-slate-400">0 = ไม่จำกัด</span>
            </div>

            {/* โควต้าสแกนสั่งอาหาร */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">โควต้าสแกนสั่งอาหาร</p>
                <p className="text-[10px] text-slate-500">จำกัดจำนวนบิลออเดอร์ต่อเดือน</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-700">
                  {(perm.max_orders ?? 0) === 0 ? 'ไม่จำกัด' : `${(perm.max_orders ?? 0).toLocaleString()} บิล/ด.`}
                </span>
                <input
                  type="number"
                  min={0}
                  value={perm.max_orders ?? 0}
                  onChange={e => updatePlanPerm(cfg.key, 'max_orders', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-right focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* ดู Dashboard ย้อนหลัง */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">ดู Dashboard ย้อนหลัง</p>
                <p className="text-[10px] text-slate-500">กราฟยอดขายและสรุปสถิติ (วัน)</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-700">
                  {perm.max_days === 0 ? 'ตลอดไป' : `${perm.max_days} วัน`}
                </span>
                <input
                  type="number"
                  min={0}
                  value={perm.max_days ?? 0}
                  onChange={e => updatePlanPerm(cfg.key, 'max_days', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-right focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* ประวัติการขายย้อนหลัง */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">ประวัติการขายย้อนหลัง</p>
                <p className="text-[10px] text-slate-500">ค้นหาบิลและใบเสร็จ (วัน)</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-700">
                  {perm.receipt_max_days === 0 ? 'ตลอดไป' : `${perm.receipt_max_days} วัน`}
                </span>
                <input
                  type="number"
                  min={0}
                  value={perm.receipt_max_days ?? 0}
                  onChange={e => updatePlanPerm(cfg.key, 'receipt_max_days', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-right focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* รายงานขั้นสูง */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">รายงานขั้นสูง (ส่วนล่าง)</p>
                <p className="text-[10px] text-slate-500">ยอดขายรายชั่วโมง, วิธีชำระเงิน, โต๊ะ, พนักงาน</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={perm.allow_advanced}
                  onChange={e => updatePlanPerm(cfg.key, 'allow_advanced', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>

            {/* อาหาร/เมนู สูงสุด */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">จำนวนอาหาร / เมนู สูงสุด</p>
                <p className="text-[10px] text-slate-500">จำกัดจำนวนรายการเมนู</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-700">
                  {perm.max_food_items === 0 ? 'ไม่จำกัด' : `${perm.max_food_items} รายการ`}
                </span>
                <input
                  type="number"
                  min={0}
                  value={perm.max_food_items ?? 0}
                  onChange={e => updatePlanPerm(cfg.key, 'max_food_items', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-right focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* สินค้าทั่วไป สูงสุด */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">จำนวนสินค้าทั่วไป สูงสุด</p>
                <p className="text-[10px] text-slate-500">จำกัดจำนวนสินค้า</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-700">
                  {perm.max_products === 0 ? 'ไม่จำกัด' : `${perm.max_products} รายการ`}
                </span>
                <input
                  type="number"
                  min={0}
                  value={perm.max_products ?? 0}
                  onChange={e => updatePlanPerm(cfg.key, 'max_products', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-right focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* โต๊ะสูงสุด */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">จำนวนโต๊ะสูงสุด</p>
                <p className="text-[10px] text-slate-500">จำกัดจำนวนโต๊ะในร้านค้า</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-700">
                  {perm.max_tables === 0 ? 'ไม่จำกัด' : `${perm.max_tables} โต๊ะ`}
                </span>
                <input
                  type="number"
                  min={0}
                  value={perm.max_tables ?? 0}
                  onChange={e => updatePlanPerm(cfg.key, 'max_tables', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-right focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComparisonTable = () => {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">ตารางเปรียบเทียบสิทธิ์และฟังก์ชันทุกแพ็กเกจ (Plan Comparison Overview)</h3>
            <p className="text-[11px] text-slate-500">ดูภาพรวมความแตกต่างระหว่างแพลนได้ทันทีในหน้าเดียว</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700">
                <th className="p-3 font-bold w-48">ฟังก์ชัน / สิทธิ์การใช้งาน</th>
                {PLAN_CONFIGS.map(c => (
                  <th key={c.key} className="p-3 font-extrabold text-center min-w-[130px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className={c.accentText}>{c.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${c.badgeClass}`}>{c.priceTag}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr>
                <td className="p-3 font-semibold bg-slate-50/50">โควต้าสแกนสั่งอาหาร</td>
                {PLAN_CONFIGS.map(c => {
                  const o = dashboardPermissions[c.key]?.max_orders;
                  return (
                    <td key={c.key} className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${o === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                        {o === 0 ? 'ไม่จำกัด' : `${o?.toLocaleString()} บิล/ด.`}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-slate-50/50">ดู Dashboard ย้อนหลัง</td>
                {PLAN_CONFIGS.map(c => {
                  const d = dashboardPermissions[c.key]?.max_days;
                  return (
                    <td key={c.key} className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${d === 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
                        {d === 0 ? 'ไม่จำกัด' : `${d} วัน`}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-slate-50/50">ประวัติการขายย้อนหลัง</td>
                {PLAN_CONFIGS.map(c => {
                  const h = dashboardPermissions[c.key]?.receipt_max_days;
                  return (
                    <td key={c.key} className="p-3 text-center font-bold">
                      {h === 0 ? 'ตลอดไป' : `${h} วัน`}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-slate-50/50">รายงานขั้นสูง (ยอดชั่วโมง/พนักงาน)</td>
                {PLAN_CONFIGS.map(c => {
                  const adv = dashboardPermissions[c.key]?.allow_advanced;
                  return (
                    <td key={c.key} className="p-3 text-center">
                      {adv ? (
                        <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                          <IconCheck size={14} /> เปิดใช้งาน
                        </span>
                      ) : (
                        <span className="text-slate-400">ปิด</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr className="bg-amber-50/40">
                <td className="p-3 font-extrabold text-amber-950">Export รายงาน Excel 📊</td>
                {PLAN_CONFIGS.map(c => {
                  const hasExcel = c.key === 'pro' || c.key === 'ultimate';
                  return (
                    <td key={c.key} className="p-3 text-center">
                      {hasExcel ? (
                        <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-2xs">
                          สูงสุด 3 เดือน
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-slate-50/50">จำนวนโต๊ะสูงสุด</td>
                {PLAN_CONFIGS.map(c => {
                  const t = dashboardPermissions[c.key]?.max_tables;
                  return (
                    <td key={c.key} className="p-3 text-center">
                      {t === 0 ? 'ไม่จำกัด' : `${t} โต๊ะ`}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-slate-50/50">จำนวนอาหาร / เมนู สูงสุด</td>
                {PLAN_CONFIGS.map(c => {
                  const m = dashboardPermissions[c.key]?.max_food_items;
                  return (
                    <td key={c.key} className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${m === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {m === 0 ? 'ไม่จำกัด' : `${m} รายการ`}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-slate-50/50">จำนวนสินค้าทั่วไป สูงสุด</td>
                {PLAN_CONFIGS.map(c => {
                  const p = dashboardPermissions[c.key]?.max_products;
                  return (
                    <td key={c.key} className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${p === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                        {p === 0 ? 'ไม่จำกัด' : `${p} รายการ`}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-3 font-semibold bg-slate-50/50">จัดการแก้ไข</td>
                {PLAN_CONFIGS.map(c => (
                  <td key={c.key} className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePlanTab(c.key);
                        setPlanViewMode('tab');
                      }}
                      className="text-[11px] font-bold text-slate-700 hover:text-emerald-700 underline cursor-pointer"
                    >
                      แก้ไข {c.name}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

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
            <span className="text-sm font-bold">แจ้งเตือน: ตาราง system_settings ยังขาดคอลัมน์ใหม่สำหรับแยกแพลตฟอร์ม</span>
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

      {needsPlanContentsMigration && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-sm font-bold block">แจ้งเตือน: ยังไม่มีตาราง plan_contents ในฐานข้อมูล Supabase</span>
              <span className="text-xs text-amber-700">คัดลอกคำสั่ง SQL ด้านล่างไปรันใน Supabase SQL Editor เพื่อสร้างตารางและเปิดให้บันทึกข้อความแพ็กเกจถาวร</span>
            </div>
            <button
              type="button"
              onClick={() => copySql(planContentsMigrationSql || PLAN_CONTENTS_MIGRATION_SQL)}
              className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <IconCopy size={13} /> คัดลอก SQL ไปรันใน Supabase
            </button>
          </div>
          <pre className="bg-slate-900 text-slate-100 rounded-xl p-3 text-[11px] font-mono overflow-x-auto max-h-48">
            {planContentsMigrationSql || PLAN_CONTENTS_MIGRATION_SQL}
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
                <p className="text-sm font-bold text-[#2C4A34]">สิทธิ์หน้าแดชบอร์ด รายงาน และข้อความแพ็กเกจ (Subscription Plans & Content)</p>
                <p className="text-[10px] text-[#869E8D]">กำหนดข้อความแพ็กเกจ (ชื่อ, ป้าย, คำโปรย, เมตริก, ฟีเจอร์) และสิทธิ์เข้าถึงรายงาน/แดชบอร์ดแยกตามแผน</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Control Bar: Tabs & View Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
              {/* Plan Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                {PLAN_CONFIGS.map(c => {
                  const isActive = planViewMode === 'tab' && activePlanTab === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setActivePlanTab(c.key);
                        setPlanViewMode('tab');
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? c.tabActiveClass
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${c.dotColor}`} />
                      <span>{c.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isActive ? 'bg-white/20 text-white' : c.badgeClass}`}>
                        {c.badge}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setActivePlanTab('compare');
                    setPlanViewMode('tab');
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    planViewMode === 'tab' && activePlanTab === 'compare'
                      ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-600'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80'
                  }`}
                >
                  <span>📊 ตารางเปรียบเทียบ</span>
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-end md:self-auto text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setPlanViewMode('tab')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${planViewMode === 'tab' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'}`}
                >
                  แท็บทีละแผน (กระชับ)
                </button>
                <button
                  type="button"
                  onClick={() => setPlanViewMode('grid')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${planViewMode === 'grid' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'}`}
                >
                  แสดงทั้งหมด (กริด)
                </button>
              </div>
            </div>

            {/* Content Area */}
            {planViewMode === 'tab' ? (
              activePlanTab === 'compare' ? (
                renderComparisonTable()
              ) : (
                (() => {
                  const currentCfg = PLAN_CONFIGS.find(c => c.key === activePlanTab) || PLAN_CONFIGS[0];
                  return renderPlanForm(currentCfg);
                })()
              )
            ) : (
              <div className="space-y-6">
                {renderComparisonTable()}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PLAN_CONFIGS.map(cfg => renderPlanForm(cfg, true))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Maintenance ── */}        {/* ── Maintenance ── */}
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
        <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 bg-[#FAF9F5] border-b border-[#EFECE6]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <IconUpdate size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#2C4A34]">ควบคุมเวอร์ชันแอป (Multi-Platform Version Control)</p>
                <p className="text-[10.5px] text-[#869E8D]">กำหนดเวอร์ชันขั้นต่ำและลิงก์ดาวน์โหลดแยกตาม Windows (EXE), Android, iOS</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-[#EFECE6]">
              <div className="text-right">
                <span className="block text-[11px] font-bold text-[#2C4A34]">Force Update</span>
                <span className="block text-[9px] text-[#869E8D]">บังคับอัปเดต</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.force_update}
                  onChange={e => setSettings({ ...settings, force_update: e.target.checked })}
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#5F8565] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Global Latest Version */}
            <div className="bg-[#F8FAF8] border border-[#E2EBE4] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2C4A34]">เวอร์ชันล่าสุดโดยรวม (Latest App Version)</label>
                <p className="text-[11px] text-[#869E8D]">เวอร์ชันหลักที่ระบบแนะนำให้ผู้ใช้งานทุกแพลตฟอร์มอัปเดต</p>
              </div>
              <div className="w-full sm:w-48">
                <input type="text" value={settings.latest_version} placeholder="2.0.5"
                  onChange={e => setSettings({ ...settings, latest_version: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#5F8565]" />
              </div>
            </div>

            {/* 3 Platform Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Windows EXE */}
              <div className="border border-blue-100 bg-[#FBFDFF] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-blue-700 pb-2 border-b border-blue-50">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                    <IconWindows size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1E3A8A]">Windows Desktop (EXE)</h4>
                    <span className="text-[9.5px] text-blue-500 font-medium">โปรแกรมคอมพิวเตอร์ / แคชเชียร์</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-semibold text-[#1E3A8A] mb-1">เวอร์ชันขั้นต่ำ Windows</label>
                  <input type="text" value={settings.windows_min_version} placeholder="1.0.0"
                    onChange={e => setSettings({ ...settings, windows_min_version: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-[10.5px] font-semibold text-[#1E3A8A] mb-1">ลิงก์ดาวน์โหลด EXE (Direct / Drive)</label>
                  <input type="text" value={settings.windows_update_url} placeholder="https://example.com/pos-installer.exe"
                    onChange={e => setSettings({ ...settings, windows_update_url: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500" />
                  <span className="text-[9.5px] text-slate-400 mt-1 block">ลิงก์สำหรับดาวน์โหลดไฟล์ติดตั้ง .exe</span>
                </div>
              </div>

              {/* Android */}
              <div className="border border-emerald-100 bg-[#FBFEFB] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 pb-2 border-b border-emerald-50">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                    <IconAndroid size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#14532D]">Android (Play Store / APK)</h4>
                    <span className="text-[9.5px] text-emerald-600 font-medium">มือถือและแท็บเล็ต Android</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-semibold text-[#14532D] mb-1">เวอร์ชันขั้นต่ำ Android</label>
                  <input type="text" value={settings.android_min_version} placeholder="1.0.0"
                    onChange={e => setSettings({ ...settings, android_min_version: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-500" />
                </div>

                <div>
                  <label className="block text-[10.5px] font-semibold text-[#14532D] mb-1">ลิงก์ Play Store หรือ APK</label>
                  <input type="text" value={settings.android_update_url} placeholder="https://play.google.com/store/apps/details?id=..."
                    onChange={e => setSettings({ ...settings, android_update_url: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-500" />
                  <span className="text-[9.5px] text-slate-400 mt-1 block">ลิงก์เปิดหน้า Play Store หรือไฟล์ .apk</span>
                </div>
              </div>

              {/* iOS */}
              <div className="border border-slate-200 bg-[#FCFCFD] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 pb-2 border-b border-slate-100">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                    <IconApple size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">iOS (Apple App Store)</h4>
                    <span className="text-[9.5px] text-slate-500 font-medium">iPhone และ iPad</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">เวอร์ชันขั้นต่ำ iOS</label>
                  <input type="text" value={settings.ios_min_version} placeholder="1.0.0"
                    onChange={e => setSettings({ ...settings, ios_min_version: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-slate-500" />
                </div>

                <div>
                  <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">ลิงก์ Apple App Store</label>
                  <input type="text" value={settings.ios_update_url} placeholder="https://apps.apple.com/app/id..."
                    onChange={e => setSettings({ ...settings, ios_update_url: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-slate-500" />
                  <span className="text-[9.5px] text-slate-400 mt-1 block">ลิงก์เปิดหน้า App Store บน iOS</span>
                </div>
              </div>
            </div>

            {/* Fallback / Default Update URL */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[10.5px] font-semibold text-[#5F8565] mb-1">ลิงก์สำรองเริ่มต้น (Default Fallback Link)</label>
              <input type="text" value={settings.update_url}
                onChange={e => setSettings({ ...settings, update_url: e.target.value })}
                placeholder="https://yourdomain.com/download"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#5F8565]" />
              <span className="text-[10px] text-slate-400 mt-1 block">จะถูกนำมาใช้กรณีที่แพลตฟอร์มนั้นไม่ได้ระบุลิงก์เฉพาะไว้</span>
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
