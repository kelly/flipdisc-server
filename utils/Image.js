function dither(buffer, imageWidth) {
  const r = Array.from({ length: 256 }, (_, i) => i * 0.299);
  const g = Array.from({ length: 256 }, (_, i) => i * 0.587);
  const b = Array.from({ length: 256 }, (_, i) => i * 0.114);

  const width = imageWidth;
  const length = buffer.length;

  // Convert to grayscale
  for (let i = 0; i < length; i += 4) {
    const luminance = Math.floor(r[buffer[i]] + g[buffer[i + 1]] + b[buffer[i + 2]]);
    buffer[i] = luminance;
    buffer[i + 1] = luminance;
    buffer[i + 2] = luminance;
  }

  // Apply Floyd-Steinberg dithering
  for (let i = 0; i < length; i += 4) {
    const oldPixel = buffer[i];
    const newPixel = oldPixel < 128 ? 0 : 255;
    buffer[i] = newPixel;
    buffer[i + 1] = newPixel;
    buffer[i + 2] = newPixel;

    const error = oldPixel - newPixel;

    if (i + 4 < length) {
      buffer[i + 4] += error * 7 / 16;
      buffer[i + 4 + 1] += error * 7 / 16;
      buffer[i + 4 + 2] += error * 7 / 16;
    }

    if (i + 4 * (width - 1) - 4 < length && i + 4 * (width - 1) - 4 >= 0) {
      buffer[i + 4 * (width - 1) - 4] += error * 3 / 16;
      buffer[i + 4 * (width - 1) - 4 + 1] += error * 3 / 16;
      buffer[i + 4 * (width - 1) - 4 + 2] += error * 3 / 16;
    }

    if (i + 4 * width < length) {
      buffer[i + 4 * width] += error * 5 / 16;
      buffer[i + 4 * width + 1] += error * 5 / 16;
      buffer[i + 4 * width + 2] += error * 5 / 16;
    }

    if (i + 4 * (width + 1) < length) {
      buffer[i + 4 * (width + 1)] += error * 1 / 16;
      buffer[i + 4 * (width + 1) + 1] += error * 1 / 16;
      buffer[i + 4 * (width + 1) + 2] += error * 1 / 16;
    }
  }

  return buffer;
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