"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Receipt,
  RotateCcw,
  Smartphone,
  Banknote,
  Users,
  Award,
  Calendar,
  Layers,
  Percent,
  CheckCircle2,
  AlertCircle,
  Coffee,
  ShieldCheck,
  Store,
  LogIn,
  Boxes,
  Package,
  AlertTriangle,
  XCircle,
  Activity,
  ArrowUpRight,
  ExternalLink,
  History,
  PlusCircle,
  Sliders,
} from "lucide-react";
import Link from "next/link";
import DashboardChart from "./components/DashboardChart";
import HourlyChart from "./components/HourlyChart";
import {
  getDashboardDataAction,
  DashboardData,
  AvailableBrand,
} from "./dashboardActions";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  // 🌟 Main View Tab State: 'sales' (ภาพรวมยอดขาย) vs 'inventory' (ภาพรวมคลังสินค้า)
  const [activeMainView, setActiveMainView] = useState<"sales" | "inventory">("sales");

  const handleOpenSidebar = () => {
    // 1. Dispatch custom event to layout
    window.dispatchEvent(new CustomEvent("open-sidebar"));
    // 2. Click button by ID as secondary fallback
    const btn = document.getElementById("layout-open-sidebar-btn");
    if (btn instanceof HTMLElement) {
      btn.click();
    }
  };

  const loadDashboard = (brandIdToLoad?: string) => {
    setLoading(true);
    startTransition(async () => {
      const targetId = brandIdToLoad !== undefined ? brandIdToLoad : selectedBrandId || undefined;
      const res = await getDashboardDataAction(targetId);
      if (res.success && res.data) {
        setData(res.data);
        if (!selectedBrandId && res.data.brandId) {
          setSelectedBrandId(res.data.brandId);
        }
        setError(null);
      } else {
        setError(res.error || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
      setLoading(false);
    });
  };

  const handleBrandChange = (newBrandId: string) => {
    setSelectedBrandId(newBrandId);
    loadDashboard(newBrandId);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20 font-sans antialiased text-slate-800">
      {/* 🌟 1. Top Navbar Header (เอดเดอร์ดีไซน์หรูหรา พร้อมปุ่มแฮมเบอร์เกอร์เต็มๆ แน่นๆ) */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* ซ้าย: ปุ่มแฮมเบอร์เกอร์เต็มๆ + โลโก้และชื่อร้าน */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-3">
              {/* 🔥 ปุ่มแฮมเบอร์เกอร์ออกแบบใหม่: ตัวเต็ม แน่น สวย ลักชัวรี่ มีมิติ */}
              <button
                type="button"
                onClick={handleOpenSidebar}
                className="relative group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md shadow-indigo-950/20 hover:shadow-indigo-900/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-slate-700/60 shrink-0"
                title="เปิดเมนูนำทางหลัก (Sidebar)"
              >
                <div className="flex flex-col justify-center items-center w-5 h-5 gap-1">
                  <span className="w-5 h-0.5 bg-white rounded-full transition-all group-hover:w-4"></span>
                  <span className="w-4 h-0.5 bg-emerald-400 rounded-full transition-all group-hover:w-5"></span>
                  <span className="w-5 h-0.5 bg-white rounded-full transition-all group-hover:w-3"></span>
                </div>
                <span className="text-xs font-black tracking-wide pr-0.5">
                  เมนูระบบ
                </span>
              </button>

              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                <Store className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {data?.brandName || "ร้านค้าของคุณ"}
                  </h1>

                  {/* 🏪 เมนูสลับสาขา/ร้านค้า (Brand Selector) */}
                  {data?.availableBrands && data.availableBrands.length > 0 && (
                    <div className="relative inline-block">
                      <select
                        value={selectedBrandId || data.brandId}
                        onChange={(e) => handleBrandChange(e.target.value)}
                        className="text-xs font-black bg-slate-100 hover:bg-slate-200/90 border border-slate-300 text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all shadow-xs"
                        title="คลิกเพื่อสลับดูข้อมูลร้านค้า/สาขาอื่น"
                      >
                        {data.availableBrands.map((b) => (
                          <option key={b.id} value={b.id}>
                            🏪 {b.name} {b.totalRevenue > 0 ? `(฿${b.totalRevenue.toLocaleString()})` : "(ยังไม่มียอดขาย)"}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {data?.brandPlan && (
                    <span className="uppercase text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 border border-emerald-300/60 shrink-0">
                      {data.brandPlan} Plan
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>ระบบออนไลน์เรียลไทม์ (SaaS Multi-Tenant Isolated)</span>
                </div>
              </div>
            </div>
          </div>

          {/* กลาง: ตัวสลับ 2 หน้าหลัก (ภาพรวมยอดขาย vs ภาพรวมคลังสินค้า) */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/70 shadow-inner">
            <button
              onClick={() => setActiveMainView("sales")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeMainView === "sales"
                  ? "bg-white text-slate-900 shadow-sm scale-[1.02]"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>ภาพรวมยอดขาย</span>
            </button>
            <button
              onClick={() => setActiveMainView("inventory")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeMainView === "inventory"
                  ? "bg-white text-slate-900 shadow-sm scale-[1.02]"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Boxes className="w-4 h-4 text-indigo-600" />
              <span>ภาพรวมคลังสินค้า</span>
            </button>
          </div>

          {/* ขวา: ปุ่มรีเฟรชข้อมูล */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadDashboard()}
              disabled={loading || isPending}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 active:scale-95 transition-all shadow-xs disabled:opacity-50"
            >
              <RotateCcw
                className={`w-3.5 h-3.5 ${
                  loading || isPending ? "animate-spin text-emerald-600" : ""
                }`}
              />
              <span className="hidden sm:inline">รีเฟรชข้อมูล</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* แนะนำสลับสาขาเมื่อร้านปัจจุบันยังไม่มียอดขาย */}
        {data && data.kpi.totalRevenue === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">
                  ร้านนี้ ({data.brandName}) ยังไม่มีประวัติการขายในระบบ
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  ท่านสามารถเปิดบิลขายผ่านระบบ POS หน้าร้าน หรือกดสลับไปดูรายงานตัวอย่างของร้านที่มีข้อมูลจริงได้ทันที
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleBrandChange("268dccbf-a568-4a90-b184-d23811937d9f")}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
              >
                ดูตัวอย่างร้านบอล (฿36,396)
              </button>
              <button
                onClick={() => handleBrandChange("df3929db-e8b6-4ab7-953e-9981e7be734c")}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                ดูร้านนิซา (฿20,212)
              </button>
            </div>
          </div>
        )}

        {/* แจ้งเตือนข้อผิดพลาดถ้ามี */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0 text-amber-600" />
              <div>
                <div className="text-sm font-bold">{error}</div>
                <div className="text-xs text-amber-700 mt-0.5">
                  โปรดตรวจสอบว่าได้เข้าสู่ระบบด้วยบัญชีเจ้าของร้านหรือพนักงานของร้านท่านแล้ว
                </div>
              </div>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบทันที</span>
            </Link>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-white rounded-[24px] border border-slate-100 animate-pulse p-5 space-y-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100" />
                  <div className="h-4 bg-slate-100 rounded w-24" />
                </div>
              ))}
            </div>
            <div className="h-96 bg-white rounded-[24px] border border-slate-100 animate-pulse" />
          </div>
        )}

        {/* 🌟 2. เนื้อหาหน้าหลักตามแท็บที่เลือก */}
        {data && (
          <>
            {/* ========================================================================= */}
            {/* 📈 มุมมองที่ 1: ภาพรวมยอดขาย & วิเคราะห์ธุรกิจ (Sales Dashboard) */}
            {/* ========================================================================= */}
            {activeMainView === "sales" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* แถบ 8 ดัชนีชี้วัดยอดขาย (Comprehensive 8-KPI Cards) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Gross Sales */}
                  <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400">
                          ยอดขายรวมร้านนี้ (Gross)
                        </span>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          ฿{data.kpi.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-bold mt-1">
                          ก่อน VAT: ฿{data.kpi.netRevenue.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Orders Count */}
                  <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400">
                          จำนวนบิลของร้าน
                        </span>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          {data.kpi.totalOrders.toLocaleString()}{" "}
                          <span className="text-sm font-normal text-slate-400">
                            บิล
                          </span>
                        </div>
                        <div className="text-[11px] text-blue-600 font-bold mt-1">
                          ชำระเงินเรียบร้อย 100%
                        </div>
                      </div>
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Receipt className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Average Order Value (AOV) */}
                  <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400">
                          ยอดเฉลี่ยต่อบิล (AOV)
                        </span>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          ฿{data.kpi.avgOrderValue.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-purple-600 font-bold mt-1">
                          มูลค่าการใช้จ่ายต่อโต๊ะ
                        </div>
                      </div>
                      <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: VAT 7% */}
                  <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400">
                          ภาษีมูลค่าเพิ่ม (VAT 7%)
                        </span>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          ฿{data.kpi.vatTotal.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-amber-600 font-bold mt-1">
                          คำนวณตามกฎหมายภาษี
                        </div>
                      </div>
                      <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                        <Percent className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Cash Revenue */}
                  <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400">
                          รับด้วยเงินสด (Cash)
                        </span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                          ฿{data.kpi.cashTotal.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                          <Banknote className="w-3 h-3" /> ลิ้นชักเก็บเงินสดร้าน
                        </div>
                      </div>
                      <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                        <Banknote className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Card 6: Transfer / PromptPay Revenue */}
                  <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400">
                          สแกนจ่าย / พร้อมเพย์ (QR)
                        </span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                          ฿{data.kpi.transferTotal.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-indigo-600 font-bold mt-1 flex items-center gap-1">
                          <Smartphone className="w-3 h-3" /> บัญชีพร้อมเพย์ร้าน
                        </div>
                      </div>
                      <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                        <Smartphone className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Card 7: Active Tables Capacity */}
                  <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400">
                          โต๊ะเปิดบริการในร้าน
                        </span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                          {data.kpi.activeTablesCount}{" "}
                          <span className="text-sm font-normal text-slate-400">
                            โต๊ะ
                          </span>
                        </div>
                        <div className="text-[11px] text-sky-600 font-bold mt-1 flex items-center gap-1">
                          <Users className="w-3 h-3" /> รองรับ {data.kpi.totalCapacity} ที่นั่ง
                        </div>
                      </div>
                      <div className="p-2.5 bg-sky-50 text-sky-700 rounded-xl">
                        <Coffee className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Card 8: Discounts & Promotions */}
                  <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400">
                          ส่วนลดโปรโมชั่นรวม
                        </span>
                        <div className="text-xl font-black text-slate-900 mt-1">
                          ฿{data.discounts.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                          <Layers className="w-3 h-3" /> {data.discounts.itemsCount} รายการที่ให้ส่วนลด
                        </div>
                      </div>
                      <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                        <Award className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2 คอลัมน์: กราฟแนวโน้มยอดขาย & เมนูขายดี Top 8 (ความสูงสมดุลเป๊ะ ไม่มีช่องว่าง) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                  {/* ซ้าย 2 คอลัมน์: กราฟรายได้ */}
                  <div className="lg:col-span-2 flex">
                    <DashboardChart data={data.salesHistory} loading={loading} />
                  </div>

                  {/* ขวา 1 คอลัมน์: เมนูขายดี Top 8 */}
                  <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[400px]">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-slate-800 text-base">
                              เมนูยอดนิยมของร้าน
                            </h3>
                            <p className="text-xs text-slate-400">
                              จัดอันดับตามจำนวนจานและยอดขาย
                            </p>
                          </div>
                        </div>
                      </div>

                      {data.topProducts.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 text-sm font-semibold">
                          ยังไม่มีข้อมูลสินค้าขายดีของร้านนี้
                        </div>
                      ) : (
                        <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
                          {data.topProducts.map((p, idx) => {
                            const medal =
                              idx === 0
                                ? "🥇"
                                : idx === 1
                                ? "🥈"
                                : idx === 2
                                ? "🥉"
                                : `#${idx + 1}`;
                            const maxRev = data.topProducts[0].revenue || 1;
                            const pct = Math.min(
                              Math.round((p.revenue / maxRev) * 100),
                              100
                            );

                            return (
                              <div
                                key={idx}
                                className="group p-2 rounded-xl hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="text-sm font-black text-slate-500 w-6 flex-shrink-0 text-center">
                                      {medal}
                                    </span>
                                    <div className="truncate">
                                      <div className="text-xs font-black text-slate-800 truncate">
                                        {p.name}
                                      </div>
                                      <div className="text-[11px] text-slate-400 font-semibold">
                                        ขายแล้ว {p.quantity} จาน/แก้ว
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0 ml-2">
                                    <div className="text-xs font-black text-emerald-600">
                                      ฿{p.revenue.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                  <div
                                    style={{ width: `${pct}%` }}
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-center">
                      <span className="text-[11px] text-slate-400 font-medium">
                        คำนวณจากบันทึกบิลอาหารเฉพาะร้านของคุณ
                      </span>
                    </div>
                  </div>
                </div>

                {/* แถวสถิติขั้นสูง 1: ช่วงเวลายอดขายพีก 24 ชม. & สัดส่วนช่องทางชำระเงิน */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  <HourlyChart data={data.hourlyPeak} />

                  {/* สัดส่วนช่องทางชำระเงิน */}
                  <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-base">
                              สัดส่วนช่องทางการชำระเงิน
                            </h3>
                            <p className="text-xs text-slate-400">
                              เปรียบเทียบระหว่างเงินสดและพร้อมเพย์ QR ของร้าน
                            </p>
                          </div>
                        </div>
                      </div>

                      {data.paymentMethods.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm font-semibold">
                          ยังไม่มีข้อมูลการชำระเงินของร้านนี้
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {data.paymentMethods.map((pm, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`w-3 h-3 rounded-full ${
                                      pm.method.includes("prompt") ||
                                      pm.method.includes("transfer")
                                        ? "bg-indigo-500"
                                        : "bg-emerald-500"
                                    }`}
                                  />
                                  <span className="text-sm font-bold text-slate-800">
                                    {pm.label}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    ({pm.payments} รายการ)
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-base font-black text-slate-900">
                                    ฿{pm.revenue.toLocaleString()}
                                  </span>
                                  <span className="ml-2 text-xs font-black text-emerald-600">
                                    {pm.percentage}%
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${pm.percentage}%` }}
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    pm.method.includes("prompt") ||
                                    pm.method.includes("transfer")
                                      ? "bg-indigo-500"
                                      : "bg-emerald-500"
                                  }`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-slate-600 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        ตรวจสอบยอดตรงกับสมุดบัญชี POS ร้านคุณ
                      </span>
                      <span className="font-black text-slate-800">
                        รวม ฿{data.kpi.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* แถวสถิติขั้นสูง 2: สถิติรายโต๊ะ & ประสิทธิภาพแคชเชียร์ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Table Performance Leaderboard */}
                  <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
                          <Coffee className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-base">
                            เจาะลึกสถิติรายโต๊ะของร้าน
                          </h3>
                          <p className="text-xs text-slate-400">
                            สถิติยอดขาย รอบการนั่งกิน และบิลหน้าร้าน
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                        {data.tableRankings.length} จุดบริการ
                      </span>
                    </div>

                    {data.tableRankings.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-sm font-semibold">
                        ยังไม่มีข้อมูลการเปิดโต๊ะในร้านของคุณ
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                              <th className="pb-3 font-semibold">โต๊ะ / จุดขาย</th>
                              <th className="pb-3 font-semibold text-center">
                                จำนวนบิล
                              </th>
                              <th className="pb-3 font-semibold text-right">
                                เฉลี่ย/บิล
                              </th>
                              <th className="pb-3 font-semibold text-right">
                                ยอดขายรวม
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {data.tableRankings.slice(0, 8).map((tbl, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-slate-50/80 transition-colors"
                              >
                                <td className="py-3 font-bold text-slate-800 flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-black text-[11px]">
                                    {tbl.label.includes("Walk") ? "W" : tbl.label}
                                  </span>
                                  <div>
                                    <div>{tbl.label}</div>
                                    <div className="text-[10px] text-slate-400 font-normal">
                                      {tbl.label.includes("Walk")
                                        ? "ลูกค้าสั่งกลับบ้าน (Takeaway)"
                                        : "ทานที่ร้าน (Dine-in)"}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 text-center text-slate-600 font-semibold">
                                  {tbl.orders} บิล
                                </td>
                                <td className="py-3 text-right text-slate-600">
                                  ฿{tbl.aov.toLocaleString()}
                                </td>
                                <td className="py-3 text-right font-black text-emerald-600">
                                  ฿{tbl.revenue.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Staff & Cashier Leaderboard & Audit */}
                  <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-base">
                            ประสิทธิภาพแคชเชียร์ในร้านคุณ
                          </h3>
                          <p className="text-xs text-slate-400">
                            สถิติยอดเงินที่รับ บิลที่ดูแล และการป้องกันการทุจริต
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                        {data.cashierRankings.length} พนักงาน
                      </span>
                    </div>

                    {data.cashierRankings.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-sm font-semibold">
                        ยังไม่มีข้อมูลประวัติแคชเชียร์ในร้านของคุณ
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                              <th className="pb-3 font-semibold">พนักงานแคชเชียร์</th>
                              <th className="pb-3 font-semibold text-center">
                                บิลที่รับ
                              </th>
                              <th className="pb-3 font-semibold text-center">
                                ยกเลิก (Void)
                              </th>
                              <th className="pb-3 font-semibold text-right">
                                ยอดรวมที่รับ
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {data.cashierRankings.slice(0, 8).map((cashier, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-slate-50/80 transition-colors"
                              >
                                <td className="py-3 font-bold text-slate-800 flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                                    {cashier.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div>{cashier.name}</div>
                                    <div className="text-[10px] text-slate-400 font-normal">
                                      เฉลี่ย ฿{cashier.aov.toLocaleString()} / บิล
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 text-center text-slate-600 font-semibold">
                                  {cashier.bills} บิล
                                </td>
                                <td className="py-3 text-center">
                                  {cashier.cancelledBills > 0 ? (
                                    <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px]">
                                      {cashier.cancelledBills} บิล
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[11px] font-medium">
                                      0 บิล (ปลอดภัย)
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 text-right font-black text-emerald-600">
                                  ฿{cashier.revenue.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* สมุดบันทึกธุรกรรมบิลสด 15 รายการล่าสุด (Live Realtime Transaction Ledger) */}
                <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-base">
                          บันทึกธุรกรรมบิลล่าสุดของร้าน (Live Transaction Ledger)
                        </h3>
                        <p className="text-xs text-slate-400">
                          รายการรับชำระเงิน 15 บิลล่าสุดเฉพาะร้านของคุณแบบเรียลไทม์
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200/50">
                      อัปเดตอัตโนมัติ
                    </span>
                  </div>

                  {data.recentTransactions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm font-semibold">
                      ยังไม่มีรายการบิลชำระเงินในร้านของคุณ
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                            <th className="pb-3 font-semibold">เลขที่บิล (Order ID)</th>
                            <th className="pb-3 font-semibold">ช่องทางชำระเงิน</th>
                            <th className="pb-3 font-semibold">ผู้รับชำระ</th>
                            <th className="pb-3 font-semibold text-right">
                              ก่อน VAT
                            </th>
                            <th className="pb-3 font-semibold text-right">
                              VAT 7%
                            </th>
                            <th className="pb-3 font-semibold text-right">
                              ยอดสุทธิรวม
                            </th>
                            <th className="pb-3 font-semibold text-right">เวลาที่ทำรายการ</th>
                            <th className="pb-3 font-semibold text-center">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {data.recentTransactions.map((tx) => {
                            const isPromptPay =
                              tx.paymentMethod.toLowerCase().includes("prompt") ||
                              tx.paymentMethod.toLowerCase().includes("transfer");

                            return (
                              <tr
                                key={tx.id}
                                className="hover:bg-slate-50/70 transition-colors"
                              >
                                <td className="py-3.5 font-mono font-black text-slate-800">
                                  #{tx.orderId.slice(0, 8)}
                                </td>
                                <td className="py-3.5">
                                  {isPromptPay ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                                      <Smartphone className="w-3 h-3" /> พร้อมเพย์ QR
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                      <Banknote className="w-3 h-3" /> เงินสด
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 text-slate-600 font-bold">
                                  {tx.cashierName}
                                </td>
                                <td className="py-3.5 text-right text-slate-500 font-medium">
                                  ฿{tx.subtotalBeforeVat.toLocaleString()}
                                </td>
                                <td className="py-3.5 text-right text-slate-500 font-medium">
                                  ฿{tx.vatAmount.toLocaleString()}
                                </td>
                                <td className="py-3.5 text-right font-black text-slate-900">
                                  ฿{tx.totalAmount.toLocaleString()}
                                </td>
                                <td className="py-3.5 text-right text-slate-400 text-[11px] font-medium">
                                  {new Date(tx.createdAt).toLocaleString("th-TH", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                                <td className="py-3.5 text-center">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                                    <CheckCircle2 className="w-3 h-3" /> สำเร็จ
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 📦 มุมมองที่ 2: ภาพรวมคลังสินค้า & สต็อก (Inventory & Stock Overview) */}
            {/* ========================================================================= */}
            {activeMainView === "inventory" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Hero Header ของหน้าคลังสินค้า */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-[28px] p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -z-0"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/10">
                        <Boxes className="w-3.5 h-3.5" />
                        <span>ระบบควบคุมคลังสินค้าอัจฉริยะ (Inventory Intelligence)</span>
                      </div>
                      <h2 className="text-xl lg:text-3xl font-black tracking-tight">
                        ภาพรวมสต็อกและสินค้าคงคลังร้าน
                      </h2>
                      <p className="text-slate-300 text-xs lg:text-sm max-w-2xl font-medium">
                        ติดตามความเคลื่อนไหว ตรวจเช็คมูลค่าสต็อก และรับแจ้งเตือนวัตถุดิบ/สินค้าใกล้หมดแบบเรียลไทม์
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        href="/dashboard/inventory"
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 text-xs font-black hover:bg-slate-100 active:scale-95 transition-all shadow-lg"
                      >
                        <Sliders className="w-4 h-4 text-indigo-600" />
                        <span>จัดการคลังเต็มรูปแบบ</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 5 ดัชนีชี้วัดคลังสินค้า (Stock KPI Overview Cards) */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Card 1: Total SKUs */}
                  <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400">รายการสินค้า/SKU</span>
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {data.inventory.stats.totalSKUs.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-slate-400">SKU</span>
                    </div>
                    <div className="text-[11px] text-blue-600 font-bold mt-1">
                      รวม {data.inventory.stats.totalItems.toLocaleString()} ชิ้นในคลัง
                    </div>
                  </div>

                  {/* Card 2: Total Stock Value */}
                  <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400">มูลค่าสต็อกรวม</span>
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      ฿{data.inventory.stats.totalValue.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-bold mt-1">
                      คำนวณตามราคาทุนสต็อก
                    </div>
                  </div>

                  {/* Card 3: Low Stock Alert */}
                  <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400">สินค้าใกล้หมด</span>
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-amber-600">
                      {data.inventory.stats.lowStockCount}{" "}
                      <span className="text-xs font-normal text-slate-400">รายการ</span>
                    </div>
                    <div className="text-[11px] text-amber-700 font-bold mt-1">
                      ต่ำกว่า 5 ชิ้น ควรเติมสต็อก
                    </div>
                  </div>

                  {/* Card 4: Out of Stock */}
                  <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400">หมดสต็อก</span>
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                        <XCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-rose-600">
                      {data.inventory.stats.outOfStockCount}{" "}
                      <span className="text-xs font-normal text-slate-400">รายการ</span>
                    </div>
                    <div className="text-[11px] text-rose-600 font-bold mt-1">
                      สินค้าไม่พร้อมจำหน่าย
                    </div>
                  </div>

                  {/* Card 5: Waste / Lost Value */}
                  <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400">ปรับปรุง/ของเสีย</span>
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      ฿{data.inventory.stats.lostValue.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-purple-600 font-bold mt-1">
                      ยอดตัดของเสียและสูญหาย
                    </div>
                  </div>
                </div>

                {/* หลอดสุขภาพสต็อก (Stock Health & Distribution Progress Bar) */}
                <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm">
                          ความสมบูรณ์ของคลังสินค้า (Stock Availability Health)
                        </h4>
                        <p className="text-xs text-slate-400">
                          สัดส่วนความพร้อมของสินค้าทั้งหมดในร้าน
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/50">
                      พร้อมขาย {Math.max(0, 100 - (data.inventory.stats.lowStockCount + data.inventory.stats.outOfStockCount) * 10)}%
                    </span>
                  </div>

                  {/* Multi-segment progress bar */}
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                    <div
                      style={{
                        width: `${Math.max(
                          0,
                          100 -
                            ((data.inventory.stats.lowStockCount +
                              data.inventory.stats.outOfStockCount) /
                              Math.max(data.inventory.stats.totalSKUs, 1)) *
                              100
                        )}%`,
                      }}
                      className="bg-emerald-500 h-full transition-all duration-500"
                      title="พร้อมขาย"
                    />
                    <div
                      style={{
                        width: `${
                          (data.inventory.stats.lowStockCount /
                            Math.max(data.inventory.stats.totalSKUs, 1)) *
                          100
                        }%`,
                      }}
                      className="bg-amber-400 h-full transition-all duration-500"
                      title="ใกล้หมด"
                    />
                    <div
                      style={{
                        width: `${
                          (data.inventory.stats.outOfStockCount /
                            Math.max(data.inventory.stats.totalSKUs, 1)) *
                          100
                        }%`,
                      }}
                      className="bg-rose-500 h-full transition-all duration-500"
                      title="หมดสต็อก"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span>พร้อมขายปกติ</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        <span>ใกล้หมด ({data.inventory.stats.lowStockCount})</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        <span>หมดสต็อก ({data.inventory.stats.outOfStockCount})</span>
                      </span>
                    </div>
                    <span className="font-semibold text-slate-700">
                      รวม {data.inventory.stats.totalSKUs} รายการ
                    </span>
                  </div>
                </div>

                {/* 2 คอลัมน์: สินค้าใกล้หมด & ประวัติการเคลื่อนไหวสต็อกล่าสุด */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* ซ้าย: สินค้าใกล้หมดและต้องสั่งเพิ่ม (Low Stock Warning List) */}
                  <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-base">
                              สินค้าที่ต้องเติมสต็อกด่วน
                            </h3>
                            <p className="text-xs text-slate-400">
                              รายการที่เหลือต่ำกว่าจุดสั่งซื้อขั้นต่ำ
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/dashboard/inventory/list"
                          className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>ดูทั้งหมด</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {data.inventory.lowStockItems.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 text-sm font-semibold">
                          🎉 สต็อกสมบูรณ์ ไม่มีสินค้าใกล้หมดในขณะนี้
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {data.inventory.lowStockItems.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs border border-slate-100">
                                  #{idx + 1}
                                </span>
                                <div>
                                  <div className="text-xs font-black text-slate-800">
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-semibold">
                                    ราคาต่อหน่วย ฿{item.price.toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div
                                  className={`text-sm font-black ${
                                    item.quantity <= 0
                                      ? "text-rose-600"
                                      : "text-amber-600"
                                  }`}
                                >
                                  {item.quantity <= 0
                                    ? "หมดสต็อก"
                                    : `เหลือ ${item.quantity} ชิ้น`}
                                </div>
                                <span
                                  className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-md mt-0.5 ${
                                    item.quantity <= 0
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {item.quantity <= 0 ? "OUT OF STOCK" : "LOW STOCK"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                      <Link
                        href="/dashboard/inventory/list"
                        className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                      >
                        ไปที่หน้าจัดการสต็อกคงเหลือ ➔
                      </Link>
                    </div>
                  </div>

                  {/* ขวา: สมุดบันทึกการเคลื่อนไหวสต็อกล่าสุด (Recent Stock Logs) */}
                  <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                            <History className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-base">
                              ประวัติการเคลื่อนไหวสต็อกล่าสุด
                            </h3>
                            <p className="text-xs text-slate-400">
                              บันทึกการรับเข้า ขายออก และปรับปรุงยอด
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/dashboard/inventory/history"
                          className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>ดูประวัติ</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {data.inventory.recentStockLogs.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 text-sm font-semibold">
                          ยังไม่มีบันทึกการเคลื่อนไหวสต็อกในร้านของคุณ
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {data.inventory.recentStockLogs.map((log) => {
                            const isPositive = log.changeAmount > 0;
                            const isSale = log.actionType === "SALE";
                            const isAdjust = log.actionType === "ADJUST" || log.actionType === "WASTE";

                            return (
                              <div
                                key={log.id}
                                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/80 transition-colors border border-slate-50"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                                      isPositive
                                        ? "bg-emerald-50 text-emerald-600"
                                        : isSale
                                        ? "bg-blue-50 text-blue-600"
                                        : "bg-purple-50 text-purple-600"
                                    }`}
                                  >
                                    {isPositive ? "IN" : isSale ? "POS" : "ADJ"}
                                  </div>
                                  <div>
                                    <div className="text-xs font-black text-slate-800">
                                      {log.productName}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-semibold">
                                      โดย {log.performedBy} • {log.note || "ไม่มีหมายเหตุ"}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div
                                    className={`text-sm font-black ${
                                      isPositive
                                        ? "text-emerald-600"
                                        : "text-slate-800"
                                    }`}
                                  >
                                    {isPositive ? `+${log.changeAmount}` : log.changeAmount} ชิ้น
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-medium">
                                    {new Date(log.createdAt).toLocaleString("th-TH", {
                                      day: "2-digit",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                      <Link
                        href="/dashboard/inventory/history"
                        className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                      >
                        ดูประวัติการนำเข้าและตัดสต็อกทั้งหมด ➔
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 3 การ์ดทางลัดจัดการคลังสินค้า (Quick Action Module Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    href="/dashboard/inventory/list"
                    className="p-5 bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-200 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      รายการสินค้าคงเหลือ
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      เช็คจำนวนสต็อกปัจจุบัน และตั้งค่าจุดแจ้งเตือนสินค้าใกล้หมด
                    </p>
                  </Link>

                  <Link
                    href="/dashboard/inventory/history"
                    className="p-5 bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-purple-200 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <History className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
                      ประวัติการนำเข้าสต็อก
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      ตรวจสอบล็อตสินค้าที่รับเข้า พร้อมยอดเงินและใบนำส่ง
                    </p>
                  </Link>

                  <Link
                    href="/dashboard/inventory/adjustment"
                    className="p-5 bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      ปรับปรุงยอด / บันทึกของเสีย
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      ตัดสต็อกสินค้าชำรุด หมดอายุ หรือนับสต็อกประจำรอบ
                    </p>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
