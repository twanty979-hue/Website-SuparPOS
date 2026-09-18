import type { Metadata } from 'next';
import ShopClient from './ShopClient';

export const metadata: Metadata = {
  title: 'เครื่อง POS All-in-One พร้อมระบบขายหน้าร้าน – POS Foodscan',
  description: 'เครื่องคิดเงิน POS All-in-One หน้าจอสัมผัส LCD พร้อมเครื่องพิมพ์ใบเสร็จในตัว ราคาพิเศษเพียง 12,499 บาท จัดส่งฟรีทั่วไทย สั่งซื้อผ่าน LINE ID: bs_boll',
  alternates: { canonical: 'https://suparpos.com/shop' },
};

export default function ShopPage() {
  return <ShopClient />;
}
