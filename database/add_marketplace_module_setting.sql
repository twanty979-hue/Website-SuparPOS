-- ให้ Admin เปิด/ปิดปุ่ม Marketplace ในแอป Flutter ได้
-- รันครั้งเดียวใน Supabase SQL Editor ก่อน deploy API ใหม่

ALTER TABLE public.system_settings
  ADD COLUMN IF NOT EXISTS marketplace_enabled BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE public.system_settings
SET marketplace_enabled = TRUE
WHERE marketplace_enabled IS NULL;

