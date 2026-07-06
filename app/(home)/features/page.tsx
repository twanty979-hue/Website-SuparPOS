// app/(home)/features/page.tsx
import Link from 'next/link';
import { getMarketplaceDataAction } from '@/app/actions/marketplaceActions'; // ⚠️ ตรวจสอบ path
import ThemeShowcase from '@/components/ThemeShowcase';

export default async function FeaturesPage() {
  
  // 1. ดึงข้อมูลธีมจาก Server (เฉพาะ 6 อันแรกมาโชว์เป็นตัวอย่าง)
  const { themes, success } = await getMarketplaceDataAction();
  const displayThemes = success ? themes.slice(0, 6) : [];

  const features = [
    {
      icon: "fa-qrcode",
      color: "text-emerald-500",
      bg: "bg-emerald-100",
      title: "ระบบสั่งอาหารผ่าน QR Code",
      desc: "ลดงานพนักงานเสิร์ฟ ลูกค้าสแกนปุ๊บ สั่งปั๊บ ออเดอร์ส่งตรงเข้าครัวทันที ไม่ต้องรอจด"
    },
    {
      icon: "fa-fire-burner",
      color: "text-orange-500",
      bg: "bg-orange-100",
      title: "ระบบจัดการครัว (KDS)",
      desc: "หน้าจอสำหรับพ่อครัว ออเดอร์เด้ง Real-time แยกโต๊ะ แยกเมนูชัดเจน ลดความผิดพลาดในการทำอาหาร"
    },
    {
      icon: "fa-chart-line",
      color: "text-purple-500",
      bg: "bg-purple-100",
      title: "Dashboard ยอดขายเรียลไทม์",
      desc: "ดูยอดขายได้ทุกที่ทุกเวลา วิเคราะห์เมนูขายดี ช่วงเวลาลูกค้าเยอะ ช่วยให้คุณวางแผนธุรกิจได้แม่นยำ"
    },
    {
      icon: "fa-utensils",
      color: "text-green-500",
      bg: "bg-green-100",
      title: "จัดการเมนูได้ดั่งใจ",
      desc: "เพิ่ม/ลด เมนู แก้ไขราคา หรือเปลี่ยนรูปภาพได้เองทันที จัดหมวดหมู่เมนูให้สวยงามน่าสั่ง"
    },
    {
      icon: "fa-users-gear",
      color: "text-teal-500",
      bg: "bg-teal-100",
      title: "ระบบจัดการพนักงาน",
      desc: "กำหนดสิทธิ์การเข้าถึงของพนักงานแต่ละคน (ผู้จัดการ, แคชเชียร์, พนักงานเสิร์ฟ) เพื่อความปลอดภัยของข้อมูล"
    },
    {
      icon: "fa-print",
      color: "text-slate-500",
      bg: "bg-slate-200",
      title: "รองรับการพิมพ์ใบเสร็จ",
      desc: "เชื่อมต่อกับเครื่องพิมพ์ใบเสร็จได้ (Thermal Printer) เพื่อพิมพ์รายการอาหารหรือใบเสร็จรับเงินให้ลูกค้า"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-white py-20 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-100/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">
            ฟีเจอร์ที่ช่วยให้ร้านคุณ <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">"โปร"</span> กว่าใคร
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            SuparPOS ไม่ใช่แค่เมนูออนไลน์ แต่คือระบบปฏิบัติการร้านอาหารครบวงจร
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <i className={`fa-solid ${feature.icon} text-3xl ${feature.color}`}></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* 🔥🔥 THEME SHOWCASE SECTION (ส่วนที่เพิ่มเข้ามา) 🔥🔥 */}
        <div className="mb-24 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[3rem] -rotate-1 opacity-5 scale-105 transform"></div>
            <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 md:p-12 shadow-2xl shadow-emerald-200/50">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 px-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
                            สวย จบ ในคลิกเดียว
                        </h2>
                        <p className="text-slate-500 text-lg">
                            เปลี่ยนสไตล์ร้านอาหารของคุณได้ทันที ไม่ต้องเขียนโค้ด
                        </p>
                    </div>
                    <Link href="/register" className="hidden md:flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-6 py-3 rounded-full hover:bg-emerald-100 transition-colors">
                        ดูธีมทั้งหมด <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                </div>
                
                {/* ใส่ Component Slider ตรงนี้ */}
                <ThemeShowcase themes={displayThemes} />
                
                <div className="mt-8 text-center md:hidden">
                    <Link href="/register" className="inline-flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-6 py-3 rounded-full hover:bg-emerald-100 transition-colors">
                        ดูธีมทั้งหมด <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                </div>
            </div>
        </div>


        {/* Feature Highlight Sections */}
        <div className="space-y-20">
          
          {/* Highlight 1 */}
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="w-full md:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-emerald-500/20 transform hover:scale-[1.02] transition-transform">
              <i className="fa-solid fa-mobile-screen-button text-6xl mb-6 opacity-80"></i>
              <h2 className="text-3xl font-bold mb-4">ใช้งานได้ทุกอุปกรณ์</h2>
              <p className="text-emerald-100 text-lg leading-relaxed">
                ไม่ต้องลงทุนซื้อเครื่อง POS ราคาแพง! SuparPOS ใช้งานได้บนมือถือ แท็บเล็ต iPad หรือคอมพิวเตอร์เครื่องเดิมของคุณได้ทันที ขอแค่มีอินเทอร์เน็ต
              </p>
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">สะดวก ยืดหยุ่น ไร้ข้อจำกัด</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-600">
                  <i className="fa-solid fa-circle-check text-green-500"></i>
                  รองรับ iOS และ Android
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <i className="fa-solid fa-circle-check text-green-500"></i>
                  ข้อมูลเชื่อมต่อกันแบบ Real-time
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <i className="fa-solid fa-circle-check text-green-500"></i>
                  เจ้าของร้านดูยอดได้แม้ไม่อยู่ที่ร้าน
                </li>
              </ul>
            </div>
          </div>

          {/* Highlight 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16">
            <div className="w-full md:w-1/2 bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <i className="fa-solid fa-shield-halved text-2xl"></i>
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800">ความปลอดภัยสูงสุด</h2>
              </div>
              <p className="text-slate-500 text-lg leading-relaxed mb-6">
                เราใช้เทคโนโลยี Cloud Server มาตรฐานระดับโลก (Supabase) ข้อมูลของคุณจะถูกเข้ารหัสและสำรองข้อมูลอัตโนมัติ มั่นใจได้ว่าข้อมูลการขายและลูกค้าจะไม่สูญหาย
              </p>
            </div>
             <div className="w-full md:w-1/2">
               <h3 className="text-2xl font-bold text-slate-800 mb-4">ทำไมต้อง SuparPOS?</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                เพราะเราเข้าใจปัญหาของร้านอาหาร ทั้งเรื่องออเดอร์ตกหล่น การทุจริต หรือการสรุปยอดบัญชีที่ยุ่งยาก เราจึงออกแบบระบบมาเพื่อแก้ปัญหาเหล่านี้โดยเฉพาะ
              </p>
              <Link href="/register" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all">
                ทดลองใช้งานฟรี <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>

        </div>

        {/* CTA Footer */}
        <div className="mt-24 text-center bg-emerald-600 rounded-[2rem] p-12 relative overflow-hidden shadow-2xl shadow-emerald-500/30">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">พร้อมเปลี่ยนร้านธรรมดา ให้เป็นร้านดิจิทัลหรือยัง?</h2>
            <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
              สมัครวันนี้ ใช้งานฟรีตลอดชีพสำหรับร้านขนาดเล็ก ไม่ต้องผูกบัตรเครดิต
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="bg-white text-emerald-600 font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all active:scale-95"
              >
                เริ่มต้นใช้งานฟรี
              </Link>
              <Link 
                href="/pricing" 
                className="bg-emerald-700/50 border border-emerald-400 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-emerald-700 transition-all"
              >
                ดูราคาแพ็กเกจ
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}