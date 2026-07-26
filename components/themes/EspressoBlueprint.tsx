import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons (Technical/Blueprint Style) ---
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
      strokeLinecap="square"
      strokeLinejoin="miter"
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

  // AUTO-CHECKOUT LOGIC
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

  if (loading && !isVerified) return <div className="min-h-screen bg-[#0F2C59] flex items-center justify-center text-[#EADBC8] font-mono text-xl tracking-widest uppercase">INITIALIZING...</div>;

  return (
    // Theme: Espresso Blueprint
    <div className="w-full max-w-md md:max-w-xl xl:max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden bg-[#0F2C59] font-mono text-[#EADBC8]">
        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');

            :root {
                --bp-dark: #0A1C3A;
                --bp-main: #0F2C59;
                --bp-light: #1A3E7A;
                --bp-text: #EADBC8;
                --bp-highlight: #7AC0D6;
                --bp-border: rgba(234, 219, 200, 0.15);
                --bp-grid: rgba(234, 219, 200, 0.05);
            }

            body {
                font-family: 'Space Mono', monospace;
                background-color: var(--bp-main);
                background-image: 
                    linear-gradient(var(--bp-grid) 1px, transparent 1px),
                    linear-gradient(90deg, var(--bp-grid) 1px, transparent 1px);
                background-size: 20px 20px;
                -webkit-tap-highlight-color: transparent;
                color: var(--bp-text);
            }

            .bp-grid-bg {
                background-image: 
                    linear-gradient(rgba(234,219,200,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(234,219,200,0.1) 1px, transparent 1px);
                background-size: 20px 20px;
                background-position: center;
            }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            @keyframes pulse-slow {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }
            .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
            @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
            .animate-fade { animation: fadeIn 0.3s ease-out forwards; }
        `}} />

        {/* --- Header --- */}
        <header className="bg-[#0A1C3A]/90 backdrop-blur-md pt-12 pb-4 px-6 sticky top-0 z-50 border-b border-[rgba(234,219,200,0.15)] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
             <div className="flex justify-between items-end border-b border-[rgba(234,219,200,0.3)] pb-2 mb-2">
                 <div>
                     <p className="text-[10px] text-[#7AC0D6] uppercase tracking-[0.3em] mb-1">TBL-{tableLabel}</p>
                     <h1 className="text-xl font-bold tracking-wider text-[#EADBC8] uppercase">{brand?.name || "PROJECT: ESPRESSO"}</h1>
                 </div>
                 <div className="w-8 h-8 border border-[#7AC0D6] bg-[#0F2C59] flex items-center justify-center text-[#7AC0D6]">
                     <Icon name="shop" size={16} />
                 </div>
             </div>
             <div className="flex gap-4 text-[9px] text-[rgba(234,219,200,0.5)] tracking-widest uppercase">
                 <span>SEC: A1</span>
                 <span>STAT: ONLINE</span>
             </div>
        </header>

        <main className="px-6 pb-24 relative z-20 pt-4">
            {activeTab === 'home' && (
                <section className="animate-fade">
                    {banners?.length > 0 && (
                        <div className="relative w-full aspect-[2/1] bg-[#0A1C3A] border border-[rgba(234,219,200,0.3)] mb-8 p-1">
                             <div className="absolute top-2 left-2 text-[8px] bg-black/50 text-[#7AC0D6] px-1 z-10">FIG.1</div>
                             <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover filter grayscale sepia-[0.3] hue-rotate-180 brightness-75 contrast-125" />
                        </div>
                    )}
                    
                    <div className="flex justify-between items-end mb-6 border-b border-[rgba(234,219,200,0.15)] pb-2">
                         <h2 className="text-sm font-bold uppercase tracking-widest text-[#7AC0D6]">// RECOMMENDED SCHEMATICS</h2>
                         <button onClick={() => setActiveTab('menu')} className="text-[10px] flex items-center gap-1 hover:text-[#7AC0D6] transition-colors uppercase">
                             EXPAND <Icon name="chevronRight" size={12} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="cursor-pointer group relative border border-[rgba(234,219,200,0.15)] bg-[#0A1C3A] p-2 hover:border-[#7AC0D6] transition-colors" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#7AC0D6]"></div>
                                     <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#7AC0D6]"></div>
                                     
                                     <div className="w-full aspect-square overflow-hidden bg-[#0F2C59] mb-3 relative border border-[rgba(234,219,200,0.1)]">
                                         <div className="absolute top-1 left-1 text-[8px] text-[#7AC0D6] z-10 bg-[#0A1C3A]/80 px-1">ID:{p.id.slice(-4)}</div>
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover filter grayscale sepia-[0.2] hue-rotate-180 brightness-90 group-hover:filter-none transition-all duration-500" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute bottom-0 right-0 bg-[#EADBC8] text-[#0F2C59] text-[10px] px-2 py-0.5 font-bold">
                                                -DEV:{pricing.discount}
                                            </div>
                                         )}
                                     </div>
                                     <h3 className="font-bold text-[11px] mb-2 leading-tight uppercase truncate">{p.name}</h3>
                                     <div className="flex items-end justify-between">
                                         <span className="text-[#7AC0D6] font-bold text-sm">V.{pricing.final}</span>
                                         {pricing.discount > 0 && (
                                             <span className="text-[9px] text-[rgba(234,219,200,0.5)] line-through">
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
                    <div className="relative mb-6 border border-[rgba(234,219,200,0.3)] bg-[#0A1C3A] flex items-center p-1">
                         <div className="pl-2 flex items-center pointer-events-none text-[#7AC0D6]"><Icon name="search" size={16} /></div>
                         <input type="text" placeholder="QUERY DATABASE..." value={state?.searchTerm} onChange={(e) => actions?.setSearchTerm(e.target.value)} className="w-full pl-3 pr-4 py-2 bg-transparent outline-none text-xs text-[#EADBC8] placeholder-[rgba(234,219,200,0.3)] uppercase" />
                    </div>

                    <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)}
                                    className={`shrink-0 px-3 py-1.5 text-[10px] uppercase font-bold border transition-all
                                    ${selectedCategoryId === c.id ? 'bg-[#7AC0D6] text-[#0F2C59] border-[#7AC0D6]' : 'bg-[#0A1C3A] text-[#EADBC8] border-[rgba(234,219,200,0.3)]'}`}>
                                [{c.name}]
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3 pb-20">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="flex gap-3 cursor-pointer p-2 border border-[rgba(234,219,200,0.15)] bg-[#0A1C3A] hover:border-[#7AC0D6] transition-colors relative" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-20 h-20 bg-[#0F2C59] border border-[rgba(234,219,200,0.1)] shrink-0 relative overflow-hidden">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover filter grayscale sepia-[0.2] hue-rotate-180 brightness-90" />
                                     </div>
                                     <div className="flex-1 flex flex-col justify-between py-1">
                                         <div>
                                             <div className="text-[8px] text-[#7AC0D6] mb-1">UNIT-{idx + 1}</div>
                                             <h3 className="font-bold text-xs uppercase leading-tight">{p.name}</h3>
                                         </div>
                                         <div className="flex items-end justify-between">
                                             <div className="flex items-center gap-2">
                                                 <span className="text-[#7AC0D6] font-bold">{pricing.final} CR</span>
                                                 {pricing.discount > 0 && <span className="text-[10px] text-[rgba(234,219,200,0.5)] line-through">{pricing.original}</span>}
                                             </div>
                                             <div className="w-6 h-6 border border-[#7AC0D6] flex items-center justify-center text-[#7AC0D6] hover:bg-[#7AC0D6] hover:text-[#0F2C59] transition-colors">
                                                 <Icon name="plus" size={14} />
                                             </div>
                                         </div>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {activeTab === 'status' && (
                <section className="animate-fade pb-24">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#7AC0D6] border-b border-[rgba(234,219,200,0.15)] pb-2 mb-6">// PROCESS STATUS</h2>

                    <div className="space-y-4">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="border border-[rgba(234,219,200,0.3)] p-4 bg-[#0A1C3A] relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7AC0D6]/20 to-transparent"></div>
                                <div className="flex justify-between items-start mb-4 border-b border-[rgba(234,219,200,0.15)] pb-3">
                                     <div>
                                         <span className="text-[9px] text-[rgba(234,219,200,0.5)] uppercase tracking-widest block mb-0.5">TICKET REF</span>
                                         <span className="text-sm font-bold text-[#EADBC8]">{o.id.slice(-6).toUpperCase()}</span>
                                     </div>
                                     <div className={`px-2 py-1 text-[9px] uppercase font-bold border 
                                        ${o.status === 'pending' ? 'border-[#EADBC8] text-[#EADBC8]' : 'border-[#7AC0D6] text-[#7AC0D6] bg-[#7AC0D6]/10'}`}>
                                         {o.status === 'pending' ? 'QUEUED' : 'EXECUTING'}
                                     </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-xs text-[#EADBC8]">
                                            <div className="flex gap-3">
                                                <span className="text-[#7AC0D6] w-5">x{i.quantity}</span>
                                                <div className="flex flex-col">
                                                    <span className="uppercase">{i.product_name}</span>
                                                    {i.variant && i.variant !== 'normal' && <span className="text-[9px] text-[rgba(234,219,200,0.5)] uppercase mt-1">MOD: {i.variant}</span>}
                                                    {i.note && <span className="text-[9px] text-[rgba(234,219,200,0.5)] mt-0.5">NOTE: {i.note}</span>}
                                                </div>
                                            </div>
                                            <span>{i.price * i.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-end pt-3 border-t border-[rgba(234,219,200,0.15)]">
                                     <span className="text-[10px] uppercase tracking-widest text-[rgba(234,219,200,0.5)]">SUM</span>
                                     <span className="font-bold text-[#7AC0D6]">
                                         {o.total_price || o.order_items.reduce((a: any, b: any) => a + (b.price * b.quantity), 0)} CR
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20 border border-dashed border-[rgba(234,219,200,0.2)]">
                                <p className="text-xs uppercase text-[rgba(234,219,200,0.5)]">NO ACTIVE PROCESSES</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* Navigation */}
        <nav className="fixed bottom-0 left-0 w-full h-[70px] bg-[#0A1C3A] border-t border-[rgba(234,219,200,0.2)] flex justify-around items-center z-[90] shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-[#7AC0D6]' : 'text-[rgba(234,219,200,0.4)]'}`}>
                 <Icon name="home" size={20} />
                 <span className="text-[9px] uppercase font-bold tracking-widest">MNFST</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'menu' ? 'text-[#7AC0D6]' : 'text-[rgba(234,219,200,0.4)]'}`}>
                 <Icon name="menu" size={20} />
                 <span className="text-[9px] uppercase font-bold tracking-widest">INDEX</span>
             </button>

             <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-1 transition-colors relative ${activeTab === 'cart' ? 'text-[#7AC0D6]' : 'text-[rgba(234,219,200,0.4)]'}`}>
                 <div className="relative">
                     <Icon name="basket" size={20} />
                     {cart?.length > 0 && (
                         <span className="absolute -top-1.5 -right-2 bg-[#7AC0D6] text-[#0A1C3A] text-[9px] font-bold w-4 h-4 flex items-center justify-center">
                             {cart.length}
                         </span>
                     )}
                 </div>
                 <span className="text-[9px] uppercase font-bold tracking-widest">BUFFER</span>
             </button>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'status' ? 'text-[#7AC0D6]' : 'text-[rgba(234,219,200,0.4)]'}`}>
                 <Icon name="clock" size={20} />
                 <span className="text-[9px] uppercase font-bold tracking-widest">LOGS</span>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center xl:items-end justify-center bg-black/60 backdrop-blur-sm animate-fade">
                <div onClick={() => setSelectedProduct(null)} className="absolute inset-0"></div>

                <div className="w-full max-w-md md:max-w-xl xl:max-w-md md:rounded-2xl xl:rounded-none xl:rounded-t-2xl bg-[#0F2C59] border border-[rgba(234,219,200,0.3)] shadow-[0_0_40px_rgba(0,0,0,0.8)] max-h-[90vh] md:max-h-[85vh] xl:max-h-[90vh] flex flex-col animate-fade rounded-t-2xl overflow-hidden relative bp-grid-bg">
                    
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#7AC0D6] z-30"></div>
                    
                    <div className="absolute top-4 right-4 z-30">
                        <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 bg-[#0A1C3A] border border-[#7AC0D6] flex items-center justify-center text-[#7AC0D6] hover:bg-[#7AC0D6] hover:text-[#0A1C3A] transition-colors">
                            <Icon name="x" size={16} />
                        </button>
                    </div>

                    <div className="relative h-48 sm:h-56 md:h-52 xl:h-56 shrink-0 bg-[#0A1C3A] border-b border-[rgba(234,219,200,0.2)] p-4">
                        <div className="w-full h-full border border-dashed border-[rgba(234,219,200,0.3)] relative overflow-hidden">
                            <div className="absolute top-2 left-2 text-[10px] text-[#7AC0D6] bg-black/60 px-1 z-10">FIG.01 // VIEW</div>
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover filter grayscale sepia-[0.2] hue-rotate-180 brightness-90" />
                        </div>
                    </div>

                    <div className="p-5 md:p-6 pb-6 overflow-y-auto flex-1 no-scrollbar bg-[#0F2C59]/90">
                        <div className="mb-6">
                            <div className="text-[10px] text-[#7AC0D6] tracking-[0.3em] uppercase mb-1">SPECIFICATION</div>
                            <h2 className="text-xl font-bold uppercase mb-3">{selectedProduct.name}</h2>
                            <div className="flex items-end gap-3 mb-4">
                                <span className="text-2xl font-bold text-[#7AC0D6]">{basePriceObj.final} CR</span>
                                {basePriceObj.discount > 0 && (
                                    <>
                                        <span className="text-sm text-[rgba(234,219,200,0.5)] line-through">{basePriceObj.original}</span>
                                        <span className="text-[10px] text-[#0A1C3A] bg-[#7AC0D6] px-1.5 py-0.5 font-bold uppercase">-DEV {basePriceObj.discount}</span>
                                    </>
                                )}
                            </div>
                            {selectedProduct.description && (
                                <p className="text-xs text-[rgba(234,219,200,0.7)] leading-relaxed uppercase border-l-2 border-[#7AC0D6] pl-3 py-1">{selectedProduct.description}</p>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* --- Size Selector --- */}
                            {(selectedProduct.price_special || selectedProduct.price_jumbo) && (
                                <div>
                                    <label className="block text-[10px] text-[#7AC0D6] uppercase tracking-widest mb-3 border-b border-[rgba(234,219,200,0.15)] pb-1">// DIMENSIONS</label>
                                    <div className="flex flex-col gap-2">
                                        {[
                                            { key: 'normal', label: 'STD_SIZE', ...calculatePrice(selectedProduct, 'normal') },
                                            selectedProduct.price_special && { key: 'special', label: 'SPL_SIZE', ...calculatePrice(selectedProduct, 'special') },
                                            selectedProduct.price_jumbo && { key: 'jumbo', label: 'MAX_SIZE', ...calculatePrice(selectedProduct, 'jumbo') }
                                        ].filter(Boolean).map((v: any) => (
                                            <button
                                                key={v.key}
                                                onClick={() => setVariant(v.key)}
                                                className={`w-full py-3 px-4 flex justify-between items-center border transition-all uppercase text-xs font-bold
                                                    ${variant === v.key ? 'border-[#7AC0D6] bg-[#7AC0D6]/10 text-[#7AC0D6]' : 'border-[rgba(234,219,200,0.2)] text-[rgba(234,219,200,0.6)] hover:border-[rgba(234,219,200,0.4)]'}`}
                                            >
                                                <span>{v.label}</span>
                                                <span>{v.final} CR</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- OPTIONS --- */}
                            {selectedProduct.options?.length > 0 && selectedProduct.options.map((opt: any, index: number) => (
                                <div key={index} className="pt-2">
                                    <label className="block text-[10px] text-[#7AC0D6] uppercase tracking-widest mb-3 border-b border-[rgba(234,219,200,0.15)] pb-1">// {opt.name}</label>
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
                                                    className={`flex items-center p-2 border cursor-pointer transition-all active:scale-[0.99] bg-[#0A1C3A] ${isSelected ? 'border-[#7AC0D6] bg-[#7AC0D6]/5' : 'border-[rgba(234,219,200,0.15)]'}`}
                                                >
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className={`w-4 h-4 shrink-0 border flex items-center justify-center ${isSelected ? 'border-[#7AC0D6]' : 'border-[rgba(234,219,200,0.3)]'} ${opt.type === 'single' ? 'rounded-full' : ''}`}>
                                                            {isSelected && <div className={`w-2 h-2 shrink-0 bg-[#7AC0D6] ${opt.type === 'single' ? 'rounded-full' : ''}`} />}
                                                        </div>
                                                        {(choice.image_url || choice.image_name) && (
                                                            <div className="w-10 h-10 shrink-0 bg-[#0F2C59] border border-[rgba(234,219,200,0.2)] overflow-hidden p-0.5">
                                                                <img src={choice.image_url?.startsWith('http') ? choice.image_url : choice.image_name?.startsWith('http') ? choice.image_name : getMenuUrl(choice.image_name)} className="w-full h-full object-cover filter grayscale sepia-[0.3]" />
                                                            </div>
                                                        )}
                                                        <span className="text-xs uppercase font-bold text-[#EADBC8]">{choice.name}</span>
                                                        {Number(choice.price || 0) > 0 && (
                                                            <span className="ml-auto shrink-0 text-[10px] font-bold text-[#7AC0D6]">+{Number(choice.price || 0)} CR</span>
                                                        )}
                                                    </div>
                                                    <input type={opt.type === 'single' ? 'radio' : 'checkbox'} className="hidden" checked={isSelected || false} readOnly />
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* --- NOTE --- */}
                            <div className="pt-2">
                                <label className="block text-[10px] text-[#7AC0D6] uppercase tracking-widest mb-3 border-b border-[rgba(234,219,200,0.15)] pb-1">// MODIFICATIONS</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="INPUT OVERRIDE PARAMETERS..."
                                    className="w-full p-3 border border-[rgba(234,219,200,0.3)] focus:border-[#7AC0D6] outline-none text-xs transition-colors bg-[#0A1C3A] h-20 resize-none uppercase text-[#EADBC8] placeholder-[rgba(234,219,200,0.3)]"
                                />
                            </div>
                        </div>
                        <div className="h-4" />
                    </div>

                    <div className="shrink-0 w-full p-4 bg-[#0A1C3A] border-t border-[rgba(234,219,200,0.2)] grid grid-cols-2 gap-3 z-30">
                        <button onClick={() => handleAdd(true)} className="py-3 border border-[#7AC0D6] text-[#7AC0D6] text-[10px] uppercase font-bold tracking-widest hover:bg-[#7AC0D6]/10 transition-colors">BUFFER</button>
                        <button onClick={() => handleAdd(false)} className="py-3 bg-[#7AC0D6] text-[#0A1C3A] text-[10px] uppercase font-bold tracking-widest hover:brightness-110 transition-all">EXECUTE</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end bg-black/60 backdrop-blur-sm animate-fade">
                 <div className="w-full max-w-md md:max-w-xl xl:max-w-md bg-[#0F2C59] border border-[rgba(234,219,200,0.3)] h-[90vh] md:h-[80vh] xl:h-[90vh] md:rounded-2xl xl:rounded-none xl:rounded-t-2xl flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)] mx-auto rounded-t-2xl overflow-hidden relative bp-grid-bg">
                     
                     <div className="absolute top-0 left-0 w-full h-1 bg-[#EADBC8] z-30"></div>
                     
                     <div className="p-6 border-b border-[rgba(234,219,200,0.15)] bg-[#0A1C3A] flex justify-between items-center relative z-20">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[#7AC0D6]">// MEMORY BUFFER</h2>
                        <button onClick={() => setActiveTab('menu')} className="text-[#EADBC8] hover:text-[#7AC0D6]"><Icon name="x" size={18}/></button>
                     </div>
                     <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar pb-32 bg-[#0F2C59]/90 relative z-20">
                         {cart.map((item: any, idx: any) => {
                            const finalPriceTotal = item.price * item.quantity;
                             return (
                             <div key={idx} className="flex gap-4 border border-[rgba(234,219,200,0.2)] bg-[#0A1C3A] p-3">
                                 <div className="w-14 h-14 border border-[rgba(234,219,200,0.1)] bg-[#0F2C59] p-0.5 shrink-0 overflow-hidden">
                                     <img src={item.image_url} className="w-full h-full object-cover filter grayscale sepia-[0.3]" />
                                 </div>
                                 <div className="flex-1 min-w-0 flex flex-col justify-between">
                                     <div className="flex justify-between items-start gap-2">
                                         <span className="text-xs font-bold uppercase truncate">{item.name} <span className="text-[#7AC0D6]">x{item.quantity}</span></span>
                                         <span className="text-xs font-bold text-[#7AC0D6] whitespace-nowrap">{finalPriceTotal} CR</span>
                                     </div>
                                     <div className="text-[9px] text-[rgba(234,219,200,0.6)] uppercase leading-tight truncate">{item.note || 'NO MODS'}</div>
                                     <div className="flex gap-4 mt-2 justify-end">
                                         <button onClick={() => updateQuantity(idx, -1)} className="text-[9px] uppercase font-bold text-[#EADBC8] border-b border-[#EADBC8] hover:text-[#ef4444] hover:border-[#ef4444] pb-0.5">DELETE</button>
                                     </div>
                                 </div>
                             </div>
                         )})}
                         {cart.length === 0 && (
                             <div className="text-center py-20 border border-dashed border-[rgba(234,219,200,0.2)]">
                                 <span className="text-xs uppercase text-[rgba(234,219,200,0.5)]">BUFFER EMPTY</span>
                             </div>
                         )}
                     </div>
                     <div className="p-6 bg-[#0A1C3A] border-t border-[rgba(234,219,200,0.2)] shrink-0 relative z-20">
                         <div className="flex justify-between items-end mb-4 border-b border-[rgba(234,219,200,0.15)] pb-3">
                             <span className="text-[10px] uppercase tracking-widest text-[#7AC0D6]">TOTAL SUM</span>
                             <span className="text-2xl font-bold">{cartTotal} CR</span>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} disabled={cart.length === 0} className="w-full py-3 bg-[#EADBC8] text-[#0A1C3A] text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:brightness-110 transition-all">COMPILE ORDER</button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION --- */}
        {showConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 animate-fade">
                <div className="bg-[#0A1C3A] border border-[#7AC0D6] p-8 text-center max-w-xs w-full shadow-[0_0_30px_rgba(122,192,214,0.3)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#7AC0D6]"></div>
                    <div className="mb-4 flex justify-center text-[#7AC0D6]"><Icon name="check" size={32} /></div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-[#EADBC8]">CONFIRM COMPILATION?</h3>
                    <div className="flex flex-col gap-3">
                        <button onClick={onCheckoutClick} className="w-full py-3 bg-[#7AC0D6] text-[#0A1C3A] text-xs uppercase font-bold tracking-widest hover:brightness-110 transition-all">YES, EXECUTE</button>
                        <button onClick={() => setShowConfirm(false)} className="w-full py-3 border border-[rgba(234,219,200,0.2)] text-xs uppercase font-bold text-[rgba(234,219,200,0.6)] hover:bg-[rgba(234,219,200,0.05)] transition-all">ABORT</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}
