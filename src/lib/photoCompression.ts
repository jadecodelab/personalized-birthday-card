export function compressImageToDataUrl(
  source: string,
  maxDimension = 320,
  quality = 0.6,
) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(
        1,
        maxDimension / Math.max(image.width, image.height),
      );
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Could not compress the photo."));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () =>
      reject(new Error("Could not load the photo for compression."));
    image.src = source;
  });
}

const LINK_PHOTO_COMPRESSION_STEPS = [
  { maxDimension: 320, quality: 0.6 },
  { maxDimension: 240, quality: 0.5 },
  { maxDimension: 180, quality: 0.4 },
];

// Comfortably above the ~15KB worst case seen from busy real-world photos,
// but still a hard backstop against pathological inputs blowing up the link.
const MAX_LINK_PHOTO_LENGTH = 40_000;

// Tries progressively smaller/lower-quality compression until the result
// fits in a shareable link. Returns null if even the smallest attempt is
// still too large, so the caller can drop the photo rather than produce an
// unshareable link.
export async function compressPhotoForLink(source: string) {
  for (const step of LINK_PHOTO_COMPRESSION_STEPS) {
    const result = await compressImageToDataUrl(
      source,
      step.maxDimension,
      step.quality,
    );

    if (result.length <= MAX_LINK_PHOTO_LENGTH) {
      return result;
    }
  }

  return null;
}
