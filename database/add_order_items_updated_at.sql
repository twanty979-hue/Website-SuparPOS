-- database/add_order_items_updated_at.sql
-- เพิ่มคอลัมน์ updated_at ในตาราง order_items เพื่อป้องกัน Schema Cache Error ตอนซิงค์ออเดอร์โต๊ะ
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
