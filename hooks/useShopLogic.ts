import { useState, useEffect, useMemo, useCallback, use } from "react";
import { supabase } from "@/lib/supabase";
import {
  fetchShopData,
  fetchShopOrderStatus,
  submitOrder,
} from "@/app/actions/shop";

// 🔥 1. แก้ไข URL รูปภาพให้ดึงจาก Cloudflare (R2) แทน Supabase
const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

const roundToQuarter = (value: number) => Math.round(value * 4) / 4;

export const useShopLogic = (params: any) => {
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { slug: currentSlug, brandId, tableId: combinedId } = resolvedParams || {};

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  
  // Data States
  const [brand, setBrand] = useState<any>(null);
  const [tableLabel, setTableLabel] = useState("");
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  
  // Cart & UI States
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [cart, setCart] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // --- Computed ---
  const realTableId = useMemo(() => combinedId?.substring(0, 36), [combinedId]);

  const kickOut = useCallback((reason: string) => {
    console.warn(`🚫 Kickout triggered: ${reason}`);
    setError(reason);
    setLoading(false);
  }, []);

  // 🔥 2. แก้ไข Helper Function ให้ใช้ CDN_URL ตัวใหม่
  const getMenuUrl = (imageName: string) => imageName ? (imageName.startsWith('http') ? imageName : `${CDN_URL}/${imageName}`) : null;
  const getBannerUrl = (imageName: string) => imageName ? (imageName.startsWith('http') ? imageName : `${CDN_URL}/${imageName}`) : null;

  // =========================================================================
  // ฟังก์ชันกรองบิลยกเลิกทิ้ง + ตัดราคาเมนูย่อยเหลือ 0
  // =========================================================================
  const transformOrdersForDisplay = useCallback((orders: any[]) => {
    if (!orders || !Array.isArray(orders)) return [];
    const activeOrders = orders.filter(order => order.status !== 'cancelled');

    return activeOrders.map(order => {
      const transformedItems = (order.order_items || []).map((item: any) => {
        if (item.status === 'cancelled') {
          return {
            ...item,
            product_name: `❌ [ยกเลิก] ${item.product_name}`,
            price: 0 
          };
        }
        return item;
      });

      const newTotalPrice = transformedItems.reduce((sum: number, item: any) => {
        return sum + (Number(item.price) * Number(item.quantity));
      }, 0);

      return {
        ...order,
        total_price: newTotalPrice, 
        order_items: transformedItems
      };
    });
  }, []);

  // --- Pricing Logic ---
  const calculatePrice = useCallback((product: any, variant = 'normal') => {
    // 🔥 3. ป้องกันบัค Double Discount: ดึงราคาดั้งเดิมจาก State products เสมอ!
    // ถ้าหาใน State ไม่เจอ ค่อยใช้ product.price ที่โยนเข้ามา
    const originalProduct = products?.find((p: any) => p.id === product.id) || product;

    let basePrice = Number(originalProduct.price || 0);
    if (variant === 'special') basePrice = Number(originalProduct.price_special || originalProduct.price);
    if (variant === 'jumbo') basePrice = Number(originalProduct.price_jumbo || originalProduct.price);

    const now = new Date();
    const applicableDiscounts = discounts.filter(d => {
      const isTimeValid = (!d.start_date || new Date(d.start_date) <= now) && (!d.end_date || new Date(d.end_date) >= now);
      if (!isTimeValid) return false;
      if (variant === 'normal' && !d.apply_normal) return false;
      if (variant === 'special' && !d.apply_special) return false;
      if (variant === 'jumbo' && !d.apply_jumbo) return false;
      if (d.apply_to === 'all') return true;
      if (d.apply_to === 'specific') return d.discount_products?.some((dp:any) => dp.product_id === product.id);
      return false;
    });

    const roundedOriginal = roundToQuarter(basePrice);
    if (applicableDiscounts.length === 0) {
      return { original: roundedOriginal, final: roundedOriginal, discount: 0 };
    }

    const discountResults = applicableDiscounts.map(d => {
      let final = basePrice;
      if (d.type === 'percentage') final = basePrice - (basePrice * d.value / 100);
      else if (d.type === 'fixed') final = basePrice - d.value;
      return Math.max(0, final);
    });

    const bestPrice = Math.min(...discountResults);
    const roundedFinal = roundToQuarter(bestPrice);

    return { 
      original: roundedOriginal, 
      final: roundedFinal, 
      discount: Math.max(0, roundedOriginal - roundedFinal) 
    };
  }, [discounts, products]); // 👈 เพิ่ม products ใน Dependency

  // --- Initialize Effect ---
  useEffect(() => {
    let isMounted = true; 
    
    async function init() {
      if (!brandId || !combinedId || !realTableId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetchShopData({ 
          brandId, 
          combinedId, 
          slug: decodeURIComponent(currentSlug || '') 
        });

        if (!isMounted) return;

        if (!res.success || !res.data) {
          if (res.redirect) {
             window.location.href = res.redirect;
          } else {
             kickOut(res.error || "Access Denied");
          }
          return;
        }

        const d = res.data;
        
        setBrand(d.brand);
        setTableLabel(d.tableLabel);
        setBanners(d.banners || []);
        setCategories(d.categories || []);

        // 🌟 สุ่มสินค้าแนะนำให้ครบ 6 รายการในหน้าแรก หากที่ตั้งค่าไว้มีน้อยกว่า 6
        const fillRecommended = (rawList: any[], target: number = 6) => {
          if (!Array.isArray(rawList) || rawList.length === 0) return [];
          const manualRec = rawList.filter((p: any) => Boolean(p.is_recommended));
          if (manualRec.length >= target) return rawList;

          const others = rawList.filter((p: any) => !p.is_recommended);
          const needed = target - manualRec.length;
          const shuffled = [...others].sort(() => 0.5 - Math.random());
          const fillItems = shuffled.slice(0, needed).map((p: any) => ({
            ...p,
            is_recommended: true,
            is_auto_recommended: true,
          }));
          const remaining = shuffled.slice(needed);
          return [...manualRec, ...fillItems, ...remaining];
        };

        setProducts(fillRecommended(d.products || [], 6));
        setDiscounts(d.discounts || []);
        
        setOrdersList(transformOrdersForDisplay(d.orders || [])); 
        
        setIsVerified(true);
        setLoading(false);
      } catch (err) {
        console.error("Init Error:", err);
        kickOut("Connection Error");
      }
    }

    init();
    return () => { isMounted = false; };
  }, [brandId, combinedId, realTableId, currentSlug, kickOut, transformOrdersForDisplay]);

  // --- Banner Interval ---
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  // 🔒 ล็อกการเลื่อนของพื้นหลัง (Body Scroll Lock) เมื่อเปิด Modal สินค้า (selectedProduct)
  // ครอบคลุมทุกธีม 100% ทั้งบนมือถือ (iOS/Android) และ Desktop
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (selectedProduct) {
      const scrollY = window.scrollY;
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyTop = document.body.style.top;
      const originalBodyWidth = document.body.style.width;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalOverscroll = document.body.style.overscrollBehavior;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.overscrollBehavior = "none";

      return () => {
        document.body.style.position = originalBodyPosition;
        document.body.style.top = originalBodyTop;
        document.body.style.width = originalBodyWidth;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.overscrollBehavior = originalOverscroll;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.documentElement.style.overscrollBehavior = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [selectedProduct]);

  // ⚡ Supabase Realtime แทนการ Polling ทุก 5 วินาที
  useEffect(() => {
    if (!realTableId || !brandId || !combinedId) return;
    let active = true;
    let refreshing = false;

    const refreshOrders = async () => {
      if (refreshing) return;
      refreshing = true;
      try {
        const result = await fetchShopOrderStatus({
          brandId,
          combinedId,
          slug: decodeURIComponent(currentSlug || ''),
        });
        if (!active) return;
        if (!result.success) {
          kickOut(result.error || 'Table session expired');
          return;
        }
        setOrdersList(transformOrdersForDisplay(result.orders || []));
      } finally {
        refreshing = false;
      }
    };

    // เมื่อเปิดเข้ามาหรือเปลี่ยนแท็บมาดูหน้า status ให้ดึงข้อมูลล่าสุด 1 ครั้ง
    if (activeTab === 'status') {
      refreshOrders();
    }

    // 1. ฟังการเปลี่ยนแปลงของตาราง orders สำหรับโต๊ะนี้ผ่าน Supabase Realtime
    const orderChannel = supabase
      .channel(`table-orders-${realTableId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `table_id=eq.${realTableId}`,
        },
        () => {
          if (active) refreshOrders();
        }
      )
      .on(
        'broadcast',
        { event: '*' },
        () => {
          if (active) refreshOrders();
        }
      )
      .subscribe();

    // 2. ฟัง Broadcast จากร้านค้า (เช่น เมื่อมีการเปลี่ยนสถานะ หรือแอดมินแจ้งเตือน)
    const brandChannel = supabase
      .channel(`brand-${brandId}`)
      .on(
        'broadcast',
        { event: '*' },
        () => {
          if (active) refreshOrders();
        }
      )
      .subscribe();

    return () => {
      active = false;
      try { supabase.removeChannel(orderChannel); } catch (_) {}
      try { supabase.removeChannel(brandChannel); } catch (_) {}
    };
  }, [
    realTableId,
    brandId,
    combinedId,
    currentSlug,
    activeTab,
    kickOut,
    transformOrdersForDisplay,
  ]);

  // --- Cart Actions ---
  const handleAddToCart = (product: any, variant: any, note: string = "") => {
    const pricing = calculatePrice(product, variant);
    const cleanNote = note ? note.trim() : "";
    const toppingsSnapshot = Array.isArray(product.toppings_snapshot)
      ? product.toppings_snapshot
      : [];
    const toppingTotal = toppingsSnapshot.reduce(
      (sum: number, item: any) => sum + Number(item.price || 0),
      0,
    );
    const toppingsKey = toppingsSnapshot
      .map((item: any) => `${item.group_id || item.group_name}:${item.topping_id || item.topping_name}`)
      .sort()
      .join('|');

    setCart(prev => {
        const existingIndex = prev.findIndex(i => 
            i.id === product.id &&
            i.variant === variant &&
            (i.note || "") === cleanNote &&
            (i.toppings_key || "") === toppingsKey
        );

        if (existingIndex !== -1) {
            const newCart = [...prev];
            newCart[existingIndex] = {
                ...newCart[existingIndex],
                quantity: newCart[existingIndex].quantity + 1
            };
            return newCart;
        }

        // 🔥 4. ปล่อยให้ตะกร้าเก็บราคาที่ลดแล้วไปได้เลย เพราะเราแก้ calculatePrice ให้ฉลาดพอที่จะไม่ลดซ้ำแล้ว!
        return [...prev, { 
            ...product, 
            variant, 
            price: pricing.final + toppingTotal,
            original_price: pricing.original + toppingTotal,
            discount: pricing.discount,
            quantity: 1, 
            image_url: getMenuUrl(product.image_name),
            note: cleanNote,
            toppings_snapshot: toppingsSnapshot,
            toppings_key: toppingsKey,
        }];
    });
    setSelectedProduct(null);
  };

  const updateQuantity = (idx: number, delta: number) => {
    setCart(prev => {
        const newCart = [...prev];
        const newQuantity = newCart[idx].quantity + delta;
        
        if (newQuantity <= 0) {
            newCart.splice(idx, 1);
        } else {
            newCart[idx] = {
                ...newCart[idx],
                quantity: newQuantity
            };
        }
        return newCart;
    });
  };

 // --- Checkout Action ---
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      setLoading(true);
      
      const totalPrice = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

      const result = await submitOrder({
          brandId,
          combinedId,
          tableLabel,
          totalPrice,
          cart
      });

      if (!result.success) {
          const message = (result as any).code === 'ORDER_LIMIT_REACHED'
              ? (result.error || 'ร้านนี้ถึงขีดจำกัดแพ็กเกจแล้ว กรุณาแจ้งร้านให้อัปเกรด/สมัครสมาชิกเพื่อรับออเดอร์ต่อครับ')
              : (result.error || 'Order failed');
          throw new Error(message);
      }

      setCart([]);
      setActiveTab('status');
      setOrdersList(transformOrdersForDisplay(result.orders || [])); 
    } catch (err: any) { 
        const message = err?.message || 'Order failed';
        if (message.includes('ขีดจำกัด') || message.includes('แพ็กเกจ') || message.includes('สมัครสมาชิก') || message.includes('อัปเกรด')) {
            alert(message);
        } else {
            alert(`Failed to order: ${message}`);
        } 
    } finally { 
        setLoading(false); 
    }
  };

  const filteredProducts = useMemo(() => selectedCategoryId === "all" ? products : products.filter((p: any) => p.category_id === selectedCategoryId), [products, selectedCategoryId]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

  return {
    state: {
      loading, error, isVerified, activeTab, brand, tableLabel, banners, categories, 
      products, selectedCategoryId, cart, ordersList, currentBannerIndex, selectedProduct,
      filteredProducts, cartTotal
    },
    actions: {
      setActiveTab, setSelectedCategoryId, setSelectedProduct, 
      handleAddToCart, updateQuantity, handleCheckout
    },
    helpers: {
      getMenuUrl, getBannerUrl, calculatePrice
    }
  };
};
