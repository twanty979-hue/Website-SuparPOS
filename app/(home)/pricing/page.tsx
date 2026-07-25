import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, generateBreadcrumbJsonLd, generateFAQJsonLd } from '@/lib/seo';

// 1. Static Metadata for Pricing Page
export const metadata: Metadata = {
  title: "ราคาโปรแกรม POS และแพ็กเกจ SuparPOS",
  description: "เช็คราคาโปรแกรม POS ที่คุ้มค่า เริ่มต้นใช้งานฟรีแผน Starter หรือเลือกสมัครแผน Basic 250 บาท และแผน Pro 500 บาทต่อเดือนโดยไม่มีสัญญาผูกมัด",
  alternates: {
    canonical: "https://suparpos.com/pricing"
  },
  openGraph: {
    title: "ราคาโปรแกรม POS และแพ็กเกจ SuparPOS",
    description: "เช็คราคาโปรแกรม POS ที่คุ้มค่า เริ่มต้นใช้งานฟรีแผน Starter หรือเลือกสมัครแผน Basic 250 บาท และแผน Pro 500 บาทต่อเดือนโดยไม่มีสัญญาผูกมัด",
    url: "https://suparpos.com/pricing",
    siteName: "SuparPOS",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "ราคาโปรแกรม POS และแพ็กเกจ SuparPOS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ราคาโปรแกรม POS และแพ็กเกจ SuparPOS",
    description: "เช็คราคาโปรแกรม POS ที่คุ้มค่า เริ่มต้นใช้งานฟรีแผน Starter หรือเลือกสมัครแผน Basic 250 บาท และแผน Pro 500 บาทต่อเดือนโดยไม่มีสัญญาผูกมัด",
    images: ["/opengraph-image.png"],
  }
};

const PRICING_FAQS = [
  {
    question: "แพ็กเกจแต่ละแผนราคาของ SuparPOS ต่างกันอย่างไร?",
    answer: "แพ็กเกจ Starter ให้บริการฟรีสำหรับการเริ่มต้นคิดเงิน 100 ออเดอร์ต่อเดือน ส่วนแพ็กเกจ Basic (250 บ./เดือน) รองรับยอดขายและออเดอร์ไม่จำกัด และแพ็กเกจ PRO (500 บ./เดือน) เพิ่มระบบพนักงานและการกำหนดสิทธิ์พนักงาน"
  },
  {
    question: "การทดลองใช้ฟรีจำเป็นต้องใช้บัตรเครดิตหรือไม่?",
    answer: "ไม่ต้องใช้บัตรเครดิตครับ คุณสามารถสมัครสมาชิกและเริ่มต้นใช้งานแผน Starter ได้ฟรีทันทีโดยไม่มีข้อผูกมัดใดๆ"
  },
  {
    question: "สามารถยกเลิกหรือเปลี่ยนแพ็กเกจภายหลังได้หรือไม่?",
    answer: "ได้ครับ ระบบแผนราคาของเราเป็นรายเดือน ไม่มีข้อผูกมัดระยะยาว คุณสามารถเลือกอัปเกรดหรือยกเลิกการใช้งานเมื่อใดก็ได้ตามต้องการ"
  }
];

