import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, generateBreadcrumbJsonLd, generateFAQJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: "โปรแกรมร้านกาแฟและระบบ POS คาเฟ่ | SuparPOS",
  description: "โปรแกรมร้านกาแฟ และระบบ POS คาเฟ่ เบเกอรี่ ช่วยจัดการคิดเงินผ่านแท็บเล็ต/iPad และระบบควบคุมสต๊อกวัตถุดิบ ตัดตามสูตรสินค้าเครื่องดื่มอัตโนมัติ เริ่มใช้งานฟรี",
  alternates: {
    canonical: "https://suparpos.com/pos-cafe"
  },
  openGraph: {
    title: "โปรแกรมร้านกาแฟและระบบ POS คาเฟ่ | SuparPOS",
    description: "โปรแกรมร้านกาแฟ และระบบ POS คาเฟ่ เบเกอรี่ ช่วยจัดการคิดเงินผ่านแท็บเล็ต/iPad และระบบควบคุมสต๊อกวัตถุดิบ ตัดตามสูตรสินค้าเครื่องดื่มอัตโนมัติ เริ่มใช้งานฟรี",
    url: "https://suparpos.com/pos-cafe",
    siteName: "SuparPOS",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "โปรแกรมร้านกาแฟและระบบ POS คาเฟ่ | SuparPOS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "โปรแกรมร้านกาแฟและระบบ POS คาเฟ่ | SuparPOS",
    description: "โปรแกรมร้านกาแฟ และระบบ POS คาเฟ่ เบเกอรี่ ช่วยจัดการคิดเงินผ่านแท็บเล็ต/iPad และระบบควบคุมสต๊อกวัตถุดิบ ตัดตามสูตรสินค้าเครื่องดื่มอัตโนมัติ เริ่มใช้งานฟรี",
    images: ["/opengraph-image.png"],
  }
};

const CAFE_FAQS = [
  {
    question: "ระบบจัดการสต๊อกวัตถุดิบและตัดสูตรเครื่องดื่มทำงานอย่างไร?",
    answer: "คุณสามารถกำหนดสูตรสินค้า (Recipe) ให้กับแต่ละเครื่องดื่มได้ เช่น ลาเต้เย็น ใช้เมล็ดกาแฟ 18 กรัม และนมสด 120 มล. เมื่อแคชเชียร์กดขายรายการนี้ ระบบของ SuparPOS จะทำการหักลบจำนวนเมล็ดกาแฟและนมสดออกจากสต๊อกคลังวัตถุดิบให้โดยอัตโนมัติทันที"
  },
  {
    question: "สามารถใช้งานระบบคิดเงินบน iPad หรือแท็บเล็ต Android ได้หรือไม่?",
    answer: "ได้ครับ หน้าจอขายหน้าร้าน (POS Web/App) ได้รับการออกแบบให้รองรับสัดส่วนหน้าจอแท็บเล็ตและ iPad อย่างสวยงาม ทำให้พนักงานสามารถจิ้มเลือกเมนู ขนาดแก้ว และตัวเลือกเสริม (เช่น หวานน้อย, เพิ่มช็อตกาแฟ) ได้อย่างสะดวดรวดเร็ว"
  },
  {
    question: "ระบบแยกบิลและสั่งพิมพ์รายการเครื่องดื่มแยกบาร์ทำงานอย่างไร?",
    answer: "SuparPOS รองรับการเชื่อมต่อเครื่องพิมพ์ใบเสร็จและใบออเดอร์ผ่านบลูทูธหรือวงแลน โดยคุณสามารถตั้งค่าแยกประเภทเครื่องพิมพ์ได้ เช่น ออเดอร์เครื่องดื่มพิมพ์ออกที่บาร์น้ำ และออเดอร์เบเกอรี่พิมพ์ออกที่ครัวเตาอบแยกกันโดยอัตโนมัติ"
  }
];

