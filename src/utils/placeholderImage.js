/**
 * Generates a data URI placeholder image
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Text to display on placeholder
 * @param {string} bgColor - Background color (hex without #)
 * @param {string} textColor - Text color (hex without #)
 * @returns {string} Data URI string
 */
export const generatePlaceholderImage = (width = 800, height = 400, text = "Image", bgColor = "24B295", textColor = "ffffff") => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#${bgColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#${textColor}" font-size="24" font-family="Arial, sans-serif">${text}</text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

