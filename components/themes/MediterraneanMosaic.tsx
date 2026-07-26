import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons (Mediterranean Style) ---
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

export default function MediterraneanMosaic({ state, actions, helpers }: any) {
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

  // State สำหรับเก็บตัวเลือกเสริม
  const [selectedOptions, setSelectedOptions] = useState<any>({});

  useEffect(() => {
    if (selectedProduct) {
      setVariant('normal');
      setQty(1);
      setNote("");

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

  const basePriceObj = selectedProduct ? calculatePrice(selectedProduct, variant) : { final: 0, original: 0, discount: 0 };

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

  if (loading && !isVerified) return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-[#2B547E] font-medium text-xl tracking-widest">LOADING</div>;

  return (
    <div className="w-full max-w-md md:max-w-xl xl:max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden bg-[#FDFBF7] font-sans text-[#1A2F4C]">

        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Gelasio:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');

            :root {
                --primary: #2B547E; /* blue tiles */
                --terracotta: #E07A5F;
                --olive: #728C69;
                --bg-main: #FDFBF7; /* sun-washed plaster */
                --border-color: #B5D3E7; /* mosaic border */
                --tile-bg: #FFFFFF;
                --text-main: #1A2F4C;
            }

            body {
                font-family: 'Nunito', sans-serif;
                background-color: var(--bg-main);
                -webkit-tap-highlight-color: transparent;
                color: var(--text-main);
                letter-spacing: 0.01em;
            }

            .font-head { font-family: 'Gelasio', serif; }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            .mosaic-border {
                border: 2px solid var(--border-color);
                border-radius: 16px;
                box-shadow: 2px 2px 0px rgba(43, 84, 126, 0.1);
            }

            .mosaic-tile {
                background: var(--tile-bg);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5), 0 2px 8px rgba(43,84,126,0.06);
                transition: all 0.3s ease;
            }

            .mosaic-tile:active {
                transform: scale(0.98);
                box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5), 0 1px 4px rgba(43,84,126,0.06);
            }

            @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade { animation: fadeIn 0.4s ease-out forwards; }
        `}} />

        <header className="bg-[#FDFBF7]/90 backdrop-blur-md pt-10 pb-6 px-6 sticky top-0 z-50 border-b-2 border-[#B5D3E7] shadow-sm">
             <div className="flex justify-between items-center">
                 <div>
                     <p className="text-[#E07A5F] text-[10px] font-bold tracking-[0.15em] uppercase mb-1">Table {tableLabel}</p>
                     <h1 className="text-2xl font-bold tracking-tight text-[#2B547E] font-head">{brand?.name || "Mediterranean"}</h1>
                 </div>
                 <div className="w-10 h-10 bg-white border-2 border-[#B5D3E7] rounded-xl flex items-center justify-center text-[#2B547E] shadow-sm">
                     <Icon name="shop" size={18} />
                 </div>
             </div>
        </header>

        <main className="px-6 pb-24 relative z-20">
            {activeTab === 'home' && (
                <section className="animate-fade pt-6">
                    {banners?.length > 0 && (
                        <div className="relative w-full aspect-[2/1] bg-white rounded-2xl overflow-hidden mb-8 mosaic-border">
                             <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-gradient-to-t from-[#2B547E]/30 to-transparent pointer-events-none"></div>
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-6">
                         <h2 className="text-xl font-bold text-[#2B547E] font-head">Specials</h2>
                         <button onClick={() => setActiveTab('menu')} className="text-[#E07A5F] text-xs font-bold flex items-center gap-1 hover:text-[#2B547E] transition-colors">
                             Explore <Icon name="chevronRight" size={14} />
                         </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-4">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="cursor-pointer mosaic-tile overflow-hidden flex flex-col" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full aspect-square overflow-hidden bg-white relative">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-[#E07A5F] text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                                -{pricing.discount}
                                            </div>
                                         )}
                                     </div>
                                     <div className="p-3 flex-1 flex flex-col justify-between border-t border-[#B5D3E7]/50 bg-white">
                                         <h3 className="font-bold text-[#1A2F4C] text-sm mb-2 leading-tight">{p.name}</h3>
                                         <div className="flex items-center gap-2">
                                             <span className="text-[#2B547E] font-bold text-lg">{pricing.final}</span>
                                             {pricing.discount > 0 && (
                                                 <span className="text-[10px] text-[#A8A29E] line-through">
                                                     {pricing.original}
                                                 </span>
                                             )}
                                         </div>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {activeTab === 'menu' && (
                <section className="animate-fade pt-6">
                    <div className="relative mb-6">
                         <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Icon name="search" className="text-[#2B547E]" size={18} /></div>
                         <input type="text" placeholder="Search menu..." value={state?.searchTerm} onChange={(e) => actions?.setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#B5D3E7] rounded-xl focus:border-[#2B547E] outline-none text-sm text-[#1A2F4C] placeholder-[#94A3B8] transition-colors shadow-sm" />
                    </div>
                    <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)}
                                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border-2
                                    ${selectedCategoryId === c.id ? 'bg-[#2B547E] text-white border-[#2B547E] shadow-md' : 'bg-white text-[#2B547E] border-[#B5D3E7]'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-3 pb-20">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="flex gap-4 cursor-pointer p-3 bg-white border-2 border-[#B5D3E7] rounded-xl shadow-sm hover:shadow-md transition-shadow" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-24 h-24 bg-white overflow-hidden shrink-0 rounded-lg border border-[#B5D3E7]/50">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="flex-1 flex flex-col justify-center">
                                         <h3 className="font-bold text-[#1A2F4C] text-sm mb-1">{p.name}</h3>
                                         <div className="flex items-center gap-2 mt-1">
                                             <span className="text-[#2B547E] font-bold text-lg">{pricing.final}.-</span>
                                             {pricing.discount > 0 && <span className="text-xs text-[#94A3B8] line-through">{pricing.original}</span>}
                                         </div>
                                     </div>
                                     <div className="flex items-center">
                                         <div className="w-9 h-9 rounded-xl border-2 border-[#2B547E] flex items-center justify-center text-[#2B547E] hover:bg-[#2B547E] hover:text-white transition-colors">
                                             <Icon name="plus" size={16} />
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
                    <h2 className="text-2xl font-bold text-[#2B547E] mb-6 font-head">Order Status</h2>

                    <div className="space-y-4">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="border-2 border-[#B5D3E7] p-5 bg-white rounded-2xl shadow-sm">
                                <div className="flex justify-between items-center mb-5">
                                     <div>
                                         <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider block mb-1">Order No.</span>
                                         <span className="text-sm font-bold text-[#2B547E]">#{o.id.slice(-4)}</span>
                                     </div>
                                     <div className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-2 rounded-xl
                                        ${o.status === 'pending' ? 'border-[#E07A5F]/40 text-[#E07A5F] bg-[#E07A5F]/10' : 'border-[#728C69]/40 text-[#728C69] bg-[#728C69]/10'}`}>
                                         {o.status === 'pending' ? 'Preparing' : 'Ready'}
                                     </div>
                                </div>

                                <div className="space-y-3 mb-5">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#1A2F4C]">
                                            <div className="flex gap-3">
                                                <span className="text-[#2B547E] font-bold w-6">{i.quantity}x</span>
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{i.product_name}</span>
                                                    {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-[#94A3B8] font-bold uppercase mt-0.5">{i.variant}</span>}
                                                    {i.note && <span className="text-[10px] text-[#728C69] italic mt-0.5">{i.note}</span>}
                                                </div>
                                            </div>
                                            <span className="font-bold">{i.price * i.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t-2 border-[#B5D3E7]/50">
                                     <span className="text-xs text-[#2B547E] font-bold uppercase tracking-wider">Total</span>
                                     <span className="font-bold text-xl text-[#2B547E]">
                                         {o.total_price || o.order_items.reduce((a: any, b: any) => a + (b.price * b.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 mx-auto mb-4 bg-white border-2 border-[#B5D3E7] rounded-2xl flex items-center justify-center text-[#B5D3E7]"><Icon name="clock" size={28}/></div>
                                <p className="text-sm font-bold text-[#94A3B8]">No active orders</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        <nav className="fixed bottom-0 left-0 w-full h-[84px] bg-white border-t-2 border-[#B5D3E7] flex justify-center items-center gap-10 z-[90] pb-2 shadow-[0_-4px_20px_rgba(43,84,126,0.05)]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'home' ? 'text-[#2B547E]' : 'text-[#94A3B8]'}`}>
                 <div className={`p-1.5 rounded-xl ${activeTab === 'home' ? 'bg-[#2B547E]/10' : ''}`}><Icon name="home" size={22} /></div>
                 <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'menu' ? 'text-[#2B547E]' : 'text-[#94A3B8]'}`}>
                 <div className={`p-1.5 rounded-xl ${activeTab === 'menu' ? 'bg-[#2B547E]/10' : ''}`}><Icon name="menu" size={22} /></div>
                 <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
             </button>

             <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-1.5 transition-colors relative ${activeTab === 'cart' ? 'text-[#2B547E]' : 'text-[#94A3B8]'}`}>
                 <div className={`p-1.5 rounded-xl relative ${activeTab === 'cart' ? 'bg-[#2B547E]/10' : ''}`}>
                     <Icon name="basket" size={22} />
                     {cart?.length > 0 && (
                         <span className="absolute -top-1 -right-1 bg-[#E07A5F] text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                             {cart.length}
                         </span>
                     )}
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-wider">Cart</span>
             </button>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'status' ? 'text-[#2B547E]' : 'text-[#94A3B8]'}`}>
                 <div className={`p-1.5 rounded-xl ${activeTab === 'status' ? 'bg-[#2B547E]/10' : ''}`}><Icon name="clock" size={22} /></div>
                 <span className="text-[10px] font-bold uppercase tracking-wider">Status</span>
             </button>
        </nav>

        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center xl:items-end justify-center bg-[#1A2F4C]/40 backdrop-blur-sm animate-fade">
                <div onClick={() => setSelectedProduct(null)} className="absolute inset-0"></div>

                <div className="w-full max-w-md md:max-w-xl xl:max-w-md md:rounded-3xl xl:rounded-none xl:rounded-t-3xl bg-white shadow-2xl max-h-[90vh] md:max-h-[85vh] xl:max-h-[90vh] flex flex-col animate-fade rounded-t-3xl overflow-hidden relative">
                    <div className="absolute top-4 right-4 z-20">
                        <button onClick={() => setSelectedProduct(null)} className="w-9 h-9 bg-white/90 backdrop-blur border-2 border-[#B5D3E7] rounded-xl flex items-center justify-center text-[#2B547E] hover:bg-[#2B547E] hover:text-white hover:border-[#2B547E] transition-all shadow-md">
                            <Icon name="x" size={20} />
                        </button>
                    </div>

                    <div className="relative h-56 sm:h-64 md:h-52 xl:h-64 shrink-0 bg-white">
                        <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                    </div>

                    <div className="p-6 md:p-8 pb-6 overflow-y-auto bg-white flex-1 no-scrollbar">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-[#2B547E] mb-2 font-head">{selectedProduct.name}</h2>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-[#E07A5F]">{basePriceObj.final}.-</span>
                                {basePriceObj.discount > 0 && (
                                    <>
                                        <span className="text-sm text-[#94A3B8] line-through font-bold">{basePriceObj.original}</span>
                                        <span className="text-[10px] font-bold text-[#2B547E] bg-[#B5D3E7] px-2 py-1 rounded-lg">SAVE {basePriceObj.discount}</span>
                                    </>
                                )}
                            </div>
                            {selectedProduct.description && (
                                <p className="text-sm text-[#1A2F4C]/80 mt-3 font-medium leading-relaxed">{selectedProduct.description}</p>
                            )}
                        </div>

                        <div className="space-y-6">
                            {(selectedProduct.price_special || selectedProduct.price_jumbo) && (
                                <div>
                                    <label className="block text-xs font-bold text-[#2B547E] uppercase tracking-wider mb-3">Size Options</label>
                                    <div className="flex flex-col gap-3">
                                        {[
                                            { key: 'normal', label: 'Regular', ...calculatePrice(selectedProduct, 'normal') },
                                            selectedProduct.price_special && { key: 'special', label: 'Large', ...calculatePrice(selectedProduct, 'special') },
                                            selectedProduct.price_jumbo && { key: 'jumbo', label: 'Jumbo', ...calculatePrice(selectedProduct, 'jumbo') }
                                        ].filter(Boolean).map((v: any) => (
                                            <button
                                                key={v.key}
                                                onClick={() => setVariant(v.key)}
                                                className={`w-full py-4 px-5 flex justify-between items-center border-2 transition-all rounded-xl
                                                    ${variant === v.key ? 'border-[#2B547E] bg-[#2B547E]/5 text-[#2B547E] shadow-sm' : 'border-[#B5D3E7] text-[#1A2F4C] bg-white'}`}
                                            >
                                                <span className="text-sm font-bold">{v.label}</span>
                                                <span className="text-sm font-bold">{v.final}.-</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedProduct.options?.length > 0 && selectedProduct.options.map((opt: any, index: number) => (
                                <div key={index} className="pt-5 border-t-2 border-[#B5D3E7]/50">
                                    <label className="block text-xs font-bold text-[#2B547E] uppercase tracking-wider mb-3">{opt.name}</label>
                                    <div className="flex flex-col gap-3">
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
                                                    className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${isSelected ? 'border-[#2B547E] bg-[#2B547E]/5' : 'border-[#B5D3E7] bg-white'}`}
                                                >
                                                    <div className="flex items-center gap-4 w-full">
                                                        <div className={`w-5 h-5 shrink-0 border-2 flex items-center justify-center ${isSelected ? 'border-[#2B547E] bg-[#2B547E]' : 'border-[#B5D3E7] bg-white'} ${opt.type === 'single' ? 'rounded-full' : 'rounded-md'}`}>
                                                            {isSelected && <Icon name="check" size={14} className="text-white" />}
                                                        </div>
                                                        {(choice.image_url || choice.image_name) && (
                                                            <div className="w-12 h-12 shrink-0 bg-white rounded-lg overflow-hidden border border-[#B5D3E7]/50">
                                                                <img src={choice.image_url?.startsWith('http') ? choice.image_url : choice.image_name?.startsWith('http') ? choice.image_name : getMenuUrl(choice.image_name)} className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-bold text-[#1A2F4C]">{choice.name}</span>
                                                        {Number(choice.price || 0) > 0 && (
                                                            <span className="ml-auto shrink-0 text-sm font-bold text-[#728C69]">+{Number(choice.price || 0)}.-</span>
                                                        )}
                                                    </div>
                                                    <input type={opt.type === 'single' ? 'radio' : 'checkbox'} className="hidden" checked={isSelected || false} readOnly />
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="pt-5 border-t-2 border-[#B5D3E7]/50">
                                <label className="block text-xs font-bold text-[#2B547E] uppercase tracking-wider mb-3">Special Instructions</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Add any special requests..."
                                    className="w-full p-4 border-2 border-[#B5D3E7] rounded-2xl focus:border-[#2B547E] outline-none text-sm transition-colors bg-white text-[#1A2F4C] h-28 resize-none shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="h-4" />
                    </div>

                    <div className="shrink-0 w-full p-5 bg-white border-t-2 border-[#B5D3E7] flex gap-3 z-30">
                        <button onClick={() => handleAdd(true)} className="flex-1 py-4 border-2 border-[#2B547E] text-[#2B547E] rounded-2xl text-xs uppercase font-bold tracking-widest hover:bg-[#2B547E]/5 transition-colors">Add to Cart</button>
                        <button onClick={() => handleAdd(false)} className="flex-1 py-4 bg-[#E07A5F] text-white rounded-2xl text-xs uppercase font-bold tracking-widest shadow-lg shadow-[#E07A5F]/30 hover:bg-[#d66b4f] transition-colors">Order Now</button>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end bg-[#1A2F4C]/40 backdrop-blur-sm animate-fade">
                 <div className="w-full max-w-md md:max-w-xl xl:max-w-md bg-[#FDFBF7] h-[90vh] md:h-[80vh] xl:h-[90vh] md:rounded-3xl xl:rounded-none xl:rounded-t-3xl flex flex-col shadow-2xl mx-auto rounded-t-3xl overflow-hidden border-2 border-[#B5D3E7] border-b-0">
                     <div className="p-6 border-b-2 border-[#B5D3E7] flex justify-between items-center bg-white">
                        <h2 className="text-2xl font-bold font-head text-[#2B547E]">Your Basket</h2>
                        <button onClick={() => setActiveTab('menu')} className="w-9 h-9 bg-white border-2 border-[#B5D3E7] rounded-xl flex items-center justify-center text-[#2B547E] hover:bg-[#2B547E] hover:text-white transition-colors"><Icon name="x" size={20}/></button>
                     </div>
                     <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar pb-32">
                         {cart.map((item: any, idx: any) => {
                            const finalPriceTotal = item.price * item.quantity;
                            const originalPriceTotal = (item.original_price || item.price) * item.quantity;
                            const hasDiscount = originalPriceTotal > finalPriceTotal;

                             return (
                             <div key={idx} className="flex gap-4 p-4 bg-white border-2 border-[#B5D3E7] rounded-2xl shadow-sm">
                                 <div className="w-16 h-16 bg-[#FDFBF7] rounded-xl shrink-0 overflow-hidden border border-[#B5D3E7]/50"><img src={item.image_url} className="w-full h-full object-cover" /></div>
                                 <div className="flex-1 min-w-0 flex flex-col justify-between">
                                     <div>
                                         <div className="flex justify-between items-start">
                                             <span className="text-sm font-bold text-[#1A2F4C] leading-tight truncate pr-4">{item.name} <span className="text-[#E07A5F]">x{item.quantity}</span></span>
                                             <span className="text-sm font-bold text-[#2B547E]">{finalPriceTotal}</span>
                                         </div>
                                         <div className="text-[10px] text-[#728C69] mt-1 font-semibold leading-tight">{item.note}</div>
                                     </div>
                                     <div className="flex gap-4 mt-2">
                                         <button onClick={() => updateQuantity(idx, -1)} className="text-[10px] font-bold text-[#E07A5F] hover:text-red-600 uppercase tracking-wider">Remove</button>
                                     </div>
                                 </div>
                             </div>
                         )})}
                         {cart.length === 0 && (
                             <div className="text-center py-20 flex flex-col items-center">
                                 <div className="w-16 h-16 bg-white border-2 border-[#B5D3E7] rounded-2xl flex items-center justify-center text-[#B5D3E7] mb-4"><Icon name="basket" size={28}/></div>
                                 <div className="text-sm font-bold text-[#94A3B8]">Basket is empty</div>
                             </div>
                         )}
                     </div>
                     <div className="p-6 bg-white border-t-2 border-[#B5D3E7] shrink-0">
                         <div className="flex justify-between items-end mb-6">
                             <span className="text-xs font-bold text-[#2B547E] uppercase tracking-wider">Total Amount</span>
                             <span className="text-3xl font-bold font-head text-[#E07A5F]">{cartTotal}.-</span>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} disabled={cart.length === 0} className="w-full py-4 bg-[#2B547E] text-white text-sm font-bold uppercase tracking-widest rounded-2xl disabled:opacity-50 disabled:bg-[#94A3B8] shadow-lg shadow-[#2B547E]/20 hover:bg-[#1A2F4C] transition-colors">Confirm Order</button>
                     </div>
                 </div>
             </div>
        )}

        {showConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1A2F4C]/50 backdrop-blur-md p-6 animate-fade">
                <div className="bg-white p-8 text-center border-2 border-[#B5D3E7] rounded-3xl max-w-sm w-full shadow-2xl">
                    <div className="mb-5 flex justify-center">
                        <div className="w-16 h-16 bg-[#728C69]/10 rounded-full flex items-center justify-center text-[#728C69]">
                            <Icon name="check" size={32} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-[#2B547E] font-head mb-2">Ready to order?</h3>
                    <p className="text-sm text-[#94A3B8] font-medium mb-6">Your delicious food is waiting.</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={onCheckoutClick} className="w-full py-4 bg-[#E07A5F] text-white text-xs uppercase font-bold tracking-widest rounded-xl shadow-lg shadow-[#E07A5F]/20 hover:bg-[#d66b4f]">Yes, confirm</button>
                        <button onClick={() => setShowConfirm(false)} className="w-full py-4 bg-white border-2 border-[#B5D3E7] text-[#2B547E] text-xs uppercase font-bold tracking-widest rounded-xl hover:bg-[#B5D3E7]/20">Cancel</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}
