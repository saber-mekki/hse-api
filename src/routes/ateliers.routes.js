const express = require('express');
const router = express.Router();
const authRequired = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');
const { listerAteliers, creerAtelier, obtenirParQrCode } = require('../controllers/ateliers.controller');

router.use(authRequired);

router.get('/', listerAteliers);
router.post('/', allowRoles('ADMIN'), creerAtelier);
router.get('/qr/:qrCode', obtenirParQrCode);

module.exports = router;
