import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, generateBreadcrumbJsonLd, generateFAQJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: "FoodScan เปลี่ยนชื่อเป็น SuparPOS | ข้อมูลลูกค้าเดิม",
  description: "รายละเอียดการประกาศอัปเกรดแบรนด์จาก POS FoodScan เป็น SuparPOS ยกระดับระบบจัดการร้านค้าปลีก ร้านอาหาร คาเฟ่ มินิมาร์ท และสต๊อกอย่างครบวงจร ข้อมูลระบบปลอดภัย",
  alternates: {
    canonical: "https://suparpos.com/foodscan"
  },
  openGraph: {
    title: "FoodScan เปลี่ยนชื่อเป็น SuparPOS | ข้อมูลลูกค้าเดิม",
    description: "รายละเอียดการประกาศอัปเกรดแบรนด์จาก POS FoodScan เป็น SuparPOS ยกระดับระบบจัดการร้านค้าปลีก ร้านอาหาร คาเฟ่ มินิมาร์ท และสต๊อกอย่างครบวงจร ข้อมูลระบบปลอดภัย",
    url: "https://suparpos.com/foodscan",
    siteName: "SuparPOS",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "FoodScan เปลี่ยนชื่อเป็น SuparPOS | ข้อมูลลูกค้าเดิม",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FoodScan เปลี่ยนชื่อเป็น SuparPOS | ข้อมูลลูกค้าเดิม",
    description: "รายละเอียดการประกาศอัปเกรดแบรนด์จาก POS FoodScan เป็น SuparPOS ยกระดับระบบจัดการร้านค้าปลีก ร้านอาหาร คาเฟ่ มินิมาร์ท และสต๊อกอย่างครบวงจร ข้อมูลระบบปลอดภัย",
    images: ["/opengraph-image.png"],
  }
};

const FOODSCAN_FAQS = [
  {
    question: "ระบบ FoodScan และ SuparPOS เป็นระบบเดียวกันหรือไม่?",
    answer: "ใช่ครับ ระบบ POS FoodScan คือแบรนด์แรกเริ่มของเราที่เน้นการทำระบบสแกนสั่งอาหารและจอครัว แต่ปัจจุบันเราได้ยกระดับฟีเจอร์และอัปเกรดชื่อใหม่เป็น SuparPOS เพื่อรองรับทั้งร้านค้าปลีก โชห่วย คาเฟ่ และร้านอาหารทุกรูปแบบอย่างครอบคลุมมากขึ้น"
  },
  {
    question: "ลูกค้าเก่าที่สมัครไว้ในชื่อ FoodScan ต้องสมัครบัญชีใหม่หรือไม่?",
    answer: "ไม่ต้องสมัครใหม่ครับ คุณสามารถใช้บัญชีอีเมลเดิมและรหัสผ่านเดิมเพื่อเข้าสู่ระบบ SuparPOS ผ่านหน้าแอปพลิเคชันได้ปกติ ข้อมูลการขาย ผังโต๊ะ เมนูอาหาร และบัญชีผู้ใช้อื่นๆ ยังคงอยู่บนระบบฐานข้อมูลเดิมเนื่องจากเป็นระบบเดียวกันอยู่แล้วครับ"
  },
  {
    question: "มีค่าใช้จ่ายเพิ่มเติมจากการเปลี่ยนชื่อแบรนด์นี้หรือไม่?",
    answer: "ไม่มีค่าใช้จ่ายเพิ่มเติมใดๆ จากการเปลี่ยนแปลงแบรนด์ในครั้งนี้ครับ สิทธิ์การใช้งานและแพ็กเกจเดิมของคุณจะยังคงอยู่และได้รับการดูแลช่วยเหลือจากทีมงานผู้พัฒนาทีมเดิมทุกประการ"
  }
];