export default function PosCafePage() {
  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: "หน้าแรก", item: "https://suparpos.com" },
    { name: "ระบบ POS ร้านกาแฟ", item: "https://suparpos.com/pos-cafe" }
  ]);
  const faqSchema = generateFAQJsonLd(CAFE_FAQS);

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
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mb-4 uppercase tracking-widest">Cafe & Bakery Solution</span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight">
              โปรแกรมร้านกาแฟและระบบ POS สำหรับคาเฟ่
            </h1>
            <p className="mt-6 text-slate-600 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto">
              บริหารร้านกาแฟและเบเกอรี่ด้วยระบบที่มีประสิทธิภาพด้วยโปรแกรมร้านกาแฟ และระบบ POS คาเฟ่ ช่วยให้การคิดเงินหน้าร้าน จัดการวัตถุดิบและสต๊อกร้านกาแฟ พร้อมระบบบันทึกสูตรสินค้าและตัดวัตถุดิบแบบทศนิยม (Recipe) ทำงานร่วมกันได้อย่างราบรื่น
            </p>
          </div>

          {/* Pain Points Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">ปัญหาของร้านกาแฟและเบเกอรี่ทั่วไป</h2>
              <div className="space-y-4">
                {[
                  { title: "ไม่รู้ปริมาณวัตถุดิบที่เหลือจริง", desc: "คุมยอดขายได้แต่คุมต้นทุนไม่ได้ ของสดหมดกระทันหัน นมสดหมดขวด เมล็ดกาแฟขาดสต๊อก" },
                  { title: "คิวลูกค้าหนาแน่นช่วงเช้า", desc: "ลูกค้าเร่งรีบช่วงเวลาเช้าก่อนทำงาน หากระบบคิดเงินช้าจะเสียลูกค้าให้ร้านอื่นทันที" },
                  { title: "เมนูมีตัวเลือกยุ่งยากสับสน", desc: "ออเดอร์สลับระหว่างเมนู ร้อน-เย็น-ปั่น หรือความหวานเพิ่มช็อตกาแฟ จดมือแล้วส่งออเดอร์พลาดง่าย" }
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
              <h2 className="text-2xl font-bold text-slate-800">แก้ปัญหาอย่างตรงจุดด้วย SuparPOS</h2>
              <div className="space-y-4">
                {[
                  { title: "สูตรสินค้าและตัดสต๊อกอัตโนมัติ (Recipe)", desc: "ผูกสูตรสินค้า เช่น เมล็ดกาแฟ นม ไซรัป ตัดทศนิยมเรียลไทม์หลังการคิดเงินหน้าร้านสำเร็จ" },
                  { title: "คิดเงินด่วนผ่านแท็บเล็ตและ iPad", desc: "อินเตอร์เฟสเมนูรูปภาพขนาดใหญ่ จิ้มง่าย รวดเร็ว พิมพ์ออเดอร์เข้าเครื่องพิมพ์โดยตรง" },
                  { title: "ระบบตัวเลือกเสริมแยกประเภทชัดเจน", desc: "ตั้งค่า Modifiers สำหรับหวานน้อย, หวานปกติ, เพิ่มไข่มุก, นมโอ๊ต ช่วยลดการสื่อสารที่คลาดเคลื่อน" }
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
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">ฟีเจอร์สำหรับร้านคาเฟ่และเบเกอรี่</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "fa-mug-hot", title: "สูตรตัดสต๊อก (Recipe)", desc: "หักลบจำนวนวัตถุดิบตามสูตรสินค้าอัตโนมัติทันทีหลังการขาย เพื่อคุมต้นทุนต่อแก้ว" },
                { icon: "fa-tablet-screen-button", title: "รองรับ iPad และแท็บเล็ต", desc: "ระบบทำงานบนเบราว์เซอร์และแอป เหมาะสำหรับจอขนาดกลางและใหญ่ จิ้มออเดอร์ง่ายในมือพนักงาน" },
                { icon: "fa-list-check", title: "ตัวเลือกเสริมสินค้า (Modifiers)", desc: "จัดการเมนูแยก ร้อน/เย็น/ปั่น ความหวาน ประเภทนม หรือท็อปปิ้งเสริมได้อย่างเป็นระบบ" },
                { icon: "fa-qrcode", title: " PromptPay สะดวกและปลอดภัย", desc: "แสดง QR Code บนจอคิดเงินหลักหรือสแกนจ่ายได้ทันที พนักงานไม่ต้องคอยเช็คบัญชีส่วนตัว" },
                { icon: "fa-print", title: "แยกพิมพ์ออเดอร์ตามบาร์", desc: "สั่งงานแยกเครื่องพิมพ์ใบเสร็จและเครื่องส่งรายการออเดอร์เข้าบาร์น้ำ บาร์ขนมตามความเหมาะสม" },
                { icon: "fa-chart-line", title: "รายงานของเสียและต้นทุน", desc: "วิเคราะห์ต้นทุนวัตถุดิบและสรุปยอดขาย ช่วยให้เจ้าของร้านคาเฟ่บริหารร้านได้อย่างมือโปร" }
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
              <h2 className="text-2xl font-bold text-slate-800 mb-6">เริ่มการตั้งค่าใน 3 ขั้นตอน</h2>
              <div className="space-y-6">
                {[
                  { step: "1", title: "ลงทะเบียนร้านค้าฟรี", desc: "เข้าสมัครใช้งานระบบ SuparPOS ผ่านหน้าเว็บไซต์ ได้ร้านค้าออนไลน์ของคุณทันที" },
                  { step: "2", title: "สร้างวัตถุดิบและผูกสูตรสินค้า", desc: "เพิ่มรายการเมล็ดกาแฟ นมสด ไซรัป และนำไปผูกในเมนูแยกแต่ละแก้ว" },
                  { step: "3", title: "จิ้มคิดเงินพร้อมตัดวัตถุดิบ", desc: "เปิดใช้งานหน้าคิดเงินผ่าน iPad หรือแท็บเล็ตหน้าร้าน เริ่มคิดเงินและตัดสต๊อกทันที" }
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
                  "ร้านกาแฟสด และร้านเครื่องดื่ม Slow Bar",
                  "ร้านคาเฟ่สไตล์มินิมอล หรือร้านชาไข่มุก",
                  "ร้านเบเกอรี่ ร้านขายขนมปัง และเค้กโฮมเมด",
                  "ร้านจำหน่ายไอศกรีม บิงซู และของหวานต่างๆ",
                  "คาเฟ่กึ่งร้านอาหารคาวหวานขนาดกลาง"
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
              {CAFE_FAQS.map((faq, idx) => (
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
              <h2 className="text-3xl font-bold text-white mb-6">ควบคุมต้นทุนและเพิ่มประสิทธิภาพให้ร้านคาเฟ่ของคุณ</h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                เริ่มต้นใช้งานแผน Starter ฟรีวันนี้ เพื่อให้สต๊อกวัตถุดิบและสูตรแก้วของคุณมีความถูกต้องแม่นยำยิ่งขึ้น
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
