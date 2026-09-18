import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, generateFAQJsonLd, generateOrganizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'โปรแกรม POS ฟรีตลอด ไม่มีวันหมดอายุ ไม่มีสัญญา | POS Foodscan',
  description: 'ใช้โปรแกรมขายหน้าร้าน POS ฟรีตลอดชีพ ไม่ต้องใส่บัตรเครดิต ไม่มีสัญญาผูกมัด ขายหน้าร้านไม่จำกัด พร้อมธีมร้านสวยงามกว่า 60 แบบ ฟรีทุกธีม',
  keywords: ['โปรแกรม pos ฟรี', 'ระบบ pos ฟรี', 'แอพ pos ฟรีตลอด', 'pos ไม่มีค่าใช้จ่าย', 'ระบบขายหน้าร้านฟรี', 'pos ไม่มีสัญญา', 'foodscan ฟรี'],
  alternates: { canonical: 'https://suparpos.com/free' },
  openGraph: {
    title: 'โปรแกรม POS ฟรีตลอด ไม่มีวันหมดอายุ | POS Foodscan',
    description: 'ขายหน้าร้านไม่จำกัด ธีมร้านฟรี 60+ แบบ ไม่ต้องผูกบัตร ไม่มีสัญญา',
    url: 'https://suparpos.com/free',
    type: 'website',
  },
};

const faqs = [
  {
    question: 'Free Plan ฟรีจริงไหม? มีวันหมดอายุไหม?',
    answer: 'ฟรีจริงครับ ไม่มีวันหมดอายุ ใช้งานได้ตลอดชีพ ไม่ใช่แค่ทดลองใช้ ขายหน้าร้านได้ไม่จำกัด ไม่มีค่าใช้จ่ายซ่อนเร้น',
  },
  {
    question: 'ต้องใส่บัตรเครดิตหรือข้อมูลการชำระเงินไหมตอนสมัคร?',
    answer: 'ไม่ต้องเลยครับ สมัครด้วยอีเมลและรหัสผ่านเท่านั้น ไม่ต้องผูกบัตร ไม่มีการหักเงินอัตโนมัติ',
  },
  {
    question: 'Free Plan ขายหน้าร้านได้กี่ครั้ง?',
    answer: 'ขายหน้าร้านผ่านระบบ POS ได้ไม่จำกัดทุกวัน ส่วนระบบ QR สแกนสั่งอาหารจำกัดที่ 1,000 ออเดอร์ต่อเดือน',
  },
  {
    question: 'ธีมร้านฟรีหมายความว่าอะไร?',
    answer: 'ธีมร้านทั้งหมดในระบบ 60+ แบบ เปิดให้ใช้ฟรีทุกแพ็กเกจรวมถึง Free Plan ไม่ต้องซื้อแยก เลือกใช้ได้เลย',
  },
  {
    question: 'ถ้าอยากเลิกใช้หรืออัปเกรด ต้องทำอะไรบ้าง?',
    answer: 'ไม่มีสัญญาผูกมัดครับ จะเลิกใช้เมื่อไหรก็ได้ทันที ไม่มีค่าปรับ ไม่มีค่าใช้จ่ายในการยกเลิก อัปเกรดหรือดาวน์เกรดได้เสมอ',
  },
  {
    question: 'Free Plan ใช้ได้กับอุปกรณ์ไหนบ้าง?',
    answer: 'ใช้ได้ทุกอุปกรณ์ครับ ทั้ง iPhone (iOS), Android, และ Windows PC/Tablet ไม่จำกัดอุปกรณ์',
  },
];

const freeFeatures = [
  { icon: 'fa-cash-register', title: 'ขายหน้าร้าน (POS)', desc: 'ไม่จำกัด', highlight: true },
  { icon: 'fa-palette', title: 'ธีมร้านสวยงาม', desc: 'ฟรีกว่า 60 แบบ', highlight: true },
  { icon: 'fa-qrcode', title: 'QR สแกนสั่งอาหาร', desc: '1,000 ออเดอร์/เดือน', highlight: false },
  { icon: 'fa-chart-bar', title: 'Dashboard รายงาน', desc: 'ย้อนหลัง 30 วัน', highlight: false },
  { icon: 'fa-mobile-screen', title: 'ทุกอุปกรณ์', desc: 'iOS, Android, Windows', highlight: false },
  { icon: 'fa-wifi-slash', title: 'ใช้ออฟไลน์ได้', desc: 'ขายได้แม้ไม่มีเน็ต', highlight: false },
  { icon: 'fa-shield-check', title: 'ข้อมูลปลอดภัย', desc: 'เก็บใน Cloud', highlight: false },
  { icon: 'fa-infinity', title: 'ไม่มีวันหมดอายุ', desc: 'ฟรีตลอดชีพ', highlight: true },
];

