// Rutas para subir imágenes
const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const { verificarToken } = require('../middlewares/auth');

// POST /api/upload/imagen - Subir imagen a Cloudinary
router.post('/imagen', verificarToken, async (req, res) => {
  try {
    const { imagen, carpeta } = req.body;

    if (!imagen) {
      return res.status(400).json({ error: 'No se proporcionó imagen' });
    }

    // Subir a Cloudinary
    const resultado = await cloudinary.uploader.upload(imagen, {
      folder: carpeta || 'prestamos/clientes',
      resource_type: 'image',
    });

    res.json({
      url: resultado.secure_url,
      public_id: resultado.public_id,
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir imagen' });
  }
});

module.exports = router;
