export const PLANS = {
  free: { 
    name: 'Free', 
    price: 'ฟรี', 
    period: 'ตลอดชีพ', 
    themes: 'ฟรีทุกธีม', 
    orders: '300 ออเดอร์/เดือน', 
    features: [
      'คิดเงินหน้าร้านไม่จำกัด',
      'สแกนสั่งอาหาร 300 ออเดอร์/เดือน',
      'ดูรายงาน Dashboard ย้อนหลัง 30 วัน',
      'จัดการอาหาร / เมนู สูงสุด 50 รายการ',
      'สินค้าทั่วไป ไม่จำกัดจำนวน',
      'รองรับโต๊ะสูงสุด 10 โต๊ะ',
      'เลือกใช้ธีมร้านค้าได้ฟรีทั้งหมด',
    ], 
    color: 'border-slate-200', 
    btnColor: 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
  },

  go: {
    name: 'Go',
    price: '99',
    period: 'บาท/เดือน',
    themes: 'ฟรีทุกธีม',
    orders: '1,000 ออเดอร์/เดือน',
    features: [
      'คิดเงินหน้าร้านไม่จำกัด',
      'สแกนสั่งอาหาร 1,000 ออเดอร์/เดือน',
      'ดูรายงาน Dashboard ย้อนหลัง 60 วัน',
      'ประวัติการขายย้อนหลัง 30 วัน',
      'ไม่จำกัดจำนวนเมนูและสินค้า',
      'ไม่จำกัดจำนวนโต๊ะ',
      'เลือกใช้ธีมร้านค้าได้ฟรีทั้งหมด',
    ],
    color: 'border-teal-200',
    btnColor: 'bg-teal-600 text-white hover:bg-teal-700'
  },

  basic: { 
    name: 'Basic', 
    price: '250', 
    period: 'บาท/เดือน', 
    themes: 'ฟรีทุกธีม', 
    orders: 'ไม่จำกัด', 
    features: [
      'คิดเงินหน้าร้านไม่จำกัด',
      'ออเดอร์ไม่จำกัด (Unlimited Orders)',
      'ดูรายงาน Dashboard ย้อนหลังไม่จำกัด',
      'ประวัติการขายไม่จำกัดย้อนหลัง',
      'สร้าง QR Code โต๊ะไม่จำกัด',
      'ไม่จำกัดจำนวนเมนู สินค้า และโต๊ะ',
      'เลือกใช้ธีมร้านค้าได้ฟรีทั้งหมด',
    ], 
    color: 'border-blue-200', 
    btnColor: 'bg-blue-600 text-white hover:bg-blue-700' 
  },

  pro: { 
    name: 'Pro', 
    price: '500', 
    period: 'บาท/เดือน', 
    themes: 'ฟรีทุกธีม', 
    orders: 'ไม่จำกัด', 
    features: [
      'คิดเงินหน้าร้านและออเดอร์ไม่จำกัด',
      'ดูรายงาน Dashboard ขั้นสูง & วิเคราะห์ยอดขาย',
      'Export รายงาน Excel (สูงสุดย้อนหลัง 3 เดือน)',
      'ระบบจัดการพนักงานสูงสุด 3 คน',
      'กำหนดสิทธิ์การเข้าถึงของพนักงาน',
      'สร้าง QR Code โต๊ะไม่จำกัด',
      'ไม่จำกัดจำนวนเมนู สินค้า และโต๊ะ',
      'เลือกใช้ธีมร้านค้าได้ฟรีทั้งหมด',
    ], 
    color: 'border-indigo-200', 
    btnColor: 'bg-indigo-600 text-white hover:bg-indigo-700' 
  },

  ultimate: { 
    name: 'Ultimate', 
    price: '1,999', 
    period: 'บาท/เดือน', 
    themes: '55 ธีม + พรีเมียม', 
    orders: 'ไม่จำกัด', 
    features: [
      'ทุกฟังก์ชันของ Pro Plan',
      'สิทธิ์ใช้งานธีมพรีเมียมทั้งหมด (55+ ธีม)',
      'Dashboard ขั้นสูง & สถิติเชิงลึก',
      'Export รายงาน Excel (สูงสุดย้อนหลัง 3 เดือน)',
      'ระบบจัดการพนักงานสูงสุด 10 คน',
      'กำหนดสิทธิ์พนักงานได้ไม่จำกัด',
    ], 
    color: 'border-purple-500 shadow-purple-200', 
    btnColor: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30', 
    isPopular: true 
  }
};
