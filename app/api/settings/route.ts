// app/api/settings/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs'; // 🌟 นำเข้า dayjs มาใช้คำนวณวันหมดอายุ

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const getSupabaseAndBrandId = async (request: Request) => {
  const authHeader = request.headers.get('authorization');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles').select('brand_id, role').eq('id', user.id).single();

  if (!profile?.brand_id) throw new Error('No brand assigned');
  return { supabase, brandId: profile.brand_id, role: profile.role };
};

const tutorialModules = ['pos', 'menu', 'theme'] as const;
type TutorialModule = typeof tutorialModules[number];
type TutorialProgress = Record<TutorialModule, boolean>;

function getTutorialProgress(config: unknown): TutorialProgress {
  const source = config && typeof config === 'object' && !Array.isArray(config)
    ? config as Record<string, unknown>
    : {};
  const nested = source.tutorial_progress && typeof source.tutorial_progress === 'object'
    && !Array.isArray(source.tutorial_progress)
    ? source.tutorial_progress as Record<string, unknown>
    : {};

  return tutorialModules.reduce((progress, tutorialModule) => {
    const value = nested[tutorialModule] ?? source[`tutorial_${tutorialModule}`];
    progress[tutorialModule] = typeof value === 'boolean' ? value : false;
    return progress;
  }, {} as TutorialProgress);
}

function withTutorialProgress(config: unknown): Record<string, unknown> {
  const currentConfig = config && typeof config === 'object' && !Array.isArray(config)
    ? { ...(config as Record<string, unknown>) }
    : {};
  const progress = getTutorialProgress(currentConfig);

  return {
    ...currentConfig,
    tutorial_pos: progress.pos,
    tutorial_menu: progress.menu,
    tutorial_theme: progress.theme,
    tutorial_progress: progress,
  };
}

// 🌟 HELPER: ฟังก์ชันเช็ควันหมดอายุ
function calculateEffectivePlan(brand: any) {
    const now = dayjs();
    if (brand.expiry_ultimate && dayjs(brand.expiry_ultimate).isAfter(now)) return 'ultimate';
    if (brand.expiry_pro && dayjs(brand.expiry_pro).isAfter(now)) return 'pro';
    if (brand.expiry_basic && dayjs(brand.expiry_basic).isAfter(now)) return 'basic';
    return 'free'; 
}

export async function GET(request: Request) {
  try {
    const { supabase, brandId, role } = await getSupabaseAndBrandId(request);

    const { data: brand, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single();

    if (error) throw error;

    // Always expose all modules, including for brands created before tutorials existed.
    brand.config = withTutorialProgress(brand.config);

    // 🌟 เช็ควันหมดอายุแบบเรียลไทม์
    const effectivePlan = calculateEffectivePlan(brand);
    if (brand.plan !== effectivePlan) {
        await supabase.from('brands').update({ plan: effectivePlan }).eq('id', brandId);
        brand.plan = effectivePlan; // อัปเดตค่าที่จะส่งกลับให้ Flutter ทันที
    }

    // ส่ง isOwner ไปให้แอปด้วย (เผื่อเอาไปซ่อน/โชว์ปุ่มตั้งค่าในแอป)
    const isOwner = role === 'owner';

    return new NextResponse(JSON.stringify({ success: true, brand: brand, isOwner }), {
      status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, brandId, role } = await getSupabaseAndBrandId(request);
    
    // ดักไว้ก่อน เผื่อพนักงานทั่วไปแอบยิง API มาแก้ข้อมูลร้าน
    if (role !== 'owner') throw new Error('Unauthorized: Owners only');

    const body = await request.json();

        const updateData: any = { updated_at: new Date().toISOString() };
    for (const key of ['name', 'phone', 'address', 'promptpay_number']) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    if (body.table_qr_mode === 'static' || body.table_qr_mode === 'rotating') {
      updateData.table_qr_mode = body.table_qr_mode;
    }

    const hasTutorialUpdate = body.tutorial_progress !== undefined
      || tutorialModules.some((module) => body[`tutorial_${module}`] !== undefined);

    const hasConfigUpdate =
      body.vat !== undefined ||
      body.vat_mode !== undefined ||
      body.notification_sound !== undefined ||
      hasTutorialUpdate;

    if (hasConfigUpdate) {
      const { data: currentBrand, error: configError } = await supabase
        .from('brands')
        .select('config')
        .eq('id', brandId)
        .single();
      if (configError) throw configError;

      const currentConfig = withTutorialProgress(currentBrand?.config);
      const updatedConfig: Record<string, unknown> = {
        ...currentConfig,
      };

      if (body.notification_sound !== undefined) {
        updatedConfig.notification_sound =
          typeof body.notification_sound === 'string' && body.notification_sound.trim()
            ? body.notification_sound.trim()
            : null;
      }

      if (body.vat !== undefined || body.vat_mode !== undefined) {
        const vat = Number(body.vat ?? currentConfig.vat ?? 0);
        const vatMode = body.vat_mode ?? currentConfig.vat_mode ?? 'included';
        if (!Number.isFinite(vat) || vat < 0 || vat > 100) {
          return NextResponse.json(
            { success: false, error: 'VAT must be between 0 and 100' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } },
          );
        }
        if (vatMode !== 'included' && vatMode !== 'excluded') {
          return NextResponse.json(
            { success: false, error: 'Invalid VAT mode' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } },
          );
        }
        updatedConfig.vat = vat;
        updatedConfig.vat_mode = vatMode;
      }

      if (hasTutorialUpdate) {
        const progress = getTutorialProgress(currentConfig);
        if (body.tutorial_progress !== undefined) {
          if (!body.tutorial_progress || typeof body.tutorial_progress !== 'object'
            || Array.isArray(body.tutorial_progress)) {
            return NextResponse.json(
              { success: false, error: 'tutorial_progress must be an object' },
              { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } },
            );
          }
          for (const tutorialModule of tutorialModules) {
            if (body.tutorial_progress[tutorialModule] !== undefined) {
              if (typeof body.tutorial_progress[tutorialModule] !== 'boolean') {
                return NextResponse.json(
                  { success: false, error: `tutorial_progress.${tutorialModule} must be boolean` },
                  { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } },
                );
              }
              progress[tutorialModule] = body.tutorial_progress[tutorialModule];
            }
          }
        }
        for (const tutorialModule of tutorialModules) {
          const key = `tutorial_${tutorialModule}`;
          if (body[key] !== undefined) {
            if (typeof body[key] !== 'boolean') {
              return NextResponse.json(
                { success: false, error: `${key} must be boolean` },
                { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } },
              );
            }
            progress[tutorialModule] = body[key];
          }
        }
        updatedConfig.tutorial_pos = progress.pos;
        updatedConfig.tutorial_menu = progress.menu;
        updatedConfig.tutorial_theme = progress.theme;
        updatedConfig.tutorial_progress = progress;
      }

      updateData.config = updatedConfig;
    }

    const { error } = await supabase.from('brands').update(updateData).eq('id', brandId);
    if (error) throw error;

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error: any) {
    const status = error.message.includes('Unauthorized') ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
