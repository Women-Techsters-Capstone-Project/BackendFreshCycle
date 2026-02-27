const express = require('express');
const router = express.Router();
const WebhookCtrl = require('../controllers/webhookController');

router.post('/api/payment/webhook', express.json(), WebhookCtrl.handleMomoWebhook);

module.exports = router;

