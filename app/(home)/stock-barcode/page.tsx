import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, generateBreadcrumbJsonLd, generateFAQJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: "โปรแกรมสต๊อกสินค้าและระบบบาร์โค้ด | SuparPOS",
  description: "โปรแกรมสต๊อกสินค้าและระบบบาร์โค้ดช่วยจัดการคลังวัตถุดิบร้านอาหารและร้านค้าปลีก ตัดสต๊อกสินค้าอัตโนมัติทันทีเมื่อคิดเงินหน้าร้าน เริ่มใช้งานฟรี",
  alternates: {
    canonical: "https://suparpos.com/stock-barcode"
  },
  openGraph: {
    title: "โปรแกรมสต๊อกสินค้าและระบบบาร์โค้ด | SuparPOS",
    description: "โปรแกรมสต๊อกสินค้าและระบบบาร์โค้ดช่วยจัดการคลังวัตถุดิบร้านอาหารและร้านค้าปลีก ตัดสต๊อกสินค้าอัตโนมัติทันทีเมื่อคิดเงินหน้าร้าน เริ่มใช้งานฟรี",
    url: "https://suparpos.com/stock-barcode",
    siteName: "SuparPOS",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "โปรแกรมสต๊อกสินค้าและระบบบาร์โค้ด | SuparPOS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "โปรแกรมสต๊อกสินค้าและระบบบาร์โค้ด | SuparPOS",
    description: "โปรแกรมสต๊อกสินค้าและระบบบาร์โค้ดช่วยจัดการคลังวัตถุดิบร้านอาหารและร้านค้าปลีก ตัดสต๊อกสินค้าอัตโนมัติทันทีเมื่อคิดเงินหน้าร้าน เริ่มใช้งานฟรี",
    images: ["/opengraph-image.png"],
  }
};

const STOCK_FAQS = [
  {
    question: "ระบบตัดสต๊อกสินค้าและวัตถุดิบเป็นเรียลไทม์หรือไม่?",
    answer: "ใช่ครับ ระบบจะทำการตัดสต๊อกสินค้าสำเร็จรูปและวัตถุดิบในคลังตามสูตรสินค้า (Recipe) ทันทีหลังพนักงานแคชเชียร์คิดเงินหน้าร้านและกดยืนยันออเดอร์ขายสำเร็จครับ"
  },
  {
    question: "สามารถนำเข้าจำนวนสต๊อกสินค้าจำนวนมากๆ ผ่านตาราง Excel ได้ไหม?",
    answer: "ในระบบปัจจุบันเรามีระบบเพิ่มรายการสินค้าและบาร์โค้ดแยกตามแต่ละชิ้น และสามารถรับสินค้าเข้าคลัง (Stock-In) เพิ่มจำนวนสต๊อก และปรับปรุงสต๊อกได้อย่างรวดเร็วผ่านหน้า Dashboard ส่วนกลางของร้านครับ"
  },
  {
    question: "ระบบสแกนบาร์โค้ดต้องนำเข้าข้อมูลรหัสสินค้าอย่างไร?",
    answer: "เจ้าของร้านสามารถเพิ่มรหัสบาร์โค้ดลงในเมนูข้อมูลสินค้าหน้าร้านได้โดยการใช้เครื่องสแกนบาร์โค้ดยิงรหัสเข้าไปเก็บในระบบ หรือพิมพ์รหัสบาร์โค้ดเข้าไปในโปรแกรมโดยตรง เมื่อเปิดหน้าคิดเงินก็สามารถใช้เครื่องสแกนบาร์โค้ดค้นหาและขายสินค้าชิ้นนั้นได้ทันที"
  }
];

