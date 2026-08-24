const express = require('express');
const router = express.Router();
const authRequired = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');
const { creerAction, listerActions, cloturerAction } = require('../controllers/actions.controller');

router.use(authRequired);

router.post('/', allowRoles('HSE', 'ADMIN'), creerAction);
router.get('/', listerActions);
router.patch('/:id/cloturer', allowRoles('HSE', 'ADMIN'), cloturerAction);

module.exports = router;
