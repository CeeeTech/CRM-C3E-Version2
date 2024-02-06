const express = require('express')
const sourceController = require('../controllers/sourceController')

const router = express.Router()

router.get('/source', sourceController.getAllSource)

module.exports = router