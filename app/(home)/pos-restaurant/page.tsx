import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, generateBreadcrumbJsonLd, generateFAQJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: "โปรแกรมร้านอาหาร ระบบรับออเดอร์และจอครัว | SuparPOS",
  description: "โปรแกรมร้านอาหาร และระบบร้านอาหารครบวงจร ช่วยบริหารจัดการโต๊ะ รับออเดอร์ผ่านแท็บเล็ต/มือถือ หน้าจอในครัว (KDS) และแยกพิมพ์บิลแผนกครัว เริ่มต้นฟรี",
  alternates: {
    canonical: "https://suparpos.com/pos-restaurant"
  },
  openGraph: {
    title: "โปรแกรมร้านอาหาร ระบบรับออเดอร์และจอครัว | SuparPOS",
    description: "โปรแกรมร้านอาหาร และระบบร้านอาหารครบวงจร ช่วยบริหารจัดการโต๊ะ รับออเดอร์ผ่านแท็บเล็ต/มือถือ หน้าจอในครัว (KDS) และแยกพิมพ์บิลแผนกครัว เริ่มต้นฟรี",
    url: "https://suparpos.com/pos-restaurant",
    siteName: "SuparPOS",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "โปรแกรมร้านอาหาร ระบบรับออเดอร์และจอครัว | SuparPOS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "โปรแกรมร้านอาหาร ระบบรับออเดอร์และจอครัว | SuparPOS",
    description: "โปรแกรมร้านอาหาร และระบบร้านอาหารครบวงจร ช่วยบริหารจัดการโต๊ะ รับออเดอร์ผ่านแท็บเล็ต/มือถือ หน้าจอในครัว (KDS) และแยกพิมพ์บิลแผนกครัว เริ่มต้นฟรี",
    images: ["/opengraph-image.png"],
  }
};

const RESTAURANT_FAQS = [
  {
    question: "ระบบนี้รองรับการพิมพ์ใบสั่งอาหารแยกครัวและบาร์น้ำอย่างไร?",
    answer: "SuparPOS สามารถตั้งค่าแยกเครื่องพิมพ์ตามหมวดหมู่เมนูได้ครับ เช่น เมื่อมีการจิ้มสั่งออเดอร์อาหารและน้ำ ระบบจะส่งพิมพ์เมนูต้ม/ผัดไปที่ครัวร้อน และส่งเมนูเครื่องดื่มไปพิมพ์ที่บาร์น้ำโดยอัตโนมัติ ช่วยลดปัญหาพนักงานวิ่งส่งกระดาษบิล"
  },
  {
    question: "ระบบจอครัว (KDS) จำเป็นต้องมีอุปกรณ์เฉพาะทางไหม?",
    answer: "ไม่จำเป็นครับ ระบบจอครัว (Kitchen Display System) ของเราสามารถทำงานบนแท็บเล็ต Android หรือ iPad ทั่วไปที่มีการเชื่อมต่ออินเทอร์เน็ตได้ทันที ช่วยประหยัดค่าอุปกรณ์ให้ร้านอาหารได้เป็นอย่างดี"
  },
  {
    question: "สามารถเปิดจัดการโต๊ะอาหาร พักบิล หรือแยกบิลคิดเงินได้ไหม?",
    answer: "ได้ครับ ระบบมีฟังก์ชันบริหารผังโต๊ะอาหารอย่างครบครัน สามารถเปิดโต๊ะ สั่งอาหารเพิ่ม พักบิลชั่วคราว แยกบิลตามจำนวนคนนั่ง หรือโอนย้ายรายการออเดอร์ระหว่างโต๊ะได้อย่างสะดวกผ่านหน้าจอ POS"
  }
];

