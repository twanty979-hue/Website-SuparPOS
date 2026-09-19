const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'components', 'themes');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

console.log(`Checking ${files.length} theme files...`);

let updatedCount = 0;
let errors = [];

files.forEach(f => {
  try {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Add import if missing
    if (!content.includes('ThemeProductBadge')) {
      if (content.startsWith('"use client";') || content.startsWith("'use client';")) {
        content = content.replace(/(['"]use client['"];\r?\n)/, '$1import { ProductCardBadge, ProductModalBadge } from "@/components/common/ThemeProductBadge";\r\n');
      } else {
        content = 'import { ProductCardBadge, ProductModalBadge } from "@/components/common/ThemeProductBadge";\r\n' + content;
      }
      modified = true;
    }

    // 2. Clean up MinimalEarth & Halloween custom badge definitions if present
    if (content.includes('// --- 🏷️ Vector Icons for Recommended & Random Badges (No Emoji) ---')) {
      content = content.replace(/\/\/ --- 🏷️ Vector Icons for Recommended & Random Badges \(No Emoji\) ---[\s\S]*?const IconBadgeShuffle =[\s\S]*?\);\r?\n/g, '');
      modified = true;
    }

    // Replace old MinimalEarth custom badge markup in card
    const oldMinimalCardBadge = /{\/\* 🏷️ Badge: แนะนำ \/ สุ่ม \*\/}\s*<div className="absolute top-2 left-2 z-10 pointer-events-none">[\s\S]*?<\/div>/;
    if (oldMinimalCardBadge.test(content)) {
      content = content.replace(oldMinimalCardBadge, '<ProductCardBadge product={p} />');
      modified = true;
    }

    // Replace old MinimalEarth custom badge markup in modal
    const oldMinimalModalBadge = /<div className="absolute top-4 left-4 z-10 pointer-events-none">\s*{selectedProduct\.is_auto_recommended[\s\S]*?<\/div>/;
    if (oldMinimalModalBadge.test(content)) {
      content = content.replace(oldMinimalModalBadge, '<ProductModalBadge product={selectedProduct} />');
      modified = true;
    }

    // Replace Halloween custom badge markup
    const oldHalloweenCardBadge = /<div className="absolute top-2 left-2 z-10 pointer-events-none">\s*{p\.is_auto_recommended[\s\S]*?<\/div>/;
    if (oldHalloweenCardBadge.test(content)) {
      content = content.replace(oldHalloweenCardBadge, '<ProductCardBadge product={p} />');
      modified = true;
    }

    // 3. Card badge in recommended section for all other themes
    const recIdx = content.indexOf('p.is_recommended');
    if (recIdx !== -1) {
      const afterRec = content.slice(recIdx);
      // Find img tag inside recommended section
      const imgMatch = afterRec.match(/(<img\s+src=\{getMenuUrl\(p\.image_name\)\}[^>]*\/>)/);
      if (imgMatch) {
        const fullImg = imgMatch[0];
        const snippetCheck = afterRec.slice(0, 1200);
        if (!snippetCheck.includes('ProductCardBadge')) {
          const replacedAfterRec = afterRec.replace(fullImg, `${fullImg}\r\n                                         <ProductCardBadge product={p} />`);
          content = content.slice(0, recIdx) + replacedAfterRec;
          modified = true;
        }
      }
    }

    // 4. Modal badge for all other themes
    const modalImgMatch = content.match(/(<img\s+src=\{getMenuUrl\(selectedProduct\.image_name\)\}[^>]*\/>)/);
    if (modalImgMatch) {
      const fullModalImg = modalImgMatch[0];
      const modalSnippet = content.slice(content.indexOf(fullModalImg), content.indexOf(fullModalImg) + 800);
      if (!modalSnippet.includes('ProductModalBadge')) {
        content = content.replace(fullModalImg, `${fullModalImg}\r\n                        <ProductModalBadge product={selectedProduct} />`);
        modified = true;
      }
    }

    // 5. Change slice(0, 4) to slice(0, 6) in recommended filter
    const slice4Regex = /\.filter\(\((p:\s*any)\)\s*=>\s*p\.is_recommended\)\.slice\(0,\s*4\)/g;
    if (slice4Regex.test(content)) {
      content = content.replace(slice4Regex, '.filter(($1) => p.is_recommended).slice(0, 6)');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedCount++;
    }
  } catch (err) {
    errors.push({ file: f, error: err.message });
  }
});

console.log(`Successfully updated ${updatedCount} files.`);
if (errors.length > 0) {
  console.error('Errors:', errors);
}
