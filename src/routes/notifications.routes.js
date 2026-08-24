const express = require('express');
const router = express.Router();
const authRequired = require('../middleware/auth.middleware');
const prisma = require('../lib/prisma');

router.use(authRequired);

router.get('/', async (req, res) => {
  const notifs = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(notifs);
});

router.patch('/:id/lu', async (req, res) => {
  const notif = await prisma.notification.update({
    where: { id: req.params.id },
    data: { lu: true },
  });
  res.json(notif);
});

module.exports = router;
