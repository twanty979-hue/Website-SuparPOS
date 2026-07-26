import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons (Vegan Botanica Style) ---
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
    leaf: <path d="M12 2C7 2 3 7 3 12c0 2.21.78 4.24 2.08 5.82L3 20l2.18-2.08C6.76 19.22 8.79 20 11 20c5 0 9-4 9-9 0-4.5-3.5-8-8-8zm-1 14h-2v-4H7v-2h2V8h2v2h2v2h-2v4z"/> // Just an example stylized leaf logic
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

  if (loading && !isVerified) return <div className="min-h-screen bg-[#EFF5F0] flex items-center justify-center text-[#2D5936] font-serif text-xl tracking-widest">LOADING</div>;

  return (
    <div className="w-full max-w-md md:max-w-xl xl:max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden bg-[#EFF5F0] font-sans text-[#2D5936]">

        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Sarabun:wght@300;400;500;600&display=swap');

            :root {
                --primary: #2D5936;
                --secondary: #4F7959;
                --bg-main: #EFF5F0;
                --border-color: #C8DBCB;
                --card-bg: #FFFFFF;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg-main);
                -webkit-tap-highlight-color: transparent;
                color: var(--primary);
                letter-spacing: 0.02em;
            }

            .font-head { font-family: 'Cormorant Garamond', serif; }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade { animation: fadeIn 0.4s ease-out forwards; }
            
            .botanical-border {
                border: 1px solid var(--border-color);
                box-shadow: 0 0 0 3px var(--bg-main), 0 0 0 4px var(--border-color);
            }
        `}} />

        <header className="bg-[#EFF5F0]/90 backdrop-blur-md pt-12 pb-6 px-6 sticky top-0 z-50 border-b border-[#C8DBCB]">
             <div className="flex justify-between items-center">
                 <div>
                     <p className="text-[#4F7959] text-[10px] font-medium tracking-[0.2em] font-head uppercase mb-1">Specimen {tableLabel}</p>
                     <h1 className="text-3xl font-semibold tracking-tight text-[#2D5936] font-head italic">{brand?.name || "Vegan Botanica"}</h1>
                 </div>
                 <div className="w-12 h-12 border border-[#C8DBCB] bg-white rounded-full flex items-center justify-center text-[#2D5936] shadow-sm">
                     <Icon name="shop" size={20} />
                 </div>
             </div>
        </header>

        <main className="px-6 pb-24 relative z-20">
            {activeTab === 'home' && (
                <section className="animate-fade pt-6">
                    {banners?.length > 0 && (
                        <div className="relative w-full aspect-[2/1] bg-white rounded-xl overflow-hidden mb-8 border border-[#C8DBCB] shadow-sm p-1">
                             <div className="w-full h-full rounded-lg overflow-hidden relative">
                                 <img src={getBannerUrl(banners[currentBannerIndex].image_name)} className="w-full h-full object-cover" />
                             </div>
                        </div>
                    )}
                    <div className="flex justify-between items-end mb-6 border-b border-[#C8DBCB] pb-3">
                         <h2 className="text-2xl italic font-medium text-[#2D5936] font-head">Botanical Selections</h2>
                         <button onClick={() => setActiveTab('menu')} className="text-[#4F7959] text-xs flex items-center gap-1 hover:text-[#2D5936] transition-colors pb-1">
                             Explore <Icon name="chevronRight" size={14} />
                         </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-x-5 gap-y-8">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="cursor-pointer group flex flex-col items-center text-center" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full aspect-square overflow-hidden bg-white mb-4 relative rounded-t-full p-2 border border-[#C8DBCB] shadow-sm transition-all group-hover:shadow-md">
                                         <div className="w-full h-full rounded-t-full overflow-hidden relative bg-[#F8FAF8]">
                                             <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                             {pricing.discount > 0 && (
                                                <div className="absolute top-2 right-2 bg-[#2D5936] text-white text-[10px] px-2 py-1 rounded-full font-serif">
                                                    -{pricing.discount}
                                                </div>
                                             )}
                                         </div>
                                     </div>
                                     <h3 className="font-medium text-[#2D5936] text-sm mb-1 leading-snug font-head text-lg px-2">{p.name}</h3>
                                     <div className="flex items-baseline gap-2 justify-center">
                                         <span className="text-[#2D5936] font-medium text-lg font-head">{pricing.final}</span>
                                         {pricing.discount > 0 && (
                                             <span className="text-xs text-[#4F7959] line-through font-head">
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
                    <div className="relative mb-8 bg-white rounded-full shadow-sm border border-[#C8DBCB] p-1">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Icon name="search" className="text-[#4F7959]" size={18} /></div>
                         <input type="text" placeholder="Search the garden..." value={state?.searchTerm} onChange={(e) => actions?.setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-transparent outline-none text-sm text-[#2D5936] placeholder-[#8BA892] transition-colors rounded-full font-serif italic" />
                    </div>
                    <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)}
                                    className={`shrink-0 px-5 py-2 rounded-full text-sm font-head transition-all border
                                    ${selectedCategoryId === c.id ? 'bg-[#2D5936] border-[#2D5936] text-white shadow-md' : 'bg-white border-[#C8DBCB] text-[#4F7959] hover:bg-[#F8FAF8]'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-5 pb-20">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="flex gap-4 cursor-pointer p-3 bg-white border border-[#C8DBCB] rounded-xl shadow-sm transition-all hover:shadow-md" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-24 h-24 bg-[#F8FAF8] overflow-hidden shrink-0 rounded-lg p-1 border border-[#E9F0EA]">
                                         <div className="w-full h-full rounded-md overflow-hidden relative">
                                            <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover" />
                                         </div>
                                     </div>
                                     <div className="flex-1 flex flex-col justify-center py-1">
                                         <h3 className="font-medium text-[#2D5936] text-lg mb-1 font-head leading-tight">{p.name}</h3>
                                         <div className="flex items-center gap-2 mt-auto">
                                             <span className="text-[#2D5936] font-semibold font-head text-lg">{pricing.final}.-</span>
                                             {pricing.discount > 0 && <span className="text-xs text-[#4F7959] line-through font-head">{pricing.original}</span>}
                                         </div>
                                     </div>
                                     <div className="flex items-center pr-2">
                                         <div className="w-8 h-8 rounded-full border border-[#2D5936] bg-[#F8FAF8] flex items-center justify-center text-[#2D5936] transition-colors">
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
                    <h2 className="text-3xl font-head italic text-[#2D5936] mb-8 border-b border-[#C8DBCB] pb-4">Cultivation Status</h2>

                    <div className="space-y-6">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="border border-[#C8DBCB] p-6 bg-white rounded-2xl shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-[#2D5936] opacity-80"></div>
                                <div className="flex justify-between items-start mb-6 pl-2">
                                     <div>
                                         <span className="text-[10px] text-[#4F7959] uppercase tracking-widest block mb-1 font-head">Specimen ID</span>
                                         <span className="text-lg font-head font-medium text-[#2D5936]">#{o.id.slice(-4)}</span>
                                     </div>
                                     <div className={`px-4 py-1.5 text-xs font-head italic tracking-wide border rounded-full
                                        ${o.status === 'pending' ? 'border-[#C8DBCB] text-[#4F7959] bg-[#EFF5F0]' : 'border-[#2D5936] text-[#2D5936] bg-[#E0ECE2] font-semibold'}`}>
                                         {o.status === 'pending' ? 'Sprouting' : 'Blooming'}
                                     </div>
                                </div>

                                <div className="space-y-4 mb-6 pl-2">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#4F7959]">
                                            <div className="flex gap-3">
                                                <span className="text-[#2D5936] font-semibold font-head text-lg w-6">{i.quantity}x</span>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-[#2D5936]">{i.product_name}</span>
                                                    {i.variant && i.variant !== 'normal' && <span className="text-xs text-[#4F7959] font-head italic mt-0.5">{i.variant}</span>}
                                                    {i.note && <span className="text-[10px] text-[#8BA892] italic mt-1 leading-snug">{i.note}</span>}
                                                </div>
                                            </div>
                                            <span className="font-head text-lg font-medium text-[#2D5936]">{i.price * i.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-[#E9F0EA] pl-2">
                                     <span className="text-xs text-[#4F7959] uppercase tracking-widest font-head">Harvest Total</span>
                                     <span className="font-medium text-2xl text-[#2D5936] font-head">
                                         {o.total_price || o.order_items.reduce((a: any, b: any) => a + (b.price * b.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-24 opacity-60">
                                <Icon name="leaf" size={48} className="mx-auto text-[#C8DBCB] mb-4" />
                                <p className="text-lg font-head italic text-[#4F7959]">The garden is currently empty</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        <nav className="fixed bottom-0 left-0 w-full h-[85px] bg-white border-t border-[#C8DBCB] flex justify-center items-center gap-12 z-[90] pb-2 shadow-[0_-10px_30px_rgba(45,89,54,0.05)]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-2 transition-colors ${activeTab === 'home' ? 'text-[#2D5936]' : 'text-[#8BA892]'}`}>
                 <Icon name="home" size={24} />
                 <span className="text-[10px] uppercase tracking-widest font-head">Garden</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-2 transition-colors ${activeTab === 'menu' ? 'text-[#2D5936]' : 'text-[#8BA892]'}`}>
                 <Icon name="menu" size={24} />
                 <span className="text-[10px] uppercase tracking-widest font-head">Flora</span>
             </button>

             <button onClick={() => setActiveTab('cart')} className={`flex flex-col items-center gap-2 transition-colors relative ${activeTab === 'cart' ? 'text-[#2D5936]' : 'text-[#8BA892]'}`}>
                 <div className="relative">
                     <Icon name="basket" size={24} />
                     {cart?.length > 0 && (
                         <span className="absolute -top-1.5 -right-2 bg-[#2D5936] text-white text-[9px] font-head font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                             {cart.length}
                         </span>
                     )}
                 </div>
                 <span className="text-[10px] uppercase tracking-widest font-head">Basket</span>
             </button>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-2 transition-colors ${activeTab === 'status' ? 'text-[#2D5936]' : 'text-[#8BA892]'}`}>
                 <Icon name="clock" size={24} />
                 <span className="text-[10px] uppercase tracking-widest font-head">Status</span>
             </button>
        </nav>

        {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center xl:items-end justify-center bg-[#1C1917]/40 backdrop-blur-sm animate-fade">
                <div onClick={() => setSelectedProduct(null)} className="absolute inset-0"></div>

                <div className="w-full max-w-md md:max-w-xl xl:max-w-md md:rounded-2xl xl:rounded-none xl:rounded-t-2xl bg-[#F8FAF8] shadow-2xl max-h-[90vh] md:max-h-[85vh] xl:max-h-[90vh] flex flex-col animate-fade rounded-t-2xl overflow-hidden relative border border-[#C8DBCB]">
                    <div className="absolute top-4 right-4 z-20">
                        <button onClick={() => setSelectedProduct(null)} className="w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-[#2D5936] hover:bg-[#2D5936] hover:text-white transition-colors shadow-md border border-[#C8DBCB]">
                            <Icon name="x" size={18} />
                        </button>
                    </div>

                    <div className="relative h-56 sm:h-64 md:h-52 xl:h-64 shrink-0 bg-white p-2">
                        <div className="w-full h-full rounded-t-xl overflow-hidden botanical-border">
                            <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="p-6 md:p-8 pb-6 overflow-y-auto bg-white flex-1 no-scrollbar border-t border-[#C8DBCB]">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-medium text-[#2D5936] mb-3 font-head italic">{selectedProduct.name}</h2>
                            <div className="flex items-center justify-center gap-4">
                                <span className="text-4xl font-medium font-head text-[#2D5936]">{basePriceObj.final}.-</span>
                                {basePriceObj.discount > 0 && (
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm text-[#4F7959] line-through font-head">{basePriceObj.original}</span>
                                        <span className="text-[10px] text-white bg-[#2D5936] px-2 py-0.5 rounded font-serif italic">SAVE {basePriceObj.discount}</span>
                                    </div>
                                )}
                            </div>
                            {selectedProduct.description && (
                                <p className="text-sm text-[#4F7959] mt-4 leading-relaxed max-w-sm mx-auto">{selectedProduct.description}</p>
                            )}
                        </div>

                        <div className="space-y-8">
                            {(selectedProduct.price_special || selectedProduct.price_jumbo) && (
                                <div>
                                    <label className="block text-sm text-[#4F7959] font-head italic mb-3 text-center border-b border-[#E9F0EA] pb-2">Specimen Size</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { key: 'normal', label: 'Regular', ...calculatePrice(selectedProduct, 'normal') },
                                            selectedProduct.price_special && { key: 'special', label: 'Large', ...calculatePrice(selectedProduct, 'special') },
                                            selectedProduct.price_jumbo && { key: 'jumbo', label: 'Grand', ...calculatePrice(selectedProduct, 'jumbo') }
                                        ].filter(Boolean).map((v: any) => (
                                            <button
                                                key={v.key}
                                                onClick={() => setVariant(v.key)}
                                                className={`w-full py-4 px-5 flex justify-between items-center border transition-all rounded-xl font-head text-lg
                                                    ${variant === v.key ? 'border-[#2D5936] bg-[#EFF5F0] text-[#2D5936] shadow-sm' : 'border-[#C8DBCB] text-[#4F7959] hover:bg-[#F8FAF8]'}`}
                                            >
                                                <span>{v.label}</span>
                                                <span className="font-semibold">{v.final}.-</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedProduct.options?.length > 0 && selectedProduct.options.map((opt: any, index: number) => (
                                <div key={index} className="pt-2">
                                    <label className="block text-sm text-[#4F7959] font-head italic mb-3 text-center border-b border-[#E9F0EA] pb-2">{opt.name}</label>
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
                                                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all active:scale-[0.99] bg-white ${isSelected ? 'border-[#2D5936] ring-1 ring-[#2D5936] shadow-sm' : 'border-[#C8DBCB] hover:border-[#8BA892]'}`}
                                                >
                                                    <div className="flex items-center gap-4 w-full pl-1">
                                                        <div className={`w-5 h-5 shrink-0 border flex items-center justify-center ${isSelected ? 'border-[#2D5936]' : 'border-[#C8DBCB]'} ${opt.type === 'single' ? 'rounded-full' : 'rounded-sm'}`}>
                                                            {isSelected && <div className={`w-3 h-3 shrink-0 bg-[#2D5936] ${opt.type === 'single' ? 'rounded-full' : ''}`} />}
                                                        </div>
                                                        {(choice.image_url || choice.image_name) && (
                                                            <div className="w-12 h-12 shrink-0 bg-[#F8FAF8] rounded-full overflow-hidden border border-[#C8DBCB] p-0.5">
                                                                <div className="w-full h-full rounded-full overflow-hidden relative">
                                                                    <img src={choice.image_url?.startsWith('http') ? choice.image_url : choice.image_name?.startsWith('http') ? choice.image_name : getMenuUrl(choice.image_name)} className="w-full h-full object-cover" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <span className="text-base font-head font-medium text-[#2D5936]">{choice.name}</span>
                                                        {Number(choice.price || 0) > 0 && (
                                                            <span className="ml-auto shrink-0 text-sm font-head font-semibold text-[#4F7959]">+{Number(choice.price || 0)}.-</span>
                                                        )}
                                                    </div>
                                                    <input type={opt.type === 'single' ? 'radio' : 'checkbox'} className="hidden" checked={isSelected || false} readOnly />
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}

                            <div className="pt-2">
                                <label className="block text-sm text-[#4F7959] font-head italic mb-3 text-center border-b border-[#E9F0EA] pb-2">Additional Field Notes</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Any special requests for the botanist..."
                                    className="w-full p-4 border border-[#C8DBCB] rounded-xl focus:border-[#2D5936] focus:ring-1 focus:ring-[#2D5936] outline-none text-sm transition-all bg-[#F8FAF8] h-28 resize-none mb-4 font-serif"
                                />
                            </div>
                        </div>

                        <div className="h-4" />
                    </div>

                    <div className="shrink-0 w-full p-5 md:p-6 bg-[#EFF5F0] border-t border-[#C8DBCB] grid grid-cols-2 gap-4 z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
                        <button onClick={() => handleAdd(true)} className="py-4 border-2 border-[#2D5936] text-[#2D5936] rounded-xl text-sm font-head font-bold uppercase tracking-widest hover:bg-[#E0ECE2] transition-colors bg-white">Add to Basket</button>
                        <button onClick={() => handleAdd(false)} className="py-4 bg-[#2D5936] text-white rounded-xl text-sm font-head font-bold uppercase tracking-widest shadow-lg shadow-[#2D5936]/20 active:scale-[0.98] transition-transform">Pluck Now</button>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'cart' && (
             <div className="fixed inset-0 z-[100] flex items-end bg-[#1C1917]/40 backdrop-blur-sm animate-fade">
                 <div className="w-full max-w-md md:max-w-xl xl:max-w-md bg-[#EFF5F0] h-[90vh] md:h-[80vh] xl:h-[90vh] md:rounded-2xl xl:rounded-none xl:rounded-t-2xl flex flex-col shadow-2xl mx-auto rounded-t-2xl overflow-hidden border border-[#C8DBCB]">
                     <div className="p-8 border-b border-[#C8DBCB] flex justify-between items-center bg-white">
                        <h2 className="text-3xl font-head italic text-[#2D5936]">Your Basket</h2>
                        <button onClick={() => setActiveTab('menu')} className="w-8 h-8 rounded-full border border-[#C8DBCB] flex items-center justify-center text-[#4F7959] hover:text-[#2D5936] hover:bg-[#F8FAF8] transition-colors"><Icon name="x" size={16}/></button>
                     </div>
                     <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar pb-32 bg-white">
                         {cart.map((item: any, idx: any) => {
                            const finalPriceTotal = item.price * item.quantity;
                            const originalPriceTotal = (item.original_price || item.price) * item.quantity;
                            const hasDiscount = originalPriceTotal > finalPriceTotal;

                             return (
                             <div key={idx} className="flex gap-4 p-4 border border-[#E9F0EA] rounded-xl bg-[#F8FAF8] shadow-sm">
                                 <div className="w-16 h-16 bg-white border border-[#C8DBCB] rounded-full shrink-0 overflow-hidden p-1">
                                    <div className="w-full h-full rounded-full overflow-hidden relative">
                                        <img src={item.image_url} className="w-full h-full object-cover" />
                                    </div>
                                 </div>
                                 <div className="flex-1 min-w-0 flex flex-col justify-center">
                                     <div className="flex justify-between items-start">
                                         <span className="text-lg font-head font-medium text-[#2D5936] pr-4 leading-tight">{item.name} <span className="text-sm text-[#4F7959]">x{item.quantity}</span></span>
                                         <span className="text-xl font-head font-semibold text-[#2D5936]">{finalPriceTotal}.-</span>
                                     </div>
                                     <div className="text-xs text-[#8BA892] mt-1 italic leading-snug font-serif">{item.note}</div>
                                     <div className="mt-2">
                                         <button onClick={() => updateQuantity(idx, -1)} className="text-xs text-[#d97757] hover:text-[#c45a38] font-head font-medium uppercase tracking-wide">Discard</button>
                                     </div>
                                 </div>
                             </div>
                         )})}
                         {cart.length === 0 && (
                            <div className="text-center py-20">
                                <Icon name="basket" size={48} className="mx-auto text-[#C8DBCB] mb-4" />
                                <p className="text-xl font-head italic text-[#4F7959]">Your basket is empty</p>
                            </div>
                         )}
                     </div>
                     <div className="p-8 bg-white border-t border-[#C8DBCB] shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                         <div className="flex justify-between items-end mb-6 border-b border-[#E9F0EA] pb-4">
                            <span className="text-sm text-[#4F7959] font-head uppercase tracking-widest">Total Harvest</span>
                            <span className="text-4xl font-semibold font-head text-[#2D5936]">{cartTotal}.-</span>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} disabled={cart.length === 0} className="w-full py-4 bg-[#2D5936] text-white text-sm font-head font-bold uppercase tracking-widest rounded-xl disabled:opacity-50 shadow-lg shadow-[#2D5936]/20 transition-all hover:bg-[#204026] active:scale-[0.98]">Confirm Harvest</button>
                     </div>
                 </div>
             </div>
        )}

        {showConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1C1917]/50 backdrop-blur-sm p-6 animate-fade">
                <div className="bg-white p-8 text-center border-4 border-double border-[#C8DBCB] rounded-xl max-w-sm w-full shadow-2xl">
                    <div className="mb-6 flex justify-center text-[#2D5936]"><div className="w-16 h-16 rounded-full bg-[#EFF5F0] flex items-center justify-center border border-[#C8DBCB]"><Icon name="check" size={32} /></div></div>
                    <h3 className="text-3xl font-head italic text-[#2D5936] mb-2">Seal Request?</h3>
                    <p className="text-[#4F7959] text-sm mb-8 font-serif">Your botanical selection is ready for preparation.</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={onCheckoutClick} className="w-full py-4 bg-[#2D5936] text-white text-sm uppercase font-head font-bold tracking-widest rounded-xl shadow-md">Confirm</button>
                        <button onClick={() => setShowConfirm(false)} className="w-full py-4 text-sm uppercase text-[#4F7959] font-head font-bold tracking-widest border border-[#C8DBCB] rounded-xl hover:bg-[#F8FAF8]">Cancel</button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}
