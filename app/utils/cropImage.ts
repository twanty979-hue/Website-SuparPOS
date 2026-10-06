// utils/cropImage.ts

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    // ป้องกันปัญหา Cross-Origin เวลาดึงรูป
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * ฟังก์ชันสำหรับตัดรูปภาพ (Crop) และคืนค่าออกมาเป็น URL (Blob) 
 * - เติมพื้นหลังสีขาวสะอาดตาเสมอ ป้องกันขอบดำหรือขอบโปร่งแสง
 * - คำนวณพิกัดการวาดแบบ Proportional Scale ป้องกันภาพบิดเบี้ยว / บีบอ้วนเด็ดขาด
 * - รองรับการซูมออก (Zoom Out) ให้เห็นรูปทรงยาวครบทั้งภาพโดยมีขอบขาวล้อมรอบ
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  targetSize = 600,
  backgroundColor = '#FFFFFF'
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // กำหนดขนาดปลายทางเป็นสี่เหลี่ยมจัตุรัส (หรือตามสัดส่วนของ pixelCrop)
  const isSquare = Math.abs(pixelCrop.width - pixelCrop.height) < 1;
  const outW = isSquare ? targetSize : Math.max(1, Math.round(pixelCrop.width));
  const outH = isSquare ? targetSize : Math.max(1, Math.round(pixelCrop.height));

  canvas.width = outW;
  canvas.height = outH;

  // 1. เติมพื้นหลังสีขาวล้วนสะอาดตาก่อนเสมอ
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, outW, outH);

  // 2. คำนวณสเกลจากกรอบ Crop เทียบกับขนาดจริงของ Canvas ปลายทาง
  const scaleX = outW / Math.max(1, pixelCrop.width);
  const scaleY = outH / Math.max(1, pixelCrop.height);

  const destX = -pixelCrop.x * scaleX;
  const destY = -pixelCrop.y * scaleY;
  const destW = (image.naturalWidth || image.width) * scaleX;
  const destH = (image.naturalHeight || image.height) * scaleY;

  // 3. วาดภาพลง Canvas ตามสัดส่วนจริง โดยไม่ให้ภาพเพี้ยน
  if (rotation) {
    ctx.save();
    const centerX = destX + destW / 2;
    const centerY = destY + destH / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(getRadianAngle(rotation));
    ctx.drawImage(image, -destW / 2, -destH / 2, destW, destH);
    ctx.restore();
  } else {
    ctx.drawImage(image, destX, destY, destW, destH);
  }

  // คืนค่าเป็น Blob URL เพื่อง่ายต่อการนำไปใช้งานต่อ
  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) {
        resolve(URL.createObjectURL(file));
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/webp', 0.9);
  });
}