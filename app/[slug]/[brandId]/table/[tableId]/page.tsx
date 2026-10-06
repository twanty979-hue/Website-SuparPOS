// app/[slug]/[brandId]/table/[tableId]/page.tsx
"use client";

import React from "react";
import { useShopLogic } from "../../../../../hooks/useShopLogic"; 

import StandardTheme from "@/components/themes/StandardTheme";
import LuxuryTheme from "@/components/themes/LuxuryTheme";
import Scooby from "@/components/themes/Scooby"
import CampLazlo from "@/components/themes/CampLazlo"
import Ralph from "@/components/themes/Ralph"
import PeterPan from "@/components/themes/PeterPan"
import FlapjackStomarong from "@/components/themes/FlapjackStomarong"
import Pinkie from "@/components/themes/Pinkie"
import TomJerry from "@/components/themes/TomJerry"
import BabyLooney from "@/components/themes/BabyLooney"
import FosterHome from "@/components/themes/FosterHome"
import OnePiece from "@/components/themes/OnePiece"
import Garfield from "@/components/themes/Garfield"
import GarfieldNeon from "@/components/themes/GarfieldNeon"
import Moana from "@/components/themes/Moana"
import Motunui from "@/components/themes/Motunui"
import SpringFreshBloom from "@/components/themes/SpringFreshBloom"
import Christmas from "@/components/themes/Christmas"
import Halloween from "@/components/themes/Halloween"
import Sketchbook from "@/components/themes/Sketchbook"
import TheCroods from "@/components/themes/TheCroods"
import PeterPanNeverland from "@/components/themes/PeterPanNeverland"
import WeBareBares from "@/components/themes/WeBareBares"
import AdventureTime from "@/components/themes/AdventureTime"
import JohnnyTest from "@/components/themes/JohnnyTest"
import KryptoHeroic from "@/components/themes/KryptoHeroic"
import PinkPanther from "@/components/themes/PinkPanther"
import TheDukesof from "@/components/themes/TheDukesof"
import TheLionKing from "@/components/themes/TheLionKing"
import JuniperLee from "@/components/themes/JuniperLee"
import CowandChicken from "@/components/themes/CowandChicken"
import CowandChicV2 from "@/components/themes/CowandChicV2"
import MickeyMouse from "@/components/themes/MickeyMouse"
import PowerpuffGirls from "@/components/themes/PowerpuffGirls"
import CourageKitchen from "@/components/themes/CourageKitchen"
import MashaBear from "@/components/themes/MashaBear"
import SAO from "@/components/themes/SAO"
import KrustyKrab from "@/components/themes/KrustyKrab"
import RaftSurvival from "@/components/themes/RaftSurvival"
import HomeforImaginary from "@/components/themes/HomeforImaginary"
import StrawberryCheesecake from "@/components/themes/StrawberryCheesecake"
import BabyBug from "@/components/themes/ฺBabyBug"
import Tom from "@/components/themes/Tom"
import CampLazloo from "@/components/themes/CampLazloo"
import SugarcubeCorner from "@/components/themes/SugarcubeCorner"
import MarvelousCandy from "@/components/themes/MarvelousCandy"
import OggyKitchen from "@/components/themes/OggyKitchen"
import Scoobpydoo from "@/components/themes/Scoobpydoo"
import Omnitrix from "@/components/themes/Omnitrix"
import CourtSideEats from "@/components/themes/CourtSideEats"
import StadiumEats from "@/components/themes/StadiumEats"
import PremiumBlue from "@/components/themes/PremiumBlue"
import WarmSavoryOrange from "@/components/themes/WarmSavoryOrange"
import MinimalEarth from "@/components/themes/MinimalEarth"
import DarkLuxury from "@/components/themes/DarkLuxury"
import LeafGreen from "@/components/themes/LeafGreen"
import CozyWood from "@/components/themes/CozyWood"
import SiamMidnight from "@/components/themes/SiamMidnight"
import OmakaseInk from "@/components/themes/OmakaseInk"
import MediterraneanMosaic from "@/components/themes/MediterraneanMosaic"
import EspressoBlueprint from "@/components/themes/EspressoBlueprint"
import GlacierGlass from "@/components/themes/GlacierGlass"
import ObsidianGold from "@/components/themes/ObsidianGold"
import WarmGrid from "@/components/themes/WarmGrid"
import Y2KSnackBar from "@/components/themes/Y2KSnackBar"
import RamadanMoonTable from "@/components/themes/RamadanMoonTable"
import VeganBotanica from "@/components/themes/VeganBotanica"
import { ProductCardBadge, ProductModalBadge } from "@/components/common/ThemeProductBadge";

