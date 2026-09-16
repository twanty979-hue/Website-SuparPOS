'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Sparkles, 
  Mail, 
  ExternalLink, 
  Download, 
  Printer, 
  Wifi, 
  Bell, 
  Store, 
  LogOut,
  Home
} from 'lucide-react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState<string>(searchParams.get('email') || '');
  const [shopName, setShopName] = useState<string>(searchParams.get('shop') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (session.user.email && !email) {
            setEmail(session.user.email);
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('brand_id')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile?.brand_id) {
            const { data: brand } = await supabase
              .from('brands')
              .select('name')
              .eq('id', profile.brand_id)
              .maybeSingle();

            if (brand?.name) {
              setShopName(brand.name);
            }
          }
        }
      } catch (err) {
        console.error('Error loading session data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [email]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-sky-50 relative overflow-hidden p-4 sm:p-6 font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-brand-300/30 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/25 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-brand-500/10 border border-white/80 p-6 sm:p-10 relative z-10 transition-all duration-300">
        
        {/* Top Logo */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg shadow-brand-500/15 mx-auto mb-3 p-2 border border-slate-100 relative overflow-hidden group">
            <Image
              src="/icon.png"
              alt="FoodScan Logo"
              fill
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('fallback-icon');
              }}
            />
            <Store className="w-10 h-10 text-brand-500 hidden fallback-icon:block absolute" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            เปิดร้านง่าย ขายคล่อง ทันสมัย
          </div>
        </div>

        {/* Success Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            สร้างร้านค้าสำเร็จเรียบร้อย! 🎉
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
            ร้าน <strong className="text-slate-900 font-bold">{shopName || 'ของคุณ'}</strong> พร้อมเปิดใช้งานแล้ว เลือกดาวน์โหลด 3 ระบบด้านล่างเพื่อเริ่มขายได้ทันที
          </p>
        </div>

        {/* Account Info Pill */}
        {email && (
          <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>บัญชีใช้งาน: <strong className="text-slate-800 font-bold">{email}</strong></span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[10px]">
              เปิดร้านสำเร็จ
            </span>
          </div>
        )}

        {/* Notice Box about Maintenance */}
        <div className="mb-5 p-4 rounded-2xl bg-sky-50/80 border border-sky-200/80 flex items-start gap-2.5 text-xs text-sky-950 leading-relaxed">
          <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">เลือกระบบที่ต้องการใช้งานด้านล่าง:</strong> ระหว่างที่ระบบหลังบ้านบนเว็บกำลังปรับปรุงเพิ่มเติม ท่านสามารถดาวน์โหลดและล็อกอินเข้าใช้งานขายหน้าร้านได้ทันทีผ่าน 3 ระบบนี้ครับ
          </div>
        </div>

        {/* 3 Platforms Download Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/50 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              พร้อมให้ดาวน์โหลดใช้งานฟรี
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              รองรับทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์
            </span>
          </div>

          {/* Mobile Apps Row (iOS + Android) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* 🍏 App Store */}
            <a
              href="https://apps.apple.com/app/pos-foodscan/id6809176972"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-slate-200/90 hover:border-slate-800 bg-white hover:bg-slate-50/80 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.96.04-2.12.64-2.79 1.43-.59.68-1.11 1.77-.97 2.8 1.07.08 2.13-.61 2.75-1.36z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 leading-tight">DOWNLOAD ON</div>
                <div className="text-sm font-black text-slate-900 group-hover:text-slate-800 transition-colors leading-tight mt-0.5 flex items-center gap-1.5">
                  <span>App Store</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 border border-slate-200">v2.1.1</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                  iOS • iPhone & iPad
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-700 transition-colors flex-shrink-0" />
            </a>

            {/* 🟢 Google Play */}
            <a
              href="https://play.google.com/store/apps/details?id=com.pos.foodscan"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-slate-200/90 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-emerald-200 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 group-hover:bg-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1 9.3-9.3v-.2L3.7 2.2l-.1.1z"/>
                  <path fill="#FBBC04" d="M16.1 14.8l-3.1-3.1v-.2l3.1-3.1.1.1 3.7 2.1c1 .6 1 1.5 0 2.1l-3.8 2.2z"/>
                  <path fill="#EA4335" d="M16.2 14.7L13 11.5 3.6 20.9c.4.4.9.4 1.6 0l11-6.2z"/>
                  <path fill="#34A853" d="M16.2 8.3L5.2 2.1C4.5 1.7 4 1.7 3.6 2.1L13 11.5l3.2-3.2z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 leading-tight">GET IT ON</div>
                <div className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight mt-0.5 flex items-center gap-1.5">
                  <span>Google Play</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200">v2.1.1</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-0.5 truncate">
                  Android • มือถือ & POS
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
            </a>
          </div>

          {/* 🔵 Windows Desktop (.exe) */}
          <a
            href="https://img.pos-foodscan.com/downloads/POS-Foodscan-Setup-v2.1.1.exe"
            download="POS-Foodscan-Setup-v2.1.1.exe"
            className="group flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border border-sky-200/90 hover:border-sky-500 bg-gradient-to-r from-sky-50/40 via-white to-sky-50/20 hover:bg-sky-50/60 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white border border-sky-200 group-hover:border-sky-400 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                <svg className="w-5 h-5 fill-current text-[#0078D4]" viewBox="0 0 24 24">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.606L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.901-1.8" />
                </svg>
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition-colors">Windows Desktop (.exe)</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-700 border border-sky-200">v2.1.1</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  สำหรับคอมพิวเตอร์และโน้ตบุ๊ก • ฟรี 20.8 MB (พิมพ์อัตโนมัติ USB, LAN, BT)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 text-white group-hover:bg-sky-600 text-xs font-bold transition-all shadow-sm flex-shrink-0">
              <span className="hidden sm:inline">ดาวน์โหลด</span>
              <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* Bottom Feature Badges */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><Printer className="w-3.5 h-3.5 text-emerald-500" /> ต่อเครื่องพิมพ์ USB, LAN, Bluetooth</span>
            <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-emerald-500" /> ขายออฟไลน์ได้</span>
            <span className="flex items-center gap-1.5"><Bell className="w-3.5 h-3.5 text-emerald-500" /> เสียงเตือนออเดอร์เข้า</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
          <Link href="/" className="hover:text-slate-700 inline-flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>กลับหน้าหลัก</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="hover:text-red-500 inline-flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ / สลับบัญชี</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
