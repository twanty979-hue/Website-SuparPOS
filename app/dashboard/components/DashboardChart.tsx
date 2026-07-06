import { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { MapPin, Globe, Gift, Heart, Ghost } from 'lucide-react';

const formatCurrency = (val: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(val);

const ICON_SIZE = 18;

const iconMap: any = {
    'local': <MapPin size={ICON_SIZE} className="text-indigo-500" />,
    'global': <Globe size={ICON_SIZE} className="text-blue-500" />,
    'china': <Gift size={ICON_SIZE} className="text-red-500" />, 
    'love': <Heart size={ICON_SIZE} className="text-pink-500" />,
    'halloween': <Ghost size={ICON_SIZE} className="text-orange-500" />
};

export default function DashboardChart({ data, loading }: { data: any[], loading: boolean }) {
    const [selectedPoint, setSelectedPoint] = useState<any>(null);

    useEffect(() => {
        if (data && data.length > 0) {
            setSelectedPoint(data[data.length - 1]);
        } else {
            setSelectedPoint(null);
        }
    }, [data]);

    if (loading) {
        return <div className="h-full w-full bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center text-slate-300">Loading Chart...</div>;
    }

    if (!data || data.length === 0) {
        return <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">ไม่มีข้อมูลในช่วงเวลานี้</div>;
    }

    const startIdx = 0;
    const endIdx = data.length - 1;
    let midIdx = Math.round(endIdx / 2);
    const tickIndices = new Set([startIdx, midIdx, endIdx]);
    
    const customTicks = Array.from(tickIndices)
        .sort((a, b) => a - b)
        .map(index => data[index]?.date)
        .filter(Boolean);

    return (
        <div className="w-full h-full flex flex-col" style={{ minHeight: 250 }}>
            {selectedPoint && (
                <div className="flex justify-between items-center bg-[#FAF9F6] border border-[#E0E7FF] px-4 py-2.5 rounded-xl mb-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-[#1E293B] font-bold text-xs">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>{selectedPoint.date}</span>
                    </div>
                    <span className="text-[#0F172A] font-black text-sm">
                        {formatCurrency(Number(selectedPoint.value))}
                    </span>
                </div>
            )}
            <div className="flex-1 w-full relative min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart 
                        data={data} 
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        onMouseMove={(state: any) => {
                            if (state && state.activeTooltipIndex !== undefined && state.activePayload && state.activePayload.length > 0) {
                                setSelectedPoint(state.activePayload[0].payload);
                            }
                        }}
                    > 
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        
                        <XAxis 
                            dataKey="date" 
                            axisLine={false}
                            tickLine={false}
                            dy={10} 
                            height={40}
                            padding={{ left: 20, right: 20 }}
                            ticks={customTicks} 
                            interval={0}
                            tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
                        />
                        
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94A3B8', fontSize: 10 }} 
                            tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val} 
                        />
                        
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    const holidayParts = d.holiday ? d.holiday.split('|') : null;
                                    const holidayType = holidayParts?.[0];
                                    const holidayName = holidayParts?.[1];

                                    return (
                                        <div className="bg-[#1E293B] rounded-xl border border-slate-700 shadow-2xl p-3 min-w-[150px] backdrop-blur-sm bg-opacity-95">
                                            <p className="text-slate-400 text-[10px] font-medium mb-1">{d.date}</p>
                                            <p className="text-white text-base font-black tracking-tight flex items-baseline gap-1">{formatCurrency(Number(d.value))}</p>
                                            {holidayType && holidayName && (
                                                <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center gap-2">
                                                    {iconMap[holidayType]}
                                                    <span className="text-amber-400 text-xs font-bold leading-tight">{holidayName}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#6366F1" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorSales)" 
                            activeDot={{ r: 6, fill: '#4338CA', stroke: '#fff', strokeWidth: 2 }} 
                            dot={(props) => {
                                const { cx, cy, payload } = props;

                                if (typeof cx !== 'number' || typeof cy !== 'number') return <></>;

                                if (payload.holiday) {
                                    const holidayParts = payload.holiday.split('|');
                                    const holidayType = holidayParts[0];
                                    const icon = iconMap[holidayType];

                                    if (icon) {
                                        const offset = ICON_SIZE / 2;
                                        return (
                                            <g transform={`translate(${cx - offset}, ${cy - offset})`}>
                                                <circle cx={offset} cy={offset} r={offset + 2} fill="white" stroke="#E2E8F0" strokeWidth={1} />
                                                {icon}
                                            </g>
                                        );
                                    }
                                }
                                return <></>;
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}