import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons (Omakase Ink Style) ---
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
      strokeWidth="1.2"
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

  if (loading && !isVerified) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-[#121212] font-light text-xl tracking-widest uppercase font-serif">Loading...</div>;

  return (
    <div className="w-full max-w-md md:max-w-xl xl:max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden bg-[#FAFAFA] text-[#000000]">
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Noto+Serif:ital,wght@0,300;0,400;0,600;1,300&display=swap');

            :root {
                --primary: #000000;
                --secondary: #121212;
                --bg-main: #FAFAFA;
                --border-color: #E5E5E5;
                --gray-light: #9CA3AF;
            }

            body {
                font-family: 'Inter', sans-serif;
                background-color: var(--bg-main);
                -webkit-tap-highlight-color: transparent;
                color: var(--primary);
                letter-spacing: 0.01em;
            }

            .font-serif { font-family: 'Noto Serif', serif; }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            @keyframes inkFadeIn {
                from { opacity: 0; filter: blur(4px); transform: scale(0.98); }
                to { opacity: 1; filter: blur(0); transform: scale(1); }
            }
            .animate-ink { animation: inkFadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        `}} />

        {/* --- Header (Omakase Style) --- */}
        <header className="bg-[#FAFAFA]/90 backdrop-blur-md pt-12 pb-6 px-8 sticky top-0 z-50 border-b border-[#E5E5E5]">
             <div className="flex justify-between items-center">
                 <div>
                     <p className="text-[#9CA3AF] text-[10px] font-medium tracking-[0.2em] uppercase mb-1">Table {tableLabel}</p>
                     <h1 className="text-2xl font-semibold tracking-tight text-[#000000] font-serif">{brand?.name || "Omakase Ink"}</h1>
                 </div>
                 <div className="w-10 h-10 border border-[#000000] rounded-none flex items-center justify-center text-[#000000]">
                     <Icon name="shop" size={18} />
                 </div>
             </div>
        </header>

        <main className="px-8 pb-24 relative z-20">
            {activeTab === 'home' && (
                <section className="animate-ink pt-8">
                    {banners?.length > 0 && (
                        <div className="relative w-full aspect-[16/9] bg-[#E5E5E5] overflow-hidden mb-12">
                             <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover grayscale mix-blend-multiply" />
                             <div className="absolute inset-0 border border-[#000000] m-2 pointer-events-none"></div>
                        </div>
                    )}
                    <div className="flex justify-between items-end mb-8 border-b border-[#E5E5E5] pb-4">
                         <h2 className="text-xl italic font-light text-[#000000] font-serif">Signatures</h2>
                         <button onClick={() => setActiveTab('menu')} className="text-[#121212] text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-[#000000] transition-colors">
                             Explore <Icon name="chevronRight" size={14} />
                         </button>
                    </div>
                    <div className="flex flex-col gap-10">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 4).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                 <div key={p.id} onClick={() => setSelectedProduct(p)} className="cursor-pointer group flex items-start gap-6" style={{animationDelay: `${idx * 0.1}s`}}>
                                     <div className="w-28 h-36 overflow-hidden bg-[#E5E5E5] shrink-0 relative">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-0 left-0 bg-[#000000] text-white text-[9px] uppercase tracking-widest px-2 py-1">
                                                -{pricing.discount}
                                            </div>
                                         )}
                                     </div>
                                     <div className="flex-1 pt-2">
                                         <h3 className="font-medium text-[#000000] text-lg mb-2 font-serif leading-tight">{p.name}</h3>
                                         <div className="flex flex-col gap-1">
                                             <span className="text-[#000000] text-sm">{pricing.final} ฿</span>
                                             {pricing.discount > 0 && (
                                                 <span className="text-[10px] text-[#9CA3AF] line-through">
                                                     {pricing.original} ฿
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
                <section className="animate-ink pt-8">
                    <div className="relative mb-10">
                         <input type="text" placeholder="Search..." value={state?.searchTerm} onChange={(e) => actions?.setSearchTerm(e.target.value)} className="w-full pb-2 bg-transparent border-b border-[#000000] outline-none text-sm text-[#000000] placeholder-[#9CA3AF] transition-colors rounded-none font-serif italic" />
                         <div className="absolute right-0 top-0"><Icon name="search" className="text-[#000000]" size={16} /></div>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-10">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)}
                                    className={`px-4 py-2 text-[10px] uppercase tracking-[0.15em] transition-all
                                    ${selectedCategoryId === c.id ? 'bg-[#000000] text-white' : 'bg-transparent border border-[#000000] text-[#000000] hover:bg-[#121212] hover:text-white'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10 pb-20">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                 <div key={p.id} onClick={() => setSelectedProduct(p)} className="cursor-pointer group flex flex-col" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full aspect-[3/4] bg-[#E5E5E5] overflow-hidden mb-4">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
                                     </div>
                                     <h3 className="font-medium text-[#000000] text-sm mb-1 font-serif line-clamp-2">{p.name}</h3>
                                     <div className="flex items-center justify-between mt-auto pt-2">
                                         <div className="flex items-center gap-2">
                                             <span className="text-[#000000] text-sm">{pricing.final}</span>
                                             {pricing.discount > 0 && <span className="text-[10px] text-[#9CA3AF] line-through">{pricing.original}</span>}
                                         </div>
                                         <div className="text-[#000000] group-hover:opacity-50 transition-opacity">
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
                <section className="animate-ink pt-8 pb-24">
                    <h2 className="text-2xl font-light text-[#000000] mb-8 font-serif">Journey</h2>

                    <div className="space-y-8">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="border-t border-[#000000] pt-6">
                                <div className="flex justify-between items-start mb-6">
                                     <div>
                                         <span className="text-[9px] text-[#9CA3AF] uppercase tracking-widest block mb-1">Receipt</span>
                                         <span className="text-sm font-medium text-[#000000] font-serif">#{o.id.slice(-4)}</span>
                                     </div>
                                     <div className={`text-[10px] uppercase tracking-widest border border-[#000000] px-3 py-1
                                        ${o.status === 'pending' ? 'text-[#000000] bg-transparent' : 'text-white bg-[#000000]'}`}>
                                         {o.status === 'pending' ? 'Preparing' : 'Ready'}
                                     </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#121212]">
                                            <div className="flex gap-4">
                                                <span className="text-[#000000] w-4 font-serif">{i.quantity}</span>
                                                <div className="flex flex-col">
                                                    <span className="font-serif">{i.product_name}</span>
                                                    {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-[#9CA3AF] uppercase mt-1">{i.variant}</span>}
                                                    {i.note && <span className="text-[10px] text-[#9CA3AF] italic mt-1 leading-snug">{i.note}</span>}
                                                </div>
                                            </div>
                                            <span>{i.price * i.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-[#E5E5E5]">
                                     <span className="text-[10px] text-[#000000] uppercase tracking-widest">Total</span>
                                     <span className="font-medium text-lg text-[#000000] font-serif">
                                         {o.total_price || o.order_items.reduce((a: any, b: any) => a + (b.price * b.quantity), 0)}
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-32">
                                <p className="text-sm italic font-serif text-[#9CA3AF]">The canvas is blank.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        <nav className="fixed bottom-0 left-0 w-full h-[80px] bg-[#FAFAFA] border-t border-[#E5E5E5] flex justify-center items-center gap-10 z-[90] pb-2">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-2 transition-colors ${activeTab === 'home' ? 'text-[#000000]' : 'text-[#9CA3AF]'}`}>
                 <Icon name="home" size={20} />
                 <span className="text-[8px] uppercase tracking-[0.2em]">Home</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-2 transition-colors ${activeTab === 'menu' ? 'text-[#000000]' : 'text-[#9CA3AF]'}`}>
                 <Icon name="menu" size={20} />
                 <span className="text-[8px] uppercase tracking-[0.2em]">Menu</span>
             </button>

             <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-2 transition-colors relative ${activeTab === 'cart' ? 'text-[#000000]' : 'text-[#9CA3AF]'}`}>
                 <div className="relative">
                     <Icon name="basket" size={20} />
                     {cart?.length > 0 && (
                         <span className="absolute -top-2 -right-3 bg-[#000000] text-white text-[8px] w-4 h-4 flex items-center justify-center font-serif">
                             {cart.length}
                         </span>
                     )}
                 </div>
                 <span className="text-[8px] uppercase tracking-[0.2em]">Cart</span>
             </button>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-2 transition-colors ${activeTab === 'status' ? 'text-[#000000]' : 'text-[#9CA3AF]'}`}>
                 <Icon name="clock" size={20} />
                 <span className="text-[8px] uppercase tracking-[0.2em]">Status</span>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Omakase Ink) --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center xl:items-end justify-center bg-black/60 backdrop-blur-sm animate-ink">
                <div onClick={() => setSelectedProduct(null)} className="absolute inset-0"></div>

                <div className="w-full max-w-md md:max-w-xl xl:max-w-md md:rounded-2xl xl:rounded-none xl:rounded-t-3xl bg-[#FAFAFA] shadow-2xl max-h-[90vh] md:max-h-[85vh] xl:max-h-[90vh] flex flex-col animate-ink rounded-t-3xl overflow-hidden relative">
                    <div className="absolute top-4 right-4 z-20">
                        <button onClick={() => setSelectedProduct(null)} className="w-10 h-10 bg-[#FAFAFA] flex items-center justify-center text-[#000000] border border-[#000000] hover:bg-[#000000] hover:text-[#FAFAFA] transition-colors">
                            <Icon name="x" size={18} />
                        </button>
                    </div>

                    <div className="relative h-64 sm:h-72 shrink-0 bg-[#E5E5E5]">
                        <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover grayscale" />
                    </div>

                    <div className="p-8 overflow-y-auto bg-[#FAFAFA] flex-1 no-scrollbar pb-6">
                        <div className="mb-8">
                            <h2 className="text-3xl font-light text-[#000000] mb-3 font-serif">{selectedProduct.name}</h2>
                            <div className="flex items-baseline gap-4">
                                <span className="text-2xl font-serif text-[#000000]">{basePriceObj.final}</span>
                                {basePriceObj.discount > 0 && (
                                    <>
                                        <span className="text-sm text-[#9CA3AF] line-through">{basePriceObj.original}</span>
                                    </>
                                )}
                            </div>
                            {selectedProduct.description && (
                                <p className="text-sm text-[#121212] mt-4 leading-relaxed font-serif italic">{selectedProduct.description}</p>
                            )}
                        </div>

                        <div className="space-y-8">
                            {(selectedProduct.price_special || selectedProduct.price_jumbo) && (
                                <div>
                                    <label className="block text-[10px] text-[#9CA3AF] uppercase tracking-[0.2em] mb-4">Portion</label>
                                    <div className="flex flex-col gap-3">
                                        {[
                                            { key: 'normal', label: 'Normal', ...calculatePrice(selectedProduct, 'normal') },
                                            selectedProduct.price_special && { key: 'special', label: 'Special', ...calculatePrice(selectedProduct, 'special') },
                                            selectedProduct.price_jumbo && { key: 'jumbo', label: 'Jumbo', ...calculatePrice(selectedProduct, 'jumbo') }
                                        ].filter(Boolean).map((v: any) => (
                                            <button
                                                key={v.key}
                                                onClick={() => setVariant(v.key)}
                                                className={`w-full py-4 px-6 flex justify-between items-center border transition-all rounded-none
                                                    ${variant === v.key ? 'border-[#000000] bg-[#000000] text-white' : 'border-[#000000] text-[#000000]'}`}
                                            >
                                                <span className="text-sm font-serif">{v.label}</span>
                                                <span className="text-sm font-serif">{v.final}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedProduct.options?.length > 0 && selectedProduct.options.map((opt: any, index: number) => (
                                <div key={index} className="pt-6 border-t border-[#E5E5E5]">
                                    <label className="block text-[10px] text-[#000000] uppercase tracking-[0.2em] mb-4">{opt.name} {opt.required ? '*' : ''}</label>
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
                                                    className={`flex items-center p-4 border cursor-pointer transition-all ${isSelected ? 'border-[#000000] bg-[#000000] text-white' : 'border-[#E5E5E5] text-[#000000]'}`}
                                                >
                                                    <div className="flex items-center gap-4 w-full">
                                                        <div className={`w-3 h-3 shrink-0 border flex items-center justify-center ${isSelected ? 'border-white' : 'border-[#000000]'}`}>
                                                            {isSelected && <div className="w-1.5 h-1.5 shrink-0 bg-white" />}
                                                        </div>
                                                        {(choice.image_url || choice.image_name) && (
                                                            <div className="w-10 h-10 shrink-0 bg-[#E5E5E5] overflow-hidden">
                                                                <img src={choice.image_url?.startsWith('http') ? choice.image_url : choice.image_name?.startsWith('http') ? choice.image_name : getMenuUrl(choice.image_name)} className="w-full h-full object-cover grayscale" />
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-serif">{choice.name}</span>
                                                        {Number(choice.price || 0) > 0 && (
                                                            <span className={`ml-auto shrink-0 text-xs ${isSelected ? 'text-white' : 'text-[#000000]'}`}>+{Number(choice.price || 0)}</span>
                                                        )}
                                                    </div>
                                                    <input type={opt.type === 'single' ? 'radio' : 'checkbox'} className="hidden" checked={isSelected || false} readOnly />
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="pt-6 border-t border-[#E5E5E5]">
                                <label className="block text-[10px] text-[#9CA3AF] uppercase tracking-[0.2em] mb-4">Notes</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Requests..."
                                    className="w-full p-4 border border-[#000000] bg-transparent outline-none text-sm transition-colors h-28 resize-none font-serif italic text-[#000000]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 w-full p-6 bg-[#FAFAFA] border-t border-[#E5E5E5] grid grid-cols-2 gap-4 z-30">
                        <button onClick={() => handleAdd(true)} className="py-4 border border-[#000000] text-[#000000] text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-[#000000] hover:text-white transition-colors">To Cart</button>
                        <button onClick={() => handleAdd(false)} className="py-4 bg-[#000000] text-white text-[10px] uppercase font-bold tracking-[0.2em] hover:opacity-80 transition-opacity">Order</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET (Omakase Ink) --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end md:items-center xl:items-end justify-center bg-black/60 backdrop-blur-sm animate-ink">
                 <div className="w-full max-w-md md:max-w-xl xl:max-w-md bg-[#FAFAFA] h-[90vh] md:h-[80vh] xl:h-[90vh] md:rounded-2xl xl:rounded-none xl:rounded-t-3xl flex flex-col shadow-2xl mx-auto rounded-t-3xl overflow-hidden relative">
                     <div className="p-8 border-b border-[#000000] flex justify-between items-center">
                        <h2 className="text-2xl font-light font-serif">Selection</h2>
                        <button onClick={() => setActiveTab('menu')} className="w-10 h-10 border border-[#000000] flex items-center justify-center hover:bg-[#000000] hover:text-white transition-colors"><Icon name="x" size={18}/></button>
                     </div>
                     <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 no-scrollbar pb-32">
                         {cart.map((item: any, idx: any) => {
                            const finalPriceTotal = item.price * item.quantity;

                             return (
                             <div key={idx} className="flex gap-6 border-b border-[#E5E5E5] pb-6 last:border-0">
                                 <div className="w-20 h-24 bg-[#E5E5E5] shrink-0 overflow-hidden"><img src={item.image_url} className="w-full h-full object-cover grayscale" /></div>
                                 <div className="flex-1 min-w-0 flex flex-col justify-center">
                                     <div className="flex justify-between items-start mb-2">
                                         <span className="text-base font-serif pr-4 leading-tight">{item.name} <span className="text-xs text-[#9CA3AF] ml-2">x{item.quantity}</span></span>
                                         <span className="text-base font-serif">{finalPriceTotal}</span>
                                     </div>
                                     <div className="text-xs text-[#121212] italic font-serif leading-relaxed opacity-80">{item.note}</div>
                                     <div className="mt-4">
                                         <button onClick={() => updateQuantity(idx, -1)} className="text-[10px] uppercase tracking-[0.2em] border-b border-[#000000] pb-1 hover:text-red-700 hover:border-red-700 transition-colors">Remove</button>
                                     </div>
                                 </div>
                             </div>
                         )})}
                         {cart.length === 0 && <div className="text-center py-32 text-sm text-[#9CA3AF] italic font-serif">The selection is empty.</div>}
                     </div>
                     <div className="p-8 bg-[#000000] text-white shrink-0">
                         <div className="flex justify-between items-end mb-8"><span className="text-[10px] uppercase tracking-[0.2em]">Total</span><span className="text-4xl font-light font-serif">{cartTotal}</span></div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} disabled={cart.length === 0} className="w-full py-4 border border-white text-white bg-transparent hover:bg-white hover:text-[#000000] transition-colors text-[10px] font-bold uppercase tracking-[0.2em] disabled:opacity-50">Confirm</button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION --- */}
        {showConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-ink">
                <div className="bg-[#FAFAFA] p-10 text-center border border-[#000000] max-w-sm w-full relative">
                    <h3 className="text-2xl font-serif mb-6 text-[#000000]">Finalize Order</h3>
                    <p className="text-sm italic font-serif text-[#121212] mb-10">Shall we proceed to the kitchen?</p>
                    <div className="flex flex-col gap-4">
                        <button onClick={onCheckoutClick} className="w-full py-4 bg-[#000000] text-white text-[10px] uppercase tracking-[0.2em] border border-[#000000] hover:bg-transparent hover:text-[#000000] transition-colors">Yes, Proceed</button>
                        <button onClick={() => setShowConfirm(false)} className="w-full py-4 text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF] hover:text-[#000000] transition-colors">Return</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}
