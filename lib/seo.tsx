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

// 3. SoftwareApplication Schema
export function generateSoftwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://suparpos.com/#software',
    name: 'SuparPOS',
    operatingSystem: 'Web Browser, Android, iOS',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'THB',
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
