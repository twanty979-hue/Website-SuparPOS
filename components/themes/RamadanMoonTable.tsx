import React, { useState, useEffect, useRef } from "react";

// --- 🌙 Icons (Ramadan Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    shop: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
    basket: <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    plus: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    ),
    minus: <line x1="5" y1="12" x2="19" y2="12" />,
    x: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
    check: <polyline points="20 6 9 17 4 12" />,
    trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
    chevronRight: <polyline points="9 18 15 12 9 6" />,
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

  // 🌟 คำนวณราคาเมนูหลัก
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

  const currentPriceObj = selectedProduct ? calculatePrice(selectedProduct, variant) : { final: 0, original: 0, discount: 0 };

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
  const finalPriceWithOpts = currentPriceObj.final + toppingTotal;

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

  if (loading && !isVerified) return <div className="min-h-screen bg-[#0F1123] flex items-center justify-center text-[#E2C974] font-light text-xl tracking-widest">LOADING</div>;

  return (
    <div className="w-full max-w-md md:max-w-xl xl:max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden bg-[#0F1123] font-sans text-white">

        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Sarabun:wght@300;400;500;600&display=swap');

            :root {
                --primary: #E2C974; /* Warm gold */
                --secondary: #A1A3C4; /* Soft night blue */
                --bg-main: #0F1123; /* Deep night sky */
                --bg-card: #1B1D36; /* Lighter night */
                --border-color: #2D3054;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg-main);
                -webkit-tap-highlight-color: transparent;
                color: #FFFFFF;
            }

            .font-head { font-family: 'Outfit', sans-serif; }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade { animation: fadeIn 0.4s ease-out forwards; }
            .glow-gold { box-shadow: 0 0 15px rgba(226, 201, 116, 0.15); }
            .glow-gold-strong { box-shadow: 0 0 20px rgba(226, 201, 116, 0.4); }
        `}} />

        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Icon name="star" size={120} className="text-[#E2C974]" />
        </div>

        <header className="bg-[#0F1123]/90 backdrop-blur-md pt-12 pb-6 px-6 sticky top-0 z-50 border-b border-[#2D3054]">
             <div className="flex justify-between items-center">
                 <div>
                     <p className="text-[#E2C974] text-[10px] font-medium tracking-[0.2em] font-head uppercase mb-1">Table {tableLabel}</p>
                     <h1 className="text-2xl font-semibold tracking-tight text-white font-head">{brand?.name || "Ramadan Feast"}</h1>
                 </div>
                 <div className="w-10 h-10 border border-[#E2C974]/30 rounded-full flex items-center justify-center text-[#E2C974] glow-gold">
                     <Icon name="shop" size={18} />
                 </div>
             </div>
        </header>

        <main className="px-6 pb-24 relative z-20">
            {activeTab === 'home' && (
                <section className="animate-fade pt-6">
                    {banners?.length > 0 && (
                        <div className="relative w-full aspect-[2/1] bg-[#1B1D36] rounded-t-full overflow-hidden mb-8 border border-[#E2C974]/20 glow-gold">
                             <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover opacity-90" />
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-6 border-b border-[#2D3054] pb-4">
                         <h2 className="text-lg font-medium text-[#E2C974]">Recommended</h2>
                         <button onClick={() => setActiveTab('menu')} className="text-[#A1A3C4] text-xs flex items-center gap-1 hover:text-[#E2C974] transition-colors">
                             View All <Icon name="chevronRight" size={14} />
                         </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-x-4 gap-y-8">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="cursor-pointer group" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full aspect-square overflow-hidden bg-[#1B1D36] mb-3 relative rounded-t-[40px] rounded-b-xl border border-[#2D3054] group-hover:border-[#E2C974]/50 transition-colors">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-0 right-0 bg-[#E2C974] text-[#0F1123] font-bold text-[10px] px-2 py-1 rounded-bl-lg">
                                                -{pricing.discount}
                                            </div>
                                         )}
                                     </div>
                                     <h3 className="font-medium text-white text-sm mb-1 leading-snug">{p.name}</h3>
                                     <div className="flex items-baseline gap-2">
                                         <span className="text-[#E2C974] font-medium text-base font-head">{pricing.final}</span>
                                         {pricing.discount > 0 && (
                                             <span className="text-[10px] text-[#A1A3C4] line-through font-head">
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
                <section className="animate-fade pt-6">
                    <div className="relative mb-8">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Icon name="search" className="text-[#E2C974]" size={18} /></div>
                         <input type="text" placeholder="Search for dishes..." value={state?.searchTerm} onChange={(e) => actions?.setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-[#1B1D36] border border-[#2D3054] focus:border-[#E2C974] rounded-full outline-none text-sm text-white placeholder-[#A1A3C4] transition-colors" />
                    </div>
                    <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)}
                                    className={`shrink-0 px-5 py-2 rounded-full text-xs transition-all border
                                    ${selectedCategoryId === c.id ? 'bg-[#E2C974] text-[#0F1123] border-[#E2C974] font-semibold glow-gold' : 'bg-transparent border-[#2D3054] text-[#A1A3C4]'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-4 pb-20">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="flex gap-4 cursor-pointer p-3 bg-[#1B1D36] rounded-2xl border border-[#2D3054] hover:border-[#E2C974]/30 transition-colors" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-24 h-24 bg-[#0F1123] overflow-hidden shrink-0 rounded-xl">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover opacity-90" />
                                     </div>
                                     <div className="flex-1 flex flex-col justify-center">
                                         <h3 className="font-medium text-white text-sm mb-1">{p.name}</h3>
                                         <div className="flex items-center gap-2 mt-1">
                                             <span className="text-[#E2C974] font-medium font-head">{pricing.final}.-</span>
                                             {pricing.discount > 0 && <span className="text-xs text-[#A1A3C4] line-through font-head">{pricing.original}</span>}
                                         </div>
                                     </div>
                                     <div className="flex items-center">
                                         <div className="w-8 h-8 rounded-full border border-[#E2C974]/30 flex items-center justify-center text-[#E2C974] hover:bg-[#E2C974] hover:text-[#0F1123] transition-colors">
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
                <section className="animate-fade pt-6 pb-24">
                    <h2 className="text-xl font-light text-[#E2C974] mb-6 font-head tracking-wide">Order Status</h2>

                    <div className="space-y-6">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="border border-[#2D3054] p-6 bg-[#1B1D36] rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#E2C974]/5 rounded-bl-full pointer-events-none"></div>
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                     <div>
                                         <span className="text-[10px] text-[#A1A3C4] uppercase tracking-widest block mb-1">Ticket ID</span>
                                         <span className="text-sm font-medium text-white">#{o.id.slice(-4)}</span>
                                     </div>
                                     <div className={`px-3 py-1 text-[10px] uppercase tracking-widest border rounded-full
                                        ${o.status === 'pending' ? 'border-[#E2C974]/50 text-[#E2C974] bg-[#E2C974]/10' : 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'}`}>
                                         {o.status === 'pending' ? 'รอรับ' : 'กำลังทำ'}
                                     </div>
                                </div>

                                <div className="space-y-3 mb-6 relative z-10">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#A1A3C4]">
                                            <div className="flex gap-3">
                                                <span className="text-white w-6">{i.quantity}x</span>
                                                <div className="flex flex-col">
                                                    <span className="text-white">{i.product_name}</span>
                                                    {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-[#E2C974] uppercase mt-0.5">{i.variant}</span>}
                                                    {i.note && <span className="text-[10px] text-[#A1A3C4] italic mt-0.5 leading-snug">{i.note}</span>}
                                                </div>
                                            </div>
                                            <span className="font-head text-white">{i.price * i.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-[#2D3054] relative z-10">
                                     <span className="text-xs text-[#A1A3C4] uppercase tracking-widest">Total</span>
                                     <span className="font-medium text-lg text-[#E2C974] font-head glow-gold">
                                         {o.total_price || o.order_items.reduce((a: any, b: any) => a + (b.price * b.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-24 opacity-40">
                                <Icon name="clock" size={48} className="mx-auto text-[#A1A3C4] mb-4" />
                                <p className="text-sm font-light text-[#A1A3C4]">No active orders</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        <nav className="fixed bottom-0 left-0 w-full h-[80px] bg-[#1B1D36] border-t border-[#2D3054] flex justify-center items-center gap-12 z-[90] pb-2 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'home' ? 'text-[#E2C974]' : 'text-[#A1A3C4]'}`}>
                 <Icon name="home" size={22} />
                 <span className="text-[9px] uppercase tracking-widest">Home</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'menu' ? 'text-[#E2C974]' : 'text-[#A1A3C4]'}`}>
                 <Icon name="menu" size={22} />
                 <span className="text-[9px] uppercase tracking-widest">Menu</span>
             </button>

             <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-1.5 transition-colors relative ${activeTab === 'cart' ? 'text-[#E2C974]' : 'text-[#A1A3C4]'}`}>
                 <div className="relative">
                     <Icon name="basket" size={22} />
                     {cart?.length > 0 && (
                         <span className="absolute -top-1 -right-2 bg-[#E2C974] text-[#0F1123] font-bold text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                             {cart.length}
                         </span>
                     )}
                 </div>
                 <span className="text-[9px] uppercase tracking-widest">Cart</span>
             </button>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'status' ? 'text-[#E2C974]' : 'text-[#A1A3C4]'}`}>
                 <Icon name="clock" size={22} />
                 <span className="text-[9px] uppercase tracking-widest">Status</span>
             </button>
        </nav>

        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center xl:items-end justify-center bg-[#0F1123]/80 backdrop-blur-md animate-fade">
                <div onClick={() => setSelectedProduct(null)} className="absolute inset-0"></div>

                <div className="w-full max-w-md md:max-w-xl xl:max-w-md md:rounded-3xl xl:rounded-none xl:rounded-t-[2.5rem] rounded-t-[2.5rem] bg-[#1B1D36] shadow-[0_-10px_50px_rgba(226,201,116,0.1)] border-t border-x border-[#2D3054] md:border max-h-[90vh] md:max-h-[85vh] xl:max-h-[90vh] flex flex-col animate-fade overflow-hidden relative">
                    <div className="absolute top-4 right-4 z-20">
                        <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 bg-[#0F1123]/80 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-[#E2C974] hover:text-[#0F1123] transition-colors shadow-sm">
                            <Icon name="x" size={18} />
                        </button>
                    </div>

                    <div className="relative h-56 sm:h-64 md:h-52 xl:h-64 shrink-0 bg-[#0F1123]">
                        <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1D36] to-transparent"></div>
                    </div>

                    <div className="p-6 md:p-8 pb-6 overflow-y-auto bg-[#1B1D36] flex-1 no-scrollbar">
                        <div className="mb-6 relative">
                            <h2 className="text-2xl font-light text-[#E2C974] mb-2 font-head drop-shadow-md">{selectedProduct.name}</h2>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-medium font-head text-white">{basePriceObj.final}.-</span>
                                {basePriceObj.discount > 0 && (
                                    <>
                                        <span className="text-sm text-[#A1A3C4] line-through font-head">{basePriceObj.original}</span>
                                        <span className="text-[10px] text-[#0F1123] bg-[#E2C974] px-2 py-0.5 rounded-sm font-bold">SAVE {basePriceObj.discount}</span>
                                    </>
                                )}
                            </div>
                            {selectedProduct.description && (
                                <p className="text-sm text-[#A1A3C4] mt-3 leading-relaxed">{selectedProduct.description}</p>
                            )}
                        </div>

                        <div className="space-y-6">
                            {(selectedProduct.price_special || selectedProduct.price_jumbo) && (
                                <div>
                                    <label className="block text-[10px] text-[#E2C974] uppercase tracking-widest mb-3">Size Selection</label>
                                    <div className="flex flex-col gap-2">
                                        {[
                                            { key: 'normal', label: 'ปกติ', ...calculatePrice(selectedProduct, 'normal') },
                                            selectedProduct.price_special && { key: 'special', label: 'พิเศษ', ...calculatePrice(selectedProduct, 'special') },
                                            selectedProduct.price_jumbo && { key: 'jumbo', label: 'จัมโบ้', ...calculatePrice(selectedProduct, 'jumbo') }
                                        ].filter(Boolean).map((v: any) => (
                                            <button
                                                key={v.key}
                                                onClick={() => setVariant(v.key)}
                                                className={`w-full py-3 px-4 flex justify-between items-center border transition-all rounded-2xl
                                                    ${variant === v.key ? 'border-[#E2C974] bg-[#E2C974]/10 text-[#E2C974] glow-gold' : 'border-[#2D3054] text-[#A1A3C4] hover:border-[#E2C974]/50'}`}
                                            >
                                                <span className="text-sm font-medium">{v.label}</span>
                                                <span className="text-sm font-medium">{v.final}.-</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedProduct.options?.length > 0 && selectedProduct.options.map((opt: any, index: number) => (
                                <div key={index} className="pt-4 border-t border-[#2D3054]">
                                    <label className="block text-[10px] text-[#E2C974] font-medium uppercase tracking-widest mb-3">{opt.name}</label>
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
                                                    className={`flex items-center p-3 border rounded-2xl cursor-pointer transition-all active:scale-[0.99] ${isSelected ? 'border-[#E2C974] bg-[#E2C974]/5 glow-gold' : 'border-[#2D3054] hover:border-[#E2C974]/30'}`}
                                                >
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className={`w-4 h-4 shrink-0 border flex items-center justify-center ${isSelected ? 'border-[#E2C974]' : 'border-[#A1A3C4]'} ${opt.type === 'single' ? 'rounded-full' : 'rounded-sm'}`}>
                                                            {isSelected && <div className={`w-2 h-2 shrink-0 bg-[#E2C974] ${opt.type === 'single' ? 'rounded-full' : ''}`} />}
                                                        </div>
                                                        {(choice.image_url || choice.image_name) && (
                                                            <div className="w-10 h-10 shrink-0 bg-[#0F1123] rounded-lg overflow-hidden border border-[#2D3054]">
                                                                <img src={choice.image_url?.startsWith('http') ? choice.image_url : choice.image_name?.startsWith('http') ? choice.image_name : getMenuUrl(choice.image_name)} className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-[#A1A3C4]'}`}>{choice.name}</span>
                                                        {Number(choice.price || 0) > 0 && (
                                                            <span className="ml-auto shrink-0 text-xs font-semibold text-[#E2C974]">+{Number(choice.price || 0)}.-</span>
                                                        )}
                                                    </div>
                                                    <input type={opt.type === 'single' ? 'radio' : 'checkbox'} className="hidden" checked={isSelected || false} readOnly />
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 border-t border-[#2D3054]">
                                <label className="block text-[10px] text-[#A1A3C4] uppercase tracking-widest mb-3">หมายเหตุพิเศษ</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="เช่น ไม่เผ็ด, ไม่ใส่ผัก..."
                                    className="w-full p-4 border border-[#2D3054] rounded-2xl focus:border-[#E2C974] focus:ring-1 focus:ring-[#E2C974] outline-none text-sm transition-all bg-[#0F1123] text-white placeholder-[#A1A3C4] h-28 resize-none mb-4"
                                />
                            </div>
                        </div>

                        <div className="h-2" />
                    </div>

                    <div className="shrink-0 w-full p-5 md:p-6 bg-[#1B1D36] border-t border-[#2D3054] grid grid-cols-2 gap-3 z-30">
                        <button onClick={() => handleAdd(true)} className="py-4 border border-[#E2C974] text-[#E2C974] rounded-2xl text-[10px] uppercase font-bold tracking-widest hover:bg-[#E2C974]/10 transition-colors">ใส่ตะกร้า</button>
                        <button onClick={() => handleAdd(false)} className="py-4 bg-[#E2C974] text-[#0F1123] rounded-2xl text-[10px] uppercase font-bold tracking-widest shadow-[0_4px_15px_rgba(226,201,116,0.3)] active:scale-95 transition-all">สั่งทันที</button>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end md:items-center xl:items-end justify-center bg-[#0F1123]/80 backdrop-blur-md animate-fade">
                 <div className="w-full max-w-md md:max-w-xl xl:max-w-md bg-[#1B1D36] h-[90vh] md:h-[80vh] xl:h-[90vh] md:rounded-3xl xl:rounded-none xl:rounded-t-[2.5rem] flex flex-col shadow-[0_-10px_50px_rgba(226,201,116,0.1)] border-t border-x border-[#2D3054] md:border rounded-t-[2.5rem] overflow-hidden">
                     <div className="p-8 border-b border-[#2D3054] flex justify-between items-center bg-[#1B1D36]">
                        <h2 className="text-xl font-light font-head text-[#E2C974]">Your Tray</h2>
                        <button onClick={() => setActiveTab('menu')} className="text-[#A1A3C4] hover:text-white"><Icon name="x" size={20}/></button>
                     </div>
                     <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 no-scrollbar pb-32 bg-[#0F1123]">
                         {cart.map((item: any, idx: any) => {
                            const finalPriceTotal = item.price * item.quantity;
                            const originalPriceTotal = (item.original_price || item.price) * item.quantity;
                            const hasDiscount = originalPriceTotal > finalPriceTotal;

                             return (
                             <div key={idx} className="flex gap-4 border-b border-[#2D3054] pb-4 last:border-0">
                                 <div className="w-14 h-14 bg-[#1B1D36] rounded-xl shrink-0 overflow-hidden border border-[#2D3054]"><img src={item.image_url} className="w-full h-full object-cover opacity-90" /></div>
                                 <div className="flex-1 min-w-0">
                                     <div className="flex justify-between">
                                         <span className="text-sm font-medium text-white truncate pr-4">{item.name} x{item.quantity}</span>
                                         <span className="text-sm font-head text-[#E2C974]">{finalPriceTotal}</span>
                                     </div>
                                     <div className="text-[10px] text-[#A1A3C4] mt-1 italic leading-snug">{item.note}</div>
                                     <div className="flex gap-4 mt-3">
                                         <button onClick={() => updateQuantity(idx, -1)} className="text-[10px] underline text-[#A1A3C4] hover:text-[#ef4444] transition-colors">Remove</button>
                                     </div>
                                 </div>
                             </div>
                         )})}
                         {cart.length === 0 && <div className="text-center py-20 text-sm text-[#A1A3C4]"><Icon name="basket" size={48} className="mx-auto mb-4 opacity-50"/>Empty</div>}
                     </div>
                     <div className="p-8 bg-[#1B1D36] border-t border-[#2D3054] shrink-0">
                         <div className="flex justify-between items-center mb-6"><span className="text-xs uppercase tracking-widest text-[#A1A3C4]">Total</span><span className="text-3xl font-light font-head text-[#E2C974] glow-gold">{cartTotal}.-</span></div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} disabled={cart.length === 0} className="w-full py-4 bg-[#E2C974] text-[#0F1123] text-[10px] font-bold uppercase tracking-widest rounded-2xl disabled:opacity-50 shadow-[0_4px_15px_rgba(226,201,116,0.3)] transition-all">Confirm Order</button>
                     </div>
                 </div>
             </div>
        )}

        {showConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0F1123]/90 backdrop-blur-md p-6 animate-fade">
                <div className="bg-[#1B1D36] p-8 text-center border border-[#E2C974]/30 rounded-3xl max-w-xs w-full shadow-[0_0_50px_rgba(226,201,116,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#E2C974]/5 rounded-bl-full pointer-events-none"></div>
                    <div className="mb-4 flex justify-center text-[#E2C974] relative z-10"><Icon name="check" size={40} className="drop-shadow-[0_0_10px_rgba(226,201,116,0.5)]" /></div>
                    <h3 className="text-lg font-head mb-6 text-white relative z-10">Place Order?</h3>
                    <div className="flex flex-col gap-3 relative z-10">
                        <button onClick={onCheckoutClick} className="w-full py-3.5 bg-[#E2C974] text-[#0F1123] text-xs uppercase font-bold tracking-widest rounded-xl shadow-[0_4px_15px_rgba(226,201,116,0.3)] active:scale-95 transition-all">Confirm</button>
                        <button onClick={() => setShowConfirm(false)} className="w-full py-3.5 text-xs uppercase text-[#A1A3C4] border border-[#2D3054] rounded-xl hover:bg-[#2D3054]/50 transition-colors">Cancel</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}
