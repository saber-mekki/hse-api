const express = require('express');
const router = express.Router();
const authRequired = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');
const { obtenirKPIMensuel } = require('../controllers/kpi.controller');

router.get('/mensuel', authRequired, allowRoles('DIRECTION', 'HSE', 'ADMIN'), obtenirKPIMensuel);

module.exports = router;
