// app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SuparPOS',           // ชื่อเต็มเวลาติดตั้ง
    short_name: 'SuparPOS',         // ชื่อสั้นๆ ใต้ไอคอนบนจอมือถือ
    description: 'ระบบ POS และสแกนสั่งอาหาร QR Code',
    start_url: '/dashboard/pai_order',
    display: 'standalone',          // 🔥 สำคัญ! ทำให้เปิดแล้วไม่มีแถบ URL (เหมือนแอปจริง)
    background_color: '#ffffff',
    theme_color: '#059669',         // สีหัวเว็บ (สีเขียวมรกตตามธีม SuparPOS)
    icons: [
      {
        src: '/icon.png',           // มันจะดึงรูป icon.png ที่พี่มีอยู่แล้วมาใช้
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',           // Android ชอบรูปใหญ่ด้วย (ถ้าพี่มีรูปชัดๆ จะดีมาก)
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}