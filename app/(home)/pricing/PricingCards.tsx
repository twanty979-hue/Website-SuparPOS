'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { PublicPlanItem } from '@/lib/planContents';

interface PricingCardsProps {
  plans: PublicPlanItem[];
}

export default function PricingCards({ plans }: PricingCardsProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // ซ่อน Ultimate Plan ชั่วคราว (ฟีเจอร์ยังไม่พร้อมขาย)
  const activePlans = plans.filter((plan) => plan.plan_key !== 'ultimate');

  return (
    <div>
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center items-center gap-3 mb-12">
        <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 inline-flex items-center shadow-inner">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
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
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
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

      {/* 3 Cards Grid (Free, Basic, Pro) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
        {activePlans.map((plan) => {
          const isFree = plan.plan_key === 'free';
          const isPro = plan.plan_key === 'pro';
          const isBasic = plan.plan_key === 'basic';

          const monthlyPrice = plan.price_monthly;
          const yearlyPrice = plan.price_yearly;
          const perMonthInYearly = isFree ? 0 : Math.round(yearlyPrice / 12);

          return (
            <div
              key={plan.plan_key}
              className={`bg-white rounded-3xl p-6 border transition-all duration-300 relative flex flex-col justify-between ${
                isPro
                  ? 'border-2 border-emerald-500 shadow-2xl shadow-emerald-500/15 md:-translate-y-3 z-10'
                  : isBasic
                  ? 'border-slate-200 shadow-lg shadow-slate-200/50 hover:border-emerald-300'
                  : 'border-slate-200 shadow-lg shadow-slate-200/40 hover:shadow-xl'
              }`}
            >
              {/* Popular / Best Badge */}
              {isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-black tracking-wider uppercase py-1 px-4 rounded-full shadow-md">
                  ยอดนิยม 🔥
                </div>
              )}

              <div>
                {/* Header */}
                <div className="mb-6 text-center pt-2">
                  <div className="inline-block mb-1">
                    <span
                      className={`text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full ${
                        isPro
                          ? 'bg-emerald-100 text-emerald-800'
                          : isBasic
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {plan.badge || plan.name}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mt-1">{plan.name}</h3>

                  {/* Price */}
                  <div className="my-3 text-center">
                    {isFree ? (
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-black text-slate-900">ฟรี</span>
                      </div>
                    ) : billingCycle === 'monthly' ? (
                      <div>
                        {plan.original_price_monthly && (
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
                          ⚡ ราคาพิเศษเมื่อซื้อผ่านเว็บไซต์
                        </div>
                      </div>
                    ) : (
                      <div>
                        {plan.original_price_yearly && (
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
                          เฉลี่ยเพียง ฿{perMonthInYearly.toLocaleString()}/เดือน
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
                  <div className="grid grid-cols-2 gap-2 mb-6 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
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
                <div className="mb-8">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    ฟีเจอร์ในแพ็กเกจ:
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-tight">
                        <span
                          className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isPro
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <svg
                            className="w-2.5 h-2.5 fill-current"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
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
    </div>
  );
}
