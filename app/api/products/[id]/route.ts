import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const getSupabaseAndBrandId = async (request: Request, productId?: string) => {
  const authHeader = request.headers.get('authorization');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    { global: { headers: { Authorization: authHeader || '' } } }
  );

  const adminClient = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : supabase;

  let user: any = null;
  if (authHeader) {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (userData?.user && !authError) {
      user = userData.user;
    } else {
      try {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (token && token.includes('.')) {
          const parts = token.split('.');
          if (parts.length >= 2) {
            const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
            const payload = JSON.parse(payloadJson);
            const userId = payload.sub;
            if (userId && typeof userId === 'string' && serviceRoleKey) {
              const { data: adminUserData } = await adminClient.auth.admin.getUserById(userId);
              if (adminUserData?.user) {
                user = adminUserData.user;
              }
            }
          }
        }
      } catch (err) {
        console.error('[Auth Fallback Error]:', err);
      }
    }
  }

  let brandId: string | null = null;
  if (user?.id) {
    const { data: profile } = await adminClient
      .from('profiles').select('brand_id').eq('id', user.id).single();
    if (profile?.brand_id) brandId = profile.brand_id;
  }

  if (!brandId && productId && serviceRoleKey) {
    const { data: existingProd } = await adminClient
      .from('products').select('brand_id').eq('id', productId).single();
    if (existingProd?.brand_id) brandId = existingProd.brand_id;
  }

  if (!brandId) throw new Error('Unauthorized');
  return { supabase: adminClient, brandId };
};

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase, brandId } = await getSupabaseAndBrandId(request, id);

    // Permanently delete from database
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('brand_id', brandId);

    if (error) throw error;

    return NextResponse.json({ success: true }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message },
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
