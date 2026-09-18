'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/* ─────────────────────────────────────────────────────────────
   🖼️ แบนเนอร์ 5 รูปด้านบนสุด (สลับอัตโนมัติ คลีน สวยงาม)
   ───────────────────────────────────────────────────────────── */
const BANNERS = [
  { id: 1, src: '/images/genai-banner-01.png', alt: 'POS All-in-One ขายได้ครบบนอุปกรณ์ที่คุณใช้' },
  { id: 2, src: '/images/genai-banner-02.png', alt: 'เครื่อง POS พร้อมระบบจัดการร้านค้าครบวงจร' },
  { id: 3, src: '/images/genai-banner-03.png', alt: 'รับชำระเงินง่าย จบการขายพร้อมใบเสร็จทันที' },
  { id: 4, src: '/images/genai-banner-04.png', alt: 'สแกนสินค้าเพิ่มรายการและจัดการสต๊อกรวดเร็ว' },
  { id: 5, src: '/images/genai-banner-05.png', alt: 'เพิ่มสินค้าและปรับแต่งเมนูได้ง่าย สวยงาม' },
];

/* ─────────────────────────────────────────────────────────────
   📸 รวม 12 ภาพถ่ายสินค้าจริง ครบเซ็ตพร้อมเปิดร้าน
   (เครื่อง 2 จอ + ลิ้นชักคิดเงิน + สแกนเนอร์ + พิมพ์ในตัว)
   ───────────────────────────────────────────────────────────── */
const PRODUCT_IMAGES = [
  {
    id: 1,
    src: '/images/products/pos-package-01.png',
    title: 'เครื่อง POS All-in-One OEM รุ่น 2 จอ พร้อมพิมพ์ใบเสร็จในตัว',
    subtitle: 'เหมาะสำหรับร้านอาหาร คาเฟ่ และร้านค้าปลีกทุกประเภท',
  },
  {
    id: 2,
    src: '/images/products/pos-package-11.png',
    title: 'ชุดครบเซ็ต: เครื่อง POS 2 จอ + ลิ้นชักคิดเงิน (เปิด) + สแกนเนอร์',
    subtitle: 'พร้อมลิ้นชักคิดเงิน 5 ช่องธนบัตร และเครื่องสแกนบาร์โค้ด QR Code',
  },
  {
    id: 3,
    src: '/images/products/pos-package-12.png',
    title: 'ชุดครบเซ็ต: เครื่อง POS 2 จอ + ลิ้นชักคิดเงิน (ปิด) + สแกนเนอร์',
    subtitle: 'โครงสร้างโลหะแข็งแรง จัดวางบนเคาน์เตอร์ได้อย่างสวยงามลงตัว',
  },
  {
    id: 4,
    src: '/images/products/pos-package-02.png',
    title: 'ระบบสแกนสั่งอาหารและปรับแต่งเมนูตามสไตล์ร้าน',
    subtitle: 'รองรับการสั่งอาหารผ่าน QR Code จากโต๊ะลูกค้า',
  },
  {
    id: 5,
    src: '/images/products/pos-package-03.png',
    title: 'ระบบขายหน้าร้าน คล่องตัว จบบิลสะดวกรวดเร็ว',
    subtitle: 'หน้าจอสัมผัสใช้งานง่าย พนักงานเรียนรู้ได้ทันที',
  },
  {
    id: 6,
    src: '/images/products/pos-package-04.png',
    title: 'ระบบ POS ครบเซ็ต รองรับอุปกรณ์พ่วงทุกชนิด',
    subtitle: 'เชื่อมต่อแท็บเล็ต มือถือ และเครื่องสแกนได้ครบถ้วน',
  },
  {
    id: 7,
    src: '/images/products/pos-package-05.png',
    title: 'มุมมองด้านหน้าตัวเครื่อง รุ่น 2 จอ ดีไซน์ทันสมัย',
    subtitle: 'หน้าจอสัมผัสกว้าง พร้อมช่องจ่ายใบเสร็จด้านหน้า',
  },
  {
    id: 8,
    src: '/images/products/pos-package-06.png',
    title: 'ตัวเครื่องสีดำพรีเมียม โครงสร้างแข็งแรงทนทาน',
    subtitle: 'ประเภทซุ้มในร่ม รองรับการทำงานหนักหน้าร้านตลอดทั้งวัน',
  },
  {
    id: 9,
    src: '/images/products/pos-package-07.png',
    title: 'สเปกเครื่อง: RAM 8GB DDR3 / CPU Dual-Core 1.7GHz',
    subtitle: 'จอ LCD 1366x768 รองรับ Android และ Windows 10',
  },
  {
    id: 10,
    src: '/images/products/pos-package-08.png',
    title: 'มุมมองด้านข้างและฐานตั้ง มั่นคง ไม่โยกเยก',
    subtitle: 'จัดวางบนเคาน์เตอร์ได้ลงตัว ประหยัดพื้นที่',
  },
  {
    id: 11,
    src: '/images/products/pos-package-09.png',
    title: 'หน้าจอสัมผัส LCD คมชัด ลูกค้ามองเห็นบิลชัดเจน',
    subtitle: 'ความละเอียด 1366 × 768 พิกเซล สีสันสดใส',
  },
  {
    id: 12,
    src: '/images/products/pos-package-10.png',
    title: 'เครื่องพิมพ์ใบเสร็จความร้อนในตัว ไม่ต้องใช้หมึก',
    subtitle: 'ตัดกระดาษไว พิมพ์โลโก้ร้านและ QR พร้อมเพย์ได้ทันที',
  },
];

