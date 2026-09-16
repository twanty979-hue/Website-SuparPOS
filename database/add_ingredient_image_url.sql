-- Website-SuparPOS/database/add_ingredient_image_url.sql
-- เพิ่มคอลัมน์ image_url สำหรับจัดเก็บรูปภาพวัตถุดิบ

alter table public.ingredients
  add column if not exists image_url text;

comment on column public.ingredients.image_url is 'URL รูปภาพวัตถุดิบ (Cloudflare R2 หรือ Supabase Storage)';
