const prisma = require('../lib/prisma');

async function notifierRole(role, message) {
  const users = await prisma.user.findMany({ where: { role, actif: true } });
  if (users.length === 0) return;

  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, message })),
  });

  // TODO: brancher ici l'envoi push réel (expo-server-sdk) une fois
  // les tokens push des devices stockés sur User.
}

async function notifierUser(userId, message) {
  await prisma.notification.create({ data: { userId, message } });
}

module.exports = { notifierRole, notifierUser };