/* ─────────────────────────────────────────────────────────────
   📋 สเปกสินค้าละเอียด
   ───────────────────────────────────────────────────────────── */
const SPECS = [
  { label: 'ชื่อยี่ห้อ / แบรนด์', value: 'OEM' },
  { label: 'รุ่นตัวเครื่อง', value: 'รุ่น 2 จอ (Dual Screen Touch)' },
  { label: 'หน่วยความจำ (RAM)', value: '8GB DDR3' },
  { label: 'หน่วยประมวลผล (CPU)', value: 'ดูอัลคอร์ (Dual-Core) 1.7GHz' },
  { label: 'ประเภทหน้าจอ', value: 'จอแอลซีดี (LCD Touch Screen)' },
  { label: 'ความละเอียดหน้าจอ', value: '1366 × 768 พิกเซล' },
  { label: 'ระบบปฏิบัติการ', value: 'แอนดรอยด์ (Android) / วินโดวส์ 10 (Windows 10)' },
  { label: 'ประเภทการชำระเงิน / ซุ้ม', value: 'ซุ้มชำระเงินในร่ม (Indoor Payment Kiosk)' },
  { label: 'ประเภทการติดตั้ง', value: 'ขาตั้งพื้น / ขาตั้งเคาน์เตอร์ แข็งแรงมั่นคง' },
  { label: 'เครื่องพิมพ์ใบเสร็จ', value: 'Thermal Receipt Printer ในตัว (ไม่ใช้หมึก)' },
  { label: 'ชิ้นส่วนเสริมที่รองรับ', value: 'เครื่องพิมพ์บาร์โค้ด, Card Reader, สแกนเนอร์, ลิ้นชักเก็บเงิน' },
  { label: 'ฟังก์ชัน', value: 'SDK รองรับการเชื่อมต่อและพัฒนา' },
  { label: 'วัสดุตัวเครื่อง', value: 'วัสดุคุณภาพสูง ทนทานต่อการใช้งานหน้าร้าน' },
  { label: 'แหล่งกำเนิดสินค้า', value: 'Guangdong, China' },
];

/* ─────────────────────────────────────────────────────────────
   🎁 ของแถมสุดพิเศษที่ได้รับในชุด
   ───────────────────────────────────────────────────────────── */