export default function StockBarcodePage() {
  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: "หน้าแรก", item: "https://suparpos.com" },
    { name: "ระบบจัดการสต๊อกสินค้า & บาร์โค้ด", item: "https://suparpos.com/stock-barcode" }
  ]);
  const faqSchema = generateFAQJsonLd(STOCK_FAQS);

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
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mb-4 uppercase tracking-widest">Stock & Barcode Solution</span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight">
              โปรแกรมสต๊อกสินค้าและระบบบาร์โค้ด
            </h1>
            <p className="mt-6 text-slate-600 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto">
              ควบคุมคลังสินค้าและวัตถุดิบได้อย่างสมบูรณ์แบบด้วยโปรแกรมสต๊อกสินค้า และระบบบาร์โค้ดจัดการสต๊อกสินค้าหน้าร้าน ช่วยตัดสต๊อกอัตโนมัติทันทีหลังการขาย สรุปยอดต้นทุนวัตถุดิบ และแจ้งเตือนสินค้าใกล้หมดอย่างเรียลไทม์
            </p>
          </div>

          {/* Pain Points Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">ปัญหาคลังสต๊อกและต้นทุนที่ไม่สามารถควบคุมได้</h2>
              <div className="space-y-4">
                {[
                  { title: "ยอดสต๊อกไม่ตรงกับของจริง", desc: "สินค้าสูญหาย ของเสีย หรือของหมดคลังโดยไม่รู้ตัว จนเสียโอกาสการขายหน้าร้าน" },
                  { title: "ค้นหาสินค้าและคิดเงินช้า", desc: "ร้านค้าปลีกที่มีรหัสสินค้าหลายร้อยชิ้น ค้นหาราคาผิดพลาดบ่อยหากจดมือ" },
                  { title: "ไม่รู้ต้นทุนและกำไรที่ชัดเจน", desc: "ละเลยเรื่องสต๊อกวัตถุดิบ ทำให้คำนวณต้นทุนต่อจาน หรือต่อแก้วไม่ได้ คุมกำไรยาก" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{item.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">ควบคุมอย่างอยู่หมัดด้วย SuparPOS</h2>
              <div className="space-y-4">
                {[
                  { title: "ระบบหักสต๊อกหน้าร้านอัตโนมัติ", desc: "หักสินค้าออกทันทีหลังคิดเงิน และแจ้งเตือนเมื่อสินค้าใกล้หมดสต๊อก" },
                  { title: "เชื่อมโยงกับระบบสแกนบาร์โค้ด", desc: "ยิงสแกนบาร์โค้ดเพื่อค้นหารายการสินค้าและใส่สต๊อกได้ไวในเสี้ยววินาที" },
                  { title: "คำนวณวัตถุดิบแบบเป็นระบบ", desc: "เชื่อมสูตรสินค้ากับวัตถุดิบ (Recipe) รู้ต้นทุนและปริมาณของสดที่ใช้จริง" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white border border-emerald-100 shadow-md">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                      <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{item.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">ฟีเจอร์เด่นระบบจัดการสต๊อกสินค้า & บาร์โค้ด</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "fa-cubes", title: "ระบบตัดสต๊อกหน้าร้าน", desc: "เมื่อทำการขายสำเร็จ ระบบจะทำการปรับลดจำนวนสต๊อกสินค้าคงเหลือที่ส่วนกลางให้อัตโนมัติ" },
                { icon: "fa-barcode", title: "ฐานข้อมูลบาร์โค้ด", desc: "รองรับการบันทึกรหัสบาร์โค้ดให้กับสินค้าเพื่อช่วยคิดเงินอย่างรวดเร็วและเป็นระเบียบ" },
                { icon: "fa-wheat-awn", title: "คลังวัตถุดิบละเอียด", desc: "จัดการสต๊อกของสด ผงกาแฟ หรือส่วนผสมต่างๆ แยกส่วนจากเมนูสินค้าหน้าร้าน" },
                { icon: "fa-file-invoice", title: "ระบบรับสินค้าเข้า (Stock-In)", desc: "บันทึกและตรวจสอบประวัติการนำเข้าสินค้า ปริมาณ และประวัติผู้เพิ่มสต๊อกอย่างเป็นขั้นตอน" },
                { icon: "fa-circle-exclamation", title: "แจ้งเตือนของหมดล่วงหน้า", desc: "ระบบสรุปสินค้าและวัตถุดิบที่ยอดสต๊อกเหลือน้อย เพื่อช่วยวางแผนในการสั่งซื้อของเข้าร้าน" },
                { icon: "fa-chart-pie", title: "รายงานภาพรวมต้นทุน", desc: "สรุปยอดมูลค่าของเหลือในคลัง และอัตราการใช้ส่วนผสมเฉลี่ยต่อวัน/สัปดาห์อย่างแม่นยำ" }
              ].map((f, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-6">
                    <i className={`fa-solid ${f.icon}`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-3">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works & Target Shops */}
          <div className="grid md:grid-cols-2 gap-12 mb-20 bg-emerald-50/20 p-8 md:p-12 rounded-[2.5rem] border border-emerald-100/40">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">3 ขั้นตอนง่ายๆ ในการบริหารสต๊อก</h2>
              <div className="space-y-6">
                {[
                  { step: "1", title: "สมัครสมาชิกรับสิทธิ์ฟรี", desc: "ลงทะเบียนบัญชีร้านค้าผ่านหน้าเว็บ SuparPOS พร้อมใช้งานฐานข้อมูลคลังสินค้าส่วนตัว" },
                  { step: "2", title: "ใส่รายละเอียดรหัสและจํานวนสินค้า", desc: "ป้อนรหัสบาร์โค้ดของสินค้าแต่ละชิ้น และใส่ยอดจำนวนสต๊อกตั้งต้นในหน้าบอร์ด" },
                  { step: "3", title: "คิดเงินหน้าร้านหักลบระบบ", desc: "เริ่มต้นคิดเงินหน้าร้านผ่านเครื่อง POS ระบบจะตัดจำนวนคลังให้ตามจริงเรียลไทม์" }
                ].map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">{s.step}</div>
                    <div>
                      <h3 className="font-bold text-slate-800">{s.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">ร้านที่เหมาะสม</h2>
              <ul className="space-y-4">
                {[
                  "ร้านค้าปลีก และร้านสะดวกซื้อ มินิมาร์ท",
                  "ร้านขายของชำ โชห่วย และร้านขายสินค้าชุมชน",
                  "ร้านกาแฟ คาเฟ่ ที่ต้องการควบคุมต้นทุนเมล็ดกาแฟและนมสด",
                  "ร้านเบเกอรี่ และร้านขนมหวานที่คุมสต๊อกแป้ง/น้ำตาล",
                  "ร้านค้าส่งและร้านค้าทุกประเภทที่มีระบบบาร์โค้ดคิดเงิน"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Visual FAQ Section */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">คำถามที่พบบ่อย (FAQ)</h2>
            <div className="space-y-4">
              {STOCK_FAQS.map((faq, idx) => (
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
              <h2 className="text-3xl font-bold text-white mb-6">ควบคุมคลังสต๊อกสินค้าและต้นทุนร้านค้าของคุณให้เป็นระบบ</h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                สมัครสมาชิกทดลองใช้งานแผน Starter ฟรีวันนี้ เพื่อขจัดปัญหาสต๊อกไม่ตรงและต้นทุนคลาดเคลื่อน
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
