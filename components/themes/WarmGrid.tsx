import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons (Architectural / Grid Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    shop: (
      <>
        <rect x="3" y="8" width="18" height="12" rx="1" />
        <path d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
        <line x1="8" y1="20" x2="8" y2="15" />
        <line x1="16" y1="20" x2="16" y2="15" />
      </>
    ),
    home: (
      <>
        <polygon points="12 3 22 10 2 10 12 3" />
        <rect x="4" y="10" width="16" height="11" />
      </>
    ),
    menu: (
      <>
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </>
    ),
    basket: (
      <>
        <polyline points="3 6 5 6 7 19 18 19 20 6 22 6" />
        <line x1="10" y1="10" x2="10" y2="15" />
        <line x1="15" y1="10" x2="15" y2="15" />
      </>
    ),
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
    trash: (
      <>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </>
    ),
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

  if (loading && !isVerified) return <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center text-[#2D2B2A] font-light text-xl tracking-widest border-[4px] border-[#D7D3C9]">LOADING</div>;

  return (
    <div className="w-full max-w-md md:max-w-xl xl:max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden bg-[#F8F6F0] font-mono text-[#2D2B2A] border-l border-r border-[#D7D3C9]">

        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=IBM+Plex+Sans+Thai:wght@300;400;500;600&display=swap');

            :root {
                --primary: #2D2B2A; 
                --secondary: #7A7571; 
                --bg-main: #F8F6F0; 
                --border-color: #D7D3C9; 
            }

            body {
                font-family: 'IBM Plex Sans Thai', sans-serif;
                background-color: var(--bg-main);
                -webkit-tap-highlight-color: transparent;
                color: var(--primary);
                letter-spacing: 0.01em;
            }

            .font-head { font-family: 'JetBrains Mono', monospace; }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            .grid-bg {
                background-image: 
                    linear-gradient(to right, var(--border-color) 1px, transparent 1px),
                    linear-gradient(to bottom, var(--border-color) 1px, transparent 1px);
                background-size: 24px 24px;
            }

            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade { animation: fadeIn 0.3s ease-out forwards; }
        `}} />

        <header className="bg-[#F8F6F0] pt-12 pb-6 px-6 sticky top-0 z-50 border-b-2 border-[#2D2B2A]">
             <div className="flex justify-between items-end">
                 <div>
                     <p className="text-[#7A7571] text-xs font-semibold tracking-wider font-head uppercase mb-1">TBL {tableLabel}</p>
                     <h1 className="text-2xl font-bold tracking-tight text-[#2D2B2A] font-head uppercase">{brand?.name || "WARM GRID"}</h1>
                 </div>
                 <div className="w-10 h-10 border-2 border-[#2D2B2A] bg-white flex items-center justify-center text-[#2D2B2A] shadow-[2px_2px_0px_0px_rgba(45,43,42,1)]">
                     <Icon name="shop" size={18} />
                 </div>
             </div>
        </header>

        <main className="relative z-20 min-h-screen">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none z-[-1]" />
            
            {activeTab === 'home' && (
                <section className="animate-fade pt-6 px-6">
                    {banners?.length > 0 && (
                        <div className="relative w-full aspect-[2/1] bg-[#D7D3C9] border-2 border-[#2D2B2A] mb-8 shadow-[4px_4px_0px_0px_rgba(45,43,42,1)]">
                             <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover grayscale-[20%]" />
                             <div className="absolute top-2 left-2 bg-white border border-[#2D2B2A] px-2 py-1 text-[10px] font-head font-bold shadow-[2px_2px_0px_0px_rgba(45,43,42,1)]">PROMO</div>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-end mb-6 border-b-2 border-[#2D2B2A] pb-2">
                         <h2 className="text-lg font-bold text-[#2D2B2A] font-head uppercase">Features</h2>
                         <button onClick={() => setActiveTab('menu')} className="text-[#2D2B2A] text-xs font-bold flex items-center gap-1 hover:underline">
                             ALL <Icon name="chevronRight" size={14} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-12">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="cursor-pointer group border-2 border-[#2D2B2A] bg-white p-2 flex flex-col hover:shadow-[4px_4px_0px_0px_rgba(45,43,42,1)] transition-shadow" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full aspect-square overflow-hidden bg-[#F8F6F0] mb-3 border border-[#D7D3C9] relative">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-0 right-0 bg-[#2D2B2A] text-[#F8F6F0] text-[10px] px-2 py-1 font-head font-bold border-l border-b border-[#2D2B2A]">
                                                -{pricing.discount}
                                            </div>
                                         )}
                                     </div>
                                     <h3 className="font-semibold text-[#2D2B2A] text-sm mb-1 leading-tight flex-1">{p.name}</h3>
                                     <div className="flex items-center gap-2 mt-auto pt-2 border-t border-[#D7D3C9]">
                                         <span className="text-[#2D2B2A] font-bold text-base font-head">{pricing.final}</span>
                                         {pricing.discount > 0 && (
                                             <span className="text-xs text-[#7A7571] line-through font-head">
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
                <section className="animate-fade pt-6 px-6">
                    <div className="relative mb-6">
                         <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Icon name="search" className="text-[#2D2B2A]" size={18} /></div>
                         <input type="text" placeholder="QUERY..." value={state?.searchTerm} onChange={(e) => actions?.setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#2D2B2A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(45,43,42,1)] text-sm text-[#2D2B2A] placeholder-[#7A7571] font-head transition-shadow" />
                    </div>
                    
                    <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)}
                                    className={`shrink-0 px-4 py-2 text-xs font-bold font-head uppercase transition-colors border-2 border-[#2D2B2A]
                                    ${selectedCategoryId === c.id ? 'bg-[#2D2B2A] text-[#F8F6F0] shadow-[2px_2px_0px_0px_rgba(45,43,42,1)]' : 'bg-white text-[#2D2B2A] hover:bg-[#F8F6F0]'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 pb-20">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="flex gap-4 cursor-pointer p-3 border-2 border-[#2D2B2A] bg-white hover:shadow-[4px_4px_0px_0px_rgba(45,43,42,1)] transition-shadow" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-24 h-24 bg-[#F8F6F0] overflow-hidden shrink-0 border border-[#D7D3C9]">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="flex-1 flex flex-col justify-between">
                                         <div>
                                            <h3 className="font-bold text-[#2D2B2A] text-sm leading-tight">{p.name}</h3>
                                            {p.description && <p className="text-[10px] text-[#7A7571] mt-1 line-clamp-1">{p.description}</p>}
                                         </div>
                                         <div className="flex items-center justify-between border-t border-[#D7D3C9] pt-2">
                                             <div className="flex items-center gap-2">
                                                 <span className="text-[#2D2B2A] font-bold font-head">{pricing.final}</span>
                                                 {pricing.discount > 0 && <span className="text-[10px] text-[#7A7571] line-through font-head">{pricing.original}</span>}
                                             </div>
                                             <div className="w-6 h-6 border-2 border-[#2D2B2A] bg-[#F8F6F0] flex items-center justify-center text-[#2D2B2A]">
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
                <section className="animate-fade pt-6 px-6 pb-24">
                    <h2 className="text-xl font-bold text-[#2D2B2A] mb-6 font-head border-b-2 border-[#2D2B2A] pb-2 uppercase">Log / Status</h2>

                    <div className="space-y-6">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="border-2 border-[#2D2B2A] bg-white p-4 shadow-[4px_4px_0px_0px_rgba(45,43,42,1)]">
                                <div className="flex justify-between items-center mb-4 border-b border-[#D7D3C9] pb-3">
                                     <div>
                                         <span className="text-[10px] text-[#7A7571] uppercase font-head block mb-0.5">ID: {o.id.slice(-8)}</span>
                                     </div>
                                     <div className={`px-2 py-1 text-[10px] font-bold uppercase font-head border-2
                                        ${o.status === 'pending' ? 'border-[#2D2B2A] text-[#2D2B2A] bg-[#F8F6F0]' : 'border-[#2D2B2A] text-[#F8F6F0] bg-[#2D2B2A]'}`}>
                                         {o.status === 'pending' ? 'WAITING' : 'COOKING'}
                                     </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#2D2B2A] items-start">
                                            <div className="flex gap-2">
                                                <span className="font-head font-bold w-6">{i.quantity}x</span>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{i.product_name}</span>
                                                    {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-[#7A7571] uppercase mt-0.5">[{i.variant}]</span>}
                                                    {i.note && <span className="text-[10px] text-[#7A7571] mt-0.5">Note: {i.note}</span>}
                                                </div>
                                            </div>
                                            <span className="font-head">{i.price * i.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t-2 border-[#2D2B2A] bg-[#F8F6F0] -mx-4 px-4 -mb-4 pb-4 mt-4">
                                     <span className="text-xs font-bold uppercase font-head">Total</span>
                                     <span className="font-bold text-lg font-head">
                                         {o.total_price || o.order_items.reduce((a: any, b: any) => a + (b.price * b.quantity), 0)}
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-20 border-2 border-dashed border-[#D7D3C9] bg-white">
                                <p className="text-sm font-head font-bold text-[#7A7571] uppercase">No Logs</p>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </main>

        <nav className="fixed bottom-0 left-0 w-full h-[70px] bg-white border-t-2 border-[#2D2B2A] flex justify-around items-center z-[90] md:max-w-xl xl:max-w-md mx-auto md:left-1/2 md:-translate-x-1/2">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center justify-center w-full h-full border-r-2 border-[#2D2B2A] transition-colors ${activeTab === 'home' ? 'bg-[#2D2B2A] text-[#F8F6F0]' : 'text-[#2D2B2A] hover:bg-[#F8F6F0]'}`}>
                 <Icon name="home" size={20} />
                 <span className="text-[10px] uppercase font-head font-bold mt-1">Home</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center justify-center w-full h-full border-r-2 border-[#2D2B2A] transition-colors ${activeTab === 'menu' ? 'bg-[#2D2B2A] text-[#F8F6F0]' : 'text-[#2D2B2A] hover:bg-[#F8F6F0]'}`}>
                 <Icon name="menu" size={20} />
                 <span className="text-[10px] uppercase font-head font-bold mt-1">Menu</span>
             </button>

             <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center justify-center w-full h-full border-r-2 border-[#2D2B2A] transition-colors relative ${activeTab === 'cart' ? 'bg-[#2D2B2A] text-[#F8F6F0]' : 'text-[#2D2B2A] hover:bg-[#F8F6F0]'}`}>
                 <div className="relative">
                     <Icon name="basket" size={20} />
                     {cart?.length > 0 && (
                         <span className={`absolute -top-2 -right-2 text-[10px] w-5 h-5 border-2 border-[#2D2B2A] flex items-center justify-center font-bold font-head ${activeTab === 'cart' ? 'bg-white text-[#2D2B2A]' : 'bg-[#2D2B2A] text-white'}`}>
                             {cart.length}
                         </span>
                     )}
                 </div>
                 <span className="text-[10px] uppercase font-head font-bold mt-1">Cart</span>
             </button>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'status' ? 'bg-[#2D2B2A] text-[#F8F6F0]' : 'text-[#2D2B2A] hover:bg-[#F8F6F0]'}`}>
                 <Icon name="clock" size={20} />
                 <span className="text-[10px] uppercase font-head font-bold mt-1">Status</span>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL --- */}
        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center xl:items-end justify-center bg-[#2D2B2A]/40 backdrop-blur-sm animate-fade">
                <div onClick={() => setSelectedProduct(null)} className="absolute inset-0"></div>

                <div className="w-full max-w-md md:max-w-xl xl:max-w-md md:rounded-xl xl:rounded-none xl:rounded-t-xl bg-white shadow-[0_-8px_0_0_rgba(45,43,42,1)] border-t-2 md:border-2 border-[#2D2B2A] max-h-[90vh] md:max-h-[85vh] xl:max-h-[90vh] flex flex-col animate-fade rounded-t-xl overflow-hidden relative">
                    <div className="absolute top-4 right-4 z-20">
                        <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 bg-white border-2 border-[#2D2B2A] flex items-center justify-center text-[#2D2B2A] hover:bg-[#2D2B2A] hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(45,43,42,1)]">
                            <Icon name="x" size={18} />
                        </button>
                    </div>

                    <div className="relative h-56 sm:h-64 md:h-52 xl:h-64 shrink-0 bg-[#F8F6F0] border-b-2 border-[#2D2B2A]">
                        <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
                    </div>

                    <div className="p-6 overflow-y-auto bg-white flex-1 no-scrollbar relative">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#2D2B2A] mb-2 font-head uppercase">{selectedProduct.name}</h2>
                            <div className="flex items-baseline gap-3">
                                <span className="text-2xl font-bold font-head text-[#2D2B2A]">{basePriceObj.final}</span>
                                {basePriceObj.discount > 0 && (
                                    <>
                                        <span className="text-sm text-[#7A7571] line-through font-head">{basePriceObj.original}</span>
                                        <span className="text-[10px] font-bold text-white bg-[#2D2B2A] px-2 py-0.5 border-2 border-[#2D2B2A] font-head">SAVE {basePriceObj.discount}</span>
                                    </>
                                )}
                            </div>
                            {selectedProduct.description && (
                                <p className="text-sm text-[#7A7571] mt-3 leading-relaxed border-l-2 border-[#D7D3C9] pl-3">{selectedProduct.description}</p>
                            )}
                        </div>

                        <div className="space-y-6">
                            {(selectedProduct.price_special || selectedProduct.price_jumbo) && (
                                <div>
                                    <label className="block text-[10px] font-bold text-[#2D2B2A] font-head uppercase tracking-widest mb-3 border-b border-[#D7D3C9] pb-1">Size Specification</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { key: 'normal', label: 'NORMAL', ...calculatePrice(selectedProduct, 'normal') },
                                            selectedProduct.price_special && { key: 'special', label: 'SPECIAL', ...calculatePrice(selectedProduct, 'special') },
                                            selectedProduct.price_jumbo && { key: 'jumbo', label: 'JUMBO', ...calculatePrice(selectedProduct, 'jumbo') }
                                        ].filter(Boolean).map((v: any) => (
                                            <button
                                                key={v.key}
                                                onClick={() => setVariant(v.key)}
                                                className={`w-full py-3 px-4 flex justify-between items-center border-2 transition-all
                                                    ${variant === v.key ? 'border-[#2D2B2A] bg-[#F8F6F0] shadow-[2px_2px_0px_0px_rgba(45,43,42,1)]' : 'border-[#D7D3C9] text-[#7A7571] bg-white hover:border-[#2D2B2A]'}`}
                                            >
                                                <span className="text-sm font-bold font-head">{v.label}</span>
                                                <span className="text-sm font-bold font-head">{v.final}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedProduct.options?.length > 0 && selectedProduct.options.map((opt: any, index: number) => (
                                <div key={index} className="pt-2">
                                    <label className="block text-[10px] font-bold text-[#2D2B2A] font-head uppercase tracking-widest mb-3 border-b border-[#D7D3C9] pb-1">
                                        {opt.name} {opt.required && <span className="text-[#2D2B2A]">*</span>}
                                    </label>
                                    <div className="flex flex-col gap-2">
                                        {opt.choices.map((choice: any, cIdx: number) => {
                                            const isSelected = selectedOptions[index]?.some(
                                                (item: any) => String(item.id || item.name) === String(choice.id || choice.name)
                                            );
                                            const hasImage = choice.image_url || choice.image_name;
                                            return (
                                                <label
                                                    key={cIdx}
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        handleOptionToggle(index, choice, opt.type);
                                                    }}
                                                    className={`flex items-center p-3 border-2 cursor-pointer transition-all ${isSelected ? 'border-[#2D2B2A] bg-[#F8F6F0] shadow-[2px_2px_0px_0px_rgba(45,43,42,1)]' : 'border-[#D7D3C9] bg-white hover:border-[#2D2B2A]'}`}
                                                >
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className={`w-4 h-4 shrink-0 border-2 flex items-center justify-center ${isSelected ? 'border-[#2D2B2A] bg-[#2D2B2A]' : 'border-[#D7D3C9] bg-white'} ${opt.type === 'single' ? 'rounded-full' : ''}`}>
                                                            {isSelected && <Icon name="check" size={10} className="text-white" />}
                                                        </div>
                                                        {hasImage && (
                                                            <div className="w-10 h-10 shrink-0 bg-[#F8F6F0] border border-[#D7D3C9]">
                                                                <img src={choice.image_url?.startsWith('http') ? choice.image_url : choice.image_name?.startsWith('http') ? choice.image_name : getMenuUrl(choice.image_name)} className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-semibold text-[#2D2B2A]">{choice.name}</span>
                                                        {Number(choice.price || 0) > 0 && (
                                                            <span className="ml-auto shrink-0 text-xs font-bold text-[#2D2B2A] font-head">+{Number(choice.price || 0)}</span>
                                                        )}
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="pt-2">
                                <label className="block text-[10px] font-bold text-[#2D2B2A] font-head uppercase tracking-widest mb-3 border-b border-[#D7D3C9] pb-1">Notes</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Any special requests?"
                                    className="w-full p-3 border-2 border-[#D7D3C9] focus:border-[#2D2B2A] outline-none text-sm bg-white font-mono h-24 resize-none mb-4 focus:shadow-[2px_2px_0px_0px_rgba(45,43,42,1)] transition-shadow"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 w-full p-4 bg-[#F8F6F0] border-t-2 border-[#2D2B2A] grid grid-cols-2 gap-3 z-30">
                        <button onClick={() => handleAdd(true)} className="py-3 bg-white border-2 border-[#2D2B2A] text-[#2D2B2A] text-[10px] uppercase font-bold tracking-widest font-head shadow-[2px_2px_0px_0px_rgba(45,43,42,1)] active:shadow-none active:translate-y-[2px] transition-all">Add to Cart</button>
                        <button onClick={() => handleAdd(false)} className="py-3 bg-[#2D2B2A] border-2 border-[#2D2B2A] text-white text-[10px] uppercase font-bold tracking-widest font-head shadow-[2px_2px_0px_0px_rgba(45,43,42,1)] active:shadow-none active:translate-y-[2px] transition-all">Order Now</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART SHEET --- */}
        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end md:items-center xl:items-end justify-center bg-[#2D2B2A]/40 backdrop-blur-sm animate-fade">
                 <div className="w-full max-w-md md:max-w-xl xl:max-w-md bg-white h-[90vh] md:h-[80vh] xl:h-[90vh] md:rounded-xl xl:rounded-none xl:rounded-t-xl flex flex-col border-t-2 md:border-2 border-[#2D2B2A] shadow-[0_-8px_0_0_rgba(45,43,42,1)] mx-auto rounded-t-xl overflow-hidden">
                     <div className="p-6 bg-[#F8F6F0] border-b-2 border-[#2D2B2A] flex justify-between items-center">
                        <h2 className="text-lg font-bold font-head uppercase text-[#2D2B2A]">Current Tray</h2>
                        <button onClick={() => setActiveTab('menu')} className="w-8 h-8 border-2 border-[#2D2B2A] bg-white flex items-center justify-center hover:bg-[#2D2B2A] hover:text-white shadow-[2px_2px_0px_0px_rgba(45,43,42,1)]"><Icon name="x" size={16}/></button>
                     </div>
                     <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar pb-32 relative">
                         <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
                         {cart.map((item: any, idx: any) => {
                            const finalPriceTotal = item.price * item.quantity;
                             return (
                             <div key={idx} className="flex gap-4 border-2 border-[#2D2B2A] p-3 bg-white relative z-10">
                                 <div className="w-16 h-16 bg-[#F8F6F0] shrink-0 border border-[#D7D3C9]"><img src={item.image_url} className="w-full h-full object-cover" /></div>
                                 <div className="flex-1 min-w-0 flex flex-col justify-between">
                                     <div className="flex justify-between items-start">
                                         <span className="text-sm font-bold font-head truncate pr-2 text-[#2D2B2A]">{item.name} <span className="text-[#7A7571]">x{item.quantity}</span></span>
                                         <span className="text-sm font-bold font-head text-[#2D2B2A]">{finalPriceTotal}</span>
                                     </div>
                                     <div className="text-[10px] text-[#7A7571] font-mono leading-tight truncate">{item.note || "-"}</div>
                                     <div className="flex gap-4 mt-2">
                                         <button onClick={() => updateQuantity(idx, -1)} className="text-[10px] font-bold font-head underline text-[#2D2B2A] hover:text-red-600 uppercase">Remove</button>
                                     </div>
                                 </div>
                             </div>
                         )})}
                         {cart.length === 0 && <div className="text-center py-20 border-2 border-dashed border-[#D7D3C9] bg-white text-[#7A7571] font-head font-bold uppercase relative z-10">Empty Tray</div>}
                     </div>
                     <div className="p-6 bg-white border-t-2 border-[#2D2B2A] shrink-0 relative z-20">
                         <div className="flex justify-between items-center mb-6"><span className="text-xs font-bold uppercase font-head">Total Amount</span><span className="text-2xl font-bold font-head text-[#2D2B2A]">{cartTotal}</span></div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} disabled={cart.length === 0} className="w-full py-4 bg-[#2D2B2A] text-white text-xs font-bold uppercase font-head shadow-[4px_4px_0px_0px_rgba(45,43,42,1)] disabled:opacity-50 disabled:shadow-none active:translate-y-[2px] active:shadow-none transition-all">Submit Order</button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION --- */}
        {showConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#2D2B2A]/40 backdrop-blur-sm p-6 animate-fade">
                <div className="bg-[#F8F6F0] p-6 text-center border-2 border-[#2D2B2A] max-w-xs w-full shadow-[8px_8px_0px_0px_rgba(45,43,42,1)]">
                    <div className="mb-4 flex justify-center text-[#2D2B2A]">
                        <div className="w-12 h-12 border-2 border-[#2D2B2A] bg-white flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(45,43,42,1)]">
                            <Icon name="check" size={24} />
                        </div>
                    </div>
                    <h3 className="text-lg font-bold font-head text-[#2D2B2A] mb-6 uppercase">Confirm Order?</h3>
                    <div className="flex flex-col gap-3">
                        <button onClick={onCheckoutClick} className="w-full py-3 bg-[#2D2B2A] text-white text-[10px] font-bold font-head uppercase shadow-[2px_2px_0px_0px_rgba(45,43,42,1)] active:translate-y-[2px] active:shadow-none transition-all">Yes, Place Order</button>
                        <button onClick={() => setShowConfirm(false)} className="w-full py-3 bg-white border-2 border-[#2D2B2A] text-[#2D2B2A] text-[10px] font-bold font-head uppercase shadow-[2px_2px_0px_0px_rgba(45,43,42,1)] active:translate-y-[2px] active:shadow-none transition-all">Cancel</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}
