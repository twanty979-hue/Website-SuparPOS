import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons (Y2K Cyber Style) ---
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

  // --- AUTO-CHECKOUT LOGIC ---
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

  if (loading && !isVerified) return <div className="min-h-screen bg-[#E0E5EC] flex items-center justify-center text-[#FF007F] font-bold text-2xl tracking-[0.3em] font-head drop-shadow-[0_0_8px_rgba(255,0,127,0.8)]">LOADING...</div>;

  return (
    <div className="w-full max-w-md md:max-w-xl xl:max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden bg-[#E0E5EC] font-sans text-[#1A1A1A]">
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;600;700&family=Mitr:wght@300;400;500;600&display=swap');

            :root {
                --cyber-chrome: #E0E5EC;
                --cyber-dark: #1A1A1A;
                --neon-cyan: #00FFFF;
                --neon-pink: #FF007F;
                --neon-purple: #8A2BE2;
            }

            body {
                font-family: 'Mitr', sans-serif;
                background-color: var(--cyber-chrome);
                background-image: 
                    linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px);
                background-size: 20px 20px;
                -webkit-tap-highlight-color: transparent;
                color: var(--cyber-dark);
            }

            .font-head { font-family: 'Space Grotesk', sans-serif; }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            @keyframes neonPulse {
                0% { box-shadow: 0 0 5px var(--neon-cyan), inset 0 0 5px var(--neon-cyan); }
                50% { box-shadow: 0 0 15px var(--neon-cyan), inset 0 0 10px var(--neon-cyan); }
                100% { box-shadow: 0 0 5px var(--neon-cyan), inset 0 0 5px var(--neon-cyan); }
            }
            .animate-neon { animation: neonPulse 2s infinite; }

            @keyframes neonPulsePink {
                0% { box-shadow: 0 0 5px var(--neon-pink), inset 0 0 5px var(--neon-pink); }
                50% { box-shadow: 0 0 15px var(--neon-pink), inset 0 0 10px var(--neon-pink); }
                100% { box-shadow: 0 0 5px var(--neon-pink), inset 0 0 5px var(--neon-pink); }
            }
            .animate-neon-pink { animation: neonPulsePink 2s infinite; }
            
            @keyframes neonTextPink {
                0%, 100% { text-shadow: 0 0 5px var(--neon-pink), 0 0 10px var(--neon-pink); }
                50% { text-shadow: 0 0 10px var(--neon-pink), 0 0 20px var(--neon-pink), 0 0 30px var(--neon-pink); }
            }
            .text-neon-pink { animation: neonTextPink 2s infinite; }

            @keyframes fadeIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            .animate-fade { animation: fadeIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            
            /* Custom Scrollbar for notes */
            textarea::-webkit-scrollbar { width: 8px; }
            textarea::-webkit-scrollbar-track { background: transparent; }
            textarea::-webkit-scrollbar-thumb { background: #8A2BE2; border-radius: 4px; }
        `}} />

        {/* --- Header --- */}
        <header className="bg-white/40 backdrop-blur-xl pt-12 pb-6 px-6 sticky top-0 z-50 border-b-[3px] border-white/50 shadow-[0_4px_30px_rgba(0,255,255,0.1)]">
             <div className="flex justify-between items-center">
                 <div>
                     <p className="text-[#8A2BE2] text-xs font-bold tracking-[0.2em] font-head uppercase mb-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00FFFF] animate-pulse"></span>
                        Table {tableLabel}
                     </p>
                     <h1 className="text-3xl font-bold tracking-tighter text-[#1A1A1A] font-head drop-shadow-sm uppercase">
                        {brand?.name || "Y2K SNACKS"}
                     </h1>
                 </div>
                 <div className="w-12 h-12 bg-gradient-to-br from-[#00FFFF] to-[#FF007F] rounded-full p-[3px] shadow-[0_0_15px_rgba(255,0,127,0.4)]">
                     <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[#1A1A1A]">
                        <Icon name="shop" size={20} />
                     </div>
                 </div>
             </div>
        </header>

        <main className="px-6 pb-24 relative z-20">
            {activeTab === 'home' && (
                <section className="animate-fade pt-6">
                    {banners?.length > 0 && (
                        <div className="relative w-full aspect-[2/1] bg-white/50 backdrop-blur-md rounded-[2rem] overflow-hidden mb-8 border-[3px] border-white/60 shadow-[0_10px_30px_rgba(138,43,226,0.2)]">
                             <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover mix-blend-overlay opacity-90" />
                        </div>
                    )}
                    <div className="flex justify-between items-end mb-6">
                         <h2 className="text-xl font-bold text-[#1A1A1A] font-head uppercase tracking-tight relative z-10">
                            <span className="absolute bottom-1 left-0 w-full h-3 bg-[#00FFFF]/40 -z-10 skew-x-12"></span>
                            Hot Drops
                         </h2>
                         <button onClick={() => setActiveTab('menu')} className="text-[#FF007F] text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-[#8A2BE2] transition-colors bg-white/60 px-3 py-1.5 rounded-full border border-white">
                             All <Icon name="chevronRight" size={14} />
                         </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-4">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="cursor-pointer group bg-white/60 backdrop-blur-md rounded-[2rem] p-3 border-[3px] border-white/50 hover:border-[#00FFFF] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full aspect-square overflow-hidden bg-[#E0E5EC] rounded-[1.25rem] mb-3 relative border-2 border-transparent group-hover:border-[#FF007F] transition-colors">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-2 right-2 bg-[#FF007F] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-[0_0_10px_rgba(255,0,127,0.5)]">
                                                -{pricing.discount}
                                            </div>
                                         )}
                                     </div>
                                     <h3 className="font-bold text-[#1A1A1A] text-sm mb-1 leading-tight line-clamp-2">{p.name}</h3>
                                     <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[#8A2BE2] font-bold text-lg font-head">{pricing.final}</span>
                                            {pricing.discount > 0 && (
                                                <span className="text-[10px] text-[#FF007F] line-through font-bold">{pricing.original}</span>
                                            )}
                                        </div>
                                        <div className="w-7 h-7 rounded-full bg-[#00FFFF] text-[#1A1A1A] flex items-center justify-center font-bold shadow-[0_0_10px_rgba(0,255,255,0.6)] group-hover:bg-[#FF007F] group-hover:text-white group-hover:shadow-[0_0_10px_rgba(255,0,127,0.6)] transition-all">
                                            <Icon name="plus" size={14} />
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
                         <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Icon name="search" className="text-[#8A2BE2]" size={20} />
                         </div>
                         <input type="text" placeholder="Search cyberspace..." value={state?.searchTerm} onChange={(e) => actions?.setSearchTerm(e.target.value)} 
                         className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-md border-[3px] border-white/50 focus:border-[#00FFFF] focus:shadow-[0_0_15px_rgba(0,255,255,0.3)] outline-none text-sm text-[#1A1A1A] font-bold placeholder-[#8A2BE2]/50 transition-all rounded-[2rem]" />
                    </div>
                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)}
                                    className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border-[3px]
                                    ${selectedCategoryId === c.id ? 'bg-[#FF007F] border-[#FF007F] text-white shadow-[0_0_15px_rgba(255,0,127,0.5)]' : 'bg-white/60 border-white/50 text-[#1A1A1A] hover:border-[#00FFFF]'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-4 pb-20">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="flex gap-4 cursor-pointer p-3 bg-white/60 backdrop-blur-md rounded-[2rem] border-[3px] border-white/50 hover:border-[#8A2BE2] hover:shadow-[0_0_20px_rgba(138,43,226,0.2)] transition-all" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-24 h-24 bg-[#E0E5EC] overflow-hidden shrink-0 rounded-[1.25rem] relative">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-1 right-1 bg-[#FF007F] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_5px_rgba(255,0,127,0.5)]">
                                                SALE
                                            </div>
                                         )}
                                     </div>
                                     <div className="flex-1 flex flex-col justify-center py-1">
                                         <h3 className="font-bold text-[#1A1A1A] text-sm mb-1 line-clamp-2 leading-tight">{p.name}</h3>
                                         <div className="flex items-center gap-2 mt-auto">
                                             <span className="text-[#8A2BE2] font-bold text-lg font-head">{pricing.final}.-</span>
                                             {pricing.discount > 0 && <span className="text-xs text-[#FF007F] line-through font-bold">{pricing.original}</span>}
                                         </div>
                                     </div>
                                     <div className="flex items-center pr-2">
                                         <div className="w-10 h-10 rounded-full bg-white/80 border-2 border-[#00FFFF] flex items-center justify-center text-[#1A1A1A] hover:bg-[#00FFFF] hover:shadow-[0_0_15px_rgba(0,255,255,0.6)] transition-all">
                                             <Icon name="plus" size={18} />
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
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6 font-head tracking-tighter uppercase relative z-10 inline-block">
                        <span className="absolute bottom-1 left-0 w-full h-3 bg-[#FF007F]/40 -z-10 skew-x-12"></span>
                        Data Logs
                    </h2>

                    <div className="space-y-6">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="border-[3px] border-white/60 bg-white/40 backdrop-blur-xl p-5 rounded-[2rem] shadow-[0_10px_30px_rgba(138,43,226,0.1)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#00FFFF]/20 to-transparent rounded-bl-[4rem]"></div>
                                
                                <div className="flex justify-between items-start mb-5 relative z-10">
                                     <div>
                                         <span className="text-[10px] text-[#8A2BE2] font-bold uppercase tracking-widest block mb-1">Session ID</span>
                                         <span className="text-xl font-bold text-[#1A1A1A] font-head">#{o.id.slice(-4)}</span>
                                     </div>
                                     <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border-2 shadow-sm
                                        ${o.status === 'pending' ? 'border-[#FF007F] text-[#FF007F] bg-[#FF007F]/10' : 'border-[#00FFFF] text-[#00FFFF] bg-[#00FFFF]/10'}`}>
                                         {o.status === 'pending' ? 'WAITING' : 'PROCESSING'}
                                     </div>
                                </div>

                                <div className="space-y-3 mb-5 relative z-10">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#1A1A1A] bg-white/50 p-3 rounded-xl border border-white/60">
                                            <div className="flex gap-3">
                                                <span className="font-bold text-[#8A2BE2] w-6 bg-white rounded-md text-center py-0.5">{i.quantity}</span>
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{i.product_name}</span>
                                                    {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-[#FF007F] font-bold uppercase mt-0.5">{i.variant}</span>}
                                                    {i.note && <span className="text-[10px] text-[#1A1A1A]/70 font-medium italic mt-0.5 leading-snug">"{i.note}"</span>}
                                                </div>
                                            </div>
                                            <span className="font-bold font-head">{i.price * i.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t-2 border-white/50 relative z-10">
                                     <span className="text-xs text-[#8A2BE2] font-bold uppercase tracking-widest">Total Value</span>
                                     <span className="font-bold text-2xl text-[#1A1A1A] font-head">
                                         {o.total_price || o.order_items.reduce((a: any, b: any) => a + (b.price * b.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-24">
                                <div className="w-20 h-20 mx-auto bg-white/40 rounded-full flex items-center justify-center mb-4 border-2 border-white/60 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                                    <Icon name="clock" size={32} className="text-[#8A2BE2]" />
                                </div>
                                <p className="text-sm font-bold text-[#1A1A1A]/50 uppercase tracking-widest">No active sessions</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- Navigation --- */}
        <nav className="fixed bottom-0 left-0 w-full h-[85px] bg-white/80 backdrop-blur-xl border-t-[3px] border-white/60 flex justify-center items-center gap-10 z-[90] pb-3 px-6 shadow-[0_-10px_30px_rgba(138,43,226,0.15)] rounded-t-[2rem]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition-all relative ${activeTab === 'home' ? 'text-[#00FFFF]' : 'text-[#1A1A1A]/40'}`}>
                 <div className={`p-2 rounded-xl ${activeTab === 'home' ? 'bg-[#1A1A1A] shadow-[0_0_15px_rgba(0,255,255,0.5)]' : ''}`}>
                    <Icon name="home" size={24} />
                 </div>
                 <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1.5 transition-all relative ${activeTab === 'menu' ? 'text-[#FF007F]' : 'text-[#1A1A1A]/40'}`}>
                 <div className={`p-2 rounded-xl ${activeTab === 'menu' ? 'bg-[#1A1A1A] shadow-[0_0_15px_rgba(255,0,127,0.5)]' : ''}`}>
                    <Icon name="menu" size={24} />
                 </div>
                 <span className="text-[9px] font-bold uppercase tracking-widest">Menu</span>
             </button>

             <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-1.5 transition-all relative ${activeTab === 'cart' ? 'text-[#8A2BE2]' : 'text-[#1A1A1A]/40'}`}>
                 <div className="relative">
                     <div className={`p-2 rounded-xl ${activeTab === 'cart' ? 'bg-[#1A1A1A] shadow-[0_0_15px_rgba(138,43,226,0.5)]' : ''}`}>
                        <Icon name="basket" size={24} />
                     </div>
                     {cart?.length > 0 && (
                         <span className="absolute -top-2 -right-2 bg-[#00FFFF] text-[#1A1A1A] font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.8)] border border-white">
                             {cart.length}
                         </span>
                     )}
                 </div>
                 <span className="text-[9px] font-bold uppercase tracking-widest">Cart</span>
             </button>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1.5 transition-all relative ${activeTab === 'status' ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/40'}`}>
                 <div className={`p-2 rounded-xl ${activeTab === 'status' ? 'bg-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.6)]' : ''}`}>
                    <Icon name="clock" size={24} />
                 </div>
                 <span className="text-[9px] font-bold uppercase tracking-widest">Status</span>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center xl:items-end justify-center bg-[#1A1A1A]/60 backdrop-blur-md animate-fade">
                <div onClick={() => setSelectedProduct(null)} className="absolute inset-0"></div>

                <div className="w-full max-w-md md:max-w-xl xl:max-w-md bg-white/90 backdrop-blur-2xl shadow-[0_0_40px_rgba(255,0,127,0.3)] border-t-[4px] md:border-[4px] border-[#FF007F] max-h-[90vh] md:max-h-[85vh] xl:max-h-[90vh] flex flex-col animate-fade
                rounded-t-[2.5rem] md:rounded-[2.5rem] xl:rounded-t-[2.5rem] overflow-hidden relative">
                    
                    <div className="absolute top-4 right-4 z-20">
                        <button onClick={() => setSelectedProduct(null)} className="w-10 h-10 bg-[#1A1A1A] border-2 border-[#00FFFF] rounded-full flex items-center justify-center text-[#00FFFF] hover:bg-[#00FFFF] hover:text-[#1A1A1A] transition-colors shadow-[0_0_15px_rgba(0,255,255,0.4)]">
                            <Icon name="x" size={20} />
                        </button>
                    </div>

                    <div className="relative h-56 sm:h-64 md:h-52 xl:h-64 shrink-0 bg-[#E0E5EC] rounded-t-[2.5rem] md:rounded-t-[2.2rem] xl:rounded-t-[2.5rem] overflow-hidden p-2">
                        <div className="w-full h-full rounded-[2rem] overflow-hidden relative shadow-inner">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 pb-6 overflow-y-auto bg-transparent flex-1 no-scrollbar">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2 font-head uppercase leading-tight">{selectedProduct.name}</h2>
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-bold font-head text-[#8A2BE2] drop-shadow-sm">{basePriceObj.final}.-</span>
                                {basePriceObj.discount > 0 && (
                                    <>
                                        <span className="text-lg text-[#1A1A1A]/40 line-through font-bold">{basePriceObj.original}</span>
                                        <span className="text-[10px] text-[#1A1A1A] font-bold bg-[#00FFFF] px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.6)] border border-white">SAVE {basePriceObj.discount}</span>
                                    </>
                                )}
                            </div>
                            {selectedProduct.description && (
                                <p className="text-sm text-[#1A1A1A]/70 mt-3 font-medium bg-white/50 p-4 rounded-2xl border-[2px] border-white/60">{selectedProduct.description}</p>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* --- Size Selector --- */}
                            {(selectedProduct.price_special || selectedProduct.price_jumbo) && (
                                <div>
                                    <label className="block text-[11px] text-[#FF007F] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF007F]"></span> Upgrade Size
                                    </label>
                                    <div className="flex flex-col gap-3">
                                        {[
                                            { key: 'normal', label: 'NORMAL', ...calculatePrice(selectedProduct, 'normal') },
                                            selectedProduct.price_special && { key: 'special', label: 'SPECIAL', ...calculatePrice(selectedProduct, 'special') },
                                            selectedProduct.price_jumbo && { key: 'jumbo', label: 'JUMBO', ...calculatePrice(selectedProduct, 'jumbo') }
                                        ].filter(Boolean).map((v: any) => (
                                            <button
                                                key={v.key}
                                                onClick={() => setVariant(v.key)}
                                                className={`w-full py-4 px-5 flex justify-between items-center border-[3px] transition-all rounded-[1.5rem]
                                                    ${variant === v.key ? 'border-[#8A2BE2] bg-[#8A2BE2]/10 shadow-[0_0_15px_rgba(138,43,226,0.2)]' : 'border-white/60 bg-white/50 text-[#1A1A1A] hover:border-[#00FFFF]'}`}
                                            >
                                                <span className={`text-sm font-bold tracking-wider ${variant === v.key ? 'text-[#8A2BE2]' : ''}`}>{v.label}</span>
                                                <span className={`text-sm font-bold font-head ${variant === v.key ? 'text-[#8A2BE2]' : ''}`}>{v.final}.-</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- OPTIONS --- */}
                            {selectedProduct.options?.length > 0 && selectedProduct.options.map((opt: any, index: number) => (
                                <div key={index} className="pt-6 border-t-[3px] border-white/60">
                                    <label className="block text-[11px] text-[#00FFFF] bg-[#1A1A1A] px-3 py-1 rounded-full inline-block font-bold uppercase tracking-widest mb-4 border border-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.4)]">
                                        {opt.name} {opt.required && <span className="text-[#FF007F]">*</span>}
                                    </label>
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
                                                    className={`flex items-center p-3 border-[3px] rounded-[1.5rem] cursor-pointer transition-all active:scale-[0.98] 
                                                        ${isSelected ? 'border-[#FF007F] bg-[#FF007F]/5 shadow-[0_0_15px_rgba(255,0,127,0.15)]' : 'border-white/60 bg-white/50 hover:border-[#00FFFF]'}`}
                                                >
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className={`w-6 h-6 shrink-0 border-[2px] flex items-center justify-center transition-all
                                                            ${isSelected ? 'border-[#FF007F] bg-[#FF007F]' : 'border-[#1A1A1A]/20 bg-white'} 
                                                            ${opt.type === 'single' ? 'rounded-full' : 'rounded-[0.6rem]'}`}>
                                                            {isSelected && <Icon name="check" size={14} className="text-white" />}
                                                        </div>
                                                        {(choice.image_url || choice.image_name) && (
                                                            <div className="w-12 h-12 shrink-0 bg-[#E0E5EC] rounded-xl overflow-hidden border-2 border-white/80">
                                                                <img src={choice.image_url?.startsWith('http') ? choice.image_url : choice.image_name?.startsWith('http') ? choice.image_name : getMenuUrl(choice.image_name)} className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <span className={`text-sm font-bold ${isSelected ? 'text-[#FF007F]' : 'text-[#1A1A1A]'}`}>{choice.name}</span>
                                                        {Number(choice.price || 0) > 0 && (
                                                            <span className="ml-auto shrink-0 text-xs font-bold font-head text-[#8A2BE2] bg-[#8A2BE2]/10 px-2 py-1 rounded-lg">
                                                                +{Number(choice.price || 0)}.-
                                                            </span>
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
                            <div className="pt-6 border-t-[3px] border-white/60">
                                <label className="block text-[11px] text-[#1A1A1A]/50 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Icon name="search" size={14} /> Custom Requests
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Enter your modifications..."
                                    className="w-full p-5 border-[3px] border-white/60 rounded-[1.5rem] focus:border-[#8A2BE2] focus:shadow-[0_0_15px_rgba(138,43,226,0.2)] outline-none text-sm font-bold transition-all bg-white/50 h-28 resize-none mb-4 placeholder-[#1A1A1A]/30"
                                />
                            </div>
                        </div>
                        <div className="h-4" />
                    </div>

                    <div className="shrink-0 w-full p-4 bg-white/90 backdrop-blur-xl border-t-[3px] border-[#E0E5EC] grid grid-cols-2 gap-3 z-30 rounded-b-[2.5rem] md:rounded-b-[2.5rem] xl:rounded-b-none">
                        <button onClick={() => handleAdd(true)} className="py-4 border-[3px] border-[#1A1A1A] bg-white rounded-[1.5rem] text-xs uppercase font-bold tracking-widest hover:bg-[#1A1A1A] hover:text-[#00FFFF] transition-all flex items-center justify-center gap-2 group">
                            <Icon name="basket" size={16} className="group-hover:animate-bounce" /> ADD TO TRAY
                        </button>
                        <button onClick={() => handleAdd(false)} className="py-4 bg-[#FF007F] text-white rounded-[1.5rem] text-xs uppercase font-bold tracking-widest shadow-[0_5px_20px_rgba(255,0,127,0.4)] hover:bg-[#8A2BE2] hover:shadow-[0_5px_20px_rgba(138,43,226,0.4)] transition-all animate-neon-pink">
                            CHECKOUT NOW
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end md:items-center xl:items-end justify-center bg-[#1A1A1A]/60 backdrop-blur-md animate-fade">
                 <div className="w-full max-w-md md:max-w-xl xl:max-w-md bg-white/90 backdrop-blur-2xl border-t-[4px] md:border-[4px] border-[#00FFFF] shadow-[0_0_40px_rgba(0,255,255,0.2)] h-[90vh] md:h-[80vh] xl:h-[90vh] md:rounded-[2.5rem] xl:rounded-none xl:rounded-t-[2.5rem] rounded-t-[2.5rem] flex flex-col overflow-hidden relative">
                     
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFFF]/10 rounded-bl-full pointer-events-none"></div>

                     <div className="p-6 md:p-8 border-b-[3px] border-white/60 flex justify-between items-center bg-white/50 relative z-10">
                        <h2 className="text-2xl font-bold font-head uppercase tracking-tight text-[#1A1A1A] flex items-center gap-2">
                            <Icon name="basket" size={24} className="text-[#00FFFF]" /> Cart File
                        </h2>
                        <button onClick={() => setActiveTab('menu')} className="w-10 h-10 bg-white border-2 border-[#1A1A1A]/10 rounded-full flex items-center justify-center text-[#1A1A1A] hover:border-[#FF007F] hover:text-[#FF007F] transition-all">
                            <Icon name="x" size={20} />
                        </button>
                     </div>
                     <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-4 no-scrollbar pb-32">
                         {cart.map((item: any, idx: any) => {
                             const finalPriceTotal = item.price * item.quantity;
                             return (
                             <div key={idx} className="flex gap-4 p-4 bg-white/60 border-[3px] border-white/80 rounded-[1.5rem] hover:border-[#8A2BE2] transition-colors relative overflow-hidden group">
                                 <div className="w-16 h-16 bg-[#E0E5EC] rounded-xl shrink-0 overflow-hidden border border-white relative z-10">
                                     <img src={item.image_url} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1 min-w-0 relative z-10">
                                     <div className="flex justify-between items-start">
                                         <span className="text-sm font-bold truncate pr-2 text-[#1A1A1A] leading-tight">{item.name} <span className="text-[#FF007F]">x{item.quantity}</span></span>
                                         <span className="text-sm font-bold font-head text-[#8A2BE2]">{finalPriceTotal}.-</span>
                                     </div>
                                     {item.note && <div className="text-[10px] text-[#1A1A1A]/60 mt-1 font-medium bg-white/50 px-2 py-1 rounded-md inline-block">{item.note}</div>}
                                     <div className="mt-2">
                                         <button onClick={() => updateQuantity(idx, -1)} className="text-[10px] font-bold text-[#FF007F] uppercase tracking-wider bg-[#FF007F]/10 px-2 py-1 rounded-lg hover:bg-[#FF007F] hover:text-white transition-colors">
                                            Remove
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         )})}
                         {cart.length === 0 && (
                             <div className="text-center py-20 flex flex-col items-center">
                                 <div className="w-24 h-24 bg-white/50 rounded-full border-[3px] border-dashed border-[#1A1A1A]/20 flex items-center justify-center mb-4">
                                     <Icon name="basket" size={40} className="text-[#1A1A1A]/20" />
                                 </div>
                                 <p className="text-sm font-bold text-[#1A1A1A]/40 uppercase tracking-widest">Cart is empty</p>
                             </div>
                         )}
                     </div>
                     <div className="p-6 md:p-8 bg-white/90 backdrop-blur-xl border-t-[3px] border-white/80 shrink-0 rounded-b-[2.5rem] md:rounded-b-[2.5rem] xl:rounded-b-none shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                         <div className="flex justify-between items-end mb-6">
                             <span className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A]/50">Total Sum</span>
                             <span className="text-4xl font-bold font-head text-[#00FFFF] drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] [text-shadow:1px_1px_0_#1a1a1a,-1px_1px_0_#1a1a1a,1px_-1px_0_#1a1a1a,-1px_-1px_0_#1a1a1a]">{cartTotal}.-</span>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} disabled={cart.length === 0} 
                         className="w-full py-5 bg-[#1A1A1A] text-[#00FFFF] text-sm font-bold uppercase tracking-widest rounded-[1.5rem] disabled:opacity-50 disabled:bg-[#1A1A1A]/20 disabled:text-[#1A1A1A]/50 hover:bg-[#00FFFF] hover:text-[#1A1A1A] transition-all border-2 border-[#1A1A1A] shadow-[0_5px_20px_rgba(0,255,255,0.3)] animate-neon">
                             Confirm Output
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION --- */}
        {showConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1A1A1A]/80 backdrop-blur-lg p-6 animate-fade">
                <div className="bg-white p-8 text-center border-[4px] border-[#00FFFF] rounded-[2rem] max-w-xs w-full shadow-[0_0_50px_rgba(0,255,255,0.3)] relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF007F]/10 rounded-full blur-2xl"></div>
                    <div className="mb-6 flex justify-center text-[#00FFFF] bg-[#1A1A1A] w-16 h-16 mx-auto rounded-full items-center shadow-[0_0_20px_rgba(0,255,255,0.5)] border-2 border-[#00FFFF]">
                        <Icon name="check" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold font-head mb-6 text-[#1A1A1A] uppercase tracking-tight">Execute Order?</h3>
                    <div className="flex flex-col gap-3 relative z-10">
                        <button onClick={onCheckoutClick} className="w-full py-4 bg-[#FF007F] text-white text-xs uppercase font-bold tracking-widest rounded-xl hover:bg-[#8A2BE2] transition-colors shadow-[0_5px_15px_rgba(255,0,127,0.4)]">Initialize</button>
                        <button onClick={() => setShowConfirm(false)} className="w-full py-4 text-xs uppercase font-bold tracking-widest text-[#1A1A1A]/50 bg-black/5 rounded-xl hover:bg-black/10 transition-colors">Abort</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}
