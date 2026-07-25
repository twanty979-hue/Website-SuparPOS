import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, generateBreadcrumbJsonLd, generateFAQJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: "ระบบ POS ออนไลน์ ใช้ได้ทั้งแอปและเว็บ | SuparPOS",
  description: "ระบบ POS ออนไลน์ ทำงานผ่านระบบคลาวด์บนมือถือและแท็บเล็ต ปลอดภัย เช็คยอดได้ทุกที่ พร้อมระบบขายออฟไลน์ชั่วคราวหน้าร้านและซิงก์เมื่อต่อเน็ต เริ่มต้นฟรี",
  alternates: {
    canonical: "https://suparpos.com/online-offline-pos"
  },
  openGraph: {
    title: "ระบบ POS ออนไลน์ ใช้ได้ทั้งแอปและเว็บ | SuparPOS",
    description: "ระบบ POS ออนไลน์ ทำงานผ่านระบบคลาวด์บนมือถือและแท็บเล็ต ปลอดภัย เช็คยอดได้ทุกที่ พร้อมระบบขายออฟไลน์ชั่วคราวหน้าร้านและซิงก์เมื่อต่อเน็ต เริ่มต้นฟรี",
    url: "https://suparpos.com/online-offline-pos",
    siteName: "SuparPOS",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "ระบบ POS ออนไลน์ ใช้ได้ทั้งแอปและเว็บ | SuparPOS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ระบบ POS ออนไลน์ ใช้ได้ทั้งแอปและเว็บ | SuparPOS",
    description: "ระบบ POS ออนไลน์ ทำงานผ่านระบบคลาวด์บนมือถือและแท็บเล็ต ปลอดภัย เช็คยอดได้ทุกที่ พร้อมระบบขายออฟไลน์ชั่วคราวหน้าร้านและซิงก์เมื่อต่อเน็ต เริ่มต้นฟรี",
    images: ["/opengraph-image.png"],
  }
};

const ONLINE_FAQS = [
  {
    question: "ระบบ Cloud POS ของ SuparPOS ปลอดภัยสำหรับข้อมูลการขายขนาดไหน?",
    answer: "ปลอดภัยครับ ข้อมูลทั้งหมดของร้านค้าจะถูกจัดเก็บและเข้ารหัสบนระบบ Cloud Server มาตรฐานความปลอดภัยสูง (Supabase) ซึ่งได้รับความไว้วางใจในการเก็บข้อมูลและมีระบบสำรองข้อมูลอัตโนมัติ ช่วยลดความเสี่ยงเรื่องยอดขายหรือสต๊อกของร้านสูญหายหากเครื่อง POS หรือแท็บเล็ตหน้าร้านพังเสียหาย"
  },
  {
    question: "หากไม่มีเน็ตหรือสัญญาณขัดข้องชั่วคราว ระบบ POS ยังทำอะไรได้บ้าง?",
    answer: "ในส่วนการคิดเงินขายหน้าร้าน ระบบมีฟังก์ชันออฟไลน์ชั่วคราวเพื่อบันทึกรายการขายหน้าร้าน และคำนวณเงินทอนได้โดยไม่มีสะดุด และเมื่อมีอินเทอร์เน็ตกลับมาเชื่อมต่อ ระบบจะทำการดึงยอดขายและธุรกรรมเหล่านั้นซิงก์กลับขึ้นระบบคลาวด์ให้โดยอัตโนมัติทันที"
  },
  {
    question: "จำเป็นต้องใช้เครื่อง POS ราคาแพงในการรันระบบออนไลน์หรือไม่?",
    answer: "ไม่จำเป็นครับ ระบบของ SuparPOS มีความยืดหยุ่นสูง สามารถทำงานได้บนอุปกรณ์ที่หลากหลาย เช่น สมาร์ทโฟน Android/iOS (POS มือถือ) เครื่องแท็บเล็ต/iPad (POS แท็บเล็ต) หรือคอมพิวเตอร์พกพา เพื่อช่วยลดต้นทุนค่าฮาร์ดแวร์เริ่มต้นในการเปิดร้านใหม่"
  }
];

