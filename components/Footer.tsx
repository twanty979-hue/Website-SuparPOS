import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 px-6 lg:px-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <img src="/icon.png" alt="SuparPOS" className="w-8 h-8 object-contain" />
            <span className="text-xl font-black text-white">
              Supar<span className="text-emerald-500">POS</span>
            </span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed mb-6 font-light">
            ระบบ POS จัดการร้านค้าและร้านอาหารยุคใหม่ คิดเงินไว สแกนสั่งจากโต๊ะ และทำงานออฟไลน์ได้ 100%
          </p>
          <div className="flex items-center gap-3">
            <a 
              href="https://play.google.com/store/apps/details?id=com.pos.foodscan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
            >
              <i className="fa-brands fa-google-play text-emerald-400"></i>
              Google Play
            </a>
            <a 
              href="https://img.pos-foodscan.com/downloads/SuparPOS-Setup.exe" 
              download="SuparPOS-Setup.exe"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
            >
              <i className="fa-brands fa-windows text-sky-400"></i>
              Windows (.exe)
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">เมนูหลัก</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/" className="hover:text-emerald-400 transition-colors">หน้าแรก</Link></li>
            <li><Link href="/features" className="hover:text-emerald-400 transition-colors">จุดเด่นของระบบ</Link></li>
            <li><Link href="/pricing" className="hover:text-emerald-400 transition-colors">ราคาแพ็กเกจ</Link></li>
            <li><Link href="/manual" className="hover:text-emerald-400 transition-colors">วิธีใช้งาน</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">ดาวน์โหลด & ติดตั้ง</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/download" className="hover:text-emerald-400 transition-colors">ดาวน์โหลดแอป</Link></li>
            <li><Link href="/setup-printer" className="hover:text-emerald-400 transition-colors">ตั้งค่าเครื่องพิมพ์บิล (Win)</Link></li>
            <li><a href="https://play.google.com/store/apps/details?id=com.pos.foodscan" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">Play Store (Android)</a></li>
            <li><a href="https://img.pos-foodscan.com/downloads/SuparPOS-Setup.exe" download="SuparPOS-Setup.exe" className="hover:text-emerald-400 transition-colors">Windows PC Installer</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">เข้าสู่ระบบ</h4>
          <ul className="space-y-2.5 text-sm mb-6">
            <li><a href="https://app.suparpos.com" className="hover:text-emerald-400 transition-colors">เข้าสู่ระบบ POS</a></li>
            <li><a href="https://app.suparpos.com" className="hover:text-emerald-400 transition-colors">สมัครสมาชิกใหม่</a></li>
          </ul>
          <p className="text-xs text-slate-500 leading-relaxed">
            พร้อมให้คำปรึกษาและสนับสนุนตลอดการใช้งาน
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} SuparPOS. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/manual" className="hover:text-slate-400 transition-colors">คู่มือการใช้งาน</Link>
          <Link href="/pricing" className="hover:text-slate-400 transition-colors">ราคา</Link>
          <Link href="/setup-printer" className="hover:text-slate-400 transition-colors">ตั้งค่าเครื่องพิมพ์</Link>
        </div>
      </div>
    </footer>
  );
}
