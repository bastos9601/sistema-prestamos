// Configuración de Cloudinary
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dp1dzunfp',
  api_key: process.env.CLOUDINARY_API_KEY || '258478459326466',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'lnHcXW--2xkJDd27CsYpXxlxaDk',
});

module.exports = cloudinary;
