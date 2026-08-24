const prisma = require('../lib/prisma');

async function obtenirKPIMensuel(req, res) {
  try {
    const maintenant = new Date();
    const debut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    const fin = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 1);

    const evenements = await prisma.evenement.findMany({
      where: { dateHeure: { gte: debut, lt: fin } },
      select: { type: true },
    });

    const compte = (type) => evenements.filter((e) => e.type === type).length;

    const situationsDangereuses = compte('SITUATION_DANGEREUSE');
    const presqueAccidents = compte('PRESQUE_ACCIDENT');
    const accidentsAvecArret = compte('ACCIDENT_AVEC_ARRET');
    const accidentsSansArret = compte('ACCIDENT_SANS_ARRET');
    const totalIncidents = presqueAccidents + accidentsAvecArret + accidentsSansArret;
    const indiceProactivite =
      totalIncidents > 0 ? Math.round((presqueAccidents / totalIncidents) * 1000) / 10 : null;

    const actionsOuvertes = await prisma.actionCorrective.count({
      where: { statut: { in: ['OUVERTE', 'EN_RETARD'] } },
    });
    const actionsClotureesLeMois = await prisma.actionCorrective.count({
      where: { statut: 'CLOTUREE', clotureLe: { gte: debut, lt: fin } },
    });

    const actionsClotureesAvecDates = await prisma.actionCorrective.findMany({
      where: { statut: 'CLOTUREE', clotureLe: { gte: debut, lt: fin } },
      select: { createdAt: true, clotureLe: true },
    });
    let delaiMoyenJours = null;
    if (actionsClotureesAvecDates.length > 0) {
      const totalJours = actionsClotureesAvecDates.reduce((somme, a) => {
        const jours = (new Date(a.clotureLe) - new Date(a.createdAt)) / (1000 * 60 * 60 * 24);
        return somme + jours;
      }, 0);
      delaiMoyenJours = Math.round((totalJours / actionsClotureesAvecDates.length) * 10) / 10;
    }

    return res.json({
      mois: debut.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      situationsDangereuses,
      presqueAccidents,
      accidentsAvecArret,
      accidentsSansArret,
      indiceProactivite,
      actionsOuvertes,
      actionsClotureesLeMois,
      delaiMoyenJours,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = { obtenirKPIMensuel };
