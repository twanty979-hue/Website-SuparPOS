// app/admin/adphoto/page.tsx
'use client'

import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Cropper from 'react-easy-crop'

const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

// Helper function สร้าง Image object สำหรับ Crop
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })

// --- Types ---
type StoreType = {
  id: number
  name: string
  icon_url: string | null
  description: string | null
  sort_order: number
  is_active: boolean
}

type MasterProduct = {
  id: number
  store_type_id: number | null
  category_name: string
  name: string
  image_url: string | null
  price: number
  cost_price: number | null
  is_recommended: boolean
  sort_order: number
  is_active: boolean
  master_store_types?: {
    name: string
  }
}

type MasterBanner = {
  id: number
  store_type_id: number | null
  title: string
  image_url: string
  sort_order: number
  is_active: boolean
  master_store_types?: {
    name: string
  }
}

// Legacy Types
type LegacyCategory = {
  id: number
  name: string
}

type LegacyImage = {
  id: number
  name: string
  url: string
  price: number | null
  category_id: number | null
  categoriesphotoadmin?: {
    name: string
  }
}

export default function AdminInitialSetupPage() {
  // Main Tab Navigation
  const [activeTab, setActiveTab] = useState<'STORE_TYPES' | 'PRODUCTS' | 'BANNERS' | 'LEGACY'>('STORE_TYPES')

  // --- Data States ---
  const [storeTypes, setStoreTypes] = useState<StoreType[]>([])
  const [products, setProducts] = useState<MasterProduct[]>([])
  const [banners, setBanners] = useState<MasterBanner[]>([])
  const [legacyCategories, setLegacyCategories] = useState<LegacyCategory[]>([])
  const [legacyImages, setLegacyImages] = useState<LegacyImage[]>([])
  const [loading, setLoading] = useState(true)

  // --- Filter States ---
  const [filterStoreTypeId, setFilterStoreTypeId] = useState<number | 'ALL'>('ALL')
  const [legacyActiveCategory, setLegacyActiveCategory] = useState<number | 'ALL'>('ALL')

  // --- Crop Modal State ---
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [cropTarget, setCropTarget] = useState<'PRODUCT' | 'BANNER' | 'STORE_TYPE' | 'LEGACY'>('PRODUCT')
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [cropAspect, setCropAspect] = useState<number>(1)

  // --- Store Type Modal States ---
  const [showStoreTypeModal, setShowStoreTypeModal] = useState(false)
  const [editingStoreType, setEditingStoreType] = useState<StoreType | null>(null)
  const [stName, setStName] = useState('')
  const [stDescription, setStDescription] = useState('')
  const [stIconUrl, setStIconUrl] = useState('')
  const [stSortOrder, setStSortOrder] = useState('1')
  const [stFile, setStFile] = useState<File | null>(null)
  const [stPreview, setStPreview] = useState('')
  const [isStLoading, setIsStLoading] = useState(false)

  // --- Product Modal States ---
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<MasterProduct | null>(null)
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodCostPrice, setProdCostPrice] = useState('')
  const [prodCategory, setProdCategory] = useState('')
  const [prodStoreTypeId, setProdStoreTypeId] = useState<string>('')
  const [prodIsRecommended, setProdIsRecommended] = useState(false)
  const [prodFile, setProdFile] = useState<File | null>(null)
  const [prodPreview, setProdPreview] = useState('')
  const [isProdLoading, setIsProdLoading] = useState(false)

  // --- Banner Modal States ---
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<MasterBanner | null>(null)
  const [bannerTitle, setBannerTitle] = useState('')
  const [bannerStoreTypeId, setBannerStoreTypeId] = useState<string>('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState('')
  const [isBannerLoading, setIsBannerLoading] = useState(false)

  // --- Legacy Modals ---
  const [showLegacyCatModal, setShowLegacyCatModal] = useState(false)
  const [showLegacyImgModal, setShowLegacyImgModal] = useState(false)
  const [legacyNewCatName, setLegacyNewCatName] = useState('')
  const [legacyImgName, setLegacyImgName] = useState('')
  const [legacyImgPrice, setLegacyImgPrice] = useState('')
  const [legacySelectedCatId, setLegacySelectedCatId] = useState('')
  const [legacyFile, setLegacyFile] = useState<File | null>(null)
  const [legacyPreview, setLegacyPreview] = useState('')
  const [isLegacyLoading, setIsLegacyLoading] = useState(false)

  // --- Fetch All Data ---
  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [stRes, prodRes, bannerRes, legCatRes, legImgRes] = await Promise.all([
        supabase.from('master_store_types').select('*').order('sort_order', { ascending: true }),
        supabase.from('master_products').select('*, master_store_types(name)').order('id', { ascending: false }),
        supabase.from('master_banners').select('*, master_store_types(name)').order('id', { ascending: false }),
        supabase.from('categoriesphotoadmin').select('*').order('id', { ascending: true }),
        supabase.from('images').select('*, categoriesphotoadmin(name)').order('id', { ascending: false }),
      ])

      if (stRes.data) setStoreTypes(stRes.data)
      if (prodRes.data) setProducts(prodRes.data as any)
      if (bannerRes.data) setBanners(bannerRes.data as any)
      if (legCatRes.data) setLegacyCategories(legCatRes.data)
      if (legImgRes.data) setLegacyImages(legImgRes.data as any)
    } catch (e: any) {
      console.error('Fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // --- Upload Helper ---
  const uploadToR2 = async (file: File, folder: string = 'master_assets'): Promise<string> => {
    const apiFormData = new FormData()
    apiFormData.append('file', file)
    apiFormData.append('folder', folder)

    const response = await fetch('/api/upload', { method: 'POST', body: apiFormData })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Upload to R2 failed')
    return `${CDN_URL}/${data.fileName}`
  }

  // --- Crop Logic ---
  const handleFileSelectForCrop = (
    e: ChangeEvent<HTMLInputElement>,
    target: 'PRODUCT' | 'BANNER' | 'STORE_TYPE' | 'LEGACY'
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const imageUrl = URL.createObjectURL(file)
      setImageToCrop(imageUrl)
      setCropTarget(target)
      setCropAspect(target === 'BANNER' ? 16 / 9 : 1)
      setIsCropModalOpen(true)
      e.target.value = ''
    }
  }

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return
    try {
      const image = await createImage(imageToCrop)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No 2d context')

      const targetWidth = cropTarget === 'BANNER' ? 1200 : 600
      const targetHeight = cropTarget === 'BANNER' ? 675 : 600
      canvas.width = targetWidth
      canvas.height = targetHeight

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        targetWidth,
        targetHeight
      )

      let quality = 0.9
      let webpBlob: Blob | null = null
      const maxBytes = cropTarget === 'BANNER' ? 150 * 1024 : 50 * 1024

      do {
        webpBlob = await new Promise((resolve) =>
          canvas.toBlob((blob) => resolve(blob), 'image/webp', quality)
        )
        quality -= 0.1
      } while (webpBlob && webpBlob.size > maxBytes && quality >= 0.4)

      if (!webpBlob) throw new Error('Canvas to Blob failed')

      const fileName = `master_${cropTarget.toLowerCase()}_${Date.now()}.webp`
      const webpFile = new File([webpBlob], fileName, { type: 'image/webp' })
      const previewUrl = URL.createObjectURL(webpFile)

      if (cropTarget === 'STORE_TYPE') {
        setStFile(webpFile)
        setStPreview(previewUrl)
      } else if (cropTarget === 'PRODUCT') {
        setProdFile(webpFile)
        setProdPreview(previewUrl)
      } else if (cropTarget === 'BANNER') {
        setBannerFile(webpFile)
        setBannerPreview(previewUrl)
      } else if (cropTarget === 'LEGACY') {
        setLegacyFile(webpFile)
        setLegacyPreview(previewUrl)
      }

      setIsCropModalOpen(false)
      setImageToCrop(null)
    } catch (e: any) {
      alert('การตัดรูปภาพล้มเหลว: ' + e.message)
    }
  }

  // =========================================================================
  // 1. STORE TYPE ACTIONS
  // =========================================================================
  const openStoreTypeModal = (st?: StoreType) => {
    if (st) {
      setEditingStoreType(st)
      setStName(st.name)
      setStDescription(st.description || '')
      setStIconUrl(st.icon_url || '')
      setStSortOrder(String(st.sort_order || 1))
      setStPreview(st.icon_url || '')
    } else {
      setEditingStoreType(null)
      setStName('')
      setStDescription('')
      setStIconUrl('')
      setStSortOrder(String(storeTypes.length + 1))
      setStPreview('')
    }
    setStFile(null)
    setShowStoreTypeModal(true)
  }

  const handleSaveStoreType = async (e: FormEvent) => {
    e.preventDefault()
    if (!stName.trim()) return alert('กรุณาระบุชื่อประเภทร้านค้า')
    setIsStLoading(true)

    try {
      let finalIconUrl = stIconUrl.trim()
      if (stFile) {
        finalIconUrl = await uploadToR2(stFile, 'master_store_types')
      }

      const payload = {
        name: stName.trim(),
        description: stDescription.trim() || null,
        icon_url: finalIconUrl || null,
        sort_order: parseInt(stSortOrder) || 1,
        is_active: true,
      }

      if (editingStoreType) {
        const { error } = await supabase.from('master_store_types').update(payload).eq('id', editingStoreType.id)
        if (error) throw error
        alert('อัปเดตประเภทร้านค้าสำเร็จ!')
      } else {
        const { error } = await supabase.from('master_store_types').insert([payload])
        if (error) throw error
        alert('เพิ่มประเภทร้านค้าใหม่สำเร็จ!')
      }

      setShowStoreTypeModal(false)
      fetchAllData()
    } catch (e: any) {
      alert('บันทึกล้มเหลว: ' + e.message)
    } finally {
      setIsStLoading(false)
    }
  }

  const handleDeleteStoreType = async (id: number) => {
    if (!confirm('ยืนยันที่จะลบประเภทร้านค้านี้? สินค้าและแบนเนอร์ที่ผูกอยู่จะถูกลบไปด้วย')) return
    try {
      const { error } = await supabase.from('master_store_types').delete().eq('id', id)
      if (error) throw error
      alert('ลบประเภทร้านค้าสำเร็จ')
      fetchAllData()
    } catch (e: any) {
      alert('ลบล้มเหลว: ' + e.message)
    }
  }

  // =========================================================================
  // 2. PRODUCT ACTIONS
  // =========================================================================
  const openProductModal = (p?: MasterProduct) => {
    if (p) {
      setEditingProduct(p)
      setProdName(p.name)
      setProdPrice(String(p.price || 0))
      setProdCostPrice(p.cost_price ? String(p.cost_price) : '')
      setProdCategory(p.category_name || '')
      setProdStoreTypeId(p.store_type_id ? String(p.store_type_id) : '')
      setProdIsRecommended(p.is_recommended || false)
      setProdPreview(p.image_url || '')
    } else {
      setEditingProduct(null)
      setProdName('')
      setProdPrice('')
      setProdCostPrice('')
      setProdCategory('')
      setProdStoreTypeId(filterStoreTypeId !== 'ALL' ? String(filterStoreTypeId) : storeTypes[0]?.id ? String(storeTypes[0].id) : '')
      setProdIsRecommended(false)
      setProdPreview('')
    }
    setProdFile(null)
    setShowProductModal(true)
  }

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault()
    if (!prodName.trim()) return alert('กรุณาระบุชื่อสินค้า')
    if (!prodCategory.trim()) return alert('กรุณาระบุหมวดหมู่สินค้า')
    setIsProdLoading(true)

    try {
      let finalImageUrl = editingProduct?.image_url || null
      if (prodFile) {
        finalImageUrl = await uploadToR2(prodFile, 'master_products')
      }

      const payload = {
        name: prodName.trim(),
        price: parseFloat(prodPrice) || 0,
        cost_price: prodCostPrice ? parseFloat(prodCostPrice) : null,
        category_name: prodCategory.trim(),
        store_type_id: prodStoreTypeId ? parseInt(prodStoreTypeId) : null,
        image_url: finalImageUrl,
        is_recommended: prodIsRecommended,
        is_active: true,
      }

      if (editingProduct) {
        const { error } = await supabase.from('master_products').update(payload).eq('id', editingProduct.id)
        if (error) throw error
        alert('อัปเดตสินค้าสำเร็จ!')
      } else {
        const { error } = await supabase.from('master_products').insert([payload])
        if (error) throw error
        alert('เพิ่มสินค้าใหม่สำเร็จ!')
      }

      setShowProductModal(false)
      fetchAllData()
    } catch (e: any) {
      alert('บันทึกล้มเหลว: ' + e.message)
    } finally {
      setIsProdLoading(false)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('ยืนยันลบสินค้านี้?')) return
    try {
      const { error } = await supabase.from('master_products').delete().eq('id', id)
      if (error) throw error
      alert('ลบสินค้าสำเร็จ')
      fetchAllData()
    } catch (e: any) {
      alert('ลบล้มเหลว: ' + e.message)
    }
  }

  // =========================================================================
  // 3. BANNER ACTIONS
  // =========================================================================
  const openBannerModal = (b?: MasterBanner) => {
    if (b) {
      setEditingBanner(b)
      setBannerTitle(b.title || '')
      setBannerStoreTypeId(b.store_type_id ? String(b.store_type_id) : '')
      setBannerPreview(b.image_url || '')
    } else {
      setEditingBanner(null)
      setBannerTitle('')
      setBannerStoreTypeId(filterStoreTypeId !== 'ALL' ? String(filterStoreTypeId) : storeTypes[0]?.id ? String(storeTypes[0].id) : '')
      setBannerPreview('')
    }
    setBannerFile(null)
    setShowBannerModal(true)
  }

  const handleSaveBanner = async (e: FormEvent) => {
    e.preventDefault()
    if (!bannerTitle.trim()) return alert('กรุณาระบุชื่อแบนเนอร์')
    if (!bannerFile && !editingBanner?.image_url) return alert('กรุณาเลือกรูปแบนเนอร์')
    setIsBannerLoading(true)

    try {
      let finalImageUrl = editingBanner?.image_url || ''
      if (bannerFile) {
        finalImageUrl = await uploadToR2(bannerFile, 'master_banners')
      }

      const payload = {
        title: bannerTitle.trim(),
        store_type_id: bannerStoreTypeId ? parseInt(bannerStoreTypeId) : null,
        image_url: finalImageUrl,
        is_active: true,
      }

      if (editingBanner) {
        const { error } = await supabase.from('master_banners').update(payload).eq('id', editingBanner.id)
        if (error) throw error
        alert('อัปเดตแบนเนอร์สำเร็จ!')
      } else {
        const { error } = await supabase.from('master_banners').insert([payload])
        if (error) throw error
        alert('เพิ่มแบนเนอร์สำเร็จ!')
      }

      setShowBannerModal(false)
      fetchAllData()
    } catch (e: any) {
      alert('บันทึกล้มเหลว: ' + e.message)
    } finally {
      setIsBannerLoading(false)
    }
  }

  const handleDeleteBanner = async (id: number) => {
    if (!confirm('ยืนยันลบแบนเนอร์นี้?')) return
    try {
      const { error } = await supabase.from('master_banners').delete().eq('id', id)
      if (error) throw error
      alert('ลบแบนเนอร์สำเร็จ')
      fetchAllData()
    } catch (e: any) {
      alert('ลบล้มเหลว: ' + e.message)
    }
  }

  // Filtered lists
  const filteredProducts =
    filterStoreTypeId === 'ALL'
      ? products
      : products.filter((p) => p.store_type_id === filterStoreTypeId)

  const filteredBanners =
    filterStoreTypeId === 'ALL'
      ? banners
      : banners.filter((b) => b.store_type_id === filterStoreTypeId)

  const filteredLegacyImages =
    legacyActiveCategory === 'ALL'
      ? legacyImages
      : legacyImages.filter((img) => img.category_id === legacyActiveCategory)

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Setup Onboarding Manager
              </span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              จัดการข้อมูลตั้งต้นสำหรับเปิดร้านใหม่
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              เพิ่ม/แก้ไขประเภทร้านค้า เมนูอาหาร และแบนเนอร์แนะนำ ที่จะแสดงให้ผู้ใช้จิ้มเลือกตอนสมัครใช้งานแอป
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchAllData}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition flex items-center gap-2"
            >
              🔄 รีเฟรชข้อมูล
            </button>
            {activeTab === 'STORE_TYPES' && (
              <button
                onClick={() => openStoreTypeModal()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
              >
                + เพิ่มประเภทร้าน
              </button>
            )}
            {activeTab === 'PRODUCTS' && (
              <button
                onClick={() => openProductModal()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
              >
                + เพิ่มสินค้าต้นแบบ
              </button>
            )}
            {activeTab === 'BANNERS' && (
              <button
                onClick={() => openBannerModal()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
              >
                + เพิ่มแบนเนอร์
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mt-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('STORE_TYPES')}
            className={`pb-4 px-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'STORE_TYPES'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="text-base">🏪</span> 1. ประเภทร้านค้า ({storeTypes.length})
          </button>
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`pb-4 px-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'PRODUCTS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="text-base">🍲</span> 2. สินค้าต้นแบบ ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('BANNERS')}
            className={`pb-4 px-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'BANNERS'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="text-base">🖼️</span> 3. แบนเนอร์แนะนำ ({banners.length})
          </button>
          <button
            onClick={() => setActiveTab('LEGACY')}
            className={`pb-4 px-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'LEGACY'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="text-base">📁</span> คลังรูปเดิม ({legacyImages.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto py-20 text-center text-gray-400 font-bold">
          กำลังโหลดข้อมูลระบบ...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* ========================================================================= */}
          {/* TAB 1: ประเภทร้านค้า (master_store_types) */}
          {/* ========================================================================= */}
          {activeTab === 'STORE_TYPES' && (
            <div>
              {storeTypes.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                  <div className="text-5xl mb-4">🏪</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">ยังไม่มีประเภทร้านค้าในระบบ</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    เริ่มต้นด้วยการเพิ่มประเภทร้าน เช่น ร้านข้าวมันไก่, ร้านก๋วยเตี๋ยว, ร้านกาแฟ ฯลฯ
                  </p>
                  <button
                    onClick={() => openStoreTypeModal()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition"
                  >
                    + เพิ่มประเภทร้านแรก
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {storeTypes.map((st) => {
                    const prodCount = products.filter((p) => p.store_type_id === st.id).length
                    const bannerCount = banners.filter((b) => b.store_type_id === st.id).length

                    return (
                      <div
                        key={st.id}
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                              {st.icon_url ? (
                                <img src={st.icon_url} alt={st.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl">🏪</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-black text-gray-800 text-lg">{st.name}</h3>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {st.description || 'ไม่มีคำอธิบาย'}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 mb-4">
                            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold">
                              🍲 {prodCount} สินค้า
                            </span>
                            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-bold">
                              🖼️ {bannerCount} แบนเนอร์
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => openStoreTypeModal(st)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteStoreType(st.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: สินค้าต้นแบบ (master_products) */}
          {/* ========================================================================= */}
          {activeTab === 'PRODUCTS' && (
            <div>
              {/* Filter By Store Type */}
              <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
                <button
                  onClick={() => setFilterStoreTypeId('ALL')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    filterStoreTypeId === 'ALL'
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  ทั้งหมด ({products.length})
                </button>
                {storeTypes.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setFilterStoreTypeId(st.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      filterStoreTypeId === st.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {st.name} ({products.filter((p) => p.store_type_id === st.id).length})
                  </button>
                ))}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                  <div className="text-5xl mb-4">🍲</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">ยังไม่มีสินค้าในหมวดนี้</h3>
                  <button
                    onClick={() => openProductModal()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition"
                  >
                    + เพิ่มสินค้าใหม่
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col justify-between"
                    >
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">🍲</div>
                        )}
                        {p.is_recommended && (
                          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                            ⭐ แนะนำ
                          </span>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">
                              {p.category_name}
                            </span>
                            {p.master_store_types && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold truncate">
                                {p.master_store_types.name}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-gray-800 text-sm line-clamp-2 mt-1">{p.name}</h4>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <span className="text-emerald-700 font-black text-base">฿{p.price}</span>
                            {p.cost_price && (
                              <span className="text-gray-400 text-[10px] block">ทุน ฿{p.cost_price}</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openProductModal(p)}
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: แบนเนอร์แนะนำ (master_banners) */}
          {/* ========================================================================= */}
          {activeTab === 'BANNERS' && (
            <div>
              {/* Filter By Store Type */}
              <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
                <button
                  onClick={() => setFilterStoreTypeId('ALL')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    filterStoreTypeId === 'ALL'
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  ทั้งหมด ({banners.length})
                </button>
                {storeTypes.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setFilterStoreTypeId(st.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      filterStoreTypeId === st.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {st.name} ({banners.filter((b) => b.store_type_id === st.id).length})
                  </button>
                ))}
              </div>

              {filteredBanners.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                  <div className="text-5xl mb-4">🖼️</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">ยังไม่มีแบนเนอร์ในหมวดนี้</h3>
                  <button
                    onClick={() => openBannerModal()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition"
                  >
                    + เพิ่มแบนเนอร์ใหม่
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBanners.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition overflow-hidden"
                    >
                      <div className="aspect-video bg-gray-100 relative overflow-hidden">
                        <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h4 className="font-bold text-base drop-shadow-sm">{b.title}</h4>
                          {b.master_store_types && (
                            <span className="text-[10px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded font-bold">
                              {b.master_store_types.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 flex justify-end gap-2">
                        <button
                          onClick={() => openBannerModal(b)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(b.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: คลังรูปเดิม (Legacy images) */}
          {/* ========================================================================= */}
          {activeTab === 'LEGACY' && (
            <div>
              <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
                <button
                  onClick={() => setLegacyActiveCategory('ALL')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    legacyActiveCategory === 'ALL'
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  ทั้งหมด ({legacyImages.length})
                </button>
                {legacyCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setLegacyActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      legacyActiveCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredLegacyImages.map((img) => (
                  <div key={img.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{img.name}</h4>
                      <p className="text-emerald-700 font-black text-sm mt-1">฿{img.price || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: เพิ่ม/แก้ไข ประเภทร้านค้า */}
      {/* ========================================================================= */}
      {showStoreTypeModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-800">
                {editingStoreType ? 'แก้ไขประเภทร้านค้า' : 'เพิ่มประเภทร้านค้าใหม่'}
              </h2>
              <button onClick={() => setShowStoreTypeModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveStoreType} className="p-6 space-y-4">
              <div className="flex justify-center mb-2">
                <div
                  className="relative group cursor-pointer w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center"
                  onClick={() => document.getElementById('st-file-input')?.click()}
                >
                  {stPreview ? (
                    <img src={stPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <span className="text-xl block">📷</span>
                      <span className="text-[10px] text-gray-500 font-bold">เลือกไอคอน</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="st-file-input"
                    accept="image/*"
                    onChange={(e) => handleFileSelectForCrop(e, 'STORE_TYPE')}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">ชื่อประเภทร้าน *</label>
                <input
                  type="text"
                  placeholder="เช่น ร้านข้าวมันไก่, ร้านก๋วยเตี๋ยว"
                  value={stName}
                  onChange={(e) => setStName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mt-1 font-bold text-gray-800 text-sm outline-none focus:bg-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">คำอธิบาย</label>
                <input
                  type="text"
                  placeholder="เช่น ข้าวมันไก่ต้ม, ไก่ทอด, ซุปมะระ"
                  value={stDescription}
                  onChange={(e) => setStDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mt-1 text-sm outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">ลำดับแสดงผล</label>
                  <input
                    type="number"
                    value={stSortOrder}
                    onChange={(e) => setStSortOrder(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mt-1 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">หรือกรอก URL ไอคอน</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={stIconUrl}
                    onChange={(e) => {
                      setStIconUrl(e.target.value)
                      setStPreview(e.target.value)
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mt-1 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowStoreTypeModal(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isStLoading}
                  className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm shadow-md hover:bg-emerald-700"
                >
                  {isStLoading ? 'กำลังบันทึก...' : 'บันทึกประเภทร้าน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: เพิ่ม/แก้ไข สินค้าต้นแบบ (master_products) */}
      {/* ========================================================================= */}
      {showProductModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-800">
                {editingProduct ? 'แก้ไขสินค้าต้นแบบ' : 'เพิ่มสินค้าต้นแบบใหม่'}
              </h2>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="flex justify-center mb-2">
                <div
                  className="relative group cursor-pointer w-28 h-28 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center"
                  onClick={() => document.getElementById('prod-file-input')?.click()}
                >
                  {prodPreview ? (
                    <img src={prodPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <span className="text-2xl block">🍲</span>
                      <span className="text-[10px] text-gray-500 font-bold">เลือกรูปอาหาร</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="prod-file-input"
                    accept="image/*"
                    onChange={(e) => handleFileSelectForCrop(e, 'PRODUCT')}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">ชื่อสินค้า *</label>
                <input
                  type="text"
                  placeholder="เช่น ข้าวมันไก่ตอน (ต้ม), เส้นเล็กต้มยำ"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mt-1 font-bold text-gray-800 text-sm outline-none focus:bg-white focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">ราคาขาย (บาท) *</label>
                  <input
                    type="number"
                    step="any"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mt-1 font-black text-emerald-700 text-sm outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">ราคาต้นทุน (บาท)</label>
                  <input
                    type="number"
                    step="any"
                    value={prodCostPrice}
                    onChange={(e) => setProdCostPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mt-1 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">หมวดหมู่สินค้า *</label>
                  <input
                    type="text"
                    placeholder="เช่น ข้าวมันไก่, ซุป, เครื่องดื่ม"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mt-1 text-sm outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">ผูกกับประเภทร้าน</label>
                  <select
                    value={prodStoreTypeId}
                    onChange={(e) => setProdStoreTypeId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm outline-none font-bold"
                  >
                    <option value="">-- ไม่ระบุ --</option>
                    {storeTypes.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prod-rec"
                  checked={prodIsRecommended}
                  onChange={(e) => setProdIsRecommended(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                />
                <label htmlFor="prod-rec" className="text-xs font-bold text-gray-700 cursor-pointer">
                  ⭐ ตั้งเป็นเมนูแนะนำเริ่มต้น
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isProdLoading}
                  className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm shadow-md hover:bg-emerald-700"
                >
                  {isProdLoading ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: เพิ่ม/แก้ไข แบนเนอร์แนะนำ (master_banners) */}
      {/* ========================================================================= */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-800">
                {editingBanner ? 'แก้ไขแบนเนอร์' : 'เพิ่มแบนเนอร์ใหม่'}
              </h2>
              <button onClick={() => setShowBannerModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-6 space-y-4">
              <div className="flex justify-center mb-2">
                <div
                  className="relative group cursor-pointer w-full h-44 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center"
                  onClick={() => document.getElementById('banner-file-input')?.click()}
                >
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-3xl block">🖼️</span>
                      <span className="text-xs text-gray-500 font-bold mt-1 block">เลือกรูปแบนเนอร์แนวนอน (16:9)</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="banner-file-input"
                    accept="image/*"
                    onChange={(e) => handleFileSelectForCrop(e, 'BANNER')}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">ชื่อ/หัวข้อแบนเนอร์ *</label>
                <input
                  type="text"
                  placeholder="เช่น ข้าวมันไก่สูตรเด็ดต้นตำรับ"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mt-1 font-bold text-gray-800 text-sm outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">ผูกกับประเภทร้าน</label>
                <select
                  value={bannerStoreTypeId}
                  onChange={(e) => setBannerStoreTypeId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm outline-none font-bold"
                >
                  <option value="">-- แสดงทุกประเภทร้าน --</option>
                  {storeTypes.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isBannerLoading}
                  className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm shadow-md hover:bg-emerald-700"
                >
                  {isBannerLoading ? 'กำลังบันทึก...' : 'บันทึกแบนเนอร์'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CROPPER: ปรับตำแหน่งและตัดรูปภาพ */}
      {/* ========================================================================= */}
      {isCropModalOpen && imageToCrop && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setIsCropModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-base font-black text-gray-800">จัดตำแหน่งรูปภาพ</h3>
              <button onClick={() => setIsCropModalOpen(false)} className="text-gray-400 text-lg">✕</button>
            </div>
            <div className="relative w-full h-80 bg-gray-900">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={cropAspect}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid={true}
              />
            </div>
            <div className="p-6 bg-white">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-gray-400 text-xs font-bold">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
              <button
                onClick={handleCropSave}
                className="w-full py-3 rounded-xl font-bold text-white bg-emerald-600 shadow-md hover:bg-emerald-700"
              >
                ยืนยันการตัดรูป
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