export default function FreePlanPage() {
  return (
    <>
      <JsonLd data={generateFAQJsonLd(faqs)} />
      <JsonLd data={generateOrganizationJsonLd()} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'POS Foodscan Free Plan — โปรแกรม POS ฟรีตลอดชีพ',
        description: 'ใช้โปรแกรมขายหน้าร้านฟรีตลอดชีพ ไม่มีวันหมดอายุ ไม่มีสัญญา ขายหน้าร้านไม่จำกัด ธีมร้านฟรีทุกแบบ',
        url: 'https://suparpos.com/free',
        brand: { '@type': 'Brand', name: 'POS Foodscan' },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'THB',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2030-12-31',
          description: 'ฟรีตลอดชีพ ไม่มีวันหมดอายุ',
          url: 'https://suparpos.com/register',
        },
      }} />

      <main className="pt-20 min-h-screen bg-white">

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20 px-6 lg:px-12">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
              <i className="fa-solid fa-infinity text-xs"></i>
              ไม่ใช่แค่ทดลองใช้ — ฟรีตลอดชีพ
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 leading-tight mb-6">
              โปรแกรม POS{' '}
              <span className="text-emerald-500">ฟรีตลอด</span>
              <br />
              <span className="text-3xl md:text-4xl text-slate-600 font-bold">ไม่มีวันหมดอายุ ไม่มีสัญญา</span>
            </h1>

            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              ขายหน้าร้านได้ทันที ไม่ต้องใส่บัตรเครดิต ไม่มีค่าใช้จ่ายซ่อนเร้น
              พร้อมธีมร้านสวยงามกว่า <strong className="text-emerald-600">60 แบบ ฟรีทุกธีม</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <i className="fa-solid fa-sparkles text-amber-300"></i>
                สมัครฟรีเลย — ไม่ต้องใส่บัตร
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold text-lg rounded-2xl hover:bg-slate-50 transition-all"
              >
                ดูแพ็กเกจทั้งหมด
                <i className="fa-solid fa-arrow-right text-sm"></i>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle-check text-emerald-500"></i> ไม่ต้องใส่บัตรเครดิต</span>
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle-check text-emerald-500"></i> ไม่มีสัญญาผูกมัด</span>
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle-check text-emerald-500"></i> ยกเลิกได้ทุกเมื่อ</span>
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-circle-check text-emerald-500"></i> ฟรีตลอดชีพ</span>
            </div>
          </div>
        </section>

        {/* สิ่งที่ได้ใน Free Plan */}
        <section className="py-20 px-6 lg:px-12 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
                สิ่งที่ได้ใน <span className="text-emerald-500">Free Plan</span>
              </h2>
              <p className="text-slate-500 text-lg">ใช้งานได้เลยทันที ไม่มีข้อจำกัดด้านเวลา</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {freeFeatures.map((f, i) => (
                <div
                  key={i}
                  className={`relative p-5 rounded-2xl border text-center transition-all ${
                    f.highlight
                      ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                      : 'bg-white border-slate-100 hover:border-emerald-100 hover:shadow-sm'
                  }`}
                >
                  {f.highlight && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ไฮไลท์
                    </div>
                  )}
                  <div className={`w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center ${f.highlight ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    <i className={`fa-solid ${f.icon} ${f.highlight ? 'text-emerald-600' : 'text-slate-500'}`}></i>
                  </div>
                  <p className="font-bold text-slate-800 text-sm mb-1">{f.title}</p>
                  <p className={`text-xs font-medium ${f.highlight ? 'text-emerald-600' : 'text-slate-500'}`}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* เปรียบเทียบ */}
        <section className="py-20 px-6 lg:px-12 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-800 mb-4">
                ต่างจากเจ้าอื่นอย่างไร?
              </h2>
              <p className="text-slate-500">เราไม่ใช่แค่ทดลองใช้ — เราให้ฟรีจริงๆ</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="py-4 px-5 text-left font-bold">ฟีเจอร์</th>
                    <th className="py-4 px-5 text-center font-bold text-emerald-400">POS Foodscan</th>
                    <th className="py-4 px-5 text-center font-bold text-slate-400">เจ้าอื่นทั่วไป</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['ฟรีพลาน', 'ฟรีตลอดชีพ', 'ทดลอง 7-30 วัน'],
                    ['ขายหน้าร้าน', 'ไม่จำกัด', 'จำกัดจำนวน'],
                    ['ธีมร้าน', 'ฟรีทุกธีม 60+ แบบ', 'ต้องซื้อแยก'],
                    ['ใส่บัตรเครดิต', 'ไม่ต้อง', 'มักต้องผูกบัตร'],
                    ['สัญญา', 'ไม่มี', 'มักมีสัญญารายปี'],
                    ['ยกเลิก', 'ได้ทันที ไม่มีค่าปรับ', 'อาจมีค่าปรับ'],
                  ].map(([feature, ours, others], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-3.5 px-5 font-medium text-slate-700">{feature}</td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                          <i className="fa-solid fa-circle-check text-xs"></i>
                          {ours}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center text-slate-400">{others}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 lg:px-12 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-800 mb-4">คำถามที่พบบ่อย</h2>
              <p className="text-slate-500">เกี่ยวกับ Free Plan ของเรา</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                  <h3 className="font-bold text-slate-800 mb-2 flex items-start gap-2">
                    <i className="fa-solid fa-circle-question text-emerald-500 mt-0.5 shrink-0"></i>
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed pl-6">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Bottom */}
        <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-4">พร้อมใช้งานแล้วใช่ไหม?</h2>
            <p className="text-emerald-100 text-lg mb-8">สมัครฟรีวันนี้ ไม่ต้องใส่บัตร เริ่มขายได้ทันที</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2.5 px-10 py-4 bg-white text-emerald-600 font-black text-lg rounded-2xl hover:bg-emerald-50 transition-all shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              <i className="fa-solid fa-sparkles text-amber-400"></i>
              สมัครใช้งานฟรีตอนนี้
            </Link>
            <p className="text-emerald-200 text-sm mt-4">ไม่ต้องใส่บัตรเครดิต · ไม่มีสัญญา · ฟรีตลอดชีพ</p>
          </div>
        </section>

      </main>
    </>
  );
}
