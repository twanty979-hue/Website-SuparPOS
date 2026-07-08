'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ✅ Component โลโก้ (ดึงไฟล์รูปจาก public/icon.png)
const LogoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <img 
    src="/icon.png" 
    alt="SuparPOS Icon" 
    className={`object-contain ${className}`}
  />
);

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Logic การทำงานของ Navbar (เปลี่ยนสีเมื่อ Scroll)
  useEffect(() => {
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-sans text-gray-800 bg-white antialiased overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* ✅ Navbar (จะติดไปทุกหน้า) */}
      <nav id="navbar" className="fixed w-full z-50 transition-all duration-500 py-4 px-6 lg:px-12 bg-white/0 backdrop-blur-[0px] text-slate-700 border-b border-transparent">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group relative">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-all duration-300 overflow-hidden border border-emerald-100">
                    <LogoIcon className="w-full h-full p-1" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tight text-slate-800 leading-none group-hover:text-emerald-600 transition-colors">
                        Supar<span className="text-emerald-500">POS</span>
                    </span>
                </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 items-center">
                {[
                    { name: 'หน้าแรก', path: '/' },
                    { name: 'จุดเด่น', path: '/features' },
                    { name: 'ราคา', path: '/pricing' },
                    { name: 'วิธีใช้งาน', path: '/manual' }
                ].map((menu) => (
                    <Link key={menu.path} href={menu.path} className={`transition-colors font-medium relative group ${pathname === menu.path ? 'text-emerald-600' : 'hover:text-emerald-500'}`}>
                        {menu.name}
                        <span className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-500 transition-all duration-300 ${pathname === menu.path ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </Link>
                ))}
                
                <Link href="https://app.suparpos.com" className="relative px-6 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-full transition-all shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-1 overflow-hidden group">
                    <span className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-shine"></span>
                    <span className="relative z-10">เข้าสู่ระบบ</span>
                </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')} className="md:hidden text-2xl focus:outline-none hover:text-emerald-500 transition-colors">
                <i className="fa-solid fa-bars"></i>
            </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div id="mobile-menu" className="hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md text-gray-800 shadow-2xl md:hidden flex flex-col items-center py-6 gap-6 mt-0 border-t border-gray-100 transition-all duration-300">
            <Link href="/" className="text-lg font-medium hover:text-emerald-600">หน้าแรก</Link>
            <Link href="/features" className="text-lg font-medium hover:text-emerald-600">จุดเด่น</Link>
            <Link href="/pricing" className="text-lg font-medium hover:text-emerald-600">ราคา</Link>
            <Link href="/manual" className="text-lg font-medium hover:text-emerald-600">วิธีใช้งาน</Link>
            <Link href="https://app.suparpos.com" className="text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-2 rounded-full font-bold shadow-lg shadow-emerald-500/30">สมัครใช้งานฟรี</Link>
        </div>
      </nav>

      {/* ✅ พื้นที่แสดงเนื้อหาของแต่ละหน้า */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* ✅ Footer ฉบับสมบูรณ์ (มี Social + Payment Icons ครบ) */}
      <footer className="bg-slate-50 text-slate-500 py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
            
            {/* Column 1: Logo & Address */}
            <div className="lg:col-span-5 space-y-6">
                <Link href="/" className="flex items-center gap-2 group relative">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-all duration-300 overflow-hidden border border-emerald-100">
                        <LogoIcon className="w-full h-full p-1" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tight text-slate-800 leading-none">
                            Supar<span className="text-emerald-500">POS</span>
                        </span>
                    </div>
                </Link>
                
                <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                    <p className="font-bold text-slate-800">
                        SuparPOS System <span className="font-normal text-slate-500">(ดำเนินการโดย นาย วรธน นำทอง)</span>
                    </p>
                    <p>
                        บ้านเลขที่78หมู่ 4 ต.นาเยีย อ.นาเยีย<br/>
                         จังหวัด อุบลราชธานี รหัสไปรษณีย์ 34160
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">โทร:</span> 
                        <a href="tel:0997547764" className="text-emerald-600 hover:underline font-medium">099-754-7764</a>
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">อีเมล:</span>
                        <a href="mailto:posfoodscan@gmail.com" className="text-emerald-600 hover:underline font-medium">posfoodscan@gmail.com</a>
                    </p>
                </div>
            </div>

            {/* Column 2: Services */}
            <div className="lg:col-span-2">
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">บริการของเรา</h4>
                <div className="flex flex-col gap-3 text-sm font-medium">
                    <Link href="/" className="hover:text-emerald-500 transition-colors">หน้าแรก</Link>
                    <Link href="/pricing" className="hover:text-emerald-500 transition-colors">แพ็กเกจราคา</Link>
                    <Link href="/manual" className="hover:text-emerald-500 transition-colors">คู่มือการใช้งาน</Link>
                </div>
            </div>

            {/* Column 3: Policy */}
            <div className="lg:col-span-2">
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">นโยบาย</h4>
                <div className="flex flex-col gap-3 text-sm font-medium">
                    <Link href="/terms" className="hover:text-emerald-500 transition-colors">เงื่อนไขการบริการ</Link>
                    <Link href="/privacy" className="hover:text-emerald-500 transition-colors">ความเป็นส่วนตัว</Link>
                    <Link href="/refund" className="hover:text-emerald-500 transition-colors">นโยบายการคืนเงิน</Link>
                </div>
            </div>

            {/* Column 4: Social & Payment (ใส่ครบแล้วครับ) */}
            <div className="lg:col-span-3 flex flex-col items-start lg:items-end gap-8">
                
                {/* Social Icons */}
                <div className="flex gap-4 text-2xl text-slate-400">
                    <a href="#" target="_blank" className="hover:text-[#00B900] transition-transform hover:scale-110"><i className="fa-brands fa-line"></i></a>
                    <a href="#" target="_blank" className="hover:text-[#1877F2] transition-transform hover:scale-110"><i className="fa-brands fa-facebook"></i></a>
                    <a href="#" target="_blank" className="hover:text-[#E4405F] transition-transform hover:scale-110"><i className="fa-brands fa-instagram"></i></a>
                </div>

                {/* Payment Methods */}
                <div className="flex flex-col items-start lg:items-end gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ช่องทางการชำระเงิน</span>
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <i className="fa-brands fa-cc-visa text-3xl text-[#1A1F71]" title="Visa"></i>
                        <i className="fa-brands fa-cc-mastercard text-3xl text-[#EB001B]" title="Mastercard"></i>
                        <i className="fa-brands fa-cc-jcb text-3xl text-[#007940]" title="JCB"></i>
                        <div className="w-px h-6 bg-slate-300 mx-2"></div>
                        <img 
                            src="https://cdn.prod.website-files.com/65e210a414fae2cb8054a9b4/6789cc7973863d34426baf54_678316f2a65ae45dd6a22f9f_678303b39e0a1b2f05c23bc4_673ac03613ce1d036f897c16_thaiqr_logosimbolo.png" 
                            alt="Thai QR" 
                            className="h-7 w-auto object-contain"
                        />
                    </div>
                </div>
            </div>

          </div>

          {/* Copyright */}
          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} SuparPOS. All rights reserved.</p>
            <p className="text-sm text-slate-400 flex items-center gap-1">
                Made with <i className="fa-solid fa-heart text-rose-500 text-xs"></i> in Thailand
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
}