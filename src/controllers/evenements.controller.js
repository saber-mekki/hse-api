const prisma = require('../lib/prisma');
const { notifierRole } = require('../services/notifications.service');

// Transitions de workflow autorisées
const TRANSITIONS = {
  DECLARE: ['ANALYSE'],
  ANALYSE: ['ACTION_EN_COURS', 'CLOTURE'],
  ACTION_EN_COURS: ['CLOTURE'],
  CLOTURE: [],
};

async function creerEvenement(req, res) {
  try {
    const { dateHeure, atelierId, type, description, risquePotentiel, photoUrl, anonyme } = req.body;
    if (!dateHeure || !atelierId || !type || !description || !risquePotentiel) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const evenement = await prisma.evenement.create({
      data: {
        dateHeure: new Date(dateHeure),
        atelierId,
        type,
        description,
        risquePotentiel,
        photoUrl: photoUrl || null,
        anonyme: !!anonyme,
        declarantId: anonyme ? null : req.user.id,
        statut: 'DECLARE',
      },
    });

    await notifierRole('HSE', `Nouvelle déclaration : ${type} — atelier ${atelierId}`);

    return res.status(201).json(evenement);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function listerEvenements(req, res) {
  try {
    const { statut, type, atelierId } = req.query;
    const filtres = {};
    if (statut) filtres.statut = statut;
    if (type) filtres.type = type;
    if (atelierId) filtres.atelierId = atelierId;

    // Un opérateur ne voit que ses propres déclarations
    if (req.user.role === 'OPERATEUR') {
      filtres.declarantId = req.user.id;
    }

    const evenements = await prisma.evenement.findMany({
      where: filtres,
      orderBy: { createdAt: 'desc' },
      include: { atelier: true, actions: true },
    });

    return res.json(evenements);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function obtenirEvenement(req, res) {
  try {
    const evenement = await prisma.evenement.findUnique({
      where: { id: req.params.id },
      include: { atelier: true, actions: true, historique: true, declarant: true },
    });
    if (!evenement) return res.status(404).json({ error: 'Événement introuvable' });
    return res.json(evenement);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function changerStatut(req, res) {
  try {
    const { nouveauStatut } = req.body;
    const evenement = await prisma.evenement.findUnique({ where: { id: req.params.id } });
    if (!evenement) return res.status(404).json({ error: 'Événement introuvable' });

    const autorises = TRANSITIONS[evenement.statut] || [];
    if (!autorises.includes(nouveauStatut)) {
      return res.status(400).json({
        error: `Transition ${evenement.statut} → ${nouveauStatut} non autorisée`,
      });
    }

    const [maj] = await prisma.$transaction([
      prisma.evenement.update({
        where: { id: req.params.id },
        data: { statut: nouveauStatut },
      }),
      prisma.historiqueStatut.create({
        data: {
          evenementId: req.params.id,
          ancienStatut: evenement.statut,
          nouveauStatut,
          parUserId: req.user.id,
        },
      }),
    ]);

    return res.json(maj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { creerEvenement, listerEvenements, obtenirEvenement, changerStatut };
