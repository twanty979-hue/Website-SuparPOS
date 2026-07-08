// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getDashboardDataAction } from '@/app/actions/dashboardActions';
import { processPaymentAction } from '@/app/actions/paymentActions'; 
import { db } from '@/lib/db'; 
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Import Components
import DashboardChart from './components/DashboardChart';
import SuparPosLoading from './components/SuparPosLoading';

dayjs.extend(localizedFormat);

// Icons
const IconDashboard = ({ size = 28 }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 17v-5"/><path d="M12 17v-8"/><path d="M16 17v-3"/></svg>;
const IconTrending = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconBill = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const IconAvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
const IconCrown = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>;
const IconCalendar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconChevronDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconChartLine = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>;
const IconCloudOff = ({ size = 20, className = "text-amber-600" }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IconInfo = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;

export default function DashboardPage() {
    const [viewMode, setViewMode] = useState<string>('last7days'); 
    const [selectedDate, setSelectedDate] = useState({
        from: dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
        to: dayjs().format('YYYY-MM-DD')
    });

    const [mobileTab, setMobileTab] = useState<'chart' | 'products'>('chart');
    const [showFilter, setShowFilter] = useState(false);
    const [tempDate, setTempDate] = useState({
        from: dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
        to: dayjs().format('YYYY-MM-DD')
    });

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [activeAdvancedTab, setActiveAdvancedTab] = useState<number>(0); 

    // Offline Sync States
    const [unsyncedQueue, setUnsyncedQueue] = useState<any[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showSyncBanner, setShowSyncBanner] = useState(false);

    useEffect(() => {
        fetchData();
        checkOfflineData(); 
    }, [viewMode, selectedDate]);

    const checkOfflineData = async () => {
        try {
            if (!db.isOpen()) await db.open();
            const queue = await db.sync_queue.toArray();
            const pendingItems = queue.filter(q => q.status === 'pending');
            setUnsyncedQueue(pendingItems);
            setShowSyncBanner(pendingItems.length > 0);
        } catch (error) {
            console.error("❌ Error checking offline queue:", error);
        }
    };

    const handleSyncNow = async () => {
        if (unsyncedQueue.length === 0) return;
        setIsSyncing(true);

        let successCount = 0;
        let failCount = 0;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const accessToken = session?.access_token;

            for (const item of unsyncedQueue) {
                const isCancel = item.type === 'cancel_order' || 
                                 item.type === 'cancel_order_item' || 
                                 (item.payload && (item.payload.action === 'cancel_order' || item.payload.action === 'cancel_order_item'));
                
                let res: any;
                if (isCancel) {
                    const response = await fetch('/api/pos/sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': accessToken ? `Bearer ${accessToken}` : ''
                        },
                        body: JSON.stringify(item.payload)
                    });
                    res = await response.json();
                } else {
                    res = await processPaymentAction(item.payload);
                }
                
                if (res.success) {
                    await db.sync_queue.delete(item.id);
                    successCount++;
                } else {
                    console.error("❌ Sync Failed for Item:", item.id, res.error);
                    failCount++;
                }
            }

            if (failCount === 0) {
                setShowSyncBanner(false); 
                alert(`ซิงค์ข้อมูลสำเร็จทั้งหมด ${successCount} รายการ 🎉`);
            } else {
                alert(`ซิงค์สำเร็จ ${successCount} รายการ, ล้มเหลว ${failCount} รายการ\nกรุณาลองใหม่เมื่อสัญญาณเสถียร`);
            }

            await checkOfflineData();
            fetchData();

        } catch (error) {
            console.error("Sync Error:", error);
            alert("เกิดข้อผิดพลาดในการซิงค์ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
        } finally {
            setIsSyncing(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const res = await getDashboardDataAction(viewMode, selectedDate.from, selectedDate.to);
            if (res.success) {
                setData(res);
            } else {
                setErrorMessage(res.error || 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
            }
        } catch (e: any) {
            setErrorMessage(e.message || 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(val);
    };

    const formatNumber = (val: number) => {
        return new Intl.NumberFormat('th-TH').format(val);
    };

    const getDisplayLabel = () => {
        if (viewMode === 'all') return 'ทั้งหมด';
        if (viewMode === 'today') return 'วันนี้';
        if (viewMode === 'last7days') return '7 วันล่าสุด';
        if (viewMode === 'thisMonth') return 'เดือนนี้';
        if (viewMode === 'custom') {
            return `${dayjs(selectedDate.from).locale('th').format('D MMM YY')} - ${dayjs(selectedDate.to).locale('th').format('D MMM YY')}`;
        }
        return 'ช่วงเวลานี้';
    };

    const applyDateFilter = (mode: string) => {
        const today = dayjs().format('YYYY-MM-DD');
        if (mode === 'today') {
            setViewMode('today');
            setSelectedDate({ from: today, to: today });
            setShowFilter(false);
        } else if (mode === 'last7days') {
            setViewMode('last7days');
            setSelectedDate({
                from: dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
                to: today
            });
            setShowFilter(false);
        } else if (mode === 'thisMonth') {
            setViewMode('thisMonth');
            setSelectedDate({
                from: dayjs().startOf('month').format('YYYY-MM-DD'),
                to: dayjs().endOf('month').format('YYYY-MM-DD')
            });
            setShowFilter(false);
        } else if (mode === 'all') {
            setViewMode('all');
            setSelectedDate({ from: today, to: today });
            setShowFilter(false);
        } else if (mode === 'custom') {
            setViewMode('custom');
        }
    };

    const handleConfirmCustomFilter = () => {
        setViewMode('custom');
        setSelectedDate({ from: tempDate.from, to: tempDate.to });
        setShowFilter(false);
    };

    const RANK_COLORS = ['bg-amber-100 text-amber-700', 'bg-slate-200 text-slate-700', 'bg-orange-100 text-orange-700', 'bg-slate-50 text-slate-500', 'bg-slate-50 text-slate-500'];

    // Plan gating check
    const isUnlocked = data?.plan === 'pro' || data?.plan === 'ultimate' || data?.effectivePlan === 'pro' || data?.effectivePlan === 'ultimate';

    if (loading) {
        return <SuparPosLoading message="กำลังเตรียม SuparPOS" />;
    }

    if (errorMessage) {
        return (
            <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6">
                <div className="bg-white p-8 rounded-[24px] shadow-sm max-w-sm w-full text-center border border-slate-100">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
                        ⚠️
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-2">ไม่พบการเชื่อมต่ออินเทอร์เน็ต</h3>
                    <p className="text-slate-400 text-xs font-semibold mb-6 leading-relaxed">
                        {errorMessage}
                    </p>
                    <button 
                        onClick={fetchData}
                        className="w-full py-3 bg-slate-900 text-white font-extrabold text-sm rounded-xl shadow-md transition-transform active:scale-95 hover:bg-slate-800"
                    >
                        ลองใหม่
                    </button>
                </div>
            </div>
        );
    }

    const totalRev = data?.summary?.totalRevenue || 0;
    const totalOrders = data?.summary?.totalOrders || 0;
    const aov = totalOrders > 0 ? totalRev / totalOrders : 0;

    return (
        <div className="min-h-screen bg-[#FAF9F6] p-3 lg:p-10 font-sans pb-20 lg:pb-10 text-slate-800">
            {/* 🛡️ Sync Banner Overlay */}
            {showSyncBanner && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
                            {isSyncing ? (
                                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <IconCloudOff size={40} className="text-amber-500" />
                            )}
                            {!isSyncing && (
                                <div className="absolute -top-1 -right-1 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border-2 border-white shadow-sm">
                                    !
                                </div>
                            )}
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">มีบิลรอซิงค์ข้อมูล</h3>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed text-sm">
                            มียอดขาย <strong className="text-amber-600">{unsyncedQueue.length} รายการ</strong> ที่บันทึกแบบออฟไลน์ไว้ กรุณากดซิงค์เพื่อให้ข้อมูลรวมในกราฟ
                        </p>
                        <div className="w-full space-y-3">
                            <button 
                                onClick={handleSyncNow} 
                                disabled={isSyncing}
                                className="w-full py-4 rounded-2xl font-black text-lg text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
                            >
                                {isSyncing ? 'กำลังซิงค์ขึ้นระบบ...' : 'อัปเดตยอดขายเดี๋ยวนี้ 🚀'}
                            </button>
                            <button 
                                onClick={() => setShowSyncBanner(false)} 
                                disabled={isSyncing}
                                className="w-full py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors disabled:opacity-50 text-sm"
                            >
                                ข้ามไปก่อน (ไว้ทำทีหลัง)
                            </button>
                        </div>
                        <div className="bg-white p-5 lg:p-6 rounded-[24px] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col mt-4">
                            <h3 className="font-extrabold text-base text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-4.5 bg-emerald-500 rounded-full inline-block"></span>
                                ท็อปปิ้งขายดี Top 5
                            </h3>
                            <div className="space-y-3">
                                {data?.topToppings?.length === 0 ? (
                                    <div className="py-6 flex flex-col items-center justify-center text-slate-400 gap-2">
                                        <span className="text-lg">＋</span>
                                        <span className="text-xs font-bold">ยังไม่มีข้อมูลท็อปปิ้ง</span>
                                    </div>
                                ) : (
                                    data?.topToppings?.slice(0, 5).map((p: any, idx: number) => (
                                        <div key={idx} className="group flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${RANK_COLORS[idx] || RANK_COLORS[4]}`}>{idx + 1}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="font-extrabold text-slate-700 truncate text-xs">{p.name}</p>
                                                    <p className="font-black text-slate-900 text-xs shrink-0">{p.qty} <span className="text-[10px] text-slate-400 font-semibold">ครั้ง</span></p>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: `${(p.qty / (data.topToppings[0].qty || 1)) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-4 lg:space-y-8">
                {/* Plan Warning Banner */}
                {data?.limitWarning && (
                    <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-xl text-xs lg:text-sm font-bold flex items-center gap-3 animate-in fade-in">
                        <span className="flex items-center justify-center shrink-0">
                            <IconInfo />
                        </span>
                        <span>แพ็กเกจ Free หรือแพ็กเกจที่หมดอายุแล้ว จะสามารถดูรายงานย้อนหลังได้สูงสุด <strong className="text-indigo-900">30 วัน</strong> เท่านั้น</span>
                    </div>
                )}

                {/* Header Section */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 lg:bg-transparent lg:shadow-none lg:border-none lg:p-0">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                        <div className="flex justify-between w-full items-center">
                            <div className="flex items-center gap-3 md:gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const layoutMenuBtn = document.querySelector('header button');
                                        if (layoutMenuBtn instanceof HTMLElement) {
                                            layoutMenuBtn.click();
                                        }
                                    }}
                                    className="group active:scale-95 transition-transform duration-200 flex-shrink-0"
                                    title="คลิกไอคอนเพื่อเปิดเมนูสไลด์บาร์"
                                >
                                    <div className="transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6 text-slate-800 bg-slate-100 p-2 md:p-2.5 rounded-xl shadow-sm border border-slate-200">
                                        <IconDashboard size={24} />
                                    </div>
                                </button>
                                
                                <div className="flex flex-col">
                                    <h1 className="text-xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">ภาพรวมร้าน</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] lg:text-base text-slate-400 font-semibold">ช่วงเวลา:</span>
                                        <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-[11px] lg:text-base border border-indigo-100 whitespace-nowrap">
                                            {getDisplayLabel()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Dropdown Filters */}
                            <div className="relative z-20">
                                <button onClick={() => setShowFilter(!showFilter)} className="flex items-center justify-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-bold text-slate-600 text-xs shadow-sm">
                                    <IconCalendar /><span className="hidden sm:inline">ช่วงเวลา</span><IconChevronDown />
                                </button>

                                {showFilter && (
                                    <div className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-2xl shadow-xl border border-slate-100 p-4 animate-in fade-in zoom-in-95 duration-200 z-30">
                                        <h4 className="text-xs font-black text-slate-700 mb-3 px-1">เลือกช่วงเวลา</h4>
                                        <div className="flex flex-col gap-1.5">
                                            <button 
                                                onClick={() => applyDateFilter('today')} 
                                                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${viewMode === 'today' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                วันนี้
                                            </button>
                                            <button 
                                                onClick={() => applyDateFilter('last7days')} 
                                                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${viewMode === 'last7days' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                7 วันล่าสุด
                                            </button>
                                            <button 
                                                onClick={() => applyDateFilter('thisMonth')} 
                                                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${viewMode === 'thisMonth' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                เดือนนี้
                                            </button>
                                            <button 
                                                onClick={() => applyDateFilter('all')} 
                                                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${viewMode === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                ทั้งหมด
                                            </button>
                                            <button 
                                                onClick={() => applyDateFilter('custom')} 
                                                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${viewMode === 'custom' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                กำหนดเอง (Custom)
                                            </button>
                                        </div>

                                        {viewMode === 'custom' && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">จากวันที่</label>
                                                    <input type="date" value={tempDate.from} onChange={(e) => setTempDate({...tempDate, from: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">ถึงวันที่</label>
                                                    <input type="date" value={tempDate.to} onChange={(e) => setTempDate({...tempDate, to: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium" />
                                                </div>
                                                <button onClick={handleConfirmCustomFilter} className="w-full bg-slate-900 text-white font-extrabold py-2 rounded-lg hover:bg-slate-800 transition-all text-xs">ตกลง / ค้นหา</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metrics overview card (Single container) */}
                <div className="w-full bg-white p-4 rounded-[20px] border border-slate-100 shadow-[0_2px_18px_-4px_rgba(0,0,0,0.03)] flex items-center justify-between gap-1">
                    <div className="flex-1 flex flex-col items-center text-center">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                            <IconTrending />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">ยอดขาย</span>
                        <span className="text-sm font-black text-slate-800 mt-0.5 truncate max-w-full px-1">
                            {formatCurrency(totalRev)}
                        </span>
                    </div>
                    
                    <div className="w-px h-12 bg-slate-100"></div>

                    <div className="flex-1 flex flex-col items-center text-center">
                        <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center mb-1.5">
                            <IconBill />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">ออเดอร์</span>
                        <span className="text-sm font-black text-slate-800 mt-0.5">
                            {formatNumber(totalOrders)} <span className="text-[9px] font-semibold text-slate-400">บิล</span>
                        </span>
                    </div>

                    <div className="w-px h-12 bg-slate-100"></div>

                    <div className="flex-1 flex flex-col items-center text-center">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                            <IconAvg />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">ต่อบิล (AOV)</span>
                        <span className="text-sm font-black text-slate-800 mt-0.5 truncate max-w-full px-1">
                            {formatCurrency(aov)}
                        </span>
                    </div>
                </div>

                {/* Mobile view swapper */}
                <div className="lg:hidden bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex">
                    <button onClick={() => setMobileTab('chart')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${mobileTab === 'chart' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}><IconChartLine /> กราฟรายได้</button>
                    <button onClick={() => setMobileTab('products')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${mobileTab === 'products' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}><IconCrown /> เมนูขายดี</button>
                </div>

                {/* Main chart and products */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div className={`${mobileTab === 'chart' ? 'block' : 'hidden'} lg:block lg:col-span-2 bg-white p-5 rounded-[24px] border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)]`}>
                        <h3 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4.5 bg-indigo-600 rounded-full inline-block"></span>
                            แนวโน้มยอดขาย
                        </h3>
                        <DashboardChart data={data?.salesTrend} loading={loading} />
                    </div>

                    <div className={`${mobileTab === 'products' ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
                        <div className="bg-white p-5 lg:p-6 rounded-[24px] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col h-[350px]">
                            <h3 className="font-extrabold text-base text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-4.5 bg-amber-500 rounded-full inline-block"></span>
                                เมนูยอดฮิต Top 5
                            </h3>
                            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                                {data?.topProducts?.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                                        <IconCrown />
                                        <span className="text-xs font-bold">ยังไม่มีข้อมูลการขาย</span>
                                    </div>
                                ) : (
                                    data?.topProducts?.map((p: any, idx: number) => (
                                        <div key={idx} className="group flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${RANK_COLORS[idx] || RANK_COLORS[4]}`}>{idx + 1}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="font-extrabold text-slate-700 truncate text-xs">{p.name}</p>
                                                    <p className="font-black text-slate-900 text-xs shrink-0">{p.qty} <span className="text-[10px] text-slate-400 font-semibold">ชิ้น</span></p>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-amber-500' : 'bg-slate-400'}`} style={{ width: `${(p.qty / (data.topProducts[0].qty || 1)) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Reports Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                                📊
                            </div>
                            <h2 className="text-base lg:text-lg font-black text-slate-900 tracking-tight">รายงานขั้นสูง</h2>
                        </div>
                        {/* Premium Plan Badge */}
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-indigo-900 text-white px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm shrink-0">
                            <span>👑</span>
                            <span>PRO</span>
                        </div>
                    </div>

                    {/* Advanced tabs selector */}
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex overflow-x-auto gap-1 custom-scrollbar">
                        {[
                            { label: 'รายชั่วโมง', icon: '⏰' },
                            { label: 'การชำระเงิน', icon: '💳' },
                            { label: 'โต๊ะ/ออเดอร์', icon: '🪑' },
                            { label: 'พนักงาน', icon: '👥' }
                        ].map((tab, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setActiveAdvancedTab(idx)}
                                className={`flex-1 min-w-[90px] text-center py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shrink-0 ${activeAdvancedTab === idx ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tabs Content or Locked Gating */}
                    <div className="transition-all duration-300">
                        {!isUnlocked ? (
                            /* Locked overlay screen */
                            <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col items-center text-center max-w-md mx-auto my-6 animate-in fade-in duration-300">
                                <div className="w-16 h-16 bg-purple-50 text-purple-700 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner animate-pulse">
                                    🔒
                                </div>
                                <h3 className="text-base font-black text-slate-800 mb-2">วิเคราะห์ข้อมูลเชิงลึกเฉพาะลูกค้าแผน PRO 🚀</h3>
                                <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6">
                                    ยกระดับร้านค้าของคุณด้วยการวิเคราะห์ยอดขายรายชั่วโมง วิธีการชำระเงินที่นิยมใช้ และสถิติโต๊ะ/ประเภทออเดอร์เพื่อวางแผนการขายให้มีประสิทธิภาพสูงสุด
                                </p>
                                <button 
                                    onClick={() => alert("กรุณาติดต่อผู้ดูแลระบบเพื่อทำการอัปเกรดแผนใช้งาน")}
                                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-indigo-900 text-white font-extrabold text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-transform"
                                >
                                    อัปเกรดเป็นแผน PRO เลย 👑
                                </button>
                            </div>
                        ) : (
                            /* Tab Content when unlocked */
                            <div className="animate-in fade-in duration-300">
                                {activeAdvancedTab === 0 && (
                                    /* Hourly Sales Stats */
                                    <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col">
                                        <h3 className="font-extrabold text-slate-800 text-sm mb-1">การกระจายตัวยอดขายรายชั่วโมง</h3>
                                        <p className="text-slate-400 text-[10px] font-semibold mb-6">วิเคราะห์ช่วงเวลาที่ยอดขายสูงสุดของวัน (หน่วย: บาท)</p>
                                        {data?.hourlySales?.length === 0 ? (
                                            <div className="text-center py-10 font-bold text-xs text-slate-400">ไม่มีข้อมูลยอดขายรายชั่วโมงในช่วงเวลานี้</div>
                                        ) : (
                                            <div className="h-44 overflow-x-auto flex items-end gap-2 pb-2 custom-scrollbar">
                                                {data?.hourlySales?.map((h: any) => {
                                                    const maxHourlyRevenue = Math.max(...(data?.hourlySales?.map((item: any) => item.revenue) || [1]));
                                                    const barHeight = maxHourlyRevenue > 0 ? (h.revenue / maxHourlyRevenue) * 110 : 0;
                                                    return (
                                                        <div key={h.hour} className="flex flex-col items-center min-w-[44px] group cursor-pointer" title={`${h.hour}:00 น. | ยอดขาย: ${formatCurrency(h.revenue)} (${h.orders} บิล)`}>
                                                            {h.revenue > 0 && (
                                                                <span className="text-[9px] font-bold text-slate-700 mb-1 leading-none shrink-0">
                                                                    {h.revenue >= 1000 ? `${(h.revenue / 1000).toFixed(1)}k` : h.revenue.toFixed(0)}
                                                                </span>
                                                            )}
                                                            <div 
                                                                style={{ height: `${Math.max(barHeight, 4)}px` }} 
                                                                className={`w-3.5 rounded-t-md transition-all duration-300 ${h.revenue > 0 ? 'bg-gradient-to-b from-indigo-400 to-indigo-900' : 'bg-slate-200'}`}
                                                            ></div>
                                                            <span className="text-[9px] font-bold text-slate-400 mt-2 shrink-0">
                                                                {h.hour < 10 ? `0${h.hour}` : h.hour}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeAdvancedTab === 1 && (
                                    /* Payment Channel Stats */
                                    <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col gap-4">
                                        <h3 className="font-extrabold text-slate-800 text-sm">สัดส่วนช่องทางการชำระเงิน</h3>
                                        {data?.paymentStats?.length === 0 ? (
                                            <div className="text-center py-10 font-bold text-xs text-slate-400">ไม่มีข้อมูลช่องทางการชำระเงินในช่วงเวลานี้</div>
                                        ) : (
                                            <div className="space-y-4">
                                                {data?.paymentStats?.map((p: any) => {
                                                    const totalPaymentRevenue = data.paymentStats.reduce((sum: number, item: any) => sum + item.revenue, 0) || 1;
                                                    const ratio = p.revenue / totalPaymentRevenue;
                                                    const percentage = (ratio * 100).toFixed(1);
                                                    
                                                    let displayName = p.method.toUpperCase();
                                                    let methodColor = 'bg-emerald-500';
                                                    let textColor = 'text-emerald-600';
                                                    if (p.method === 'cash') {
                                                        displayName = 'เงินสด (Cash)';
                                                        methodColor = 'bg-emerald-500';
                                                        textColor = 'text-emerald-600';
                                                    } else if (p.method === 'promptpay') {
                                                        displayName = 'พร้อมเพย์ (PromptPay)';
                                                        methodColor = 'bg-sky-500';
                                                        textColor = 'text-sky-600';
                                                    } else if (p.method === 'transfer') {
                                                        displayName = 'โอนเงิน (Transfer)';
                                                        methodColor = 'bg-green-700';
                                                        textColor = 'text-green-700';
                                                    }

                                                    return (
                                                        <div key={p.method} className="flex flex-col gap-2">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-lg bg-slate-50 font-bold text-xs ${textColor}`}>
                                                                        {p.method === 'cash' ? '💵' : p.method === 'promptpay' ? '📱' : '🏦'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-xs text-slate-800">{displayName}</p>
                                                                        <p className="text-[10px] text-slate-400 font-semibold">{p.orders} บิล</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-black text-xs text-slate-800">{formatCurrency(p.revenue)}</p>
                                                                    <p className="text-[10px] text-slate-400 font-bold">{percentage}%</p>
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full ${methodColor}`} style={{ width: `${percentage}%` }}></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeAdvancedTab === 2 && (
                                    /* Table Stats */
                                    <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col gap-4">
                                        <h3 className="font-extrabold text-slate-800 text-sm">สถิติตามโต๊ะและประเภทออเดอร์</h3>
                                        {data?.tableStats?.length === 0 ? (
                                            <div className="text-center py-10 font-bold text-xs text-slate-400">ไม่มีข้อมูลยอดขายรายโต๊ะในช่วงเวลานี้</div>
                                        ) : (
                                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                                {data?.tableStats?.sort((a: any, b: any) => b.revenue - a.revenue).map((t: any) => {
                                                    const isTakeaway = t.type.toLowerCase() === 'takeaway' || t.table === '';
                                                    return (
                                                        <div key={`${t.type}_${t.table}`} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isTakeaway ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                                                    {isTakeaway ? '🛍️' : '🪑'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-xs text-slate-800">{isTakeaway ? 'ซื้อกลับบ้าน' : `โต๊ะ ${t.table}`}</p>
                                                                    <p className="text-[10px] text-slate-400 font-semibold">{isTakeaway ? 'Takeaway' : 'ทานที่ร้าน'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-black text-xs text-slate-800">{formatCurrency(t.revenue)}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold">{t.orders} บิล</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeAdvancedTab === 3 && (
                                    /* Staff Stats */
                                    <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col gap-4">
                                        <h3 className="font-extrabold text-slate-800 text-sm">ประสิทธิภาพและยอดขายรายบุคคล</h3>
                                        {data?.cashierStats?.length === 0 ? (
                                            <div className="text-center py-10 font-bold text-xs text-slate-400">ไม่มีข้อมูลยอดขายรายบุคคลในช่วงเวลานี้</div>
                                        ) : (
                                            <div className="space-y-4">
                                                {data?.cashierStats?.sort((a: any, b: any) => b.revenue - a.revenue).map((c: any, index: number) => (
                                                    <div key={c.cashierId} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-5 font-black text-center text-xs ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : 'text-slate-300'}`}>{index + 1}</span>
                                                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-extrabold text-indigo-700 text-xs overflow-hidden shrink-0">
                                                                {c.avatarUrl ? <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" /> : c.name.slice(0, 1).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-xs text-slate-800">{c.name}</p>
                                                                <p className="text-[10px] text-slate-400 font-semibold">แคชเชียร์</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-black text-xs text-[#0F172A]">{formatCurrency(c.revenue)}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold">{c.orders} บิล</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
