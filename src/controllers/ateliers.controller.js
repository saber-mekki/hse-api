const prisma = require('../lib/prisma');

async function listerAteliers(req, res) {
  try {
    const ateliers = await prisma.atelier.findMany({ orderBy: { nom: 'asc' } });
    return res.json(ateliers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function creerAtelier(req, res) {
  try {
    const { nom } = req.body;
    if (!nom) return res.status(400).json({ error: 'Nom requis' });
    const atelier = await prisma.atelier.create({
      data: { nom, qrCode: `ATL-${Date.now()}` },
    });
    return res.status(201).json(atelier);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Résolution d'un atelier via son QR code (scan mobile)
async function obtenirParQrCode(req, res) {
  try {
    const atelier = await prisma.atelier.findUnique({ where: { qrCode: req.params.qrCode } });
    if (!atelier) return res.status(404).json({ error: 'QR code inconnu' });
    return res.json(atelier);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { listerAteliers, creerAtelier, obtenirParQrCode };
