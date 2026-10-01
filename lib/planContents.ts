export interface PlanContent {
  plan_key: 'free' | 'go' | 'basic' | 'pro' | 'ultimate';
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
  plan_key: 'free' | 'go' | 'basic' | 'pro' | 'ultimate';
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
    metric_2_value: '300 /เดือน',
    features: [
      'คิดเงินหน้าร้านไม่จำกัด',
      'สแกนสั่งอาหาร 300 ออเดอร์/เดือน',
      'ดูรายงาน Dashboard ย้อนหลัง 30 วัน',
      'จัดการอาหาร / เมนู สูงสุด 50 รายการ',
      'สินค้าทั่วไป ไม่จำกัดจำนวน',
      'รองรับโต๊ะสูงสุด 10 โต๊ะ',
      'เลือกใช้ธีมร้านค้าได้ฟรี',
    ],
  },
  {
    id: 'go',
    plan_key: 'go',
    name: 'Go Plan',
    subtitle: 'เริ่มต้นธุรกิจคล่องตัว',
    badge: 'โก',
    price_monthly: 99,
    original_price_monthly: 99,
    price_yearly: 990,
    original_price_yearly: 1188,
    coins_monthly: 0,
    coins_yearly: 0,
    metric_1_label: 'SPEED',
    metric_1_value: 'รวดเร็ว คล่องตัว',
    metric_2_label: 'ORDERS',
    metric_2_value: '1,000 /เดือน',
    features: [
      'คิดเงินหน้าร้านไม่จำกัด',
      'สแกนสั่งอาหาร 1,000 ออเดอร์/เดือน',
      'ดูรายงาน Dashboard ย้อนหลัง 60 วัน',
      'ประวัติการขายย้อนหลัง 30 วัน',
      'ไม่จำกัดจำนวนเมนูและสินค้า',
      'ไม่จำกัดจำนวนโต๊ะ',
      'เลือกใช้ธีมร้านค้าได้ฟรี',
    ],
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
    metric_1_label: 'ORDERS',
    metric_1_value: 'ไม่จำกัด',
    metric_2_label: 'THEMES',
    metric_2_value: 'ฟรีทุกธีม',
    features: [
      'คิดเงินหน้าร้านไม่จำกัด',
      'ออเดอร์ไม่จำกัด (Unlimited Orders)',
      'ดูรายงาน Dashboard ย้อนหลังไม่จำกัด',
      'ประวัติการขายไม่จำกัดย้อนหลัง',
      'สร้าง QR Code โต๊ะไม่จำกัด',
      'ไม่จำกัดจำนวนเมนู สินค้า และโต๊ะ',
      'เลือกใช้ธีมร้านค้าได้ฟรี',
    ],
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
    features: [
      'คิดเงินหน้าร้านและออเดอร์ไม่จำกัด',
      'ดูรายงาน Dashboard ขั้นสูง & วิเคราะห์ยอดขาย',
      'Export รายงาน Excel (สูงสุดย้อนหลัง 3 เดือน)',
      'ระบบจัดการพนักงานสูงสุด 3 คน',
      'กำหนดสิทธิ์การเข้าถึงของพนักงาน',
      'สร้าง QR Code โต๊ะไม่จำกัด',
      'ไม่จำกัดจำนวนเมนู สินค้า และโต๊ะ',
      'เลือกใช้ธีมร้านค้าได้ฟรี',
    ],
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
    metric_1_value: '55+ ธีมพรีเมียม',
    metric_2_label: 'STAFF',
    metric_2_value: 'สูงสุด 10 คน',
    features: [
      'ทุกฟังก์ชันของ Pro Plan',
      'สิทธิ์ใช้งานธีมพรีเมียมทั้งหมด (55+ ธีม)',
      'Dashboard ขั้นสูง & สถิติเชิงลึก',
      'Export รายงาน Excel (สูงสุดย้อนหลัง 3 เดือน)',
      'ระบบจัดการพนักงานสูงสุด 10 คน',
      'กำหนดสิทธิ์พนักงานได้ไม่จำกัด',
    ],
  },
];

