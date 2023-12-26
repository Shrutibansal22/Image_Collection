const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const filterSelect = document.getElementById('filterSelect');
let originalImageData;

fileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const img = new Image();

    img.onload = function() {
      const aspectRatio = img.width / img.height;
      const canvasWidth = 400;
      const canvasHeight = 300;

      let newWidth = canvasWidth;
      let newHeight = canvasHeight;

      if (aspectRatio > 1) {
        newHeight = canvasWidth / aspectRatio;
      } else {
        newWidth = canvasHeight * aspectRatio;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

filterSelect.addEventListener('change', function() {
  applyFilter(filterSelect.value);
});

function applyFilter(filterType) {
  if (originalImageData) {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < originalImageData.data.length; i += 4) {
      let r = originalImageData.data[i];
      let g = originalImageData.data[i + 1];
      let b = originalImageData.data[i + 2];
      let a = originalImageData.data[i + 3];

      switch (filterType) {
        case 'blur':
          let pixel = i / 4;
          let x = pixel % canvas.width;
          let y = Math.floor(pixel / canvas.width);
          let sumR = 0;
          let sumG = 0;
          let sumB = 0;
          let count = 0;

          for (let offsetX = -2; offsetX <= 2; offsetX++) {
            for (let offsetY = -2; offsetY <= 2; offsetY++) {
              let pixelX = x + offsetX;
              let pixelY = y + offsetY;

              if (pixelX >= 0 && pixelX < canvas.width && pixelY >= 0 && pixelY < canvas.height) {
                let index = (pixelY * canvas.width + pixelX) * 4;
                sumR += originalImageData.data[index];
                sumG += originalImageData.data[index + 1];
                sumB += originalImageData.data[index + 2];
                count++;
              }
            }
          }

          r = sumR / count;
          g = sumG / count;
          b = sumB / count;
          break;

        case 'invert':
          r = 255 - r;
          g = 255 - g;
          b = 255 - b;
          break;

        case 'grayscale':
          const brightness = 0.3 * r + 0.59 * g + 0.11 * b;
          r = brightness;
          g = brightness;
          b = brightness;
          break;

        case 'brightness':
          const brightnessValue = 50;
          r += brightnessValue;
          g += brightnessValue;
          b += brightnessValue;
          break;

        case 'sepia':
          const sepiaR = 0.393 * r + 0.769 * g + 0.189 * b;
          const sepiaG = 0.349 * r + 0.686 * g + 0.168 * b;
          const sepiaB = 0.272 * r + 0.534 * g + 0.131 * b;
          r = Math.min(sepiaR, 255);
          g = Math.min(sepiaG, 255);
          b = Math.min(sepiaB, 255);
          break;

        default:
          break;
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
