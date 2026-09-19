import React from "react";

// --- 🏷️ Vector Icons for Recommended & Random Badges (No Emoji) ---
export const IconBadgeStar = ({ size = 11, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const IconBadgeShuffle = ({ size = 11, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);

/**
 * 🏷️ ProductCardBadge: แสดงป้าย "แนะนำ" หรือ "สุ่ม" บนรูปภาพสินค้าในหน้าแรก (Home)
 */
export function ProductCardBadge({ product, className = "absolute top-2 left-2 z-10 pointer-events-none" }: { product: any; className?: string }) {
  if (!product || (!product.is_recommended && !product.is_auto_recommended)) return null;

  return (
    <div className={className} data-theme-badge="true">
      {product.is_auto_recommended ? (
        <span className="bg-[#1C1917]/85 backdrop-blur-md text-white border border-white/10 text-[10px] font-medium px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
          <IconBadgeShuffle size={10} className="text-amber-400 shrink-0" />
          <span className="tracking-wide">สุ่ม</span>
        </span>
      ) : (
        <span className="bg-[#1C1917]/85 backdrop-blur-md text-white border border-white/10 text-[10px] font-medium px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
          <IconBadgeStar size={10} className="text-amber-400 shrink-0" />
          <span className="tracking-wide">แนะนำ</span>
        </span>
      )}
    </div>
  );
}

/**
 * 🏷️ ProductModalBadge: แสดงป้าย "เมนูแนะนำ" หรือ "เมนูสุ่ม" ใน Modal รายละเอียดสินค้า
 */
export function ProductModalBadge({ product, className = "absolute top-4 left-4 z-10 pointer-events-none" }: { product: any; className?: string }) {
  if (!product || (!product.is_recommended && !product.is_auto_recommended)) return null;

  return (
    <div className={className} data-theme-modal-badge="true">
      {product.is_auto_recommended ? (
        <span className="bg-[#1C1917]/85 backdrop-blur-md text-white border border-white/10 text-xs font-medium px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
          <IconBadgeShuffle size={12} className="text-amber-400 shrink-0" />
          <span className="tracking-wide">เมนูสุ่ม</span>
        </span>
      ) : (
        <span className="bg-[#1C1917]/85 backdrop-blur-md text-white border border-white/10 text-xs font-medium px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
          <IconBadgeStar size={12} className="text-amber-400 shrink-0" />
          <span className="tracking-wide">เมนูแนะนำ</span>
        </span>
      )}
    </div>
  );
}
