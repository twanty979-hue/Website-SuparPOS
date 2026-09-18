import React from 'react';
import type { Metadata } from 'next';
import LandingClient from '@/components/LandingClient';
import {
  JsonLd,
  generateOrganizationJsonLd,
  generateWebsiteJsonLd,
  generateSoftwareApplicationJsonLd,
  generateFAQJsonLd
} from '@/lib/seo';

// 1. Static Metadata for Homepageสา่สา่าส่าส
export const metadata: Metadata = {
  title: "POS Foodscan | โปรแกรมขายหน้าร้านและระบบ POS",
  description: "POS Foodscan โปรแกรมขายหน้าร้านและระบบ POS สำหรับร้านค้าปลีก คาเฟ่ และร้านอาหาร จัดการยอดขาย สต๊อก บาร์โค้ด และสแกนสั่งอาหารผ่าน QR Code เริ่มต้นใช้งานฟรี",
  alternates: {
    canonical: "https://suparpos.com"
  },
  openGraph: {
    title: "POS Foodscan | โปรแกรมขายหน้าร้านและระบบ POS",
    description: "POS Foodscan โปรแกรมขายหน้าร้านและระบบ POS สำหรับร้านค้าปลีก คาเฟ่ และร้านอาหาร จัดการยอดขาย สต๊อก บาร์โค้ด และสแกนสั่งอาหารผ่าน QR Code เริ่มต้นใช้งานฟรี",
    url: "https://suparpos.com",
    siteName: "POS Foodscan",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "POS Foodscan Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "POS Foodscan | โปรแกรมขายหน้าร้านและระบบ POS",
    description: "POS Foodscan โปรแกรมขายหน้าร้านและระบบ POS สำหรับร้านค้าปลีก คาเฟ่ และร้านอาหาร จัดการยอดขาย สต๊อก บาร์โค้ด และสแกนสั่งอาหารผ่าน QR Code เริ่มต้นใช้งานฟรี",
    images: ["/opengraph-image.png"],
  }
};

// FAQ data matching the visible FAQs on the page 100%
const HOME_FAQS = [
  {
    question: "ระบบ POS ของ POS Foodscan รองรับธุรกิจประเภทใดบ้าง?",
    answer: "POS Foodscan รองรับทั้งร้านค้าปลีก ร้านโชห่วย ร้านมินิมาร์ท ร้านของชำ คาเฟ่ ร้านกาแฟ เบเกอรี่ และร้านอาหารทั่วไป โดยมีฟังก์ชันจัดการสต๊อกสินค้า คิดเงิน และสแกนสั่งอาหารอย่างครบครัน"
  },
  {
    question: "มีค่าบริการรายเดือนหรือไม่?",
    answer: "มีแผน Free ให้ใช้งานฟรีตลอดชีพ (คิดเงินหน้าร้านไม่จำกัด, 1,000 ออเดอร์สแกนสั่งอาหารต่อเดือน) และมีแพ็กเกจระดับพรีเมียมเริ่มต้นที่ 250 บาทต่อเดือน (แผน Basic) และแผน Pro 500 บาทต่อเดือน สำหรับร้านที่ต้องการฟีเจอร์ระดับสูงและออเดอร์ไม่จำกัด"
  },
  {
    question: "รองรับการพิมพ์ใบเสร็จและบาร์โค้ดอย่างไร?",
    answer: "ระบบรองรับเครื่องพิมพ์ผ่านการเชื่อมต่อ Bluetooth, Wi-Fi/LAN และเครื่องพิมพ์ผ่านเว็บสำหรับระบบปฏิบัติการ Windows, iOS และ Android รวมถึงรองรับเครื่องสแกนบาร์โค้ดทั่วไป"
  },
  {
    question: "หากไม่มีการเชื่อมต่ออินเทอร์เน็ต สามารถใช้งานระบบได้หรือไม่?",
    answer: "ระบบ POS ของเราออกแบบมารองรับการบันทึกยอดขายแบบออฟไลน์ชั่วคราวหน้าร้าน และจะทำการซิงก์ข้อมูลธุรกรรมทั้งหมดกลับขึ้นระบบคลาวด์โดยอัตโนมัติเมื่ออินเทอร์เน็ตพร้อมใช้งาน"
  }
];

export default async function Page() {
  let dynamicOffers;
  try {
    const { getPublicPricingPlans } = await import('@/lib/planServer');
    const { seoOffers } = await getPublicPricingPlans();
    dynamicOffers = seoOffers;
  } catch {
    // Fallback to default offers
  }

  const orgSchema = generateOrganizationJsonLd();
  const websiteSchema = generateWebsiteJsonLd();
  const softwareSchema = generateSoftwareApplicationJsonLd(dynamicOffers);
  const faqSchema = generateFAQJsonLd(HOME_FAQS);

  return (
    <>
      <JsonLd data={orgSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={softwareSchema} />
      <JsonLd data={faqSchema} />
      
      <LandingClient />
    </>
  );
}
