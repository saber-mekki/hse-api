const cron = require('node-cron');
const prisma = require('../lib/prisma');
const { marquerActionsEnRetard } = require('../controllers/actions.controller');
const { notifierRole } = require('./notifications.service');

// Tous les jours à 7h : détecte les actions en retard et notifie les responsables
function demarrerRelanceQuotidienne() {
  cron.schedule('0 7 * * *', async () => {
    const nb = await marquerActionsEnRetard();
    if (nb > 0) {
      await notifierRole('HSE', `${nb} action(s) corrective(s) en retard sur échéance.`);
    }
    console.log(`[cron] Relance quotidienne : ${nb} action(s) passée(s) en retard`);
  });
}

// Le 1er de chaque mois à 8h : calcule et notifie l'Indice de Proactivité HSE à la Direction
function demarrerRapportMensuel() {
  cron.schedule('0 8 1 * *', async () => {
    const debut = new Date();
    debut.setMonth(debut.getMonth() - 1, 1);
    debut.setHours(0, 0, 0, 0);
    const fin = new Date();
    fin.setDate(1);
    fin.setHours(0, 0, 0, 0);

    const evenements = await prisma.evenement.findMany({
      where: { dateHeure: { gte: debut, lt: fin } },
      select: { type: true },
    });

    const presqueAccidents = evenements.filter((e) => e.type === 'PRESQUE_ACCIDENT').length;
    const accidents = evenements.filter((e) =>
      ['ACCIDENT_AVEC_ARRET', 'ACCIDENT_SANS_ARRET'].includes(e.type)
    ).length;
    const total = presqueAccidents + accidents;
    const indice = total > 0 ? Math.round((presqueAccidents / total) * 1000) / 10 : null;

    await notifierRole(
      'DIRECTION',
      `Rapport mensuel HSE : Indice de Proactivité = ${indice ?? 'N/A'}% (${presqueAccidents} presque-accidents, ${accidents} accidents)`
    );

    // TODO: générer aussi le PDF/Excel et l'envoyer par email (étape export)
    console.log(`[cron] Rapport mensuel envoyé — Indice = ${indice}%`);
  });
}

function demarrerJobs() {
  demarrerRelanceQuotidienne();
  demarrerRapportMensuel();
}

module.exports = { demarrerJobs };
