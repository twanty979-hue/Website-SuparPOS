'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import Cropper from 'react-easy-crop';

interface Category {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

interface Product {
  id: string;
  category_id: string | null;
  barcode: string | null;
  sku: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  cost_price: number;
  is_active: boolean;
  is_pack?: boolean;
  import_count?: number;
  created_at?: string;
}

// Clean SVG Icons (No Emojis)
const IconSearch = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
  </svg>
);

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconDownload = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const IconUpload = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const IconRefresh = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
  </svg>
);

const IconLayers = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const IconCloud = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const IconCloudCheck = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    <path d="m9 13 2 2 4-4" />
  </svg>
);

const IconCloudUpload = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    <path d="M12 12v6" />
    <path d="m15 15-3-3-3 3" />
  </svg>
);

const IconExternalLink = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  // Search, Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [filterPackType, setFilterPackType] = useState<'ALL' | 'PACK' | 'SINGLE'>('ALL');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'NEWEST' | 'NAME_ASC' | 'PRICE_ASC' | 'PRICE_DESC'>('POPULAR');
  const [currentPage, setCurrentPage] = useState(1);

  // Image Migration States
  const [filterImageFilter, setFilterImageFilter] = useState<'ALL' | 'EXTERNAL' | 'R2' | 'NO_IMAGE'>('ALL');
  const [migratingIds, setMigratingIds] = useState<Set<string>>(new Set());
  const [showBatchMigrateModal, setShowBatchMigrateModal] = useState(false);
  const [batchMigrateRunning, setBatchMigrateRunning] = useState(false);
  const [batchMigrateProgress, setBatchMigrateProgress] = useState({ current: 0, total: 0, failed: 0 });
  const [stopBatchRequested, setStopBatchRequested] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Form states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    barcode: '',
    sku: '',
    price: 0,
    cost_price: 0,
    description: '',
    image_url: '',
    is_active: true,
    is_pack: false
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [cropModal, setCropModal] = useState<{ open: boolean; image: string | null }>({ open: false, image: null });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropModal({ open: true, image: reader.result as string });
      });
      reader.readAsDataURL(e.target.files[0]);
    }
    e.target.value = '';
  };

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<File> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      let quality = 0.8;
      const targetSize = 60 * 1024;
      const loop = () => {
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size > targetSize && quality > 0.1) {
              quality -= 0.1;
              loop();
            } else if (blob) {
              resolve(new File([blob], `product_${Date.now()}.webp`, { type: 'image/webp' }));
            } else {
              reject(new Error("Canvas to Blob failed"));
            }
          },
          'image/webp',
          quality
        );
      };
      loop();
    });
  };

  const handleConfirmCrop = async () => {
    if (!cropModal.image || !croppedAreaPixels) return;
    setUploadingImage(true);
    try {
      const file = await getCroppedImg(cropModal.image, croppedAreaPixels);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "admin-products");

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd
      });

      if (!res.ok) throw new Error("อัปโหลดรูปภาพล้มเหลว");
      const data = await res.json();
      if (data.success) {
        setProductForm(prev => ({ ...prev, image_url: data.url }));
        setCropModal({ open: false, image: null });
      } else {
        throw new Error(data.error || "อัปโหลดรูปภาพล้มเหลว");
      }
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploadingImage(false);
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = 'name,category_name,barcode,sku,price,cost_price,description,image_url,is_pack\n' +
      'น้ำดื่มสิงห์ 600 มล.,เครื่องดื่ม,8851013710118,DRINK-001,10.00,6.00,น้ำดื่มสะอาดตราสิงห์,https://img.pos-foodscan.com/sample.png,false\n' +
      'น้ำดื่มสิงห์ 600 มล. แพ็ค 12,เครื่องดื่ม,8850999321028,DRINK-002,110.00,75.00,น้ำดื่มสิงห์แพ็ค 12 ขวด,,true\n';
    
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'admin_products_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const result = [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      const row = matches ? matches.map(val => val.trim().replace(/^"|"$/g, '')) : lines[i].split(',');
      
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      result.push(obj);
    }
    return result;
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        const rows = parseCSV(text);
        if (rows.length === 0) {
          alert('ไม่พบข้อมูลในไฟล์ CSV');
          return;
        }

        const categoryNames = Array.from(new Set(rows.map(r => r.category_name).filter(Boolean)));
        
        const { data: existingCats } = await supabase.from('admin_master_categories').select('*');
        const catMap = new Map<string, string>();
        existingCats?.forEach(c => catMap.set(c.name.toLowerCase(), c.id));

        for (const catName of categoryNames) {
          const key = catName.toLowerCase();
          if (!catMap.has(key)) {
            const { data: newCat, error } = await supabase
              .from('admin_master_categories')
              .insert({ name: catName, sort_order: 99 })
              .select()
              .single();
            if (error) throw error;
            catMap.set(key, newCat.id);
          }
        }

        const productsToInsert = rows.map(r => {
          const catId = r.category_name ? catMap.get(r.category_name.toLowerCase()) : null;
          const isPackVal = r.is_pack === 'true' || r.is_pack === '1' || (r.name && (r.name.includes('แพ็ค') || r.name.includes('แพค') || r.name.toLowerCase().includes('pack')));
          return {
            category_id: catId || null,
            name: r.name,
            barcode: r.barcode || null,
            sku: r.sku || null,
            price: Number(r.price) || 0,
            cost_price: Number(r.cost_price) || 0,
            description: r.description || null,
            image_url: r.image_url || null,
            is_active: true,
            is_pack: Boolean(isPackVal)
          };
        });

        const { error: insertError } = await supabase
          .from('admin_product_master')
          .insert(productsToInsert);

        if (insertError) throw insertError;

        alert(`นำเข้าสำเร็จ ${productsToInsert.length} รายการ!`);
        fetchData();
      };
      reader.readAsText(file);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการนำเข้าไฟล์ CSV');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    sort_order: 0,
    is_active: true
  });

  const fetchAllAdminProducts = async () => {
    let allProducts: Product[] = [];
    const pageSize = 1000;
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('admin_product_master')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      if (data && data.length > 0) {
        allProducts = allProducts.concat(data);
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          from += pageSize;
        }
      } else {
        hasMore = false;
      }
    }
    return allProducts;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allProds, catRes] = await Promise.all([
        fetchAllAdminProducts(),
        supabase.from('admin_master_categories').select('*').order('sort_order', { ascending: true })
      ]);
      setProducts(allProds);
      setCategories(catRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Products CRUD
  const handleOpenProductModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        category_id: product.category_id || '',
        barcode: product.barcode || '',
        sku: product.sku || '',
        price: product.price,
        cost_price: product.cost_price,
        description: product.description || '',
        image_url: product.image_url || '',
        is_active: product.is_active,
        is_pack: Boolean(product.is_pack)
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        barcode: '',
        sku: '',
        price: 0,
        cost_price: 0,
        description: '',
        image_url: '',
        is_active: true,
        is_pack: false
      });
    }
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: productForm.name,
        category_id: productForm.category_id || null,
        barcode: productForm.barcode || null,
        sku: productForm.sku || null,
        price: Number(productForm.price),
        cost_price: Number(productForm.cost_price),
        description: productForm.description || null,
        image_url: productForm.image_url || null,
        is_active: productForm.is_active,
        is_pack: Boolean(productForm.is_pack)
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('admin_product_master')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_product_master')
          .insert(payload);
        if (error) throw error;
      }
      setShowProductModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    }
  };

  const handleProductDelete = async (id: string) => {
    if (!confirm('ยืนยันลบสินค้านี้ใช่หรือไม่?')) return;
    try {
      const { error } = await supabase
        .from('admin_product_master')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setSelectedProductIds(prev => prev.filter(item => item !== id));
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error deleting product');
    }
  };

  // Single Product Pack Toggle
  const handleToggleProductPack = async (product: Product) => {
    const nextVal = !Boolean(product.is_pack);
    try {
      const { error } = await supabase
        .from('admin_product_master')
        .update({ is_pack: nextVal })
        .eq('id', product.id);

      if (error) {
        if (error.message && error.message.includes('is_pack')) {
          alert('ยังไม่มีคอลัมน์ is_pack ใน Supabase กรุณารัน SQL: ALTER TABLE admin_product_master ADD COLUMN IF NOT EXISTS is_pack BOOLEAN DEFAULT false; ใน SQL Editor ก่อนครับ');
          return;
        }
        throw error;
      }

      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_pack: nextVal } : p));
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการปรับสถานะสินค้าแพ็ก');
    }
  };

  // Bulk Product Pack Update (แก้พร้อมกันหลายชิ้น)
  const handleBulkSetPack = async (isPack: boolean) => {
    if (selectedProductIds.length === 0) return;
    const count = selectedProductIds.length;
    const label = isPack ? 'สินค้าแพ็ก' : 'สินค้าปกติ (เดี่ยว)';
    if (!confirm(`คุณต้องการเปลี่ยนสินค้าที่เลือกทั้ง ${count} รายการ ให้เป็น "${label}" ใช่หรือไม่?`)) return;

    setIsBulkOperating(true);
    try {
      const { error } = await supabase
        .from('admin_product_master')
        .update({ is_pack: isPack })
        .in('id', selectedProductIds);

      if (error) {
        if (error.message && error.message.includes('is_pack')) {
          alert('ยังไม่มีคอลัมน์ is_pack ในฐานข้อมูล Supabase กรุณารันคำสั่ง SQL ก่อนครับ:\nALTER TABLE admin_product_master ADD COLUMN IF NOT EXISTS is_pack BOOLEAN DEFAULT false;');
          return;
        }
        throw error;
      }

      alert(`อัปเดตสถานะเป็น "${label}" เรียบร้อยแล้ว ${count} รายการ`);
      setSelectedProductIds([]);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปเดต');
    } finally {
      setIsBulkOperating(false);
    }
  };

  // Auto-detect pack items from product names (แถมตัวช่วยสแกนคำว่า แพ็ค/แพค/pack)
  const handleAutoDetectPack = async () => {
    const packKeywords = ['แพ็ค', 'แพค', 'pack', 'ลัง', 'กล่องใหญ่', 'x 6', 'x 12', 'x 24', 'x 48', 'แพ็ก'];
    const candidates = products.filter(p => {
      const lower = p.name.toLowerCase();
      const hasKeyword = packKeywords.some(k => lower.includes(k));
      return hasKeyword && !p.is_pack;
    });

    if (candidates.length === 0) {
      alert('ไม่พบสินค้าที่มีคำว่า "แพ็ค/pack" ที่ยังไม่ได้ระบุสถานะแพ็กครับ');
      return;
    }

    const candidateIds = candidates.map(p => p.id);
    if (!confirm(`ระบบตรวจพบสินค้าที่มีคำว่า "แพ็ค" หรือ "pack" ในชื่อ จำนวน ${candidateIds.length} รายการ\nต้องการเปลี่ยนทั้งหมดเป็น "สินค้าแพ็ก" หรือไม่?`)) {
      return;
    }

    setIsBulkOperating(true);
    try {
      const { error } = await supabase
        .from('admin_product_master')
        .update({ is_pack: true })
        .in('id', candidateIds);

      if (error) {
        if (error.message && error.message.includes('is_pack')) {
          alert('ยังไม่มีคอลัมน์ is_pack ใน Supabase กรุณารันคำสั่ง SQL ก่อนครับ');
          return;
        }
        throw error;
      }

      alert(`ตั้งค่าสินค้าแพ็กอัตโนมัติสำเร็จ ${candidateIds.length} รายการ`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปเดตอัตโนมัติ');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllPageProducts = (pageIds: string[]) => {
    const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedProductIds.includes(id));
    if (allPageSelected) {
      setSelectedProductIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const selectAllFiltered = (allFilteredIds: string[]) => {
    setSelectedProductIds(allFilteredIds);
  };

  const handleBulkProductDelete = async () => {
    if (selectedProductIds.length === 0) return;
    const count = selectedProductIds.length;
    if (!confirm(`คุณต้องการลบสินค้าที่เลือกทั้งหมด ${count} รายการ ใช่หรือไม่?\n(การกระทำนี้ไม่สามารถเรียกคืนได้)`)) return;

    setIsBulkOperating(true);
    try {
      const { error } = await supabase
        .from('admin_product_master')
        .delete()
        .in('id', selectedProductIds);

      if (error) throw error;

      alert(`ลบสินค้าเรียบร้อยแล้ว ${count} รายการ`);
      setSelectedProductIds([]);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบสินค้าที่เลือก');
    } finally {
      setIsBulkOperating(false);
    }
  };

  // Categories CRUD
  const handleOpenCategoryModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        sort_order: category.sort_order,
        is_active: category.is_active
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        sort_order: 0,
        is_active: true
      });
    }
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('admin_master_categories')
          .update({
            name: categoryForm.name,
            sort_order: Number(categoryForm.sort_order),
            is_active: categoryForm.is_active
          })
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_master_categories')
          .insert({
            name: categoryForm.name,
            sort_order: Number(categoryForm.sort_order),
            is_active: categoryForm.is_active
          });
        if (error) throw error;
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        sort_order: 0,
        is_active: true
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error saving category');
    }
  };

  const handleCategoryDelete = async (id: string) => {
    if (!confirm('ยืนยันลบหมวดหมู่นี้ใช่หรือไม่?')) return;
    try {
      const { error } = await supabase
        .from('admin_master_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    }
  };

  // Filtered & Paginated Products calculation
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategoryId, filterStatus, filterPackType, filterImageFilter, sortBy]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBarcode = p.barcode?.toLowerCase().includes(q);
          const matchSku = p.sku?.toLowerCase().includes(q);
          const catName = categories.find((c) => c.id === p.category_id)?.name.toLowerCase() || '';
          const matchCat = catName.includes(q);
          if (!matchName && !matchBarcode && !matchSku && !matchCat) return false;
        }
        if (filterCategoryId !== 'ALL' && p.category_id !== filterCategoryId) {
          return false;
        }
        if (filterStatus === 'ACTIVE' && !p.is_active) return false;
        if (filterStatus === 'INACTIVE' && p.is_active) return false;
        if (filterPackType === 'PACK' && !p.is_pack) return false;
        if (filterPackType === 'SINGLE' && p.is_pack) return false;
        if (filterImageFilter === 'EXTERNAL' && (!p.image_url || isR2Image(p.image_url))) return false;
        if (filterImageFilter === 'R2' && (!p.image_url || !isR2Image(p.image_url))) return false;
        if (filterImageFilter === 'NO_IMAGE' && p.image_url) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'POPULAR') return (b.import_count || 0) - (a.import_count || 0);
        if (sortBy === 'NEWEST') return (new Date(b.created_at || 0).getTime()) - (new Date(a.created_at || 0).getTime());
        if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name, 'th');
        if (sortBy === 'PRICE_ASC') return a.price - b.price;
        if (sortBy === 'PRICE_DESC') return b.price - a.price;
        return 0;
      });
  }, [products, categories, searchTerm, filterCategoryId, filterStatus, filterPackType, sortBy]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    if (itemsPerPage === -1) return filteredProducts;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const pageProductIds = useMemo(() => paginatedProducts.map(p => p.id), [paginatedProducts]);
  const isAllPageSelected = pageProductIds.length > 0 && pageProductIds.every(id => selectedProductIds.includes(id));
  const isSomePageSelected = pageProductIds.some(id => selectedProductIds.includes(id)) && !isAllPageSelected;

  const packCount = useMemo(() => products.filter(p => Boolean(p.is_pack)).length, [products]);
  const singleCount = useMemo(() => products.filter(p => !Boolean(p.is_pack)).length, [products]);

  const isR2Image = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return url.includes('img.pos-foodscan.com') || (Boolean(process.env.NEXT_PUBLIC_R2_PUBLIC_URL) && url.includes(process.env.NEXT_PUBLIC_R2_PUBLIC_URL!));
  };

  const r2ImageCount = useMemo(() => products.filter(p => isR2Image(p.image_url)).length, [products]);
  const externalImageCount = useMemo(() => products.filter(p => p.image_url && !isR2Image(p.image_url)).length, [products]);
  const noImageCount = useMemo(() => products.filter(p => !p.image_url).length, [products]);

  const handleMigrateSingle = async (productId: string) => {
    try {
      setMigratingIds(prev => new Set(prev).add(productId));
      const res = await fetch('/api/admin/products/migrate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
      const data = await res.json();
      if (data.success && data.results?.[0]?.new_url) {
        const newUrl = data.results[0].new_url;
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, image_url: newUrl } : p));
      } else {
        alert(data.results?.[0]?.error || data.error || 'ย้ายรูปภาพไม่สำเร็จ');
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setMigratingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleBulkMigrateImages = async () => {
    const targets = products.filter(p => selectedProductIds.includes(p.id) && p.image_url && !isR2Image(p.image_url));
    if (targets.length === 0) {
      alert('ไม่มีรายการที่มีรูปภาพภายนอกในสินค้าที่เลือก');
      return;
    }
    if (!confirm(`ยืนยันย้ายรูปภาพของสินค้าที่เลือกจำนวน ${targets.length} รายการ ขึ้น Cloudflare R2 ใช่หรือไม่?`)) return;

    setIsBulkOperating(true);
    try {
      const res = await fetch('/api/admin/products/migrate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: targets.map(p => p.id) }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedMap = new Map<string, string>();
        data.results?.forEach((r: any) => {
          if (r.status === 'success' && r.new_url) {
            updatedMap.set(r.id, r.new_url);
          }
        });
        setProducts(prev => prev.map(p => updatedMap.has(p.id) ? { ...p, image_url: updatedMap.get(p.id)! } : p));
        setSelectedProductIds([]);
        alert(`ย้ายรูปภาพสำเร็จ ${data.summary?.migrated || 0} รายการ!`);
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการย้ายรูปภาพ');
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleStartBatchMigration = async () => {
    try {
      setBatchMigrateRunning(true);
      setStopBatchRequested(false);

      const res = await fetch('/api/admin/products/migrate-image');
      const data = await res.json();
      const ids: string[] = data.external_ids || [];

      setBatchMigrateProgress({ current: 0, total: ids.length, failed: 0 });

      if (ids.length === 0) {
        alert('รูปภาพสินค้าทั้งหมดอยู่บน Cloudflare R2 เรียบร้อยแล้ว!');
        setBatchMigrateRunning(false);
        return;
      }

      const chunkSize = 5;
      let processed = 0;
      let failed = 0;

      for (let i = 0; i < ids.length; i += chunkSize) {
        if (stopBatchRequested) break;

        const chunk = ids.slice(i, i + chunkSize);
        try {
          const postRes = await fetch('/api/admin/products/migrate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_ids: chunk }),
          });
          const postData = await postRes.json();
          if (postData.success) {
            const updatedMap = new Map<string, string>();
            postData.results?.forEach((r: any) => {
              if (r.status === 'success' && r.new_url) {
                updatedMap.set(r.id, r.new_url);
              } else if (r.status === 'failed') {
                failed++;
              }
            });
            setProducts(prev => prev.map(p => updatedMap.has(p.id) ? { ...p, image_url: updatedMap.get(p.id)! } : p));
          }
        } catch (_) {
          failed += chunk.length;
        }

        processed = Math.min(ids.length, i + chunk.length);
        setBatchMigrateProgress({ current: processed, total: ids.length, failed });
      }
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setBatchMigrateRunning(false);
    }
  };

  // Category search state
  const [categorySearch, setCategorySearch] = useState('');
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    return categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categories, categorySearch]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 px-4 md:px-8 text-slate-700">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full w-fit mb-2 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              ระบบจัดการหลังบ้าน SuparPOS Admin
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#1E3A27] tracking-tight">
              คลังสินค้าแอดมินกลาง
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              จัดการรายการสินค้ามาตรฐาน แยกประเภทสินค้าเดี่ยว / สินค้าแพ็ก สำหรับสาขาดึงไปใช้งาน
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowBatchMigrateModal(true)}
              className="px-3.5 py-2.5 bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-800 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
              title="ตรวจสอบและย้ายรูปภาพสินค้าจากลิงก์ภายนอกขึ้น Cloudflare R2 ของเรา"
            >
              <IconCloud />
              <span>ย้ายรูปไป Cloudflare</span>
              {externalImageCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold">
                  {externalImageCount}
                </span>
              )}
            </button>
            <button
              onClick={handleAutoDetectPack}
              className="px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
              title="ตรวจจับสินค้าที่มีคำว่า 'แพ็ค' หรือ 'pack' ในชื่อแล้วตั้งค่าเป็นสินค้าแพ็กอัตโนมัติ"
            >
              <IconLayers />
              <span>ตรวจหาแพ็กอัตโนมัติ</span>
            </button>
            <button
              onClick={downloadCSVTemplate}
              className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <IconDownload />
              <span>ดาวน์โหลดเทมเพลต</span>
            </button>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
              id="admin_csv_import"
            />
            <label
              htmlFor="admin_csv_import"
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <IconUpload />
              <span>นำเข้า CSV</span>
            </label>
            <button
              onClick={() => handleOpenProductModal()}
              className="px-4 py-2.5 bg-[#2C4A34] hover:bg-[#1E3A27] text-white rounded-xl font-bold text-xs shadow-md shadow-[#2C4A34]/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <IconPlus />
              <span>เพิ่มสินค้าใหม่</span>
            </button>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
            <div className="text-xs font-semibold text-slate-400 mb-1">สินค้าทั้งหมด</div>
            <div className="text-2xl font-black text-slate-800">
              {products.length.toLocaleString()} <span className="text-xs font-normal text-slate-500">รายการ</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
            <div className="text-xs font-semibold text-slate-400 mb-1">สินค้าปกติ (เดี่ยว)</div>
            <div className="text-2xl font-black text-slate-700">
              {singleCount.toLocaleString()} <span className="text-xs font-normal text-slate-500">ชิ้น</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
            <div className="text-xs font-semibold text-slate-400 mb-1">สินค้าแพ็ก (Pack)</div>
            <div className="text-2xl font-black text-emerald-800">
              {packCount.toLocaleString()} <span className="text-xs font-normal text-slate-500">แพ็ก</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
            <div className="text-xs font-semibold text-slate-400 mb-1">หมวดหมู่ทั้งหมด</div>
            <div className="text-2xl font-black text-slate-800">
              {categories.length.toLocaleString()} <span className="text-xs font-normal text-slate-500">หมวดหมู่</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-5 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'border-[#2C4A34] text-[#2C4A34] bg-emerald-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>สินค้ากลาง</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'products' ? 'bg-[#2C4A34] text-white' : 'bg-slate-100 text-slate-600'}`}>
                {products.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-5 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'categories'
                  ? 'border-[#2C4A34] text-[#2C4A34] bg-emerald-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>หมวดหมู่สินค้า</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'categories' ? 'bg-[#2C4A34] text-white' : 'bg-slate-100 text-slate-600'}`}>
                {categories.length}
              </span>
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            title="รีเฟรชข้อมูล"
          >
            <IconRefresh />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl border border-slate-200/80">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#2C4A34] mb-3"></div>
            <p className="text-xs font-semibold text-slate-400">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <div>
            {/* TAB: PRODUCTS */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                
                {/* Search & Filters */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                    
                    {/* Search */}
                    <div className="lg:col-span-4 relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <IconSearch />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ค้นหาชื่อสินค้า, บาร์โค้ด, SKU..."
                        className="w-full pl-10 pr-8 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-[#2C4A34] transition-all"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Pack Type Filter (New!) */}
                    <div className="lg:col-span-2">
                      <select
                        value={filterPackType}
                        onChange={(e) => setFilterPackType(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-[#2C4A34] font-medium text-slate-700 transition-all"
                      >
                        <option value="ALL">รูปแบบ: ทั้งหมด ({products.length})</option>
                        <option value="SINGLE">สินค้าเดี่ยว ({singleCount})</option>
                        <option value="PACK">สินค้าแพ็ก ({packCount})</option>
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div className="lg:col-span-2">
                      <select
                        value={filterCategoryId}
                        onChange={(e) => setFilterCategoryId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-[#2C4A34] font-medium text-slate-700 transition-all"
                      >
                        <option value="ALL">หมวดหมู่: ทั้งหมด</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="lg:col-span-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-[#2C4A34] font-medium text-slate-700 transition-all"
                      >
                        <option value="ALL">สถานะ: ทั้งหมด</option>
                        <option value="ACTIVE">เปิดใช้งาน</option>
                        <option value="INACTIVE">ปิดการใช้งาน</option>
                      </select>
                    </div>

                    {/* Image Status Filter */}
                    <div className="lg:col-span-2">
                      <select
                        value={filterImageFilter}
                        onChange={(e) => setFilterImageFilter(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-[#2C4A34] font-medium text-slate-700 transition-all"
                      >
                        <option value="ALL">รูปภาพ: ทั้งหมด</option>
                        <option value="EXTERNAL">เฉพาะลิงก์นอก ({externalImageCount})</option>
                        <option value="R2">คลาวด์เราแล้ว ({r2ImageCount})</option>
                        <option value="NO_IMAGE">ไม่มีรูป ({noImageCount})</option>
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div className="lg:col-span-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-[#2C4A34] font-medium text-slate-700 transition-all"
                      >
                        <option value="POPULAR">เรียง: ยอดนิยม (ดึงบ่อยสุด)</option>
                        <option value="NEWEST">เรียง: มาใหม่ล่าสุด</option>
                        <option value="NAME_ASC">เรียง: ชื่อ ก-ฮ</option>
                        <option value="PRICE_ASC">ราคา: ต่ำไปสูง</option>
                        <option value="PRICE_DESC">ราคา: สูงไปต่ำ</option>
                      </select>
                    </div>
                  </div>

                  {/* Active filter tags */}
                  {(searchTerm || filterCategoryId !== 'ALL' || filterStatus !== 'ALL' || filterPackType !== 'ALL') && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400">เงื่อนไข:</span>
                        {searchTerm && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                            "{searchTerm}"
                          </span>
                        )}
                        {filterPackType !== 'ALL' && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md font-medium">
                            {filterPackType === 'PACK' ? 'เฉพาะสินค้าแพ็ก' : 'เฉพาะสินค้าเดี่ยว'}
                          </span>
                        )}
                        {filterCategoryId !== 'ALL' && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md font-medium">
                            หมวดหมู่: {categories.find(c => c.id === filterCategoryId)?.name}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilterCategoryId('ALL');
                          setFilterStatus('ALL');
                          setFilterPackType('ALL');
                          setSortBy('NEWEST');
                        }}
                        className="text-rose-600 hover:text-rose-700 font-semibold"
                      >
                        ล้างตัวกรอง
                      </button>
                    </div>
                  )}
                </div>

                {/* Bulk Action Bar (เมื่อเลือกสินค้าหลายชิ้น) */}
                {selectedProductIds.length > 0 && (
                  <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                        <IconCheck />
                      </div>
                      <div>
                        <div className="text-sm font-bold">
                          เลือกอยู่ {selectedProductIds.length.toLocaleString()} รายการ
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {isAllPageSelected ? 'เลือกสินค้าทั้งหมดในหน้านี้แล้ว' : 'กดเลือกทุกหน้าได้ด้านขวา'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedProductIds.length < filteredProducts.length && (
                        <button
                          onClick={() => selectAllFiltered(filteredProducts.map(p => p.id))}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
                        >
                          เลือกทุกหน้า ({filteredProducts.length.toLocaleString()} ชิ้น)
                        </button>
                      )}

                      {/* ปุ่มเปลี่ยนเป็นสินค้าแพ็กพร้อมกัน */}
                      <button
                        onClick={() => handleBulkSetPack(true)}
                        disabled={isBulkOperating}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                        title="เปลี่ยนรายการที่เลือกทั้งหมดให้เป็นสินค้าแพ็ก"
                      >
                        <IconLayers />
                        <span>ตั้งเป็นสินค้าแพ็ก ({selectedProductIds.length})</span>
                      </button>

                      {/* ปุ่มเปลี่ยนเป็นสินค้าปกติ (เดี่ยว) พร้อมกัน */}
                      <button
                        onClick={() => handleBulkSetPack(false)}
                        disabled={isBulkOperating}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs transition-all"
                        title="เปลี่ยนรายการที่เลือกทั้งหมดให้เป็นสินค้าปกติ"
                      >
                        <span>ตั้งเป็นสินค้าเดี่ยว ({selectedProductIds.length})</span>
                      </button>

                      {/* ปุ่มย้ายรูปขึ้น Cloudflare R2 */}
                      <button
                        onClick={handleBulkMigrateImages}
                        disabled={isBulkOperating}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                        title="อัปโหลดรูปภาพของรายการที่เลือกขึ้น Cloudflare R2"
                      >
                        <IconCloud />
                        <span>อัปโหลดรูปไป Cloudflare ({selectedProductIds.length})</span>
                      </button>

                      {/* ปุ่มลบ */}
                      <button
                        onClick={handleBulkProductDelete}
                        disabled={isBulkOperating}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1"
                      >
                        <IconTrash />
                        <span>ลบที่เลือก</span>
                      </button>

                      <button
                        onClick={() => setSelectedProductIds([])}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl font-medium text-xs transition-all"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                )}

                {/* Table Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  
                  {/* Table Status Bar */}
                  <div className="px-5 py-3.5 bg-[#FAF9F6] border-b border-slate-200/80 flex flex-wrap items-center justify-between text-xs font-semibold text-slate-500 gap-2">
                    <div className="flex items-center gap-2">
                      <span>พบ</span>
                      <span className="font-bold text-[#1E3A27]">{filteredProducts.length.toLocaleString()}</span>
                      <span>รายการ จากทั้งหมด {products.length.toLocaleString()} รายการ</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span>แสดงต่อหน้า:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={-1}>ทั้งหมด</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
                      <thead className="bg-[#FAF9F5] font-bold text-[#2C4A34] text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3.5 w-12 text-center">
                            <input
                              type="checkbox"
                              checked={isAllPageSelected}
                              ref={(el) => {
                                if (el) el.indeterminate = isSomePageSelected;
                              }}
                              onChange={() => toggleSelectAllPageProducts(pageProductIds)}
                              className="w-4 h-4 text-[#2C4A34] rounded border-slate-300 focus:ring-[#2C4A34] cursor-pointer"
                              title="เลือกทั้งหมดในหน้านี้"
                            />
                          </th>
                          <th className="px-4 py-3.5 w-16 text-center">รูปภาพ</th>
                          <th className="px-4 py-3.5">ชื่อสินค้า / บาร์โค้ด</th>
                          <th className="px-4 py-3.5 text-center w-28">ประเภทสินค้า</th>
                          <th className="px-4 py-3.5">หมวดหมู่</th>
                          <th className="px-4 py-3.5">SKU</th>
                          <th className="px-4 py-3.5 text-right">ราคาขาย</th>
                          <th className="px-4 py-3.5 text-right">ราคาทุน</th>
                          <th className="px-4 py-3.5 text-center">สถานะ</th>
                          <th className="px-4 py-3.5 text-center w-24">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedProducts.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="text-center py-16 text-slate-400">
                              <div className="flex flex-col items-center justify-center">
                                <span className="font-bold text-slate-600 text-base mb-1">ไม่พบสินค้าที่ตรงกับเงื่อนไข</span>
                                <span className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหา หรือกดล้างตัวกรองดูนะครับ</span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedProducts.map((p) => {
                            const catName = categories.find((c) => c.id === p.category_id)?.name || '-';
                            const isSelected = selectedProductIds.includes(p.id);
                            const isPack = Boolean(p.is_pack);

                            return (
                              <tr
                                key={p.id}
                                className={`transition-colors group ${
                                  isSelected
                                    ? 'bg-emerald-50/70 hover:bg-emerald-50'
                                    : 'hover:bg-slate-50/80'
                                }`}
                              >
                                {/* Checkbox */}
                                <td className="px-4 py-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectProduct(p.id)}
                                    className="w-4 h-4 text-[#2C4A34] rounded border-slate-300 focus:ring-[#2C4A34] cursor-pointer"
                                  />
                                </td>

                                {/* Thumbnail */}
                                <td className="px-3 py-3 text-center min-w-[78px]">
                                  {p.image_url ? (
                                    <div className="flex flex-col items-center">
                                      {/* Image container with corner icon badge */}
                                      <div className="relative inline-block">
                                        <div
                                          onClick={() => setPreviewImage({ url: p.image_url!, title: p.name })}
                                          className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white p-0.5 cursor-pointer shadow-xs group-hover:scale-105 transition-transform"
                                          title="คลิกเพื่อดูรูปขนาดใหญ่"
                                        >
                                          <img
                                            src={p.image_url}
                                            alt={p.name}
                                            className="w-full h-full object-cover rounded-lg"
                                            onError={(e) => {
                                              (e.target as HTMLElement).style.display = 'none';
                                            }}
                                          />
                                        </div>

                                        {/* Corner status icon badge */}
                                        {isR2Image(p.image_url) ? (
                                          <div
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white"
                                            title="คลาวด์ของเรา (Cloudflare R2)"
                                          >
                                            <IconCloudCheck size={11} />
                                          </div>
                                        ) : (
                                          <div
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md border-2 border-white"
                                            title="รูปภาพลิงก์ภายนอก"
                                          >
                                            <IconExternalLink size={10} />
                                          </div>
                                        )}
                                      </div>

                                      {/* Sub-label / Action under image */}
                                      {isR2Image(p.image_url) ? (
                                        <span
                                          className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold whitespace-nowrap shadow-2xs"
                                          title="รูปภาพอยู่บน Cloudflare R2 ของเราแล้ว (ปลอดภัย ไม่โดนบล็อก)"
                                        >
                                          <IconCloudCheck size={11} />
                                          <span>R2</span>
                                        </span>
                                      ) : (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleMigrateSingle(p.id); }}
                                          disabled={migratingIds.has(p.id)}
                                          className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-[10px] font-bold whitespace-nowrap transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                                          title="รูปภาพลิงก์ภายนอก - คลิกเพื่อย้ายขึ้น Cloudflare R2 ของเรา"
                                        >
                                          {migratingIds.has(p.id) ? (
                                            <span className="animate-spin text-[10px] leading-none">↻</span>
                                          ) : (
                                            <IconCloudUpload size={11} />
                                          )}
                                          <span>อัป R2</span>
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <div className="w-12 h-12 mx-auto bg-slate-50 border border-slate-200 border-dashed rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-medium">
                                        ไม่มีรูป
                                      </div>
                                    </div>
                                  )}
                                </td>

                                {/* Name & Barcode */}
                                <td className="px-4 py-3">
                                  <div className="font-bold text-slate-800 text-sm group-hover:text-emerald-800 transition-colors">
                                    {p.name}
                                  </div>
                                  {p.barcode ? (
                                    <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                                      #{p.barcode}
                                    </div>
                                  ) : (
                                    <div className="text-[11px] text-slate-300 mt-0.5 italic">ไม่มีบาร์โค้ด</div>
                                  )}
                                </td>

                                {/* Column: ประเภทสินค้า (สลับ แพ็ก / เดี่ยว ได้ทันที) */}
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => handleToggleProductPack(p)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
                                      isPack
                                        ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                    }`}
                                    title={isPack ? 'คลิกเพื่อเปลี่ยนเป็นสินค้าเดี่ยว' : 'คลิกเพื่อเปลี่ยนเป็นสินค้าแพ็ก'}
                                  >
                                    {isPack ? 'สินค้าแพ็ก' : 'สินค้าเดี่ยว'}
                                  </button>
                                </td>

                                {/* Category */}
                                <td className="px-4 py-3">
                                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                                    {catName}
                                  </span>
                                </td>

                                {/* SKU */}
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                  {p.sku || '-'}
                                </td>

                                {/* Price */}
                                <td className="px-4 py-3 text-right">
                                  <span className="font-bold text-[#1E3A27] text-sm">
                                    ฿{p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </td>

                                {/* Cost Price */}
                                <td className="px-4 py-3 text-right text-xs text-slate-400">
                                  {p.cost_price ? `฿${p.cost_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                      p.is_active
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                                    {p.is_active ? 'พร้อมใช้' : 'ปิดการใช้งาน'}
                                  </span>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleOpenProductModal(p)}
                                      className="p-1.5 bg-slate-100 hover:bg-[#2C4A34] hover:text-white text-slate-600 rounded-lg transition-all"
                                      title="แก้ไข"
                                    >
                                      <IconEdit />
                                    </button>
                                    <button
                                      onClick={() => handleProductDelete(p.id)}
                                      className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition-all"
                                      title="ลบ"
                                    >
                                      <IconTrash />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  {filteredProducts.length > 0 && itemsPerPage !== -1 && totalPages > 1 && (
                    <div className="px-5 py-4 bg-[#FAF9F6] border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-semibold">
                      <div>
                        หน้า {currentPage} จาก {totalPages} (รวม {filteredProducts.length.toLocaleString()} รายการ)
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 text-slate-700 transition-colors"
                        >
                          «
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 text-slate-700 transition-colors"
                        >
                          ก่อนหน้า
                        </button>

                        <div className="flex items-center gap-1 px-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = currentPage;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-8 h-8 rounded-lg font-bold transition-colors ${
                                  currentPage === pageNum
                                    ? 'bg-[#2C4A34] text-white'
                                    : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 text-slate-700 transition-colors"
                        >
                          ถัดไป
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 text-slate-700 transition-colors"
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB: CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="relative w-full sm:w-80">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <IconSearch />
                    </span>
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="ค้นหาชื่อหมวดหมู่..."
                      className="w-full pl-10 pr-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-[#2C4A34] transition-all"
                    />
                  </div>

                  <button
                    onClick={() => handleOpenCategoryModal()}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#2C4A34] hover:bg-[#1E3A27] text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <IconPlus />
                    <span>เพิ่มหมวดหมู่ใหม่</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
                    <thead className="bg-[#FAF9F5] font-bold text-[#2C4A34] text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">ชื่อหมวดหมู่</th>
                        <th className="px-5 py-3.5">จำนวนสินค้าในหมวด</th>
                        <th className="px-5 py-3.5 text-center">ลำดับเรียง</th>
                        <th className="px-5 py-3.5 text-center">สถานะ</th>
                        <th className="px-5 py-3.5 text-center w-28">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCategories.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-slate-400 font-semibold">
                            ไม่พบข้อมูลหมวดหมู่
                          </td>
                        </tr>
                      ) : (
                        filteredCategories.map((c) => {
                          const prodCount = products.filter(p => p.category_id === c.id).length;
                          return (
                            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3.5 font-bold text-slate-800">
                                {c.name}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                                  {prodCount} รายการ
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-center font-mono text-xs text-slate-500">
                                {c.sort_order}
                              </td>
                              <td className="px-5 py-3.5 text-center">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                    c.is_active
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${c.is_active ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                                  {c.is_active ? 'เปิดใช้งาน' : 'ปิดการใช้งาน'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleOpenCategoryModal(c)}
                                    className="p-1.5 bg-slate-100 hover:bg-[#2C4A34] hover:text-white text-slate-600 rounded-lg transition-all"
                                    title="แก้ไข"
                                  >
                                    <IconEdit />
                                  </button>
                                  <button
                                    onClick={() => handleCategoryDelete(c.id)}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition-all"
                                    title="ลบ"
                                  >
                                    <IconTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-2xl p-4 text-center cursor-default"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-sm text-slate-800 truncate">{previewImage.title}</h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
            <div className="w-full aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Product Modal (Add / Edit) */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#1E3A27]">
                  {editingProduct ? 'แก้ไขสินค้าแอดมินกลาง' : 'เพิ่มสินค้าใหม่แอดมินกลาง'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">กรอกข้อมูลสินค้ามาตรฐานสำหรับใช้ร่วมกันทุกสาขา</p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อสินค้า <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-[#2C4A34] transition-all font-medium text-slate-800"
                  placeholder="เช่น น้ำดื่มสิงห์ 600 มล. แพ็ค 12"
                />
              </div>

              {/* Toggle สินค้าแพ็ก vs สินค้าปกติ */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="prod_is_pack"
                    checked={productForm.is_pack}
                    onChange={(e) => setProductForm({ ...productForm, is_pack: e.target.checked })}
                    className="w-4 h-4 text-[#2C4A34] rounded border-slate-300 focus:ring-[#2C4A34] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      สินค้าประเภทแพ็ก (Pack Product)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      ระบุว่าเป็นสินค้าที่ขายยกแพ็ก/ยกลัง (ไม่ใช่ชิ้นเดี่ยว)
                    </span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">หมวดหมู่สินค้า</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-[#2C4A34] font-medium text-slate-800"
                  >
                    <option value="">-- ไม่ระบุหมวดหมู่ --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">บาร์โค้ด (Barcode)</label>
                  <input
                    type="text"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-[#2C4A34] font-mono"
                    placeholder="เช่น 885..."
                  />
                </div>
              </div>

              {/* Image Upload / Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รูปภาพสินค้า</label>
                <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {productForm.image_url ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 relative group flex-shrink-0 bg-white">
                      <img src={productForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setProductForm(prev => ({ ...prev, image_url: '' }))}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                      >
                        ลบรูป
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-[10px] font-medium bg-white flex-shrink-0">
                      <span>ไม่มีรูป</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="admin_prod_file"
                      />
                      <label
                        htmlFor="admin_prod_file"
                        className={`inline-block px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs ${
                          uploadingImage ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        {uploadingImage ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ'}
                      </label>
                    </div>
                    <input
                      type="text"
                      value={productForm.image_url}
                      onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2C4A34]"
                      placeholder="หรือวาง URL รูปภาพที่นี่..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ราคาขายมาตรฐาน (฿) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-[#2C4A34] font-bold text-emerald-800 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ราคาทุนเริ่มต้น (฿)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.cost_price}
                    onChange={(e) => setProductForm({ ...productForm, cost_price: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-[#2C4A34] text-slate-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">รหัส SKU</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    placeholder="เช่น DRINK-001"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="prod_active"
                      checked={productForm.is_active}
                      onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                      className="w-4 h-4 text-[#2C4A34] rounded border-slate-300 focus:ring-[#2C4A34] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      เปิดใช้งานสินค้า
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">คำอธิบาย</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#2C4A34]"
                  placeholder="รายละเอียดสินค้า..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#2C4A34] hover:bg-[#1E3A27] text-white rounded-xl font-bold text-xs shadow-md shadow-[#2C4A34]/20 transition-all active:scale-95"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-[#1E3A27]">
                {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อหมวดหมู่ <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2C4A34] font-medium"
                  placeholder="เช่น เครื่องดื่ม, อาหารแห้ง"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ลำดับการจัดเรียง</label>
                <input
                  type="number"
                  value={categoryForm.sort_order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2C4A34]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cat_active"
                  checked={categoryForm.is_active}
                  onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#2C4A34] rounded border-slate-300 focus:ring-[#2C4A34]"
                />
                <label htmlFor="cat_active" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  เปิดใช้งานหมวดหมู่นี้
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#2C4A34] hover:bg-[#1E3A27] text-white rounded-xl font-bold text-xs shadow-sm"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Image Migration Modal */}
      {showBatchMigrateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <IconCloud />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">ย้ายรูปภาพขึ้น Cloudflare R2</h3>
                  <p className="text-xs text-slate-500">ป้องกันรูปภาพภายนอกโดนบล็อกหรือลิงก์เสีย</p>
                </div>
              </div>
              {!batchMigrateRunning && (
                <button
                  onClick={() => setShowBatchMigrateModal(false)}
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-2 py-1 text-center">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-500">สินค้าทั้งหมด</div>
                <div className="text-lg font-black text-slate-800 mt-0.5">{products.length}</div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <div className="text-[11px] font-bold text-emerald-800">คลาวด์เราแล้ว</div>
                <div className="text-lg font-black text-emerald-800 mt-0.5">{r2ImageCount}</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                <div className="text-[11px] font-bold text-amber-800">ต้องย้าย (ลิงก์นอก)</div>
                <div className="text-lg font-black text-amber-800 mt-0.5">{externalImageCount}</div>
              </div>
            </div>

            {/* Progress Bar (เมื่อกำลังทำงาน) */}
            {batchMigrateRunning ? (
              <div className="space-y-2 py-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>กำลังดาวน์โหลดและอัปโหลดขึ้น R2...</span>
                  <span className="text-sky-700">
                    {batchMigrateProgress.current} / {batchMigrateProgress.total} (
                    {batchMigrateProgress.total > 0
                      ? Math.round((batchMigrateProgress.current / batchMigrateProgress.total) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-sky-600 transition-all duration-300 rounded-full"
                    style={{
                      width: `${
                        batchMigrateProgress.total > 0
                          ? (batchMigrateProgress.current / batchMigrateProgress.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                {batchMigrateProgress.failed > 0 && (
                  <p className="text-xs text-rose-600">มีข้อผิดพลาดบางรายการ: {batchMigrateProgress.failed} รายการ</p>
                )}
              </div>
            ) : externalImageCount === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                <p className="text-sm font-bold text-emerald-900">รูปภาพทั้งหมดอยู่บน Cloudflare เรียบร้อยแล้ว</p>
                <p className="text-xs text-emerald-700">ไม่มีรูปภาพลิงก์ภายนอกที่ต้องย้ายแล้วครับ</p>
              </div>
            ) : (
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 space-y-1.5">
                <p className="font-bold">คำแนะนำก่อนเริ่มการทำงาน:</p>
                <p className="text-sky-800 leading-relaxed">
                  ระบบจะดาวน์โหลดรูปภาพจากลิงก์ภายนอกทีละชุด (ชุดละ 5 รายการ) แล้วส่งเข้าเก็บใน Cloudflare R2
                  ของร้านพร้อมเปลี่ยน URL ในฐานข้อมูลให้อัตโนมัติ โดยไม่กระทบการทำงานของระบบ
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              {batchMigrateRunning ? (
                <button
                  onClick={() => setStopBatchRequested(true)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all"
                >
                  หยุดชั่วคราว
                </button>
              ) : externalImageCount > 0 ? (
                <>
                  <button
                    onClick={() => setShowBatchMigrateModal(false)}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-sm"
                  >
                    ปิดหน้าต่าง
                  </button>
                  <button
                    onClick={handleStartBatchMigration}
                    className="flex-2 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold text-sm shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <IconCloud />
                    <span>เริ่มย้าย {externalImageCount} รูปไป Cloudflare</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowBatchMigrateModal(false)}
                  className="w-full py-3 bg-[#2C4A34] hover:bg-[#1E3A27] text-white rounded-2xl font-bold text-sm shadow-md"
                >
                  เสร็จสิ้นและปิดหน้าต่าง
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {cropModal.open && cropModal.image && (
        <div className="fixed inset-0 bg-black/80 flex flex-col justify-center items-center z-50 p-4">
          <div className="relative w-full max-w-md h-[400px] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            <Cropper
              image={cropModal.image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={(_croppedArea, croppedAreaPixels) => {
                setCroppedAreaPixels(croppedAreaPixels);
              }}
              onZoomChange={setZoom}
            />
          </div>

          <div className="w-full max-w-md bg-white p-4 rounded-2xl mt-3 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">ซูม:</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-[#2C4A34]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCropModal({ open: false, image: null })}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmCrop}
                disabled={uploadingImage}
                className="flex-1 py-2.5 bg-[#2C4A34] hover:bg-[#1E3A27] disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                {uploadingImage ? 'กำลังบันทึก...' : 'ตัดรูปและบันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