export default function OnlineOfflinePosPage() {
  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: "หน้าแรก", item: "https://suparpos.com" },
    { name: "ระบบ POS ออนไลน์ & ออฟไลน์", item: "https://suparpos.com/online-offline-pos" }
  ]);
  const faqSchema = generateFAQJsonLd(ONLINE_FAQS);

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
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mb-4 uppercase tracking-widest">Cloud & Offline Solution</span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight">
              ระบบ POS ออนไลน์ ใช้ได้ทั้งแอปและเว็บ
            </h1>
            <p className="mt-6 text-slate-600 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto">
              บริหารร้านค้าและดูยอดขายได้ทุกที่ทุกเวลาด้วยระบบ POS ออนไลน์ ทำงานบนระบบ Cloud POS และรองรับการคิดเงินหน้าร้านบนสมาร์ทโฟน POS มือถือ หรือแท็บเล็ต พร้อมฟังก์ชันโปรแกรมขายหน้าร้านออฟไลน์ชั่วคราวเพื่อความราบรื่นแม้ในยามไม่มีอินเทอร์เน็ต
            </p>
          </div>

          {/* Pain Points Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">ปัญหาของระบบคิดเงินแบบดั้งเดิมหน้าร้าน</h2>
              <div className="space-y-4">
                {[
                  { title: "ไม่อยู่ร้านแล้วไม่รู้ความเคลื่อนไหว", desc: "ต้องคอยโทรเช็คยอดขายกับพนักงานหน้าร้าน ไม่สามารถดูสถิติหรือปรับปรุงสต๊อกของจากที่อื่นได้" },
                  { title: "ข้อมูลพังเสียหาย กู้คืนไม่ได้", desc: "ใช้โปรแกรมติดตั้งในเครื่องคอมพิวเตอร์คอมพิวเตอร์พังทีเดียว ข้อมูลยอดขายและสต๊อกตลอดปีสูญหายทันที" },
                  { title: "เน็ตหลุดกะทันหัน ขายของต่อไม่ได้", desc: "ระบบคิดเงินแบบออนไลน์เต็มตัวที่ไม่มีฟังก์ชันสำรองออฟไลน์ จะค้างจนคิดเงินลูกค้าต่อไม่ได้คิวยาว" }
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
              <h2 className="text-2xl font-bold text-slate-800">แล้วระบบ Cloud & Offline ช่วยร้านคุณอย่างไร?</h2>
              <div className="space-y-4">
                {[
                  { title: "เช็คยอดขายบนระบบคลาวด์ได้ทุกที่", desc: "เจ้าของร้านล็อกอินดูยอดขายรวม วิเคราะห์การขายแบบเรียลไทม์ผ่านมือถือได้ตลอดเวลา" },
                  { title: "ระบบป้องกันและสำรองข้อมูลอัตโนมัติ", desc: "จัดเก็บข้อมูลบนเซิร์ฟเวอร์คลาวด์ที่ปลอดภัย ลดปัญหาข้อมูลสูญหายจากเหตุการณ์เครื่องหน้าร้านชำรุดเสียหาย" },
                  { title: "รองรับการคิดเงินออฟไลน์ชั่วคราว", desc: "แคชเชียร์คิดเงินหน้าร้านต่อได้ทันทีแม้เน็ตหลุด และระบบจะซิงก์ข้อมูลธุรกรรมให้เมื่อต่อเน็ตได้" }
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
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">ฟีเจอร์ระบบคลาวด์ออนไลน์และออฟไลน์</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "fa-cloud", title: "ระบบบริหารจัดการบนคลาวด์", desc: "จัดเก็บยอดขาย ข้อมูลเมนู และประวัติพนักงานบนคลาวด์ที่ปลอดภัย ตรวจสอบได้จากทุกอุปกรณ์" },
                { icon: "fa-mobile-screen-button", title: "POS มือถือ สะดวกใช้งาน", desc: "เปลี่ยนสมาร์ทโฟนของพนักงานให้กลายเป็นเครื่องรับออเดอร์และคิดเงินหน้าร้านได้อย่างยืดหยุ่น" },
                { icon: "fa-wifi-slash", title: "โหมดขายออฟไลน์ชั่วคราว", desc: "ระบบรองรับการบันทึกรายการและคำนวณการคิดเงินในขณะออฟไลน์หน้าร้านชั่วคราวอย่างรวดเร็ว" },
                { icon: "fa-arrows-rotate", title: "ระบบซิงก์ยอดขายอัตโนมัติ", desc: "ดึงข้อมูลการขายในช่วงออฟไลน์ขึ้นระบบคลาวด์ส่วนกลางให้อัตโนมัติเมื่อตรวจพบการต่อสัญญาณอินเทอร์เน็ต" },
                { icon: "fa-lock", title: "ความปลอดภัยของเซิร์ฟเวอร์", desc: "ใช้ฐานข้อมูลและการยืนยันตัวตนที่มีการเข้ารหัสและสำรองข้อมูลที่เป็นระเบียบอย่างสม่ำเสมอ" },
                { icon: "fa-receipt", title: "พิมพ์ใบเสร็จและแจ้งยอดขาย", desc: "เชื่อมต่อเครื่องพิมพ์ใบออเดอร์หรือใบเสร็จไร้สาย และแสดงยอดสถิติการรับชำระเงินของร้านได้อย่างสะดวก" }
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
              <h2 className="text-2xl font-bold text-slate-800 mb-6">3 ขั้นตอนง่ายๆ ในการบริหารร้าน</h2>
              <div className="space-y-6">
                {[
                  { step: "1", title: "ลงทะเบียนบัญชี SuparPOS", desc: "สร้างโปรไฟล์ร้านค้าผ่านสมาร์ทโฟน แท็บเล็ต หรือคอมพิวเตอร์ของคุณ" },
                  { step: "2", title: "ล็อกอินบนเครื่องขายหน้าร้าน", desc: "ใช้งานแอปแคชเชียร์หรือเข้าคิดเงินผ่านเบราว์เซอร์บนโทรศัพท์หรือแท็บเล็ต" },
                  { step: "3", title: "คิดเงินและตัดคลังทันที", desc: "เริ่มต้นขายสินค้าหน้าร้าน ระบบจะซิงก์ข้อมูลยอดขายขึ้นหน้าบอร์ดแบบเรียลไทม์" }
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
                  "ร้านค้าปลีกทั่วไป มินิมาร์ท และร้านค้าของชำโชห่วย",
                  "ร้านอาหาร คาเฟ่ และร้านกาแฟสดสไตล์ต่างๆ",
                  "ธุรกิจบริการหน้าร้าน คลินิก ร้านทำผม หรือร้านล้างรถ",
                  "ร้านค้าแบบมีเคาน์เตอร์คิดเงินหรือมีพนักงานเดินรับออเดอร์",
                  "ร้านค้าแบบพกพา เช่น ฟู้ดทรัค บูธแสดงงาน และคีออสขายสินค้า"
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
              {ONLINE_FAQS.map((faq, idx) => (
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
              <h2 className="text-3xl font-bold text-white mb-6">เริ่มต้นคิดเงินและตรวจสอบร้านผ่านคลาวด์ได้ฟรีวันนี้</h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                สมัครใช้แผน Starter ได้ฟรี เพื่อความปลอดภัยของข้อมูลคลังและยอดขายร้านค้าของคุณ
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
