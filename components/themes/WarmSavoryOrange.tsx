import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons (Rounded & Friendly Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // ต้องใส่ <>...</> ครอบถ้ามีหลาย Element
    shop: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </>
    ),
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    search: (
      <>
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </>
    ),
    basket: <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0"/>,
    clock: (
      <>
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </>
    ),
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    plus: (
      <>
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </>
    ),
    minus: <line x1="5" y1="12" x2="19" y2="12"/>,
    x: (
      <>
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </>
    ),
    check: <polyline points="20 6 9 17 4 12"/>,
    trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>,
    fire: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3a1 1 0 0 1 .9-.7z"/>,
    pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>,
    chevronRight: <polyline points="9 18 15 12 9 6"/>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  };

  const content = (icons as any)[name] || icons.home;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {content}
    </svg>
  );
};

export default function App({ state, actions, helpers }: any) {
  const {
    loading, isVerified, activeTab, brand, tableLabel,
    banners, currentBannerIndex, categories, selectedCategoryId,
    products, filteredProducts, selectedProduct,
    cart, cartTotal, ordersList
  } = state || {};

  const {
    setActiveTab, setSelectedCategoryId, setSelectedProduct,
    handleAddToCart, updateQuantity, handleCheckout
  } = actions || {};

  const {
    calculatePrice, getMenuUrl, getBannerUrl
  } = helpers || {};

  // Local state
  const [variant, setVariant] = useState('normal');
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCookNow, setPendingCookNow] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setVariant('normal');
      setQty(1);
      setNote("");
      const io: any = {};
      if (selectedProduct.options && Array.isArray(selectedProduct.options)) {
        selectedProduct.options.forEach((opt: any, i: number) => {
          if (opt.type === 'single' && opt.required && opt.choices.length > 0) io[i] = [opt.choices[0]];
          else io[i] = [];
        });
      }
      setSelectedOptions(io);
    }
  }, [selectedProduct]);

  // --- 🔥 AUTO-CHECKOUT LOGIC ---
  const prevCartLength = useRef(cart?.length || 0);

  useEffect(() => {
    if (pendingCookNow) {
        if (cart?.length > prevCartLength.current) {
             handleCheckout("");
             setPendingCookNow(false);
        }
        const timer = setTimeout(() => {
             if(pendingCookNow) {
                 handleCheckout("");
                 setPendingCookNow(false);
             }
        }, 1000);
        return () => clearTimeout(timer);
    }
    prevCartLength.current = cart?.length || 0;
  }, [cart, pendingCookNow, handleCheckout]);


  if (loading && !isVerified) return <div className="min-h-screen bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-xl">Loading...</div>;

  const basePriceObj = selectedProduct ? calculatePrice(selectedProduct, variant) : { final: 0, original: 0, discount: 0 };
  const selectedToppings = selectedProduct?.options ? selectedProduct.options.flatMap((opt: any, index: number) => (selectedOptions[index] || []).map((choice: any) => ({ group_id: opt.id, group_name: opt.name, topping_id: choice.id, topping_name: choice.name, image_name: choice.image_name || null, image_url: choice.image_url || choice.image_name || null, price: Number(choice.price || 0) }))) : [];
  const toppingTotal = selectedToppings.reduce((s: number, i: any) => s + Number(i.price || 0), 0);
  const finalPriceWithOpts = basePriceObj.final + toppingTotal;
  const currentPriceObj = selectedProduct ? { ...basePriceObj, final: finalPriceWithOpts, original: (basePriceObj.original || basePriceObj.final + basePriceObj.discount) + toppingTotal } : { final: 0, original: 0, discount: 0 };

  const generateOptionNote = () => {
    if (!selectedProduct?.options) return note;
    let t: string[] = [];
    selectedProduct.options.forEach((opt: any, i: number) => { const sc = selectedOptions[i]; if (sc && sc.length > 0) t.push(`${opt.name}: ${sc.map((c: any) => c.name).join(', ')}`); });
    return ((t.length > 0 ? `[${t.join(' | ')}] ` : "") + note).trim();
  };

  const handleOptionToggle = (gi: number, choice: any, type: string) => {
    setSelectedOptions((prev: any) => {
      const cur = prev[gi] || []; const ck = String(choice.id || choice.name);
      const req = !!selectedProduct?.options?.[gi]?.required;
      const sel = cur.some((i: any) => String(i.id || i.name) === ck);
      if (type === 'single') { if (sel && !req) return { ...prev, [gi]: [] }; return { ...prev, [gi]: [choice] }; }
      else { if (sel) return { ...prev, [gi]: cur.filter((i: any) => String(i.id || i.name) !== ck) }; return { ...prev, [gi]: [...cur, choice] }; }
    });
  };

  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;
    if (selectedProduct.options) { for (let i = 0; i < selectedProduct.options.length; i++) { const opt = selectedProduct.options[i]; if (opt.required && (!selectedOptions[i] || selectedOptions[i].length === 0)) { alert(`กรุณาเลือก: ${opt.name}`); return; } } }
    const finalNote = generateOptionNote();
    const productToAdd = { ...selectedProduct, variant, note: finalNote, specialRequest: finalNote, comment: finalNote, remark: finalNote, price: finalPriceWithOpts, original_price: currentPriceObj.original, toppings_snapshot: selectedToppings };
    if (addToCartOnly) { for (let i = 0; i < qty; i++) handleAddToCart(productToAdd, variant, finalNote); setSelectedProduct(null); }
    else { if (cart && cart.length > 0) setShowConfirm(true); else performCookNow(); }
  };

  const performCookNow = () => {
    if (!selectedProduct) return;
    if (selectedProduct.options) { for (let i = 0; i < selectedProduct.options.length; i++) { const opt = selectedProduct.options[i]; if (opt.required && (!selectedOptions[i] || selectedOptions[i].length === 0)) { alert(`กรุณาเลือก: ${opt.name}`); return; } } }
    const finalNote = generateOptionNote();
    const productToAdd = { ...selectedProduct, variant, note: finalNote, specialRequest: finalNote, comment: finalNote, remark: finalNote, price: finalPriceWithOpts, original_price: currentPriceObj.original, toppings_snapshot: selectedToppings };
    for (let i = 0; i < qty; i++) handleAddToCart(productToAdd, variant, finalNote);
    setPendingCookNow(true);
    setSelectedProduct(null);
  };

  const onCheckoutClick = () => {
      handleCheckout("");
      setShowConfirm(false);
  };

  return (
    // Theme: Warm Savory (Orange & Cream)
    <div className="w-full max-w-md md:max-w-xl xl:max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden bg-[#FFF7ED] font-sans text-[#431407]">

        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');

            :root {
                --primary: #fb923c; /* orange-400 */
                --primary-dark: #ea580c; /* orange-600 */
                --bg-soft: #fff7ed; /* orange-50 */
                --accent: #fcd34d; /* amber-300 */
                --text-main: #431407; /* dark brown */
                --white: #ffffff;
            }

            body {
                font-family: 'Prompt', sans-serif;
                background-color: var(--bg-soft);
                -webkit-tap-highlight-color: transparent;
                color: var(--text-main);
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            /* Animations */
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
                100% { transform: translateY(0px); }
            }
            @keyframes popIn {
                0% { opacity: 0; transform: scale(0.9); }
                100% { opacity: 1; transform: scale(1); }
            }
            .animate-pop { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

            /* Components */
            .card-soft {
                background: white;
                border-radius: 1.5rem;
                box-shadow: 0 4px 20px -2px rgba(251, 146, 60, 0.15);
                border: 1px solid #ffedd5;
                transition: transform 0.2s;
            }
            .card-soft:active { transform: scale(0.98); }

            .btn-orange {
                background: linear-gradient(135deg, #fb923c, #ea580c);
                color: white;
                box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
                border-radius: 1.25rem;
                font-weight: 600;
                transition: all 0.2s;
            }
            .btn-orange:active { transform: translateY(2px); box-shadow: 0 2px 5px rgba(234, 88, 12, 0.3); }

            .chip-active {
                background: #ea580c;
                color: white;
                box-shadow: 0 2px 8px rgba(234, 88, 12, 0.25);
            }
            .chip-inactive {
                background: white;
                color: #78350f;
                border: 1px solid #fed7aa;
            }
        `}} />

        {/* --- Header (Cozy Orange Gradient) --- */}
        <header className="bg-gradient-to-b from-[#ea580c] to-[#f97316] text-white pt-10 pb-20 px-6 rounded-b-[2.5rem] relative shadow-lg z-10">
             <div className="flex justify-between items-center relative z-10">
                 <div>
                     <div className="flex items-center gap-2 mb-1 opacity-90">
                         <div className="w-2 h-2 bg-[#fcd34d] rounded-full animate-pulse"></div>
                         <p className="text-xs font-medium uppercase tracking-wide">โต๊ะ {tableLabel}</p>
                     </div>
                     <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                         {brand?.name || "The Savory Spoon"}
                     </h1>
                 </div>
                 <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 text-white shadow-inner">
                     <Icon name="shop" size={24} />
                 </div>
             </div>
             {/* Decorative Circle */}
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </header>

        <main className="px-5 -mt-14 relative z-20">

            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-pop">
                    {/* Banner Slider */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-56 bg-white rounded-[2rem] overflow-hidden shadow-lg mb-8 group border-4 border-white">
                             <img
                                src={getBannerUrl(banners[currentBannerIndex].image_name)}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                             />
                             <div className="absolute top-4 right-4 bg-[#fcd34d] text-[#78350f] px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                                 <Icon name="star" size={12} className="fill-current" /> เมนูแนะนำ
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-end mb-5 px-1">
                         <div>
                             <h2 className="text-xl font-bold text-[#7c2d12]">อร่อยต้องลอง 😋</h2>
                             <p className="text-sm text-[#a8a29e]">คัดมาให้คุณโดยเฉพาะ</p>
                         </div>
                         <button onClick={() => setActiveTab('menu')} className="text-[#ea580c] text-sm font-bold flex items-center gap-1 bg-orange-100 px-3 py-1.5 rounded-lg hover:bg-orange-200 transition-colors">
                             ดูทั้งหมด <Icon name="chevronRight" size={16} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-4 pb-28">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="card-soft p-3 pb-4 cursor-pointer relative group h-full flex flex-col" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full aspect-square overflow-hidden relative rounded-2xl bg-orange-100 mb-3 shadow-inner">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#ef4444] text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                                                ลดพิเศษ
                                            </div>
                                         )}
                                     </div>
                                     <h3 className="font-bold text-[#431407] text-sm line-clamp-2 mb-auto leading-tight">{p.name}</h3>

                                     <div className="flex justify-between items-end mt-2">
                                         <div className="flex flex-col">
                                             {pricing.discount > 0 && (
                                                 <span className="text-[10px] text-gray-400 line-through">
                                                     {pricing.original}
                                                 </span>
                                             )}
                                             <span className="text-[#ea580c] font-bold text-lg leading-none">
                                                 {pricing.final}.-
                                             </span>
                                         </div>
                                         <button className="w-8 h-8 bg-[#ffedd5] text-[#ea580c] flex items-center justify-center rounded-full hover:bg-[#ea580c] hover:text-white transition-all shadow-sm">
                                             <Icon name="plus" size={16} strokeWidth={3} />
                                         </button>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- MENU PAGE --- */}
            {activeTab === 'menu' && (
                <section className="animate-pop pt-4">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                         <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                             <Icon name="search" className="text-orange-400" size={20} />
                         </div>
                         <input type="text" placeholder="หิวอะไรดีครับ..." className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white shadow-sm border border-orange-100 focus:ring-2 focus:ring-orange-200 focus:outline-none text-sm font-medium placeholder:text-orange-300 text-[#431407]" />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)}
                                    className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm
                                    ${selectedCategoryId === c.id ? 'chip-active' : 'chip-inactive'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-28">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="card-soft p-3 pb-4 cursor-pointer relative group h-full flex flex-col">
                                     <div className="w-full aspect-square overflow-hidden relative rounded-2xl bg-orange-100 mb-3 shadow-inner">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                     </div>
                                     <h3 className="font-bold text-[#431407] text-sm line-clamp-2 mb-auto leading-tight">{p.name}</h3>

                                     <div className="flex justify-between items-end mt-2">
                                         <div className="flex flex-col">
                                             {pricing.discount > 0 && <span className="text-[10px] text-gray-400 line-through">{pricing.original}</span>}
                                             <span className="text-[#ea580c] font-bold text-lg leading-none">{pricing.final}.-</span>
                                         </div>
                                         <button className="w-8 h-8 bg-[#ffedd5] text-[#ea580c] flex items-center justify-center rounded-full hover:bg-[#ea580c] hover:text-white transition-all shadow-sm">
                                             <Icon name="plus" size={16} strokeWidth={3} />
                                         </button>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- STATUS PAGE --- */}
            {activeTab === 'status' && (
                <section className="animate-pop pt-4 pb-28">
                    <div className="mb-6 flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                            <Icon name="clock" size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#431407]">ติดตามออเดอร์</h2>
                            <p className="text-xs text-gray-500">อาหารอร่อย กำลังเดินทางมา</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="card-soft p-5 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                     <span className="text-xs text-gray-400 font-bold tracking-wider">
                                         #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-3 py-1 text-[10px] font-bold rounded-lg border flex items-center gap-1.5
                                        ${o.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                         {o.status === 'pending' && <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>}
                                         {o.status === 'pending' ? 'กำลังปรุง' : 'เสิร์ฟแล้ว'}
                                     </span>
                                </div>

                                <div className="space-y-3 relative z-10 border-t border-dashed border-orange-100 pt-3">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#431407]">
                                            <div className="flex items-start gap-2">
                                                <div className="w-5 h-5 rounded bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold shrink-0">{i.quantity}</div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{i.product_name}</span>
                                                    {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-gray-400">{i.variant}</span>}
                                                </div>
                                            </div>
                                            <span className="font-bold">{i.price * i.quantity}.-</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-3 mt-3 border-t border-orange-100">
                                     <span className="font-bold text-gray-400 text-xs">รวมทั้งหมด</span>
                                     <span className="font-bold text-[#ea580c] text-xl">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-16 opacity-60">
                                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
                                    <Icon name="basket" size={32} />
                                </div>
                                <p className="text-gray-500 font-medium">ยังไม่มีรายการสั่งซื้อ</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Soft Bubble) --- */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[70px] bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex justify-around items-center px-2 z-[90] border border-orange-50">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all w-16 ${activeTab === 'home' ? 'text-[#ea580c]' : 'text-gray-300'}`}>
                 <Icon name="home" size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-all w-16 ${activeTab === 'menu' ? 'text-[#ea580c]' : 'text-gray-300'}`}>
                 <Icon name="menu" size={24} strokeWidth={activeTab === 'menu' ? 2.5 : 2} />
             </button>

             {/* Main Cart Button */}
             <div className="relative -mt-12">
                 <button onClick={() => setActiveTab('cart')} className="w-16 h-16 bg-[#ea580c] rounded-full shadow-[0_4px_15px_rgba(234,88,12,0.4)] flex items-center justify-center text-white active:scale-95 transition-transform border-4 border-[#FFF7ED]">
                     <Icon name="basket" size={26} />
                     {cart?.length > 0 && (
                         <span className="absolute top-0 right-0 bg-[#fcd34d] text-[#78350f] text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-all w-16 ${activeTab === 'status' ? 'text-[#ea580c]' : 'text-gray-300'}`}>
                 <Icon name="clock" size={24} strokeWidth={activeTab === 'status' ? 2.5 : 2} />
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center xl:items-end justify-center bg-[#431407]/40 backdrop-blur-sm animate-pop">
                <div onClick={() => setSelectedProduct(null)} className="absolute inset-0"></div>

                <div className="w-full max-w-md md:max-w-xl xl:max-w-md bg-white rounded-t-[2.5rem] md:rounded-2xl xl:rounded-none xl:rounded-t-[2.5rem] shadow-2xl relative overflow-hidden max-h-[90vh] md:max-h-[85vh] xl:max-h-[90vh] flex flex-col">
                    <div className="relative h-56 sm:h-64 md:h-52 xl:h-72 shrink-0 bg-orange-50">
                        <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#ea580c] transition-colors border border-white/30">
                            <Icon name="x" size={20} />
                        </button>

                        <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                            <h2 className="text-2xl font-bold mb-1 leading-tight">{selectedProduct.name}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                {currentPriceObj.discount > 0 && (
                                    <span className="text-sm text-white/70 line-through">
                                        {currentPriceObj.original}
                                    </span>
                                )}
                                <span className="text-4xl font-bold text-[#fcd34d] drop-shadow-sm">{currentPriceObj.final}.-</span>
                                {currentPriceObj.discount > 0 && (
                                    <span className="bg-[#ef4444] text-white text-[10px] px-2 py-1 rounded-lg font-bold ml-2 animate-pulse">
                                        ประหยัด {currentPriceObj.discount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 pb-6 overflow-y-auto bg-white rounded-t-[2rem] -mt-6 relative z-10 flex-1 no-scrollbar">
                        <div className="space-y-6">
                            {/* Variant Selector */}
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">เลือกขนาด</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { key: 'normal', label: 'ปกติ', icon: 'star', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'พิเศษ', icon: 'star', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'จัมโบ้', icon: 'star', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button
                                            key={v.key}
                                            onClick={() => setVariant(v.key)}
                                            className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 relative
                                                ${variant === v.key
                                                    ? 'border-[#ea580c] bg-[#fff7ed] text-[#ea580c] shadow-md'
                                                    : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                                        >
                                            <span className="text-sm font-bold">{v.label}</span>
                                            <span className="text-lg font-bold">{v.final}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Options */}
                            {selectedProduct.options && selectedProduct.options.length > 0 && (
                              <div className="space-y-3">
                                {selectedProduct.options.map((opt: any, index: number) => (
                                  <div key={index} className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <label className="text-sm font-bold text-orange-900">{opt.name}{opt.required && <span className="text-red-500 ml-1 text-xs">*</span>}</label>
                                      <span className="text-[10px] font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">{opt.type === 'single' ? 'เลือก 1' : 'เลือกหลาย'}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                      {opt.choices.map((choice: any, cIndex: number) => {
                                        const ck = String(choice.id || choice.name);
                                        const isSel = (selectedOptions[index] || []).some((i: any) => String(i.id || i.name) === ck);
                                        return (
                                          <div key={cIndex} onClick={() => handleOptionToggle(index, choice, opt.type)}
                                            className={`flex items-center justify-between p-2.5 rounded-xl border-2 cursor-pointer transition-all ${isSel ? 'bg-orange-100 border-orange-400 text-orange-900 shadow-sm' : 'bg-white border-orange-100 text-orange-400 hover:border-orange-300'}`}>
                                            <div className="flex items-center gap-2">
                                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSel ? 'bg-orange-500 border-orange-600 text-white' : 'bg-white border-orange-200'}`}>
                                                {isSel && <Icon name="check" size={12} />}
                                              </div>
                                              {(choice.image_url || choice.image_name) && <img src={choice.image_url || getMenuUrl(choice.image_name)} alt={choice.name} className="w-8 h-8 object-cover rounded-lg border border-orange-100" />}
                                              <span className="font-bold text-sm">{choice.name}</span>
                                            </div>
                                            {Number(choice.price) > 0 && <span className={`font-black text-sm ${isSel ? 'text-orange-700' : 'text-orange-300'}`}>+{Number(choice.price)}.-</span>}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Qty Control */}
                            <div className="flex items-center justify-between p-4 bg-[#fff7ed] rounded-2xl border border-[#ffedd5]">
                                <span className="text-sm font-bold text-[#ea580c]">จำนวน</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-8 h-8 bg-white text-[#ea580c] rounded-lg flex items-center justify-center shadow-sm active:scale-95"><Icon name="minus" size={16}/></button>
                                    <span className="text-xl font-bold w-8 text-center text-[#431407]">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-8 h-8 bg-[#ea580c] text-white rounded-lg flex items-center justify-center shadow-sm active:scale-95"><Icon name="plus" size={16}/></button>
                                </div>
                            </div>

                            {/* Note Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-500 mb-2">โน๊ตเพิ่มเติม</label>
                                <div className="relative">
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="เช่น ไม่ใส่ผัก, เผ็ดน้อย..."
                                        className="w-full p-4 pl-10 bg-gray-50 border border-gray-100 rounded-2xl focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] focus:outline-none h-24 resize-none text-sm text-[#431407] placeholder:text-gray-400"
                                    />
                                    <div className="absolute top-4 left-3 text-gray-400">
                                        <Icon name="pencil" size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 w-full p-5 md:p-6 bg-white border-t border-gray-100 grid grid-cols-2 gap-4 z-30">
                        <button onClick={() => handleAdd(true)} className="py-4 bg-white border-2 border-[#ea580c] text-[#ea580c] font-bold rounded-2xl active:scale-95 transition-all">
                            ใส่ตะกร้า
                        </button>
                        <button onClick={() => handleAdd(false)} className="py-4 btn-orange font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
                            สั่งเลยทันที <Icon name="fire" size={20} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART DRAWER (Clean & Warm) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#431407]/40 backdrop-blur-sm animate-pop">
                 <div className="w-full max-w-md md:max-w-xl xl:max-w-md bg-white rounded-t-[2.5rem] md:rounded-2xl xl:rounded-none xl:rounded-t-[2.5rem] shadow-2xl h-[85vh] md:h-[80vh] xl:h-[85vh] flex flex-col relative mx-auto">
                     {/* Handle */}
                     <div onClick={() => setActiveTab('menu')} className="w-full py-4 flex justify-center cursor-pointer hover:bg-gray-50 rounded-t-[2.5rem]">
                         <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                     </div>

                     <div className="px-8 mb-4">
                        <h2 className="text-2xl font-bold text-[#431407]">ตะกร้าของคุณ</h2>
                        <p className="text-sm text-gray-500">{cart.length} รายการพร้อมสั่ง</p>
                     </div>

                     <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 no-scrollbar">
                         {cart.map((item: any, idx: any) => {
                            const finalPriceTotal = item.price * item.quantity;
                            const originalPriceTotal = (item.original_price || item.price) * item.quantity;
                            const hasDiscount = originalPriceTotal > finalPriceTotal;

                             return (
                             <div key={idx} className="flex gap-4 p-3 card-soft shadow-sm border-0 bg-[#fff7ed]/50">
                                 <div className="w-20 h-20 bg-white rounded-xl overflow-hidden shrink-0 shadow-sm">
                                     <img src={item.image_url} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                     <h3 className="font-bold text-[#431407] text-sm line-clamp-1">{item.name}</h3>
                                     <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                                         {item.variant !== 'normal' && <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-[#ea580c]">{item.variant}</span>}
                                         {item.note && (
                                             <span className="italic flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-gray-200">
                                                 <Icon name="pencil" size={10} /> "{item.note}"
                                             </span>
                                         )}
                                     </div>

                                     <div className="flex justify-between items-end mt-2">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => updateQuantity(idx, -1)} className="text-gray-400 hover:text-[#ef4444]"><Icon name="minus" size={16}/></button>
                                            <span className="text-sm font-bold text-[#431407]">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(idx, 1)} className="text-gray-400 hover:text-[#ea580c]"><Icon name="plus" size={16}/></button>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {hasDiscount && (
                                                <span className="text-xs text-gray-400 line-through">{originalPriceTotal}</span>
                                            )}
                                            <span className="font-bold text-[#ea580c] text-lg leading-none">{finalPriceTotal}.-</span>
                                        </div>
                                     </div>
                                 </div>
                                 <button onClick={() => updateQuantity(idx, -100)} className="absolute top-2 right-2 text-gray-300 hover:text-[#ef4444] transition-colors">
                                     <Icon name="trash" size={16} />
                                 </button>
                             </div>
                         )})}
                         {cart.length === 0 && (
                             <div className="text-center py-20 opacity-50">
                                 <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-300">
                                     <Icon name="basket" size={40} />
                                 </div>
                                 <p className="text-gray-500 font-medium">ยังไม่ได้เลือกเมนูเลย</p>
                             </div>
                         )}
                     </div>

                     <div className="p-6 bg-white border-t border-gray-100 rounded-t-[2rem] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                         <div className="flex justify-between items-center mb-6">
                             <span className="text-gray-600 font-bold text-lg">ยอดรวมสุทธิ</span>
                             <span className="text-3xl font-bold text-[#ea580c]">{cartTotal}.-</span>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} disabled={cart.length === 0} className="w-full py-4 btn-orange text-white font-bold text-lg active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2">
                             <Icon name="check" size={20} /> ยืนยันออเดอร์
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#431407]/60 backdrop-blur-sm p-6 animate-pop">
                <div className="w-full max-w-sm bg-white rounded-[2rem] p-8 text-center shadow-2xl relative border-4 border-[#fff7ed]">
                    <div className="w-24 h-24 bg-orange-100 text-[#ea580c] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white">
                        <Icon name="check" size={48} strokeWidth={3} />
                    </div>

                    {selectedProduct ? (
                         <>
                             <h3 className="text-xl font-bold text-[#431407] mb-2">สั่งเลยไหมครับ?</h3>
                             <p className="text-gray-500 mb-8 text-sm">เพิ่ม "{selectedProduct.name}" เข้าครัวทันที</p>
                             <div className="flex flex-col gap-3">
                                 <button onClick={() => { performCookNow(); setShowConfirm(false); }} className="w-full py-4 btn-orange text-white font-bold rounded-xl shadow-lg">ยืนยัน สั่งเลย!</button>
                                 <button onClick={() => { handleAdd(true); setShowConfirm(false); }} className="w-full py-4 bg-white border-2 border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50">ใส่ตะกร้าไว้ก่อน</button>
                             </div>
                         </>
                    ) : (
                         <>
                             <h3 className="text-xl font-bold text-[#431407] mb-2">ยืนยันการสั่งซื้อ</h3>
                             <p className="text-gray-500 mb-8 text-sm">ส่งรายการอาหาร {cart.length} อย่าง เข้าครัวเลยนะครับ?</p>
                             <div className="flex flex-col gap-3">
                                 <button onClick={() => { onCheckoutClick(); }} className="w-full py-4 btn-orange text-white font-bold rounded-xl shadow-lg">ยืนยันการสั่ง</button>
                                 <button onClick={() => setShowConfirm(false)} className="w-full py-4 text-gray-400 font-bold text-sm hover:text-gray-600">ยกเลิก</button>
                             </div>
                         </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}