const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

async function register(req, res) {
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

async function login(req, res) {
  try {
    const { email, motDePasse } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.actif) return res.status(401).json({ error: 'Identifiants invalides' });

    const valide = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!valide) return res.status(401).json({ error: 'Identifiants invalides' });

    const token = jwt.sign(
      { id: user.id, role: user.role, atelierId: user.atelierId },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({
      token,
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { register, login };
