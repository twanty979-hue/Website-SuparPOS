import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-100">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand col-span-2 */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md border border-emerald-100 group-hover:scale-105 transition-all overflow-hidden">
                <img src="/icon.png" alt="POS Foodscan" className="w-full h-full object-contain p-0.5" />
              </div>
              <span className="text-xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
                POS <span className="text-emerald-500">Foodscan</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-xs">
              ระบบ POS จัดการร้านค้าและร้านอาหารยุคใหม่ คิดเงินไว สแกนสั่งจากโต๊ะ รองรับออฟไลน์ได้ 100% พร้อมธีมร้านสวยงามกว่า 60 แบบ
            </p>
            <ul className="space-y-2 mb-6 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-500 text-xs"></i>
                ใช้งานได้ทั้ง iOS, Android, Windows
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-500 text-xs"></i>
                สแกน QR สั่งอาหาร ลดภาระพนักงาน
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-500 text-xs"></i>
                รายงานยอดขายแบบ Real-time
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-500 text-xs"></i>
                ธีมร้านสวยงาม ฟรีทุกธีมทุกแพ็กเกจ
              </li>
            </ul>
            <div className="flex flex-wrap items-center gap-2">
              <a href="https://apps.apple.com/app/pos-foodscan/id6809176972" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
                <i className="fa-brands fa-apple text-sm"></i> App Store
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.pos.foodscan" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
                <i className="fa-brands fa-google-play text-emerald-400 text-xs"></i> Google Play
              </a>
              <a href="https://img.pos-foodscan.com/downloads/POS-Foodscan-Setup-v2.1.1.exe" download="POS-Foodscan-Setup-v2.1.1.exe"
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
                <i className="fa-brands fa-windows text-sky-400 text-xs"></i> Windows (.exe)
              </a>
            </div>
          </div>

          {/* เมนูหลัก */}
          <div>
            <h4 className="text-slate-800 font-bold text-sm mb-4 tracking-wide">เมนูหลัก</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-slate-500 hover:text-emerald-600 transition-colors">หน้าแรก</Link></li>
              <li><Link href="/features" className="text-slate-500 hover:text-emerald-600 transition-colors">จุดเด่นของระบบ</Link></li>
              <li><Link href="/pricing" className="text-slate-500 hover:text-emerald-600 transition-colors">แพ็กเกจราคา</Link></li>
              <li><Link href="/manual" className="text-slate-500 hover:text-emerald-600 transition-colors">คู่มือการใช้งาน</Link></li>
              <li><Link href="/download" className="text-slate-500 hover:text-emerald-600 transition-colors">ดาวน์โหลดแอป</Link></li>
              <li><Link href="/free" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">ใช้ฟรีตลอด ✨</Link></li>
            </ul>
          </div>

          {/* บริการของเรา */}
          <div>
            <h4 className="text-slate-800 font-bold text-sm mb-4 tracking-wide">บริการของเรา</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/pos-restaurant" className="text-slate-500 hover:text-emerald-600 transition-colors">POS ร้านอาหาร</Link></li>
              <li><Link href="/pos-cafe" className="text-slate-500 hover:text-emerald-600 transition-colors">POS คาเฟ่</Link></li>
              <li><Link href="/pos-retail" className="text-slate-500 hover:text-emerald-600 transition-colors">POS ร้านค้าปลีก</Link></li>
              <li><Link href="/qr-ordering" className="text-slate-500 hover:text-emerald-600 transition-colors">QR สั่งอาหาร</Link></li>
            </ul>
          </div>

          {/* นโยบาย + ติดต่อ */}
          <div>
            <h4 className="text-slate-800 font-bold text-sm mb-4 tracking-wide">นโยบาย</h4>
            <ul className="space-y-3 text-sm mb-6">
              <li><Link href="/terms" className="text-slate-500 hover:text-emerald-600 transition-colors">เงื่อนไขการใช้งาน</Link></li>
              <li><Link href="/privacy" className="text-slate-500 hover:text-emerald-600 transition-colors">ความเป็นส่วนตัว</Link></li>
              <li><Link href="/refund" className="text-slate-500 hover:text-emerald-600 transition-colors">นโยบายคืนเงิน</Link></li>
            </ul>
            <div className="flex items-center gap-2.5 mb-5">
              <a href="https://www.facebook.com/profile.php?id=61594240439708" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-100 hover:bg-blue-50 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all border border-slate-200 hover:border-blue-200" title="Facebook">
                <i className="fa-brands fa-facebook text-base"></i>
              </a>
              <a href="https://www.instagram.com/quail.32513715/" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-100 hover:bg-pink-50 rounded-xl flex items-center justify-center text-slate-500 hover:text-pink-500 transition-all border border-slate-200 hover:border-pink-200" title="Instagram">
                <i className="fa-brands fa-instagram text-base"></i>
              </a>
              <a href="https://www.tiktok.com/@suparpos" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all border border-slate-200" title="TikTok">
                <i className="fa-brands fa-tiktok text-base"></i>
              </a>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} POS Foodscan. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <i className="fa-solid fa-heart text-rose-400"></i> in Thailand
          </p>
          <div className="flex gap-5">
            <Link href="/manual" className="hover:text-slate-600 transition-colors">คู่มือการใช้งาน</Link>
            <Link href="/pricing" className="hover:text-slate-600 transition-colors">ราคา</Link>
            <Link href="/free" className="hover:text-slate-600 transition-colors">ใช้ฟรีตลอด</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

