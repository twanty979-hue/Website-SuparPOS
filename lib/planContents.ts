export interface PlanContent {
  plan_key: 'free' | 'basic' | 'pro' | 'ultimate';
  name: string;
  subtitle: string;
  badge: string;
  metric_1_label: string;
  metric_1_value: string;
  metric_2_label: string;
  metric_2_value: string;
  features: string[];
}

export interface PublicPlanItem {
  id: string;
  plan_key: 'free' | 'basic' | 'pro' | 'ultimate';
  name: string;
  subtitle: string;
  badge: string;
  price_monthly: number;          // in THB (ลด 15% เมื่อซื้อผ่านเว็บ)
  original_price_monthly?: number; // in THB (ราคาปกติ)
  price_yearly: number;           // in THB (ลด 25% รายปี)
  original_price_yearly?: number;  // in THB (ราคาเต็ม 12 เดือน)
  coins_monthly: number;
  coins_yearly: number;
  metric_1_label: string;
  metric_1_value: string;
  metric_2_label: string;
  metric_2_value: string;
  features: string[];
  isPopular?: boolean;
}

export const DEFAULT_PUBLIC_PLANS: PublicPlanItem[] = [
  {
    id: 'free',
    plan_key: 'free',
    name: 'Free Plan',
    subtitle: 'ใช้งานได้ตลอดชีพ',
    badge: 'ฟรี',
    price_monthly: 0,
    price_yearly: 0,
    coins_monthly: 0,
    coins_yearly: 0,
    metric_1_label: 'THEMES',
    metric_1_value: 'ฟรีทุกธีม',
    metric_2_label: 'ORDERS',
    metric_2_value: '1,000 /เดือน',
    features: ['คิดเงินหน้าร้านไม่จำกัด', '1000 ออเดอร์/เดือน', 'เลือกใช้ธีมร้านได้ฟรีทั้งหมด', 'Dashboard ย้อนหลัง 30 วัน'],
  },
  {
    id: 'basic',
    plan_key: 'basic',
    name: 'Basic Plan',
    subtitle: 'เริ่มต้นทำธุรกิจ',
    badge: 'เบสิก',
    price_monthly: 212.5,
    original_price_monthly: 250,
    price_yearly: 2250,
    original_price_yearly: 3000,
    coins_monthly: 100,
    coins_yearly: 1440,
    metric_1_label: 'THEMES',
    metric_1_value: 'ฟรีทุกธีม',
    metric_2_label: 'ORDERS',
    metric_2_value: 'ไม่จำกัด',
    features: ['คิดเงินได้ไม่จำกัด', 'ออเดอร์ไม่จำกัด', 'เลือกใช้ธีมร้านได้ฟรีทั้งหมด', 'Dashboard ไม่จำกัดย้อนหลัง', 'สร้าง QR Code ไม่จำกัด', 'Export รายงาน (Excel)'],
  },
  {
    id: 'pro',
    plan_key: 'pro',
    name: 'Pro Plan',
    subtitle: 'ยอดนิยมสำหรับร้านอาหาร',
    badge: 'ยอดนิยม',
    price_monthly: 425,
    original_price_monthly: 500,
    price_yearly: 4500,
    original_price_yearly: 6000,
    coins_monthly: 150,
    coins_yearly: 2160,
    metric_1_label: 'STAFF',
    metric_1_value: 'สูงสุด 3 คน',
    metric_2_label: 'ORDERS',
    metric_2_value: 'ไม่จำกัด',
    features: ['คิดเงินได้ไม่จำกัด', 'ออเดอร์ไม่จำกัด', 'เลือกใช้ธีมร้านได้ฟรีทั้งหมด', 'Dashboard ขั้นสูง', 'Export รายงาน (Excel)', 'ระบบพนักงานสูงสุด 3 คน', 'กำหนดสิทธิ์พนักงาน'],
    isPopular: true,
  },
  {
    id: 'ultimate',
    plan_key: 'ultimate',
    name: 'Ultimate Plan',
    subtitle: 'ฟูลออปชั่น ทุกฟังก์ชัน',
    badge: 'คุ้มค่าที่สุด',
    price_monthly: 1999,
    original_price_monthly: 1999,
    price_yearly: 19190,
    original_price_yearly: 23988,
    coins_monthly: 200,
    coins_yearly: 2880,
    metric_1_label: 'THEMES',
    metric_1_value: 'ฟรีทุกธีม',
    metric_2_label: 'ORDERS',
    metric_2_value: 'ไม่จำกัด',
    features: ['สิทธิ์ใช้งานได้ทุกธีม (55+ ธีม)', 'Dashboard ขั้นสูง & สถิติแบบละเอียด', 'Export รายงาน (Excel)', 'ระบบพนักงานสูงสุด 10 คน', 'กำหนดสิทธิ์พนักงานได้ไม่จำกัด'],
  },
];