export default function PosRestaurantPage() {
  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: "หน้าแรก", item: "https://suparpos.com" },
    { name: "ระบบ POS ร้านอาหาร", item: "https://suparpos.com/pos-restaurant" }
  ]);
  const faqSchema = generateFAQJsonLd(RESTAURANT_FAQS);

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
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mb-4 uppercase tracking-widest">Restaurant Solution</span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight">
              โปรแกรมร้านอาหาร พร้อมระบบรับออเดอร์และจอครัว
            </h1>
            <p className="mt-6 text-slate-600 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto">
              บริหารจัดการโต๊ะและครัวอย่างเป็นระบบด้วยโปรแกรมร้านอาหาร และระบบร้านอาหาร ช่วยแก้ปัญหาออเดอร์ตกหล่นด้วยระบบรับออเดอร์ร้านอาหารผ่านมือถือ หน้าจอในครัว (KDS) สรุปบัญชียอดขาย และคุมสต๊อกวัตถุดิบอย่างสมบูรณ์แบบ
            </p>
          </div>

          {/* Pain Points Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">ปัญหาพบบ่อยในร้านอาหารทั่วไป</h2>
              <div className="space-y-4">
                {[
                  { title: "จดออเดอร์ผิดพลาดและตกหล่น", desc: "พนักงานจดออเดอร์ลงกระดาษ ลายมืออ่านยาก กระดาษบิลปลิวหาย หรือส่งเข้าครัวช้า" },
                  { title: "ครัวทำงานสับสน ปรุงอาหารผิดคิว", desc: "ในครัวสับสนลำดับการทำอาหาร อาหารโต๊ะหลังได้ก่อน อาหารโต๊ะแรกไม่ได้ทานสักที" },
                  { title: "สับสนเรื่องการจัดโต๊ะและเช็คบิล", desc: "เปิดโต๊ะซ้อนกัน เช็คบิลผิดโต๊ะ พักบิลไม่ได้ หรือสลับจานอาหารตอนยกไปเสิร์ฟ" }
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
              <h2 className="text-2xl font-bold text-slate-800">ยกระดับประสิทธิภาพด้วยระบบร้านอาหาร SuparPOS</h2>
              <div className="space-y-4">
                {[
                  { title: "รับออเดอร์เรียลไทม์ส่งตรงเข้าครัว", desc: "รับออเดอร์ผ่านแท็บเล็ตหน้าร้านหรือมือถือพนักงาน ระบบส่งออเดอร์พิมพ์เข้าครัวทันที" },
                  { title: "หน้าจออัปเดตงานครัว (KDS)", desc: "จอในครัวระบุโต๊ะ เมนู และออปชั่นอาหารอย่างเป็นระเบียบ พ่อครัวสามารถกดยืนยันอัปเดตงานได้" },
                  { title: "จัดการโต๊ะและบิลคิดเงินอย่างแม่นยำ", desc: "มีผังโต๊ะเช็คสถานะว่าโต๊ะไหนว่าง/ใช้งานอยู่ คิดเงินหน้าร้าน พักบิล แยกบิล สะดวกครบถ้วน" }
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
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">ฟีเจอร์เด่นเพื่อการจัดการร้านอาหาร</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "fa-chair", title: "ระบบผังโต๊ะอาหาร", desc: "สร้างและปรับแต่งแผนผังจำนวนโต๊ะได้ตามจริง แสดงสถานะว่างหรือกำลังรับประทานได้อย่างชัดเจน" },
                { icon: "fa-bell", title: "รับออเดอร์ไร้สาย", desc: "พนักงานสามารถใช้แท็บเล็ตเดินไปรับออเดอร์ที่โต๊ะลูกค้า อัปเดตรายการตรงสู่ส่วนกลาง" },
                { icon: "fa-fire-burner", title: "จอจัดการงานครัว (KDS)", desc: "หน้าจอแสดงผลรายการออเดอร์ในครัวแบบเรียลไทม์ เพื่อช่วยจัดคิวปรุงอาหารได้อย่างเป็นระบบ" },
                { icon: "fa-print", title: "แยกพิมพ์บิลห้องครัว", desc: "ระบบควบคุมการสั่งงานแยกเครื่องพิมพ์ใบส่งรายการออเดอร์ ไปยังส่วนครัวต่างๆ หรือบาร์น้ำได้อย่างราบรื่น" },
                { icon: "fa-wallet", title: "ระบบแคชเชียร์และแยกบิล", desc: "คิดเงินลูกค้าหน้าร้านได้อย่างรวดเร็ว รองรับการจ่ายเงินสด สแกน PromptPay พักบิล หรือคำนวณภาษี VAT" },
                { icon: "fa-chart-pie", title: "วิเคราะห์ยอดขายละเอียด", desc: "สรุปยอดรายรับในแต่ละวัน วิเคราะห์สัดส่วนเมนูขายดี ช่วงเวลาทำเงินของร้าน ช่วยวางแผนวัตถุดิบ" }
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
              <h2 className="text-2xl font-bold text-slate-800 mb-6">เริ่มต้นบริหารร้านอาหารใน 3 ขั้นตอน</h2>
              <div className="space-y-6">
                {[
                  { step: "1", title: "สมัครสร้างผังโต๊ะของร้าน", desc: "ลงทะเบียนบัญชี SuparPOS และตั้งค่าระบุจำนวนโต๊ะอาหารและโซนนั่งภายในร้าน" },
                  { step: "2", title: "นำเข้าข้อมูลเมนูอาหาร", desc: "เพิ่มเมนู ราคา รูปภาพ และจัดกลุ่มหมวดหมู่ เช่น อาหารคาว ของหวาน และเครื่องดื่ม" },
                  { step: "3", title: "เริ่มรับออเดอร์หน้าร้านและครัว", desc: "พนักงานจิ้มสั่งออเดอร์ส่งเข้าบาร์/ครัว และกดยืนยันคิดเงินที่จุดแคชเชียร์เมื่อเช็คบิล" }
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
                  "ร้านอาหารทั่วไป และร้านอาหารตามสั่งขนาดกลาง",
                  "ร้านบุฟเฟ่ต์ และร้านหมูกระทะ ชาบู ปิ้งย่าง",
                  "ร้านสเต็ก สวนอาหาร หรือร้านอาหารที่มีหลายโซนโต๊ะ",
                  "ร้านส้มตำ ร้านข้าวมันไก่ และร้านขายจานด่วน",
                  "คาเฟ่กึ่งร้านอาหารที่มีผังโต๊ะและบริการเสิร์ฟโต๊ะ"
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
              {RESTAURANT_FAQS.map((faq, idx) => (
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
              <h2 className="text-3xl font-bold text-white mb-6">เริ่มการคิดเงินและรับออเดอร์ในร้านอาหารอย่างราบรื่นวันนี้</h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                สมัครใช้งานแผน Starter ได้ฟรี เพื่อยกระดับความพึงพอใจของลูกค้าและพ่อครัวในครัวทันที
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
