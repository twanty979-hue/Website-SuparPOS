import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, generateBreadcrumbJsonLd, generateFAQJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: "โปรแกรม POS ร้านค้าปลีกและร้านโชห่วย | SuparPOS",
  description: "โปรแกรม POS ร้านค้าปลีก และระบบร้านโชห่วย มินิมาร์ท ช่วยจัดการคิดเงินหน้าร้าน ตัดสต๊อกสินค้าอัตโนมัติ และสแกนบาร์โค้ดได้อย่างรวดเร็ว แม่นยำ เริ่มต้นใช้งานฟรี",
  alternates: {
    canonical: "https://suparpos.com/pos-retail"
  },
  openGraph: {
    title: "โปรแกรม POS ร้านค้าปลีกและร้านโชห่วย | SuparPOS",
    description: "โปรแกรม POS ร้านค้าปลีก และระบบร้านโชห่วย มินิมาร์ท ช่วยจัดการคิดเงินหน้าร้าน ตัดสต๊อกสินค้าอัตโนมัติ และสแกนบาร์โค้ดได้อย่างรวดเร็ว แม่นยำ เริ่มต้นใช้งานฟรี",
    url: "https://suparpos.com/pos-retail",
    siteName: "SuparPOS",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "โปรแกรม POS ร้านค้าปลีกและร้านโชห่วย | SuparPOS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "โปรแกรม POS ร้านค้าปลีกและร้านโชห่วย | SuparPOS",
    description: "โปรแกรม POS ร้านค้าปลีก และระบบร้านโชห่วย มินิมาร์ท ช่วยจัดการคิดเงินหน้าร้าน ตัดสต๊อกสินค้าอัตโนมัติ และสแกนบาร์โค้ดได้อย่างรวดเร็ว แม่นยำ เริ่มต้นใช้งานฟรี",
    images: ["/opengraph-image.png"],
  }
};

const RETAIL_FAQS = [
  {
    question: "ระบบบาร์โค้ดของ SuparPOS ใช้ร่วมกับเครื่องสแกนทั่วไปได้หรือไม่?",
    answer: "ได้ครับ ระบบของเรารองรับการเชื่อมต่อกับเครื่องสแกนบาร์โค้ดมาตรฐานทั่วไป ทั้งแบบเชื่อมต่อไร้สายผ่าน Bluetooth หรือเชื่อมต่อผ่านสาย USB/OTG เข้ากับมือถือ แท็บเล็ต หรือคอมพิวเตอร์ได้ทันที"
  },
  {
    question: "หากไม่มีเน็ตหรือเน็ตหลุดกะทันหัน ยังสามารถคิดเงินลูกค้าหน้าร้านได้ไหม?",
    answer: "ได้ครับ ระบบ POS ของเราได้รับการออกแบบมารองรับการขายและบันทึกยอดธุรกรรมในโหมดออฟไลน์ชั่วคราวหน้าร้าน และจะทำการอัปเดตข้อมูลขึ้นระบบคลาวด์โดยอัตโนมัติเมื่ออินเทอร์เน็ตกลับมาเชื่อมต่ออีกครั้ง"
  },
  {
    question: "มีข้อจำกัดในการจำกัดสิทธิ์ของพนักงานแคชเชียร์หรือไม่?",
    answer: "ระบบของเราในแพ็กเกจ PRO สามารถตั้งค่าสิทธิ์ให้พนักงานได้อย่างปลอดภัย เช่น จำกัดสิทธิ์ไม่ให้แก้ไขราคาสินค้า ไม่ให้เปิดดูยอดขายรวม หรือสิทธิ์การลดราคาสินค้า เพื่อความปลอดภัยทางการเงินของร้าน"
  }
];

