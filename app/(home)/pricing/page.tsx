import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generateFAQJsonLd,
  generateSoftwareApplicationJsonLd,
  generatePricingProductJsonLd,
} from '@/lib/seo';
import { getPublicPricingPlans } from '@/lib/planServer';
import PricingCards from './PricingCards';

export const revalidate = 60;

// 1. Static Metadata for Pricing Page
export const metadata: Metadata = {
  title: "ราคาโปรแกรม POS และแพ็กเกจ POS Foodscan | เริ่มต้นฟรี",
  description: "เช็คราคาโปรแกรม POS และระบบสแกนสั่งอาหาร POS Foodscan เริ่มต้นใช้งานฟรีแผน Starter (1,000 ออเดอร์/เดือน) หรือเลือกสมัครแผน Basic เริ่มต้น 212.5 บาท และแผน Pro 425 บาทต่อเดือน (ลดพิเศษ 15% ซื้อผ่านเว็บ และลด 25% รายปี) ไม่มีสัญญาผูกมัด",
  alternates: {
    canonical: "https://suparpos.com/pricing"
  },
  openGraph: {
    title: "ราคาโปรแกรม POS และแพ็กเกจ POS Foodscan | เริ่มต้นฟรี",
    description: "เช็คราคาโปรแกรม POS และระบบสแกนสั่งอาหาร POS Foodscan เริ่มต้นใช้งานฟรีแผน Starter (1,000 ออเดอร์/เดือน) หรือเลือกสมัครแผน Basic เริ่มต้น 212.5 บาท และแผน Pro 425 บาทต่อเดือน (ลดพิเศษ 15% ซื้อผ่านเว็บ และลด 25% รายปี) ไม่มีสัญญาผูกมัด",
    url: "https://suparpos.com/pricing",
    siteName: "POS Foodscan",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "ราคาโปรแกรม POS และแพ็กเกจ POS Foodscan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ราคาโปรแกรม POS และแพ็กเกจ POS Foodscan | เริ่มต้นฟรี",
    description: "เช็คราคาโปรแกรม POS และระบบสแกนสั่งอาหาร POS Foodscan เริ่มต้นใช้งานฟรีแผน Starter (1,000 ออเดอร์/เดือน) หรือเลือกสมัครแผน Basic เริ่มต้น 212.5 บาท และแผน Pro 425 บาทต่อเดือน (ลดพิเศษ 15% ซื้อผ่านเว็บ และลด 25% รายปี) ไม่มีสัญญาผูกมัด",
    images: ["/opengraph-image.png"],
  }
};

const PRICING_FAQS = [
  {
    question: "แพ็กเกจแต่ละแผนราคาของ POS Foodscan ต่างกันอย่างไร?",
    answer: "ทุกแพ็กเกจสามารถเลือกใช้งานธีมร้านค้าได้ฟรีทั้งหมด โดยแผน Free ให้บริการฟรีตลอดชีพสำหรับการเริ่มต้น คิดเงินหน้าร้านไม่จำกัด สแกนสั่งอาหาร 1,000 ออเดอร์/เดือน และดู Dashboard ย้อนหลัง 30 วัน, แผน Basic (ปกติ 250 บ. พิเศษซื้อผ่านเว็บลด 15% เหลือ 212.5 บ./เดือน หรือรายปีลด 25% เหลือ 2,250 บ./ปี) ปลดล็อกออเดอร์ไม่จำกัด และ Export Excel, และแผน Pro (ปกติ 500 บ. พิเศษซื้อผ่านเว็บลด 15% เหลือ 425 บ./เดือน หรือรายปีลด 25% เหลือ 4,500 บ./ปี) เพิ่มระบบจัดการพนักงาน 3 คน และ Dashboard ขั้นสูง"
  },
  {
    question: "การทดลองใช้ฟรีจำเป็นต้องใช้บัตรเครดิตหรือไม่?",
    answer: "ไม่ต้องใช้บัตรเครดิตครับ คุณสามารถสมัครสมาชิกและเริ่มต้นใช้งานแผน Free ได้ฟรีทันทีโดยไม่มีข้อผูกมัดใดๆ"
  },
  {
    question: "สามารถเปลี่ยนหรือยกเลิกแพ็กเกจภายหลังได้หรือไม่?",
    answer: "ได้ครับ ระบบแผนราคาของเรามีความยืดหยุ่น ไม่มีข้อผูกมัดระยะยาว คุณสามารถเลือกอัปเกรดหรือยกเลิกการใช้งานเมื่อใดก็ได้ตามต้องการ"
  },
  {
    question: "หากสมัครแบบรายปี มีส่วนลดหรือไม่?",
    answer: "มีส่วนลดพิเศษสูงสุดถึง 25% สำหรับการชำระแบบรายปี และเมื่อสมัครแพ็กเกจรายเดือนผ่านหน้าเว็บไซต์ รับส่วนลดทันที 15% พร้อมรับ Coins โบนัสพิเศษสำหรับใช้งานในระบบ"
  }
];

export default async function PricingPage() {
  const { plans, seoOffers } = await getPublicPricingPlans();

  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: "หน้าแรก", item: "https://suparpos.com" },
    { name: "ราคาแพ็กเกจ", item: "https://suparpos.com/pricing" }
  ]);
  const faqSchema = generateFAQJsonLd(PRICING_FAQS);
  const softwareSchema = generateSoftwareApplicationJsonLd(seoOffers);
  const productSchema = generatePricingProductJsonLd(seoOffers);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={softwareSchema} />
      <JsonLd data={productSchema} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white py-20 px-4 sm:px-6 lg:px-8 font-sans">

        {/* Background Decor */}
        <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Header Section */}
          <div className="text-center mb-12 pt-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black tracking-wider uppercase mb-4">
              PRICING PLANS
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">
              ราคาโปรแกรม POS และแพ็กเกจ POS Foodscan
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              เริ่มต้นใช้งานฟรีได้ทันที หรืออัปเกรดเพื่อฟีเจอร์ระดับโปร พิเศษลดทันที 15% เมื่อซื้อผ่านเว็บไซต์ หรือประหยัดสูงสุด 25% เมื่อเลือกแพ็กเกจรายปี
            </p>
          </div>

          {/* Dynamic 4 Cards Grid with Monthly / Yearly Toggle */}
          <PricingCards plans={plans} />

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
              มีคำถามเพิ่มเติมหรือต้องการคำแนะนำ? <Link href="https://app.suparpos.com/" className="text-emerald-600 font-bold hover:underline">ติดต่อเราได้ทันที</Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
