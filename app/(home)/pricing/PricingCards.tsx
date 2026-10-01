'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { PublicPlanItem } from '@/lib/planContents';
import type { PlanPermissions } from '@/lib/planPermissions';
import { Check, Sparkles, FileSpreadsheet, TableProperties } from 'lucide-react';

interface PricingCardsProps {
  plans: PublicPlanItem[];
  permissions?: Record<string, PlanPermissions>;
}

export default function PricingCards({ plans, permissions = {} }: PricingCardsProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // แผนที่เปิดให้บริการจริง 4 แผน (Free, Go, Basic, Pro) - ไม่รวม Ultimate ที่ยังไม่เปิดขาย
  const activePlans = plans.filter((p) => p.plan_key !== 'ultimate');
  const cardPlans = activePlans;
  const comparisonPlans = activePlans;

  return (
    <div>
      {/* ── Billing Cycle Toggle ────────────────────────────────────── */}
      <div className="flex justify-center items-center gap-3 mb-12">
        <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 inline-flex items-center shadow-inner">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-800 shadow-md shadow-slate-200/80'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            รายเดือน
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                billingCycle === 'monthly'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-slate-200/70 text-slate-600'
              }`}
            >
              เว็บลด 15%
            </span>
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              billingCycle === 'yearly'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            รายปี
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-700 text-emerald-100'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              ประหยัด 25% 🔥
            </span>
          </button>
        </div>
      </div>

      {/* ── 4 Cards Grid (Free, Go, Basic, Pro) ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto">
        {cardPlans.map((plan) => {
          const isFree = plan.plan_key === 'free';
          const isGo = plan.plan_key === 'go';
          const isBasic = plan.plan_key === 'basic';
          const isPro = plan.plan_key === 'pro';

          const monthlyPrice = plan.price_monthly;
          const yearlyPrice = plan.price_yearly;
          const perMonthInYearly = isFree ? 0 : Math.round(yearlyPrice / 12);

          return (
            <div
              key={plan.plan_key}
              className={`bg-white rounded-3xl p-6 border transition-all duration-300 relative flex flex-col justify-between ${
                isPro
                  ? 'border-2 border-emerald-500 shadow-2xl shadow-emerald-500/15 lg:-translate-y-2 z-10 ring-1 ring-emerald-500/20'
                  : isGo
                  ? 'border-teal-200 shadow-lg shadow-teal-500/5 hover:border-teal-400'
                  : isBasic
                  ? 'border-slate-200 shadow-lg shadow-slate-200/50 hover:border-blue-400'
                  : 'border-slate-200 shadow-lg shadow-slate-200/40 hover:shadow-xl'
              }`}
            >
              {/* Popular Badge on Pro */}
              {isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[11px] font-black tracking-wider uppercase py-1 px-4 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5" />
                  ยอดนิยม 🔥
                </div>
              )}

              {/* Best Value Badge on Go */}
              {isGo && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal-700 text-white text-[10px] font-black tracking-wider uppercase py-0.5 px-3 rounded-full shadow-sm whitespace-nowrap">
                  เริ่มต้นสุดคุ้ม ⚡
                </div>
              )}

              <div>
                {/* Header */}
                <div className="mb-5 text-center pt-1">
                  <div className="inline-block mb-1">
                    <span
                      className={`text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full ${
                        isPro
                          ? 'bg-emerald-100 text-emerald-800'
                          : isGo
                          ? 'bg-teal-100 text-teal-800'
                          : isBasic
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {plan.badge || plan.name}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mt-1">{plan.name}</h3>

                  {/* Price Block */}
                  <div className="my-3 text-center">
                    {isFree ? (
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-black text-slate-900">ฟรี</span>
                        <span className="text-xs text-slate-400 font-semibold">ตลอดชีพ</span>
                      </div>
                    ) : billingCycle === 'monthly' ? (
                      <div>
                        {plan.original_price_monthly && plan.original_price_monthly > monthlyPrice && (
                          <div className="flex items-center justify-center gap-2 mb-0.5">
                            <span className="text-xs text-slate-400 line-through font-semibold">
                              ฿{plan.original_price_monthly.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
                              ลด 15%
                            </span>
                          </div>
                        )}
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-black text-slate-900">
                            {monthlyPrice.toLocaleString(undefined, { minimumFractionDigits: monthlyPrice % 1 === 0 ? 0 : 1 })}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">บ./เดือน</span>
                        </div>
                        <div className="text-[10px] text-amber-600 font-bold mt-1">
                          ⚡ พิเศษเมื่อซื้อผ่านเว็บไซต์
                        </div>
                      </div>
                    ) : (
                      <div>
                        {plan.original_price_yearly && plan.original_price_yearly > yearlyPrice && (
                          <div className="flex items-center justify-center gap-2 mb-0.5">
                            <span className="text-xs text-slate-400 line-through font-semibold">
                              ฿{plan.original_price_yearly.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              ประหยัด {plan.original_price_yearly ? Math.round((1 - yearlyPrice / plan.original_price_yearly) * 100) : 25}%
                            </span>
                          </div>
                        )}
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-black text-slate-900">
                            {yearlyPrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">บ./ปี</span>
                        </div>
                        <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                          เฉลี่ย ฿{perMonthInYearly.toLocaleString()}/เดือน
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 min-h-[32px] flex items-center justify-center px-2">
                    {plan.subtitle}
                  </p>
                </div>

                {/* Quick Metrics */}
                {(plan.metric_1_label || plan.metric_2_label) && (
                  <div className="grid grid-cols-2 gap-2 mb-5 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    {plan.metric_1_label && (
                      <div className="px-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {plan.metric_1_label}
                        </div>
                        <div className="text-xs font-black text-slate-800 truncate">
                          {plan.metric_1_value}
                        </div>
                      </div>
                    )}
                    {plan.metric_2_label && (
                      <div className="px-1 border-l border-slate-200">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {plan.metric_2_label}
                        </div>
                        <div className="text-xs font-black text-slate-800 truncate">
                          {plan.metric_2_value}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Features list */}
                <div className="mb-6">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    ฟีเจอร์เด่นในแพ็กเกจ:
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-tight">
                        <span
                          className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isPro
                              ? 'bg-emerald-100 text-emerald-600'
                              : isGo
                              ? 'bg-teal-100 text-teal-700'
                              : isBasic
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href="https://app.suparpos.com/"
                className={`w-full block text-center py-3 rounded-xl font-bold text-sm transition-all duration-200 mt-auto ${
                  isPro
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-700 hover:to-teal-600 shadow-lg shadow-emerald-500/25 hover:scale-[1.02]'
                    : isGo
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20'
                    : isBasic
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                    : 'border-2 border-slate-200 text-slate-700 hover:border-slate-800 hover:text-slate-900'
                }`}
              >
                {isFree ? 'เริ่มต้นใช้งานฟรี' : 'เลือกแพ็กเกจนี้'}
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── Plan Comparison Table (ตัวเทียบทุกแพ็กเกจ) ─────────────── */}
      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-200/80">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
            <TableProperties className="w-3.5 h-3.5" />
            <span>PLAN COMPARISON OVERVIEW</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            ตารางเปรียบเทียบสิทธิ์และฟังก์ชันทุกแพ็กเกจ
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            ดูภาพรวมความแตกต่างระหว่างแพลน เพื่อเลือกแพ็กเกจที่ลงตัวกับขนาดร้านค้าของคุณมากที่สุด
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              {/* Header */}
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-700">
                  <th className="p-4 font-bold text-sm w-60 min-w-[200px]">
                    ฟังก์ชัน / สิทธิ์การใช้งาน
                  </th>
                  {comparisonPlans.map((c) => {
                    const isPro = c.plan_key === 'pro';
                    const isUltimate = c.plan_key === 'ultimate';
                    const isGo = c.plan_key === 'go';
                    const isBasic = c.plan_key === 'basic';
                    const isFree = c.plan_key === 'free';

                    const price = isFree
                      ? 'ฟรีตลอดชีพ'
                      : billingCycle === 'monthly'
                      ? `฿${c.price_monthly.toLocaleString()}/ด.`
                      : `฿${c.price_yearly.toLocaleString()}/ปี`;

                    return (
                      <th
                        key={c.plan_key}
                        className={`p-4 text-center min-w-[130px] ${
                          isPro ? 'bg-emerald-50/60 border-x-2 border-emerald-400' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <span
                            className={`text-sm font-black ${
                              isPro
                                ? 'text-emerald-800'
                                : isGo
                                ? 'text-teal-800'
                                : isBasic
                                ? 'text-blue-800'
                                : isUltimate
                                ? 'text-purple-800'
                                : 'text-slate-800'
                            }`}
                          >
                            {c.name}
                          </span>
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                              isPro
                                ? 'bg-emerald-600 text-white'
                                : isGo
                                ? 'bg-teal-100 text-teal-800'
                                : isBasic
                                ? 'bg-blue-100 text-blue-800'
                                : isUltimate
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {price}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {/* ── หมวด: การใช้งานหลัก & สแกนสั่งอาหาร ── */}
                <tr className="bg-slate-100/60 font-bold text-[11px] text-slate-600">
                  <td colSpan={comparisonPlans.length + 1} className="py-2 px-4 uppercase tracking-wider">
                    การคิดเงิน & สแกนสั่งอาหาร
                  </td>
                </tr>

                {/* คิดเงินหน้าร้าน POS */}
                <tr>
                  <td className="p-3.5 font-semibold bg-slate-50/50">คิดเงินหน้าร้าน POS</td>
                  {comparisonPlans.map((c) => (
                    <td key={c.plan_key} className={`p-3.5 text-center ${c.plan_key === 'pro' ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''}`}>
                      <span className="text-emerald-600 font-bold flex items-center justify-center gap-1 text-[11px]">
                        <Check className="w-4 h-4 stroke-[2.5]" /> ไม่จำกัด
                      </span>
                    </td>
                  ))}
                </tr>

                {/* โควต้าสแกนสั่งอาหาร */}
                <tr>
                  <td className="p-3.5 font-semibold bg-slate-50/50">
                    <div>โควต้าสแกนสั่งอาหาร</div>
                    <div className="text-[10px] text-slate-400 font-normal">จำกัดจำนวนบิลออเดอร์ต่อเดือน</div>
                  </td>
                  {comparisonPlans.map((c) => {
                    const perm = permissions[c.plan_key];
                    const o = perm?.max_orders ?? (c.plan_key === 'free' ? 300 : c.plan_key === 'go' ? 1000 : 0);
                    return (
                      <td key={c.plan_key} className={`p-3.5 text-center ${c.plan_key === 'pro' ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''}`}>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            o === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : o <= 300
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {o === 0 ? 'ไม่จำกัด' : `${o.toLocaleString()} บิล/ด.`}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* ── หมวด: แดชบอร์ด & รายงานยอดขาย ── */}
                <tr className="bg-slate-100/60 font-bold text-[11px] text-slate-600">
                  <td colSpan={comparisonPlans.length + 1} className="py-2 px-4 uppercase tracking-wider">
                    แดชบอร์ด & รายงานยอดขาย
                  </td>
                </tr>

                {/* ดู Dashboard ย้อนหลัง */}
                <tr>
                  <td className="p-3.5 font-semibold bg-slate-50/50">
                    <div>ดู Dashboard ย้อนหลัง</div>
                    <div className="text-[10px] text-slate-400 font-normal">กราฟและสถิติยอดขายร้านค้า</div>
                  </td>
                  {comparisonPlans.map((c) => {
                    const perm = permissions[c.plan_key];
                    const d = perm?.max_days ?? (c.plan_key === 'free' ? 30 : c.plan_key === 'go' ? 180 : 0);
                    return (
                      <td key={c.plan_key} className={`p-3.5 text-center ${c.plan_key === 'pro' ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''}`}>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            d === 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {d === 0 ? 'ไม่จำกัด' : `${d} วัน`}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* ประวัติการขายย้อนหลัง */}
                <tr>
                  <td className="p-3.5 font-semibold bg-slate-50/50">
                    <div>ประวัติการขายและค้นหาบิล</div>
                    <div className="text-[10px] text-slate-400 font-normal">ตรวจสอบใบเสร็จย้อนหลัง</div>
                  </td>
                  {comparisonPlans.map((c) => {
                    const perm = permissions[c.plan_key];
                    const h = perm?.receipt_max_days ?? (c.plan_key === 'free' ? 7 : c.plan_key === 'go' ? 30 : 0);
                    return (
                      <td key={c.plan_key} className={`p-3.5 text-center font-bold ${c.plan_key === 'pro' ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''}`}>
                        {h === 0 ? 'ตลอดไป' : `${h} วัน`}
                      </td>
                    );
                  })}
                </tr>

                {/* รายงานขั้นสูง */}
                <tr>
                  <td className="p-3.5 font-semibold bg-slate-50/50">
                    <div>รายงานวิเคราะห์ขั้นสูง</div>
                    <div className="text-[10px] text-slate-400 font-normal">ยอดขายรายชั่วโมง, ช่องทางชำระเงิน, โต๊ะ</div>
                  </td>
                  {comparisonPlans.map((c) => {
                    const perm = permissions[c.plan_key];
                    const adv = perm?.allow_advanced ?? (c.plan_key === 'pro' || c.plan_key === 'ultimate');
                    return (
                      <td key={c.plan_key} className={`p-3.5 text-center ${c.plan_key === 'pro' ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''}`}>
                        {adv ? (
                          <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                            <Check className="w-4 h-4 stroke-[2.5]" /> เปิดใช้งาน
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Export Excel (เฉพาะ Pro และ Ultimate เท่านั้น) */}
                <tr className="bg-amber-50/50">
                  <td className="p-3.5 font-extrabold text-amber-950 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    <span>Export รายงาน Excel 📊</span>
                  </td>
                  {comparisonPlans.map((c) => {
                    const hasExcel = c.plan_key === 'pro' || c.plan_key === 'ultimate';
                    return (
                      <td key={c.plan_key} className={`p-3.5 text-center ${c.plan_key === 'pro' ? 'bg-emerald-100/60 border-x-2 border-emerald-400' : ''}`}>
                        {hasExcel ? (
                          <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm inline-flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> สูงสุด 3 เดือน
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* ── หมวด: ขีดจำกัดเมนู สินค้า และโต๊ะ ── */}
                <tr className="bg-slate-100/60 font-bold text-[11px] text-slate-600">
                  <td colSpan={comparisonPlans.length + 1} className="py-2 px-4 uppercase tracking-wider">
                    จำนวนเมนู สินค้า และโต๊ะ
                  </td>
                </tr>

                {/* จำนวนอาหาร / เมนู สูงสุด */}
                <tr>
                  <td className="p-3.5 font-semibold bg-slate-50/50">
                    <div>จำนวนอาหาร / เมนู สูงสุด</div>
                    <div className="text-[10px] text-slate-400 font-normal">จำกัดรายการเมนูอาหารในร้าน</div>
                  </td>
                  {comparisonPlans.map((c) => {
                    const perm = permissions[c.plan_key];
                    const m = perm?.max_food_items ?? (c.plan_key === 'free' ? 50 : 0);
                    return (
                      <td key={c.plan_key} className={`p-3.5 text-center ${c.plan_key === 'pro' ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''}`}>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            m === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m === 0 ? 'ไม่จำกัด' : `${m} รายการ`}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* จำนวนสินค้าทั่วไป สูงสุด */}
                <tr>
                  <td className="p-3.5 font-semibold bg-slate-50/50">
                    <div>จำนวนสินค้าทั่วไป สูงสุด</div>
                    <div className="text-[10px] text-slate-400 font-normal">สินค้าขายปลีก / รีเทล</div>
                  </td>
                  {comparisonPlans.map((c) => {
                    const perm = permissions[c.plan_key];
                    const p = perm?.max_products ?? 0;
                    return (
                      <td key={c.plan_key} className={`p-3.5 text-center ${c.plan_key === 'pro' ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''}`}>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          {p === 0 ? 'ไม่จำกัด' : `${p} รายการ`}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* จำนวนโต๊ะสูงสุด */}
                <tr>
                  <td className="p-3.5 font-semibold bg-slate-50/50">จำนวนโต๊ะสูงสุด</td>
                  {comparisonPlans.map((c) => {
                    const perm = permissions[c.plan_key];
                    const t = perm?.max_tables ?? (c.plan_key === 'free' ? 10 : 0);
                    return (
                      <td key={c.plan_key} className={`p-3.5 text-center ${c.plan_key === 'pro' ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''}`}>
                        {t === 0 ? 'ไม่จำกัด' : `${t} โต๊ะ`}
                      </td>
                    );
                  })}
                </tr>

                {/* ── หมวด: การจัดการพนักงาน & ธีม ── */}
                <tr className="bg-slate-100/60 font-bold text-[11px] text-slate-600">
                  <td colSpan={comparisonPlans.length + 1} className="py-2 px-4 uppercase tracking-wider">
                    พนักงาน & ธีมร้านค้า
                  </td>
                </tr>

                {/* ระบบจัดการพนักงาน */}
                <tr>
                  <td className="p-3.5 font-semibold bg-slate-50/50">ระบบจัดการพนักงาน</td>
                  {comparisonPlans.map((c) => {
                    const isPro = c.plan_key === 'pro';
                    const isUltimate = c.plan_key === 'ultimate';
                    return (
                      <td key={c.plan_key} className={`p-3.5 text-center ${c.plan_key === 'pro' ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''}`}>
                        {isUltimate ? (
                          <span className="font-bold text-purple-700">สูงสุด 10 คน</span>
                        ) : isPro ? (
                          <span className="font-bold text-emerald-700">สูงสุด 3 คน</span>
                        ) : (
                          <span className="text-slate-300 font-bold">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* ธีมร้านค้า */}
                <tr>
                  <td className="p-3.5 font-semibold bg-slate-50/50">ธีมร้านค้าที่เลือกใช้ได้</td>
                  {comparisonPlans.map((c) => {
                    const isUltimate = c.plan_key === 'ultimate';
                    return (
                      <td key={c.plan_key} className={`p-3.5 text-center font-bold text-[11px] ${c.plan_key === 'pro' ? 'bg-emerald-50/30 border-x-2 border-emerald-400' : ''}`}>
                        {isUltimate ? (
                          <span className="text-purple-700">55+ ธีมพรีเมียม</span>
                        ) : (
                          <span className="text-slate-700">ฟรีทุกธีม</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* สมัครใช้งาน CTA Row */}
                <tr className="bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-700"></td>
                  {comparisonPlans.map((c) => {
                    const isPro = c.plan_key === 'pro';
                    const isFree = c.plan_key === 'free';
                    const isGo = c.plan_key === 'go';
                    const isUltimate = c.plan_key === 'ultimate';

                    return (
                      <td
                        key={c.plan_key}
                        className={`p-4 text-center ${
                          isPro ? 'bg-emerald-50/60 border-x-2 border-emerald-400 border-b-2' : ''
                        }`}
                      >
                        <Link
                          href="https://app.suparpos.com/"
                          className={`w-full inline-block py-2 px-3 rounded-xl font-bold text-xs transition-all ${
                            isPro
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                              : isGo
                              ? 'bg-teal-600 text-white hover:bg-teal-700'
                              : isUltimate
                              ? 'bg-purple-700 text-white hover:bg-purple-800'
                              : isFree
                              ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {isFree ? 'เริ่มต้นฟรี' : 'เลือกแพ็กเกจ'}
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