export default function PosRetailPage() {
  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: "หน้าแรก", item: "https://suparpos.com" },
    { name: "ระบบ POS ร้านค้าปลีก", item: "https://suparpos.com/pos-retail" }
  ]);
  const faqSchema = generateFAQJsonLd(RETAIL_FAQS);

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
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mb-4 uppercase tracking-widest">Retail Solution</span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight">
              โปรแกรม POS ร้านค้าปลีก ร้านโชห่วย และมินิมาร์ท
            </h1>
            <p className="mt-6 text-slate-600 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto">
              ระบบบริหารจัดการหน้าร้านที่มีประสิทธิภาพสูงด้วยโปรแกรม POS ร้านค้าปลีก และระบบร้านโชห่วย มินิมาร์ท ช่วยให้การขายสินค้า คิดเงินหน้าร้าน เช็คสต๊อกสินค้า และทำงานร่วมกับระบบบาร์โค้ดสแกนสินค้าทำได้อย่างรวดเร็ว แม่นยำ และไม่มีสะดุด
            </p>
          </div>

          {/* Pain Points Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">ปัญหาปวดหัวของร้านค้าปลีกและโชห่วยทั่วไป</h2>
              <div className="space-y-4">
                {[
                  { title: "คิดเงินช้า คิวยาว", desc: "ลูกค้าขี้เกียจรอแถวยาวๆ พนักงานคำนวณราคามือเปล่าช้าและผิดบ่อย" },
                  { title: "สต๊อกไม่ตรง ข้อมูลไม่เรียลไทม์", desc: "สินค้าหมดไม่รู้ตัว สินค้าค้างสต๊อกล้นคลัง เช็คจำนวนของเหลือยาก" },
                  { title: "ยอดขายสูญหาย ตรวจสอบไม่ได้", desc: "ไม่รู้กำไรที่แท้จริงรายวัน ตรวจสอบยอดเงินตกหล่นหรือการโกงยาก" }
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
              <h2 className="text-2xl font-bold text-slate-800">แล้ว SuparPOS เข้ามาช่วยแก้ปัญหาอย่างไร?</h2>
              <div className="space-y-4">
                {[
                  { title: "สแกนบาร์โค้ดขายสินค้าในคลิกเดียว", desc: "คิดเงินลูกค้าได้ไวภายในไม่กี่วินาที รองรับเครื่องสแกนบาร์โค้ดเต็มระบบ" },
                  { title: "ตัดสต๊อกทันทีที่หน้าร้านขาย", desc: "ระบบอัปเดตยอดคงเหลือของสินค้าเรียลไทม์ แจ้งเตือนเมื่อสินค้าใกล้หมดสต๊อก" },
                  { title: "สรุปรายงานยอดขายรายวันอัตโนมัติ", desc: "เจ้าของร้านเช็คยอดขาย กำไร และวิเคราะห์สินค้าขายดีได้ทุกที่ทุกเวลา" }
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
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">ฟีเจอร์เด่นสำหรับร้านค้าปลีก มินิมาร์ท</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "fa-barcode", title: "ระบบบาร์โค้ดแม่นยำ", desc: "สแกนรหัสบาร์โค้ดของสินค้าหน้าร้านเพื่อเพิ่มเข้ารถเข็นและคิดเงินได้อย่างแม่นยำ ไม่ต้องจำราคา" },
                { icon: "fa-boxes-stacked", title: "ควบคุมและตัดสต๊อก", desc: "ระบบอัปเดตสต๊อกสินค้าหน้าร้านทันทีเมื่อมีรายการสั่งซื้อ พร้อมระบบนำเข้าสินค้าที่ใช้งานง่าย" },
                { icon: "fa-receipt", title: "เงินสด & สแกนจ่าย", desc: "รองรับการรับเงินสดพร้อมคำนวณเงินทอน และแสดง QR Code PromptPay ให้ลูกค้าสแกนจ่ายได้ทันที" },
                { icon: "fa-print", title: "พิมพ์บิลใบเสร็จด่วน", desc: "เชื่อมต่อเครื่องพิมพ์ใบเสร็จผ่าน Bluetooth, Wi-Fi/LAN และเครื่องพิมพ์ผ่านเว็บอย่างรวดเร็ว" },
                { icon: "fa-users-gear", title: "คุมกะและสิทธิ์พนักงาน", desc: "จำกัดสิทธิ์พนักงานแต่ละระดับเพื่อป้องกันความปลอดภัยทางบัญชี ตรวจสอบประวัติการขายรายบุคคล" },
                { icon: "fa-wifi-slash", title: "ซิงก์ระบบออฟไลน์", desc: "แม้เกิดปัญหาการเชื่อมต่ออินเทอร์เน็ตขัดข้อง ก็ยังบันทึกยอดขายแบบออฟไลน์หน้าร้านชั่วคราวได้" }
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
              <h2 className="text-2xl font-bold text-slate-800 mb-6">3 ขั้นตอนง่ายๆ ในการเริ่มใช้งาน</h2>
              <div className="space-y-6">
                {[
                  { step: "1", title: "สมัครใช้งานใน 5 นาที", desc: "ลงทะเบียนบัญชีร้านค้าผ่านหน้าเว็บ SuparPOS ได้ทันทีโดยไม่ต้องรออนุมัติ" },
                  { step: "2", title: "ลงทะเบียนสินค้าและบาร์โค้ด", desc: "เพิ่มรายการสินค้า ยอดสต๊อกเริ่มต้น และระบุรหัสบาร์โค้ด" },
                  { step: "3", title: "เริ่มต้นขายสินค้าหน้าร้าน", desc: "เปิดแอปหรือเข้าเบราว์เซอร์แล้วใช้คิดเงินและตัดสต๊อกได้ทันที" }
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
              <h2 className="text-2xl font-bold text-slate-800 mb-6">ธุรกิจร้านค้าที่เหมาะสม</h2>
              <ul className="space-y-4">
                {[
                  "ร้านโชห่วย และร้านขายของชำทั่วไป",
                  "ร้านมินิมาร์ท และร้านสะดวกซื้อชุมชน",
                  "ร้านค้าปลีก-ค้าส่งขนาดเล็กถึงขนาดกลาง",
                  "ร้านขายเสื้อผ้า แฟชั่น และของกิ๊ฟช็อป",
                  "ร้านขายอุปกรณ์ไอที เครื่องเขียน หรือสินค้าเฉพาะทาง"
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
              {RETAIL_FAQS.map((faq, idx) => (
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
              <h2 className="text-3xl font-bold text-white mb-6">ยกระดับร้านโชห่วยและร้านค้าปลีกของคุณสู่ระบบดิจิทัล</h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                สมัครวันนี้ ใช้งานแผน Starter ได้ฟรี เพื่อยกระดับความสะดวกและแม่นยำให้ร้านคุณ
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
