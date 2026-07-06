// hooks/usePayment.ts

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import dayjs from 'dayjs';
import { 
    getPaymentInitialDataAction, 
    getUnpaidOrdersAction, 
    updateOrderStatusAction,
    getAllTablesAction, 
    cancelOrderAction,
    cancelOrderItemAction
} from '@/app/actions/paymentActions';
import { getLatestTableDataAction } from '@/app/actions/tableActions';
import { getOrderUsage } from '@/app/actions/limitGuard';
import { db } from '@/lib/db'; 
import { getPosSettings } from '@/lib/posSettings';

// ✅ ฟังก์ชันสร้าง UUID แบบปลอดภัย
const generateUUID = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

const generateTableToken = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const uniqueTokens = (tokens: any[]) => Array.from(new Set((tokens || []).filter(Boolean).map(String)));
const getTableTokens = (table: any) => {
    const tokens = Array.isArray(table?.access_tokens) ? table.access_tokens.filter(Boolean).map(String) : [];
    if (tokens.length > 0) return uniqueTokens(tokens);
    return table?.access_token ? [String(table.access_token)] : [];
};
const removeUsedTokens = (currentTokens: any[], usedTokens: any[]) => {
    const used = new Set(uniqueTokens(usedTokens));
    const remaining = uniqueTokens(currentTokens).filter(token => !used.has(token));
    return remaining.length > 0 ? remaining : [generateTableToken()];
};

