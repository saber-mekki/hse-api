const express = require('express');
const router = express.Router();
const multer = require('multer');
const authRequired = require('../middleware/auth.middleware');
const cloudinary = require('../lib/cloudinary');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.post('/', authRequired, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

  try {
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64, { folder: 'hse-declarations' });
    return res.json({ url: result.secure_url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Échec de l'upload" });
  }
});

module.exports = router;
