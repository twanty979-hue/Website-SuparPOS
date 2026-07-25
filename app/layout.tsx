// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import GlobalAlertProvider from '@/components/providers/GlobalAlertProvider';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://suparpos.com'),
  title: "ระบบ POS ร้านค้าและร้านอาหาร จัดการสต๊อก คิดเงิน สแกนสั่งซื้อ | SuparPOS",
  description: "SuparPOS คือระบบ POS สำหรับร้านค้าปลีก ร้านอาหาร คาเฟ่ และร้านค้าทุกประเภท ช่วยจัดการสต๊อกสินค้า คิดเงินหน้าร้าน และสแกนสั่งซื้อ/สั่งอาหาร ใช้งานง่าย เริ่มต้นฟรี",
  keywords: [
    "POS", "SuparPOS", "suparpos", "supar pos", "ระบบ POS", "POS System", "ระบบคิดเงิน",
    "จัดการสต๊อกสินค้า", "ระบบร้านค้าปลีก", "ระบบร้านอาหาร", "ระบบ POS คาเฟ่",
    "เครื่องคิดเงิน", "สแกนสั่งอาหาร", "ระบบจัดการร้านค้า", "FoodScan",
    "โปรแกรมขายหน้าร้าน", "ระบบบาร์โค้ด", "โปรแกรมร้านโชห่วย", "โปรแกรมร้านกาแฟ",
    "โปรแกรมสต๊อกสินค้า", "แอปคิดเงินหน้าร้าน", "ระบบ POS ออนไลน์",
    "ระบบสั่งอาหารผ่านมือถือ", "สแกนสั่งอาหาร QR Code"
  ],
  openGraph: {
    title: "SuparPOS - ระบบจัดการร้านค้า ร้านอาหาร คาเฟ่ และคิดเงินครบวงจร",
    description: "ระบบ POS สำหรับร้านค้าและร้านอาหารทุกประเภท จัดการสต๊อก ยอดขาย คิดเงินหน้าร้าน สแกนสั่งสินค้า เริ่มต้นใช้งานฟรีกับ SuparPOS",
    url: 'https://suparpos.com',
    siteName: 'SuparPOS',
    locale: 'th_TH',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'SuparPOS Preview',
      },
    ],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <head>
        {/* 1. Font Awesome (ที่นายมีอยู่แล้ว) */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        
        {/* 🔥 2. Flaticon UIcons (ต้องเพิ่มอันนี้! ไม่งั้นไอคอนแมวไม่ขึ้น) */}
        <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.1.0/uicons-regular-rounded/css/uicons-regular-rounded.css' />
        <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.1.0/uicons-solid-rounded/css/uicons-solid-rounded.css' />
        
        {/* 🔥 3. Animate.css (เพื่อให้พวก wobble/bounce ในธีมทำงาน) */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
      </head>
      <body className="antialiased">
        <GlobalAlertProvider>
          {/* ห่อ children ด้วย div เปล่าๆ ไม่ต้องใส่สีพื้นหลังตรงนี้ เพื่อให้ลายจุดจากธีมทะลุขึ้นมาได้ */}
          <div className="min-h-screen">
            {children}
          </div>
        </GlobalAlertProvider>
      </body>
    </html>
  );
}