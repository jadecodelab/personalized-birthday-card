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
  { maxDimension: 640, quality: 0.78 },
  { maxDimension: 480, quality: 0.68 },
  { maxDimension: 360, quality: 0.55 },
];

// Raised from the original 40KB cap, which forced photos down to 320px/0.6
// and looked visibly blurry once displayed at the card's actual size. Still
// a hard backstop against pathological inputs blowing up the link, just a
// more generous one now that real-world links at this size are confirmed
// fine to share via chat apps and email (the URL lives in the fragment, so
// it never touches the server either way).
const MAX_LINK_PHOTO_LENGTH = 140_000;

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
