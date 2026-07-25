import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, generateBreadcrumbJsonLd, generateFAQJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: "สแกนสั่งอาหารผ่าน QR Code | SuparPOS",
  description: "ระบบสแกนสั่งอาหารผ่าน QR Code และ QR Menu ช่วยให้ลูกค้าสแกนส่งออเดอร์เข้าครัวตรงจากโต๊ะผ่านสมาร์ทโฟนของตัวเอง ลดงานพนักงานจด เริ่มต้นใช้งานฟรี",
  alternates: {
    canonical: "https://suparpos.com/qr-ordering"
  },
  openGraph: {
    title: "สแกนสั่งอาหารผ่าน QR Code | SuparPOS",
    description: "ระบบสแกนสั่งอาหารผ่าน QR Code และ QR Menu ช่วยให้ลูกค้าสแกนส่งออเดอร์เข้าครัวตรงจากโต๊ะผ่านสมาร์ทโฟนของตัวเอง ลดงานพนักงานจด เริ่มต้นใช้งานฟรี",
    url: "https://suparpos.com/qr-ordering",
    siteName: "SuparPOS",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "สแกนสั่งอาหารผ่าน QR Code | SuparPOS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "สแกนสั่งอาหารผ่าน QR Code | SuparPOS",
    description: "ระบบสแกนสั่งอาหารผ่าน QR Code และ QR Menu ช่วยให้ลูกค้าสแกนส่งออเดอร์เข้าครัวตรงจากโต๊ะผ่านสมาร์ทโฟนของตัวเอง ลดงานพนักงานจด เริ่มต้นใช้งานฟรี",
    images: ["/opengraph-image.png"],
  }
};

const QR_FAQS = [
  {
    question: "ลูกค้าจำเป็นต้องโหลดแอปพลิเคชันเพื่อสแกนสั่งอาหารหรือไม่?",
    answer: "ไม่ต้องโหลดแอปครับ ลูกค้าสามารถใช้กล้องถ่ายรูปของมือถือทั่วไป หรือใช้แอปพลิเคชัน Line สแกน QR Code ประจำโต๊ะเพื่อเปิดหน้าเมนูออนไลน์ (QR Menu) และส่งออเดอร์เข้าครัวได้ทันทีผ่านเว็บบราวเซอร์บนมือถือ"
  },
  {
    question: "เมื่อลูกค้ากดสั่งอาหารแล้ว ชำระเงินออนไลน์จากหน้าจอมือถือได้เลยไหม?",
    answer: "ในระบบปัจจุบันยังไม่มีการรับชำระเงินออนไลน์โดยตรงจากหน้าจอเมนูของลูกค้าครับ เมื่อลูกค้าต้องการเช็คบิล พนักงานแคชเชียร์จะพิมพ์ใบเสร็จคิดเงินหน้าร้านจาก POS หรือแสดง QR Code PromptPay ของทางร้านที่จุดเช็คบิลแคชเชียร์เพื่อให้ลูกค้าสแกนจ่ายเงินครับ"
  },
  {
    question: "ระบบสแกนสั่งอาหารส่งออเดอร์แยกบาร์น้ำและครัวได้เหมือนกันไหม?",
    answer: "เหมือนกันครับ เมื่อลูกค้าสแกนโต๊ะและกดส่งรายการสั่งซื้อ ออเดอร์เหล่านั้นจะวิ่งเข้าระบบส่วนกลางหน้าร้าน และพิมพ์ใบเสร็จรายการอาหารแยกพิมพ์ครัว หรือแยกบาร์น้ำตามที่ทางร้านตั้งค่าไว้ทันทีครับ"
  }
];

