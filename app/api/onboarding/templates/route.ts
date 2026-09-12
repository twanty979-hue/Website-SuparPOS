import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // ดึงเฉพาะข้อมูลจริงจากตาราง Supabase เท่านั้น (ไม่มี Mockup)
    const [typeRes, prodRes, bannerRes] = await Promise.all([
      db.from('master_store_types').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      db.from('master_products').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      db.from('master_banners').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    ])

    if (typeRes.error) throw typeRes.error
    if (prodRes.error) throw prodRes.error
    if (bannerRes.error) throw bannerRes.error

    return NextResponse.json(
      {
        success: true,
        store_types: typeRes.data || [],
        products: prodRes.data || [],
        banners: bannerRes.data || [],
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
      },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      },
    )
  }
}
