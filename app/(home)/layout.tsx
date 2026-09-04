'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

// ✅ Component โลโก้ (ดึงไฟล์รูปจาก public/icon.png)
const LogoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <img 
    src="/icon.png" 
    alt="SuparPOS Icon" 
    className={`object-contain ${className}`}
  />
);

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans text-gray-800 bg-white antialiased overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* ✅ Navbar กลางของระบบ (แสดงผลเหมือนกันทุกหน้า) */}
      <Navbar />

      {/* ✅ พื้นที่แสดงเนื้อหาของแต่ละหน้า */}
      <main className="min-h-screen pt-16">
        {children}
      </main>

      {/* ✅ Footer ฉบับสมบูรณ์ (มี Social + Payment Icons ครบ) */}
      <footer className="bg-slate-50 text-slate-500 py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
            
            {/* Column 1: Logo & Address */}
            <div className="lg:col-span-4 space-y-6">
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
                        บ้านเลขที่ 78 หมู่ 4 ต.นาเยีย อ.นาเยีย<br/>
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

            {/* Column 2: Solutions */}
            <div className="lg:col-span-3">
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">โซลูชันสำหรับธุรกิจ</h4>
                <div className="flex flex-col gap-3 text-sm font-medium">
                    <Link href="/pos-retail" className="hover:text-emerald-500 transition-colors">POS ร้านค้าปลีก & โชห่วย</Link>
                    <Link href="/pos-cafe" className="hover:text-emerald-500 transition-colors">โปรแกรมร้านกาแฟ & คาเฟ่</Link>
                    <Link href="/pos-restaurant" className="hover:text-emerald-500 transition-colors">ระบบจัดการร้านอาหาร & ชาบู</Link>
                    <Link href="/qr-ordering" className="hover:text-emerald-500 transition-colors">สแกนสั่งอาหารผ่าน QR Code</Link>
                    <Link href="/stock-barcode" className="hover:text-emerald-500 transition-colors">ระบบจัดการสต๊อก & บาร์โค้ด</Link>
                    <Link href="/online-offline-pos" className="hover:text-emerald-500 transition-colors">ระบบ POS ออนไลน์ & คลาวด์</Link>
                </div>
            </div>

            {/* Column 3: Services */}
            <div className="lg:col-span-2">
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">บริการของเรา</h4>
                <div className="flex flex-col gap-3 text-sm font-medium">
                    <Link href="/" className="hover:text-emerald-500 transition-colors">หน้าแรก</Link>
                    <Link href="/pricing" className="hover:text-emerald-500 transition-colors">แพ็กเกจราคา</Link>
                    <Link href="/manual" className="hover:text-emerald-500 transition-colors">คู่มือการใช้งาน</Link>
                    <Link href="/foodscan" className="hover:text-emerald-500 transition-colors">เกี่ยวกับ FoodScan</Link>
                </div>
            </div>

            {/* Column 4: Policy */}
            <div className="lg:col-span-1">
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">นโยบาย</h4>
                <div className="flex flex-col gap-3 text-sm font-medium">
                    <Link href="/terms" className="hover:text-emerald-500 transition-colors">เงื่อนไข</Link>
                    <Link href="/privacy" className="hover:text-emerald-500 transition-colors">ความเป็นส่วนตัว</Link>
                    <Link href="/refund" className="hover:text-emerald-500 transition-colors">คืนเงิน</Link>
                </div>
            </div>

            {/* Column 5: Social & Payment */}
            <div className="lg:col-span-2 flex flex-col items-start lg:items-end gap-8">
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