const express = require('express')
const statusController = require('../controllers/statusController')

const router = express.Router()

router.get('/status', statusController.getAllStatus)
router.get('/status/:id', statusController.getStatus)
router.get('/status-count', statusController.getAllStatusCount)

module.exports = router