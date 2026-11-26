const express = require('express');
const router = express.Router();
const tiketController = require('../controllers/tiketController');

router.post('/', tiketController.createTiket);
router.get('/', tiketController.getAllTiket);
router.get('/track/:number', tiketController.trackTiket); // sebelum '/:id'
router.get('/:id', tiketController.getTiketById);
router.put('/:id/status', tiketController.updateStatusTiket);
router.delete('/:id', tiketController.deleteTiket);
router.get('/:id/replies', tiketController.getReplies);
router.post('/:id/replies', tiketController.createReply);

module.exports = router;