export default function PricingPage() {
  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: "หน้าแรก", item: "https://suparpos.com" },
    { name: "ราคาแพ็กเกจ", item: "https://suparpos.com/pricing" }
  ]);
  const faqSchema = generateFAQJsonLd(PRICING_FAQS);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white py-20 px-4 sm:px-6 lg:px-8 font-sans">

        {/* Background Decor */}
        <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Header Section */}
          <div className="text-center mb-16 pt-10">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">
              ราคาโปรแกรม POS และแพ็กเกจ SuparPOS
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              เริ่มต้นใช้งานฟรีได้ทันที หรืออัปเกรดเพื่อฟีเจอร์ระดับโปรที่ช่วยให้ร้านของคุณเติบโตอย่างก้าวกระโดดกับ SuparPOS
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">

            {/* 1. FREE Plan */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between">
              <div>
                <div className="mb-6 text-center">
                  <h3 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-2">STARTER</h3>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="text-4xl font-black text-slate-800">ฟรี</span>
                  </div>
                  <p className="text-xs text-slate-500">เริ่มต้นใช้งาน</p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-slate-400 mt-1"></i>
                    เลือกได้ 2 ธีม
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-slate-400 mt-1"></i>
                    รองรับ 100 ออเดอร์/เดือน
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-slate-400 mt-1"></i>
                    Dashboard ย้อนหลัง 60 วัน
                  </li>
                </ul>
              </div>

              <Link
                href="https://app.suparpos.com/"
                className="w-full block text-center py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:border-slate-800 hover:text-slate-800 transition-colors mt-auto"
              >
                เริ่มต้นใช้งานฟรี
              </Link>
            </div>

            {/* 2. BASIC Plan */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-lg shadow-emerald-200/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="mb-6 text-center">
                  <h3 className="text-sm font-bold text-emerald-500 tracking-widest uppercase mb-2">BASIC</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-black text-slate-800">250</span>
                    <span className="text-sm text-slate-400 font-medium">บ./เดือน</span>
                  </div>
                  <p className="text-xs text-slate-500">สำหรับร้านขนาดเล็ก</p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-emerald-500 mt-1"></i>
                    เลือกได้ 4 ธีม
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-emerald-500 mt-1"></i>
                    ออเดอร์ไม่จำกัด
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-emerald-500 mt-1"></i>
                    สร้าง QR Code ไม่จำกัด
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-emerald-500 mt-1"></i>
                    คิดเงินได้ไม่จำกัด
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-emerald-500 mt-1"></i>
                    Dashboard ไม่จำกัดย้อนหลัง
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-emerald-500 mt-1"></i>
                    Export รายงาน (Excel)
                  </li>
                </ul>
              </div>

              <Link
                href="https://app.suparpos.com/"
                className="w-full block text-center py-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-100 transition-colors mt-auto"
              >
                เลือกแพ็กเกจนี้
              </Link>
            </div>

            {/* 3. PRO Plan */}
            <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 relative transform md:-translate-y-4 flex flex-col justify-between z-10">

              <div>
                <div className="mb-6 text-center pt-2">
                  <h3 className="text-sm font-bold text-emerald-600 tracking-widest uppercase mb-2">PRO</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-black text-slate-800">500</span>
                    <span className="text-sm text-slate-400 font-medium">บ./เดือน</span>
                  </div>
                  <p className="text-xs text-slate-500">สำหรับร้านที่ต้องการระบบพนักงาน</p>
                </div>

                <ul className="space-y-3 mb-8">
                   <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-emerald-600 mt-1"></i>
                    เลือกได้ 7 ธีม
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-emerald-600 mt-1"></i>
                    สร้าง QR Code ไม่จำกัด
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-emerald-600 mt-1"></i>
                    คิดเงินได้ไม่จำกัด
                  </li>
                   <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-emerald-600 mt-1"></i>
                     Dashboard ไม่จำกัดย้อนหลัง
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fa-solid fa-check text-emerald-600 mt-1"></i>
                     Export รายงาน (Excel)
                  </li>
                  <li className="flex items-start gap-3 text-sm font-medium text-emerald-700">
                     <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-check text-emerald-600 text-xs"></i>
                     </div>
                    ระบบพนักงาน
                  </li>
                  <li className="flex items-start gap-3 text-sm font-medium text-emerald-700">
                     <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-check text-emerald-600 text-xs"></i>
                     </div>
                    กำหนดสิทธิ์พนักงาน
                  </li>
                </ul>
              </div>

              <Link
                href="https://app.suparpos.com/"
                className="w-full block text-center py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold hover:from-emerald-700 hover:to-teal-600 shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] mt-auto"
              >
                เลือกแพ็กเกจนี้
              </Link>
            </div>

          </div>

          {/* Visual FAQ Section for Pricing Page */}
          <div className="max-w-3xl mx-auto mt-24 border-t border-slate-200/80 pt-16">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">
              คำถามที่พบบ่อยเกี่ยวกับราคาและแพ็กเกจ
            </h2>
            <div className="space-y-4">
              {PRICING_FAQS.map((faq, idx) => (
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

          {/* Contact Link */}
          <div className="mt-16 text-center">
            <p className="text-slate-500">
              มีคำถามเพิ่มเติม? <Link href="/contact" className="text-emerald-600 font-bold hover:underline">ติดต่อทีมขายของเรา</Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
