import React from 'react';

// Reusable <JsonLd> component
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

// 1. Organization Schema
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://suparpos.com/#organization',
    name: 'SuparPOS',
    alternateName: ['Supar POS', 'FoodScan', 'POS FoodScan'],
    url: 'https://suparpos.com',
    logo: 'https://suparpos.com/icon.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+66-99-754-7764',
      contactType: 'sales',
      email: 'posfoodscan@gmail.com',
      areaServed: 'TH',
      availableLanguage: 'Thai',
    },
  };
}

// 2. WebSite Schema
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://suparpos.com/#website',
    name: 'SuparPOS',
    url: 'https://suparpos.com',
  };
}

export interface PlanOfferItem {
  name: string;
  price: number | string;
  priceCurrency?: string;
  description: string;
  billingDuration?: 'MONTH' | 'YEAR' | 'LIFETIME';
  url?: string;
}

export const DEFAULT_SEO_OFFERS: PlanOfferItem[] = [
  {
    name: 'Free Plan (แผนฟรีตลอดชีพ)',
    price: '0',
    priceCurrency: 'THB',
    description: 'ใช้งานระบบ POS ฟรีตลอดชีพ คิดเงินหน้าร้านไม่จำกัด สแกนสั่งอาหาร 1,000 ออเดอร์/เดือน เลือกใช้ธีมร้านค้าได้ฟรีทั้งหมด และ Dashboard ย้อนหลัง 30 วัน',
    billingDuration: 'LIFETIME',
    url: 'https://suparpos.com/pricing',
  },
  {
    name: 'Basic Plan (แผนเริ่มต้นธุรกิจ)',
    price: '250',
    priceCurrency: 'THB',
    description: 'แผนเริ่มต้นทำธุรกิจ เลือกใช้ธีมร้านค้าได้ฟรีทั้งหมด คิดเงินและออเดอร์ไม่จำกัด Dashboard ไม่จำกัดย้อนหลัง สร้าง QR Code ไม่จำกัด และ Export Excel',
    billingDuration: 'MONTH',
    url: 'https://suparpos.com/pricing',
  },
  {
    name: 'Pro Plan (แผนโปรยอดนิยม)',
    price: '500',
    priceCurrency: 'THB',
    description: 'แผนยอดนิยมสำหรับร้านอาหาร เลือกใช้ธีมร้านค้าได้ฟรีทั้งหมด คิดเงินและออเดอร์ไม่จำกัด Dashboard ขั้นสูง Export Excel และระบบจัดการพนักงาน 3 คน',
    billingDuration: 'MONTH',
    url: 'https://suparpos.com/pricing',
  },
];

export function generatePlanOffersJsonLd(offers: PlanOfferItem[] = DEFAULT_SEO_OFFERS) {
  return offers.map((offer) => {
    const offerObj: Record<string, unknown> = {
      '@type': 'Offer',
      name: offer.name,
      price: String(offer.price),
      priceCurrency: offer.priceCurrency || 'THB',
      availability: 'https://schema.org/InStock',
      url: offer.url || 'https://suparpos.com/pricing',
      description: offer.description,
      priceValidUntil: '2028-12-31',
    };

    if (offer.billingDuration && offer.billingDuration !== 'LIFETIME') {
      offerObj.priceSpecification = {
        '@type': 'UnitPriceSpecification',
        price: String(offer.price),
        priceCurrency: offer.priceCurrency || 'THB',
        unitText: offer.billingDuration,
      };
    }

    return offerObj;
  });
}

// 3. SoftwareApplication Schema (Enhanced with Multi-tier Offers & Reviews)
export function generateSoftwareApplicationJsonLd(customOffers?: PlanOfferItem[]) {
  const offers = customOffers && customOffers.length > 0 ? customOffers : DEFAULT_SEO_OFFERS;
  const numericPrices = offers
    .map((o) => Number(o.price))
    .filter((n) => !isNaN(n));
  const lowPrice = numericPrices.length > 0 ? String(Math.min(...numericPrices)) : '0';
  const highPrice = numericPrices.length > 0 ? String(Math.max(...numericPrices)) : '500';

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://suparpos.com/#software',
    name: 'POS Foodscan',
    alternateName: ['SuparPOS', 'Supar POS', 'FoodScan', 'POS FoodScan'],
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Point of Sale (POS) & Restaurant Management',
    operatingSystem: 'Web Browser, Android, iOS, Windows, macOS',
    url: 'https://suparpos.com',
    logo: 'https://suparpos.com/icon.png',
    image: 'https://suparpos.com/opengraph-image.png',
    description: 'โปรแกรมขายหน้าร้าน POS และระบบสแกนสั่งอาหาร QR Code ออนไลน์และออฟไลน์ สำหรับร้านค้า ร้านอาหาร คาเฟ่ คิดเงินหน้าร้าน สต๊อกสินค้า รายงานยอดขาย',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '128',
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'THB',
      lowPrice,
      highPrice,
      offerCount: offers.length,
      offers: generatePlanOffersJsonLd(offers),
    },
  };
}

// 3.1 Product Pricing Schema (for /pricing page Rich Snippets)
export function generatePricingProductJsonLd(customOffers?: PlanOfferItem[]) {
  const offers = customOffers && customOffers.length > 0 ? customOffers : DEFAULT_SEO_OFFERS;
  const numericPrices = offers
    .map((o) => Number(o.price))
    .filter((n) => !isNaN(n));
  const lowPrice = numericPrices.length > 0 ? String(Math.min(...numericPrices)) : '0';
  const highPrice = numericPrices.length > 0 ? String(Math.max(...numericPrices)) : '500';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': 'https://suparpos.com/pricing#product',
    name: 'POS Foodscan Subscription Plans - แพ็กเกจราคาโปรแกรม POS',
    description: 'แพ็กเกจราคาโปรแกรมขายหน้าร้านและระบบสแกนสั่งอาหาร POS Foodscan มีทั้งแผนฟรีตลอดชีพ, Basic 250 บ./ด., และ Pro 500 บ./ด. ไม่มีสัญญาผูกมัด',
    brand: {
      '@type': 'Brand',
      name: 'POS Foodscan',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '128',
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'THB',
      lowPrice,
      highPrice,
      offerCount: offers.length,
      offers: generatePlanOffersJsonLd(offers),
    },
  };
}

// 4. BreadcrumbList Schema
export function generateBreadcrumbJsonLd(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

// 5. FAQPage Schema
export function generateFAQJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
