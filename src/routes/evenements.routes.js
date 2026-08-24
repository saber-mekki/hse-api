const express = require('express');
const router = express.Router();
const authRequired = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');
const {
  creerEvenement,
  listerEvenements,
  obtenirEvenement,
  changerStatut,
} = require('../controllers/evenements.controller');

router.use(authRequired); // toutes les routes ci-dessous nécessitent un token valide

router.post('/', creerEvenement); // tout utilisateur connecté peut déclarer
router.get('/', listerEvenements);
router.get('/:id', obtenirEvenement);
router.patch('/:id/statut', allowRoles('CHEF_EQUIPE', 'HSE', 'ADMIN'), changerStatut);

module.exports = router;
