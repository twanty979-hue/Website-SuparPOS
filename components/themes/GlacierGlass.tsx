import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons (Glacier Glass Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
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
    chevronRight: <polyline points="9 18 15 12 9 6"/>,
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
      strokeWidth="1.5"
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCookNow, setPendingCookNow] = useState(false);

  // State สำหรับเก็บตัวเลือกเสริม (แค่ชื่อ ไม่มีราคา)
  const [selectedOptions, setSelectedOptions] = useState<any>({});

  useEffect(() => {
    if (selectedProduct) {
      setVariant('normal');
      setQty(1);
      setNote("");

      // รีเซ็ตตัวเลือกเสริม
      const initialOptions: any = {};
      if (selectedProduct.options && Array.isArray(selectedProduct.options)) {
        selectedProduct.options.forEach((opt: any, index: number) => {
            if (opt.type === 'single' && opt.required && opt.choices.length > 0) {
                initialOptions[index] = [opt.choices[0]];
            } else {
                initialOptions[index] = [];
            }
        });
      }
      setSelectedOptions(initialOptions);
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

  // 🌟 คำนวณราคาเมนูหลัก (ไม่รวมออปชั่นใดๆ เพราะออปชั่นไม่มีราคา)
  const basePriceObj = selectedProduct ? calculatePrice(selectedProduct, variant) : { final: 0, original: 0, discount: 0 };

  // 🌟 ฟังก์ชันจัดการ Text ของ Option เข้าไปใน Note
  const generateOptionNote = () => {
    if (!selectedProduct?.options) return note;

    let optTexts: string[] = [];
    selectedProduct.options.forEach((opt: any, index: number) => {
        const selectedChoices = selectedOptions[index];
        if (selectedChoices && selectedChoices.length > 0) {
            optTexts.push(`${opt.name}: ${selectedChoices.map((choice: any) => choice.name).join(', ')}`);
        }
    });

    const optionsString = optTexts.length > 0 ? `[${optTexts.join(' | ')}] ` : "";
    return (optionsString + note).trim();
  };

  // ท็อปปิ้งไม่มีราคา ดังนั้นราคารวมจึงเท่ากับราคาปกติครับ
  const selectedToppings = selectedProduct?.options
    ? selectedProduct.options.flatMap((opt: any, index: number) =>
        (selectedOptions[index] || []).map((choice: any) => ({
          group_id: opt.id,
          group_name: opt.name,
          topping_id: choice.id,
          topping_name: choice.name,
          image_name: choice.image_name || null,
          image_url: choice.image_url || choice.image_name || null,
          price: Number(choice.price || 0),
        }))
      )
    : [];
  const toppingTotal = selectedToppings.reduce((sum: number, item: any) => sum + Number(item.price || 0), 0);
  const finalPriceWithOpts = basePriceObj.final + toppingTotal;

  // 🌟 ฟังก์ชันคลิกเลือก Option
  const handleOptionToggle = (groupIndex: number, choice: any, type: string) => {
      setSelectedOptions((prev: any) => {
          const currentSelected = prev[groupIndex] || [];
          const choiceKey = String(choice.id || choice.name);
          const isRequired = !!selectedProduct?.options?.[groupIndex]?.required;
          const isAlreadySelected = currentSelected.some((item: any) => String(item.id || item.name) === choiceKey);
          if (type === 'single') {
              if (isAlreadySelected && !isRequired) {
                  return { ...prev, [groupIndex]: [] };
              }
              return { ...prev, [groupIndex]: [choice] };
          } else {
              if (isAlreadySelected) {
                  return { ...prev, [groupIndex]: currentSelected.filter((item: any) => String(item.id || item.name) !== choiceKey) };
              } else {
                  return { ...prev, [groupIndex]: [...currentSelected, choice] };
              }
          }
      });
  };

  // --- 📝 Robust Data Passing ---
  const handleAdd = (addToCartOnly = true) => {
    if (!selectedProduct) return;

    // ตรวจสอบ Option บังคับ
    if (selectedProduct.options) {
        for (let i = 0; i < selectedProduct.options.length; i++) {
            const opt = selectedProduct.options[i];
            if (opt.required && (!selectedOptions[i] || selectedOptions[i].length === 0)) {
                alert(`กรุณาเลือก: ${opt.name}`);
                return;
            }
        }
    }

    const finalNote = generateOptionNote();

    const productToAdd = {
        ...selectedProduct,
        variant: variant,
        note: finalNote,
        specialRequest: finalNote,
        comment: finalNote,
        remark: finalNote,
        price: finalPriceWithOpts,
        original_price: (basePriceObj.original || basePriceObj.final + basePriceObj.discount) + toppingTotal,
        toppings_snapshot: selectedToppings,
    };

    if (addToCartOnly) {
        for(let i=0; i<qty; i++) {
            handleAddToCart(productToAdd, variant, finalNote);
        }
        setSelectedProduct(null);
    } else {
        if (cart && cart.length > 0) setShowConfirm(true);
        else performCookNow(productToAdd, finalNote);
    }
  };

  const performCookNow = (prodObj = selectedProduct, nNote = note) => {
    let finalObj = prodObj;
    let finalNote = nNote;

    if (!finalObj || finalObj === selectedProduct) {
        finalNote = generateOptionNote();
        finalObj = {
            ...selectedProduct,
            variant: variant,
            note: finalNote,
            specialRequest: finalNote,
            comment: finalNote,
            remark: finalNote,
            price: finalPriceWithOpts,
            original_price: (basePriceObj.original || basePriceObj.final + basePriceObj.discount) + toppingTotal,
            toppings_snapshot: selectedToppings,
        };
    }

    for(let i=0; i<qty; i++) {
        handleAddToCart(finalObj, variant, finalNote);
    }
    setPendingCookNow(true);
    setSelectedProduct(null);
  };

  const onCheckoutClick = () => {
      handleCheckout("");
      setShowConfirm(false);
  };

  if (loading && !isVerified) return <div className="min-h-screen bg-gradient-to-tr from-[#E0F2FE] to-[#F0FDFA] flex items-center justify-center text-cyan-800 font-medium text-xl tracking-wider">LOADING</div>;

  return (
    // Theme: Glacier Glass
    <div className="w-full max-w-md md:max-w-xl xl:max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden bg-gradient-to-tr from-[#E0F2FE] to-[#F0FDFA] font-sans text-slate-800">

        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600&display=swap');

            :root {
                --primary: #0e7490; /* cyan-700 */
                --secondary: #475569; /* slate-600 */
                --text-main: #1e293b; /* slate-800 */
                --glass-bg: rgba(255, 255, 255, 0.4);
                --glass-border: rgba(255, 255, 255, 0.4);
            }

            body {
                font-family: 'Sarabun', sans-serif;
                -webkit-tap-highlight-color: transparent;
                color: var(--text-main);
            }

            .font-head { font-family: 'Outfit', sans-serif; }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            /* Animations */
            @keyframes slideUpFade { 
                from { opacity: 0; transform: translateY(15px); } 
                to { opacity: 1; transform: translateY(0); } 
            }
            .animate-fade { animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            
            .glass-panel {
                background: var(--glass-bg);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid var(--glass-border);
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.03);
            }
        `}} />

        {/* --- Header --- */}
        <header className="glass-panel sticky top-0 z-50 px-6 py-5 mx-4 mt-4 rounded-2xl flex justify-between items-center mb-6">
             <div>
                 <p className="text-cyan-700/70 text-[10px] font-semibold tracking-[0.15em] font-head uppercase mb-0.5">Table {tableLabel}</p>
                 <h1 className="text-xl font-bold tracking-tight text-slate-800 font-head">{brand?.name || "Glacier Glass"}</h1>
             </div>
             <div className="w-10 h-10 bg-white/50 backdrop-blur rounded-full shadow-sm border border-white flex items-center justify-center text-cyan-600">
                 <Icon name="shop" size={18} />
             </div>
        </header>

        <main className="px-4 relative z-20">
            {activeTab === 'home' && (
                <section className="animate-fade">
                    {banners?.length > 0 && (
                        <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden mb-8 shadow-sm border border-white/50">
                             <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-5 px-2">
                         <h2 className="text-lg font-bold text-slate-800 font-head">Recommended</h2>
                         <button onClick={() => setActiveTab('menu')} className="text-cyan-700 text-xs font-medium flex items-center gap-1 hover:text-cyan-600 transition-colors bg-white/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/40">
                             View All <Icon name="chevronRight" size={12} />
                         </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-4">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="glass-panel p-3 rounded-2xl cursor-pointer group hover:bg-white/60 transition-all" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full aspect-square overflow-hidden bg-white/50 rounded-xl mb-3 relative shadow-inner">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-[10px] px-2 py-1 rounded-full shadow-sm">
                                                -{pricing.discount}
                                            </div>
                                         )}
                                     </div>
                                     <h3 className="font-semibold text-slate-800 text-sm mb-1 leading-snug line-clamp-2">{p.name}</h3>
                                     <div className="flex items-center gap-2">
                                         <span className="text-cyan-700 font-bold text-base font-head">{pricing.final}</span>
                                         {pricing.discount > 0 && (
                                             <span className="text-[10px] text-slate-400 line-through font-head">
                                                 {pricing.original}
                                             </span>
                                         )}
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {activeTab === 'menu' && (
                <section className="animate-fade">
                    <div className="relative mb-6 mx-2">
                         <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Icon name="search" className="text-cyan-700/50" size={18} /></div>
                         <input type="text" placeholder="Search for dishes..." value={state?.searchTerm} onChange={(e) => actions?.setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 glass-panel rounded-2xl focus:bg-white/60 outline-none text-sm text-slate-800 placeholder-slate-400 transition-colors shadow-sm" />
                    </div>
                    <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2 px-2">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)}
                                    className={`shrink-0 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all shadow-sm
                                    ${selectedCategoryId === c.id ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent' : 'glass-panel text-slate-600 hover:bg-white/60'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-3 pb-20">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="glass-panel p-3 rounded-2xl flex gap-4 cursor-pointer hover:bg-white/60 transition-all" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-24 h-24 bg-white/50 shadow-inner overflow-hidden shrink-0 rounded-xl relative">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-1 right-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                                                -{pricing.discount}
                                            </div>
                                         )}
                                     </div>
                                     <div className="flex-1 flex flex-col justify-center">
                                         <h3 className="font-semibold text-slate-800 text-sm mb-1">{p.name}</h3>
                                         {p.description && <p className="text-xs text-slate-500 line-clamp-1 mb-2">{p.description}</p>}
                                         <div className="flex items-center gap-2 mt-auto">
                                             <span className="text-cyan-700 font-bold font-head text-base">{pricing.final}.-</span>
                                             {pricing.discount > 0 && <span className="text-xs text-slate-400 line-through font-head">{pricing.original}</span>}
                                         </div>
                                     </div>
                                     <div className="flex items-center">
                                         <div className="w-8 h-8 rounded-full bg-white/50 border border-white flex items-center justify-center text-cyan-600 shadow-sm transition-colors">
                                             <Icon name="plus" size={14} />
                                         </div>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {activeTab === 'status' && (
                <section className="animate-fade pt-2 pb-24 px-2">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 font-head">Order Status</h2>

                    <div className="space-y-4">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="glass-panel p-5 rounded-2xl">
                                <div className="flex justify-between items-start mb-5 pb-4 border-b border-white/30">
                                     <div>
                                         <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest block mb-1">Ticket ID</span>
                                         <span className="text-sm font-bold text-slate-800 font-head">#{o.id.slice(-4)}</span>
                                     </div>
                                     <div className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm
                                        ${o.status === 'pending' ? 'bg-amber-100/80 text-amber-700 border border-amber-200' : 'bg-emerald-100/80 text-emerald-700 border border-emerald-200'}`}>
                                         {o.status === 'pending' ? 'รอรับ' : 'กำลังทำ'}
                                     </div>
                                </div>

                                <div className="space-y-3 mb-5">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-slate-600">
                                            <div className="flex gap-3">
                                                <span className="text-cyan-700 font-bold w-6">{i.quantity}x</span>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-800">{i.product_name}</span>
                                                    {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">{i.variant}</span>}
                                                    {i.note && <span className="text-[10px] text-slate-500 italic mt-0.5 leading-snug">{i.note}</span>}
                                                </div>
                                            </div>
                                            <span className="font-head font-bold text-slate-800">{i.price * i.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-white/30">
                                     <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">Total</span>
                                     <span className="font-bold text-xl text-cyan-700 font-head">
                                         {o.total_price || o.order_items.reduce((a: any, b: any) => a + (b.price * b.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20 bg-white/20 rounded-2xl border border-white/30 border-dashed">
                                <p className="text-sm font-medium text-slate-500">No active orders</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        <nav className="fixed bottom-4 left-4 right-4 h-[70px] glass-panel rounded-2xl flex justify-around items-center z-[90] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition-colors p-2 ${activeTab === 'home' ? 'text-cyan-600 drop-shadow-sm' : 'text-slate-400'}`}>
                 <Icon name="home" size={24} />
                 <span className="text-[9px] font-bold uppercase tracking-widest font-head">Home</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1.5 transition-colors p-2 ${activeTab === 'menu' ? 'text-cyan-600 drop-shadow-sm' : 'text-slate-400'}`}>
                 <Icon name="menu" size={24} />
                 <span className="text-[9px] font-bold uppercase tracking-widest font-head">Menu</span>
             </button>

             <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-1.5 transition-colors p-2 relative ${activeTab === 'cart' ? 'text-cyan-600 drop-shadow-sm' : 'text-slate-400'}`}>
                 <div className="relative">
                     <Icon name="basket" size={24} />
                     {cart?.length > 0 && (
                         <span className="absolute -top-1.5 -right-2 bg-gradient-to-tr from-cyan-500 to-blue-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                             {cart.length}
                         </span>
                     )}
                 </div>
                 <span className="text-[9px] font-bold uppercase tracking-widest font-head">Cart</span>
             </button>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1.5 transition-colors p-2 ${activeTab === 'status' ? 'text-cyan-600 drop-shadow-sm' : 'text-slate-400'}`}>
                 <Icon name="clock" size={24} />
                 <span className="text-[9px] font-bold uppercase tracking-widest font-head">Status</span>
             </button>
        </nav>

       {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center xl:items-end justify-center bg-slate-900/30 backdrop-blur-md animate-fade">
                <div onClick={() => setSelectedProduct(null)} className="absolute inset-0"></div>

                <div className="w-full max-w-md md:max-w-xl xl:max-w-md md:rounded-3xl xl:rounded-none xl:rounded-t-3xl glass-panel shadow-2xl max-h-[90vh] md:max-h-[85vh] xl:max-h-[90vh] flex flex-col animate-fade rounded-t-3xl overflow-hidden relative border-b-0 md:border-b">
                    <div className="absolute top-4 right-4 z-20">
                        <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors shadow-sm">
                            <Icon name="x" size={18} />
                        </button>
                    </div>

                    <div className="relative h-56 sm:h-64 md:h-60 xl:h-64 shrink-0 bg-white/50">
                        <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
                    </div>

                    <div className="p-6 md:p-8 pb-6 overflow-y-auto flex-1 no-scrollbar relative z-10 bg-white/40">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2 font-head">{selectedProduct.name}</h2>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold font-head text-cyan-700">{basePriceObj.final}.-</span>
                                {basePriceObj.discount > 0 && (
                                    <>
                                        <span className="text-sm text-slate-500 line-through font-head">{basePriceObj.original}</span>
                                        <span className="text-[10px] text-white font-bold bg-gradient-to-r from-cyan-500 to-blue-500 px-2.5 py-1 rounded-full shadow-sm">SAVE {basePriceObj.discount}</span>
                                    </>
                                )}
                            </div>
                            {selectedProduct.description && (
                                <p className="text-sm text-slate-600 mt-3 leading-relaxed font-medium">{selectedProduct.description}</p>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* --- Size Selector --- */}
                            {(selectedProduct.price_special || selectedProduct.price_jumbo) && (
                                <div>
                                    <label className="block text-[10px] text-cyan-700 font-bold uppercase tracking-widest mb-3">Size Selection</label>
                                    <div className="flex flex-col gap-2">
                                        {[
                                            { key: 'normal', label: 'ปกติ', ...calculatePrice(selectedProduct, 'normal') },
                                            selectedProduct.price_special && { key: 'special', label: 'พิเศษ', ...calculatePrice(selectedProduct, 'special') },
                                            selectedProduct.price_jumbo && { key: 'jumbo', label: 'จัมโบ้', ...calculatePrice(selectedProduct, 'jumbo') }
                                        ].filter(Boolean).map((v: any) => (
                                            <button
                                                key={v.key}
                                                onClick={() => setVariant(v.key)}
                                                className={`w-full py-3.5 px-5 flex justify-between items-center transition-all rounded-2xl font-head
                                                    ${variant === v.key ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md border-transparent' : 'glass-panel text-slate-700 hover:bg-white/60'}`}
                                            >
                                                <span className="text-sm font-bold">{v.label}</span>
                                                <span className="text-sm font-bold">{v.final}.-</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- 🌟 OPTIONS --- */}
                            {selectedProduct.options?.length > 0 && selectedProduct.options.map((opt: any, index: number) => (
                                <div key={index} className="pt-4 border-t border-white/40">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-[10px] text-cyan-700 font-bold uppercase tracking-widest">{opt.name}</label>
                                        {opt.required && <span className="text-[9px] bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-sm font-bold uppercase">Required</span>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {opt.choices.map((choice: any, cIdx: number) => {
                                            const isSelected = selectedOptions[index]?.some(
                                                (item: any) => String(item.id || item.name) === String(choice.id || choice.name)
                                            );
                                            return (
                                                <label
                                                    key={cIdx}
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        handleOptionToggle(index, choice, opt.type);
                                                    }}
                                                    className={`flex items-center p-3.5 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${isSelected ? 'bg-white/70 border-cyan-300 shadow-sm' : 'glass-panel hover:bg-white/60'}`}
                                                >
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className={`w-5 h-5 shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'border-2 border-cyan-500' : 'border border-slate-300 bg-white/50'} ${opt.type === 'single' ? 'rounded-full' : 'rounded-md'}`}>
                                                            {isSelected && <div className={`w-2.5 h-2.5 shrink-0 bg-cyan-500 ${opt.type === 'single' ? 'rounded-full' : 'rounded-[2px]'}`} />}
                                                        </div>
                                                        {(choice.image_url || choice.image_name) && (
                                                            <div className="w-10 h-10 shrink-0 bg-white/50 rounded-lg overflow-hidden shadow-inner">
                                                                <img src={choice.image_url?.startsWith('http') ? choice.image_url : choice.image_name?.startsWith('http') ? choice.image_name : getMenuUrl(choice.image_name)} className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-semibold text-slate-800">{choice.name}</span>
                                                        {Number(choice.price || 0) > 0 && (
                                                            <span className="ml-auto shrink-0 text-xs font-bold text-cyan-700">+{Number(choice.price || 0)}.-</span>
                                                        )}
                                                    </div>
                                                    <input type={opt.type === 'single' ? 'radio' : 'checkbox'} className="hidden" checked={isSelected || false} readOnly />
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* --- 📝 NOTE --- */}
                            <div className="pt-4 border-t border-white/40">
                                <label className="block text-[10px] text-cyan-700 font-bold uppercase tracking-widest mb-3">หมายเหตุพิเศษ</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="เช่น ไม่เผ็ด, ไม่ใส่ผัก..."
                                    className="w-full p-4 glass-panel rounded-2xl focus:bg-white/70 outline-none text-sm transition-colors text-slate-800 placeholder-slate-400 h-28 resize-none shadow-inner"
                                />
                            </div>
                        </div>
                        <div className="h-4" />
                    </div>

                    <div className="shrink-0 w-full p-5 md:p-6 bg-white/60 backdrop-blur-xl border-t border-white/40 grid grid-cols-2 gap-3 z-30">
                        <button onClick={() => handleAdd(true)} className="py-4 glass-panel border-white/50 rounded-2xl text-[11px] text-slate-700 uppercase font-bold tracking-widest hover:bg-white/80 transition-colors">ใส่ตะกร้า</button>
                        <button onClick={() => handleAdd(false)} className="py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl text-[11px] uppercase font-bold tracking-widest shadow-lg shadow-cyan-500/30 active:opacity-90 transition-opacity">สั่งทันที</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end bg-slate-900/30 backdrop-blur-md animate-fade">
                 <div className="w-full max-w-md md:max-w-xl xl:max-w-md glass-panel h-[90vh] md:h-[80vh] xl:h-[90vh] md:rounded-3xl xl:rounded-none xl:rounded-t-3xl flex flex-col shadow-2xl mx-auto rounded-t-3xl overflow-hidden border-b-0 md:border-b">
                     <div className="p-6 md:p-8 border-b border-white/40 flex justify-between items-center bg-white/40">
                        <h2 className="text-2xl font-bold font-head text-slate-800">Your Tray</h2>
                        <button onClick={() => setActiveTab('menu')} className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-slate-600 hover:bg-white transition-colors shadow-sm"><Icon name="x" size={18}/></button>
                     </div>
                     <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-4 no-scrollbar pb-32 bg-white/30">
                         {cart.map((item: any, idx: any) => {
                            const finalPriceTotal = item.price * item.quantity;
                             return (
                             <div key={idx} className="flex gap-4 glass-panel p-4 rounded-2xl">
                                 <div className="w-16 h-16 bg-white/50 rounded-xl shrink-0 overflow-hidden shadow-inner"><img src={item.image_url} className="w-full h-full object-cover" /></div>
                                 <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-start">
                                         <span className="text-sm font-bold text-slate-800 leading-tight pr-2">{item.name} <span className="text-cyan-700">x{item.quantity}</span></span>
                                         <span className="text-sm font-bold font-head text-cyan-700">{finalPriceTotal}</span>
                                     </div>
                                     <div className="text-[10px] text-slate-500 mt-1 font-medium leading-snug">{item.note}</div>
                                     <div className="flex mt-3">
                                         <button onClick={() => updateQuantity(idx, -1)} className="text-[10px] font-bold text-red-400 hover:text-red-500 uppercase tracking-wider bg-red-50/50 px-2 py-1 rounded-md">Remove</button>
                                     </div>
                                 </div>
                             </div>
                         )})}
                         {cart.length === 0 && (
                            <div className="text-center py-20 flex flex-col items-center">
                                <Icon name="basket" size={48} className="text-slate-300 mb-4" />
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cart is empty</p>
                            </div>
                         )}
                     </div>
                     <div className="p-6 md:p-8 bg-white/60 backdrop-blur-xl border-t border-white/40 shrink-0">
                         <div className="flex justify-between items-center mb-5">
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total</span>
                             <span className="text-3xl font-bold font-head text-cyan-700">{cartTotal}.-</span>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} disabled={cart.length === 0} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-2xl disabled:opacity-50 shadow-lg shadow-cyan-500/20 active:opacity-90">Confirm Order</button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION --- */}
        {showConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6 animate-fade">
                <div className="glass-panel p-8 text-center rounded-3xl max-w-xs w-full shadow-2xl bg-white/80 border border-white">
                    <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 mx-auto mb-4 shadow-inner">
                        <Icon name="check" size={32} />
                    </div>
                    <h3 className="text-xl font-bold font-head text-slate-800 mb-6">Place Order?</h3>
                    <div className="flex flex-col gap-3">
                        <button onClick={onCheckoutClick} className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs uppercase font-bold tracking-widest rounded-xl shadow-md active:opacity-90">Confirm</button>
                        <button onClick={() => setShowConfirm(false)} className="w-full py-3.5 text-xs uppercase font-bold text-slate-500 hover:bg-black/5 rounded-xl transition-colors">Cancel</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}
