import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPlanPermissions } from '@/lib/planPermissions'

const admin = () =>
  createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function GET() {
  try {
    const db = admin()

    // ดึงเฉพาะข้อมูลจริงจากตาราง Supabase เท่านั้น (ไม่มี Mockup) พร้อมโควตาแพ็กเกจ Free จาก system_settings
    const [typeRes, prodRes, bannerRes] = await Promise.all([
      db.from('master_store_types').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      db.from('master_products').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      db.from('master_banners').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    ])

    if (typeRes.error) throw typeRes.error
    if (prodRes.error) throw prodRes.error
    if (bannerRes.error) throw bannerRes.error

    const { plan, limits } = await getPlanPermissions(db, 'free')

    return NextResponse.json(
      {
        success: true,
        store_types: typeRes.data || [],
        products: prodRes.data || [],
        banners: bannerRes.data || [],
        plan,
        limits: {
          max_food_items: limits.max_food_items,
          max_products: limits.max_products,
          max_tables: limits.max_tables,
        },
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error: any) {
    console.error('Error fetching master templates from database:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch onboarding templates from database',
        store_types: [],
        products: [],
        banners: [],
        limits: {
          max_food_items: 50,
          max_tables: 10,
        },
      },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      },
    )
  }
}
