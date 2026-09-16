'use client';

import { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { DollarSign, Receipt, TrendingUp } from 'lucide-react';

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(val);

const formatNumber = (val: number) => 
  new Intl.NumberFormat('th-TH').format(val);

export default function DashboardChart({ 
  data, 
  loading 
}: { 
  data: any[]; 
  loading: boolean;
}) {
  const [chartMode, setChartMode] = useState<'revenue' | 'orders'>('revenue');
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  useEffect(() => {
    if (data && data.length > 0) {
      setSelectedPoint(data[data.length - 1]);
    } else {
      setSelectedPoint(null);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] h-[400px] w-full flex flex-col items-center justify-center text-slate-300 gap-2">
        <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-400">กำลังโหลดกราฟแนวโน้ม...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] h-[400px] w-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
        <div className="p-3 bg-slate-50 rounded-2xl">
          <Receipt className="w-8 h-8 text-slate-300" />
        </div>
        <span className="font-semibold text-xs">ไม่มีข้อมูลการขายในช่วงเวลานี้</span>
      </div>
    );
  }

  // Ensure every data point has both revenue and value
  const normalizedData = data.map((d) => {
    const rev = Number(d.revenue ?? d.value ?? 0);
    const ord = Number(d.orders ?? d.total_orders ?? 0);
    return {
      ...d,
      revenue: rev,
      value: rev,
      orders: ord,
    };
  });

  const startIdx = 0;
  const endIdx = normalizedData.length - 1;
  const midIdx = Math.round(endIdx / 2);
  const tickIndices = new Set([startIdx, midIdx, endIdx]);
  
  const customTicks = Array.from(tickIndices)
    .sort((a, b) => a - b)
    .map(index => normalizedData[index]?.date)
    .filter(Boolean);

  const activeColor = chartMode === 'revenue' ? '#059669' : '#4F46E5'; // Emerald or Indigo
  const activeGradient = chartMode === 'revenue' ? 'colorRevenue' : 'colorOrders';

  const pointRev = Number(selectedPoint?.revenue ?? selectedPoint?.value ?? 0);
  const pointOrd = Number(selectedPoint?.orders ?? 0);

  return (
    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[400px] w-full">
      {/* Chart Controls & Active Point Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Selected Point Highlight */}
        {selectedPoint ? (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/70 px-3.5 py-1.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{selectedPoint.date}</span>
            </div>
            <div className="h-3 w-px bg-slate-200"></div>
            <span className="text-slate-900 font-black text-sm">
              {chartMode === 'revenue' 
                ? formatCurrency(pointRev)
                : `${formatNumber(pointOrd)} บิล`}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-800 text-base">แนวโน้มยอดขาย</h3>
          </div>
        )}

        {/* Toggle Mode Buttons (Revenue / Orders) */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setChartMode('revenue')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              chartMode === 'revenue'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>ยอดขาย (฿)</span>
          </button>
          <button
            type="button"
            onClick={() => setChartMode('orders')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              chartMode === 'orders'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>จำนวนบิล</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full flex-1 relative min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={normalizedData} 
            margin={{ top: 10, right: 35, left: -10, bottom: 0 }}
            onMouseMove={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                setSelectedPoint(state.activePayload[0].payload);
              }
            }}
          > 
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              dy={10} 
              height={32}
              padding={{ left: 25, right: 25 }}
              ticks={customTicks} 
              interval={0}
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }} 
              tickFormatter={(val) => 
                chartMode === 'revenue'
                  ? (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`)
                  : `${val}`
              } 
            />

            <Tooltip 
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0].payload;
                return (
                  <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl text-xs space-y-1 border border-slate-700/50">
                    <p className="font-bold text-slate-300">{point.date}</p>
                    <p className="font-black text-sm text-emerald-400">
                      ยอดขาย: {formatCurrency(Number(point.revenue || 0))}
                    </p>
                    <p className="font-bold text-indigo-300">
                      จำนวน: {formatNumber(Number(point.orders || 0))} บิล
                    </p>
                  </div>
                );
              }}
            />

            <Area 
              type="monotone" 
              dataKey={chartMode === 'revenue' ? 'revenue' : 'orders'} 
              stroke={activeColor} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#${activeGradient})`} 
              activeDot={{ r: 6, fill: activeColor, stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
