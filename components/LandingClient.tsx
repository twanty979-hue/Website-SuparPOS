'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Boxes, ChefHat, QrCode, ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ✅ Component โลโก้ (ดึงไฟล์รูปจาก public/icon.png)
const LogoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <img 
    src="/icon.png" 
    alt="SuparPOS Icon" 
    className={`object-contain ${className}`}
  />
);

// 🟢 รูปภาพธีม
const THEME_IMAGES = [
  "https://img.pos-foodscan.com/themes/1772268257454-theme_1772268255882.webp",
  "https://img.pos-foodscan.com/themes/1772268973031-theme_1772268972456.webp",
  "https://img.pos-foodscan.com/themes/1772276353675-theme_1772276352714.webp",
  "https://img.pos-foodscan.com/themes/1772282107542-theme_1772282106973.webp",
  "https://img.pos-foodscan.com/themes/1772270105027-theme_1772270103716.webp"
];

const PHONE_CASES = [
  'bg-[#111827] border-[#111827] ring-slate-800/50',
  'bg-[#163D2D] border-[#163D2D] ring-emerald-950/50',
  'bg-[#E8DCC4] border-[#E8DCC4] ring-amber-900/25',
  'bg-[#263238] border-[#263238] ring-slate-700/60',
  'bg-[#285943] border-[#285943] ring-emerald-900/50',
];

