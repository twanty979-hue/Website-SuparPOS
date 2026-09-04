'use client';
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Monitor, Smartphone, CheckCircle, ShieldCheck } from 'lucide-react';

export default function DownloadPage() {
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.pos.foodscan';
  const windowsDownloadUrl = 'https://img.pos-foodscan.com/downloads/SuparPOS-Setup.exe';

  return (
    <div className="bg-[#F4FBF4] text-slate-800 font-sans antialiased">

      {/* Header */}
      <section className="pt-16 pb-16 px-6 lg:px-12 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-5 shadow-sm">
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            ดาวน์โหลดแอปพลิเคชัน SuparPOS ฟรี
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-5">
            ดาวน์โหลด SuparPOS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              สำหรับทุกอุปกรณ์ของคุณ
            </span>
          </h1>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            เปลี่ยนสมาร์ตโฟน แท็บเล็ต หรือคอมพิวเตอร์ของคุณให้เป็นเครื่องคิดเงิน POS มืออาชีพ รองรับทั้งระบบ Android และ Windows PC
          </p>
        </div>
      </section>

      {/* 2 Big Platform Cards */}
      <section className="pb-24 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* 🟢 Android (Google Play) */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-emerald-100 shadow-xl shadow-emerald-500/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-100 flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1 9.3-9.3v-.2L3.7 2.2l-.1.1z"/>
                    <path fill="#FBBC04" d="M16.1 14.8l-3.1-3.1v-.2l3.1-3.1.1.1 3.7 2.1c1 .6 1 1.5 0 2.1l-3.8 2.2z"/>
                    <path fill="#EA4335" d="M16.2 14.7L13 11.5 3.6 20.9c.4.4.9.4 1.6 0l11-6.2z"/>
                    <path fill="#34A853" d="M16.2 8.3L5.2 2.1C4.5 1.7 4 1.7 3.6 2.1L13 11.5l3.2-3.2z"/>
                  </svg>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Android • ติดตั้งฟรี
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-emerald-600" />
                Google Play Store
              </h3>
              <p className="text-sm text-slate-500 font-light mb-6">
                สำหรับมือถือและแท็บเล็ต Android ทุกยี่ห้อ (Samsung, Xiaomi, Vivo, OPPO, ขาตั้ง POS Android)
              </p>

              {/* QR Code */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center mb-6 text-center">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 mb-3">
                  <QRCodeSVG value={playStoreUrl} size={150} level="M" />
                </div>
                <p className="text-xs font-bold text-slate-700">สแกนด้วยกล้องมือถือ</p>
                <p className="text-[11px] text-slate-400">เพื่อเปิดหน้าดาวน์โหลดบน Google Play ทันที</p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>รองรับ Android 8.0 ขึ้นไป</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>เวอร์ชัน 1.0.6 (อัปเดตล่าสุด)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>พิมพ์บิลผ่านบลูทูธและ Wi-Fi ได้ทันที</span>
                </div>
              </div>
            </div>

            <a
              href={playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 shadow-md group"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1 9.3-9.3v-.2L3.7 2.2l-.1.1z"/>
                <path fill="#FBBC04" d="M16.1 14.8l-3.1-3.1v-.2l3.1-3.1.1.1 3.7 2.1c1 .6 1 1.5 0 2.1l-3.8 2.2z"/>
                <path fill="#EA4335" d="M16.2 14.7L13 11.5 3.6 20.9c.4.4.9.4 1.6 0l11-6.2z"/>
                <path fill="#34A853" d="M16.2 8.3L5.2 2.1C4.5 1.7 4 1.7 3.6 2.1L13 11.5l3.2-3.2z"/>
              </svg>
              <span>ดาวน์โหลดบน Google Play</span>
            </a>
          </div>

          {/* 🔵 Windows Desktop (.exe) */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-sky-100 shadow-xl shadow-sky-500/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 border border-sky-100 flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8 fill-current text-[#0078D4]" viewBox="0 0 24 24">
                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.606L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.901-1.8" />
                  </svg>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  Windows PC • ติดตั้งง่าย
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                <Monitor className="w-6 h-6 text-sky-600" />
                Windows Desktop (.exe)
              </h3>
              <p className="text-sm text-slate-500 font-light mb-6">
                สำหรับคอมพิวเตอร์ตั้งโต๊ะ โน้ตบุ๊ก หรือเครื่อง POS ทัชสกรีนระบบ Windows ทุกรุ่น
              </p>

              {/* Highlights Box */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 mb-6">
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="text-slate-400">ชื่อไฟล์:</span>
                  <span className="font-mono font-bold">SuparPOS-Setup.exe</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="text-slate-400">ขนาดไฟล์:</span>
                  <span className="font-bold">83.6 MB</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="text-slate-400">ความต้องการระบบ:</span>
                  <span className="font-bold">Windows 10 / 11 (64-bit)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="text-slate-400">การพิมพ์:</span>
                  <span className="font-bold text-emerald-600">Silent Print USB, LAN, BT</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-sky-500" />
                  <span>มีระบบแจ้งเตือนเสียงออเดอร์เข้าทะลุลำโพง แม้พับหน้าจอ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-sky-500" />
                  <span>เตะเปิดลิ้นชักเก็บเงินอัตโนมัติเมื่อคิดเงินเสร็จ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-sky-500" />
                  <span>รองรับโหมดเต็มหน้าจอ Kiosk Mode (F11)</span>
                </div>
              </div>
            </div>

            <a
              href={windowsDownloadUrl}
              download="SuparPOS-Setup.exe"
              className="w-full py-4 bg-[#0078D4] hover:bg-[#006cc0] text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 shadow-md shadow-sky-600/30"
            >
              <Download className="w-5 h-5" />
              <span>ดาวน์โหลด SuparPOS สำหรับ Windows (.exe)</span>
            </a>
          </div>

        </div>
      </section>

      {/* 3 Steps Installation */}
      <section className="py-20 px-6 lg:px-12 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
            ติดตั้งง่ายใน 3 ขั้นตอน
          </h2>
          <p className="text-slate-500 text-sm mb-12">ไม่จำเป็นต้องมีความรู้เรื่องคอมพิวเตอร์ ก็ติดตั้งพร้อมใช้งานได้เอง</p>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-3xl font-black text-emerald-600 mb-2 block">1</span>
              <h4 className="font-bold text-slate-900 mb-1">ดาวน์โหลดตัวติดตั้ง</h4>
              <p className="text-xs text-slate-500 leading-relaxed">กดปุ่มดาวน์โหลดไฟล์ .exe ด้านบน หรือติดตั้งผ่าน Play Store บนมือถือ</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-3xl font-black text-emerald-600 mb-2 block">2</span>
              <h4 className="font-bold text-slate-900 mb-1">เปิดไฟล์และกดติดตั้ง</h4>
              <p className="text-xs text-slate-500 leading-relaxed">ดับเบิลคลิกไฟล์ตัวติดตั้ง ระบบจะติดตั้งโปรแกรมลงในคอมพิวเตอร์ให้อัตโนมัติ</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-3xl font-black text-emerald-600 mb-2 block">3</span>
              <h4 className="font-bold text-slate-900 mb-1">เข้าสู่ระบบและเริ่มขาย</h4>
              <p className="text-xs text-slate-500 leading-relaxed">เปิดไอคอน SuparPOS บนเดสก์ท็อป เข้าสู่ระบบ แล้วเปิดขายได้ทันที</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
