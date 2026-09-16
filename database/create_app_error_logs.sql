-- database/create_app_error_logs.sql
-- ตารางจัดเก็บข้อผิดพลาดเฉพาะบั๊ก (App & API Error Tracking)

CREATE TABLE IF NOT EXISTS public.app_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_source TEXT NOT NULL CHECK (error_source IN ('APP', 'API')), -- 'APP' (บั๊กแอป) หรือ 'API' (บั๊กเซิร์ฟเวอร์)
    error_name TEXT,                             -- ชื่อคลาส/ประเภท Error เช่น 'NoSuchMethodError', 'PostgrestException'
    error_message TEXT NOT NULL,                 -- ข้อความแจ้งเตือน Error
    stack_trace TEXT,                            -- Stack trace บรรทัดโค้ดที่เกิดปัญหา
    screen_name TEXT,                            -- หน้าจอในแอปที่เกิดเหตุ เช่น 'pos_screen', 'dashboard_screen'
    endpoint TEXT,                               -- API Endpoint (สำหรับบั๊ก API) เช่น '/api/pos/table-action'
    status_code INTEGER,                         -- HTTP Status Code (เช่น 500, 502, 503)
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL, -- ร้านค้าที่เกิดปัญหา
    user_id UUID,                                -- พนักงานหรือผู้ใช้
    user_email TEXT,                             -- อีเมลผู้ใช้ (ถ้ามี)
    app_version TEXT DEFAULT '2.1.1',            -- เวอร์ชันแอปพลิเคชัน
    platform TEXT,                               -- 'android', 'ios', 'windows', 'web', 'backend'
    device_info JSONB DEFAULT '{}'::jsonb,       -- สเปกเครื่อง เช่น OS version, model
    request_payload JSONB,                       -- Payload ย่อที่ยิงเข้า API ตอนเกิดบั๊ก
    is_resolved BOOLEAN DEFAULT FALSE,           -- สถานะการตรวจสอบ/แก้ไข
    resolved_at TIMESTAMPTZ,                     -- วันเวลาที่แก้ไข
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()-- วันเวลาที่เกิดข้อผิดพลาด
);

-- Indexes สำหรับการค้นหาและดึงข้อมูลในหน้า Admin อย่างรวดเร็ว
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.app_error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_source ON public.app_error_logs(error_source);
CREATE INDEX IF NOT EXISTS idx_error_logs_brand_id ON public.app_error_logs(brand_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_is_resolved ON public.app_error_logs(is_resolved);

-- Row Level Security (RLS)
ALTER TABLE public.app_error_logs ENABLE ROW LEVEL SECURITY;

-- ลบนโยบายเก่าหากมี
DROP POLICY IF EXISTS "Allow public insert to error logs" ON public.app_error_logs;
DROP POLICY IF EXISTS "Allow authenticated read/write error logs" ON public.app_error_logs;

-- อนุญาตให้ Insert ได้โดยตรง (สำหรับ Client และ Service)
CREATE POLICY "Allow public insert to error logs"
ON public.app_error_logs FOR INSERT
WITH CHECK (true);

-- อนุญาตให้ดู/แก้ไข เฉพาะ Admin หรือ Service Role
CREATE POLICY "Allow authenticated read/write error logs"
ON public.app_error_logs FOR ALL
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