// 📱 Component มือถือจำลอง
const PhoneMockup = ({ imageIndex, className = "" }: { imageIndex: number, className?: string }) => (
  <div className={`absolute inset-0 rounded-[2rem] md:rounded-[2.35rem] border-[8px] md:border-[9px] shadow-2xl ring-1 overflow-visible ${PHONE_CASES[imageIndex]} ${className}`}>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[74px] md:w-[82px] h-[22px] md:h-[24px] bg-black rounded-full z-40 flex items-center justify-end px-3 shadow-sm border border-white/5">
          <div className="w-2.5 h-2.5 bg-slate-800/80 rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-1 h-1 bg-blue-900/50 rounded-full"></div>
          </div>
      </div>
      <div className="absolute top-24 -left-[14px] w-[2px] h-6 bg-slate-800 rounded-l-md border-y border-l border-slate-700/50 z-0"></div>
      <div className="absolute top-36 -left-[14px] w-[2px] h-12 bg-slate-800 rounded-l-md border-y border-l border-slate-700/50 z-0"></div>
      <div className="absolute top-52 -left-[14px] w-[2px] h-12 bg-slate-800 rounded-l-md border-y border-l border-slate-700/50 z-0"></div>
      <div className="absolute top-40 -right-[14px] w-[2px] h-16 bg-slate-800 rounded-r-md border-y border-r border-slate-700/50 z-0"></div>

      <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400 rounded-[1.55rem] md:rounded-[2rem] overflow-hidden">
          <img
              src={THEME_IMAGES[imageIndex]}
              alt={`Theme Preview ${imageIndex + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
          />
      </div>
  </div>
);

const BrandPOSArtwork = () => (
  <div className="pos-alive relative w-[340px] h-[430px] sm:w-[400px] sm:h-[500px] md:w-[580px] md:h-[700px] xl:w-[650px] xl:h-[790px] flex items-center justify-center">
    <div className="absolute inset-[12%] rounded-full bg-emerald-300/40 blur-[58px]"></div>
    <div className="absolute left-[8%] top-[20%] h-3 w-3 rounded-full bg-[#F5C84C] shadow-[0_0_0_8px_rgba(245,200,76,0.13)]"></div>
    <div className="absolute right-[4%] top-[10%] h-4 w-4 rounded-full bg-emerald-500/80 shadow-[0_0_0_10px_rgba(16,185,129,0.12)]"></div>
    <img
      src="/images/pos-mascot.png"
      alt="เครื่อง POS SuparPOS"
      className="relative z-10 h-full w-full object-contain drop-shadow-[0_28px_32px_rgba(15,82,57,0.24)] transition-transform duration-500 group-hover:scale-[1.025]"
    />
  </div>
);

export default function LandingClient() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ avatar_url?: string; full_name?: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [isPhoneExiting, setIsPhoneExiting] = useState(false);

  useEffect(() => {
      let swapTimer: ReturnType<typeof setTimeout> | undefined;
      const interval = setInterval(() => {
          setIsPhoneExiting(true);
          swapTimer = setTimeout(() => {
              setCurrentThemeIndex((prevIndex) => (prevIndex + 1) % THEME_IMAGES.length);
              setIsPhoneExiting(false);
          }, 360);
      }, 3600);
      return () => {
          clearInterval(interval);
          if (swapTimer) clearTimeout(swapTimer);
      };
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('avatar_url, full_name')
            .eq('id', session.user.id)
            .single();
            
          setProfile(profileData as { avatar_url?: string; full_name?: string } | null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkUser();

    const heroWrapper = document.getElementById('hero-tilt-wrapper');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleHeroTilt = (e: any) => {
        if (!heroWrapper) return;
        const rect = heroWrapper.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; 
        const rotateY = ((x - centerX) / centerX) * 10;

        const elements = heroWrapper.querySelectorAll('.tilt-element');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        elements.forEach((el: any) => {
            if(el.id === 'hero-phone-center') {
                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(8deg)`;
            } else if (el.id === 'cartoon-pos') {
                el.style.transform = `perspective(1000px) rotateX(${rotateX * 1.5}deg) rotateY(${rotateY * 1.5}deg) translateZ(40px)`;
            } else {
                el.style.transform = `perspective(1000px) rotateX(${rotateX * 0.8}deg) rotateY(${rotateY * 0.8}deg)`;
            }
        });
    };

    const resetTilt = () => {
        if (!heroWrapper) return;
        const elements = heroWrapper.querySelectorAll('.tilt-element');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        elements.forEach((el: any) => { el.style.transform = ''; });
    };

    if (heroWrapper) {
        heroWrapper.addEventListener('mousemove', handleHeroTilt);
        heroWrapper.addEventListener('touchmove', handleHeroTilt);
        heroWrapper.addEventListener('mouseleave', resetTilt);
        heroWrapper.addEventListener('touchend', resetTilt);
    }

    const handleSpotlight = (e: MouseEvent) => {
        if(window.innerWidth < 768) return;
        const cards = document.querySelectorAll(".spotlight-card");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const card of cards as any) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        }
    }
    document.addEventListener('mousemove', handleSpotlight);

    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        if (!navbar) return;
        if (window.scrollY > 50) {
            navbar.classList.add('bg-white/80', 'backdrop-blur-md', 'shadow-lg', 'shadow-emerald-500/5', 'py-2');
            navbar.classList.remove('bg-white/0', 'backdrop-blur-[0px]', 'py-4');
        } else {
            navbar.classList.remove('bg-white/80', 'backdrop-blur-md', 'shadow-lg', 'shadow-emerald-500/5', 'py-2');
            navbar.classList.add('bg-white/0', 'backdrop-blur-[0px]', 'py-4');
        }
    };
    window.addEventListener('scroll', handleScroll);

    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;
        revealElements.forEach((element) => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    return () => {
        if (heroWrapper) {
            heroWrapper.removeEventListener('mousemove', handleHeroTilt);
            heroWrapper.removeEventListener('touchmove', handleHeroTilt);
            heroWrapper.removeEventListener('mouseleave', resetTilt);
            heroWrapper.removeEventListener('touchend', resetTilt);
        }
        document.removeEventListener('mousemove', handleSpotlight);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('scroll', revealOnScroll);
    };
  }, [supabase]);

  const getAvatarUrlForNavbar = (path: string) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`; 
  };

  return (
    <div className="font-sans text-gray-800 bg-white antialiased overflow-x-hidden selection:bg-emerald-500 selection:text-white">

      {/* Shared Navbar */}
      <Navbar />

      {/* 1. Hero Section */}
      <section id="home" className="hero-bg min-h-screen flex items-center justify-center px-4 relative pt-20 overflow-hidden bg-[#F4FBF4]">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-25 animate-blob pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-lime-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-35 animate-blob pointer-events-none" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-blob pointer-events-none" style={{animationDelay: '4s'}}></div>

        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10 pt-10">
            
            {/* Text */}
            <div className="text-left reveal active order-2 lg:order-1 relative z-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-emerald-100 text-emerald-600 mb-6 text-sm font-semibold tracking-wide shadow-sm backdrop-blur-sm hover:scale-105 transition-transform cursor-default">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    ระบบ POS จัดการสต๊อกและคิดเงินหน้าร้าน
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-[46px] xl:text-[50px] font-black mb-6 leading-[1.15] text-slate-900">
                  SuparPOS ระบบ POS สำหรับร้านค้าปลีก คาเฟ่ และร้านอาหาร
                </h1>
                <p className="text-slate-600 text-lg md:text-xl mb-10 font-light leading-relaxed max-w-lg">
                  ระบบ POS และโปรแกรมขายหน้าร้านสำหรับร้านค้าปลีก คาเฟ่ และร้านอาหาร เปลี่ยนร้านธรรมดาให้เป็นร้านค้าดิจิทัลอย่างครบวงจร ช่วยคิดเงินหน้าร้าน จัดการสต๊อกสินค้า สแกนบาร์โค้ด และสั่งอาหารผ่าน QR Code ได้ง่ายดาย
                </p>
                <div className="hidden lg:grid grid-cols-3 gap-3 mb-8 max-w-xl">
                    {[
                        ['ครบในระบบเดียว', 'ขาย · ครัว · สต็อก'],
                        ['ทุกอุปกรณ์', 'มือถือ · แท็บเล็ต · PC'],
                        ['ข้อมูลทันที', 'ยอดขายแบบ Real-time'],
                    ].map(([title, detail]) => (
                        <div key={title} className="rounded-2xl border border-emerald-100 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-sm">
                            <div className="mb-1 flex items-center gap-2 text-xs font-black text-emerald-700">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                {title}
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500">{detail}</p>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href={user ? "https://app.suparpos.com" : "https://app.suparpos.com"} className="relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 rounded-full text-white font-bold text-lg transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 group transform hover:-translate-y-1 hover:shadow-emerald-500/50 overflow-hidden active:scale-95 duration-100">
                        <span className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-shine"></span>
                        <i className={`fa-solid ${user ? 'fa-arrow-right-to-bracket' : 'fa-rocket'} group-hover:rotate-12 transition-transform`}></i> 
                        {user ? 'เข้าสู่แดชบอร์ด' : 'สมัครใช้งานฟรี'}
                    </Link>
                    <Link href="/setup-printer" className="px-8 py-4 bg-white/80 border border-slate-200 hover:bg-white text-slate-700 rounded-full font-medium transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-lg backdrop-blur-sm hover:-translate-y-1 active:scale-95 duration-100">
                        <i className="fa-solid fa-print text-emerald-500 text-xl"></i> คู่มือตั้งค่าเครื่องพิมพ์
                    </Link>
                    <a href="https://www.youtube.com/watch?v=xiuRS7e-5R8" className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-medium transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-lg backdrop-blur-sm hover:-translate-y-1 active:scale-95 duration-100">
                        <i className="fa-regular fa-circle-play text-emerald-500 text-xl"></i> ดูวิดีโอตัวอย่าง
                    </a>
                </div>

                {/* 📲 การ์ดดาวน์โหลดแอปพลิเคชัน Android & Windows (.exe) - ดีไซน์ขาวมรกต สวย คลีน เข้ากับระบบ 100% */}
                <div id="download" className="mt-8 p-5 sm:p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-emerald-100 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.22)] relative overflow-hidden transition-all hover:shadow-[0_25px_60px_-20px_rgba(16,185,129,0.3)]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            พร้อมให้ดาวน์โหลดใช้งานฟรี
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">
                            รองรับทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์
                        </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
                        {/* 🟢 Google Play (สวย คลีน ขาว ขอบเขียว ตรงธีม) */}
                        <a 
                            href="https://play.google.com/store/apps/details?id=com.pos.foodscan" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl border border-slate-200/80 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                        >
                            <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-emerald-200 flex items-center justify-center flex-shrink-0 shadow-sm transition-all group-hover:scale-105 group-hover:bg-white">
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1 9.3-9.3v-.2L3.7 2.2l-.1.1z"/>
                                    <path fill="#FBBC04" d="M16.1 14.8l-3.1-3.1v-.2l3.1-3.1.1.1 3.7 2.1c1 .6 1 1.5 0 2.1l-3.8 2.2z"/>
                                    <path fill="#EA4335" d="M16.2 14.7L13 11.5 3.6 20.9c.4.4.9.4 1.6 0l11-6.2z"/>
                                    <path fill="#34A853" d="M16.2 8.3L5.2 2.1C4.5 1.7 4 1.7 3.6 2.1L13 11.5l3.2-3.2z"/>
                                </svg>
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-tight">GET IT ON</div>
                                <div className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight mt-0.5">Google Play</div>
                                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                                    <span>Android</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="text-slate-400 font-normal">ฟรี v1.0.6</span>
                                </div>
                            </div>
                            <i className="fa-solid fa-arrow-up-right-from-square text-xs text-slate-300 group-hover:text-emerald-500 transition-colors pr-1"></i>
                        </a>

                        {/* 🔵 Windows PC (.exe) (สวย คลีน ขาว ขอบฟ้า ตรงธีม) */}
                        <a 
                            href="https://img.pos-foodscan.com/downloads/SuparPOS-Setup.exe" 
                            download="SuparPOS-Setup.exe"
                            className="group flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl border border-slate-200/80 hover:border-sky-500 bg-white hover:bg-sky-50/40 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                        >
                            <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-sky-200 flex items-center justify-center flex-shrink-0 shadow-sm transition-all group-hover:scale-105 group-hover:bg-white">
                                <svg className="w-6 h-6 fill-current text-[#0078D4]" viewBox="0 0 24 24">
                                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.606L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.901-1.8" />
                                </svg>
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-tight">DOWNLOAD FOR</div>
                                <div className="text-base font-black text-slate-900 group-hover:text-sky-600 transition-colors leading-tight mt-0.5">Windows (.exe)</div>
                                <div className="text-[11px] text-sky-600 font-semibold mt-0.5 flex items-center gap-1">
                                    <span>PC 64-bit</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="text-slate-400 font-normal">83 MB</span>
                                </div>
                            </div>
                            <i className="fa-solid fa-download text-xs text-slate-300 group-hover:text-sky-500 transition-colors pr-1"></i>
                        </a>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5"><i className="fa-solid fa-print text-emerald-500"></i> ต่อเครื่องพิมพ์ USB, LAN, Bluetooth</span>
                        <span className="flex items-center gap-1.5"><i className="fa-solid fa-wifi text-emerald-500"></i> ขายออฟไลน์ได้</span>
                        <span className="flex items-center gap-1.5"><i className="fa-solid fa-bell text-emerald-500"></i> เสียงเตือนออเดอร์เข้า</span>
                    </div>
                </div>
            </div>

            {/* 🟢 3D Layout (มือถือ 1 เครื่อง + เครื่อง POS ขนาดใหญ่) */}
            <div className="relative z-10 flex justify-center items-center order-1 lg:order-2 tilt-wrapper w-full h-[550px] md:h-[700px] mt-10 lg:mt-0" id="hero-tilt-wrapper">
                {/* เครื่อง POS การ์ตูนวาดด้วยโค้ด (ปรับขนาดใหญ่และวางซ้าย) */}
                <div id="cartoon-pos" className="tilt-element absolute z-30 bottom-0 md:bottom-2 -left-8 md:-left-16 group hover:-translate-y-3 transition-transform duration-500">
                    <BrandPOSArtwork />
                </div>

                {/* Phone 3 */}
                <div
                    id="hero-phone-center"
                    className="tilt-element absolute z-50 top-24 -right-2 sm:top-16 sm:right-1 md:top-28 md:-right-1 xl:right-2 w-[145px] h-[303px] min-[420px]:w-[165px] min-[420px]:h-[345px] sm:w-[180px] sm:h-[375px] md:w-[190px] md:h-[395px] xl:w-[205px] xl:h-[425px] rotate-[8deg] cursor-pointer"
                >
                    <PhoneMockup
                        key={currentThemeIndex}
                        imageIndex={currentThemeIndex}
                        className={isPhoneExiting ? 'phone-single-exit' : 'phone-single-enter'}
                    />
                </div>
            </div>
        </div>
      </section>

      <section className="hidden lg:block relative z-20 mt-6 pb-12">
        <div className="mx-auto grid max-w-6xl grid-cols-4 gap-3 px-6">
          {[
            { icon: ShoppingCart, title: 'หน้าขาย POS', detail: 'คิดเงินไว ใช้งานง่าย' },
            { icon: QrCode, title: 'QR Ordering', detail: 'ลูกค้าสั่งเองจากโต๊ะ' },
            { icon: ChefHat, title: 'จอครัว Real-time', detail: 'ออเดอร์ไม่ตกหล่น' },
            { icon: Boxes, title: 'สต็อกและรายงาน', detail: 'รู้ต้นทุนและยอดขาย' },
          ].map(({ icon: Icon, title, detail }) => (
            <div key={title} className="group flex items-center gap-4 rounded-2xl border border-emerald-100/90 bg-white px-5 py-4 shadow-[0_14px_35px_-22px_rgba(21,128,61,0.35)] transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_20px_40px_-22px_rgba(21,128,61,0.45)]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <Icon size={21} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">{title}</h3>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center relative z-10">
            <div className="reveal max-w-2xl mx-auto mb-16">
                <h3 className="text-emerald-500 font-bold mb-2 uppercase tracking-wider text-sm">ทำไมต้องเลือกเรา</h3>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">ฟีเจอร์ครบ จบในที่เดียว</h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    {icon: 'fa-bolt', title: 'Setup ไวใน 5 นาที', desc: 'สมัครง่ายและรวดเร็ว สมัครปุ๊บ ได้บัญชีร้านค้าของตัวเองพร้อมใช้งานทันที ไม่ต้องรอนาน', color: 'text-emerald-500', bg: 'group-hover:bg-emerald-500', shadow: 'hover:shadow-emerald-100/50'},
                    {icon: 'fa-money-bill-trend-up', title: 'เพิ่มประสิทธิภาพหน้าร้าน', desc: 'รูปภาพเมนูสวยงามและระบบที่เป็นระเบียบ ช่วยลดความผิดพลาดในการขายและรับออเดอร์', color: 'text-emerald-600', bg: 'group-hover:bg-emerald-600', shadow: 'hover:shadow-emerald-100/50'},
                    {icon: 'fa-chart-pie', title: 'ข้อมูลเชิงลึก', desc: 'Dashboard สรุปยอดขาย เมนูขายดี และช่วงเวลาลูกค้าเข้าร้าน ช่วยวางแผนการขายได้อย่างแม่นยำ', color: 'text-green-500', bg: 'group-hover:bg-green-500', shadow: 'hover:shadow-green-100/50'}
                ].map((item, idx) => (
                    <div key={idx} className={`spotlight-card relative p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-2xl ${item.shadow} transition-all duration-500 hover:-translate-y-2 reveal group text-left overflow-hidden ${idx === 1 ? 'delay-100' : idx === 2 ? 'delay-200' : ''}`}>
                        <div className="relative z-10">
                            <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm ${item.bg} group-hover:text-white transition-all duration-300 border border-slate-100 group-hover:scale-110 group-hover:rotate-6`}>
                                <i className={`fa-solid ${item.icon} ${item.color} group-hover:text-white`}></i>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>
      
      {/* 3. How It Works */}
      <section id="howitworks" className="py-24 bg-emerald-50/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white to-transparent opacity-60 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-20 reveal">
                <h3 className="text-emerald-500 font-bold mb-2 uppercase tracking-wider text-sm">Easy Step</h3>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">ใช้งานง่าย...จนคุณตกใจ</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-12 relative">
                <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-slate-200 border-t-2 border-dashed border-slate-300 -z-10"></div>
                {[
                    {icon: 'fa-user-plus', title: 'สมัครสมาชิก', desc: 'กรอกข้อมูลสั้นๆ เพื่อสร้างบัญชีและระบบร้านค้าส่วนตัวฟรีทันที'},
                    {icon: 'fa-barcode', title: 'ลงทะเบียนสินค้า', desc: 'เพิ่มเมนูอาหารหรือสินค้า และเริ่มสแกนบาร์โค้ดผ่านมือถือหรือคอมพิวเตอร์'},
                    {icon: 'fa-circle-check', title: 'คิดเงินหน้าร้าน', desc: 'แคชเชียร์คิดเงินหน้าร้านได้อย่างรวดเร็ว พิมพ์ใบเสร็จ หรือแสดง PromptPay ได้ทันที'}
                ].map((step, idx) => (
                    <div key={idx} className={`relative reveal group flex flex-col items-center ${idx === 1 ? 'delay-100' : idx === 2 ? 'delay-200' : ''}`}>
                        <div className="w-20 h-20 bg-white border-4 border-white shadow-xl shadow-emerald-100 rounded-full flex items-center justify-center text-3xl text-emerald-500 mb-8 z-10 relative group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <i className={`fa-solid ${step.icon}`}></i>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full text-white text-base font-bold flex items-center justify-center border-2 border-white">{idx + 1}</div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-800">{step.title}</h3>
                        <p className="text-slate-500 text-center max-w-xs">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 4. Business Solutions Hub (โชว์ลิงก์โซลูชันสำหรับแต่ละธุรกิจ ช่วยเรื่อง SEO และ Internal Linking) */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 reveal">
            <h3 className="text-emerald-500 font-bold mb-2 uppercase tracking-wider text-sm">Our Solutions</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">โซลูชันที่ออกแบบมาเพื่อร้านค้าของคุณ</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto rounded-full mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "ระบบ POS ร้านค้าปลีก & โชห่วย",
                desc: "ช่วยคิดเงินหน้าร้าน จัดการสต๊อกสินค้า ค้นหาด้วยบาร์โค้ด และสรุปยอดขายสำหรับร้านมินิมาร์ทและร้านค้าทั่วไป",
                link: "/pos-retail",
                icon: "fa-store"
              },
              {
                title: "โปรแกรมร้านกาแฟ & คาเฟ่",
                desc: "จัดการสต๊อกวัตถุดิบและตัดสต๊อกตามสูตรเครื่องดื่ม (Recipe) ทันทีหลังขาย เหมาะสำหรับร้านคาเฟ่และเบเกอรี่",
                link: "/pos-cafe",
                icon: "fa-mug-saucer"
              },
              {
                title: "ระบบจัดการร้านอาหาร & ชาบู",
                desc: "บริหารจัดการโต๊ะ รับออเดอร์ทางแท็บเล็ต ส่งออเดอร์เข้าครัวผ่านหน้าจอ KDS และพิมพ์บิลแยกแผนก",
                link: "/pos-restaurant",
                icon: "fa-utensils"
              },
              {
                title: "ระบบสแกนสั่งอาหารผ่าน QR Code",
                desc: "ให้ลูกค้าสแกนสั่งอาหารจากโต๊ะด้วยมือถือตัวเอง ออเดอร์ส่งเข้าครัวและ POS ทันที ลดข้อผิดพลาดของพนักงาน",
                link: "/qr-ordering",
                icon: "fa-qrcode"
              },
              {
                title: "ระบบจัดการสต๊อกสินค้า & บาร์โค้ด",
                desc: "ควบคุมสต๊อกสินค้าและวัตถุดิบอย่างเป็นระบบ ตรวจสอบยอดคงเหลือแบบเรียลไทม์ และระบบตัดสต๊อกอัตโนมัติ",
                link: "/stock-barcode",
                icon: "fa-boxes-stacked"
              },
              {
                title: "ระบบ POS ออนไลน์ & ออฟไลน์",
                desc: "ระบบจัดเก็บข้อมูลบน Cloud POS ปลอดภัย เช็คยอดขายได้ทุกที่ พร้อมระบบขายออฟไลน์ชั่วคราวหน้าร้าน",
                link: "/online-offline-pos",
                icon: "fa-cloud"
              },
              {
                title: "FoodScan เปลี่ยนชื่อเป็น SuparPOS",
                desc: "ข้อมูลสำหรับลูกค้าเดิมของ FoodScan และรายละเอียดการเปลี่ยนชื่อแบรนด์เป็น SuparPOS",
                link: "/foodscan",
                icon: "fa-circle-info"
              }
            ].map((sol, index) => (
              <div key={index} className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 bg-white text-emerald-500 rounded-xl border border-slate-100 flex items-center justify-center text-xl mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <i className={`fa-solid ${sol.icon}`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors">{sol.title}</h3>
                  <p className="text-slate-500 leading-relaxed mb-6">{sol.desc}</p>
                </div>
                <Link href={sol.link} className="text-emerald-600 font-bold flex items-center gap-2 hover:gap-3 transition-all mt-auto text-sm">
                  ดูรายละเอียดโซลูชัน <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ Section (ข้อความตรงกับ FAQ JSON-LD Schema 100%) */}
      <section className="py-24 bg-slate-50/50 border-y border-slate-100 relative">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <h3 className="text-emerald-500 font-bold mb-2 uppercase tracking-wider text-sm">FAQ</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">คำถามที่พบบ่อยสำหรับเจ้าของร้าน</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto rounded-full mt-4"></div>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "ระบบ POS ของ SuparPOS รองรับธุรกิจประเภทใดบ้าง?",
                a: "SuparPOS รองรับทั้งร้านค้าปลีก ร้านโชห่วย ร้านมินิมาร์ท ร้านของชำ คาเฟ่ ร้านกาแฟ เบเกอรี่ และร้านอาหารทั่วไป โดยมีฟังก์ชันจัดการสต๊อกสินค้า คิดเงิน และสแกนสั่งอาหารอย่างครบครัน"
              },
              {
                q: "มีค่าบริการรายเดือนหรือไม่?",
                a: "มีแผนฟรีสำหรับการเริ่มต้นใช้งาน และแพ็กเกจระดับโปรเริ่มต้นที่ 250 บาทต่อเดือน สำหรับร้านที่ต้องการออเดอร์และหน้าเว็บไม่จำกัด"
              },
              {
                q: "รองรับการพิมพ์ใบเสร็จและบาร์โค้ดอย่างไร?",
                a: "ระบบรองรับเครื่องพิมพ์ผ่านการเชื่อมต่อ Bluetooth, Wi-Fi/LAN และเครื่องพิมพ์ผ่านเว็บสำหรับระบบปฏิบัติการ Windows, iOS และ Android รวมถึงรองรับเครื่องสแกนบาร์โค้ดทั่วไป"
              },
              {
                q: "หากไม่มีการเชื่อมต่ออินเทอร์เน็ต สามารถใช้งานระบบได้หรือไม่?",
                a: "ระบบ POS ของเราออกแบบมารองรับการบันทึกยอดขายแบบออฟไลน์ชั่วคราวหน้าร้าน และจะทำการซิงก์ข้อมูลธุรกรรมทั้งหมดกลับขึ้นระบบคลาวด์โดยอัตโนมัติเมื่ออินเทอร์เน็ตพร้อมใช้งาน"
              }
            ].map((faq, idx) => (
              <details key={idx} className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm hover:border-emerald-300 transition-colors group" open={idx === 0}>
                <summary className="text-lg font-bold text-slate-800 cursor-pointer flex justify-between items-center list-none select-none">
                  <span>{faq.q}</span>
                  <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                    <i className="fa-solid fa-chevron-down group-open:rotate-180 transition-transform"></i>
                  </span>
                </summary>
                <div className="mt-4 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Registration */}
      <section id="register" className="py-32 relative bg-white overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-emerald-100 rounded-full blur-[120px] opacity-40 -translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-lime-100 rounded-full blur-[120px] opacity-45 translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="reveal text-center mb-16">
                <h3 className="text-emerald-500 font-bold mb-3 uppercase tracking-[0.2em] text-sm">Get Started</h3>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                    สมัครง่าย<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-lime-500">เข้าใช้งานได้ทันที</span>
                </h2>
                <p className="mt-6 text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                    หากสมัครเสร็จ ให้ทำการเพิ่มข้อมูลร้านเพื่อใช้งานระบบแบบมีประสิทธิภาพ
                </p>
            </div>

            <div className="reveal delay-100 grid md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-5 space-y-4">
                    {[
                        {icon: 'fa-bolt-lightning', color: 'text-green-500', bg: 'bg-green-50', title: 'Zero Setup', desc: 'ระบบถูกตั้งค่าไว้ให้พร้อมใช้งาน เพียงสมัครจะได้ร้านของตัวเองทันที'},
                        {icon: 'fa-mobile-screen-button', color: 'text-emerald-600', bg: 'bg-emerald-50', title: 'Real Dashboard', desc: 'จัดการเมนู ดูออเดอร์ และสรุปยอดขายได้แบบ Real-time'},
                        {icon: 'fa-wand-magic-sparkles', color: 'text-lime-600', bg: 'bg-lime-50', title: 'Full Features', desc: 'ลองใช้ระบบหลังบ้าน (Backstore) เพื่อเริ่มใช้งานฟีเจอร์พื้นฐานตามแพ็กเกจ Starter'}
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.color} flex-shrink-0`}>
                                <i className={`fa-solid ${item.icon} text-xl`}></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">{item.title}</h4>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="md:col-span-7">
                    <div className="cta-box p-8 md:p-12 rounded-[2.5rem] text-center relative overflow-hidden shadow-2xl shadow-emerald-500/10 group bg-white border border-emerald-50">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-lime-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative z-10">
                            <div className="mb-8 flex justify-center">
                                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-5xl text-emerald-500 shadow-xl border border-slate-50 animate-float">
                                    <i className="fa-solid fa-rocket"></i>
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">พร้อมลุยแล้วหรือยัง?</h3>
                            <p className="text-slate-500 mb-10">กดปุ่มด้านล่างเพื่อทดลองใช้งานระบบได้ทันที</p>

                            <Link 
                                href={user ? "https://app.suparpos.com" : "https://app.suparpos.com"}
                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-black py-6 rounded-2xl text-2xl shadow-2xl shadow-emerald-500/40 transform transition-all hover:scale-[1.03] active:scale-95 duration-200 flex items-center justify-center gap-4 relative overflow-hidden group/btn">
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:animate-shine"></span>
                                {user ? 'ไปที่แดชบอร์ด' : 'สมัครใช้งานฟรี'}
                                <i className="fa-solid fa-chevron-right text-lg group-hover/btn:translate-x-2 transition-transform"></i>
                            </Link>
                            
                            <div className="mt-6 flex items-center justify-center gap-6">
                                <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <i className="fa-solid fa-shield-check text-green-500"></i> No Credit Card
                                </span>
                                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <i className="fa-solid fa-bolt text-emerald-500"></i> Instant Set Up
                                </span>
                            </div>

                            {/* ดาวน์โหลดแอปพลิเคชันท้ายหน้า */}
                            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    หรือดาวน์โหลดแอปพลิเคชันไปติดตั้งใช้งาน
                                </p>
                                <div className="flex flex-wrap justify-center items-center gap-3">
                                    <a 
                                        href="https://play.google.com/store/apps/details?id=com.pos.foodscan"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex items-center gap-2.5 px-4.5 py-2.5 bg-white hover:bg-emerald-50/50 text-slate-800 rounded-2xl text-xs font-bold shadow-sm hover:shadow-md border border-slate-200 hover:border-emerald-500 transition-all hover:-translate-y-0.5 active:scale-95"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1 9.3-9.3v-.2L3.7 2.2l-.1.1z"/>
                                            <path fill="#FBBC04" d="M16.1 14.8l-3.1-3.1v-.2l3.1-3.1.1.1 3.7 2.1c1 .6 1 1.5 0 2.1l-3.8 2.2z"/>
                                            <path fill="#EA4335" d="M16.2 14.7L13 11.5 3.6 20.9c.4.4.9.4 1.6 0l11-6.2z"/>
                                            <path fill="#34A853" d="M16.2 8.3L5.2 2.1C4.5 1.7 4 1.7 3.6 2.1L13 11.5l3.2-3.2z"/>
                                        </svg>
                                        <span className="group-hover:text-emerald-600 transition-colors">Google Play (Android)</span>
                                    </a>
                                    <a 
                                        href="https://img.pos-foodscan.com/downloads/SuparPOS-Setup.exe"
                                        download="SuparPOS-Setup.exe"
                                        className="group inline-flex items-center gap-2.5 px-4.5 py-2.5 bg-white hover:bg-sky-50/50 text-slate-800 rounded-2xl text-xs font-bold shadow-sm hover:shadow-md border border-slate-200 hover:border-sky-500 transition-all hover:-translate-y-0.5 active:scale-95"
                                    >
                                        <svg className="w-4 h-4 fill-current text-[#0078D4]" viewBox="0 0 24 24">
                                            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.606L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.901-1.8" />
                                        </svg>
                                        <span className="group-hover:text-sky-600 transition-colors">Windows (.exe)</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Shared Footer */}
      <Footer />

    </div>
  );
}