export default function QrOrderingPage() {
  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: "หน้าแรก", item: "https://suparpos.com" },
    { name: "ระบบสแกนสั่งอาหาร QR Code", item: "https://suparpos.com/qr-ordering" }
  ]);
  const faqSchema = generateFAQJsonLd(QR_FAQS);

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
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mb-4 uppercase tracking-widest">QR Ordering Solution</span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight">
              ระบบสแกนสั่งอาหารผ่าน QR Code
            </h1>
            <p className="mt-6 text-slate-600 text-lg md:text-xl leading-relaxed max-w-4xl mx-auto">
              เพิ่มความสะดวกและทันสมัยให้ร้านอาหารด้วยระบบสแกนสั่งอาหารผ่าน QR Code และเมนูออนไลน์ QR Menu ให้ลูกค้าสแกนสั่งอาหารและเครื่องดื่มด้วยสมาร์ทโฟนของตัวเอง ออเดอร์ตรงเข้าหน้าจอแคชเชียร์และห้องครัวทันทีโดยไม่ต้องผ่านพนักงานจด
            </p>
          </div>

          {/* Pain Points Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">ปัญหาออเดอร์ของร้านอาหารช่วงลูกค้าแน่นร้าน</h2>
              <div className="space-y-4">
                {[
                  { title: "พนักงานรับออเดอร์ไม่ทัน คิวยาว", desc: "ลูกค้าโบกมือเรียกแต่พนักงานไม่ว่างคอยรับออเดอร์ ทำให้ลูกค้าเสียอารมณ์และรอนาน" },
                  { title: "จดออเดอร์ผิดพลาดบ่อย", desc: "พนักงานจดรายละเอียดผิด ฟังผิด หรือสลับโต๊ะ ทำให้ครัวปรุงเมนูอาหารผิดพลาด" },
                  { title: "ต้นทุนพนักงานเสิร์ฟสูงขึ้น", desc: "ต้องจ้างพนักงานเพิ่มขึ้นเพื่อบริการรับออเดอร์หน้าร้าน โดยเฉพาะร้านที่มีขนาดพื้นที่ใหญ่" }
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
              <h2 className="text-2xl font-bold text-slate-800">แล้วระบบ QR Ordering ช่วยอย่างไร?</h2>
              <div className="space-y-4">
                {[
                  { title: "ลูกค้าสแกนและส่งออเดอร์ได้เองทันที", desc: "ลดภาระการรอคอย พนักงานมีเวลาเตรียมเสิร์ฟอย่างเดียว ออเดอร์วิ่งเข้าครัวอัตโนมัติ" },
                  { title: "ระบุตัวเลือกเสริมได้อย่างแม่นยำ", desc: "ลูกค้าเลือกตัวเลือกเองอย่างชัดเจน เช่น ชาเย็นหวานน้อย หรือ เพิ่มท็อปปิ้งลดการสั่งผิดพลาด" },
                  { title: "ประหยัดต้นทุนแรงงานพนักงานจด", desc: "ระบบทำหน้าที่แทนคนจดออเดอร์ เหมาะสำหรับร้านค้าทุกขนาดในการปรับลดต้นทุนดำเนินการ" }
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
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">ฟีเจอร์ของระบบสแกนสั่งอาหาร QR Code</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "fa-qrcode", title: "สร้าง QR Code ประจำโต๊ะ", desc: "ระบบสามารถพิมพ์ QR Code แยกแต่ละโต๊ะออกไปแปะหน้าร้านหรือบนโต๊ะอาหารได้ง่ายๆ" },
                { icon: "fa-mobile-screen-button", title: "เปิดสั่งออเดอร์โดยตรง", desc: "ลูกค้าสแกนด้วยมือถือธรรมดาแล้วเด้งเปิดหน้าเว็บเพจรายการสั่งซื้อได้ทันที ไม่ต้องลงแอป" },
                { icon: "fa-fire-burner", title: "ส่งข้อมูลตรงเข้าจอครัว", desc: "รายการออเดอร์ที่ถูกกดสั่งจะวิ่งเข้าจอ KDS หรือแยกพิมพ์เข้าห้องครัวร้อนครัวเย็นแบบเรียลไทม์" },
                { icon: "fa-list-ul", title: "เมนูรูปภาพสวยงามน่ากิน", desc: "เจ้าของร้านสามารถจัดการเมนู ราคา และภาพสินค้าเพื่อกระตุ้นยอดขายต่อโต๊ะได้มากยิ่งขึ้น" },
                { icon: "fa-wallet", title: "แจ้งยอดเช็คบิลที่แคชเชียร์", desc: "การจ่ายเงินจะทำผ่านการคิดยอดจากจุดแคชเชียร์ส่วนกลาง ปลอดภัยสำหรับเจ้าของร้าน" },
                { icon: "fa-shield-halved", title: "ข้อมูลโต๊ะไม่มีผิดพลาด", desc: "ระบุความถูกต้องของตำแหน่งโต๊ะอาหาร ไม่เกิดการสับสนจานอาหารหรือคิดเงินสลับโต๊ะแน่นอน" }
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
              <h2 className="text-2xl font-bold text-slate-800 mb-6">ขั้นตอนการทำงาน</h2>
              <div className="space-y-6">
                {[
                  { step: "1", title: "สร้างโต๊ะอาหารในระบบ", desc: "ตั้งค่าจำนวนโต๊ะและปริ้นแผ่น QR Code ออกไปตั้งประจำตำแหน่งโต๊ะในร้าน" },
                  { step: "2", title: "ลูกค้าใช้โทรศัพท์สแกนโต๊ะ", desc: "ลูกค้าเข้ามานั่งที่โต๊ะ สแกนดูเมนู เลือกรายการออเดอร์ที่ต้องการ และกดส่งใบสั่งอาหาร" },
                  { step: "3", title: "ครัวดำเนินการปรุงและยกเสิร์ฟ", desc: "ครัวร้อนบาร์น้ำทำอาหารตามจอรับคิว และเช็คยอดจ่ายเงินสดหรือสแกน PromptPay ตอนจบกะโต๊ะ" }
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
                  "ร้านอาหารบุฟเฟ่ต์ ชาบู ปิ้งย่าง หรือหมูกระทะ",
                  "ร้านอาหารที่มีบริการโต๊ะนั่งหลายสาขาหรือสวนอาหารพื้นที่กว้าง",
                  "ร้านเบียร์ ร้านเหล้า และจุดแฮงเอาท์ตอนค่ำ",
                  "ร้านกาแฟ คาเฟ่ ที่บริการสั่งอาหารจากที่นั่ง",
                  "ร้านอาหารกึ่งผับบาร์ที่ต้องการอำนวยความสะดวดให้ลูกค้า"
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
              {QR_FAQS.map((faq, idx) => (
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
              <h2 className="text-3xl font-bold text-white mb-6">เพิ่มระบบสแกนสั่งอาหารและเมนูออนไลน์ให้ร้านคุณฟรีวันนี้</h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                ลดภาระของพนักงานและช่วยเพิ่มความพึงพอใจให้ลูกค้าของคุณได้ทันทีกับระบบ QR Ordering ของเรา
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
