'use client';
import React from 'react';
import Link from 'next/link';
import { Download, Monitor, ShieldAlert, ArrowLeft, CheckCircle2, FileCode } from 'lucide-react';

export default function SetupPrinterPage() {
  const downloadPrinterScript = () => {
    const encodedCmd = 'JAB1AHIAbAAgAD0AIAAnAGgAdAB0AHAAcwA6AC8ALwBhAHAAcAAuAHMAdQBwAGEAcgBwAG8AcwAuAGMAbwBtACcAOwAKACQAYwBoAHIAbwBtAGUAIAA9ACAAJwAnADsACgBpAGYAIAAoAFQAZQBzAHQALQBQAGEAdABoACAAJwBDADoAXABQAHIAbwBnAHIAYQBtACAARgBpAGwAZQBzAFwARwBvAG8AZwBsAGUAXABDAGgAcgBvAG0AZQBcAEEAcABwAGwAaQBjAGEAdABpAG8AbgBcAGMAaAByAG8AbQBlAC4AZQB4AGUAJwApACAAewAgACQAYwBoAHIAbwBtAGUAIAA9ACAAJwBDADoAXABQAHIAbwBnAHIAYQBtACAARgBpAGwAZQBzAFwARwBvAG8AZwBsAGUAXABDAGgAcgBvAG0AZQBcAEEAcABwAGwAaQBjAGEAdABpAG8AbgBcAGMAaAByAG8AbQBlAC4AZQB4AGUAJwAgAH0ACgBlAGwAcwBlAGkAZgAgACgAVABlAHMAdAAtAFAAYQB0AGgAIAAnAEMAOgBcAFAAcgBvAGcAcgBhAG0AIABGAGkAbABlAHMAIAAoAHgAOAA2ACkAXABHAG8AbwBnAGwAZQBcAEMAaAByAG8AbQBlAFwAQQBwAHAAbABpAGMAYQB0AGkAbwBuAFwAYwBoAHIAbwBtAGUALgBlAHgAZQAnACkAIAB7ACAAJABjAGgAcgBvAG0AZQAgAD0AIAAnAEMAOgBcAFAAcgBvAGcAcgBhAG0AIABGAGkAbABlAHMAIAAoAHgAOAA2ACkAXABHAG8AbwBnAGwAZQBcAEMAaAByAG8AbQBlAFwAQQBwAHAAbABpAGMAYQB0AGkAbwBuAFwAYwBoAHIAbwBtAGUALgBlAHgAZQAnACAAfQAKAGUAbABzAGUAaQBmACAAKABUAGUAcwB0AC0AUABhAHQAaAAgACgAJABlAG4AdgA6AEwAbwBjAGEAbABBAHAAcABEAGEAdABhACAAKwAgACcAXABHAG8AbwBnAGwAZQBcAEMAaAByAG8AbQBlAFwAQQBwAHAAbABpAGMAYQB0AGkAbwBuAFwAYwBoAHIAbwBtAGUALgBlAHgAZQAnACkAKQAgAHsAIAAkAGMAaAByAG8AbQBlACAAPQAgACQAZQBuAHYAOgBMAG8AYwBhAGwAQQBwAHAARABhAHQAYQAgACsAIAAnAFwARwBvAG8AZwBsAGUAXABDAGgAcgBvAG0AZQBcAEEAcABwAGwAaQBjAGEAdABpAG8AbgBcAGMAaAByAG8AbQBlAC4AZQB4AGUAJwAgAH0ACgBpAGYAIAAoACQAYwBoAHIAbwBtAGUAIAAtAGUAcQAgACcAJwApACAAewAgAFcAcgBpAHQAZQAtAEgAbwBzAHQAIAAnAEQOIQ5IDh4OGg4gAEcAbwBvAGcAbABlACAAQwBoAHIAbwBtAGUAIAAVDjQOFA4VDjEOSQ4HDi0OIg45DkgOQw4ZDkAOBA4jDjcOSA4tDgcOGQ41DkkOIQAnADsAIABSAGUAYQBkAC0ASABvAHMAdAAgAC0AUAByAG8AbQBwAHQAIAAnAAEOFA4gAEUAbgB0AGUAcgAgAEAOHg43DkgOLQ4tDi0OAQ4nADsAIABlAHgAaQB0ADsAIAB9AAoAJABpAGMAbwBuAEQAaQBy ACAAPQAgACQAZQBuAHYAOgBMAG8AYwBhAGwAQQBwAHAARABhAHQAYQAgACsAIAAnAFwAUwB1AHAAYQByAFAATwBTACcAOwAKAGkAZgAgACgAIQAoAFQAZQBzAHQALQBQAGEAdABoACAAJABpAGMAbwBuAEQAaQByACkAKQAgAHsAIABOAGUAdwAtAEkAdABlAG0AIAAtAEkAdABlAG0AVAB5AHAAZQAgAEQAaQByAGUAYwB0AG8AcgB5ACAALQBQAGEAdABoACAAJABpAGMAbwBuAEQAaQByACAALQBGAG8AcgBjAGUAIAB8ACAATwB1AHQALQBOAHUAbABsADsAIAB9AAoAJABpAGMAbwBuAEkAYwBvACAAPQAgACQAaQBjAG8AbgBEAGkAcgAgACsAIAAnAFwAaQBjAG8AbgAuAGkAYwBvACcAOwAKACQAaQBjAG8AbgBQAG4AZwAgAD0AIAAkAGkAYwBvAG4ARABpAHIAIAArACAAJwBcAGkAYwBvAG4ALgBwAG4AZwAnADsACgAkAGkAYwBvAG4ATwBrACAAPQAgACQAZgBhAGwAcwBlADsACgB0AHIAeQAgAHsACgAgACAASQBuAHYAbwBrAGUALQBXAGUAYgBSAGUAcQB1AGUAcwB0ACAALQBVAHIAaQAgACcAaAB0AHQAcABzADoALwAvAGEAcABwAC4AcwB1AHAAYQByAHAAbwBzAC4AYwBvAG0ALwBpAGMAbwBuAHMALwBJAGMAbwBuAC0AMQA5ADIALgBwAG4AZwAnACAALQBPAHUAdABGAGkAbABlACAAJABpAGMAbwBuAFAAbgBnACAALQBVAHMAZQBCAGEAcwBpAGMAUABhAHIAcwBpAG4AZwAgAC0AVABpAG0AZQBvAHUAdABTAGUAYwAgADEANQA7AAoAIAAgAEEAZABkAC0AVAB5AHAAZQAgAC0AQQBzAHMAZQBtAGIAbAB5AE4AYQBtAGUAIABTAHkAcwB0AGUAbQAuAEQAcgBhAHcAaQBuAGcAOwAKACAAIAAkAHMAaQB6AGUAcwAgAD0AIABAACgAMQA2ACwAIAAzADIALAAgADQAOAAsACAANgA0ACwAIAAxADIAOAApADsACgAgACAAJABiAG0AcAAgAD0AIABbAFMAeQBzAHQAZQBtAC4ARAByAGEAdwBpAG4AZwAuAEIAaQB0AG0AYQBwAF0AOgA6AEYAcgBvAG0ARgBpAGwAZQAoACQAaQBjAG8AbgBQAG4AZwApADsACgAgACAAJABtAHMAIAA9ACAATgBlAHcALQBPAGIAagBlAGMAdAAgAFMAeQBzAHQAZQBtAC4ASQBPAC4ATQBlAG0AbwByAHkAUwB0AHIAZQBhAG0AOwAKACAAIAAkAGIAdwAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBJAE8ALgBCAGkAbgBhAHIAeQBXAHIAaQB0AGUAcgAoACQAbQBzACkAOwAKACAAIAAkAGIAdwAuAFcAcgBpAHQAZQAoAFsAVQBJAG4AdAAxADYAXQAwACkAOwAgACQAYgB3AC4AVwByAGkAdABlACgAWwBVAEkAbgB0ADEANgBdADEAKQA7AAoAIAAgACQAYgB3AC4AVwByAGkAdABlACgAWwBVAEkAbgB0ADEANgBdACQAcwBpAHoAZQBzAC4AQwBvAHUAbgB0ACkAOwAKACAAIAAkAG8AZgBmAHMAZQB0ACAAPQAgADYAIAArACAAKAAkAHMAaQB6AGUAcwAuAEMAbwB1AG4AdAAgACoAIDEANgApADsACgAgACAAJABwAG4AZwBEAGEAdABhAEwAaQBzAHQAIAA9ACAAQAAoACkAOwAKACAAIABmAG8AcgBlAGEAYwBoACAAKAAkAHMAIABpAG4AIAAkAHMAaQB6AGUAcwApACAAewAKACAAIAAgACAAJAByAGUAcwBpAHoAZQBkACAAPQAgAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABTAHkAcwB0AGUAbQAuAEQAcgBhAHcAaQBuAGcALgBCAGkAdABtAGEAcAAoACQAYgBtAHAALAAgACQAcwAsACAAJABzACkAOwAKACAAIAAgACAAJABwAG4AZwBNAHMAIAA9ACAATgBlAHcALQBPAGIAagBlAGMAdAAgAFMAeQBzAHQAZQBtAC4ASQBPAC4ATQBlAG0AbwByAHkAUwB0AHIAZQBhAG0AOwAKACAAIAAgACAAJAByAGUAcwBpAHoAZQBkAC4AUwBhAHYAZQAoACQAcABuAGcATQBzACwAIABbAFMAeQBzAHQAZQBtAC4ARAByAGEAdwBpAG4AZwAuAEkAbQBhAGcAaQBuAGcALgBJAG0AYQBnAGUARgBvAHIAbQBhAHQAXQA6ADoAUABuAGcAKQA7AAoAIAAgACAAIAAkAHAAbgBnAEIAeQB0AGUAcwAgAD0AIAAkAHAAbgBnAE0AcwAuAFQAbwBBAHIAcgBhAHkAKAApADsACgAgACAAIAAgACQAcABuAGcARABhAHQAYQBMAGkAcwB0ACAAKwA9ACAALAAkAHAAbgBnAEIAeQB0AGUAcwA7AAoAIAAgACAAIAAkAHcAIAA9ACAAaQBmACAAKAAkAHMAIAAtAGcAZQAgADIANQA2ACkAIAB7ACAAMAAgAH0AIABlAGwAcwBlACAAewAgACQAcwAgAH0AOwAgACQAaAAgAD0AIAAkAHcAOwAKACAAIAAgACAAJABiAHcALgBXAHIAaQB0AGUAKABbAGIAeQB0AGUAXQAkAHcAKQA7AAoAIAAgACAAJABiAHcALgBXAHIAaQB0AGUAKABbAGIAeQB0AGUAXQAkAGgAKQA7AAoAIAAgACAAJABiAHcALgBXAHIAaQB0AGUAKABbAGIAeQB0AGUAXQAwACkAOwAgACQAYgB3AC4AVwByAGkAdABlACgAWwBiAHkAdABlAF0AMAApADsACgAgACAAIAAgACQAYgB3AC4AVwByAGkAdABlACgAWwBVAEkAbgB0ADEANgBdADEAKQA7AAoAIAAgACAAJABiAHcALgBXAHIAaQB0AGUAKABbAFUASQBuAHQAMQA2AF0AMwAyACkAOwAKACAAIAAgACAAJABiAHcALgBXAHIAaQB0AGUAKABbAFUASQBuAHQAMwAyAF0AJABwAG4AZwBCAHkAdABlAHMALgBMAGUAbgBnAHQAaAApADsAIAAkAGIAdwAuAFcAcgBpAHQAZQAoAFsAVQBJAG4AdAAzADIAXQAkAG8AZgBmAHMAZQB0ACkAOwAKACAAIAAgACAAJABvAGYAZgBzAGUAdAAgACsAPQAgACQAcABuAGcAQgB5AHQAZQBzAC4ATABlAG4AZwB0AGgAOwAgACQAcABuAGcATQBzAC4ARABpAHMAcABvAHMAZQAoACkAOwAgACQAcgBlAHMAaQB6AGUAZAAuAEQAaQBzAHAAbwBzAGUAKAApADsACgAgACAAfQAKACAAIABmAG8AcgBlAGEAYwBoACAAKAAkAGQAIABpAG4AIAAkAHAAbgBnAEQAYQB0AGEATABpAHMAdAApACAAewAgACQAYgB3AC4AVwByAGkAdABlACgAJABkACkAOwAgAH0ACgAgACAAWwBTAHkAcwB0AGUAbQAuAEkATwAuAEYAaQBsAGUAXQA6ADoAVwByAGkAdABlAEEAbABsAEIAeQB0AGUAcwAoACQAaQBjAG8AbgBJAGMAbwAsACAAJABtAHMALgBUAG8AQQByAHIAYQB5ACgAKQApADsACgAgACAAJABiAHcALgBEAGkAcwBwAG8AcwBlACgAKQA7AAoAIAAgACQAbQBzAC4ARABpAHMAcABvAHMAZQAoACkAOwAgACQAYgBtAHAALgBEAGkAcwBwAG8AcwBlACgAKQA7AAoAIAAgACQAaQBjAG8AbgBPAGsAIAA9ACAAJAB0AHIAdQBlADsAKQB9ACAAYwBhAHQAYwBoACAAewAgACQAaQBjAG8AbgBPAGsAIAA9ACAAJABmAGEAbABzAGUAOwAgAH0ACgAkAFcAcwBoAFMAaABlAGwAbAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAALQBDA  QAbwBtAE8AYgBqAGUAYwB0ACAAVwBTAGMAcgBpAHAAdAAuAFMAaABlAGwAbAA7AAoAJABEAGUAcwBrAHQAbwBwAFAAYQB0AGgAIAA9ACAAWwBTAHkAcwB0AGUAbQAuAEUAbgB2AGkAcgBvAG4AbQBlAG4AdABdADoAOgBHAGUAdABGAG8AbABkAGUAcgBQAGEAdABoACgAJwBEAGUAcwBrAHQAbwBwACcAKQA7AAoAJABTAGgAbwByAHQAYwB1AHQAIAA9ACAAJABXAHMAaABTAGgAZQBsAGwALgBDAHIAZQBhAHQAZQBTAGgAbwByAHQAYwB1AHQAKAAkAEQAZQBzAGsAdABvAHAAUABhAHQAaAAgACsAIAAnAFwAUwB1AHAAYQByAFAATwBTACAAUAByAGkAbgB0AGUAcgAuAGwAbgBrACcAKQA7AAoAJABTAGgAbwByAHQAYwB1AHQALgBUAGEAcgBnAGUAdABQAGEAdABoACAAPQAgACQAYwBoAHIAbwBtAGUAOwAKACQAUwBoAG8AcgB0AGMAdQB0AC4AQQByAGcAdQBtAGUAbgB0AHMAIAA9ACAAJwAtAC0AYQBwAHAAPQAnACAAKwAgACQAdQByAGwAIAArACAAJwAgAC0ALQBrAGkAbwBzAGsALQBwAHIAaQBuAHQAaQBuAGcAJwA7AAoAaQBmACAAKAAkAGkAYwBvAG4ATwBrACAALQBhAG4AZAAgACgAVABlAHMAdAAtAFAAYQB0AGgAIAAkAGkAYwBvAG4ASQBjAG8AKQApACAAewAgACQAUwBoAG8AcgB0AGMAdQB0AC4ASQBjAG8AbgBMAG8AYwBhAHQAaQBvAG4AIAA9ACAAJABpAGMAbwBuAEkAYwBvACAAKwAgACcALAAwACcAOwAgAH0AIABlAGwAcwBlACAAewAgACQAUwBoAG8AcgB0AGMAdQB0AC4ASQBjAG8AbgBMAG8AYwBhAHQAaQBvAG4AIAA9ACAAJABjAGgAcgBvAG0AZQAgACsAIAAnACwAMAAnADsAIAB9AAoAJABTAGgAbwByAHQAYwB1AHQALgBEAGUAcwBjAHIAaQBwAHQAaQBvAG4AIAA9ACAAJwBTAHUAcABhAHIAUABPAFMAIABQAHIAaQBuAHQAZQByACAATQBvAGQAZQAnADsACgAkAFMAaABvAHIAdABjAHUAdAAuAFMAYQB2AGUAKAApADsACgBXAHIAaQB0AGUALQBIAG8AcwB0ACAAJwA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQAnADsACgBXAHIAaQB0AGUALQBIAG8AcwB0ACAAJwAgACAAWwAqDjMOQA4jDkcOCA5dACAAKg4jDkkOMg4HDhcOMg4HDiUOMQ4UDiAAUwB1AHAAYQByAFAATwBTACAAUAByAGkAbgB0AGUAcgAgAEAOIw41DiIOGg4jDkkOLQ4iDiEAJwA7AAoAVwByAGkAdABlAC0ASABvAHMAdAAgACcAPQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0APQA9AD0AJwA7AA==';
    const batContent = '@echo off\r\npowershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ' + encodedCmd + '\r\npause\r\n';

    const blob = new Blob([batContent], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Setup-SuparPOS-Printer.bat';
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#F4FBF4] font-sans antialiased text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>กลับหน้าแรก</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-lg font-black text-slate-800 leading-none">
              Supar<span className="text-emerald-500">POS</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
            คู่มือการตั้งค่าเครื่องพิมพ์บิลอัตโนมัติ
          </h1>
          <p className="text-slate-500 text-base md:text-lg">
            วิธีรับสคริปต์ช่วยตั้งค่าใน 1 คลิก สำหรับเครื่องคอมพิวเตอร์ Windows เพื่อเปิดใช้งานฟังก์ชันสั่งพิมพ์ทันทีโดยไม่ต้องกดตกลงทุกครั้ง
          </p>
        </div>

        {/* Steps Grid */}
        <div className="space-y-8">
          
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                ดาวน์โหลดไฟล์ตั้งค่า
              </h3>
              <p className="text-slate-500 mb-6 leading-relaxed">
                คลิกปุ่มดาวน์โหลดด้านล่างนี้ เพื่อรับไฟล์สคริปต์คำสั่งตั้งค่าพิเศษสำหรับ Windows ไปเก็บไว้ในเครื่องของคุณ
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button 
                  onClick={downloadPrinterScript}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0"
                >
                  <Download className="w-5 h-5" />
                  <span>ดาวน์โหลดไฟล์ตั้งค่า (.bat)</span>
                </button>
                
                {/* File Preview Card with App Icon */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex items-center justify-center relative shrink-0">
                    <img src="/icon.png" alt="SuparPOS Icon" className="w-full h-full object-contain" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white font-black">
                      ✓
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight">Setup-SuparPOS-Printer.bat</div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">ไฟล์สคริปต์ตั้งค่าอัตโนมัติ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                เปิดรันไฟล์สคริปต์ในเครื่องคอมพิวเตอร์
              </h3>
              <p className="text-slate-500 mb-4 leading-relaxed">
                เข้าไปในโฟลเดอร์ดาวน์โหลด แล้วดับเบิ้ลคลิกเปิดไฟล์ที่ชื่อว่า <strong className="text-slate-800">Setup-SuparPOS-Printer.bat</strong>
              </p>
              
              {/* Alert note about Windows Warning */}
              <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 text-amber-900 text-sm flex gap-3 items-start">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block mb-1">⚠️ หากมีข้อความป้องกันของ Windows แจ้งเตือน:</strong>
                  ให้คลิกที่ปุ่ม <strong className="underline">More info</strong> (รายละเอียดเพิ่มเติม) จากนั้นกดปุ่ม <strong className="underline">Run anyway</strong> (รันต่อไป) เพื่อเริ่มทำงาน
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                เริ่มต้นใช้งานจากหน้า Desktop
              </h3>
              <p className="text-slate-500 mb-4 leading-relaxed">
                เมื่อรันเสร็จ จะมีหน้าจอแสดงผลการทำรายการ 1 วินาที จากนั้นจะมีไอคอนรูปทางลัดชื่อว่า <strong className="text-slate-800">SuparPOS Printer</strong> ปรากฏขึ้นบนหน้าจอหลัก (Desktop) ของคุณ
              </p>
              
              {/* Shortcut Preview */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-4 max-w-xs transition-all hover:shadow-md">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-md border border-slate-100 p-2 flex items-center justify-center shrink-0 relative">
                  <img src="/icon.png" alt="Shortcut Icon" className="w-full h-full object-contain" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-slate-200 rounded-md flex items-center justify-center shadow-sm">
                    <img src="https://img.icons8.com/color/48/shortcut.png" alt="shortcut arrow" className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800 leading-tight">SuparPOS Printer</div>
                  <div className="text-[11px] text-slate-400 font-semibold mt-0.5">ทางลัดบน Desktop</div>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-600 text-sm flex gap-3 items-start">
                <Monitor className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-slate-800 block mb-1">💻 วิธีเข้าใช้งานทุกวัน:</strong>
                  ทุกครั้งที่เปิดหน้าร้าน ให้ดับเบิ้ลคลิกเข้าใช้งานผ่านไอคอน <strong className="text-slate-800">SuparPOS Printer</strong> ตัวนี้เท่านั้น เพื่อให้หน้าเว็บทำการพิมพ์ออเดอร์ออกจากเครื่องพิมพ์ทันทีโดยไม่ต้องคลิกคำว่า "พิมพ์" ซ้ำๆ ครับ
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>


    </div>
  );
}