export const DEFAULT_PLAN_CONTENTS: Record<'free' | 'basic' | 'pro' | 'ultimate', PlanContent> = {
  free: {
    plan_key: 'free',
    name: 'Free Plan',
    subtitle: 'ใช้งานได้ตลอดชีพ',
    badge: 'ฟรี',
    metric_1_label: 'THEMES',
    metric_1_value: 'ฟรีทุกธีม',
    metric_2_label: 'ORDERS',
    metric_2_value: '1,000 /เดือน',
    features: ['คิดเงินหน้าร้านไม่จำกัด', '1000 ออเดอร์/เดือน', 'เลือกใช้ธีมร้านได้ฟรีทั้งหมด', 'Dashboard ย้อนหลัง 30 วัน'],
  },
  basic: {
    plan_key: 'basic',
    name: 'Basic Plan',
    subtitle: 'เริ่มต้นทำธุรกิจ',
    badge: 'เบสิก',
    metric_1_label: 'THEMES',
    metric_1_value: 'ฟรีทุกธีม',
    metric_2_label: 'ORDERS',
    metric_2_value: 'ไม่จำกัด',
    features: ['คิดเงินได้ไม่จำกัด', 'ออเดอร์ไม่จำกัด', 'เลือกใช้ธีมร้านได้ฟรีทั้งหมด', 'Dashboard ไม่จำกัดย้อนหลัง'],
  },
  pro: {
    plan_key: 'pro',
    name: 'Pro Plan',
    subtitle: 'ยอดนิยมสำหรับร้านอาหาร',
    badge: 'โปร',
    metric_1_label: 'STAFF',
    metric_1_value: 'สูงสุด 3 คน',
    metric_2_label: 'ORDERS',
    metric_2_value: 'ไม่จำกัด',
    features: ['คิดเงินได้ไม่จำกัด', 'ออเดอร์ไม่จำกัด', 'เลือกใช้ธีมร้านได้ฟรีทั้งหมด', 'Dashboard ขั้นสูง', 'Export รายงาน (Excel)', 'ระบบพนักงานสูงสุด 3 คน'],
  },
  ultimate: {
    plan_key: 'ultimate',
    name: 'Ultimate Plan',
    subtitle: 'ฟูลออปชั่น ทุกฟังก์ชัน',
    badge: 'อัลติเมท',
    metric_1_label: 'THEMES',
    metric_1_value: 'ฟรีทุกธีม',
    metric_2_label: 'ORDERS',
    metric_2_value: 'ไม่จำกัด',
    features: ['สิทธิ์ใช้งานได้ทุกธีม', 'Dashboard ขั้นสูง', 'Export รายงาน (Excel)', 'ระบบพนักงานสูงสุด 10 คน'],
  },
};