export const DEFAULT_PLAN_CONTENTS: Record<'free' | 'go' | 'basic' | 'pro' | 'ultimate', PlanContent> = {
  free: {
    plan_key: 'free',
    name: 'Free Plan',
    subtitle: 'ใช้งานได้ตลอดชีพ',
    badge: 'ฟรี',
    metric_1_label: 'THEMES',
    metric_1_value: 'ฟรีทุกธีม',
    metric_2_label: 'ORDERS',
    metric_2_value: '300 /เดือน',
    features: [
      'คิดเงินหน้าร้านไม่จำกัด',
      'สแกนสั่งอาหาร 300 ออเดอร์/เดือน',
      'ดูรายงาน Dashboard ย้อนหลัง 30 วัน',
      'จัดการอาหาร / เมนู สูงสุด 50 รายการ',
      'สินค้าทั่วไป ไม่จำกัดจำนวน',
      'รองรับโต๊ะสูงสุด 10 โต๊ะ',
      'เลือกใช้ธีมร้านค้าได้ฟรี',
    ],
  },
  go: {
    plan_key: 'go',
    name: 'Go Plan',
    subtitle: 'เริ่มต้นธุรกิจคล่องตัว',
    badge: 'โก',
    metric_1_label: 'SPEED',
    metric_1_value: 'รวดเร็ว คล่องตัว',
    metric_2_label: 'ORDERS',
    metric_2_value: '1,000 /เดือน',
    features: [
      'คิดเงินหน้าร้านไม่จำกัด',
      'สแกนสั่งอาหาร 1,000 ออเดอร์/เดือน',
      'ดูรายงาน Dashboard ย้อนหลัง 60 วัน',
      'ประวัติการขายย้อนหลัง 30 วัน',
      'ไม่จำกัดจำนวนเมนูและสินค้า',
      'ไม่จำกัดจำนวนโต๊ะ',
      'เลือกใช้ธีมร้านค้าได้ฟรี',
    ],
  },
  basic: {
    plan_key: 'basic',
    name: 'Basic Plan',
    subtitle: 'เริ่มต้นทำธุรกิจ',
    badge: 'เบสิก',
    metric_1_label: 'ORDERS',
    metric_1_value: 'ไม่จำกัด',
    metric_2_label: 'THEMES',
    metric_2_value: 'ฟรีทุกธีม',
    features: [
      'คิดเงินหน้าร้านไม่จำกัด',
      'ออเดอร์ไม่จำกัด (Unlimited Orders)',
      'ดูรายงาน Dashboard ย้อนหลังไม่จำกัด',
      'ประวัติการขายไม่จำกัดย้อนหลัง',
      'สร้าง QR Code โต๊ะไม่จำกัด',
      'ไม่จำกัดจำนวนเมนู สินค้า และโต๊ะ',
      'เลือกใช้ธีมร้านค้าได้ฟรี',
    ],
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
    features: [
      'คิดเงินหน้าร้านและออเดอร์ไม่จำกัด',
      'ดูรายงาน Dashboard ขั้นสูง & วิเคราะห์ยอดขาย',
      'Export รายงาน Excel (สูงสุดย้อนหลัง 3 เดือน)',
      'ระบบจัดการพนักงานสูงสุด 3 คน',
      'กำหนดสิทธิ์การเข้าถึงของพนักงาน',
      'สร้าง QR Code โต๊ะไม่จำกัด',
      'ไม่จำกัดจำนวนเมนู สินค้า และโต๊ะ',
      'เลือกใช้ธีมร้านค้าได้ฟรี',
    ],
  },
  ultimate: {
    plan_key: 'ultimate',
    name: 'Ultimate Plan',
    subtitle: 'ฟูลออปชั่น ทุกฟังก์ชัน',
    badge: 'อัลติเมท',
    metric_1_label: 'THEMES',
    metric_1_value: '55+ ธีมพรีเมียม',
    metric_2_label: 'STAFF',
    metric_2_value: 'สูงสุด 10 คน',
    features: [
      'ทุกฟังก์ชันของ Pro Plan',
      'สิทธิ์ใช้งานธีมพรีเมียมทั้งหมด (55+ ธีม)',
      'Dashboard ขั้นสูง & สถิติเชิงลึก',
      'Export รายงาน Excel (สูงสุดย้อนหลัง 3 เดือน)',
      'ระบบจัดการพนักงานสูงสุด 10 คน',
      'กำหนดสิทธิ์พนักงานได้ไม่จำกัด',
    ],
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
  ('free', 'Free Plan', 'ใช้งานได้ตลอดชีพ', 'ฟรี', 'THEMES', 'ฟรีทุกธีม', 'ORDERS', '300 /เดือน', '["คิดเงินหน้าร้านไม่จำกัด", "สแกนสั่งอาหาร 300 ออเดอร์/เดือน", "ดูรายงาน Dashboard ย้อนหลัง 30 วัน", "จัดการอาหาร / เมนู สูงสุด 50 รายการ", "สินค้าทั่วไป ไม่จำกัดจำนวน", "รองรับโต๊ะสูงสุด 10 โต๊ะ", "เลือกใช้ธีมร้านค้าได้ฟรี"]'::jsonb),
  ('go', 'Go Plan', 'เริ่มต้นธุรกิจคล่องตัว', 'โก', 'SPEED', 'รวดเร็ว คล่องตัว', 'ORDERS', '1,000 /เดือน', '["คิดเงินหน้าร้านไม่จำกัด", "สแกนสั่งอาหาร 1,000 ออเดอร์/เดือน", "ดูรายงาน Dashboard ย้อนหลัง 60 วัน", "ประวัติการขายย้อนหลัง 30 วัน", "ไม่จำกัดจำนวนเมนูและสินค้า", "ไม่จำกัดจำนวนโต๊ะ", "เลือกใช้ธีมร้านค้าได้ฟรี"]'::jsonb),
  ('basic', 'Basic Plan', 'เริ่มต้นทำธุรกิจ', 'เบสิก', 'ORDERS', 'ไม่จำกัด', 'THEMES', 'ฟรีทุกธีม', '["คิดเงินหน้าร้านไม่จำกัด", "ออเดอร์ไม่จำกัด (Unlimited Orders)", "ดูรายงาน Dashboard ย้อนหลังไม่จำกัด", "ประวัติการขายไม่จำกัดย้อนหลัง", "สร้าง QR Code โต๊ะไม่จำกัด", "ไม่จำกัดจำนวนเมนู สินค้า และโต๊ะ", "เลือกใช้ธีมร้านค้าได้ฟรี"]'::jsonb),
  ('pro', 'Pro Plan', 'ยอดนิยมสำหรับร้านอาหาร', 'โปร', 'STAFF', 'สูงสุด 3 คน', 'ORDERS', 'ไม่จำกัด', '["คิดเงินหน้าร้านและออเดอร์ไม่จำกัด", "ดูรายงาน Dashboard ขั้นสูง & วิเคราะห์ยอดขาย", "Export รายงาน Excel (สูงสุดย้อนหลัง 3 เดือน)", "ระบบจัดการพนักงานสูงสุด 3 คน", "กำหนดสิทธิ์การเข้าถึงของพนักงาน", "สร้าง QR Code โต๊ะไม่จำกัด", "ไม่จำกัดจำนวนเมนู สินค้า และโต๊ะ", "เลือกใช้ธีมร้านค้าได้ฟรี"]'::jsonb),
  ('ultimate', 'Ultimate Plan', 'ฟูลออปชั่น ทุกฟังก์ชัน', 'อัลติเมท', 'THEMES', '55+ ธีมพรีเมียม', 'STAFF', 'สูงสุด 10 คน', '["ทุกฟังก์ชันของ Pro Plan", "สิทธิ์ใช้งานธีมพรีเมียมทั้งหมด (55+ ธีม)", "Dashboard ขั้นสูง & สถิติเชิงลึก", "Export รายงาน Excel (สูงสุดย้อนหลัง 3 เดือน)", "ระบบจัดการพนักงานสูงสุด 10 คน", "กำหนดสิทธิ์พนักงานได้ไม่จำกัด"]'::jsonb)
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

export function mergePlanContents(dbRows: any[] | null | undefined): Record<'free' | 'go' | 'basic' | 'pro' | 'ultimate', PlanContent> {
  const result = {
    free: { ...DEFAULT_PLAN_CONTENTS.free },
    go: { ...DEFAULT_PLAN_CONTENTS.go },
    basic: { ...DEFAULT_PLAN_CONTENTS.basic },
    pro: { ...DEFAULT_PLAN_CONTENTS.pro },
    ultimate: { ...DEFAULT_PLAN_CONTENTS.ultimate },
  };
  if (!Array.isArray(dbRows)) return result;

  for (const row of dbRows) {
    const key = String(row.plan_key || '').toLowerCase() as 'free' | 'go' | 'basic' | 'pro' | 'ultimate';
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