export default function FoodScanPage() {
  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: "หน้าแรก", item: "https://suparpos.com" },
    { name: "เกี่ยวกับ FoodScan", item: "https://suparpos.com/foodscan" }
  ]);
  const faqSchema = generateFAQJsonLd(FOODSCAN_FAQS);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-white py-20 px-4 sm:px-6 lg:px-8 font-sans">
        
        {/* Background Decor */}
        <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-green-100/35 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-100/35 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10 pt-10">
          
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mb-4 uppercase tracking-widest">Brand Rebranding Notice</span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight">
              FoodScan เปลี่ยนชื่อเป็น SuparPOS
            </h1>
            <p className="mt-6 text-slate-600 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto">
              ประกาศอย่างเป็นทางการถึงผู้ใช้งานระบบและลูกค้าทุกท่าน ระบบจัดการร้านอาหารและคิวอาร์เมนูภายใต้ชื่อแบรนด์เดิม FoodScan และ POS FoodScan ได้รับการยกระดับความสามารถและเปลี่ยนชื่อแบรนด์ใหม่เป็น SuparPOS เพื่อขยายฟังก์ชันและรองรับการใช้งานของร้านค้าปลีก โชห่วย มินิมาร์ท และร้านอาหารทุกประเภทอย่างครบถ้วน
            </p>
          </div>

          {/* Core Announcement Content */}
          <div className="grid md:grid-cols-2 gap-12 items-stretch mb-20">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-sm"><i className="fa-solid fa-history"></i></span>
                  ความเป็นมาของแบรนด์เดิม
                </h2>
                <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
                  <p>
                    ระบบ <strong>FoodScan</strong> เริ่มต้นจากการเป็นระบบอำนวยความสะดวกในร้านอาหารขนาดเล็กถึงขนาดกลาง โดยเน้นเรื่องของ <strong>ระบบสแกนสั่งอาหารผ่าน QR Code</strong> เมนูอาหารออนไลน์ และระบบส่งออเดอร์เข้าครัวเพื่อลดภาระพนักงานเสิร์ฟ
                  </p>
                  <p>
                    หลังจากเปิดให้บริการ เราได้รับข้อเสนอแนะและเสียงตอบรับจากผู้ประกอบการจำนวนมากที่ต้องการนำระบบไปประยุกต์ใช้กับธุรกิจอื่นๆ เช่น ร้านค้าปลีกทั่วไป มินิมาร์ท และร้านโชห่วย ซึ่งมีความต้องการในเรื่องของ <strong>ระบบสแกนบาร์โค้ดคิดเงิน</strong> และ <strong>การจัดการสต๊อกสินค้าหน้าร้าน</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-emerald-200 shadow-md flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-sm"><i className="fa-solid fa-circle-up"></i></span>
                  ทำไมต้องอัปเกรดเป็น SuparPOS?
                </h2>
                <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
                  <p>
                    เพื่อขยายขอบเขตการทำงานให้ครอบคลุมการจัดการร้านค้าและร้านอาหารแบบเบ็ดเสร็จครบวงจร เราจึงได้ตัดสินใจอัปเกรดชื่อแบรนด์ใหม่เป็น <strong>SuparPOS (ซูเปอร์พีโอเอส)</strong>
                  </p>
                  <p>
                    แบรนด์ใหม่นี้มาพร้อมกับการยกระดับความเร็วในการประมวลผลหลังบ้าน เพิ่มระบบบาร์โค้ดเพื่อร้านค้าปลีก ระบบสต๊อกวัตถุดิบและสูตรสินค้า (Recipe) สำหรับร้านคาเฟ่ ตลอดจนฟังก์ชันความปลอดภัยในการจำกัดสิทธิ์พนักงาน สำหรับร้านค้าทั่วไปอย่างเต็มพิกัด
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What remains same? */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">สิ่งที่ผู้ใช้งานเดิมของ FoodScan สบายใจได้</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "fa-database", title: "ข้อมูลของคุณปลอดภัย", desc: "ข้อมูลการขาย เมนูสินค้า สต๊อก และระบบร้านค้ายังอยู่บนระบบฐานข้อมูลเดิม คุณจึงสามารถใช้งานต่อได้ทันทีโดยไม่ต้องตั้งค่าใหม่" },
                { icon: "fa-user-check", title: "ใช้บัญชีเดิมล็อกอินได้ทันที", desc: "คุณสามารถใช้อีเมลและรหัสผ่านตัวเดิมล็อกอินเข้าใช้งานผ่านระบบของ SuparPOS ได้ทันที" },
                { icon: "fa-headset", title: "ทีมงานดูแลและบริการชุดเดิม", desc: "ผู้ดูแลระบบ ทีมซัพพอร์ต และทีมวิศวกรซอฟต์แวร์ยังคงเป็นทีมเดิม คอยให้การช่วยเหลือและอัปเดตฟีเจอร์อย่างต่อเนื่อง" }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-6 mx-auto">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual FAQ Section */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">คำถามที่พบบ่อย (FAQ)</h2>
            <div className="space-y-4">
              {FOODSCAN_FAQS.map((faq, idx) => (
                <details key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-emerald-300 transition-colors group" open={idx === 0}>
                  <summary className="text-base font-bold text-slate-800 cursor-pointer flex justify-between items-center list-none select-none">
                    <span>{faq.question}</span>
                    <span className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      <i className="fa-solid fa-chevron-down group-open:rotate-180 transition-transform text-xs"></i>
                    </span>
                  </summary>
                  <p className="mt-3 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* CTA Box */}
          <div className="text-center bg-emerald-600 rounded-[2rem] p-12 relative overflow-hidden shadow-2xl shadow-emerald-500/30">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-6">ก้าวสู่อนาคตที่ครอบคลุมการจัดการร้านค้าร่วมกับเรา</h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                เริ่มต้นใช้งานและสัมผัสความเร็วในการคิดเงิน สต๊อก และบาร์โค้ดไปกับระบบ SuparPOS ตัวใหม่ฟรีวันนี้
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="https://app.suparpos.com/" className="bg-white text-emerald-600 font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all active:scale-95">
                  เริ่มต้นใช้งานฟรี
                </Link>
                <Link href="/pricing" className="bg-emerald-700/50 border border-emerald-400 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-emerald-700 transition-all">
                  ดูราคาแพ็กเกจ
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
