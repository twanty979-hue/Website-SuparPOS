// app/api/payment/status/route.ts
import { NextResponse } from 'next/server';
import { checkPaymentStatusAction } from '@/app/actions/settingsActions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brandId, chargeId } = body;
    if (!chargeId) {
      return NextResponse.json({ success: false, error: 'Missing chargeId' }, { status: 400, headers: corsHeaders });
    }
    const result = await checkPaymentStatusAction(brandId || '', chargeId);
    return NextResponse.json(result, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const chargeId = url.searchParams.get('chargeId') || url.searchParams.get('charge_id');
    const brandId = url.searchParams.get('brandId') || url.searchParams.get('brand_id') || '';
    if (!chargeId) {
      return NextResponse.json({ success: false, error: 'Missing chargeId' }, { status: 400, headers: corsHeaders });
    }
    const result = await checkPaymentStatusAction(brandId, chargeId);
    return NextResponse.json(result, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500, headers: corsHeaders });
  }
}
