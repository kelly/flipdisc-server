function dither(imageData, imageWidth) {
  const r = Array.from({ length: 256 }, (_, i) => i * 0.299);
  const g = Array.from({ length: 256 }, (_, i) => i * 0.587);
  const b = Array.from({ length: 256 }, (_, i) => i * 0.110);

  const width = imageWidth;
  const length = imageData.length;

  for (let i = 0; i < length; i += 4) {
    const luminance = Math.floor(r[imageData[i]] + g[imageData[i + 1]] + b[imageData[i + 2]]);
    imageData[i] = luminance;
    imageData[i + 1] = luminance;
    imageData[i + 2] = luminance;
  }

  for (let index = 0; index < length; index += 4) {
    const newPixel = imageData[index] < 150 ? 0 : 255;
    imageData[index] = newPixel;

    const error = Math.floor((imageData[index] - newPixel) / 16);
    imageData[index + 4] += error * 7;
    imageData[index + 4 * width - 4] += error * 3;
    imageData[index + 4 * width] += error * 5;
    imageData[index + 4 * width + 4] += error;
  }

  return imageData;
}

function getLuminanceRGB(r, g, b) {
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.5 ? 0 : 1;
}

function isImageData(data) {
  if (!data) return false;
  return !Array.isArray(data[0])
}

function formatRGBAPixels(imageData, width, height) {
  const pixelArray = new Array(height);

  for (let y = 0; y < height; y++) {
    const row = new Array(width);
    const yWidth = y * width * 4;

    for (let x = 0; x < width; x++) {
      const i = yWidth + x * 4;
      row[x] = getLuminanceRGB(imageData[i], imageData[i + 1], imageData[i + 2]);
    }

    pixelArray[y] = row;
  }

  return pixelArray;
}

function createEmptyImageData(width, height) {
  let imageData = new Array(height);
  for (let i = 0; i < height;  i++) {
    imageData[i] = new Array(width).fill(0); // Each column gets its own array of rows
  }
  return imageData;
}

export { dither, isImageData, formatRGBAPixels, createEmptyImageData }