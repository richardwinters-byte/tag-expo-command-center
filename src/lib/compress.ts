/**
 * Client-side image compression for expo uploads.
 * iPhone photos run 4-8 MB straight from the camera. We resize to max 1600px on
 * the long edge and re-encode as JPEG at quality 0.82 before upload. Typical
 * result: 200-500 KB per business card photo.
 *
 * Uses a <canvas> + HTMLImageElement pipeline — no dependencies.
 * HEIC/HEIF images from iPhones are decoded automatically by Safari via <img>,
 * and re-emitted as JPEG.
 */

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export type CompressedImage = {
  blob: Blob;
  mime_type: string;
  width: number;
  height: number;
  byte_size: number;
};

export async function compressImage(file: File): Promise<CompressedImage> {
  // Load the file into an <img> element so the browser can decode HEIC/etc.
  const imgUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(imgUrl);
    const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, MAX_DIMENSION);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY);
    return {
      blob,
      mime_type: 'image/jpeg',
      width,
      height,
      byte_size: blob.size,
    };
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to decode image'));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas encode failed'))),
      mime,
      quality,
    );
  });
}

function fitWithin(w: number, h: number, max: number): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w > h ? max / w : max / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}
