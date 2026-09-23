'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import Cropper from 'react-easy-crop'; // ✅ เพิ่ม Library สำหรับ Crop

// --- Icons ---
interface IconProps { size?: number; className?: string; }
const IconLayout = ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
const IconEdit = ({ size = 14, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = ({ size = 14, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"/></svg>;
const IconImage = ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IconPlus = ({ size = 20, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconX = ({ size = 24, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconFilter = ({ size = 16, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const IconSearch = ({ size = 16, className = "" }: IconProps) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

const CDN_BASE_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

// --- IPhone Component ---
const IPhone15Pro = ({ src, size = 'lg', className = "" }: { src: string | null; size?: 'sm' | 'lg'; className?: string }) => {
    const isSm = size === 'sm';
    return (
        <div className={`relative mx-auto shadow-xl transition-all hover:scale-[1.02] duration-300 group bg-white ${
            isSm ? 'h-[230px] w-[114px] rounded-[1.8rem]' : 'h-[380px] w-[180px] rounded-[2.5rem]'
        } ${className}`}>
            <div className={`absolute inset-0 ${isSm ? 'border-[3px] rounded-[1.8rem]' : 'border-[4px] rounded-[2.5rem]'} border-slate-800 z-20 pointer-events-none ring-1 ring-white/10`}></div>
            <div className={`absolute ${isSm ? 'top-2 w-[30px] h-[9px]' : 'top-3 w-[30%] h-[20px]'} left-1/2 -translate-x-1/2 bg-black rounded-full z-30`}></div>
            <div className={`absolute ${isSm ? 'inset-[3px] rounded-[1.6rem]' : 'inset-[4px] rounded-[2.2rem]'} bg-slate-100 overflow-hidden z-10`}>
                {src ? (
                    <img 
                        src={src} 
                        className="h-full w-full object-cover" 
                        alt="Preview" 
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x800?text=No+Image"; }} 
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                        <IconImage size={isSm ? 18 : 24} />
                        <span className={`${isSm ? 'text-[8px]' : 'text-[10px]'} font-black uppercase tracking-widest mt-1`}>No Cover</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function AdminThemesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [themes, setThemes] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterPlan, setFilterPlan] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [uploadingState, setUploadingState] = useState<'cover' | 'mobile' | 'ipad' | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const initialFormState = { 
        name: '', slug: 'shop', theme_mode: 'standard', category_id: '', 
        price_monthly: 0, price_weekly: 0, price_yearly: 0, price_one_time: 0, 
        is_free_with_plan: false, is_active: true, min_plan: 'ultimate',
        description: '', long_description: '', image_url: '', features: [],
        gallery: { mobile: [], ipad: [] } as { mobile: string[], ipad: string[] }
    };
    const [formData, setFormData] = useState(initialFormState);

    // ✅ State สำหรับ Manual Crop
    const [cropModal, setCropModal] = useState<{ open: boolean, image: string | null, type: 'cover' | 'mobile' | 'ipad' }>({ open: false, image: null, type: 'cover' });
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const loadData = async () => {
        const [c, t] = await Promise.all([
            supabase.from('marketplace_categories').select('*').order('name'),
            supabase.from('marketplace_themes').select('*, marketplace_categories(name)').order('created_at', { ascending: false })
        ]);
        setCategories(c.data || []);
        setThemes(t.data || []);
    };

    useEffect(() => { loadData(); }, []);

    const filteredThemes = themes.filter(theme => {
        const matchesCategory = filterCategory === 'all' || theme.category_id === filterCategory;
        const matchesPlan = filterPlan === 'all' || (theme.min_plan || 'ultimate') === filterPlan;
        const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' 
            ? true 
            : filterStatus === 'active' 
                ? theme.is_active === true 
                : theme.is_active === false;
        return matchesCategory && matchesPlan && matchesSearch && matchesStatus;
    });

    const getImageUrl = (fileName: string | null) => {
        if (!fileName || fileName === '') return null;
        if (fileName.startsWith('http')) return fileName;
        if (fileName.startsWith('themes/')) return `${CDN_BASE_URL}/${fileName}`;
        return `${CDN_BASE_URL}/themes/${fileName}`;
    };

    // ✅ ฟังก์ชันเมื่อผู้ใช้เลือกไฟล์ (เปลี่ยนเป็นเปิด Modal Crop แทนการอัปโหลดทันที)
    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'mobile' | 'ipad') => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setCropModal({ open: true, image: reader.result as string, type }));
            reader.readAsDataURL(e.target.files[0]);
        }
        e.target.value = ''; // รีเซ็ต input
    };

    // ✅ ฟังก์ชันดึงรูปที่ Crop เสร็จแล้ว พร้อมบีบอัดให้ < 50KB
    const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<File> => {
        const image = new Image();
        image.src = imageSrc;
        await new Promise((resolve) => (image.onload = resolve));
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No 2d context');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);

        return new Promise((resolve, reject) => {
            let quality = 0.8;
            const targetSize = 50 * 1024; // 50KB
            const loop = () => {
                canvas.toBlob((blob) => {
                    if (blob && blob.size > targetSize && quality > 0.1) {
                        quality -= 0.1;
                        loop();
                    } else if (blob) {
                        resolve(new File([blob], `theme_${Date.now()}.webp`, { type: 'image/webp' }));
                    } else {
                        reject(new Error("Canvas to Blob failed"));
                    }
                }, 'image/webp', quality);
            };
            loop();
        });
    };

    // ✅ ฟังก์ชันกดยืนยันการ Crop และ Upload ขึ้น Cloudflare
    const handleConfirmCrop = async () => {
        if (!cropModal.image || !croppedAreaPixels) return;
        setIsSubmitting(true);
        setUploadingState(cropModal.type);
        try {
            const file = await getCroppedImg(cropModal.image, croppedAreaPixels);
            const fd = new FormData();
            fd.append("file", file);
            fd.append("folder", "themes");

            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if(!res.ok) throw new Error("Upload API Error");
            const data = await res.json();

            if (cropModal.type === 'cover') {
                setFormData(prev => ({ ...prev, image_url: data.fileName }));
            } else {
                // ✅ บังคับ Type ให้ TypeScript รู้แน่ๆ ว่าเหลือแค่ mobile หรือ ipad
                const galleryType = cropModal.type as 'mobile' | 'ipad';
                
                setFormData(prev => ({
                    ...prev,
                    gallery: { 
                        ...prev.gallery, 
                        [galleryType]: [...(prev.gallery[galleryType] || []), data.fileName] 
                    }
                }));
            }
            // ปิด Modal หลังอัปโหลดเสร็จ
            setCropModal({ open: false, image: null, type: 'cover' });
        } catch (e: any) { 
            alert("Upload failed: " + e.message); 
        } finally {
            setIsSubmitting(false);
            setUploadingState(null);
        }
    };

    const removeImage = (type: 'mobile' | 'ipad', indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            gallery: { ...prev.gallery, [type]: prev.gallery[type].filter((_, index) => index !== indexToRemove) }
        }));
    };

    const openCreateModal = () => { setEditingId(null); setFormData(initialFormState); setShowModal(true); };
    const openEditModal = (theme: any) => {
        setEditingId(theme.id);
        setFormData({ ...initialFormState, ...theme, gallery: theme.gallery || { mobile: [], ipad: [] }, min_plan: theme.min_plan || 'ultimate' });
        setShowModal(true);
    };
    const closeModal = () => { setShowModal(false); setEditingId(null); setFormData(initialFormState); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const { marketplace_categories, id, ...payload } = formData as any;
        let result = editingId ? await supabase.from('marketplace_themes').update(payload).eq('id', editingId) : await supabase.from('marketplace_themes').insert(payload);
        if (!result.error) { loadData(); closeModal(); alert('บันทึกสำเร็จ!'); } 
        else { alert('Error: ' + result.error.message); }
        setIsSubmitting(false);
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        setIsSubmitting(true);
        const result = await supabase.from('marketplace_themes').update({ is_active: !currentStatus }).eq('id', id);
        if (!result.error) {
            await loadData();
        } else {
            alert('Error: ' + result.error.message);
        }
        setIsSubmitting(false);
    };

    const handleSelectTheme = (id: string, isChecked: boolean) => {
        setSelectedIds(prev => 
            isChecked ? [...prev, id] : prev.filter(x => x !== id)
        );
    };

    const handleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            setSelectedIds(filteredThemes.map(t => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleBatchStatus = async (status: boolean) => {
        if (selectedIds.length === 0) return;
        setIsSubmitting(true);
        const result = await supabase
            .from('marketplace_themes')
            .update({ is_active: status })
            .in('id', selectedIds);
            
        if (!result.error) {
            await loadData();
            setSelectedIds([]);
            alert(`อัปเดตสถานะ ${selectedIds.length} ธีมเรียบร้อยแล้ว!`);
        } else {
            alert('Error: ' + result.error.message);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto font-sans text-slate-900 bg-slate-50/50 min-h-screen relative">
            {/* Header & Filter (คงเดิม) */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl"><IconLayout /></div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight uppercase italic text-slate-900">Theme Master</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage Cover & Gallery</p>
                    </div>
                </div>
                <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2">
                    <IconPlus /> Create New Theme
                </button>
            </header>

            <div className="mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="selectAllThemes"
                        checked={filteredThemes.length > 0 && filteredThemes.every(t => selectedIds.includes(t.id))}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="selectAllThemes" className="text-xs font-bold text-slate-500 uppercase cursor-pointer select-none">เลือกทั้งหมด</label>
                </div>
                <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                <div className="relative w-full md:w-auto flex-grow md:flex-grow-0">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Search themes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 w-full md:w-64 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-wider"><IconFilter /></div>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Categories</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <div className="flex gap-2">
                    {['all', 'free', 'basic', 'pro', 'ultimate'].map(plan => (
                        <button key={plan} onClick={() => setFilterPlan(plan)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${filterPlan === plan ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>{plan}</button>
                    ))}
                </div>
                <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                <div className="flex gap-1.5">
                    {[
                        { label: 'ทั้งหมด', value: 'all' },
                        { label: 'เปิดขาย', value: 'active' },
                        { label: 'ปิดขาย', value: 'inactive' }
                    ].map(status => (
                        <button 
                            key={status.value} 
                            onClick={() => setFilterStatus(status.value as any)} 
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
                                filterStatus === status.value 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
                <div className="ml-auto text-xs font-bold text-slate-400">Showing {filteredThemes.length} themes</div>
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredThemes.map(t => (
                    <div key={t.id} className="bg-white p-5 rounded-[30px] shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col relative overflow-hidden">
                        <div className="absolute top-4 left-4 z-10">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleStatus(t.id, t.is_active);
                                }}
                                disabled={isSubmitting}
                                className={`text-[9px] font-black px-3 py-1 rounded-full uppercase mb-1 shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-1 ${
                                    t.is_active 
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                                }`}
                                title="คลิกเพื่อเปลี่ยนสถานะเปิด/ปิดขาย"
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                                {t.is_active ? 'เปิดขาย' : 'ปิดขาย'}
                            </button>
                        </div>
                        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                             <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase shadow-sm ${t.min_plan === 'free' ? 'bg-green-100 text-green-600' : t.min_plan === 'ultimate' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                {t.min_plan || 'Ultimate'}
                            </span>
                            <input 
                                type="checkbox"
                                checked={selectedIds.includes(t.id)}
                                onChange={(e) => {
                                    handleSelectTheme(t.id, e.target.checked);
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all active:scale-90"
                            />
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-black text-slate-800 uppercase text-sm truncate pr-2" title={t.name}>{t.name}</h3>
                        </div>
                        <div className="bg-slate-50 rounded-[25px] p-6 mb-4 group-hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => openEditModal(t)}>
                            <div className="w-full flex justify-center pointer-events-none transform scale-90">
                                <IPhone15Pro src={getImageUrl(t.image_url)} />
                            </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center border-t border-slate-50 pt-3">
                            <button onClick={() => openEditModal(t)} className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-wider flex items-center gap-1 w-full justify-center py-2">
                                <IconEdit /> Edit Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- SINGLE PAGE MODAL FORM --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-5xl max-h-[94vh] overflow-hidden relative z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
                        
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${editingId ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {editingId ? <IconEdit size={18} /> : <IconPlus size={18} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-black text-slate-800 uppercase tracking-wide">
                                            {editingId ? 'แก้ไขข้อมูลธีม (Edit Theme)' : 'เพิ่มธีมใหม่ (Create Theme)'}
                                        </h2>
                                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                            formData.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {formData.is_active ? 'Active' : 'Draft'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium">กำหนดรูปภาพ รายละเอียด และราคาแพ็กเกจ</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {/* Toggle Active Button in Header */}
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all border ${
                                        formData.is_active 
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                    }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${formData.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                    <span>{formData.is_active ? 'เปิดขายอยู่' : 'ปิดการขาย'}</span>
                                </button>
                                
                                <button 
                                    onClick={closeModal} 
                                    className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors ml-1"
                                >
                                    <IconX size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
                            <form id="theme-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                                
                                {/* LEFT COL: MEDIA & PREVIEW (5 cols) */}
                                <div className="lg:col-span-5 space-y-4">
                                    {/* Cover Card */}
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                                        <div className="w-full flex justify-between items-center mb-3">
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                                <IconImage size={15} className="text-blue-500" /> รูปหน้าปก (Cover)
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                                &lt; 50KB
                                            </span>
                                        </div>

                                        <div className="py-1">
                                            <IPhone15Pro src={getImageUrl(formData.image_url)} size="sm" />
                                        </div>

                                        <label className="mt-3 w-full cursor-pointer bg-slate-900 text-white hover:bg-blue-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98">
                                            <IconImage size={15} />
                                            <span>{uploadingState === 'cover' ? 'กำลังอัปโหลด...' : formData.image_url ? 'เปลี่ยนรูปหน้าปก' : 'อัปโหลดรูปหน้าปก'}</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => onSelectFile(e, 'cover')} disabled={uploadingState !== null} />
                                        </label>
                                    </div>

                                    {/* Mobile Gallery Card */}
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-2.5">
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                                📱 มือถือ (Mobile Gallery)
                                            </span>
                                            <label className="cursor-pointer text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-colors flex items-center gap-1">
                                                <IconPlus size={12} /> {uploadingState === 'mobile' ? 'รอสักครู่...' : 'เพิ่มรูป'}
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => onSelectFile(e, 'mobile')} disabled={uploadingState !== null} />
                                            </label>
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto pb-1 min-h-[64px] items-center">
                                            {formData.gallery.mobile.map((img, idx) => (
                                                <div key={idx} className="relative flex-shrink-0 w-12 h-20 rounded-lg overflow-hidden border border-slate-200 group bg-slate-100 shadow-2xs">
                                                    <img src={getImageUrl(img) || ""} className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeImage('mobile', idx)} 
                                                        className="absolute inset-0 bg-red-600/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="ลบรูปภาพ"
                                                    >
                                                        <IconTrash size={12}/>
                                                    </button>
                                                </div>
                                            ))}
                                            {formData.gallery.mobile.length === 0 && (
                                                <div className="text-[11px] text-slate-400 py-3 text-center w-full border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                                    ยังไม่มีรูปในแกลเลอรีมือถือ
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* iPad Gallery Card */}
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-2.5">
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                                📟 แท็บเล็ต (iPad Gallery)
                                            </span>
                                            <label className="cursor-pointer text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-colors flex items-center gap-1">
                                                <IconPlus size={12} /> {uploadingState === 'ipad' ? 'รอสักครู่...' : 'เพิ่มรูป'}
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => onSelectFile(e, 'ipad')} disabled={uploadingState !== null} />
                                            </label>
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto pb-1 min-h-[64px] items-center">
                                            {formData.gallery.ipad.map((img, idx) => (
                                                <div key={idx} className="relative flex-shrink-0 w-16 h-18 rounded-lg overflow-hidden border border-slate-200 group bg-slate-100 shadow-2xs">
                                                    <img src={getImageUrl(img) || ""} className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeImage('ipad', idx)} 
                                                        className="absolute inset-0 bg-red-600/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="ลบรูปภาพ"
                                                    >
                                                        <IconTrash size={12}/>
                                                    </button>
                                                </div>
                                            ))}
                                            {formData.gallery.ipad.length === 0 && (
                                                <div className="text-[11px] text-slate-400 py-3 text-center w-full border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                                    ยังไม่มีรูปในแกลเลอรี iPad
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT COL: FORM FIELDS (7 cols) */}
                                <div className="lg:col-span-7 space-y-4">
                                    
                                    {/* Section 1: ข้อมูลทั่วไป */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                                1. ข้อมูลทั่วไปของธีม (General Info)
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                                                    หมวดหมู่ (Category) <span className="text-red-500">*</span>
                                                </label>
                                                <select 
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                                                    value={formData.category_id} 
                                                    onChange={e => setFormData({...formData, category_id: e.target.value})} 
                                                    required
                                                >
                                                    <option value="">เลือกหมวดหมู่...</option>
                                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                                                    ชื่อธีม (Theme Name) <span className="text-red-500">*</span>
                                                </label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                                                    value={formData.name} 
                                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                                    required 
                                                    placeholder="เช่น Minimal Cafe, Luxury Shop" 
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                                                    Slug (Unique ID) <span className="text-red-500">*</span>
                                                </label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                                                    value={formData.slug} 
                                                    onChange={e => setFormData({...formData, slug: e.target.value})} 
                                                    required 
                                                    placeholder="theme-slug"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                                                    ธีมโหมด (Mode) <span className="text-red-500">*</span>
                                                </label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 uppercase focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                                                    value={formData.theme_mode} 
                                                    onChange={e => setFormData({...formData, theme_mode: e.target.value})} 
                                                    placeholder="STD / LUXURY / MINIMAL" 
                                                    required 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                                                คำอธิบายสั้น (Short Description)
                                            </label>
                                            <textarea 
                                                rows={2}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none" 
                                                value={formData.description} 
                                                onChange={e => setFormData({...formData, description: e.target.value})}
                                                placeholder="เขียนคำอธิบายสั้นๆ เกี่ยวกับธีมนี้..."
                                            />
                                        </div>
                                    </div>

                                    {/* Section 2: ราคาและเงื่อนไขแพ็กเกจ */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                                2. กำหนดราคา & สิทธิ์การใช้งาน (Pricing & Access)
                                            </h3>
                                        </div>
                                        
                                        {/* 4 Pricing Boxes */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-2.5 text-center">
                                                <label className="text-[10px] font-black text-blue-600 uppercase block mb-1">รายเดือน</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full py-1 px-1 bg-white border border-blue-200 rounded-lg font-black text-xs text-blue-900 text-center outline-none focus:ring-2 focus:ring-blue-500" 
                                                    value={formData.price_monthly} 
                                                    onChange={e => setFormData({...formData, price_monthly: Number(e.target.value)})} 
                                                />
                                                <span className="text-[9px] text-blue-400 font-bold mt-0.5 block">฿ / เดือน</span>
                                            </div>

                                            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-2.5 text-center">
                                                <label className="text-[10px] font-black text-purple-600 uppercase block mb-1">รายสัปดาห์</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full py-1 px-1 bg-white border border-purple-200 rounded-lg font-black text-xs text-purple-900 text-center outline-none focus:ring-2 focus:ring-purple-500" 
                                                    value={formData.price_weekly} 
                                                    onChange={e => setFormData({...formData, price_weekly: Number(e.target.value)})} 
                                                />
                                                <span className="text-[9px] text-purple-400 font-bold mt-0.5 block">฿ / สัปดาห์</span>
                                            </div>

                                            <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-2.5 text-center">
                                                <label className="text-[10px] font-black text-pink-600 uppercase block mb-1">รายปี</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full py-1 px-1 bg-white border border-pink-200 rounded-lg font-black text-xs text-pink-900 text-center outline-none focus:ring-2 focus:ring-pink-500" 
                                                    value={formData.price_yearly} 
                                                    onChange={e => setFormData({...formData, price_yearly: Number(e.target.value)})} 
                                                />
                                                <span className="text-[9px] text-pink-400 font-bold mt-0.5 block">฿ / ปี</span>
                                            </div>

                                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5 text-center">
                                                <label className="text-[10px] font-black text-emerald-600 uppercase block mb-1">ซื้อขาด (ถาวร)</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full py-1 px-1 bg-white border border-emerald-200 rounded-lg font-black text-xs text-emerald-900 text-center outline-none focus:ring-2 focus:ring-emerald-500" 
                                                    value={formData.price_one_time} 
                                                    onChange={e => setFormData({...formData, price_one_time: Number(e.target.value)})} 
                                                />
                                                <span className="text-[9px] text-emerald-400 font-bold mt-0.5 block">฿ ครั้งเดียว</span>
                                            </div>
                                        </div>

                                        {/* Min Plan & Free with Plan */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 items-center">
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">
                                                    แพ็กเกจขั้นต่ำที่ใช้ได้ (Min Plan)
                                                </label>
                                                <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
                                                    {(['free', 'basic', 'pro', 'ultimate'] as const).map(plan => (
                                                        <button
                                                            key={plan}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, min_plan: plan }))}
                                                            className={`py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${
                                                                (formData.min_plan || 'ultimate') === plan 
                                                                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-black/5' 
                                                                : 'text-slate-500 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            {plan}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                                                <div>
                                                    <label htmlFor="freeWithPlan" className="text-xs font-bold text-slate-700 cursor-pointer block">
                                                        ฟรีเมื่อมีแพ็กเกจ?
                                                    </label>
                                                    <span className="text-[10px] text-slate-400">Free with active subscription</span>
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    id="freeWithPlan" 
                                                    checked={formData.is_free_with_plan} 
                                                    onChange={(e) => setFormData({...formData, is_free_with_plan: e.target.checked})} 
                                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex justify-between items-center sticky bottom-0 z-20">
                            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
                                <span>💡</span>
                                <span>ไฟล์รูปภาพจะถูกบีบอัดให้ &lt; 50KB อัตโนมัติเมื่อครอบตัด (Crop)</span>
                            </div>
                            <div className="flex items-center gap-2.5 ml-auto">
                                <button 
                                    type="button"
                                    onClick={closeModal} 
                                    className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors text-xs uppercase tracking-wider"
                                >
                                    ยกเลิก
                                </button>
                                <button 
                                    type="submit"
                                    form="theme-form"
                                    disabled={isSubmitting || uploadingState !== null} 
                                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black shadow-md transition-all uppercase tracking-wider disabled:opacity-50 text-xs flex items-center gap-2 active:scale-98"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            <span>กำลังบันทึก...</span>
                                        </>
                                    ) : (
                                        editingId ? 'บันทึกการแก้ไข' : 'เผยแพร่ธีม'
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* --- Manual Crop Modal (ปรับให้กว้างขึ้นเพื่อการเล็งที่แม่นยำ) --- */}
{cropModal.open && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
        {/* ✅ ปรับจาก max-w-xl เป็น max-w-5xl เพื่อให้พื้นที่ครอปใหญ่ขึ้น */}
        <div className="bg-white rounded-[2.5rem] w-full max-w-5xl overflow-hidden flex flex-col h-[90vh] shadow-2xl animate-in zoom-in duration-300">
            
            <div className="p-8 border-b flex justify-between items-center bg-white">
                <div>
                    <h3 className="font-black uppercase tracking-widest text-slate-800 text-xl">
                        {cropModal.type === 'ipad' ? '📱 iPad Screen Crop' : '📱 Mobile Screen Crop'}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase">ลากขยับรูปเพื่อเลือกพื้นที่ที่ต้องการ (บีบอัดไฟล์ให้ {"<"} 50KB อัตโนมัติ)</p>
                </div>
                <button 
                    onClick={() => setCropModal({ open: false, image: null, type: 'cover' })} 
                    className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                >
                    <IconX size={28} />
                </button>
            </div>

            {/* Area สำหรับลากครอป */}
            <div className="relative flex-1 bg-slate-100">
                <Cropper
                    image={cropModal.image!}
                    crop={crop}
                    zoom={zoom}
                    // สัดส่วนมือถือ 9:19 (iPhone), iPad 3:4
                    aspect={cropModal.type === 'ipad' ? 3/4 : 9/19} 
                    onCropChange={setCrop}
                    onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                    onZoomChange={setZoom}
                    // ✅ ปรับสีเส้น Grid ให้ชัดขึ้น
                    showGrid={true}
                />
            </div>

            <div className="p-8 bg-white border-t space-y-6">
                <div className="flex items-center gap-6">
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest min-w-[60px]">ZOOM</span>
                    <input 
                        type="range" 
                        value={zoom} 
                        min={1} 
                        max={3} 
                        step={0.01} 
                        onChange={e => setZoom(+e.target.value)} 
                        className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                    />
                    <span className="text-sm font-black text-blue-600 w-12 text-right">{Math.round(zoom * 100)}%</span>
                </div>
                
                <div className="flex gap-4">
                    <button 
                        onClick={() => setCropModal({ open: false, image: null, type: 'cover' })}
                        className="flex-1 py-4 text-slate-500 font-bold uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                    >
                        ยกเลิก
                    </button>
                    <button 
                        onClick={handleConfirmCrop} 
                        disabled={isSubmitting} 
                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'กำลังอัปโหลด...' : 'ยืนยันพื้นที่รูปนี้'}
                    </button>
                </div>
            </div>
        </div>
    </div>
)}

            {/* --- FLOATING BATCH ACTIONS TOOLBAR --- */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 border border-white/10 animate-in fade-in slide-in-from-bottom duration-300">
                    <div className="text-sm font-bold">
                        เลือกอยู่ <span className="text-blue-400 font-black text-base">{selectedIds.length}</span> รายการ
                    </div>
                    <div className="h-6 w-px bg-white/20"></div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleBatchStatus(true)}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                            เปิดขายทั้งหมด
                        </button>
                        <button 
                            onClick={() => handleBatchStatus(false)}
                            disabled={isSubmitting}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                            ปิดขายทั้งหมด
                        </button>
                    </div>
                    <div className="h-6 w-px bg-white/20"></div>
                    <button 
                        onClick={() => setSelectedIds([])}
                        className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
                    >
                        ยกเลิก
                    </button>
                </div>
            )}
        </div>
    );
}