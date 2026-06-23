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