const BONUSES = [
  {
    icon: 'fa-solid fa-crown',
    color: 'text-amber-500 bg-amber-50 border-amber-200',
    title: 'ฟรี! ระบบ POS Foodscan ตัว Pro 1 ปีเต็ม',
    value: 'มูลค่า ฿6,000',
    desc: 'ปลดล็อกทุกฟีเจอร์ จัดการโต๊ะ สแกน QR สั่งอาหาร สต๊อกวัตถุดิบ บิลแยก และรายงาน Real-time',
  },
  {
    icon: 'fa-solid fa-barcode',
    color: 'text-blue-500 bg-blue-50 border-blue-200',
    title: 'ฟรี! เครื่องสแกนเนอร์ (Barcode & QR Code)',
    value: 'มูลค่า ฿1,500',
    desc: 'สแกนไว ยิงบาร์โค้ดสินค้าและสแกน QR Code บนจอมือถือได้สะดวกรวดเร็ว',
  },
  {
    icon: 'fa-solid fa-cash-register',
    color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
    title: 'ฟรี! ลิ้นชักคิดเงิน / ลิ้นชักเก็บเงินไฟฟ้า',
    value: 'มูลค่า ฿1,800',
    desc: 'ลิ้นชักเหล็กหนา 5 ช่องธนบัตร เด้งเปิดอัตโนมัติเมื่อพิมพ์ใบเสร็จรับเงิน',
  },
  {
    icon: 'fa-solid fa-print',
    color: 'text-purple-500 bg-purple-50 border-purple-200',
    title: 'ฟรี! เครื่องพิมพ์ใบเสร็จความร้อนในตัว',
    value: 'รวมในเครื่อง',
    desc: 'พิมพ์ไว ตัดกระดาษเร็ว ไม่ต้องซื้อหมึกตลอดอายุการใช้งาน',
  },
];