export function usePayment() {
    // --- Audio State & Ref ---
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const scanAudioRef = useRef<HTMLAudioElement | null>(null);
    const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
    const [kitchenOrder, setKitchenOrder] = useState<any>(null);
    // --- State ---
    const [activeTab, setActiveTab] = useState<'tables' | 'pos'>('tables');
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [autoKitchen, setAutoKitchen] = useState(false);
    const [limitStatus, setLimitStatus] = useState<any>(null);

    // Data
    const [brandId, setBrandId] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [discounts, setDiscounts] = useState<any[]>([]);
    const [unpaidOrders, setUnpaidOrders] = useState<any[]>([]);
    const [allTables, setAllTables] = useState<any[]>([]);
    
    // User
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentProfile, setCurrentProfile] = useState<any>(null);
    const [currentBrand, setCurrentBrand] = useState<any>(null);

    // UI
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [cart, setCart] = useState<any[]>([]);
    const [cancelledCart, setCancelledCart] = useState<any[]>([]);
    const [walkInDraftOrderId, setWalkInDraftOrderId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [receivedAmount, setReceivedAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'promptpay'>('cash');

    // Modals
    const [variantModalProduct, setVariantModalProduct] = useState<any>(null);
    const [statusModal, setStatusModal] = useState<{ show: boolean; type: 'success' | 'error' | 'alert' | 'qrcode'; title: string; message: string }>({
        show: false, type: 'success', title: '', message: ''
    });
    const [completedReceipt, setCompletedReceipt] = useState<any>(null);
    const [qrTableData, setQrTableData] = useState<any>(null);
    const [showTableSelector, setShowTableSelector] = useState(false);

    const processedOrdersRef = useRef<Set<string>>(new Set());
    const unpaidOrdersRef = useRef(unpaidOrders);

    // --- Helpers ---
    const roundForCash = (amount: number) => Math.ceil(amount * 4) / 4;

    const getFullImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const fullPath = brandId ? `${brandId}/${path}` : path;
        const { data } = supabase.storage.from('brands').getPublicUrl(fullPath);
        return data.publicUrl;
    };

    const refreshQuota = useCallback(async () => {
        if (!brandId) return;
        const usage = await getOrderUsage(brandId);
        setLimitStatus(usage);
    }, [brandId]);

    const refreshTables = useCallback(async () => {
        if (!brandId) return;
        const tables = await getAllTablesAction(brandId);
        setAllTables(tables);
    }, [brandId]);

    // --- Audio Functions ---
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio('/sounds/alert.mp3');
            scanAudioRef.current = new Audio('/sounds/beep.mp3'); // 🌟 เพิ่มบรรทัดนี้
        }
    }, []);

    const unlockAudio = useCallback(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        audio.volume = 0.0;
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1.0;
            setIsAudioUnlocked(true);
        }).catch(e => console.error("Unlock failed:", e));
    }, []);

    const playSound = useCallback(() => {
        if (!audioRef.current) return;

        // 🌟 เพิ่มเงื่อนไขนี้: ถ้ามี AndroidBridge แปลว่าเปิดในแอป ให้ข้ามการเล่นเสียงบนเว็บไปเลย!
        if (typeof window !== 'undefined' && (window as any).AndroidBridge) {
            console.log("📱 กำลังรันใน Android App: ปิดเสียงของเว็บเพื่อไม่ให้ตีกับ Native");
            return; 
        }

        const audio = audioRef.current;
        audio.currentTime = 0;
        audio.play().catch(e => console.error("Playback failed:", e));
    }, []);

    const playScanSound = useCallback(() => {
        if (!scanAudioRef.current) return;
        scanAudioRef.current.currentTime = 0;
        scanAudioRef.current.play().catch(e => console.error("Scan playback failed:", e));
    }, []);

    const toggleAutoKitchen = useCallback(() => {
        setAutoKitchen(prev => !prev);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedAuto = localStorage.getItem('auto_kitchen_enabled');
            if (savedAuto === 'true') setAutoKitchen(true);
        }
        
        const init = async () => {
            const cachedBrandId = typeof window !== 'undefined'
                ? window.localStorage.getItem('foodscan_last_brand_id')
                : null;
            const cachedUserId = typeof window !== 'undefined'
                ? window.localStorage.getItem('foodscan_last_user_id')
                : null;
            try {
                if (!db.isOpen()) await db.open();
                // Local-first: show cached menu immediately while fresh data syncs in the background.
                const [localCats, localProds, localDiscs, localDiscProds] = await Promise.all([
                    db.categories.toArray(),
                    db.products.toArray(),
                    db.discounts.toArray(),
                    db.discount_products.toArray()
                ]);
                const brandCats = cachedBrandId ? localCats.filter(item => String(item.brand_id) === cachedBrandId) : [];
                const brandProds = cachedBrandId ? localProds.filter(item => String(item.brand_id) === cachedBrandId) : [];
                const brandDiscs = cachedBrandId ? localDiscs.filter(item => String(item.brand_id) === cachedBrandId) : [];
                const localMappedDiscounts = brandDiscs.map(d => ({
                    ...d,
                    discount_products: localDiscProds.filter(dp => dp.discount_id === d.id)
                }));

                if (brandCats.length > 0) setCategories(brandCats);
                if (brandProds.length > 0) {
                    setProducts(brandProds);
                    setProductsLoading(false);
                }
                if (localMappedDiscounts.length > 0) setDiscounts(localMappedDiscounts);

                const res = await getPaymentInitialDataAction();
                if (res.success) {
                    window.localStorage.setItem('foodscan_last_brand_id', String(res.brandId));
                    window.localStorage.setItem('foodscan_last_user_id', String(res.user?.id || ''));
                    setBrandId(res.brandId!);
                    setCurrentUser(res.user);
                    setCurrentProfile(res.profile);
                    setCurrentBrand(res.brand);
                    setCategories(res.categories || []);
                    setProducts(res.products || []);
                    setProductsLoading(false);
                    setDiscounts(res.discounts || []);
                    setAllTables(res.tables || []);
                    
                    const discountMappings = (res.discounts || []).flatMap((d: any) => 
                        (d.discount_products || []).map((dp: any) => ({
                            discount_id: d.id, product_id: dp.product_id
                        }))
                    );

                    await db.transaction('rw', db.categories, db.products, async () => {
                        await db.categories.where('brand_id').equals(res.brandId!).delete();
                        await db.products.where('brand_id').equals(res.brandId!).delete();
                        await db.categories.bulkPut(res.categories || []);
                        await db.products.bulkPut(res.products || []);
                    });

                    await Promise.all([
                        db.discounts.bulkPut(res.discounts || []),
                        db.discount_products.bulkPut(discountMappings)
                    ]);

                    const usage = await getOrderUsage(res.brandId!);
                    setLimitStatus(usage);

                    // Load Walk-in draft
                    const userId = res.user?.id;
                    if (userId) {
                        const pendingWalkInOrders = await db.orders
                            .where('brand_id').equals(res.brandId!)
                            .and(o => o.status === 'pending' && o.table_label === 'Walk-in' && o.cashier_id === userId)
                            .toArray();
                        
                        pendingWalkInOrders.sort((a: any, b: any) => new Date(b.created_at || b.updated_at || 0).getTime() - new Date(a.created_at || a.updated_at || 0).getTime());
                        const latestDraft = pendingWalkInOrders[0];
                        if (latestDraft) {
                            setWalkInDraftOrderId(latestDraft.id);
                            const items = await db.order_items.where('order_id').equals(latestDraft.id).toArray();
                            const activeItems = items.filter((i: any) => i.status !== 'cancelled');
                            const cancelledItems = items.filter((i: any) => i.status === 'cancelled');
                            setCart(activeItems);
                            setCancelledCart(cancelledItems);
                        } else {
                            setCart([]);
                            setCancelledCart([]);
                            setWalkInDraftOrderId(null);
                        }
                    }

                    const orders = await getUnpaidOrdersAction(res.brandId!);
                    const localSyncQueue = await db.sync_queue.toArray();
                    const paidLocalOrderIds = localSyncQueue
                        .filter(q => q.type === 'PAYMENT')
                        .map(q => q.payload.localOrderId);

                    const trulyUnpaidOrders = orders.filter((o: any) => !paidLocalOrderIds.includes(o.id));
                    
                    // Merge local unsaved items of active table orders
                    const localItems = await db.order_items.filter(item => item.is_local === true || item.is_local === 1).toArray();
                    const mergedUnpaidOrders = trulyUnpaidOrders.map((order: any) => {
                        const orderLocalItems = localItems.filter(item => item.order_id === order.id);
                        if (orderLocalItems.length > 0) {
                            const newOrderItems = [...(order.order_items || [])];
                            orderLocalItems.forEach(localItem => {
                                const matchIndex = newOrderItems.findIndex(i => 
                                    i.product_id === localItem.product_id && 
                                    i.variant === localItem.variant && 
                                    (i.note || '') === (localItem.note || '') &&
                                    i.status !== 'cancelled' &&
                                    localItem.status !== 'cancelled'
                                );
                                if (matchIndex >= 0) {
                                    newOrderItems[matchIndex].quantity += localItem.quantity;
                                } else {
                                    newOrderItems.push(localItem);
                                }
                            });
                            order.order_items = newOrderItems;
                        }
                        // Recalculate totals (excluding cancelled)
                        const activeItems = (order.order_items || []).filter((i: any) => i.status !== 'cancelled');
                        order.total_price = activeItems.reduce((sum: number, i: any) => sum + (Number(i.price) * i.quantity), 0);
                        return order;
                    });

                    processedOrdersRef.current = new Set(mergedUnpaidOrders.map((order: any) => String(order.id)));
                    setUnpaidOrders(mergedUnpaidOrders);
                    unpaidOrdersRef.current = mergedUnpaidOrders;
                } else {
                    throw new Error("Cannot fetch from cloud"); 
                }
            } catch (error) {
                console.warn("⚠️ Offline Mode: Loading from local Dexie database");
                if (!db.isOpen()) await db.open().catch(() => undefined);
                const localCats = await db.categories.toArray().catch(() => []);
                const localProds = await db.products.toArray().catch(() => []);
                const localDiscs = await db.discounts.toArray().catch(() => []);
                const localDiscProds = await db.discount_products.toArray().catch(() => []);
                
                const offlineCats = cachedBrandId ? localCats.filter(item => String(item.brand_id) === cachedBrandId) : [];
                const offlineProds = cachedBrandId ? localProds.filter(item => String(item.brand_id) === cachedBrandId) : [];
                const offlineDiscs = cachedBrandId ? localDiscs.filter(item => String(item.brand_id) === cachedBrandId) : [];
                const mappedDiscounts = offlineDiscs.map(d => ({
                    ...d,
                    discount_products: localDiscProds.filter(dp => dp.discount_id === d.id)
                }));
                
                if (offlineCats.length > 0) setCategories(offlineCats);
                if (offlineProds.length > 0) setProducts(offlineProds);
                if (mappedDiscounts.length > 0) setDiscounts(mappedDiscounts);

                // Load Walk-in draft in offline mode
                if (cachedUserId && cachedBrandId) {
                    const pendingWalkInOrders = await db.orders
                        .where('brand_id').equals(cachedBrandId)
                        .and(o => o.status === 'pending' && o.table_label === 'Walk-in' && o.cashier_id === cachedUserId)
                        .toArray();
                    pendingWalkInOrders.sort((a: any, b: any) => new Date(b.created_at || b.updated_at || 0).getTime() - new Date(a.created_at || a.updated_at || 0).getTime());
                    const latestDraft = pendingWalkInOrders[0];
                    if (latestDraft) {
                        setWalkInDraftOrderId(latestDraft.id);
                        const items = await db.order_items.where('order_id').equals(latestDraft.id).toArray();
                        const activeItems = items.filter((i: any) => i.status !== 'cancelled');
                        const cancelledItems = items.filter((i: any) => i.status === 'cancelled');
                        setCart(activeItems);
                        setCancelledCart(cancelledItems);
                    } else {
                        setCart([]);
                        setCancelledCart([]);
                        setWalkInDraftOrderId(null);
                    }
                }
            }
            setProductsLoading(false);
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auto_kitchen_enabled', String(autoKitchen));
        }
    }, [autoKitchen]);

    useEffect(() => {
        unpaidOrdersRef.current = unpaidOrders;
    }, [unpaidOrders]);

    // ==========================================================
    // 🔄 โซนจัดการออเดอร์อัตโนมัติ (รับออเดอร์อย่างเดียว)
    // ==========================================================

    // 1. ฟังก์ชันโหลดข้อมูลและอัปเดตหน้าจอ
    const refreshOrders = useCallback(async () => {
        if (!brandId) return [];
        
        const cloudOrders = await getUnpaidOrdersAction(brandId);
        const localSyncQueue = await db.sync_queue.toArray();
        const paidLocalOrderIds = localSyncQueue
            .filter(q => q.type === 'PAYMENT')
            .map(q => q.payload.localOrderId); 

        const trulyUnpaidOrders = cloudOrders.filter((order: any) => {
            return !paidLocalOrderIds.includes(order.id);
        });

        setUnpaidOrders(trulyUnpaidOrders);
        refreshQuota(); 
        return trulyUnpaidOrders; 
    }, [brandId, refreshQuota]);

    // ==========================================================
    // 🔥 แก้ไขแล้ว: ให้แค่เปลี่ยนสถานะรับออเดอร์ แต่ ไม่ส่งไปปริ้น
    // ==========================================================
    const runAutoKitchenLogic = useCallback(async (ordersToCheck: any[]) => {
        if (!autoKitchen) return false; 

        let hasUpdatedDB = false;
        let shouldPlaySound = false; 

        for (const order of ordersToCheck) {
            const orderId = String(order.id);
            if (order.status === 'pending' && !processedOrdersRef.current.has(orderId)) {
                processedOrdersRef.current.add(orderId);
                console.log(`➡️ เจอออเดอร์ใหม่ ${order.id}! กำลังรับออเดอร์อัตโนมัติ... (ปิดระบบปริ้น)`);

                // ⏳ หน่วงเวลา 2 วิ รอข้อมูลอาหารลงฐานข้อมูลให้ครบ
                await new Promise(resolve => setTimeout(resolve, 2000));

                const { data: fullOrder, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('id', order.id)
                    .single();

                // ถ้ามีข้อมูลครบ และมีรายการอาหาร
                if (!error && fullOrder && fullOrder.order_items && fullOrder.order_items.length > 0) {
                    
                    // ✅ สั่งรับออเดอร์ (เปลี่ยนสถานะเป็น preparing)
                    await updateOrderStatusAction(order.id, 'preparing');

                    // ❌ ลบโค้ดคำสั่งปริ้นผ่าน AndroidBridge ตรงนี้ทิ้งไปทั้งหมด

                    hasUpdatedDB = true;
                    shouldPlaySound = true; 
                } else {
                    processedOrdersRef.current.delete(orderId);
                }
            }
        }

        if (shouldPlaySound) playSound(); 
        return hasUpdatedDB; 
    }, [autoKitchen, playSound]);

    // ==========================================================
    // 🌟 3. ฟังก์ชันหลักที่ทำงานเมื่อมีการแจ้งเตือน (FCM เรียกใช้)
    // ==========================================================
    const fetchAndProcessOrders = useCallback(async (payload?: any) => {
        if (!brandId) return;
        
        console.log("⚡ [DEBUG] FCM Payload Received:", JSON.stringify(payload));

        // 🌟 ดึงค่า Type และ Message (Title) ออกมาเช็คแบบรัดกุมที่สุด
        const msgType = payload?.data?.type || payload?.type || '';
        const msgTitle = payload?.data?.title || payload?.notification?.title || '';
        const msgBody = payload?.data?.message || payload?.data?.body || '';

        console.log(`🔍 [DEBUG] Type: '${msgType}', Title: '${msgTitle}'`);

        // 🛑 ด่านกักเสียง ไม้ตาย!: เช็คทุกอย่างที่บ่งบอกว่า "นี่คือการอัปเดตสถานะ" ไม่ใช่ออเดอร์ใหม่
        if (
            msgType === 'SILENT_UPDATE' || 
            msgType === 'ANDROID_REFRESH' || 
            msgTitle.includes('อัปเดต') || 
            msgBody.includes('อัปเดต')
        ) {
            console.log("🔄 ระบบเงียบ (SILENT): แค่รีเฟรชหน้าจอ ไม่ต้องมีเสียง!");
            await refreshOrders(); // แค่อัปเดตหน้าจอให้โต๊ะหายแดง
            return; // 🛑 หยุดทันที ห้ามไปเล่นเสียงเด็ดขาด!
        }

        // --- กรณีออเดอร์ใหม่จริงๆ ค่อยมาทำตรงนี้ ---
        console.log("🔔 ออเดอร์ใหม่เข้า! กำลังรันระบบครัวและเล่นเสียง...");
        
        // ดึงข้อมูลออเดอร์ล่าสุด
        const currentOrders = await getUnpaidOrdersAction(brandId);
        
        // รันระบบรับออเดอร์อัตโนมัติ (ตัวนี้แหละที่มีคำสั่ง playSound อยู่ข้างใน)
        await runAutoKitchenLogic(currentOrders);

        // อัปเดตหน้าจอ
        await refreshOrders();

    }, [brandId, refreshOrders, runAutoKitchenLogic]);

    // ==========================================================

    // --- Logic: Pricing ---
    const calculatePrice = useCallback((product: any, variant: string = 'normal') => {
        let basePrice = Number(product.price || 0);
        if (variant === 'special' && product.price_special) basePrice = Number(product.price_special);
        if (variant === 'jumbo' && product.price_jumbo) basePrice = Number(product.price_jumbo);

        if (!product.price_special && !product.price_jumbo && products.length > 0) {
             const originalProduct = products.find(p => p.id === product.id);
             if(originalProduct) {
                 if(variant === 'normal') basePrice = Number(originalProduct.price);
                 if(variant === 'special') basePrice = Number(originalProduct.price_special);
                 if(variant === 'jumbo') basePrice = Number(originalProduct.price_jumbo);
             }
        }

        const now = new Date();
        const applicableDiscounts = discounts.filter(d => {
            const isTimeValid = (!d.start_date || new Date(d.start_date) <= now) && (!d.end_date || new Date(d.end_date) >= now);
            if (!isTimeValid) return false;
            if (variant === 'normal' && !d.apply_normal) return false;
            if (variant === 'special' && !d.apply_special) return false;
            if (variant === 'jumbo' && !d.apply_jumbo) return false;
            if (d.apply_to === 'all') return true;
            if (d.apply_to === 'specific') return d.discount_products?.some((dp: any) => dp.product_id === product.id);
            return false;
        });

        if (applicableDiscounts.length === 0) return { original: basePrice, final: basePrice, discount: 0, promoDetails: null };

        let bestPrice = basePrice;
        let bestDiscountObj: any = null;

        applicableDiscounts.forEach(d => {
            let final = basePrice;
            if (d.type === 'percentage') final = basePrice - (basePrice * d.value / 100);
            else if (d.type === 'fixed') final = basePrice - d.value;
            final = Math.max(0, final);
            final = Math.round(final * 4) / 4;
            if (final < bestPrice) { bestPrice = final; bestDiscountObj = d; }
        });

        return { original: basePrice, final: bestPrice, discount: basePrice - bestPrice, promoDetails: bestDiscountObj };
    }, [discounts, products]);

  // --- Logic: Cart ---
    const addToCart = useCallback(async (product: any, variant: string, note: string = "") => {
        const pricing = calculatePrice(product, variant);
        const nowIso = new Date().toISOString();

        if (selectedOrder) {
            const newOrderItems = [...(selectedOrder.order_items || [])];
            
            const matchIndex = newOrderItems.findIndex(item => 
                (item.product_id === product.id || item.id === product.id) && 
                item.variant === variant && 
                (item.note || "") === note && 
                item.status !== 'cancelled'
            );
            
            let updatedItem: any;
            if (matchIndex > -1) {
                updatedItem = {
                    ...newOrderItems[matchIndex],
                    quantity: newOrderItems[matchIndex].quantity + 1,
                    updated_at: nowIso
                };
                newOrderItems[matchIndex] = updatedItem;
            } else {
                updatedItem = {
                    id: generateUUID(),
                    order_id: selectedOrder.id,
                    product_id: product.id,
                    product_name: product.name,
                    variant,
                    note,
                    price: pricing.final,
                    original_price: pricing.original,
                    discount: pricing.discount,
                    quantity: 1,
                    status: 'pending',
                    is_local: true,
                    created_at: nowIso,
                    updated_at: nowIso
                };
                newOrderItems.push(updatedItem);
            }

            const activeItems = newOrderItems.filter((i: any) => i.status !== 'cancelled');
            const newTotal = activeItems.reduce((s: number, i: any) => s + (Number(i.price) * i.quantity), 0);
            
            const updatedOrder = {
                ...selectedOrder,
                order_items: newOrderItems,
                total_price: newTotal,
                updated_at: nowIso
            };

            setSelectedOrder(updatedOrder);
            setUnpaidOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o));

            try {
                if (!db.isOpen()) await db.open();
                await db.order_items.put(updatedItem);
                await db.orders.put({
                    id: selectedOrder.id,
                    brand_id: brandId,
                    table_label: selectedOrder.table_label,
                    status: selectedOrder.status,
                    total_price: newTotal,
                    type: 'table',
                    created_at: selectedOrder.created_at || nowIso,
                    updated_at: nowIso
                });
            } catch (dbErr) {
                console.error("Failed to save local item to IndexedDB:", dbErr);
            }

        } else {
            let draftId = walkInDraftOrderId;
            if (!draftId) {
                draftId = generateUUID();
                setWalkInDraftOrderId(draftId);
                
                const draftOrder = {
                    id: draftId,
                    brand_id: brandId,
                    cashier_id: currentUser?.id || 'unknown',
                    table_label: 'Walk-in',
                    status: 'pending',
                    type: 'pos',
                    created_at: nowIso,
                    updated_at: nowIso,
                    total_price: 0
                };
                try {
                    if (!db.isOpen()) await db.open();
                    await db.orders.put(draftOrder);
                } catch (dbErr) {
                    console.error("Failed to create walk-in draft:", dbErr);
                }
            }

            let updatedItem: any;
            let newCart = [...cart];
            const matchIndex = cart.findIndex(item => 
                (item.id === product.id || item.product_id === product.id) && 
                item.variant === variant && 
                (item.note || "") === note
            );

            if (matchIndex > -1) {
                updatedItem = {
                    ...cart[matchIndex],
                    quantity: cart[matchIndex].quantity + 1,
                    updated_at: nowIso
                };
                newCart[matchIndex] = updatedItem;
            } else {
                updatedItem = {
                    id: generateUUID(),
                    order_id: draftId,
                    product_id: product.id,
                    product_name: product.name,
                    variant,
                    note,
                    price: pricing.final,
                    original_price: pricing.original,
                    discount: pricing.discount,
                    quantity: 1,
                    status: 'pending',
                    created_at: nowIso,
                    updated_at: nowIso,
                    image_url: product.image_url || product.image || product.image_name || product.thumbnail_url || null,
                    promotion_snapshot: pricing.promoDetails
                };
                newCart.push(updatedItem);
            }

            setCart(newCart);

            const activeItems = newCart.filter((i: any) => i.status !== 'cancelled');
            const newTotal = activeItems.reduce((s: number, i: any) => s + (Number(i.price) * i.quantity), 0);

            try {
                if (!db.isOpen()) await db.open();
                await db.order_items.put({
                    id: updatedItem.id,
                    order_id: draftId,
                    product_id: updatedItem.product_id,
                    product_name: updatedItem.product_name,
                    variant: updatedItem.variant,
                    note: updatedItem.note,
                    price: updatedItem.price,
                    original_price: updatedItem.original_price,
                    discount: updatedItem.discount,
                    quantity: updatedItem.quantity,
                    status: 'pending',
                    created_at: updatedItem.created_at,
                    updated_at: nowIso
                });
                
                await db.orders.update(draftId, {
                    total_price: newTotal,
                    updated_at: nowIso
                });
            } catch (dbErr) {
                console.error("Failed to update walk-in item in IndexedDB:", dbErr);
            }
        }
        setVariantModalProduct(null);
    }, [calculatePrice, activeTab, selectedOrder, walkInDraftOrderId, cart, brandId, currentUser]);

    const removeFromCart = (index: number) => {
        // Fallback for direct index removal if needed
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const cancelItem = useCallback(async (item: any) => {
        const nowIso = new Date().toISOString();
        const userId = currentUser?.id || 'unknown';

        if (selectedOrder) {
            const newOrderItems = selectedOrder.order_items.map((i: any) => {
                if (i.id === item.id) {
                    return {
                        ...i,
                        status: 'cancelled',
                        cancelled_by: userId,
                        cancelled_at: nowIso
                    };
                }
                return i;
            });

            const activeItems = newOrderItems.filter((i: any) => i.status !== 'cancelled');
            const newTotal = activeItems.reduce((s: number, i: any) => s + (Number(i.price) * i.quantity), 0);

            const updatedOrder = {
                ...selectedOrder,
                order_items: newOrderItems,
                total_price: newTotal,
                updated_at: nowIso
            };

            setSelectedOrder(updatedOrder);
            setUnpaidOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o));

            let onlineSuccess = false;
            if (navigator.onLine) {
                try {
                    const res = await cancelOrderItemAction(item.id, userId, nowIso);
                    if (res.success) {
                        onlineSuccess = true;
                    }
                } catch (err) {
                    console.error("Failed to cancel order item online:", err);
                }
            }

            try {
                if (!db.isOpen()) await db.open();
                await db.order_items.update(item.id, {
                    status: 'cancelled',
                    cancelled_by: userId,
                    cancelled_at: nowIso,
                    is_local: item.is_local ? true : undefined
                });

                await db.orders.update(selectedOrder.id, {
                    total_price: newTotal,
                    updated_at: nowIso
                });

                if (!onlineSuccess) {
                    await db.sync_queue.add({
                        type: 'PAYMENT',
                        status: 'pending',
                        payload: {
                            action: 'cancel_order_item',
                            orderId: selectedOrder.id,
                            itemId: item.id,
                            cancelledAt: nowIso,
                            cancelledBy: userId,
                            brandId: brandId
                        }
                    });
                }
            } catch (dbErr) {
                console.error("Local IndexedDB error during cancelItem:", dbErr);
            }

        } else {
            const targetItem = cart.find(i => i.id === item.id);
            if (!targetItem) return;

            const cancelledItem = {
                ...targetItem,
                status: 'cancelled',
                cancelled_by: userId,
                cancelled_at: nowIso
            };

            const newCart = cart.filter(i => i.id !== item.id);
            const newCancelledCart = [...cancelledCart, cancelledItem];

            setCart(newCart);
            setCancelledCart(newCancelledCart);

            const activeItems = newCart.filter((i: any) => i.status !== 'cancelled');
            const newTotal = activeItems.reduce((s: number, i: any) => s + (Number(i.price) * i.quantity), 0);

            try {
                if (!db.isOpen()) await db.open();
                
                await db.order_items.update(item.id, {
                    status: 'cancelled',
                    cancelled_by: userId,
                    cancelled_at: nowIso
                });

                const draftId = walkInDraftOrderId;
                if (draftId) {
                    if (newCart.length === 0) {
                        await db.orders.update(draftId, {
                            status: 'cancelled',
                            total_price: 0,
                            cancelled_by: userId,
                            cancelled_at: nowIso,
                            updated_at: nowIso
                        });

                        let onlineSuccess = false;
                        if (navigator.onLine) {
                            try {
                                const res = await cancelOrderAction(draftId, userId, nowIso);
                                if (res.success) onlineSuccess = true;
                            } catch (err) {
                                console.error(err);
                            }
                        }

                        if (!onlineSuccess) {
                            const draftItems = await db.order_items.where('order_id').equals(draftId).toArray();
                            const newOrderData = {
                                id: draftId, brand_id: brandId, status: 'cancelled', total_price: 0,
                                table_label: 'Walk-in', type: 'pos', created_at: nowIso, updated_at: nowIso,
                                cancelled_by: userId, cancelled_at: nowIso
                            };
                            const itemsToSave = draftItems.map(i => ({ ...i, status: i.id === item.id ? 'cancelled' : i.status }));

                            await db.sync_queue.add({
                                type: 'PAYMENT',
                                status: 'pending',
                                payload: {
                                    action: 'cancel_order',
                                    orderId: draftId,
                                    cancelledAt: nowIso,
                                    cancelledBy: userId,
                                    isNewOffline: true,
                                    newOrderData,
                                    itemsToSave,
                                    brandId: brandId
                                }
                            });
                        }

                        setCart([]);
                        setCancelledCart([]);
                        setWalkInDraftOrderId(null);

                    } else {
                        await db.orders.update(draftId, {
                            total_price: newTotal,
                            updated_at: nowIso
                        });
                    }
                }
            } catch (dbErr) {
                console.error("Local IndexedDB error during Walk-in cancelItem:", dbErr);
            }
        }
    }, [activeTab, selectedOrder, cart, cancelledCart, walkInDraftOrderId, currentUser, brandId]);

    const cancelActiveOrder = useCallback(async () => {
        const nowIso = new Date().toISOString();
        const userId = currentUser?.id || 'unknown';

        if (selectedOrder) {
            const orderIdsToCancel = selectedOrder.original_ids && selectedOrder.original_ids.length > 0 
                ? selectedOrder.original_ids.map(String) 
                : [String(selectedOrder.id)];

            setUnpaidOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
            setSelectedOrder(null);

            let onlineSuccess = false;
            if (navigator.onLine) {
                try {
                    const res = await cancelOrderAction(orderIdsToCancel, userId, nowIso);
                    if (res.success) {
                        onlineSuccess = true;
                    }
                } catch (err) {
                    console.error("Failed to cancel order online:", err);
                }
            }

            try {
                if (!db.isOpen()) await db.open();
                for (const oId of orderIdsToCancel) {
                    await db.orders.update(oId, {
                        status: 'cancelled',
                        cancelled_by: userId,
                        cancelled_at: nowIso,
                        updated_at: nowIso
                    });
                    
                    await db.order_items.where('order_id').equals(oId).modify({
                        status: 'cancelled',
                        cancelled_by: userId,
                        cancelled_at: nowIso
                    });
                }

                if (!onlineSuccess) {
                    await db.sync_queue.add({
                        type: 'PAYMENT',
                        status: 'pending',
                        payload: {
                            action: 'cancel_order',
                            orderIds: orderIdsToCancel,
                            cancelledAt: nowIso,
                            cancelledBy: userId,
                            brandId: brandId
                        }
                    });
                }
            } catch (dbErr) {
                console.error("Local IndexedDB error during cancelActiveOrder:", dbErr);
            }

        } else {
            const draftId = walkInDraftOrderId;
            if (draftId) {
                setCart([]);
                setCancelledCart([]);
                setWalkInDraftOrderId(null);

                let onlineSuccess = false;
                if (navigator.onLine) {
                    try {
                        const res = await cancelOrderAction(draftId, userId, nowIso);
                        if (res.success) onlineSuccess = true;
                    } catch (err) {
                        console.error(err);
                    }
                }

                try {
                    if (!db.isOpen()) await db.open();
                    await db.orders.update(draftId, {
                        status: 'cancelled',
                        total_price: 0,
                        cancelled_by: userId,
                        cancelled_at: nowIso,
                        updated_at: nowIso
                    });

                    await db.order_items.where('order_id').equals(draftId).modify({
                        status: 'cancelled',
                        cancelled_by: userId,
                        cancelled_at: nowIso
                    });

                    if (!onlineSuccess) {
                        const draftItems = await db.order_items.where('order_id').equals(draftId).toArray();
                        const newOrderData = {
                            id: draftId, brand_id: brandId, status: 'cancelled', total_price: 0,
                            table_label: 'Walk-in', type: 'pos', created_at: nowIso, updated_at: nowIso,
                            cancelled_by: userId, cancelled_at: nowIso
                        };
                        const itemsToSave = draftItems.map(i => ({ ...i, status: 'cancelled', cancelled_by: userId, cancelled_at: nowIso }));

                        await db.sync_queue.add({
                            type: 'PAYMENT',
                            status: 'pending',
                            payload: {
                                action: 'cancel_order',
                                orderId: draftId,
                                cancelledAt: nowIso,
                                cancelledBy: userId,
                                isNewOffline: true,
                                newOrderData,
                                itemsToSave,
                                brandId: brandId
                            }
                        });
                    }
                } catch (dbErr) {
                    console.error("Local IndexedDB error during Walk-in cancelActiveOrder:", dbErr);
                }
            }
        }
    }, [activeTab, selectedOrder, walkInDraftOrderId, currentUser, brandId]);

    const rawTotal = useMemo(() => {
        if (selectedOrder) {
            if (!selectedOrder.order_items) return 0;
            const activeItems = selectedOrder.order_items.filter((i: any) => i.status !== 'cancelled');
            return activeItems.reduce((s: number, i: any) => s + (Number(i.price) * i.quantity), 0);
        } else {
            const activeItems = cart.filter((i: any) => i.status !== 'cancelled');
            return activeItems.reduce((s: number, i: any) => s + (Number(i.price) * i.quantity), 0);
        }
    }, [selectedOrder, cart]);
    
    const payableAmount = useMemo(() => {
        if (paymentMethod === 'cash') return roundForCash(rawTotal);
        return Number(rawTotal.toFixed(2));
    }, [rawTotal, paymentMethod]);

    // =========================================================================
    // ☁️ Helper: ล้างโต๊ะบน Cloud ทันที (ยิงเฉพาะตอนจ่ายเงินโต๊ะ)
    // =========================================================================
    const clearTableOnCloud = async (brandIdStr: string, tableLabelStr: string, usedTokens: string[], payIdStr: string) => {
        try {
            const nowIso = dayjs().format();
            
            // 1. เปลี่ยนออเดอร์ของโต๊ะนี้เป็น paid
            const { error: orderErr } = await supabase.from('orders').update({ 
                status: 'paid',
                updated_at: nowIso
            })
            .eq('brand_id', brandIdStr)
            .eq('table_label', tableLabelStr)
            .in('status', ['pending', 'preparing', 'cooking', 'served', 'done']); 
            
            if (orderErr) {
                console.error("❌ ล้างออเดอร์บน Cloud พลาด (409/อื่นๆ):", orderErr.message);
            }

            const { data: tableData } = await supabase
                .from('tables')
                .select('access_token, access_tokens')
                .eq('brand_id', brandIdStr)
                .eq('label', tableLabelStr)
                .single();

            const tokensToRemove = uniqueTokens(usedTokens).length > 0 ? usedTokens : [tableData?.access_token];
            const nextTokens = removeUsedTokens(getTableTokens(tableData), tokensToRemove);

            // 2. สับเปลี่ยน Token โต๊ะ
            const { error: tableErr } = await supabase.from('tables').update({ 
                access_token: nextTokens[0],
                access_tokens: nextTokens
            })
            .eq('brand_id', brandIdStr)
            .eq('label', tableLabelStr);

            if (tableErr) {
                console.error("❌ เปลี่ยนรหัสโต๊ะบน Cloud พลาด (400/อื่นๆ):", tableErr.message);
            }

            if (!orderErr && !tableErr) {
                console.log(`🚀 เคลียร์โต๊ะบน Cloud เรียบร้อย: โต๊ะ ${tableLabelStr} (Token เหลือ: ${nextTokens.length})`);
            }
        } catch (e) {
            console.error("⚠️ โหลด Cloud ไม่สำเร็จ:", e);
        }
    };

 // 🔥 ระบบชำระเงิน (Optimized: กดปุ๊บ เด้งปั๊บ ทำงานเบื้องหลัง)
    const handlePayment = async () => {
        const safePayable = Number(payableAmount);
        const safeReceived = Number(receivedAmount);

        if (safePayable < 0) return; 

        if (paymentMethod === 'cash' && safeReceived < safePayable) {
            setStatusModal({ show: true, type: 'error', title: 'ยอดเงินไม่พอ', message: 'กรุณารับเงินเพิ่มจากลูกค้า' });
            return;
        }

        // 🛡️ ด่านสกัด: เช็คว่าเครื่องอื่นเพิ่งจ่ายไปเมื่อกี้หรือไม่ (อันนี้ต้องคง await ไว้ เพราะมันเช็คเร็วและสำคัญมาก กันจ่ายซ้ำ)
        if (selectedOrder && navigator.onLine) {
            try {
                const { data: latestOrder } = await supabase
                    .from('orders')
                    .select('status')
                    .eq('id', selectedOrder.id)
                    .single();

                if (latestOrder && latestOrder.status === 'paid') {
                    setStatusModal({ show: true, type: 'error', title: 'ชำระเงินแล้ว', message: 'ออเดอร์นี้ถูกชำระเงินจากเครื่องอื่นเรียบร้อยแล้ว' });
                    refreshOrders(); 
                    return; 
                }
            } catch (err) {
                console.warn("⚠️ ไม่สามารถเช็คสถานะจาก Cloud ได้ ข้ามไปใช้ Local", err);
            }
        }

        const change = paymentMethod === 'promptpay' ? 0 : (safeReceived - safePayable);
        const nowIso = dayjs().format(); 
        const localPayId = generateUUID(); 

        let finalOrderId = '';
        let tableLabel = 'Walk-in';
        let itemsToSave: any[] = [];
        let orderType = selectedOrder ? 'table' : 'pos';
        let nextTableTokens: string[] = []; 

        if (selectedOrder) {
            finalOrderId = selectedOrder.id;
            tableLabel = selectedOrder.table_label;
            const tableForPayment = allTables.find(t => t.label === selectedOrder.table_label);
            nextTableTokens = removeUsedTokens(getTableTokens(tableForPayment), selectedOrder.table_access_tokens || []);
            // Keep all items (including cancelled ones) for audit!
            itemsToSave = selectedOrder.order_items.map((i: any) => ({ 
                ...i, 
                order_id: finalOrderId, 
                updated_at: nowIso 
            }));
        } else {
            finalOrderId = walkInDraftOrderId || generateUUID();
            
            const activeItems = cart.map((i: any) => ({
                id: i.id || generateUUID(),
                order_id: finalOrderId,
                product_id: i.product_id || i.id,
                product_name: i.product_name || i.name,
                quantity: i.quantity,
                price: i.price,
                variant: i.variant,
                note: i.note || '',
                promotion_snapshot: i.promotion_snapshot || null,
                original_price: i.original_price || i.price,
                discount: i.discount || 0,
                status: 'active',
                created_at: i.created_at || nowIso,
                updated_at: nowIso
            }));

            const cancelledItems = cancelledCart.map((i: any) => ({
                id: i.id || generateUUID(),
                order_id: finalOrderId,
                product_id: i.product_id || i.id,
                product_name: i.product_name || i.name,
                quantity: i.quantity,
                price: i.price,
                variant: i.variant,
                note: i.note || '',
                promotion_snapshot: i.promotion_snapshot || null,
                original_price: i.original_price || i.price,
                discount: i.discount || 0,
                status: 'cancelled',
                cancelled_by: i.cancelled_by || currentUser?.id,
                cancelled_at: i.cancelled_at || nowIso,
                created_at: i.created_at || nowIso,
                updated_at: nowIso
            }));

            itemsToSave = [...activeItems, ...cancelledItems];
        }

        const newOrderData = {
            id: finalOrderId, brand_id: brandId, status: 'paid', total_price: safePayable,
            table_label: tableLabel, type: orderType, payment_id: localPayId, created_at: nowIso, updated_at: nowIso,
            cashier_id: currentUser?.id
        };

        const paiOrderData = {
            id: localPayId, order_id: finalOrderId, brand_id: brandId, total_amount: safePayable,
            received_amount: paymentMethod === 'promptpay' ? safePayable : safeReceived, change_amount: Number(change.toFixed(2)),
            payment_method: paymentMethod, cashier_id: currentUser?.id, created_at: nowIso
        };

        try {
            // 1. บันทึกลงฐานข้อมูลในเครื่อง (ใช้เวลาแค่ 0.05 วินาที)
            await db.transaction('rw', 'orders', 'order_items', 'pai_orders', 'sync_queue', async () => {
                await db.orders.put(newOrderData); 
                await db.order_items.bulkPut(itemsToSave);
                await db.pai_orders.put(paiOrderData);
                await db.sync_queue.add({
                    type: 'PAYMENT',
                    payload: {
                        brandId, userId: currentUser?.id, totalAmount: safePayable, receivedAmount: paiOrderData.received_amount,
                        changeAmount: paiOrderData.change_amount, paymentMethod, type: selectedOrder ? 'tables' : 'pos',
                        selectedOrder: selectedOrder ? selectedOrder : null, 
                        cart: !selectedOrder ? itemsToSave.filter(i => i.status !== 'cancelled') : [],
                        localOrderId: finalOrderId, localPayId, tableLabel, paymentTime: nowIso
                    },
                    status: 'pending'
                });
            });

            console.log("✅ บันทึกลงเครื่องสำเร็จ! (อัปเดต UI ทันที)");

            // 🚀🚀🚀 1. อัปเดตหน้าจอทันที! (เคล็ดลับความเร็ว: โชว์ใบเสร็จให้ลูกค้าดูเลย ไม่ต้องรอ Cloud)
            setCompletedReceipt({
                id: localPayId, created_at: nowIso, total_amount: safePayable,
                received_amount: paiOrderData.received_amount, change_amount: paiOrderData.change_amount, 
                payment_method: paymentMethod, cashier: currentProfile, brand: currentBrand,
                table_label: tableLabel, items: itemsToSave
            });

            setStatusModal({ show: false, type: 'success', title: '', message: '' });
            setReceivedAmount(0);

            if (!selectedOrder) {
                setCart([]);
                setCancelledCart([]);
                setWalkInDraftOrderId(null);
                localStorage.removeItem('pos_cart');
            } else {
                setUnpaidOrders(prev => prev.filter(o => o.table_label !== selectedOrder.table_label));
                setAllTables(prev => prev.map(t => t.label === selectedOrder.table_label ? { ...t, status: 'available', access_token: nextTableTokens[0], access_tokens: nextTableTokens } : t));
                setSelectedOrder(null);
            }

            // ☁️☁️☁️ 2. ปล่อยให้ระบบแอบไปทำงานกับ Cloud เบื้องหลัง (ทำงานแบบ Async ไม่ต้องรอ!) 
            
            // สั่งพิมพ์ออกเครื่อง (ดีเลย์นิดนึงให้ Modal ใบเสร็จเปิดขึ้นมาก่อน)
// สั่งพิมพ์ออกเครื่อง (ดีเลย์นิดนึงให้ Modal ใบเสร็จเปิดขึ้นมาก่อน)
const receiptPrintSettings = typeof window !== 'undefined' ? getPosSettings() : null;
if (typeof window !== 'undefined' && (window as any).AndroidBridge && receiptPrintSettings?.autoPrintReceipt) {
    setTimeout(() => {
        try {
            // 1. ฟังก์ชันช่วยดึงค่ายอดลด (เหมือนใน ReceiptModal)
            const getDiscountValue = (item: any) => {
                if (item.discount && Number(item.discount) > 0) return Number(item.discount);
                const promo = item.promotion_snapshot;
                if (promo) return Number(promo.savedAmount || promo.discount_amount || promo.discount || 0);
                return 0;
            };

            // 2. คำนวณยอด Subtotal และ Total Discount
            let calcSubTotal = 0;
            let calcTotalDiscount = 0;

            const mappedItems = itemsToSave.map((item: any) => {
                const savedPerUnit = getDiscountValue(item);
                const isCancelled = Boolean(item.status === 'cancelled');
                
                if (!isCancelled) {
                    // ราคาเต็ม = ราคาที่ขาย + ส่วนลดที่ลดไปแล้ว
                    const originalPricePerUnit = Number(item.price) + savedPerUnit;
                    calcSubTotal += (originalPricePerUnit * Number(item.quantity));
                    calcTotalDiscount += (savedPerUnit * Number(item.quantity));
                }

                // 🌟 เพิ่มบรรทัดนี้: แปลง variant เป็นภาษาไทยก่อนส่งปริ้น
                let variantTh = item.variant === 'special' ? 'พิเศษ' : item.variant === 'jumbo' ? 'จัมโบ้' : '';

                return {
                    name: String(item.product_name || item.name || "รายการอาหาร"), 
                    qty: Number(item.quantity), 
                    price: Number(item.price), 
                    isCancelled: isCancelled, 
                    variant: variantTh, // 🌟 เปลี่ยนตรงนี้ให้ใช้ตัวแปรภาษาไทย
                    note: String(item.note || ''),
                    discount: savedPerUnit * Number(item.quantity)
                };
            });

            // 3. จัดเตรียมข้อมูลพิมพ์
            const printData = {
                brandName: String(currentBrand?.name || "ร้านค้า"), 
                tableName: String(tableLabel), 
                orderId: String(finalOrderId.slice(0, 8)),
                date: String(new Date(nowIso).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })),
                items: mappedItems, // 🌟 ใช้ items ที่ถูก map และใส่ discount แล้ว
                subTotal: calcSubTotal,         // 🌟 เพิ่มบรรทัดนี้: ส่งยอดรวมก่อนลด
                totalDiscount: calcTotalDiscount, // 🌟 เพิ่มบรรทัดนี้: ส่งยอดลดรวมทั้งหมด
                totalAmount: Number(safePayable), 
                receivedAmount: Number(paiOrderData.received_amount), 
                changeAmount: Number(paiOrderData.change_amount), 
                paymentMethod: String(paymentMethod).toUpperCase(), 
                cashier: String(currentProfile?.full_name || 'System'),
                copies: receiptPrintSettings.receiptCopies
            };
            
            (window as any).AndroidBridge.printReceipt(JSON.stringify(printData));
        } catch (printErr) { console.error(printErr); }
    }, 50); 
}

            // สั่งล้างโต๊ะบน Cloud และยิง FCM แจ้งเตือนแบบไม่บล็อกการทำงานหลัก (ลบคำว่า await ออกแล้ว)
            if (tableLabel && tableLabel !== 'Walk-in' && brandId && navigator.onLine) {
                clearTableOnCloud(brandId, tableLabel, selectedOrder?.table_access_tokens || [], localPayId).catch(e => console.error("Background clear fail", e));

                fetch('/api/send-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ brandId: brandId, message: 'อัปเดตสถานะโต๊ะ', type: 'SILENT_UPDATE', title: 'อัปเดตหน้าจอ' })
                }).catch(e => console.error("Background FCM fail", e));
            }

        } catch (error) {
            console.error("❌ บันทึกลงเครื่องล้มเหลว:", error);
            setStatusModal({ show: true, type: 'error', title: 'ข้อผิดพลาดในเครื่อง', message: 'ไม่สามารถบันทึกข้อมูลลงเครื่องได้' });
        }
    };
    
    // 🌟 แก้ใหม่: ไม่ต้องยิง API แล้ว โยนข้อมูลโต๊ะลง Modal ได้เลย (เพราะมันอัปเดต Token ใหม่ตั้งแต่ตอนคิดเงินแล้ว)
    const handleSelectTableForQR = (table: any) => {
        setQrTableData(table);
        setShowTableSelector(false);
    };

    return {
        activeTab, setActiveTab,
        loading, productsLoading, autoKitchen, setAutoKitchen, // ✅ คืนค่าตัวแปรปุ่มกลับมาให้หน้าจอใช้งานได้
        categories,
        allProducts: products,
        // 🌟 ซ่อนสินค้าที่เป็นของชำ (retail) ไม่ให้แสดงเป็นปุ่มกด แต่ยังสแกนได้ปกติ
        products: selectedCategory === 'ALL' 
            ? products.filter((p: any) => p.item_type !== 'retail') 
            : products.filter((p: any) => p.category_id === selectedCategory && p.item_type !== 'retail'),
        unpaidOrders, allTables,
        selectedCategory, setSelectedCategory,
        cart, selectedOrder, setSelectedOrder,
        receivedAmount, setReceivedAmount,
        paymentMethod, setPaymentMethod,
        payableAmount, rawTotal,
        variantModalProduct, setVariantModalProduct,
        statusModal, setStatusModal,
        completedReceipt, setCompletedReceipt,
        qrTableData, setQrTableData,
        showTableSelector, setShowTableSelector,
        currentBrand,
        limitStatus, 
        refreshQuota,
        getFullImageUrl,
        handleSelectTableForQR,
        handleProductClick: (p: any) => (p.price_special || p.price_jumbo) ? setVariantModalProduct(p) : addToCart(p, 'normal'),
        addToCart, removeFromCart, cancelItem, cancelActiveOrder,
        walkInDraftOrderId, cancelledCart,
        handlePayment,
        calculatePrice,
        formatCurrency: (amt: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(amt || 0),
        refreshTables,
        toggleAutoKitchen, // ✅ คืนค่าฟังก์ชันกดปุ่มกลับมาให้หน้าจอใช้งานได้
        unlockAudio, 
        isAudioUnlocked ,
        currentUser,
        fetchAndProcessOrders,
        playSound,
        playScanSound,
        kitchenOrder, // ✅ คืนค่าตัวแปรกลับมาให้เผื่อพี่มีการใช้ใน UI อื่นๆ
        setKitchenOrder
    };
}
