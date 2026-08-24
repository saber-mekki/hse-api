const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

async function listerUtilisateurs(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, nom: true, email: true, role: true, actif: true, atelierId: true },
      orderBy: { nom: 'asc' },
    });
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function creerUtilisateur(req, res) {
  try {
    const { nom, email, motDePasse, role, atelierId } = req.body;
    if (!nom || !email || !motDePasse || !role) {
      return res.status(400).json({ error: 'Champs manquants' });
    }
    const existant = await prisma.user.findUnique({ where: { email } });
    if (existant) return res.status(409).json({ error: 'Email déjà utilisé' });

    const hash = await bcrypt.hash(motDePasse, 10);
    const user = await prisma.user.create({
      data: { nom, email, motDePasse: hash, role, atelierId: atelierId || null },
    });

    return res.status(201).json({ id: user.id, nom: user.nom, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function desactiverUtilisateur(req, res) {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { actif: false },
    });
    return res.json({ id: user.id, actif: user.actif });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { listerUtilisateurs, creerUtilisateur, desactiverUtilisateur };
