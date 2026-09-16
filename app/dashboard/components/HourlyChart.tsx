"use client";

import React from "react";
import { Clock, TrendingUp } from "lucide-react";

interface HourlyPeakItem {
  hour: number;
  label: string;
  revenue: number;
  orders: number;
}

export default function HourlyChart({ data }: { data: HourlyPeakItem[] }) {
  // Find maximum revenue for scaling
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  // Find top 3 peak hours
  const sortedPeak = [...data]
    .filter((d) => d.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  return (
    <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                ช่วงเวลายอดขายพีกของวัน (Rush Hours)
              </h3>
              <p className="text-xs text-slate-400">
                วิเคราะห์ความหนาแน่นของลูกค้าตลอด 24 ชม.
              </p>
            </div>
          </div>
          {sortedPeak.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold border border-amber-200/60">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>พีกสุด: {sortedPeak[0].label} น.</span>
            </div>
          )}
        </div>

        {/* Top 3 peak badges */}
        {sortedPeak.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {sortedPeak.map((peak, idx) => (
              <div
                key={peak.hour}
                className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center"
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {idx === 0 ? "🥇 พีกอันดับ 1" : idx === 1 ? "🥈 อันดับ 2" : "🥉 อันดับ 3"}
                </div>
                <div className="text-sm font-black text-slate-800 mt-0.5">
                  {peak.label} น.
                </div>
                <div className="text-xs font-bold text-emerald-600 mt-0.5">
                  ฿{peak.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 24-Hour Bar Chart Visualization */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-end justify-between gap-1 h-32 px-1 pb-2 border-b border-slate-100">
            {data.map((item) => {
              const heightPct = Math.max(
                (item.revenue / maxRevenue) * 100,
                item.revenue > 0 ? 8 : 2
              );
              const isPeak = sortedPeak.length > 0 && item.hour === sortedPeak[0].hour;

              return (
                <div
                  key={item.hour}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1.5 px-2.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                    <div className="font-bold">{item.label} น.</div>
                    <div className="text-emerald-400 font-bold">฿{item.revenue.toLocaleString()}</div>
                    {item.orders > 0 && <div className="text-slate-300">{item.orders} บิล</div>}
                  </div>

                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      isPeak
                        ? "bg-amber-500 group-hover:bg-amber-600 shadow-sm"
                        : item.revenue > 0
                        ? "bg-emerald-500 group-hover:bg-emerald-600"
                        : "bg-slate-100 group-hover:bg-slate-200"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Hour labels (00, 04, 08, 12, 16, 20, 23) */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1 font-semibold">
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>23:00</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>ชั่วโมงยอดขายสูงสุด</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ml-2" />
          <span>มียอดขาย</span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">อัปเดตแบบเรียลไทม์</span>
      </div>
    </div>
  );
}
