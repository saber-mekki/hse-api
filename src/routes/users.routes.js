const express = require('express');
const router = express.Router();
const authRequired = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');
const {
  listerUtilisateurs,
  creerUtilisateur,
  desactiverUtilisateur,
} = require('../controllers/users.controller');

router.use(authRequired);

router.get('/', allowRoles('ADMIN', 'HSE'), listerUtilisateurs);
router.post('/', allowRoles('ADMIN'), creerUtilisateur);
router.patch('/:id/desactiver', allowRoles('ADMIN'), desactiverUtilisateur);

module.exports = router;
