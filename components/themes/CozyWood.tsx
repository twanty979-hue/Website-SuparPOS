import React, { useState, useEffect, useRef } from "react";

// --- 🛠️ Icons (Simple & Cozy Style) ---
const Icon = ({ name, size = 24, className = "" }: any) => {
  const icons = {
    // ใส่ <>...</> ครอบเสมอหากมีหลาย element
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
    spoon: <path d="M12 2a4 4 0 0 1 4 4v16H8V6a4 4 0 0 1 4-4Z"/>
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
      strokeWidth="2"
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


  if (loading && !isVerified) return <div className="min-h-screen bg-[#fffbeb] flex items-center justify-center text-[#92400e] font-bold text-xl">กำลังโหลดร้านค้า...</div>;

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

  const basePriceObj = selectedProduct
    ? calculatePrice(selectedProduct, variant)
    : { final: 0, original: 0, discount: 0 };

  const currentPriceObj = {
      ...basePriceObj,
      final: basePriceObj.final + toppingTotal,
      original: (basePriceObj.original_value || basePriceObj.original || basePriceObj.final + basePriceObj.discount) + toppingTotal,
  };

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
    const pricing = basePriceObj;

    const productToAdd = {
        ...selectedProduct,
        variant: variant,
        note: finalNote,
        specialRequest: finalNote,
        comment: finalNote,
        remark: finalNote,
        price: pricing.final + toppingTotal,
        original_price: (pricing.original_value || pricing.final + pricing.discount) + toppingTotal,
        toppings_snapshot: selectedToppings,
    };

    if (addToCartOnly) {
        for(let i=0; i<qty; i++) {
            handleAddToCart(productToAdd, variant, finalNote);
        }
        setSelectedProduct(null);
    } else {
        if (cart && cart.length > 0) setShowConfirm(true);
        else performCookNow();
    }
  };

  const performCookNow = () => {
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
    const pricing = basePriceObj;

    const productToAdd = {
        ...selectedProduct,
        variant: variant,
        note: finalNote,
        specialRequest: finalNote,
        comment: finalNote,
        remark: finalNote,
        price: pricing.final + toppingTotal,
        original_price: (pricing.original_value || pricing.final + pricing.discount) + toppingTotal,
        toppings_snapshot: selectedToppings,
    };

    for(let i=0; i<qty; i++) {
        handleAddToCart(productToAdd, variant, finalNote);
    }
    setPendingCookNow(true);
    setSelectedProduct(null);
  };

  const onCheckoutClick = () => {
      handleCheckout("");
      setShowConfirm(false);
  };

  const stopProp = (e: any) => {
      e.stopPropagation();
  };

  return (
    // Theme: Cozy Wood (บ้านๆ อบอุ่น)
    <div className="w-full max-w-md md:max-w-xl xl:max-w-md mx-auto min-h-screen pb-32 relative overflow-x-hidden bg-[#fffbeb] font-sans text-[#451a03]">

        {/* CSS Styles */}
        <style dangerouslySetInnerHTML={{__html: `
            @import url('https://fonts.googleapis.com/css2?family=Mali:wght@400;500;600;700&family=Sarabun:wght@300;400;500;600&display=swap');

            :root {
                --primary-brown: #78350f; /* amber-900 */
                --wood-light: #d97706; /* amber-600 */
                --bg-cream: #fffbeb; /* amber-50 */
                --accent-orange: #ea580c; /* orange-600 */
                --text-dark: #451a03; /* amber-950 */
                --card-bg: #ffffff;
            }

            body {
                font-family: 'Sarabun', sans-serif;
                background-color: var(--bg-cream);
                color: var(--text-dark);
            }

            .font-mali { font-family: 'Mali', cursive; }

            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            /* Animations */
            @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade { animation: fadeIn 0.4s ease-out forwards; }

            /* Components */
            .card-wood {
                background: white;
                border-radius: 1rem;
                box-shadow: 0 4px 6px -1px rgba(120, 53, 15, 0.1), 0 2px 4px -1px rgba(120, 53, 15, 0.06);
                border-bottom: 3px solid #fcd34d; /* yellow-300 accent */
                transition: transform 0.2s;
            }
            .card-wood:active { transform: scale(0.98); }

            .btn-wood {
                background: var(--primary-brown);
                color: white;
                border-radius: 0.75rem;
                font-family: 'Mali', cursive;
                transition: all 0.2s;
            }
            .btn-wood:active { background: #451a03; transform: translateY(1px); }

            .chip-active {
                background: var(--wood-light);
                color: white;
                border-radius: 0.5rem;
                font-family: 'Mali', cursive;
            }
            .chip-inactive {
                background: white;
                color: var(--text-dark);
                border: 1px solid #fde68a;
                border-radius: 0.5rem;
                font-family: 'Mali', cursive;
            }
        `}} />

        {/* --- Header (Wooden Sign Style) --- */}
        <header className="bg-[#78350f] text-[#fef3c7] pt-8 pb-16 px-6 rounded-b-[2rem] relative shadow-lg z-10">
             <div className="flex justify-between items-center relative z-10">
                 <div>
                     <div className="flex items-center gap-2 mb-1">
                         <div className="bg-[#fcd34d] text-[#78350f] text-[10px] px-2 py-0.5 rounded font-bold font-mali">โต๊ะ {tableLabel}</div>
                     </div>
                     <h1 className="text-2xl font-bold tracking-wide font-mali">
                         {brand?.name || "ร้านอร่อยโภชนา"}
                     </h1>
                 </div>
                 <div className="w-11 h-11 bg-[#92400e] rounded-full flex items-center justify-center border-2 border-[#fcd34d] shadow-sm">
                     <Icon name="shop" size={22} className="text-[#fcd34d]" />
                 </div>
             </div>
        </header>

        <main className="px-5 -mt-10 relative z-20">

            {/* --- HOME PAGE --- */}
            {activeTab === 'home' && (
                <section className="animate-fade">
                    {/* Simple Banner */}
                    {banners?.length > 0 && (
                        <div className="relative w-full h-48 bg-white rounded-xl overflow-hidden shadow-md mb-6 border-4 border-white">
                             <img
                                src={getBannerUrl(banners[currentBannerIndex].image_name)}
                                className="w-full h-full object-cover"
                             />
                             <div className="absolute bottom-2 right-2 bg-[#ea580c] text-white px-3 py-1 rounded-lg text-xs font-bold font-mali shadow-sm">
                                 🔥 เมนูแนะนำ
                             </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-4 px-1">
                         <h2 className="text-xl font-bold text-[#78350f] font-mali">กับข้าวมาแล้วจ้า 🍲</h2>
                         <button onClick={() => setActiveTab('menu')} className="text-[#d97706] text-sm font-bold flex items-center gap-1 hover:underline font-mali">
                             ดูทั้งหมด <Icon name="chevronRight" size={16} />
                         </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-2 gap-4 pb-24">
                        {products?.filter((p: any) => p.is_recommended).slice(0, 6).map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="card-wood p-3 cursor-pointer h-full flex flex-col" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full aspect-square overflow-hidden relative rounded-lg bg-[#fef3c7] mb-2">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                         {pricing.discount > 0 && (
                                            <div className="absolute top-0 left-0 bg-[#dc2626] text-white text-[10px] font-bold px-2 py-1 rounded-br-lg font-mali">
                                                ลดราคา
                                            </div>
                                         )}
                                     </div>
                                     <h3 className="font-bold text-[#451a03] text-sm line-clamp-2 mb-auto leading-snug font-mali">{p.name}</h3>

                                     <div className="flex justify-between items-end mt-2">
                                         <div className="flex flex-col">
                                             {pricing.discount > 0 && (
                                                 <span className="text-[10px] text-gray-500 line-through">
                                                     {pricing.original}
                                                 </span>
                                             )}
                                             <span className="text-[#d97706] font-bold text-lg leading-none font-mali">
                                                 {pricing.final}.-
                                             </span>
                                         </div>
                                         <div className="w-7 h-7 bg-[#fff7ed] text-[#d97706] flex items-center justify-center rounded-full border border-[#fed7aa]">
                                             <Icon name="plus" size={14} strokeWidth={3} />
                                         </div>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- MENU PAGE --- */}
            {activeTab === 'menu' && (
                <section className="animate-fade pt-2">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                             <Icon name="search" className="text-[#d97706]" size={18} />
                         </div>
                         <input type="text" placeholder="หิวอะไร พิมพ์หาได้เลย..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-white shadow-sm border border-[#fde68a] focus:ring-2 focus:ring-[#fcd34d] focus:outline-none text-sm text-[#451a03] placeholder:text-[#a8a29e] font-mali" />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar py-2 px-1">
                        {categories?.map((c: any) => (
                            <button key={c.id} onClick={() => setSelectedCategoryId(c.id)}
                                    className={`shrink-0 px-4 py-2 text-sm font-bold shadow-sm
                                    ${selectedCategoryId === c.id ? 'chip-active' : 'chip-inactive'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-24">
                        {filteredProducts?.map((p: any, idx: any) => {
                             const pricing = calculatePrice(p, 'normal');
                             return (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="card-wood p-3 cursor-pointer h-full flex flex-col" style={{animationDelay: `${idx * 0.05}s`}}>
                                     <div className="w-full aspect-square overflow-hidden relative rounded-lg bg-[#fef3c7] mb-2">
                                         <img src={getMenuUrl(p.image_name)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                                     </div>
                                     <h3 className="font-bold text-[#451a03] text-sm line-clamp-2 mb-auto leading-snug font-mali">{p.name}</h3>

                                     <div className="flex justify-between items-end mt-2">
                                         <div className="flex flex-col">
                                             {pricing.discount > 0 && <span className="text-[10px] text-gray-500 line-through">{pricing.original}</span>}
                                             <span className="text-[#d97706] font-bold text-lg leading-none font-mali">{pricing.final}.-</span>
                                         </div>
                                         <div className="w-7 h-7 bg-[#fff7ed] text-[#d97706] flex items-center justify-center rounded-full border border-[#fed7aa]">
                                             <Icon name="plus" size={14} strokeWidth={3} />
                                         </div>
                                     </div>
                                </div>
                             );
                        })}
                    </div>
                </section>
            )}

            {/* --- STATUS PAGE --- */}
            {activeTab === 'status' && (
                <section className="animate-fade pt-4 pb-24">
                    <div className="mb-6 flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-[#fde68a]">
                        <div className="w-10 h-10 bg-[#fff7ed] rounded-full flex items-center justify-center text-[#d97706]">
                            <Icon name="clock" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#78350f] font-mali">สถานะอาหาร</h2>
                            <p className="text-xs text-gray-500">รอสักครู่ อร่อยแน่นอน!</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {ordersList?.map((o: any) => (
                            <div key={o.id} className="card-wood p-4 relative overflow-hidden bg-white">
                                <div className="flex justify-between items-start mb-3">
                                     <span className="text-xs text-[#92400e] font-bold bg-[#fef3c7] px-2 py-1 rounded">
                                         คิวที่ #{o.id.slice(-4)}
                                     </span>
                                     <span className={`px-2 py-1 text-[10px] font-bold rounded border flex items-center gap-1 font-mali
                                        ${o.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                         {o.status === 'pending' ? 'กำลังทำ...' : 'เสิร์ฟแล้ว'}
                                     </span>
                                </div>

                                <div className="space-y-2 relative z-10 border-t border-dashed border-gray-200 pt-3">
                                    {o.order_items.map((i: any, idx: any) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#451a03]">
                                            <div className="flex items-start gap-2">
                                                <div className="font-bold text-[#78350f]">{i.quantity}x</div>
                                                <div className="flex flex-col">
                                                    <span className="font-mali">{i.product_name}</span>
                                                    {i.variant && i.variant !== 'normal' && <span className="text-[10px] text-gray-500 bg-gray-100 px-1 rounded w-fit">{i.variant}</span>}
                                                    {i.note && <span className="text-[10px] text-[#ea580c] italic">({i.note})</span>}
                                                </div>
                                            </div>
                                            <span className="font-bold">{i.price * i.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100">
                                     <span className="font-bold text-gray-400 text-xs">รวมทั้งหมด</span>
                                     <span className="font-bold text-[#d97706] text-xl font-mali">
                                         {o.order_items.reduce((acc: any, i: any) => acc + (i.price * i.quantity), 0)}.-
                                     </span>
                                </div>
                            </div>
                        ))}
                        {(!ordersList || ordersList.length === 0) && (
                            <div className="text-center py-16 opacity-50">
                                <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
                                    <Icon name="basket" size={28} />
                                </div>
                                <p className="text-gray-500 font-mali">ยังไม่ได้สั่งอะไรเลยครับ</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </main>

        {/* --- FLOATING NAV (Simple Bar) --- */}
        <nav className="fixed bottom-0 left-0 w-full h-[70px] bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex justify-around items-center px-2 z-[90] border-t border-[#fde68a]">
             <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'home' ? 'text-[#78350f]' : 'text-gray-400'}`}>
                 <Icon name="home" size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                 <span className="text-[10px] font-mali">หน้าแรก</span>
             </button>

             <button onClick={() => setActiveTab('menu')} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'menu' ? 'text-[#78350f]' : 'text-gray-400'}`}>
                 <Icon name="menu" size={24} strokeWidth={activeTab === 'menu' ? 2.5 : 2} />
                 <span className="text-[10px] font-mali">เมนู</span>
             </button>

             {/* Cart Button */}
             <div className="relative -mt-8">
                 <button onClick={() => setActiveTab('cart')} className="w-14 h-14 bg-[#ea580c] rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform border-4 border-[#fffbeb]">
                     <Icon name="basket" size={24} />
                     {cart?.length > 0 && (
                         <span className="absolute -top-1 -right-1 bg-[#fcd34d] text-[#78350f] text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border border-white">
                             {cart.length}
                         </span>
                     )}
                 </button>
             </div>

             <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'status' ? 'text-[#78350f]' : 'text-gray-400'}`}>
                 <Icon name="clock" size={24} strokeWidth={activeTab === 'status' ? 2.5 : 2} />
                 <span className="text-[10px] font-mali">สถานะ</span>
             </button>
        </nav>

        {/* --- ITEM DETAIL MODAL (Simple & Big Buttons) --- */}
        {selectedProduct && (
            <div
                className="fixed inset-0 z-[100] flex items-end md:items-center xl:items-end justify-center bg-[#451a03]/50 backdrop-blur-sm animate-fade"
                onClick={() => setSelectedProduct(null)}
            >
                <div
                    className="w-full max-w-md md:max-w-xl xl:max-w-md bg-white rounded-t-[1.5rem] md:rounded-2xl xl:rounded-none xl:rounded-t-[1.5rem] shadow-2xl relative overflow-hidden max-h-[90vh] md:max-h-[85vh] xl:max-h-[90vh] flex flex-col"
                    onClick={stopProp}
                >
                    <div className="relative h-52 sm:h-60 md:h-48 xl:h-64 shrink-0 bg-[#fef3c7]">
                        <img src={getMenuUrl(selectedProduct.image_name)} className="w-full h-full object-cover" />
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors shadow-sm">
                            <Icon name="x" size={20} />
                        </button>
                    </div>

                    <div className="p-6 pb-6 overflow-y-auto bg-white flex-1 no-scrollbar">
                        <div className="mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-bold text-[#451a03] mb-1 font-mali">{selectedProduct.name}</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold text-[#d97706] font-mali">{currentPriceObj.final}.-</span>
                                {currentPriceObj.discount > 0 && (
                                    <span className="text-sm text-gray-400 line-through">
                                        {currentPriceObj.original}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Variant Selector */}
                            <div>
                                <label className="block text-sm font-bold text-[#78350f] mb-2 font-mali">เลือกขนาด / แบบ</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'normal', label: 'ธรรมดา', ...calculatePrice(selectedProduct, 'normal') },
                                        selectedProduct.price_special && { key: 'special', label: 'พิเศษ', ...calculatePrice(selectedProduct, 'special') },
                                        selectedProduct.price_jumbo && { key: 'jumbo', label: 'จัมโบ้', ...calculatePrice(selectedProduct, 'jumbo') }
                                    ].filter(Boolean).map((v) => (
                                        <button
                                            key={v.key}
                                            onClick={() => setVariant(v.key)}
                                            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1
                                                ${variant === v.key
                                                    ? 'border-[#d97706] bg-[#fff7ed] text-[#d97706] font-bold'
                                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                        >
                                            <span className="text-sm">{v.label}</span>
                                            <span className="text-sm">{v.final}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Options List */}
                            {selectedProduct.options && selectedProduct.options.length > 0 && (
                                <div className="space-y-4">
                                    {selectedProduct.options.map((opt: any, groupIndex: number) => (
                                        <div key={groupIndex} className="bg-[#fffbeb] p-3 rounded-lg border border-[#fde68a]">
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="block text-sm font-bold text-[#78350f] font-mali">
                                                    {opt.name} {opt.required && <span className="text-red-500">*</span>}
                                                </label>
                                                <span className="text-xs text-[#d97706] font-mali bg-white px-2 py-0.5 rounded shadow-sm border border-[#fde68a]">
                                                    {opt.type === 'single' ? 'เลือก 1 อย่าง' : 'เลือกได้หลายอย่าง'}
                                                </span>
                                            </div>
                                            <div className="grid gap-2">
                                                {opt.choices.map((choice: any, cIdx: number) => {
                                                    const choiceKey = String(choice.id || choice.name);
                                                    const isSelected = (selectedOptions[groupIndex] || []).some((item: any) => String(item.id || item.name) === choiceKey);
                                                    const choiceImg = choice.image_url || choice.image_name;

                                                    return (
                                                        <label
                                                            key={cIdx}
                                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all bg-white
                                                                ${isSelected
                                                                    ? 'border-[#d97706] shadow-sm'
                                                                    : 'border-gray-200 hover:border-[#fcd34d]'
                                                                }`}
                                                            onClick={() => handleOptionToggle(groupIndex, choice, opt.type)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-5 h-5 flex items-center justify-center rounded-full border-2
                                                                    ${isSelected ? 'border-[#d97706] bg-[#d97706]' : 'border-gray-300 bg-white'}`}>
                                                                    {isSelected && <Icon name="check" size={12} className="text-white" />}
                                                                </div>
                                                                {choiceImg && (
                                                                    <img src={getMenuUrl(choiceImg)} className="w-10 h-10 object-cover rounded shadow-sm border border-gray-100" />
                                                                )}
                                                                <span className="text-sm text-[#451a03] font-medium font-mali">{choice.name}</span>
                                                            </div>
                                                            <span className="text-sm font-bold text-[#d97706] font-mali">
                                                                {Number(choice.price) > 0 ? `+${choice.price}.-` : 'ฟรี'}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Qty Control */}
                            <div className="flex items-center justify-between p-3 bg-[#fffbeb] rounded-lg border border-[#fde68a]">
                                <span className="text-sm font-bold text-[#78350f] font-mali">จำนวน</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-8 h-8 bg-white text-[#d97706] rounded border border-[#fed7aa] flex items-center justify-center shadow-sm active:scale-95"><Icon name="minus" size={16}/></button>
                                    <span className="text-xl font-bold w-8 text-center text-[#451a03] font-mali">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-8 h-8 bg-[#d97706] text-white rounded flex items-center justify-center shadow-sm active:scale-95"><Icon name="plus" size={16}/></button>
                                </div>
                            </div>

                            {/* Note Input */}
                            <div>
                                <label className="block text-sm font-bold text-[#78350f] mb-2 font-mali">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="เช่น ไม่ใส่ผัก, เผ็ดน้อย, แยกน้ำ..."
                                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:border-[#d97706] focus:ring-1 focus:ring-[#d97706] focus:outline-none h-20 resize-none text-sm text-[#451a03]"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Actions */}
                    <div className="shrink-0 w-full p-5 md:p-6 bg-white border-t border-gray-100 grid grid-cols-2 gap-3 z-30 font-mali">
                        <button onClick={() => handleAdd(true)} className="py-3 bg-white border-2 border-[#d97706] text-[#d97706] font-bold rounded-lg active:scale-95 transition-all">
                            ใส่ตะกร้า
                        </button>
                        <button onClick={() => handleAdd(false)} className="py-3 bg-[#ea580c] text-white font-bold rounded-lg active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
                            สั่งเลย! <Icon name="fire" size={18} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- CART DRAWER --- */}
        {activeTab === 'cart' && (
             <div
                className="fixed inset-0 z-[100] flex items-end justify-center bg-[#451a03]/50 backdrop-blur-sm animate-fade"
                onClick={() => setActiveTab('menu')}
             >
                 <div
                    className="w-full max-w-md md:max-w-xl xl:max-w-md bg-white rounded-t-[1.5rem] md:rounded-2xl xl:rounded-none xl:rounded-t-[1.5rem] shadow-2xl h-[85vh] md:h-[80vh] xl:h-[85vh] flex flex-col relative mx-auto"
                    onClick={stopProp}
                 >
                     {/* Handle */}
                     <div onClick={() => setActiveTab('menu')} className="w-full py-3 flex justify-center cursor-pointer hover:bg-gray-50 rounded-t-[1.5rem]">
                         <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                     </div>

                     <div className="px-6 mb-2 border-b border-gray-100 pb-2">
                        <h2 className="text-xl font-bold text-[#451a03] font-mali">รายการที่เลือกไว้</h2>
                     </div>

                     <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
                         {cart.map((item: any, idx: any) => {
                            const finalPriceTotal = item.price * item.quantity;
                            const originalPriceTotal = (item.original_price || item.price) * item.quantity;
                            const hasDiscount = originalPriceTotal > finalPriceTotal;

                             return (
                             <div key={idx} className="flex gap-3 p-3 bg-[#fff7ed] rounded-lg border border-[#ffedd5]">
                                 <div className="w-16 h-16 bg-white rounded overflow-hidden shrink-0 border border-gray-100">
                                     <img src={item.image_url} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                     <h3 className="font-bold text-[#451a03] text-sm line-clamp-1 font-mali">{item.name}</h3>
                                     <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                                         {item.variant !== 'normal' && <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[#d97706]">{item.variant}</span>}
                                         {item.note && <span className="italic">"{item.note}"</span>}
                                     </div>

                                     <div className="flex justify-between items-end mt-2">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateQuantity(idx, -1)} className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-500"><Icon name="minus" size={12}/></button>
                                            <span className="text-sm font-bold text-[#451a03] w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(idx, 1)} className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-500"><Icon name="plus" size={12}/></button>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {hasDiscount && <span className="text-[10px] text-gray-400 line-through">{originalPriceTotal}</span>}
                                            <span className="font-bold text-[#d97706] text-base font-mali">{finalPriceTotal}.-</span>
                                        </div>
                                     </div>
                                 </div>
                                 <button onClick={() => updateQuantity(idx, -100)} className="self-start text-gray-300 hover:text-red-500">
                                     <Icon name="x" size={16} />
                                 </button>
                             </div>
                         )})}
                         {cart.length === 0 && (
                             <div className="text-center py-20 opacity-50">
                                 <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center text-gray-400">
                                     <Icon name="basket" size={32} />
                                 </div>
                                 <p className="text-gray-500 font-mali">ยังไม่มีรายการครับ</p>
                             </div>
                         )}
                     </div>

                     <div className="p-6 bg-white border-t border-gray-100">
                         <div className="flex justify-between items-center mb-4">
                             <span className="text-gray-600 font-bold">รวมทั้งสิ้น</span>
                             <span className="text-2xl font-bold text-[#ea580c] font-mali">{cartTotal}.-</span>
                         </div>
                         <button onClick={() => { setShowConfirm(true); setSelectedProduct(null); }} disabled={cart.length === 0} className="w-full py-3 btn-wood text-white font-bold text-lg active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg">
                             <Icon name="check" size={20} /> ยืนยันการสั่ง
                         </button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- CONFIRMATION MODAL --- */}
        {showConfirm && (
            <div
                className="fixed inset-0 z-[200] flex items-center justify-center bg-[#451a03]/60 backdrop-blur-sm p-6 animate-fade"
                onClick={() => setShowConfirm(false)}
            >
                <div
                    className="w-full max-w-sm bg-white rounded-xl p-6 text-center shadow-2xl relative border-t-4 border-[#ea580c]"
                    onClick={stopProp}
                >
                    <div className="w-16 h-16 bg-[#fff7ed] text-[#ea580c] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#ffedd5]">
                        <Icon name="check" size={32} strokeWidth={3} />
                    </div>

                    {selectedProduct ? (
                         <>
                             <h3 className="text-lg font-bold text-[#451a03] mb-1 font-mali">สั่งเลยไหมครับ?</h3>
                             <p className="text-gray-500 mb-6 text-sm">เพิ่ม "{selectedProduct.name}" เข้าครัวทันที</p>
                             <div className="flex flex-col gap-3 font-mali">
                                 <button onClick={() => { performCookNow(); setShowConfirm(false); }} className="w-full py-3 bg-[#ea580c] text-white font-bold rounded-lg shadow hover:bg-[#c2410c]">ยืนยัน สั่งเลย!</button>
                                 <button onClick={() => { handleAdd(true); setShowConfirm(false); }} className="w-full py-3 bg-white border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-50">เก็บใส่ตะกร้าก่อน</button>
                             </div>
                         </>
                    ) : (
                         <>
                             <h3 className="text-lg font-bold text-[#451a03] mb-1 font-mali">ยืนยันออเดอร์</h3>
                             <p className="text-gray-500 mb-6 text-sm">ส่งรายการอาหารทั้งหมด {cart.length} รายการนะครับ?</p>
                             <div className="flex flex-col gap-3 font-mali">
                                 <button onClick={() => { onCheckoutClick(); }} className="w-full py-3 bg-[#ea580c] text-white font-bold rounded-lg shadow hover:bg-[#c2410c]">ยืนยันการสั่ง</button>
                                 <button onClick={() => setShowConfirm(false)} className="w-full py-3 text-gray-400 font-bold text-sm hover:text-gray-600">ยกเลิก</button>
                             </div>
                         </>
                    )}
                </div>
            </div>
        )}

    </div>
  );
}