export const PLAN_CONTENTS_MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS public.plan_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  metric_1_label TEXT DEFAULT '',
  metric_1_value TEXT DEFAULT '',
  metric_2_label TEXT DEFAULT '',
  metric_2_value TEXT DEFAULT '',
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-seed default data
INSERT INTO public.plan_contents (plan_key, name, subtitle, badge, metric_1_label, metric_1_value, metric_2_label, metric_2_value, features)
VALUES
  ('free', 'Free Plan', 'ใช้งานได้ตลอดชีพ', 'ฟรี', 'POS', 'ขายหน้าร้านไม่จำกัด', 'สแกนสั่งอาหาร', 'ต่อเดือน', '["คิดเงินหน้าร้านไม่จำกัด", "1000 ออเดอร์/เดือน", "Dashboard ย้อนหลัง 30 วัน"]'::jsonb),
  ('basic', 'Basic Plan', 'เริ่มต้นทำธุรกิจ', 'เบสิก', 'THEMES', '4 ธีม', 'ORDERS', 'ไม่จำกัด', '["คิดเงินได้ไม่จำกัด", "ออเดอร์ไม่จำกัด", "Dashboard ไม่จำกัดย้อนหลัง"]'::jsonb),
  ('pro', 'Pro Plan', 'ยอดนิยมสำหรับร้านอาหาร', 'โปร', 'THEMES', '7 ธีม', 'ORDERS', 'ไม่จำกัด', '["คิดเงินได้ไม่จำกัด", "ออเดอร์ไม่จำกัด", "Dashboard ขั้นสูง", "Export รายงาน (Excel)", "ระบบพนักงานสูงสุด 3 คน"]'::jsonb),
  ('ultimate', 'Ultimate Plan', 'ฟูลออปชั่น ทุกฟังก์ชัน', 'อัลติเมท', 'THEMES', '55 ธีม + พรีเมียม', 'ORDERS', 'ไม่จำกัด', '["สิทธิ์ใช้งานได้ทุกธีม", "Dashboard ขั้นสูง", "Export รายงาน (Excel)", "ระบบพนักงานสูงสุด 10 คน"]'::jsonb)
ON CONFLICT (plan_key) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  badge = EXCLUDED.badge,
  metric_1_label = EXCLUDED.metric_1_label,
  metric_1_value = EXCLUDED.metric_1_value,
  metric_2_label = EXCLUDED.metric_2_label,
  metric_2_value = EXCLUDED.metric_2_value,
  features = EXCLUDED.features;
`.trim();

export function mergePlanContents(dbRows: any[] | null | undefined): Record<'free' | 'basic' | 'pro' | 'ultimate', PlanContent> {
  const result = {
    free: { ...DEFAULT_PLAN_CONTENTS.free },
    basic: { ...DEFAULT_PLAN_CONTENTS.basic },
    pro: { ...DEFAULT_PLAN_CONTENTS.pro },
    ultimate: { ...DEFAULT_PLAN_CONTENTS.ultimate },
  };
  if (!Array.isArray(dbRows)) return result;

  for (const row of dbRows) {
    const key = String(row.plan_key || '').toLowerCase() as 'free' | 'basic' | 'pro' | 'ultimate';
    if (result[key]) {
      result[key] = {
        plan_key: key,
        name: row.name || result[key].name,
        subtitle: row.subtitle !== undefined && row.subtitle !== null ? String(row.subtitle) : result[key].subtitle,
        badge: row.badge !== undefined && row.badge !== null ? String(row.badge) : result[key].badge,
        metric_1_label: row.metric_1_label !== undefined && row.metric_1_label !== null ? String(row.metric_1_label) : result[key].metric_1_label,
        metric_1_value: row.metric_1_value !== undefined && row.metric_1_value !== null ? String(row.metric_1_value) : result[key].metric_1_value,
        metric_2_label: row.metric_2_label !== undefined && row.metric_2_label !== null ? String(row.metric_2_label) : result[key].metric_2_label,
        metric_2_value: row.metric_2_value !== undefined && row.metric_2_value !== null ? String(row.metric_2_value) : result[key].metric_2_value,
        features: Array.isArray(row.features) ? row.features : result[key].features,
      };
    }
  }

  return result;
}
