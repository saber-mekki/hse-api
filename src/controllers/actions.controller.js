const prisma = require('../lib/prisma');

async function creerAction(req, res) {
  try {
    const { evenementId, description, responsableId, echeance } = req.body;
    if (!evenementId || !description || !responsableId || !echeance) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const evenement = await prisma.evenement.findUnique({ where: { id: evenementId } });
    if (!evenement) return res.status(404).json({ error: 'Événement introuvable' });

    const action = await prisma.actionCorrective.create({
      data: {
        evenementId,
        description,
        responsableId,
        echeance: new Date(echeance),
        statut: 'OUVERTE',
      },
    });

    // Passe l'événement en ACTION_EN_COURS si besoin
    if (evenement.statut === 'ANALYSE') {
      await prisma.$transaction([
        prisma.evenement.update({ where: { id: evenementId }, data: { statut: 'ACTION_EN_COURS' } }),
        prisma.historiqueStatut.create({
          data: {
            evenementId,
            ancienStatut: 'ANALYSE',
            nouveauStatut: 'ACTION_EN_COURS',
            parUserId: req.user.id,
          },
        }),
      ]);
    }

    return res.status(201).json(action);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function listerActions(req, res) {
  try {
    const { statut, responsableId } = req.query;
    const filtres = {};
    if (statut) filtres.statut = statut;
    if (responsableId) filtres.responsableId = responsableId;

    const actions = await prisma.actionCorrective.findMany({
      where: filtres,
      orderBy: { echeance: 'asc' },
      include: { evenement: true },
    });

    return res.json(actions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function cloturerAction(req, res) {
  try {
    const action = await prisma.actionCorrective.findUnique({ where: { id: req.params.id } });
    if (!action) return res.status(404).json({ error: 'Action introuvable' });

    const maj = await prisma.actionCorrective.update({
      where: { id: req.params.id },
      data: { statut: 'CLOTUREE', clotureLe: new Date() },
    });

    // Si toutes les actions de l'événement sont clôturées → clôturer l'événement
    const actionsRestantes = await prisma.actionCorrective.count({
      where: { evenementId: action.evenementId, statut: { not: 'CLOTUREE' } },
    });

    if (actionsRestantes === 0) {
      const evenement = await prisma.evenement.findUnique({ where: { id: action.evenementId } });
      if (evenement && evenement.statut !== 'CLOTURE') {
        await prisma.$transaction([
          prisma.evenement.update({ where: { id: action.evenementId }, data: { statut: 'CLOTURE' } }),
          prisma.historiqueStatut.create({
            data: {
              evenementId: action.evenementId,
              ancienStatut: evenement.statut,
              nouveauStatut: 'CLOTURE',
              parUserId: req.user.id,
            },
          }),
        ]);
      }
    }

    return res.json(maj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Utilisé par le job planifié (étape 6) pour marquer les actions en retard
async function marquerActionsEnRetard() {
  const maintenant = new Date();
  const result = await prisma.actionCorrective.updateMany({
    where: { statut: 'OUVERTE', echeance: { lt: maintenant } },
    data: { statut: 'EN_RETARD' },
  });
  return result.count;
}

module.exports = { creerAction, listerActions, cloturerAction, marquerActionsEnRetard };