// 🌟 1. ประกาศ URL ของ Cloudflare ตรงนี้
const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

// 🛡️ Universal fallback & sold-out/locked badge enforcer: สำหรับ 60+ ธีมทั้งหมด
function UniversalThemeBadgeEnforcer({ products, activeTab, selectedProduct }: { products: any[]; activeTab: string; selectedProduct: any }) {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const enforceBadges = () => {
      if (!products || !products.length) return;

      const allImgs = Array.from(document.querySelectorAll("img"));

      // 1. ตรวจสอบการ์ดสินค้าทุกใบในหน้าเว็บ (ทั้ง Home, Menu, Search, Category)
      products.forEach((p: any) => {
        const isLocked = Boolean(p.is_locked);
        const isSoldOut = p.is_available === false || isLocked;

        // ค้นหารูปภาพของการ์ดสินค้านี้
        const matchingCardImgs: HTMLImageElement[] = [];

        if (p.image_name) {
          allImgs.forEach(img => {
            // ไม่นับแบนเนอร์และรูปใน modal
            if (img.id === 'modalImage' || img.closest('#bannerSlider, [class*="banner"], [class*="modal"], [class*="fixed"]')) return;
            if (img.src && img.src.includes(p.image_name)) {
              matchingCardImgs.push(img);
            }
          });
        }

        // หากไม่มีรูป หรือยังหาไม่เจอ ให้ค้นหาจากการ์ดที่มีชื่ออาหาร
        if (matchingCardImgs.length === 0 && p.name) {
          const cards = Array.from(document.querySelectorAll('.item-card, .modern-card, [class*="card"], div.group'));
          cards.forEach(card => {
            if (card.closest('[class*="modal"], [class*="fixed"]')) return;
            if (card.textContent && card.textContent.includes(p.name)) {
              const cardImg = card.querySelector('img');
              if (cardImg && !matchingCardImgs.includes(cardImg)) {
                matchingCardImgs.push(cardImg);
              }
            }
          });
        }

        matchingCardImgs.forEach(img => {
          const parent = img.parentElement;
          if (!parent) return;

          // ถ้าสินค้าหมด หรือ พักการขาย (เกินโควต้า)
          if (isSoldOut) {
            img.style.filter = "grayscale(95%) contrast(85%) opacity(0.65)";
            img.style.transition = "filter 0.3s ease";

            if (window.getComputedStyle(parent).position === "static") {
              parent.style.position = "relative";
            }

            if (!parent.querySelector('[data-theme-soldout-overlay="true"]')) {
              const overlay = document.createElement("div");
              overlay.setAttribute("data-theme-soldout-overlay", "true");
              overlay.className = "absolute inset-0 z-10 pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-[inherit]";
              overlay.innerHTML = isLocked
                ? `<span class="bg-rose-950/90 text-rose-100 border border-rose-500/50 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                     <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-rose-300 shrink-0">
                       <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                       <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                     </svg>
                     <span>พักการขาย</span>
                   </span>`
                : `<span class="bg-slate-900/90 text-white border border-white/20 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                     <span class="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse"></span>
                     <span>สินค้าหมด</span>
                   </span>`;
              parent.appendChild(overlay);
            }

            // ล็อคปุ่มบวกในตัวการ์ด
            const cardRoot = img.closest('.item-card, .modern-card, [class*="card"], div.group') || parent.parentElement;
            if (cardRoot) {
              const plusBtns = Array.from(cardRoot.querySelectorAll('button'));
              plusBtns.forEach(btn => {
                if (btn.querySelector('.fi-rr-plus, svg, [class*="plus"]') || btn.textContent?.includes('+')) {
                  btn.style.opacity = '0.35';
                  btn.style.pointerEvents = 'none';
                }
              });
            }
          } else if (p.is_recommended || p.is_auto_recommended) {
            // ป้ายเมนูแนะนำ / สุ่ม (สำหรับธีมที่ไม่ได้เขียน ProductCardBadge)
            if (!parent.querySelector('[data-theme-badge="true"]')) {
              if (window.getComputedStyle(parent).position === "static") {
                parent.style.position = "relative";
              }
              const badge = document.createElement("div");
              badge.setAttribute("data-theme-badge", "true");
              badge.className = "absolute top-2 left-2 z-10 pointer-events-none";
              badge.innerHTML = p.is_auto_recommended
                ? `<span class="bg-[#1C1917]/85 backdrop-blur-md text-white border border-white/10 text-[10px] font-medium px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400">
                       <polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line>
                     </svg>
                     <span class="tracking-wide">สุ่ม</span>
                   </span>`
                : `<span class="bg-[#1C1917]/85 backdrop-blur-md text-white border border-white/10 text-[10px] font-medium px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                     <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="text-amber-400">
                       <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                     </svg>
                     <span class="tracking-wide">แนะนำ</span>
                   </span>`;
              parent.appendChild(badge);
            }
          }
        });
      });

      // 2. ตรวจสอบ Modal รายละเอียดเมนู (selectedProduct)
      if (selectedProduct) {
        const isLocked = Boolean(selectedProduct.is_locked);
        const isSoldOut = selectedProduct.is_available === false || isLocked;

        const modalImg = allImgs.find(img => img.id === 'modalImage' || (selectedProduct.image_name && img.src && img.src.includes(selectedProduct.image_name) && Boolean(img.closest('[class*="fixed"], [class*="modal"]'))));

        if (modalImg && modalImg.parentElement) {
          const parent = modalImg.parentElement;
          if (window.getComputedStyle(parent).position === "static") {
            parent.style.position = "relative";
          }

          if (isSoldOut) {
            modalImg.style.filter = "grayscale(95%) contrast(85%) opacity(0.65)";
            if (!parent.querySelector('[data-theme-modal-status="true"]')) {
              const statusBadge = document.createElement("div");
              statusBadge.setAttribute("data-theme-modal-status", "true");
              statusBadge.className = "absolute top-4 left-4 z-20 pointer-events-none";
              statusBadge.innerHTML = isLocked
                ? `<span class="bg-rose-950/95 backdrop-blur-md text-rose-100 border border-rose-500/50 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-rose-300">
                       <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                       <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                     </svg>
                     <span>พักการขาย (เกินโควต้า)</span>
                   </span>`
                : `<span class="bg-slate-900/95 backdrop-blur-md text-white border border-white/20 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                     <span class="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse"></span>
                     <span>สินค้าหมดชั่วคราว</span>
                   </span>`;
              parent.appendChild(statusBadge);
            }
          } else if ((selectedProduct.is_recommended || selectedProduct.is_auto_recommended) && !parent.querySelector('[data-theme-modal-badge="true"]')) {
            const modalBadge = document.createElement("div");
            modalBadge.setAttribute("data-theme-modal-badge", "true");
            modalBadge.className = "absolute top-4 left-4 z-10 pointer-events-none";
            modalBadge.innerHTML = selectedProduct.is_auto_recommended
              ? `<span class="bg-[#1C1917]/85 backdrop-blur-md text-white border border-white/10 text-xs font-medium px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400">
                     <polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line>
                   </svg>
                   <span class="tracking-wide">เมนูสุ่ม</span>
                 </span>`
              : `<span class="bg-[#1C1917]/85 backdrop-blur-md text-white border border-white/10 text-xs font-medium px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="text-amber-400">
                     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                   </svg>
                   <span class="tracking-wide">เมนูแนะนำ</span>
                 </span>`;
            parent.appendChild(modalBadge);
          }
        }

        // จัดการปุ่มสั่งใน Modal หากสินค้าหมดหรือถูกล็อค
        if (isSoldOut) {
          const modalRoot = modalImg?.closest('[class*="fixed"], [class*="modal"]') || document.querySelector('#modalName')?.parentElement?.parentElement?.parentElement;
          if (modalRoot) {
            const actionBtns = Array.from(modalRoot.querySelectorAll('button')).filter(btn => {
              const id = btn.id || '';
              const text = (btn.textContent || '').trim();
              return id === 'addToCartBtn' || id === 'orderNowBtn' ||
                ['Grab It', 'EAT NOW', 'ใส่ตะกร้า', 'สั่งเลย', 'Add to Cart', 'Order Now'].some(t => text.includes(t));
            });

            actionBtns.forEach(btn => {
              (btn as HTMLButtonElement).disabled = true;
              btn.style.opacity = '0.45';
              btn.style.cursor = 'not-allowed';
              btn.style.pointerEvents = 'none';
              if (!btn.getAttribute('data-original-text')) {
                btn.setAttribute('data-original-text', btn.textContent || '');
                btn.textContent = isLocked ? '🔒 พักการขาย' : '⚠️ สินค้าหมด';
              }
            });

            if (!modalRoot.querySelector('[data-theme-modal-alert="true"]')) {
              const alertBox = document.createElement("div");
              alertBox.setAttribute("data-theme-modal-alert", "true");
              alertBox.className = "w-full py-2.5 px-4 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center flex items-center justify-center gap-2";
              alertBox.innerHTML = `<span>${isLocked ? '🔒 เมนูนี้พักการขายชั่วคราว (เกินโควต้าแพ็กเกจของร้าน)' : '⚠️ ขออภัย เมนูนี้หมดชั่วคราว ไม่สามารถสั่งได้'}</span>`;
              const bottomArea = modalRoot.querySelector('.grid-cols-2, [class*="border-t"]');
              if (bottomArea && bottomArea.parentElement) {
                bottomArea.parentElement.insertBefore(alertBox, bottomArea);
              }
            }
          }
        }
      }
    };

    const timer = setTimeout(enforceBadges, 120);
    const observer = new MutationObserver(() => {
      enforceBadges();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [products, activeTab, selectedProduct]);

  return null;
}

export default function Page({ params, searchParams }: { params: any, searchParams?: any }) {
  const resolvedParams = React.use(params);
  const resolvedSearchParams = (searchParams ? React.use(searchParams) : {}) as { theme?: string };

  // ดึง state และ actions มาตามปกติ
  const { state, actions: rawActions, helpers: originalHelpers } = useShopLogic(resolvedParams);
  
  // 🛡️ เสริมความปลอดภัยของ Actions: ป้องกันการกดสั่งสินค้าหมด/ล็อคในทุกธีม
  const actions = React.useMemo(() => ({
    ...rawActions,
    handleAddToCart: (product: any, variant: any, note: string = "") => {
      if (!product || product.is_locked || product.is_available === false) {
        alert(product?.is_locked ? "ขออภัย เมนูนี้พักการขายชั่วคราว (เกินโควต้าแพ็กเกจของร้าน)" : "ขออภัย เมนูนี้สินค้าหมดชั่วคราว ไม่สามารถสั่งได้");
        return;
      }
      rawActions.handleAddToCart(product, variant, note);
    }
  }), [rawActions]);

  const { loading, error, brand } = state;

  // 🌟 2. ดัดแปลง (Override) Helpers เดิมที่มาจาก Hook เพื่อให้รองรับ Cloudflare และ Badge
  // วิธีนี้จะทำให้ทั้ง 50+ ธีมและธีมใหม่ในอนาคตที่เรียกใช้ helpers ได้ป้ายและการตั้งค่าเหมือนกันทันที
  const helpers = {
      ...originalHelpers, // เอาฟังก์ชันอื่นๆ (เช่น calculatePrice) มาใช้เหมือนเดิม
      getMenuUrl: (imageName: string | null) => {
          if (!imageName) return '/placeholder-food.png'; // ถ้าร้านไม่ได้ใส่รูป
          if (imageName.startsWith('http')) return imageName;
          return `${CDN_URL}/${imageName}`; // ดึงจาก Cloudflare
      },
      getBannerUrl: (imageName: string | null) => {
          if (!imageName) return '/placeholder-banner.png'; 
          if (imageName.startsWith('http')) return imageName;
          return `${CDN_URL}/${imageName}`; // ดึงจาก Cloudflare
      },
      renderProductBadge: (product: any, className?: string) => (
          <ProductCardBadge product={product} className={className} />
      ),
      renderModalBadge: (product: any, className?: string) => (
          <ProductModalBadge product={product} className={className} />
      )
  };


  if (error) {
     return (
       <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-600 font-bold p-10">
          ❌ Error: {error}
       </div>
     );
  }

  if (loading || !brand) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-400 font-bold animate-pulse">
           กำลังโหลดร้านค้า...
        </div>
      );
  }

  const themeMode = resolvedSearchParams?.theme || brand.theme_mode || 'mkinimalearth';

  // 🌟 3. ส่ง helpers ตัวใหม่ (ที่ดัดแปลงแล้ว) ลงไปให้ทุกธีม!
  const renderTheme = () => {
    switch (themeMode) {
      case 'luxury': return <LuxuryTheme state={state} actions={actions} helpers={helpers} />;
    case 'scoopydo': return <Scooby state={state} actions={actions} helpers={helpers} />;
    case 'camplazlo': return <CampLazlo state={state} actions={actions} helpers={helpers} />;
    case 'ralph': return <Ralph state={state} actions={actions} helpers={helpers} />;
    case 'peterpan': return <PeterPan state={state} actions={actions} helpers={helpers} />;
    case 'flapjack': return <FlapjackStomarong state={state} actions={actions} helpers={helpers} />;
    case 'pinkie': return <Pinkie state={state} actions={actions} helpers={helpers} />;
    case 'tomjerry': return <TomJerry state={state} actions={actions} helpers={helpers} />;
    case 'babylooney': return <BabyLooney state={state} actions={actions} helpers={helpers} />;
    case 'fosterhome': return <FosterHome state={state} actions={actions} helpers={helpers} />;
    case 'onepiece': return <OnePiece state={state} actions={actions} helpers={helpers} />;
    case 'darkgarfield': return <Garfield state={state} actions={actions} helpers={helpers} />;
    case 'garfieldneon': return <GarfieldNeon state={state} actions={actions} helpers={helpers} />;
    case 'moana': return <Moana state={state} actions={actions} helpers={helpers} />;
    case 'motunui': return <Motunui state={state} actions={actions} helpers={helpers} />;
    case 'springsreshbloom': return <SpringFreshBloom state={state} actions={actions} helpers={helpers} />;
    case 'christmas': return <Christmas state={state} actions={actions} helpers={helpers} />;
    case 'halloween': return <Halloween state={state} actions={actions} helpers={helpers} />;
    case 'sketchbook': return <Sketchbook state={state} actions={actions} helpers={helpers} />;
    case 'thecroods': return <TheCroods state={state} actions={actions} helpers={helpers} />;     
    case 'peterpanneverland': return <PeterPanNeverland state={state} actions={actions} helpers={helpers} />;
    case 'webarebares': return <WeBareBares state={state} actions={actions} helpers={helpers} />;
    case 'adventuretime': return <AdventureTime state={state} actions={actions} helpers={helpers} />;
    case 'johnnytest': return <JohnnyTest state={state} actions={actions} helpers={helpers} />;
    case 'kryptoheroic': return <KryptoHeroic state={state} actions={actions} helpers={helpers} />;
    case 'pinkpanther': return <PinkPanther state={state} actions={actions} helpers={helpers} />;
    case 'thedukesof': return <TheDukesof state={state} actions={actions} helpers={helpers} />;
    case 'thelionking': return <TheLionKing state={state} actions={actions} helpers={helpers} />;
    case 'juniperlee': return <JuniperLee state={state} actions={actions} helpers={helpers} />;
    case 'cowandchicken': return <CowandChicken state={state} actions={actions} helpers={helpers} />;
    case 'cowandchicv': return <CowandChicV2 state={state} actions={actions} helpers={helpers} />;
    case 'mickeymouse': return <MickeyMouse state={state} actions={actions} helpers={helpers} />;
    case 'powerpuffgirls': return <PowerpuffGirls state={state} actions={actions} helpers={helpers} />;
    case 'couragekitchen': return <CourageKitchen state={state} actions={actions} helpers={helpers} />;
    case 'mashabear': return <MashaBear state={state} actions={actions} helpers={helpers} />;
    case 'sao': return <SAO state={state} actions={actions} helpers={helpers} />;
    case 'krustykrab': return <KrustyKrab state={state} actions={actions} helpers={helpers} />;
    case 'raftsurvival': return <RaftSurvival state={state} actions={actions} helpers={helpers} />;
    case 'homeforimaginary': return <HomeforImaginary state={state} actions={actions} helpers={helpers} />;
    case 'strawberrycheesecake': return <StrawberryCheesecake state={state} actions={actions} helpers={helpers} />;
    case 'bebybug': return <BabyBug state={state} actions={actions} helpers={helpers} />;
    case 'tom': return <Tom state={state} actions={actions} helpers={helpers} />;
    case 'camplazloo': return <CampLazloo state={state} actions={actions} helpers={helpers} />;
    case 'sugarcubecorner': return <SugarcubeCorner state={state} actions={actions} helpers={helpers} />;
    case 'marvelouscandy': return <MarvelousCandy state={state} actions={actions} helpers={helpers} />;
    case 'oggykitchen': return <OggyKitchen state={state} actions={actions} helpers={helpers} />;
    case 'scoobpydoo': return <Scoobpydoo state={state} actions={actions} helpers={helpers} />;
    case 'omnitrix': return <Omnitrix state={state} actions={actions} helpers={helpers} />;
    case 'basketball': return <CourtSideEats state={state} actions={actions} helpers={helpers} />;
    case 'football': return <StadiumEats state={state} actions={actions} helpers={helpers} />;
    case 'blue': return <PremiumBlue state={state} actions={actions} helpers={helpers} />;
    case 'warmsavory': return <WarmSavoryOrange state={state} actions={actions} helpers={helpers} />;
    case 'siammidnight': return <SiamMidnight state={state} actions={actions} helpers={helpers} />;
    case 'omakaseink': return <OmakaseInk state={state} actions={actions} helpers={helpers} />;
    case 'mediterraneanmosaic': return <MediterraneanMosaic state={state} actions={actions} helpers={helpers} />;
    case 'espressoblueprint': return <EspressoBlueprint state={state} actions={actions} helpers={helpers} />;
    case 'glacierglass': return <GlacierGlass state={state} actions={actions} helpers={helpers} />;
    case 'obsidiangold': return <ObsidianGold state={state} actions={actions} helpers={helpers} />;
    case 'warmgrid': return <WarmGrid state={state} actions={actions} helpers={helpers} />;
    case 'y2ksnackbar': return <Y2KSnackBar state={state} actions={actions} helpers={helpers} />;
    case 'ramadanmoontable': return <RamadanMoonTable state={state} actions={actions} helpers={helpers} />;
    case 'veganbotanica': return <VeganBotanica state={state} actions={actions} helpers={helpers} />;
    case 'mkinimalearth': return <MinimalEarth state={state} actions={actions} helpers={helpers} />;
    case 'darkluxury': return <DarkLuxury state={state} actions={actions} helpers={helpers} />;
    case 'leafgreen': return <LeafGreen state={state} actions={actions} helpers={helpers} />;
    case 'cozywood': return <CozyWood state={state} actions={actions} helpers={helpers} />;
    case 'standard': return <StandardTheme state={state} actions={actions} helpers={helpers} />;
    case 'mkinimalearth':
    default:
        return <MinimalEarth state={state} actions={actions} helpers={helpers} />;
    }
  };

  return (
    <>
      <UniversalThemeBadgeEnforcer
        products={state.products}
        activeTab={state.activeTab}
        selectedProduct={state.selectedProduct}
      />
      {renderTheme()}
    </>
  );
}