export default function ShopClient() {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isBannerPaused, setIsBannerPaused] = useState(false);

  // Gallery state (12 รูป)
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Popup Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const [copiedLine, setCopiedLine] = useState(false);

  // เปลี่ยนแบนเนอร์อัตโนมัติทุก 4 วินาที
  useEffect(() => {
    if (isBannerPaused) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isBannerPaused]);

  // คีย์บอร์ดนำทางใน Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
      if (isModalOpen) {
        if (e.key === 'ArrowLeft') {
          setModalImageIndex((prev) => (prev - 1 + PRODUCT_IMAGES.length) % PRODUCT_IMAGES.length);
        }
        if (e.key === 'ArrowRight') {
          setModalImageIndex((prev) => (prev + 1) % PRODUCT_IMAGES.length);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handlePrevBanner = () => {
    setActiveBannerIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  };

  const handleNextBanner = () => {
    setActiveBannerIndex((prev) => (prev + 1) % BANNERS.length);
  };

  const handleCopyLine = () => {
    navigator.clipboard.writeText('bs_boll');
    setCopiedLine(true);
    setTimeout(() => setCopiedLine(false), 2500);
  };

  const openModalWithImage = (index: number) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 🧭 Navbar */}
      <Navbar />

      {/* ─────────────────────────────────────────────────────────────
          🌟 1. BANNER SLIDER ด้านบนสุด (คลีน เพียว ไม่รก ไม่บังรูป)
          ───────────────────────────────────────────────────────────── */}
      <section className="pt-20 sm:pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-white group select-none transition-shadow hover:shadow-xl"
          style={{ aspectRatio: '1983 / 793' }}
          onMouseEnter={() => setIsBannerPaused(true)}
          onMouseLeave={() => setIsBannerPaused(false)}
        >
          {BANNERS.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === activeBannerIndex
                  ? 'opacity-100 z-10'
                  : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.src}
                alt={banner.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* ปุ่มลูกศรซ้าย / ขวา */}
          <button
            onClick={handlePrevBanner}
            aria-label="Previous Banner"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/85 hover:bg-white text-slate-700 shadow-md backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105"
          >
            <i className="fa-solid fa-chevron-left text-xs sm:text-sm"></i>
          </button>
          <button
            onClick={handleNextBanner}
            aria-label="Next Banner"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/85 hover:bg-white text-slate-700 shadow-md backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105"
          >
            <i className="fa-solid fa-chevron-right text-xs sm:text-sm"></i>
          </button>

          {/* จุด Dot Indicator */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveBannerIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  i === activeBannerIndex
                    ? 'w-5 h-1.5 bg-white shadow-sm'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/90'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          🛍️ 2. สินค้าชิ้นเอก: เครื่อง POS OEM รุ่น 2 จอ All-in-One
          ราคา 12,499 บาท + แถมฟรีระบบโปร 1 ปี + สแกนเนอร์ + ลิ้นชักคิดเงิน
          ───────────────────────────────────────────────────────────── */}
      <section className="pt-6 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* หัวข้อส่วนสินค้า */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <i className="fa-solid fa-fire text-xs text-rose-500"></i> เซ็ตสุดคุ้มพร้อมเปิดร้าน
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                <i className="fa-solid fa-gift text-xs"></i> ของแถมมูลค่ากว่า ฿9,300
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              เครื่อง POS OEM รุ่น 2 จอ (Dual Screen) All-in-One
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              รวม 12 รูปถ่ายสินค้าจริง • คลิกที่รูปหรือปุ่มเพื่อเปิดป็อปอัปดูภาพขยายและสเปกละเอียด (สั่งซื้อผ่าน LINE: bs_boll)
            </p>
          </div>

          <a
            href="https://line.me/ti/p/~bs_boll"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all self-start sm:self-auto"
          >
            <i className="fa-brands fa-line text-lg"></i>
            <span>LINE: bs_boll</span>
          </a>
        </div>

        {/* ── การ์ดสินค้า Showcase ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* ฝั่งซ้าย: แกลเลอรีรูปภาพ (12 รูป) */}
            <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-50/70 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between">
              {/* ภาพหลักที่เลือกอยู่ (คลิกแล้วเปิดป๊อปอัป) */}
              <div
                className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md cursor-pointer group"
                onClick={() => openModalWithImage(activeImageIndex)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PRODUCT_IMAGES[activeImageIndex].src}
                  alt={PRODUCT_IMAGES[activeImageIndex].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badge เลขรูป */}
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md">
                  <i className="fa-solid fa-images text-xs text-emerald-400"></i>
                  <span>{activeImageIndex + 1} / {PRODUCT_IMAGES.length}</span>
                </div>

                {/* Badge ขยายภาพ */}
                <div className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-700 p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all group-hover:scale-110">
                  <i className="fa-solid fa-magnifying-glass-plus text-sm"></i>
                </div>

                {/* แถบคำบรรยายใต้ภาพ */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
                  <p className="text-sm font-bold drop-shadow">
                    {PRODUCT_IMAGES[activeImageIndex].title}
                  </p>
                  <p className="text-xs text-slate-200 drop-shadow">
                    {PRODUCT_IMAGES[activeImageIndex].subtitle}
                  </p>
                </div>

                {/* ปุ่มลูกศรซ้าย / ขวาบนรูปหลัก */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev - 1 + PRODUCT_IMAGES.length) % PRODUCT_IMAGES.length);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev + 1) % PRODUCT_IMAGES.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </div>

              {/* Thumbnail 12 รูป */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>เลือกมุมมองภาพ (รวม 12 รูปถ่ายจริง):</span>
                  <button
                    onClick={() => openModalWithImage(activeImageIndex)}
                    className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 text-xs"
                  >
                    <span>คลิกเพื่อเปิดป็อปอัปขยายภาพ</span>
                    <i className="fa-solid fa-up-right-and-down-left-from-center text-[10px]"></i>
                  </button>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                  {PRODUCT_IMAGES.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        idx === activeImageIndex
                          ? 'border-emerald-500 ring-2 ring-emerald-300 scale-105 shadow-sm'
                          : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.src} alt={img.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ฝั่งขวา: รายละเอียด, สเปก, ของแถม, ราคา 12,499 */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-slate-900 text-white text-[11px] font-bold rounded-md">
                    ยี่ห้อ OEM
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md">
                    รุ่น 2 จอ (Dual Screen)
                  </span>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-md">
                    ประกัน 1 ปี
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-1">
                  เครื่อง POS OEM รุ่น 2 จอ All-in-One Touch
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  ซุ้มชำระเงินในร่ม • ขาตั้งพื้นมั่นคง • RAM 8GB • CPU 1.7GHz • จอ LCD 1366×768
                </p>

                {/* 💰 กล่องราคา 12,499 บาท ชัดเจน */}
                <div className="p-4 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl mb-5 shadow-xs">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500">ราคาทั้งเซ็ต (รวมของแถมทั้งหมด)</span>
                    <span className="text-xs text-slate-400 line-through">฿22,900</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-600">
                      ฿12,499
                    </span>
                    <span className="text-xs font-bold text-white bg-rose-500 px-2 py-0.5 rounded-md">
                      ประหยัด ฿10,401
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-semibold mt-1">
                    ✓ ราคานี้ได้ครบทั้งเครื่อง 2 จอ + พิมพ์ในตัว + ระบบโปร 1 ปี + สแกนเนอร์ + ลิ้นชักคิดเงิน
                  </p>
                </div>

                {/* 🎁 กล่องของแถมที่ได้รับฟรี */}
                <div className="mb-5 space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-gift text-rose-500"></i>
                      <span>ของแถมฟรีในเซ็ต (จัดเต็มพร้อมเปิดร้าน):</span>
                    </span>
                    <span className="text-[11px] text-rose-600 font-bold">มูลค่ารวมกว่า ฿9,300</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {BONUSES.map((bonus, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${bonus.color}`}>
                          <i className={`${bonus.icon} text-sm`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 truncate">{bonus.title}</span>
                            <span className="text-[10px] font-bold text-rose-600 ml-1 shrink-0">{bonus.value}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{bonus.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* สเปกสำคัญแบบย่อ */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-5">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 text-[10px] block">แรม (RAM)</span>
                    <span className="font-bold text-slate-800">8GB DDR3</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 text-[10px] block">ซีพียู (CPU)</span>
                    <span className="font-bold text-slate-800">ดูอัลคอร์ 1.7GHz</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 text-[10px] block">หน้าจอ (Screen)</span>
                    <span className="font-bold text-slate-800">LCD 1366 × 768</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 text-[10px] block">ระบบปฏิบัติการ</span>
                    <span className="font-bold text-slate-800">Android / วิน10</span>
                  </div>
                </div>
              </div>

              {/* ปุ่ม Action: 1. เปิดป๊อปอัปดูสเปกเต็ม / 2. สั่งซื้อทาง LINE */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                {/* 🔘 ปุ่มเปิดป๊อปอัป ดีไซน์ใหม่ คลีน มินิมอล สบายตา บรรทัดเดียว */}
                <button
                  onClick={() => openModalWithImage(activeImageIndex)}
                  className="w-full py-3 px-4 rounded-xl bg-slate-100/90 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs hover:shadow-sm transition-all group/btn"
                >
                  <i className="fa-solid fa-images text-emerald-500 group-hover/btn:scale-110 transition-transform"></i>
                  <span>ดูรายละเอียดสเปก &amp; รูปถ่ายทั้งหมด (12 รูป)</span>
                  <i className="fa-solid fa-up-right-and-down-left-from-center text-[11px] text-slate-400 group-hover/btn:text-emerald-600 ml-1"></i>
                </button>

                {/* 🟢 ปุ่มสั่งซื้อทาง LINE */}
                <a
                  href="https://line.me/ti/p/~bs_boll"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#06C755]/25 transition-all hover:scale-[1.01] active:scale-95"
                >
                  <i className="fa-brands fa-line text-xl"></i>
                  <span>สั่งซื้อทันทีผ่าน LINE (฿12,499)</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            💬 3. แถบติดต่อ LINE
            ───────────────────────────────────────────────────────────── */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#06C755]/15 text-[#06C755] flex items-center justify-center shrink-0">
              <i className="fa-brands fa-line text-3xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">
                สอบถามข้อมูลเครื่อง POS OEM หรือขอใบเสนอราคา
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                ทัก LINE พูดคุยกับเจ้าหน้าที่ได้ตลอดเวลา LINE ID: <strong className="text-emerald-600">bs_boll</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="https://line.me/ti/p/~bs_boll"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:shadow transition-all"
            >
              <i className="fa-brands fa-line text-xl"></i>
              <span>แอด LINE</span>
            </a>
            <button
              onClick={handleCopyLine}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all"
            >
              <i className="fa-solid fa-copy text-xs mr-1.5"></i>
              <span>{copiedLine ? 'คัดลอกแล้ว ✓' : 'คัดลอก ID'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          🪟 4. POPUP MODAL (12 รูป + สเปกครบ + 12,499)
          ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  เครื่อง POS OEM รุ่น 2 จอ All-in-One (รวม 12 รูปถ่าย & สเปกทางการ)
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-all"
                aria-label="Close Modal"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            {/* Modal Body: Scrollable */}
            <div className="overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ฝั่งซ้าย: รูปใหญ่ใน Modal + 12 Thumbnails */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={PRODUCT_IMAGES[modalImageIndex].src}
                      alt={PRODUCT_IMAGES[modalImageIndex].title}
                      className="w-full h-full object-contain"
                    />

                    {/* Badge เลขรูป */}
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                      รูปที่ {modalImageIndex + 1} จาก {PRODUCT_IMAGES.length}
                    </div>

                    {/* ปุ่ม Prev / Next */}
                    <button
                      onClick={() =>
                        setModalImageIndex((prev) => (prev - 1 + PRODUCT_IMAGES.length) % PRODUCT_IMAGES.length)
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all"
                    >
                      <i className="fa-solid fa-chevron-left text-sm"></i>
                    </button>
                    <button
                      onClick={() =>
                        setModalImageIndex((prev) => (prev + 1) % PRODUCT_IMAGES.length)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all"
                    >
                      <i className="fa-solid fa-chevron-right text-sm"></i>
                    </button>

                    {/* Caption ใต้รูป */}
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 p-3 text-white text-center text-xs">
                      <span className="font-bold">{PRODUCT_IMAGES[modalImageIndex].title}</span>
                      <span className="text-slate-300 ml-1">({PRODUCT_IMAGES[modalImageIndex].subtitle})</span>
                    </div>
                  </div>

                  {/* แถบ Thumbnail 12 รูปใน Modal */}
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                    {PRODUCT_IMAGES.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setModalImageIndex(i)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          i === modalImageIndex
                            ? 'border-emerald-500 ring-2 ring-emerald-300 scale-105'
                            : 'border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.src} alt={img.title} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  {/* รายการของแถมใน Modal */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <i className="fa-solid fa-gift text-rose-500"></i>
                      <span>ของแถมฟรีที่ท่านจะได้รับทันที:</span>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <span className="text-emerald-500 font-bold">✔</span>
                        <span><strong>ฟรี! ระบบ POS Foodscan ตัว Pro 1 ปีเต็ม</strong> (มูลค่า ฿6,000)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-emerald-500 font-bold">✔</span>
                        <span><strong>ฟรี! เครื่องสแกนเนอร์บาร์โค้ด & QR Code</strong></span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-emerald-500 font-bold">✔</span>
                        <span><strong>ฟรี! ลิ้นชักคิดเงิน / ลิ้นชักเก็บเงินไฟฟ้า</strong></span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-emerald-500 font-bold">✔</span>
                        <span><strong>ฟรี! เครื่องพิมพ์ใบเสร็จความร้อนในตัว</strong> (ไม่ต้องใช้หมึก)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-emerald-500 font-bold">✔</span>
                        <span><strong>ฟรี! บริการจัดส่งและให้คำปรึกษาการติดตั้ง</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* ฝั่งขวา: ตารางสเปกเต็ม 100% */}
                <div className="lg:col-span-6 space-y-4 text-xs">
                  {/* กล่องราคา 12,499 ใน Modal */}
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <div className="text-[11px] font-bold text-slate-500">ราคาพิเศษเปิดร้านครบเซ็ต (พร้อมของแถม)</div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-emerald-600">฿12,499</span>
                      <span className="text-xs text-slate-400 line-through">฿22,900</span>
                      <span className="text-[10px] font-bold text-white bg-rose-500 px-2 py-0.5 rounded">
                        ลดทันที ฿10,401
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      ได้เครื่อง 2 จอ + พิมพ์ในตัว + ระบบโปร 1 ปี + สแกนเนอร์ + ลิ้นชักเก็บเงิน
                    </p>
                  </div>

                  {/* ตารางสเปกทางเทคนิคเต็มรูปแบบ */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <i className="fa-solid fa-microchip text-emerald-500"></i>
                      <span>ข้อมูลจำเพาะทางเทคนิค (Specifications)</span>
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                      {SPECS.map((spec, i) => (
                        <div key={i} className={`flex justify-between p-2.5 ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                          <span className="text-slate-500 font-medium">{spec.label}:</span>
                          <span className="font-bold text-slate-800 text-right">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ปุ่มสั่งซื้อใน Modal */}
                  <div className="pt-3 border-t border-slate-100">
                    <a
                      href="https://line.me/ti/p/~bs_boll"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#06C755]/25 transition-all"
                    >
                      <i className="fa-brands fa-line text-xl"></i>
                      <span>ติดต่อสั่งซื้อทันทีผ่าน LINE (฿12,499)</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🧭 Footer */}
      <Footer />
    </div>
  );
}
