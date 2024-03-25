const express = require('express')
const reportController = require('../controllers/reportController')

const router = express.Router()

router.get('/reports', reportController.getAllReports)

module.exports = router