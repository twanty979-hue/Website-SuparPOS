import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader || '' } } },
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders },
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('brand_id')
      .eq('id', user.id)
      .single()
    if (!profile?.brand_id) throw new Error('No brand assigned')

    const body = await request.json()
    const action = body.action
    const targetTableId = body.target_table_id?.toString()
    const sourceOrderIds = Array.isArray(body.source_order_ids)
      ? [...new Set(body.source_order_ids.map((id: unknown) => String(id)))]
      : []

    if (
      (action !== 'move' && action !== 'merge') ||
      !targetTableId ||
      sourceOrderIds.length === 0
    ) {
      return NextResponse.json(
        { error: 'Invalid table action' },
        { status: 400, headers: corsHeaders },
      )
    }

    const { data: targetTable, error: tableError } = await supabase
      .from('tables')
      .select('id, label, access_token')
      .eq('brand_id', profile.brand_id)
      .eq('id', targetTableId)
      .single()
    if (tableError || !targetTable) {
      return NextResponse.json(
        { error: 'Target table not found' },
        { status: 404, headers: corsHeaders },
      )
    }

    const { data: sourceOrders, error: sourceError } = await supabase
      .from('orders')
      .select('id, table_id')
      .eq('brand_id', profile.brand_id)
      .in('id', sourceOrderIds)
      .in('status', ['pending', 'preparing', 'done'])
    if (sourceError) throw sourceError
    if (!sourceOrders || sourceOrders.length !== sourceOrderIds.length) {
      return NextResponse.json(
        { error: 'Some source orders are unavailable' },
        { status: 409, headers: corsHeaders },
      )
    }

    if (action === 'move') {
      const { data: occupiedOrders, error: occupiedError } = await supabase
        .from('orders')
        .select('id')
        .eq('brand_id', profile.brand_id)
        .eq('table_id', targetTableId)
        .in('status', ['pending', 'preparing', 'done'])
      if (occupiedError) throw occupiedError
      const occupiedByOtherOrder = (occupiedOrders || []).some(
        (order) => !sourceOrderIds.includes(order.id),
      )
      if (occupiedByOtherOrder) {
        return NextResponse.json(
          { error: 'Target table is occupied; use merge instead' },
          { status: 409, headers: corsHeaders },
        )
      }
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        table_id: targetTable.id,
        table_label: targetTable.label,
        table_access_token: targetTable.access_token,
        updated_at: new Date().toISOString(),
      })
      .eq('brand_id', profile.brand_id)
      .in('id', sourceOrderIds)
    if (updateError) throw updateError

    return NextResponse.json(
      {
        success: true,
        table: targetTable,
        moved_order_ids: sourceOrderIds,
      },
      { headers: corsHeaders },
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Table action failed' },
      { status: 500, headers: corsHeaders },
    )
  }
}
